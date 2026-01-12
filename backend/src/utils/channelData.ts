import { google } from "googleapis";

export const getChannelData = async (oauth2Client: any) => {
  const youtube = google.youtube({ version: "v3", auth: oauth2Client });

  const channelResponse = await youtube.channels.list({
    part: ["snippet"],
    mine: true,
    maxResults: 1,
  });

  const snippet = channelResponse.data.items?.[0]?.snippet;
  
  return {
    channelName: snippet?.title || "",
    logo: snippet?.thumbnails?.medium?.url || "",
    customUrl: snippet?.customUrl || "",
  };
};
