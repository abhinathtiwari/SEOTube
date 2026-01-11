// export function buildPrompt(videos: any[]) {
//   return `
// You are a YouTube SEO expert.

// I will give you a list of YouTube videos with poor performance.
// For EACH video, generate:
// - SEO optimized title (max 70 chars)
// - SEO optimized description (max 500 chars)
// - 10 relevant tags

// Rules:
// - Do NOT change videoId
// - Return ONLY valid JSON
// - Do NOT include markdown
// - Do NOT include explanations

// Input:
// ${JSON.stringify(videos, null, 2)}

// Output format:
// [
//   {
//     "videoId": "",
//     "title": "",
//     "description": "",
//     "tags": []
//   }
// ]
// `;
// }


// export function buildPrompt(videos: any[]) {
//   return `
// You are a Senior YouTube SEO Strategist. 

// Task: Rewrite the metadata for the provided list of low-performing videos to maximize Click-Through Rate (CTR) and search visibility.

// Optimization Requirements for EACH Video:
// - Title: Front-load the primary keyword. Use power words or numbers to create curiosity. (Max 70 chars)
// - Description: Start with a 2-3 sentence hook containing keywords. Include a brief summary and a clear Call-to-Action (CTA). (Max 100 chars)
// - Tags: Provide exactly 10 tags, mixing broad category terms and specific long-tail keywords.
// - CategoryId: Select the most accurate numerical ID from the standard YouTube Data API v3 list (e.g., 20 for Gaming, 27 for Education).

// Constraints:
// - Do NOT alter the 'videoId'.
// - Maintain a [Professional/Casual/Engaging] tone throughout.
// - Return ONLY a valid JSON array of objects.
// - Do NOT include markdown
// - Do NOT include explanations
// - No code blocks

// Input:
// ${JSON.stringify(videos, null, 2)}

// Output format:
// [
//   {
//     "videoId": "string",
//     "title": "string",
//     "description": "string",
//     "tags": ["string"],
//     "categoryId": integer
//   }
// ]
// `;
// }

// export function buildPrompt(videos: any[]) {
//   return `
// You are a Senior YouTube SEO Strategist. 

// Task: Rewrite the metadata for the provided list of low-performing videos to maximize Click-Through Rate (CTR) and search visibility.

// Optimization Requirements for EACH Video:
// - Title: Front-load the primary keyword. Use power words or numbers to create curiosity. (Max 70 chars)
// - Description: Start with a 2-3 sentence hook containing keywords. Include a brief summary and a clear Call-to-Action (CTA). (Max 500 chars) and with # hashtags related to video.
// - Tags: Provide exactly 20 tags, mixing broad category terms and specific long-tail keywords.
// - CategoryId: Select the most accurate numerical ID from the standard YouTube Data API v3 list (e.g., 20 for Gaming, 27 for Education).
// - SEO Improvement Score: Provide a score between 1 and 100, indicating the potential improvement in after using new metadata.

// Constraints:
// - Do NOT alter the 'videoId'.
// - Maintain a [Professional/Casual/Engaging] tone throughout.
// - Return ONLY a valid JSON array of objects.
// - Do NOT include markdown
// - Do NOT include explanations
// - No code blocks

// Input:
// ${JSON.stringify(videos, null, 2)}

// Output format:
// [
//   {
//     "videoId": "string",
//     "title": "string",
//     "description": "string",
//     "tags": ["string"],
//     "categoryId": integer,
//     "seoScore": integer
//   }
// ]
// `;
// }


export function buildPrompt(videos: any[], channelName: string) {
  return `
You are a Senior YouTube SEO Strategist. 

Task: Rewrite the metadata for the provided list of low-performing videos to maximize Click-Through Rate (CTR) and search visibility. Also use ${channelName} intelligently in all metadata.

Optimization Requirements for EACH Video:
- Title: Front-load the primary keyword. Use power words or numbers to create curiosity. (Max 30 chars). Add channelName "title" | "channelName"
- Description: Start with a 1 sentence hook containing keywords. Include a brief summary and a clear Call-to-Action (CTA). (Max 100 chars) and with # hashtags related to video.
- Tags: Provide exactly 4 tags, mixing broad category terms and specific long-tail keywords.
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