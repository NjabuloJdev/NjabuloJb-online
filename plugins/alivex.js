import fs from 'fs';
import config from '../config.cjs';
import pkg, { prepareWAMessageMedia } from "@whiskeysockets/baileys";
const { generateWAMessageFromContent, proto } = pkg;

const alive = async (m, Matrix) => {
  const uptimeSeconds = process.uptime();
  const days = Math.floor(uptimeSeconds / (3600 * 24));
  const hours = Math.floor((uptimeSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  const seconds = Math.floor(uptimeSeconds % 60);
  const timeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';

  if (!['alivex', 'uptimex', 'runtimex'].includes(cmd)) return;

  const str = `
  🥀 *╭•➤му ηαмє ιѕ: ${m.pushName}*

*┏═⊷*
*║  ηαмє нαρριηєѕѕ*
*║  νєяѕιση 1.0.0*
*║  Uptime: ${timeString}*
*║  [ƒαмιℓу мιηι вσт ƒяιєη∂ѕ]*
*┗═•⊷*`;

  const button = [
    {
      "buttonId": ".alive",
      "buttonText": {
        "displayText": "Alive"
      },
      "type": 1
    },
    {
      "buttonId": ".menu",
      "buttonText": {
        "displayText": "Help"
      },
      "type": 1
    }
  ];

  await Matrix.sendMessage(m.from, {
    image: fs.readFileSync('./media/fana.jpg'),
    caption: str,
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
  }, {
    quoted: m
  });
};

export default alive;
