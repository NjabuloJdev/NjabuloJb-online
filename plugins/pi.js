import fs from 'fs';
import config from "../config.cjs";
import pkg, { prepareWAMessageMedia } from "@whiskeysockets/baileys";
const { generateWAMessageFromContent, proto } = pkg;

const alive = async (m, Matrix) => {
  try {
    const prefix = config.Prefix || config.PREFIX || ".";
    const cmd = m.body?.startsWith(prefix) ? m.body.slice(prefix.length).trim().split(" ")[0].toLowerCase() : "";
    if (!["pingj","alivej", "uptimej", "runtime"].includes(cmd)) return;

    const text = `
🥀 *╭•➤му ηαмє ιѕ: ${m.pushName}*

*┏═⊷*
*║  ηαмє нαρριηєѕѕ*
*║  νєяѕιση 1.0.0*
*║  ƒяιєη∂ υѕє 1000*
*║  [ƒαмιℓу мιηι вσт ƒяιєη∂ѕ]*
*┗═•⊷*`;

    const listButton = { 
      buttonText: "ѕєℓє¢т αη σρтιση ιηƒσ",
      sections: [
        {
          title: "ηναвυℓσ נв мєηυ ιηƒσ",
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

    const buttonMessage = {
      image: fs.readFileSync('./media/fana.jpg'),
      caption: text,
      footer: 'Njabulo Jb',
      buttonText: listButton.buttonText,
      sections: listButton.sections,
    };

    await Matrix.sendMessage(m.from, buttonMessage, { quoted: m });

  } catch (error) {
    console.error(`❌ Alive error: ${error.message}`);
    await Matrix.sendMessage(m.from, {
      text: `
*Njabulo Jb* hit a snag! Error: ${error.message || "Failed to check status"} 😡
`,
    }, { quoted: m });
  }
};

export default alive;
