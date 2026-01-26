
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

export function buildThumbnailPrompt(title: string, description: string) {
  return `
    Act as a World-Class YouTube Thumbnail Designer.
    Analyze the video content below and design a high-converting, minimalistic thumbnail.

    Video Context:
    Title: "${title}"
    Description: "${description}"

    Design Tasks (Think step-by-step):
    1. **Primary Concept**: Identify the single most important visual object or symbol that represents this specific video.
    2. **Color Palette**: Choose a solid, clean background color that emotionally fits the topic (e.g., Blue for tech, White for education, Red for urgent).
    3. **Hook Text**: Create a NEW, catchy 3-4 word slogan. Do NOT use the title. It must strictly complement the visual.

    Final Image Prompt Output Requirements:
    - **Style**: Ultra-minimalistic, high-resolution 3D render or vector art style.
    - **Composition**: Split layout. 
        - Left: The main visual/icon (large, clean, 3D style).
        - Right: The Hook Text (Bold, modern typography, contrasting color).
        - Background: Solid single color or subtle gradient. NO CLUTTER.
    
    Output ONLY the detailed image generation prompt.
  `;
}

export function buildPrompt(videos: any[], channelName: string) {
  return `
You are a Senior YouTube SEO Strategist.

    Task: Rewrite the metadata for the provided list of low - performing videos to maximize Click - Through Rate(CTR) and search visibility.Also use ${channelName} intelligently in all metadata.

Optimization Requirements for EACH Video:
    - Title: Front - load the primary keyword.Use power words or numbers to create curiosity. (Max 70 chars).Add channelName "title" | "channelName"
      - Description: It must contain keywords.Include a brief summary and a clear Call - to - Action(CTA). (at least ${process.env.DESCRIPTION_CHARACTERS_COUNT} characters) and with # hashtags related to video.
- Tags: Provide at least 20 tags, mixing broad category terms and specific long - tail keywords.
- CategoryId: Select the most accurate numerical ID from the standard YouTube Data API v3 list(e.g., 20 for Gaming, 27 for Education).
- SEO Improvement Score: Provide a score between 1 and 100, indicating the potential improvement in after using new metadata.

    Constraints:
  - Do NOT alter the 'videoId'.
- Maintain a[Professional / Casual / Engaging] tone throughout.
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