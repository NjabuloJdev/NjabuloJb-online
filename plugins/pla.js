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
          title: "Play Audio",
          rowId: "play_audio",
          description: "Play an audio file",
        },
        {
          title: "Send Document",
          rowId: "send_document",
          description: "Send a document file"
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
  }
};

export default play;
