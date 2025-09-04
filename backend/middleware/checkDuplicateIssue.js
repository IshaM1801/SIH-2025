const supabase = require("../supabase.js");
const { checkSimilarityWithGemini } = require("../utils/checkSimilarityUtil");

const RADIUS_METERS = 100; // adjust as needed

const checkDuplicateIssue = async (req, res, next) => {
    try {
        const { issue_description, latitude, longitude } = req.body;

        if (!issue_description || !latitude || !longitude) {
            return res.status(400).json({ message: "Description and location required." });
        }

        // Call RPC to get nearby issues
        const { data: nearbyIssues, error } = await supabase.rpc("get_nearby_issues", {
            user_location: `SRID=4326;POINT(${longitude} ${latitude})`,
            radius_m: RADIUS_METERS,
        });

        if (error) {
            console.error("Supabase RPC error:", error);
            return res.status(500).json({ message: "Error fetching nearby issues." });
        }

        if (!nearbyIssues || nearbyIssues.length === 0) {
            return next(); // ✅ No nearby issues → proceed
        }

        // Check similarity with Gemini
        const { isSimilar, similarIssueIds } = await checkSimilarityWithGemini(
            issue_description,
            nearbyIssues
        );

        if (isSimilar) {
            return res.status(409).json({
                message: "This issue has already been reported nearby.",
                similarIssueIds,
            });
        }

        next(); // ✅ Proceed to create issue
    } catch (err) {
        console.error("Middleware error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = checkDuplicateIssue;
