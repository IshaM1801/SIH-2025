// utils/geminiService.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI("AIzaSyAZdSMK4YLMdZoKJ8-S48IuwZGIyINY10w");

/**
 * Check if a new issue description is similar to ANY of the nearby issues.
 *
 * @param {string} newDesc - The new issue description.
 * @param {Array<object>} nearbyIssues - List of nearby issues with { issue_id, issue_description }.
 * @returns {object} { isSimilar: boolean, similarIssueIds: string[] }
 */
async function checkSimilarityWithGemini(newDesc, nearbyIssues) {
    if (!nearbyIssues || nearbyIssues.length === 0) {
        return { isSimilar: false, similarIssueIds: [] };
    }

    const listText = nearbyIssues
        .map((issue, idx) => `${idx + 1}. (ID: ${issue.issue_id}) ${issue.issue_description}`)
        .join("\n");

    const prompt = `
You are given one new issue description and a list of existing nearby issue descriptions.
If the new issue is about the same or very similar to ANY of the nearby issues, reply with:
"no" OR "yes" followed by the IDs of the similar issues.

Examples of valid responses:
- no
- yes: 12, 15
- yes: 7

New issue:
"${newDesc}"

Nearby issues:
${listText}
`;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const result = await model.generateContent(prompt);
        const responseText = result.response.text().trim().toLowerCase();

        if (responseText.startsWith("no")) {
            return { isSimilar: false, similarIssueIds: [] };
        }

        if (responseText.startsWith("yes")) {
            const ids = responseText
                .replace("yes:", "")
                .split(",")
                .map((id) => id.trim())
                .filter(Boolean);
            return { isSimilar: true, similarIssueIds: ids };
        }

        return { isSimilar: false, similarIssueIds: [] }; // fallback
    } catch (err) {
        console.error("Gemini similarity check failed:", err.message);
        return { isSimilar: false, similarIssueIds: [] };
    }
}

module.exports = { checkSimilarityWithGemini };
