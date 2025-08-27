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

    const text = `
      🥀 *╭•➤му ηαмє ιѕ: ${m.pushName}*

*┏═⊷*
*║  ηαмє нαρριηєѕѕ*
*║  νєяѕιση 1.0.0*
*║  pong: ${responseTime.toFixed(2)} (ms)*
*║  [ƒαмιℓу мιηι вσт ƒяιєη∂ѕ]*
*┗═•⊷*
    `;

  let buttons = [
          {
            name: "cta_copy",
            buttonParamsJson: JSON.stringify({
              display_text: "📋 ᴄᴏᴘʏ ʟʏʀɪᴄs",
              id: "copy_code",
              copy_code: lyrics
            })
          },
          {
            name: "cta_url",
            buttonParamsJson: JSON.stringify({
              display_text: "Follow our Channel",
              url: `https://whatsapp.com/channel/0029VagJlnG6xCSU2tS1Vz19`
            })
          },
          {
            name: "quick_reply",
            buttonParamsJson: JSON.stringify({
              display_text: "ᴍᴀɪɴ ᴍᴇɴᴜ",
              id: ".menu"
            })
          }
        ];

    await Matrix.sendMessage(m.from, {
      image: fs.readFileSync('./media/fana.jpg'),
      caption: text,
      buttons: buttons,
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
