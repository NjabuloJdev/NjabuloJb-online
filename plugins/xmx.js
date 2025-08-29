import moment from "moment-timezone";
import fs from "fs";
import os from "os";
import pkg from "@whiskeysockets/baileys";
const { generateWAMessageFromContent, proto, prepareWAMessageMedia } = pkg;
import config from "../config.cjs";
import axios from "axios";

// System stats
const totalMemoryBytes = os.totalmem();
const freeMemoryBytes = os.freemem();
const byteToKB = 1 / 1024;
const byteToMB = byteToKB / 1024;
const byteToGB = byteToMB / 1024;

function formatBytes(bytes) {
  if (bytes >= Math.pow(1024, 3)) return (bytes * byteToGB).toFixed(2) + " GB";
  if (bytes >= Math.pow(1024, 2)) return (bytes * byteToMB).toFixed(2) + " MB";
  if (bytes >= 1024) return (bytes * byteToKB).toFixed(2) + " KB";
  return bytes.toFixed(2) + " bytes";
}

const uptime = process.uptime();
const day = Math.floor(uptime / (24 * 3600));
const hours = Math.floor((uptime % (24 * 3600)) / 3600);
const minutes = Math.floor((uptime % 3600) / 60);
const seconds = Math.floor(uptime % 60);
const uptimeMessage = `*I’ve been grindin’ for ${day}d ${hours}h ${minutes}m ${seconds}s* 🕒`;
const runMessage = `*☀️ ${day} Day*\n*🕐 ${hours} Hour*\n*⏰ ${minutes} Min*\n*⏱️ ${seconds} Sec*`;

const xtime = moment.tz("Africa/Nairobi").format("HH:mm:ss");
const xdate = moment.tz("Africa/Nairobi").format("DD/MM/YYYY");
const time2 = moment().tz("Africa/Nairobi").format("HH:mm:ss");
let pushwish = "";
if (time2 < "05:00:00") pushwish = `Good Morning 🌄`;
else if (time2 < "11:00:00") pushwish = `Good Morning 🌄`;
else if (time2 < "15:00:00") pushwish = `Good Afternoon 🌅`;
else if (time2 < "18:00:00") pushwish = `Good Evening 🌃`;
else pushwish = `Good Night 🌌`;

const menu = async (m, Matrix) => {
  try {
    const prefix = config.Prefix || config.PREFIX || ".";
    const cmd = m.body?.startsWith(prefix) ? m.body.slice(prefix.length).split(" ")[0].toLowerCase() : "";
    const validCommands = ["fullmenu", "menu2", "listcmd"];

    if (!validCommands.includes(cmd)) return;

    const mode = config.MODE === "public" ? "public" : "private";
    const str = `◈━━━━━━━━━━━━━━━━◈
│❒ *Toxic-MD* Menu 🔥
│❒ 👑 *Owner*: ${config.OWNER_NAME}
│❒ 🤖 *Bot*: ${config.BOT_NAME}
│❒ ⚙️ *Mode*: ${mode}
│❒ 📍 *Prefix*: [${prefix}]
│❒ 🖥️ *Platform*: ${os.platform()}
│❒ 💾 *Memory*: ${formatBytes(freeMemoryBytes)} / ${formatBytes(totalMemoryBytes)}
│❒ ⏰ *Uptime*: ${runMessage}
│❒ 📅 *Date*: ${xdate}
│❒ 🕒 *Time*: ${xtime} (EAT)
│❒ 🌟 ${pushwish}, fam!
◈━━━━━━━━━━━━━━━━◈
◈`;

    let menuImage;
    if (config.MENU_IMAGE && config.MENU_IMAGE.trim() !== "") {
      try {
        const response = await axios.get(config.MENU_IMAGE, { responseType: "arraybuffer" });
        menuImage = Buffer.from(response.data, "binary");
      } catch (error) {
        console.error("Error fetching menu image:", error.message);
        menuImage = fs.readFileSync("./media/fana.jpg");
      }
    } else {
      menuImage = fs.readFileSync("./media/fana.jpg");
    }

    const buttons = [
      {
        name: "cta_message",
        buttonParamsJson: JSON.stringify({
          display_text: "Message me",
          id: "+26777821911",
        }),
      },
      {
        name: "cta_call",
        buttonParamsJson: JSON.stringify({
          display_text: "Call owner",
          id: "+26777821911",
        }),
      },
      {
        name: "cta_url",
        buttonParamsJson: JSON.stringify({
          display_text: "Follow Channel",
          url: `https://whatsapp.com/channel/0029VbAckOZ7tkj92um4KN3u`,
        }),
      },
    ];

    const msg = generateWAMessageFromContent(m.from, {
      viewOnceMessage: {
        message: {
          interactiveMessage: proto.Message.InteractiveMessage.create({
            body: proto.Message.InteractiveMessage.Body.create({
              text: str,
            }),
            footer: proto.Message.InteractiveMessage.Footer.create({
              text: "✆︎Pσɯҽɾҽԃ Ⴆყ NנɐႦυℓσ נႦ",
            }),
            header: proto.Message.InteractiveMessage.Header.create({
              imageMessage: (await prepareWAMessageMedia({ image: menuImage }, { upload: Matrix.waUploadToServer })).imageMessage,
              hasMediaAttachment: true,
            }),
            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
              buttons,
            }),
            contextInfo: {
              mentionedJid: [m.sender],
              forwardingScore: 999,
              isForwarded: true,
              forwardedNewsletterMessageInfo: {
                newsletterJid: "120363398040175935@newsletter",
                newsletterName: "Toxic-MD",
                serverMessageId: 143,
              },
            },
          }),
        },
      },
    }, {});

    await Matrix.relayMessage(msg.key.remoteJid, msg.message, {
      messageId: msg.key.id,
    });

    await Matrix.sendMessage(
      m.from,
      {
        audio: { url: "https://github.com/XdTechPro/KHAN-DATA/raw/refs/heads/main/autovoice/menunew.m4a" },
        mimetype: "audio/mp4",
        ptt: true,
      },
      { quoted: m }
    );
  } catch (error) {
    console.error(`❌ Menu error: ${error.message}`);
    await Matrix.sendMessage(m.from, {
      text: `◈━━━━━━━━━━━━━━━━◈
│❒ *Toxic-MD* hit a snag, fam! Try again! 😈
◈━━━━━━━━━━━━━━━━◈`,
    }, { quoted: m });
  }
};

export default menu;
