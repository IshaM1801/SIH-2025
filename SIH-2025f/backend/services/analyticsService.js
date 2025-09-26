// backend/services/analyticsService.js

const { TwitterApi } = require("twitter-api-v2");
const { createClient } = require("@supabase/supabase-js");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config();

// --- Initialization ---
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const X_ACCOUNT_USERNAME = process.env.X_ACCOUNT_USERNAME;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const twitterClient = new TwitterApi({
  appKey: process.env.X_API_KEY,
  appSecret: process.env.X_API_SECRET,
  accessToken: process.env.X_ACCESS_TOKEN,
  accessSecret: process.env.X_ACCESS_TOKEN_SECRET,
});

// CORRECTED: Use GoogleGenerativeAI instead of GoogleGenAI
const geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Add delay function to handle rate limiting
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetches comments using direct API call with Bearer Token
 * @param {string} tweetId The ID of the tweet to check for replies.
 * @returns {Promise<string[]>} An array of comment texts.
 */
const fetchIssueCommentsDirectAPI = async (tweetId) => {
  const cleanUsername = X_ACCOUNT_USERNAME.replace("@", "");
  const query = `conversation_id:${tweetId} -from:${cleanUsername} -is:retweet`;

  const url = "https://api.twitter.com/2/tweets/search/recent";
  const params = {
    query: query,
    "tweet.fields":
      "text,author_id,created_at,conversation_id,in_reply_to_user_id",
    expansions: "author_id,in_reply_to_user_id",
    max_results: 10,
  };

  try {
    console.log("🔍 Direct API Query sent:", query);
    console.log("🔍 Tweet ID:", tweetId);

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${process.env.X_BEARER_TOKEN}`,
        "Content-Type": "application/json",
      },
      params: params,
    });

    const data = response.data;

    if (!data.data || data.data.length === 0) {
      console.log(`ℹ️ No comments found for tweet ${tweetId}`);
      return [];
    }

    const comments = data.data.map((tweet) => tweet.text);
    console.log(`✅ Found ${comments.length} comments for tweet ${tweetId}`);
    return comments;
  } catch (error) {
    console.error(`❌ Direct API error for tweet ${tweetId}:`, {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });

    if (error.response?.status === 429) {
      console.error(
        `⏳ Rate limit hit for ${tweetId}. Adding 15 minute delay...`
      );
      await delay(15 * 60 * 1000);
      return null;
    }

    if (error.response?.status === 400) {
      console.error(
        `⚠️ Invalid request for tweet ${tweetId}. This might be a deleted tweet or invalid ID.`
      );
      return [];
    }

    console.error(`❌ Error fetching comments for ${tweetId}:`, error.message);
    return null;
  }
};

// Alternative version if you want more detailed comment objects
// const fetchIssueCommentsDirectAPI = async (tweetId) => {
//   const query = `conversation_id:${tweetId} -from:${X_ACCOUNT_USERNAME} -is:retweet`;

//   try {
//     console.log("🔍 Query sent:", query);

//     const response = await twitterClient.v2.search(query, {
//       "tweet.fields":
//         "text,author_id,created_at,conversation_id,in_reply_to_user_id",
//       expansions: "author_id,in_reply_to_user_id",
//       max_results: 50,
//     });

//     if (!response.data || response.data.length === 0) {
//       console.log(`ℹ️ No comments found for tweet ${tweetId}`);
//       return [];
//     }

//     // Create a user lookup map from includes
//     const userMap = {};
//     if (response.includes?.users) {
//       response.includes.users.forEach((user) => {
//         userMap[user.id] = {
//           name: user.name,
//           username: user.username,
//         };
//       });
//     }

//     // Return detailed comment objects with user info
//     const comments = response.data.map((tweet) => ({
//       text: tweet.text,
//       author: userMap[tweet.author_id] || {
//         name: "Unknown",
//         username: "unknown",
//       },
//       created_at: tweet.created_at,
//       id: tweet.id,
//     }));

//     console.log(`✅ Found ${comments.length} comments for tweet ${tweetId}`);
//     return comments;
//   } catch (error) {
//     if (error.code === 429) {
//       console.error(`⏳ Rate limit hit for ${tweetId}. Adding delay...`);
//       await delay(15 * 60 * 1000);
//       return null;
//     }

//     console.error(`❌ Error fetching comments for ${tweetId}:`, error.message);
//     return null;
//   }
// };

/**
 * Sends comments to Gemini for sentiment analysis and summarization.
 * @param {string[]} commentsArray An array of comment texts.
 * @returns {Promise<object | null>} A JSON object with sentiment and summary.
 */
const analyzeSentiment = async (commentsArray) => {
  if (!commentsArray || commentsArray.length === 0) {
    return null;
  }

  const commentString = commentsArray.join("\n---\n");

  const prompt = `Analyze the following public comments regarding a city issue resolution. 
                
                Comments:
                ---
                ${commentString}
                ---

                Return ONLY a valid JSON object with the following keys:
                1. "overall_sentiment": (Must be one word: "Positive", "Neutral", "Negative", or "Mixed")
                2. "summary": (A small, concise, two-sentence summary of the main public views, including any remaining concerns or praises.)`;

  try {
    // CORRECTED: Use the proper Gemini API structure
    const model = geminiClient.getGenerativeModel({
      model: "gemini-1.5-flash",
    });
    const response = await model.generateContent(prompt);
    const responseText = response.response
      .text()
      .trim()
      .replace(/```json\n?|```/g, "");

    return JSON.parse(responseText);
  } catch (error) {
    console.error("❌ Gemini analysis failed:", error.message);
    return null;
  }
};

/**
 * Main job to find unanalyzed posts and run the analysis with better error handling.
 */
const runPostAnalyticsJob = async () => {
  console.log("📊 Starting X Post Analytics Job...");
  try {
    const { data: postsToAnalyze, error: fetchError } = await supabase
      .from("issue_posts")
      .select("post_id, x_post_url")
      .eq("posted_to_x", true)
      .limit(5); // Reduced limit to handle rate limiting better

    if (fetchError) {
      console.error("❌ Failed to fetch posts from database:", fetchError);
      return;
    }

    if (!postsToAnalyze || postsToAnalyze.length === 0) {
      console.log("✅ No posts to analyze.");
      return;
    }

    console.log(`📊 Found ${postsToAnalyze.length} posts to analyze`);

    for (let i = 0; i < postsToAnalyze.length; i++) {
      const post = postsToAnalyze[i];

      // Add delay between requests to avoid rate limiting
      if (i > 0) {
        await delay(2000); // 2 second delay between requests
      }

      const tweetIdMatch = post.x_post_url.match(/status\/(\d+)/);
      if (!tweetIdMatch) {
        console.log(`⚠️ Invalid tweet URL format for post ${post.post_id}`);
        continue;
      }

      const tweetId = tweetIdMatch[1];
      console.log(`🔍 Analyzing tweet ${tweetId} for post ${post.post_id}`);

      const comments = await fetchIssueCommentsDirectAPI(tweetId);

      if (comments === null) {
        // Rate limit hit or error occurred, skip this iteration
        console.log(`⏸️ Skipping post ${post.post_id} due to API error`);
        break; // Stop processing to avoid further rate limit issues
      }

      if (comments && comments.length > 0) {
        console.log(
          `📝 Found ${comments.length} comments, analyzing sentiment...`
        );
        const analysis = await analyzeSentiment(comments);

        if (analysis) {
          await supabase
            .from("issue_posts")
            .update({
              overall_sentiment: analysis.overall_sentiment,
              sentiment_summary: analysis.summary,
              comments_fetched_at: new Date().toISOString(),
            })
            .eq("post_id", post.post_id);

          console.log(
            `✅ Analysis saved for Post ID ${post.post_id}. Sentiment: ${analysis.overall_sentiment}`
          );
        } else {
          console.log(
            `⚠️ Failed to analyze sentiment for post ${post.post_id}`
          );
        }
      } else {
        // No comments found, mark as neutral
        await supabase
          .from("issue_posts")
          .update({
            overall_sentiment: "Neutral",
            sentiment_summary: "No public comments found for this post.",
            comments_fetched_at: new Date().toISOString(),
          })
          .eq("post_id", post.post_id);

        console.log(
          `📭 No comments found for post ${post.post_id}, marked as Neutral`
        );
      }
    }
  } catch (error) {
    console.error("🔥 Analytics Job failed:", error.stack || error.message);
  } finally {
    console.log("📊 Analytics Job Complete.");
    // Test with a specific tweet
    const testTweetId = "1968702588552949820";
    const comments = await fetchIssueCommentsDirectAPI(testTweetId);
    console.log("Test results:", comments);
  }
};

module.exports = { runPostAnalyticsJob };
