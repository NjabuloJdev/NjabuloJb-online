import fs from 'fs';
import config from '../config.cjs';
import pkg, { prepareWAMessageMedia } from "@whiskeysockets/baileys";
const { generateWAMessageFromContent, proto } = pkg;

const ping = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';

  if (cmd === "pingx") {
    const start = new Date().getTime();

    const reactionEmojis = ['🔥', '⚡', '🚀', '💨', '🎯', '🎉', '🌟', '💥', '🕐', '🔹'];
    const textEmojis = ['💎', '🏆', '⚡️', '🚀', '🎶', '🌠', '🌀', '🔱', '🛡️', '✨'];

    const reactionEmoji = reactionEmojis[Math.floor(Math.random() * reactionEmojis.length)];
    let textEmoji = textEmojis[Math.floor(Math.random() * textEmojis.length)];

    // Ensure reaction and text emojis are different
    while (textEmoji === reactionEmoji) {
      textEmoji = textEmojis[Math.floor(Math.random() * textEmojis.length)];
    }

    await m.React(textEmoji);

    const end = new Date().getTime();
    const responseTime = (end - start) / 1000;

    const text = `*JINX-XMD SPEED: ${responseTime.toFixed(2)}ms ${reactionEmoji}*
    `;

    const button = [
      {
        "buttonId": ".alive",
        "buttonText": {
          "displayText": "Bot Status"
        },
        "type": 1
      },
      {
        "buttonId": ".help",
        "buttonText": {
          "displayText": "Help"
        },
        "type": 1
      },
      {
        "buttonId": ".channel",
        "buttonText": {
          "displayText": "Follow/Join Channel"
        },
        "type": 1
      }
    ];

    await Matrix.sendMessage(m.from, {
      image: fs.readFileSync('./media/fana.jpg'),
      caption: text,
      buttons: button,
      contextInfo: {
        mentionedJid: [m.sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363399999197102@newsletter',
          newsletterName: "╭••➤®Njabulo Jb",
          serverMessageId: 143
        }
      }
    }, { quoted: m });
  }
};

export default ping;
