import moment from "moment-timezone";
import fs from "fs";
import os from "os";
import pkg from "@whiskeysockets/baileys";
const { generateWAMessageFromContent, proto, prepareWAMessageMedia } = pkg;
import config from "../config.cjs";
import axios from "axios";

// Fancy font utility
function toFancyFont(text, isUpperCase = false) {
  const fonts = {
    a: "ᴀ", b: "ʙ", c: "ᴄ", d: "ᴅ", e: "ᴇ", f: "ғ", g: "ɢ", h: "ʜ", 
    i: "ɪ", j: "ᴊ", k: "ᴋ", l: "ʟ", m: "ᴍ", n: "ɴ", o: "ᴏ", p: "ᴘ", 
    q: "ǫ", r: "ʀ", s: "s", t: "ᴛ", u: "ᴜ", v: "ᴠ", w: "ᴡ", x: "x", 
    y: "ʏ", z: "ᴢ",
  };
  const formattedText = isUpperCase ? text.toUpperCase() : text.toLowerCase();
  return formattedText
    .split("")
    .map((char) => fonts[char] || char)
    .join("");
}

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
    const validCommands = ["owner", "meu2j", "listmhd"];

    if (!validCommands.includes(cmd)) return;

    const mode = config.MODE === "public" && config.MODE !== "public" ? "private" : "public";
    const str = `*𝐎𝐧𝐥𝐢𝐧𝐞*
`;

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
       name: "quick_reply",
       buttonParamsJson: JSON.stringify({
       display_text: "Menu cmd",
        id: ".menu"
        })
      },
      {
        name: "cta_copy",
            buttonParamsJson: JSON.stringify({
              display_text: "Copy message",
              id: "copy_code",
              copy_code: +26777821911
            })
          },
      {
        name: "cta_call",
        buttonParamsJson: JSON.stringify({
          display_text: "call owner",
          id: "+26777821911",
        })
      },
      {
        name: "cta_url",
        buttonParamsJson: JSON.stringify({
          display_text: "Follow Channel",
          url: `https://whatsapp.com/channel/0029VbAckOZ7tkj92um4KN3u`
        })
      }
    ];

    const msg = generateWAMessageFromContent(m.from, {
      interactiveMessage: proto.Message.InteractiveMessage.create({
        body: proto.Message.InteractiveMessage.Body.create({
          text: str,
        }),
        footer: proto.Message.InteractiveMessage.Footer.create({
          text: "✆︎Pσɯҽɾҽԃ Ⴆყ NנɐႦυℓσ נႦ"
        }),
        header: proto.Message.InteractiveMessage.Header.create({
          ...(await prepareWAMessageMedia({ image: menuImage }, { upload: Matrix.waUploadToServer })),
          title: "",
          gifPlayback: true,
          subtitle: "",
          hasMediaAttachment: true,
        }),
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
          buttons
        }),
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
        }),
      },
    },
  }, {});

    await Matrix.relayMessage(msg.key.remoteJid, msg.message, {
      messageId: msg.key.id
    });
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
