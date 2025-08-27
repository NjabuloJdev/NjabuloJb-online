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

  if (!['ave', 'ume', 'rume'].includes(cmd)) return;

  const str = `*🤖 Bot Status: Online*\n*⏳ Uptime: ${timeString}*`;

  const buttons = [
    {
      name: "cta_url",
      buttonParamsJson: JSON.stringify({
        display_text: "Follow our Channel",
        url: `https://whatsapp.com/channel/0029VagJlnG6xCSU2tS1Vz19`
      })
    }
  ];

  const buttonMessage = {
    image: fs.readFileSync('./media/fana.jpg'),
    caption: str,
    footer: "Select an option",
    templateButtons: buttons,
    headerType: 4,
    contextInfo: {
      mentionedJid: [m.sender],
      forwardingScore: 999,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: '120363302677217436@newsletter',
        newsletterName: "JINX-XMD",
        serverMessageId: 143
      }
    }
  };

  await Matrix.sendMessage(m.from, buttonMessage, { quoted: m });
};

export default alive;
