// backend/services/mentionMonitoringService.js

const axios = require("axios");
const { createClient } = require("@supabase/supabase-js");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");

dotenv.config();

// --- Initialization ---
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const X_ACCOUNT_USERNAME = process.env.X_ACCOUNT_USERNAME; // e.g., "@CityOfX"
const X_BEARER_TOKEN = process.env.X_BEARER_TOKEN;

// Ensure username is cleaned for use in query and URL
const CLEAN_USERNAME = X_ACCOUNT_USERNAME
  ? X_ACCOUNT_USERNAME.replace("@", "")
  : "YOUR_USERNAME";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// --- API Helper Function (REPLACING twitterClient.v2.search) ---
const callTwitterSearchAPI = async (query, params = {}) => {
  const url = `https://api.x.com/2/tweets/search/recent`;

  // Construct all query parameters
  const searchParams = {
    query: query,
    max_results: 10, // Default max_results
    sort_order: "recency",
    ...params,
  };

  try {
    const response = await axios.get(url, {
      params: searchParams,
      headers: {
        Authorization: `Bearer ${X_BEARER_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    // Enhance error logging for rate limit or auth issues
    const status = error.response?.status;
    if (status === 429) {
      // Throw a custom error that includes the 429 code for handling in the job function
      const rateLimitError = new Error(
        `Rate limit hit (429). Reset: ${error.response.headers["x-rate-limit-reset"]}`
      );
      rateLimitError.code = 429;
      throw rateLimitError;
    }
    if (status === 401) {
      throw new Error("Authentication failed (401). Check BEARER_TOKEN.");
    }
    throw new Error(`Twitter API error (${status}): ${error.message}`);
  }
};

/**
 * Extracts issue information from a tweet using Gemini AI
 * @param {string} tweetText The text content of the tweet
 * @param {object} userInfo Information about the user who posted
 * @returns {Promise<object|null>} Extracted issue information
 */
const extractIssueInfo = async (tweetText, userInfo) => {
  const prompt = `Analyze this tweet that mentions a city/municipal account and extract issue information.

Tweet: "${tweetText}"
User: @${userInfo.username} (${userInfo.name})

Extract the following information and return ONLY a valid JSON object:
{
  "is_valid_issue": boolean (true if this appears to be reporting a genuine civic issue like potholes, streetlight problems, garbage, water issues, etc.),
  "issue_title": "Brief descriptive title (max 100 chars)" or null,
  "issue_description": "Detailed description of the problem" or null,
  "location": "Any location mentioned (street, area, landmark)" or null,
  "urgency": "Low", "Medium", or "High" based on severity,
  "category": "Roads", "Water", "Electricity", "Garbage", "Public Safety", "Parks", "Other", or null,
  "contact_info": "Any phone/email mentioned" or null,
  "complaint_type": "Request", "Complaint", "Emergency", "Inquiry", or "Other"
}

Only return JSON. If this is not a civic issue (like general complaints, political posts, spam), set is_valid_issue to false.`;

  try {
    const model = geminiClient.getGenerativeModel({
      model: "gemini-2.0-flash-exp", // Updated to a more stable model
    });

    const result = await model.generateContent(prompt);

    // 🛠️ FIX: Updated to handle the new response structure
    let responseText = "";

    if (result && result.response) {
      // Try to get text from the response object
      if (typeof result.response.text === "function") {
        responseText = result.response.text();
      } else if (result.response.text) {
        responseText = result.response.text;
      } else if (result.response.candidates && result.response.candidates[0]) {
        // Handle candidates structure
        const candidate = result.response.candidates[0];
        if (candidate.content && candidate.content.parts) {
          responseText = candidate.content.parts
            .map((part) => part.text)
            .join("");
        }
      }
    }

    // If still no text, log the full response structure for debugging
    if (!responseText) {
      console.error(
        "⚠️ Gemini API returned no text. Full response structure:",
        JSON.stringify(result, null, 2)
      );
      return null;
    }

    // Clean up the response text
    const cleanedText = responseText.trim().replace(/```json\n?|```/g, "");

    console.log(
      "🤖 Gemini response text:",
      cleanedText.substring(0, 200) + "..."
    );

    try {
      const parsedResult = JSON.parse(cleanedText);
      console.log("✅ Successfully parsed Gemini response");
      return parsedResult;
    } catch (jsonError) {
      console.error("❌ Failed to parse JSON from Gemini response:", {
        error: jsonError.message,
        responseText: cleanedText.substring(0, 300),
      });

      // Try to extract JSON from the response if it's wrapped in other text
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const extractedJson = JSON.parse(jsonMatch[0]);
          console.log(
            "✅ Successfully extracted and parsed JSON from response"
          );
          return extractedJson;
        } catch (extractError) {
          console.error(
            "❌ Failed to parse extracted JSON:",
            extractError.message
          );
        }
      }

      return null;
    }
  } catch (error) {
    console.error("❌ Failed to extract issue info (API/Network Error):", {
      message: error.message,
      status: error.status,
      statusText: error.statusText,
      details: error.details || "No additional details",
    });

    // Add specific handling for different error types
    if (error.message.includes("API key")) {
      console.error("🔑 Check your GEMINI_API_KEY environment variable");
    } else if (error.message.includes("quota")) {
      console.error("💰 Gemini API quota exceeded");
    }

    return null;
  }
};

/**
 * Gets user information for a tweet (simplified since we might not have expansions)
 * @param {object} tweet Tweet object from Twitter API
 * @param {object} includes Includes object with user data
 * @returns {object} User information
 */
const getUserInfo = (tweet, includes) => {
  if (includes?.users) {
    const user = includes.users.find((u) => u.id === tweet.author_id);
    if (user) {
      return {
        id: user.id,
        username: user.username,
        name: user.name,
        verified: user.verified || false,
        followers_count: user.public_metrics?.followers_count || 0,
      };
    }
  }

  // Fallback when we don't have user expansion data
  return {
    id: tweet.author_id,
    username: "unknown",
    name: "Unknown User",
    verified: false,
    followers_count: 0,
  };
};

/**
 * Saves issue to database
 * @param {object} issueData Extracted issue information
 * @param {object} tweetData Original tweet data
 * @param {object} userInfo User information
 * @returns {Promise<string|null>} Issue ID if successful
 */
const saveIssueToDatabase = async (issueData, tweetData, userInfo) => {
  try {
    // NOTE: Assuming you add SERVICE_USER_ID to your environment
    const SERVICE_USER_ID = process.env.SERVICE_USER_ID;

    const { data, error } = await supabase
      .from("issues")
      .insert({
        issue_title: issueData.issue_title,
        issue_description: issueData.issue_description,
        address_component: issueData.location,
        status: "pending",
        priority: issueData.urgency,

        // This MUST be added to satisfy the NOT NULL constraint
        created_by: SERVICE_USER_ID,

        // Map issueData.category to the 'department' column if this is the intention
        department: issueData.category,

        complaint_type: issueData.complaint_type,
        reported_by: userInfo.name,
        reporter_username: userInfo.username,
        // Assuming contact_info should go into the reporter_contact field
        reporter_contact: issueData.contact_info,
        source: "Twitter Mention",
        source_url: `https://twitter.com/${userInfo.username}/status/${tweetData.id}`,
        source_data: JSON.stringify({
          tweet_id: tweetData.id,
          tweet_text: tweetData.text,
          user_id: userInfo.id,
          created_at: tweetData.created_at,
          verified_user: userInfo.verified,
          followers_count: userInfo.followers_count,
        }),
        created_at: new Date().toISOString(),
        // Removed: updated_at (Not in schema)
      })
      .select()
      .single();

    if (error) {
      console.error("❌ Database insert error:", error);
      return null;
    }

    console.log(`✅ Issue saved to database with ID: ${data.id}`);
    return data.id;
  } catch (error) {
    console.error("❌ Failed to save issue:", error.message);
    return null;
  }
};

/**
 * Stores processed tweet ID to avoid reprocessing
 * @param {string} tweetId Tweet ID that was processed
 */
const markTweetAsProcessed = async (tweetId) => {
  try {
    await supabase.from("processed_mentions").insert({
      tweet_id: tweetId,
      processed_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Failed to mark tweet as processed:", error.message);
  }
};

/**
 * Checks if a tweet has already been processed
 * @param {string} tweetId Tweet ID to check
 * @returns {Promise<boolean>} True if already processed
 */
const isTweetProcessed = async (tweetId) => {
  try {
    const { data, error } = await supabase
      .from("processed_mentions")
      .select("tweet_id")
      .eq("tweet_id", tweetId)
      .single();

    return !error && data !== null;
  } catch (error) {
    return false;
  }
};

/**
 * Fetches recent mentions of the account using the Twitter Search API.
 * @returns {Promise<{tweets: Array, includes: object|null}>} Array of mention tweets
 */
const fetchRecentMentions = async () => {
  // Correct query: Mentions the account AND is NOT from the account AND is NOT a Retweet
  const query = `@${CLEAN_USERNAME} -from:${CLEAN_USERNAME} -is:retweet`;

  try {
    console.log("🔍 Searching for mentions with query:", query);

    // Call the helper function that uses Axios
    const response = await callTwitterSearchAPI(query, {
      "tweet.fields":
        "text,author_id,created_at,public_metrics,context_annotations",
      expansions: "author_id",
      "user.fields": "name,username,verified,public_metrics",
      max_results: 10,
      sort_order: "recency",
    });

    // Debug the response structure
    console.log(
      "🐛 Response data length:",
      response.data ? response.data.length : 0
    );

    // Check if response has data
    if (
      !response ||
      !response.data ||
      !Array.isArray(response.data) ||
      response.data.length === 0
    ) {
      console.log("ℹ️ No recent mentions found");
      return { tweets: [], includes: response?.includes || null };
    }

    console.log(`✅ Found ${response.data.length} mentions`);
    return {
      tweets: response.data,
      includes: response.includes,
    };
  } catch (error) {
    // Re-throw the error so runMentionMonitoringJob can handle the delay
    if (error.code === 429) {
      throw error;
    }
    console.error("❌ Error fetching mentions:", error.message);
    return { tweets: [], includes: null };
  }
};

/**
 * Processes a single mention tweet
 * @param {object} tweet Tweet data
 * @param {object} includes User data from API response
 */
const processMentionTweet = async (tweet, includes) => {
  try {
    // Check if already processed
    if (await isTweetProcessed(tweet.id)) {
      console.log(`⏭️ Tweet ${tweet.id} already processed, skipping`);
      return;
    }

    console.log(
      `🔄 Processing tweet ${tweet.id}: "${tweet.text.substring(0, 50)}..."`
    );

    const userInfo = getUserInfo(tweet, includes);
    console.log(`👤 From user: @${userInfo.username} (${userInfo.name})`);

    // Extract issue information using AI
    const issueData = await extractIssueInfo(tweet.text, userInfo);

    if (!issueData) {
      console.log(`⚠️ Failed to extract issue data from tweet ${tweet.id}`);
      await markTweetAsProcessed(tweet.id);
      return;
    }

    if (!issueData.is_valid_issue) {
      console.log(`📝 Tweet ${tweet.id} is not a valid civic issue, skipping`);
      await markTweetAsProcessed(tweet.id);
      return;
    }

    console.log(`🎯 Valid issue detected: "${issueData.issue_title}"`);
    console.log(
      `📍 Category: ${issueData.category}, Urgency: ${issueData.urgency}`
    );

    // Save to database
    const issueId = await saveIssueToDatabase(issueData, tweet, userInfo);

    if (issueId) {
      console.log(
        `✅ Successfully processed mention and created issue ${issueId}`
      );

      // Optional: Reply to the user confirming receipt
      // await replyToMention(tweet.id, userInfo.username, issueId);
    }

    // Mark as processed regardless of success to avoid reprocessing
    await markTweetAsProcessed(tweet.id);
  } catch (error) {
    console.error(`❌ Error processing tweet ${tweet.id}:`, error.message);
    await markTweetAsProcessed(tweet.id); // Mark as processed to avoid infinite retries
  }
};

/**
 * Main job to monitor mentions and create issues
 */
const runMentionMonitoringJob = async () => {
  console.log("👁️ Starting Mention Monitoring Job...");

  try {
    const mentionData = await fetchRecentMentions();

    if (
      !mentionData ||
      !mentionData.tweets ||
      mentionData.tweets.length === 0
    ) {
      console.log("✅ No new mentions to process");
      return;
    }

    console.log(`📊 Processing ${mentionData.tweets.length} mentions`);

    // Filter out your own tweets (The query already handles the filtering)
    const filteredTweets = mentionData.tweets;

    console.log(
      `📊 After filtering: ${filteredTweets.length} mentions to process`
    );

    for (let i = 0; i < filteredTweets.length; i++) {
      const tweet = filteredTweets[i];

      // Add delay between processing to avoid overwhelming APIs
      if (i > 0) {
        // Delay between processing individual tweets (e.g., for Gemini calls)
        await delay(2000);
      }

      await processMentionTweet(tweet, mentionData.includes);
    }
  } catch (error) {
    if (error.code === 429) {
      console.error(`⏳ Rate limit hit. Waiting 15 minutes before next run...`);
      await delay(15 * 60 * 1000);
      // Optionally, retry the job here, but usually, a scheduler handles the next run.
    }
    console.error("🔥 Mention Monitoring Job failed:", error.message);
  } finally {
    console.log("👁️ Mention Monitoring Job Complete");
  }
};

/**
 * Test function to verify API connection
 */
const testMentionAPI = async () => {
  console.log("🧪 Testing Mention API...");

  const cleanUsername = X_ACCOUNT_USERNAME.replace("@", "");
  const url = `https://api.x.com/2/tweets/search/recent?query=@${cleanUsername}`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${X_BEARER_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    console.log("✅ API Test Successful!");
    console.log("📊 Response:", {
      status: response.status,
      mentions_found: response.data?.data?.length || 0,
      first_mention:
        response.data?.data?.[0]?.text?.substring(0, 50) + "..." || "None",
    });

    return response.data;
  } catch (error) {
    console.error("❌ API Test Failed:", {
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
    });
    return null;
  }
};

module.exports = {
  runMentionMonitoringJob,
  fetchRecentMentions,
  processMentionTweet,
  testMentionAPI,
};
