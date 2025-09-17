// backend/services/xService.js

const { TwitterApi, EUploadMimeType } = require("twitter-api-v2");
const fetch = require("node-fetch");
const { createClient } = require("@supabase/supabase-js");
const path = require("path");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const twitterClient = new TwitterApi({
  appKey: process.env.X_API_KEY,
  appSecret: process.env.X_API_SECRET,
  accessToken: process.env.X_ACCESS_TOKEN,
  accessSecret: process.env.X_ACCESS_TOKEN_SECRET,
});

/**
 * Detects MIME type from URL or headers.
 */
const detectMimeType = (url, contentTypeHeader) => {
  if (contentTypeHeader) {
    if (contentTypeHeader.includes("png")) return EUploadMimeType.Png;
    if (contentTypeHeader.includes("jpeg")) return EUploadMimeType.Jpeg;
    if (contentTypeHeader.includes("webp")) return EUploadMimeType.Webp;
  }

  const ext = path.extname(url).toLowerCase();
  if (ext.includes("png")) return EUploadMimeType.Png;
  if (ext.includes("jpg") || ext.includes("jpeg")) return EUploadMimeType.Jpeg;
  if (ext.includes("webp")) return EUploadMimeType.Webp;

  return EUploadMimeType.Png; // default fallback
};

/**
 * Fetch image and return buffer + MIME type.
 */
const fetchImageAsBuffer = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch image. Status: ${response.status} ${response.statusText}`
      );
    }

    const contentType = response.headers.get("content-type") || "";
    const mimeType = detectMimeType(url, contentType);

    const buffer = await response.buffer();
    return { buffer, mimeType };
  } catch (error) {
    console.error(`Error fetching image from ${url}:`, error.message);
    throw error;
  }
};

/**
 * Post a resolved issue to X.
 */
const postSingleIssueToX = async (post) => {
  try {
    console.log(`➡️ Publishing post for issue ID: ${post.issue_id}`);

    // Fetch before and after images
    const [beforeImage, afterImage] = await Promise.all([
      fetchImageAsBuffer(post.before_image_url),
      fetchImageAsBuffer(post.after_image_url),
    ]);

    // Upload both images with correct MIME type
    const beforeMediaId = await twitterClient.v1.uploadMedia(
      beforeImage.buffer,
      { mimeType: beforeImage.mimeType }
    );

    const afterMediaId = await twitterClient.v1.uploadMedia(afterImage.buffer, {
      mimeType: afterImage.mimeType,
    });

    // Create tweet with text + media
    const tweet = await twitterClient.v2.tweet({
      text: post.ai_generated_text || "🚀 Resolved issue update",
      media: {
        media_ids: [beforeMediaId, afterMediaId],
      },
    });

    const x_post_url = `https://x.com/${process.env.X_ACCOUNT_USERNAME}/status/${tweet.data.id}`;

    // Update DB
    await supabase
      .from("issue_posts")
      .update({
        posted_to_x: true,
        x_post_url: x_post_url,
      })
      .eq("post_id", post.post_id);

    console.log(`✅ Post successful! X URL: ${x_post_url}`);
    return true;
  } catch (error) {
    console.error(
      `❌ Failed to publish post for ${post.post_id}:`,
      error.message,
      error
    );
    return false;
  }
};

/**
 * Scheduled job
 */
const postResolvedIssuesJob = async () => {
  console.log("✨ Starting X posting job...");
  try {
    const { data: postsToPublish, error: fetchError } = await supabase
      .from("issue_posts")
      .select(
        "post_id, issue_id, ai_generated_text, before_image_url, after_image_url"
      )
      .eq("posted_to_x", false)
      .limit(5);

    if (fetchError) {
      console.error("❌ Failed to fetch posts:", fetchError.message);
      return;
    }

    if (!postsToPublish || postsToPublish.length === 0) {
      console.log("✅ No new posts to publish.");
      return;
    }

    for (const post of postsToPublish) {
      await postSingleIssueToX(post);
    }
    console.log("✨ X posting job complete.");
  } catch (err) {
    console.error(
      "🔥 Unhandled error in scheduled job:",
      err.stack || err.message
    );
  }
};

module.exports = { postResolvedIssuesJob };
