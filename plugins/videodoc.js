import fetch from 'node-fetch';
import ytSearch from 'yt-search';
import fs from 'fs';
import { pipeline } from 'stream';
import { promisify } from 'util';
import os from 'os';
import config from '../config.cjs';
import { generateWAMessageFromContent, proto } from '@whiskeysockets/baileys';

// ... (rest of the script remains the same)

const video = async (message, client) => {
  try {
    const prefix = config.Prefix || config.PREFIX || '.';
    const body = message.body || '';
    const command = body.startsWith(prefix) ? body.slice(prefix.length).split(" ")[0].toLowerCase() : '';
    const args = body.slice(prefix.length + command.length).trim().split(" ");
    
    if (command === "videdoco") {
      await sendCustomReaction(client, message, "⏳");

      if (args.length === 0 || !args.join(" ")) {
        await sendCustomReaction(client, message, "❌");
        return await client.sendMessage(message.from, {
          text: toFancyFont("Please provide a video name or keywords to search"),
          mentions: [message.sender]
        }, { quoted: message });
      }

      const query = args.join(" ");
      const searchResults = await ytSearch(query);

      if (!searchResults.videos || searchResults.videos.length === 0) {
        await sendCustomReaction(client, message, "❌");
        return await client.sendMessage(message.from, {
          text: toFancyFont('No videos found for') + " \"" + query + "\"",
          mentions: [message.sender]
        }, { quoted: message });
      }

      await sendCustomReaction(client, message, "🔍");

      const video = searchResults.videos[0];
      const fileName = video.title.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_').substring(0, 100);
      const filePath = os.tmpdir() + '/' + fileName + ".mp4";

      let apiResponse;
      try {
        const apiUrl = "https://apis.davidcyriltech.my.id/download/ytmp4?url=" + encodeURIComponent(video.url);
        apiResponse = await fetch(apiUrl);

        if (!apiResponse.ok) {
          throw new Error("API responded with status: " + apiResponse.status);
        }

        const apiData = await apiResponse.json();

        if (!apiData.status || !apiData.result?.download_url) {
          throw new Error("API response missing download URL or failed");
        }

        const minutes = Math.floor(video.duration.seconds / 60);
        const seconds = video.duration.seconds % 60;
        const formattedDuration = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        const videoInfo = `
 ❍ *Minibot YouTube* ❍
🎬 *Title:* ${video.title}

👤 *Channel:* ${video.author.name}
⏱️ *Duration:* ${formattedDuration}
📅 *Published:* ${video.ago}
👁️ *Views:* ${video.views.toLocaleString()}
📥 *Format:* MP4
        `.trim();

        const buttons = [
          {
            buttonId: `download-video-${Date.now()}`,
            buttonText: { displayText: 'Download Video' },
            type: 1
          },
          {
            buttonId: `download-document-${Date.now()}`,
            buttonText: { displayText: 'Download Document' },
            type: 1
          }
        ];

        const buttonMessage = {
          text: videoInfo,
          footer: 'Click the buttons below to download',
          buttons: buttons,
          headerType: 1
        };

        // Get YouTube thumbnail URL
        const thumbnailUrl = getYouTubeThumbnail(video.videoId, 'maxresdefault');

        // Download thumbnail image
        let imageBuffer = null;
        try {
          const imageResponse = await fetch(thumbnailUrl);
          if (imageResponse.ok) {
            const arrayBuffer = await imageResponse.arrayBuffer();
            imageBuffer = Buffer.from(arrayBuffer);
          }
        } catch (imageError) {
          console.error("Failed to download thumbnail:", imageError.message);
        }

        if (imageBuffer) {
          await client.sendMessage(message.from, {
            image: imageBuffer,
            caption: videoInfo,
            footer: 'Click the buttons below to download',
            buttons: buttons
          }, { quoted: message });
        } else {
          await client.sendMessage(message.from, buttonMessage, { quoted: message });
        }

        await sendCustomReaction(client, message, "⬇️");

        const videoResponse = await fetch(apiData.result.download_url);
        
        if (!videoResponse.ok) {
          throw new Error("Failed to download video: " + videoResponse.status);
        }
        
        const fileStream = fs.createWriteStream(filePath);
        await streamPipeline(videoResponse.body, fileStream);

        await sendCustomReaction(client, message, "✅");
      } catch (error) {
        console.error("❌ video error: " + error.message);
        await sendCustomReaction(client, message, "❌");
      }
    }
  } catch (error) {
    console.error("❌ video error: " + error.message);
    await sendCustomReaction(client, message, "❌");
  }
};

client.ev.on('interaction', async (interaction) => {
  if (interaction.type === 'button_click') {
    const buttonId = interaction.buttonId;
    if (buttonId.startsWith('download-video')) {
      const videoData = fs.readFileSync(filePath);
      await client.sendMessage(interaction.remoteJid, { 
        video: videoData, 
        mimetype: 'video/mp4',
        caption: video.title,
        fileName: fileName + ".mp4"
      }, { quoted: interaction });
    } else if (buttonId.startsWith('download-document')) {
      const videoData = fs.readFileSync(filePath);
      await client.sendMessage(interaction.remoteJid, { 
        document: videoData, 
        mimetype: 'video/mp4',
        fileName: fileName + ".mp4"
      }, { quoted: interaction });
    }
  }
});
