import fetch from 'node-fetch';
import ytSearch from 'yt-search';
import fs from 'fs';
import { pipeline } from 'stream';
import { promisify } from 'util';
import osCallbacks from 'os';
import config from "../config.cjs";
import pkg, { prepareWAMessageMedia } from "@whiskeysockets/baileys";
const { generateWAMessageFromContent, proto } = pkg;

const streamPipeline = promisify(pipeline);
const tmpDir = osCallbacks.tmpdir();
const filePaths = {};

const play = async (m, Matrix) => {
  try {
    const prefix = config.Prefix || config.PREFIX || ".";
    const cmd = m.body?.startsWith(prefix) ? m.body.slice(prefix.length).split(" ")[0].toLowerCase() : "";
    const args = m.body.slice(prefix.length + cmd.length).trim().split(" ");

    if (cmd === "pay") {
      if (args.length === 0 || !args.join(" ")) {
        return Matrix.sendMessage(m.from, {
          text: `Give me a song name or keywords to search 😎`,
        }, { quoted: m });
      }

      const searchQuery = args.join(" ");
      await Matrix.sendMessage(m.from, {
        text: `*Toxic-MD* huntin' for "${searchQuery}"... 🎧`,
      }, { quoted: m });

      // Search YouTube for song info
      const searchResults = await ytSearch(searchQuery);
      if (!searchResults.videos || searchResults.videos.length === 0) {
        return Matrix.sendMessage(m.from, {
          text: `No tracks found for "${searchQuery}". You slippin'! 💀`,
        }, { quoted: m });
      }

      const song = searchResults.videos[0];
      const safeTitle = song.title.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_').substring(0, 100);
      const filePath = `${tmpDir}/${safeTitle}.mp3`;

      // Fetch download URL from the new API
      let apiResponse;
      try {
        const apiUrl = `https://apis.davidcyriltech.my.id/play?query=${encodeURIComponent(searchQuery)}`;
        apiResponse = await fetch(apiUrl);
        if (!apiResponse.ok) {
          throw new Error(`API responded with status: ${apiResponse.status}`);
        }
        const data = await apiResponse.json();
        if (!data.status || !data.result.download_url) {
          throw new Error('API response missing download URL or failed');
        }

        // Download the audio file
        const downloadResponse = await fetch(data.result.download_url);
        if (!downloadResponse.ok) {
          throw new Error(`Failed to download audio: ${downloadResponse.status}`);
        }
        const fileStream = fs.createWriteStream(filePath);
        await streamPipeline(downloadResponse.body, fileStream);

        filePaths[safeTitle] = filePath;

        // Send song info from yt-search and API
        const songInfo = `
*Toxic-MD* Song Intel 🔥
*Title*: ${data.result.title || song.title}
*Views*: ${song.views.toLocaleString()}
*Duration*: ${song.timestamp}
*Channel*: ${song.author.name}
*Uploaded*: ${song.ago}
*URL*: ${data.result.video_url || song.url}
`;
        const buttons = [
          {
            buttonId: `play_audio_${safeTitle}`,
            buttonText: { displayText: "Play Audio" },
            type: 1,
          },
          {
            buttonId: `play_document_${safeTitle}`,
            buttonText: { displayText: "Play Document" },
            type: 1,
          },
        ];

        await Matrix.sendMessage(m.from, {
          text: songInfo,
          buttons,
        }, { quoted: m });
      } catch (apiError) {
        console.error(`API error:`, apiError.message);
        return Matrix.sendMessage(m.from, {
          text: `*Toxic-MD* couldn't hit the API for "${song.title}". Server's actin' up! 😡`,
        }, { quoted: m });
      }
    }
  } catch (error) {
    console.error(`❌ Play error: ${error.message}`);
    await Matrix.sendMessage(m.from, {
      text: `*Toxic-MD* hit a snag, fam! Try again or pick a better track! 😈`,
    }, { quoted: m });
  }
};

Matrix.ev.on("messages.upsert", async (update) => {
  if (update.messages[0].key.fromMe) return;
  if (update.messages[0].message?.buttonsResponseMessage) {
    const buttonId = update.messages[0].message.buttonsResponseMessage.selectedButtonId;
    if (buttonId.startsWith("play_audio_")) {
      const safeTitle = buttonId.replace('play_audio_', '');
      const filePath = filePaths[safeTitle];
      if (!filePath) return;
      const doc = {
        audio: {
          url: filePath,
        },
        mimetype: 'audio/mpeg',
        ptt: false,
        fileName: `${safeTitle}.mp3`,
      };
      await Matrix.sendMessage(update.messages[0].key.remoteJid, doc, { quoted: update.messages[0] });
    } else if (buttonId.startsWith("play_document_")) {
      const safeTitle = buttonId.replace('play_document_', '');
      const filePath = filePaths[safeTitle];
      if (!filePath) return;
      const doc = {
        document: {
          url: filePath,
        },
        mimetype: 'audio/mpeg',
        fileName: `${safeTitle}.mp3`,
      };
      await Matrix.sendMessage(update.messages[0].key.remoteJid, doc, { quoted: update.messages[0] });
    }
  }
});

export default play;
