import fetch from 'node-fetch';
import ytSearch from 'yt-search';
import fs from 'fs';
import { pipeline } from 'stream';
import { promisify } from 'util';
import os from 'os';
import config from "../config.cjs";

const streamPipeline = promisify(pipeline);
const tmpDir = os.tmpdir();

const listButton = {
  buttonText: "Select an option",
  sections: [
    {
      title: "Toxic-MD Menu",
      rows: [
        {
          title: "Play Audio",
          rowId: "play_audio",
          description: "Play an audio file",
        },
        {
          title: "Send Document",
          rowId: "send_document",
          description: "Send a document file",
        },
      ],
    },
  ],
};

const play = async (m, Matrix) => {
  try {
    const prefix = config.Prefix || config.PREFIX || ".";
    const cmd = m.body?.startsWith(prefix) ? m.body.slice(prefix.length).split(" ")[0].toLowerCase() : "";
    const args = m.body.slice(prefix.length + cmd.length).trim().split(" ");

    if (cmd === "pla") {
      if (!args.length || !args.join(" ")) {
        return Matrix.sendMessage(m.from, {
          text: `Give me a song name or keywords to search 😎`,
        }, { quoted: m });
      }

      const searchQuery = args.join(" ");
      await Matrix.sendMessage(m.from, {
        text: `*Toxic-MD* huntin' for "${searchQuery}"... 🎧`,
      }, { quoted: m });

      const searchResults = await ytSearch(searchQuery);
      if (!searchResults.videos?.length) {
        return Matrix.sendMessage(m.from, {
          text: `No tracks found for "${searchQuery}". You slippin'! 💀`,
        }, { quoted: m });
      }

      const song = searchResults.videos[0];
      const safeTitle = song.title.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_').substring(0, 100);
      const filePath = `${tmpDir}/${safeTitle}.mp3`;

      try {
        const apiUrl = `https://apis.davidcyriltech.my.id/play?query=${encodeURIComponent(searchQuery)}`;
        const apiResponse = await fetch(apiUrl);
        if (!apiResponse.ok) {
          throw new Error(`API responded with status: ${apiResponse.status}`);
        }
        const data = await apiResponse.json();
        if (!data.status || !data.result.download_url) {
          throw new Error('API response missing download URL or failed');
        }

        const songInfo = `
*Toxic-MD* Song Intel 🔥
*Title*: ${data.result.title || song.title}
*Views*: ${song.views.toLocaleString()}
*Duration*: ${song.timestamp}
*Channel*: ${song.author.name}
*Uploaded*: ${song.ago}
*URL*: ${data.result.video_url || song.url}`;
         const listButton = {
      buttonText: "Select an option",
      sections: [
        {
          title: "Toxic-MD Menu",
          rows: [
            {
              title: "Ping",
              rowId: "ping",
              description: "Check bot's ping",
            },
            {
              title: "Alive",
              rowId: "alive",
              description: "Check bot's uptime",
            },
            {
              title: "Help",
              rowId: "help",
              description: "Get help with bot commands",
            },
          ],
        },
      ],
    };

    await Matrix.sendMessage(
      m.from,
      {
        text: songInfo,
        buttonText: listButton.buttonText,
        sections: listButton.sections,
        listType: 1,
      },
      { quoted: m }
    );

        const downloadResponse = await fetch(data.result.download_url);
        if (!downloadResponse.ok) {
          throw new Error(`Failed to download audio: ${downloadResponse.status}`);
        }
        const fileStream = fs.createWriteStream(filePath);
        await streamPipeline(downloadResponse.body, fileStream);

        const doc = {
          audio: {
            url: filePath,
          },
          mimetype: 'audio/mpeg',
          ptt: false,
          fileName: `${safeTitle}.mp3`,
        };

        Matrix.sendMessage(m.from, doc, { quoted: m }).then(() => {
          try {
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
              console.log(`Deleted temp file: ${filePath}`);
            }
          } catch (cleanupErr) {
            console.error('Error during file cleanup:', cleanupErr);
          }
        }).catch(sendError => {
          console.error(`Failed to send audio:`, sendError.message);
          Matrix.sendMessage(m.from, {
            text: `*Toxic-MD* can't play "${song.title}". Failed to send audio 😣`,
          }, { quoted: m });
        });

        await Matrix.sendMessage(m.from, {
          text: `*${song.title}* dropped by *Toxic-MD*! Blast it! 🎶`,
        }, { quoted: m });
      } catch (apiError) {
        console.error(`API error:`, apiError.message);
        return Matrix.sendMessage(m.from, {
          text: `*Toxic-MD* couldn't hit the API for "${song.title}". Server's actin' up! 😡`,
        }, { quoted: m });
      }
    } else if (m.listResponse) {
      const selectedRowId = m.listResponse.singleSelectReply.selectedRowId;
      switch (selectedRowId) {
        case "play_audio":
          // Handle play audio command
          const audio = {
            audio: {
              url: "https://example.com/audio.mp3", // replace with your audio url
            },
            mimetype: "audio/mpeg",
          };
          await Matrix.sendMessage(m.from, audio, { quoted: m });
          break;
        case "send_document":
          // Handle send document command
          const document = {
            document: {
              url: "https://example.com/document.pdf", // replace with your document url
            },
            mimetype: "application/pdf",
            fileName: "document.pdf",
          };
          await Matrix.sendMessage(m.from, document, { quoted: m });
          break;
        default:
          await Matrix.sendMessage(m.from, { text: "Invalid option" }, { quoted: m });
          break;
      }
    }
  } catch (error) {
    console.error(`❌ Play error: ${error.message}`);
    await Matrix.sendMessage(m.from, {
      text: `*Toxic-MD* hit a snag, fam! Try again or pick a better track! 😈`,
    }, { quoted: m });
  }
};

export default play;
