import config from "../config.cjs";
import pkg, { prepareWAMessageMedia } from "@whiskeysockets/baileys";
const { generateWAMessageFromContent, proto } = pkg;

const alive = async (m, Matrix) => {
  try {
    const prefix = config.Prefix || config.PREFIX || ".";
    const cmd = m.body?.startsWith(prefix) ? m.body.slice(prefix.length).trim().split(" ")[0].toLowerCase() : "";
    if (!["ping","alive", "uptime", "runtime"].includes(cmd)) return;

    const listButton = { 
      buttonText: "ѕєℓє¢т αη σρтιση ιηƒσ",
      sections: [
        {
          title: "ηנαвυℓσ נв мєηυ ιηƒσ",
          rows: [
            {
              title: "Ping",
              rowId: ".pingx",
              description: "📡Check bot's ping",
            },
            {
              title: "Alive",
              rowId: ".alivex",
              description: "🟢Check bot's uptime",
            },
            {
             title: "Repo",
              rowId: ".repo",
              description: "📎 Website repo",
             },
             {
             title: "Website",
              rowId: "site",
              description: "🖇️For oll website Deploy",
            },
            {
              title: "Help",
              rowId: ".help",
              description: "📜Get help with bot commands",
            },
          ],
        },
      ],
    };

    await Matrix.sendMessage( m.from,{
      image: fs.readFileSync('./media/fana.jpg'),
      caption: `
🥀 *╭•➤му ηαмє ιѕ: ${m.pushName}*

*┏═⊷*
*║  ηαмє нαρριηєѕѕ*
*║  νєяѕιση 1.0.0*
*║  ƒяιєη∂ υѕє 1000*
*║  [ƒαмιℓу мιηι вσт ƒяιєη∂ѕ]*
*┗═•⊷*`,
        buttonText: listButton.buttonText,
        sections: listButton.sections,
        listType: 1,
      }, { quoted: {
            key: {
                fromMe: false,
                participant: `0@s.whatsapp.net`,
                remoteJid: "status@broadcast"
            },
            message: {
                contactMessage: {
                    vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Njabulo-Jb;BOT;;;\nFN:Njabulo-Jb\nitem1.TEL;waid=26777821911:+126777821911\nitem1.X-ABLabel:Bot\nEND:VCARD`
                }
            }
        } });
  

    Matrix.ev.on("messages.upsert", async (update) => {
      const msg = update.messages[0];
      if (msg.key.remoteJid === m.from && msg.listResponseMessage) {
        const selectedOption = msg.listResponseMessage.singleSelectReply.selectedRowId;

        if (selectedOption === "ping") {
          await Matrix.sendMessage(m.from, { text: "Pong!" });
        } else if (selectedOption === "alive") {
          const uptimeSeconds = process.uptime();
          const days = Math.floor(uptimeSeconds / (3600 * 24));
          const hours = Math.floor((uptimeSeconds % (3600 * 24)) / 3600);
          const minutes = Math.floor((uptimeSeconds % 3600) / 60);
          const seconds = Math.floor(uptimeSeconds % 60);
          const timeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;
          await Matrix.sendMessage(m.from, { text: `Toxic-MD is alive for ${timeString}` });
        } else if (selectedOption === ".help") {
          await Matrix.sendMessage(m.from, { text: "Available commands: ping, alive, help" });
        }
      }
    });
  } catch (error) {
    console.error(`❌ Alive error: ${error.message}`);
    await Matrix.sendMessage(m.from, {
      text: `◈━━━━━━━━━━━━━━━━◈
│❒ *Toxic-MD* hit a snag! Error: ${error.message || "Failed to check status"} 😡
◈━━━━━━━━━━━━━━━━◈`,
    }, { quoted: m });
  }
};

export default alive;
