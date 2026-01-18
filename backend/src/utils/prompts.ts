
export function buildGrowthPrompt(videos: any[]) {
  return `
    You are a YouTube Growth Specialist.
    Analyze the following 5 most recent videos from a channel:
    ${JSON.stringify(videos, null, 2)}
    Task:
    1. Identify critical mistakes in their titles, descriptions, and tag usage. Provide a constructive advice paragraph of exactly 20 words.
    2. Based on the content style and niche of these videos, suggest 5 high-potential new video ideas.

    Return ONLY a valid JSON object in this format:
    {
      "message": "your 20-word advice paragraph here",
      "ideaList": ["Idea 1", "Idea 2", "Idea 3", "Idea 4", "Idea 5"]
    }
    `;
}

export function buildPrompt(videos: any[], channelName: string) {
  return `
You are a Senior YouTube SEO Strategist. 

Task: Rewrite the metadata for the provided list of low-performing videos to maximize Click-Through Rate (CTR) and search visibility. Also use ${channelName} intelligently in all metadata.

Optimization Requirements for EACH Video:
- Title: Front-load the primary keyword. Use power words or numbers to create curiosity. (Max 70 chars). Add channelName "title" | "channelName"
- Description: It must contain keywords. Include a brief summary and a clear Call-to-Action (CTA). (at least ${process.env.DESCRIPTION_CHARACTERS_COUNT} characters) and with # hashtags related to video.
- Tags: Provide at least 20 tags, mixing broad category terms and specific long-tail keywords.
- CategoryId: Select the most accurate numerical ID from the standard YouTube Data API v3 list (e.g., 20 for Gaming, 27 for Education).
- SEO Improvement Score: Provide a score between 1 and 100, indicating the potential improvement in after using new metadata.

Constraints:
- Do NOT alter the 'videoId'.
- Maintain a [Professional/Casual/Engaging] tone throughout.
- Return ONLY a valid JSON array of objects.
- Do NOT include markdown
- Do NOT include explanations
- No code blocks

Input:
${JSON.stringify(videos, null, 2)}

Output format:
[
  {
    "videoId": "string",
    "title": "string",
    "description": "string",
    "tags": ["string"],
    "categoryId": integer,
    "seoScore": integer
  }
]
`;
}