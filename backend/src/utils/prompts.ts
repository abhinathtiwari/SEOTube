export function buildPrompt(videos: any[]) {
  return `
You are a YouTube SEO expert.

I will give you a list of YouTube videos with poor performance.
For EACH video, generate:
- SEO optimized title (max 70 chars)
- SEO optimized description (max 500 chars)
- 10 relevant tags

Rules:
- Do NOT change videoId
- Return ONLY valid JSON
- Do NOT include markdown
- Do NOT include explanations

Input:
${JSON.stringify(videos, null, 2)}

Output format:
[
  {
    "videoId": "",
    "title": "",
    "description": "",
    "tags": []
  }
]
`;
}