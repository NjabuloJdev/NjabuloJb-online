import fetch from 'node-fetch';
import ytSearch from 'yt-search';
import fs from 'fs';
import { pipeline } from 'stream';
import { promisify } from 'util';
import os from 'os';
import config from "../config.cjs";
import pkg from "@whiskeysockets/baileys";
const { generateWAMessageFromContent, proto } = pkg;

const streamPipeline = promisify(pipeline);
const tmpDir = os.tmpdir();

const play = async (m, Matrix) => {
  try {
    const prefix = config.Prefix || config.PREFIX || ".";
    const cmd = m.body?.startsWith(prefix) ? m.body.slice(prefix.length).split(" ")[0].toLowerCase() : "";
    const args = m.body.slice(prefix.length + cmd.length).trim().split(" ");

    if (cmd === "play") {
      if (args.length === 0 || !args.join(" ")) {

      const listButton = {
      buttonText: "Select an option",
        sections: [
        {
          title: "𝗡𝗷𝗮𝗯𝘂𝗹𝗼 𝗝𝗯 𝗺𝗲𝗻𝘂 𝗶𝗻𝗳𝗼",
          rows: [
            {
              title: "play",
              rowId: ".play Justin Bieber",
              description: "play Justin Bieber",
            },
          ],
        },
      ],
    };

    await Matrix.sendMessage(
      m.from,
      {
        text: `Give me a song name or keywords to search `,
        buttonText: listButton.buttonText,
        sections: listButton.sections,
        listType: 1,
      },
      { quoted: m }
    );
      }

      const searchQuery = args.join(" ");
    
      const listButton = {
      buttonText: "Select an option",
      sections: [
        {
          title: "𝗡𝗷𝗮𝗯𝘂𝗹𝗼 𝗝𝗯 𝗺𝗲𝗻𝘂 𝗶𝗻𝗳𝗼",
          rows: [
            {
              title: "img",
              rowId: `.lyrics ${args.join(" ")}`,
              description: "📸image search",
            },
            {
              title: "lyrics",
              rowId: `.lyrics ${args.join(" ")}`,
              description: "🎻lyrics seach",
            },
            {
              title: "yts",
              rowId: `.yts ${args.join(" ")}`,
              description: "*🪗yts seach*",
            },
          ],
        },
      ],
    };

    await Matrix.sendMessage(
      m.from,
      {
        text: `*YouTube* seach' for "${searchQuery}"... `,
        buttonText: listButton.buttonText,
        sections: listButton.sections,
        listType: 1,
      },
      { quoted: m }
    );

      const searchResults = await ytSearch(searchQuery);
      if (!searchResults.videos || searchResults.videos.length === 0) {
      const buttons = [
          {
            buttonId: ".download",
            buttonText: { displayText: "🎧 seach menu" },
            type: 1,
          },
          {
            buttonId: ".download",
            buttonText: { displayText: "🗂️ download menu" },
            type: 1,
          },
        ];
          await Matrix.sendMessage(m.from, {
          text: `No tracks found for "${searchQuery}". You slippin'! `,
          buttons,
        }, { quoted: m });
      }

      const song = searchResults.videos[0];
      const safeTitle = song.title.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_').substring(0, 100);
      const filePath = `${tmpDir}/${safeTitle}.mp3`;

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

        const songInfo = `
*┏═⊷* 
*║Title*: ${data.result.title || song.title}
*║Views*: ${song.views.toLocaleString()}
*║Duration*: ${song.timestamp}
*║Channel*: ${song.author.name}
*║Uploaded*: ${song.ago}
*┗═•⊷*
`;
        const buttons = [
          {
            buttonId: `play_audio_${safeTitle}`,
            buttonText: { displayText: "🎧Audio" },
            type: 1,
          },
          {
            buttonId: `play_document_${safeTitle}`,
            buttonText: { displayText: "🗂️Document" },
            type: 1,
          },
        ];

        // Fetch the song's thumbnail image
        const imageResponse = await fetch(song.thumbnail);
        const imageBuffer = await imageResponse.arrayBuffer();
        const image = Buffer.from(imageBuffer);

        await Matrix.sendMessage(m.from, {
          image: image,
          caption: songInfo,
          buttons,
          contextInfo: {
          mentionedJid: [m.sender],
          externalAdReply: {
            showAdAttribution: false, // Marks as an ad
            title: `${data.result.title || song.title}`,
            body: ` ${song.author.name}`,
            sourceUrl: "https://www.facebook.com/profile.php?id=100094314013209",
            mediaType: 1,
            renderLargerThumbnail: true,
            mediaUrl: "https://www.facebook.com/profile.php?id=100094314013209",
          },
        },
      };
        }, { quoted: m });

        const downloadResponse = await fetch(data.result.download_url);
        if (!downloadResponse.ok) {
          throw new Error(`Failed to download audio: ${downloadResponse.status}`);
        }
        const fileStream = fs.createWriteStream(filePath);
        await streamPipeline(downloadResponse.body, fileStream);

        // Handle button clicks
        Matrix.ev.on("messages.upsert", async (update) => {
          if (update.messages[0].key.fromMe) return;
          if (update.messages[0].message?.buttonsResponseMessage) {
            const buttonId = update.messages[0].message.buttonsResponseMessage.selectedButtonId;
            if (buttonId.startsWith("play_audio_")) {
              const doc = {
                audio: {
                  url: filePath,
                },
                mimetype: 'audio/mpeg',
                ptt: false,
                fileName: `${safeTitle}.mp3`,
              };
              await Matrix.sendMessage(m.from, doc, { quoted: update.messages[0] });
            } else if (buttonId.startsWith("play_document_")) {
              const doc = {
                document: {
                  url: filePath,
                },
                mimetype: 'audio/mpeg',
                fileName: `${safeTitle}.mp3`,
              };
              await Matrix.sendMessage(m.from, doc, { quoted: update.messages[0] });
            }
          }
        });
      } catch (apiError) {
        console.error(`API error:`, apiError.message);
        return Matrix.sendMessage(m.from, {
          text: `*happiness* couldn't hit the API for "${song.title}". Server's actin' up! `,
        }, { quoted: m });
      }
    }
  } catch (error) {
    console.error(` Play error: ${error.message}`);
    await Matrix.sendMessage(m.from, {
      text: `*happiness* hit a snag, fam! Try again or pick a better track! `,
    }, { quoted: m });
  }
};

export default play;
