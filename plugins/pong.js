import config from '../config.cjs';
import pkg, { prepareWAMessageMedia } from "@whiskeysockets/baileys";
const { generateWAMessageFromContent, proto } = pkg;


const ping = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';

  if (cmd === "ping") {
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
  
    const msg = `*JINX-XMD SPEED: ${responseTime.toFixed(2)}ms ${reactionEmoji}*`;

    const buttonMessage = {
      text: msg,
      templateButtons: [
        {
          index: 1,
          urlButton: {
            displayText: 'Follow our Channel',
            url: 'https://whatsapp.com/channel/0029VagJlnG6xCSU2tS1Vz19'
          }
        }
      ]
    };

    await Matrix.sendMessage(m.from, {
      text: msg,
      footer: 'JINX-XMD',
      templateButtons: [
        {
          index: 1,
          urlButton: {
            displayText: 'Follow our Channel',
            url: 'https://whatsapp.com/channel/0029VagJlnG6xCSU2tS1Vz19'
          }
        }
      ]
    }, { quoted: m });
  }
};

export default ping;
