import fs from 'fs';
import config from '../config.cjs';

const alive = async (m, Matrix) => {
  const uptimeSeconds = process.uptime();
  const days = Math.floor(uptimeSeconds / (3600 * 24));
  const hours = Math.floor((uptimeSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  const seconds = Math.floor(uptimeSeconds % 60);
  const timeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';

  if (!['al', 'upme', 'ruime'].includes(cmd)) return;
  
  const str = `*🤖 Bot Status: Online*\n*⏳ Uptime: ${timeString}*`;

  const buttons = [
    {
      buttonId: `tel:${config.OWNER_NUMBER}`,
      buttonText: { displayText: 'Call Owner' },
      type: 1
    },
    {
      buttonId: config.GITHUB_URL,
      buttonText: { displayText: 'GitHub' },
      type: 1
    }
  ];

  const buttonMessage = {
    image: fs.readFileSync('./media/fana.jpg'),
    caption: str,
    footer: 'Select an option',
    buttons: buttons,
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
