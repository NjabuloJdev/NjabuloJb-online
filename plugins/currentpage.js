import moment from "moment-timezone";
import fs from "fs";
import os from "os";
import pkg from "@whiskeysockets/baileys";
const { generateWAMessageFromContent, proto } = pkg;
import config from "../config.cjs";
import axios from "axios";

// Time logic

const uptime = process.uptime();
const day = Math.floor(uptime / (24 * 3600));
const hours = Math.floor((uptime % (24 * 3600)) / 3600);
const minutes = Math.floor((uptime % 3600) / 60);
const seconds = Math.floor(uptime % 60);
const uptimeMessage = `*I’ve been grindin’ for ${day}d ${hours}h ${minutes}m ${seconds}s* 🕒`;
const runMessage = `*${day} Day ${hours} Hour ${minutes} Min ${seconds} Sec*`;

const xtime = moment.tz("Africa/Nairobi").format("HH:mm:ss");
const xdate = moment.tz("Africa/Nairobi").format("DD/MM/YYYY");
const time2 = moment().tz("Africa/Nairobi").format("HH:mm:ss");
let pushwish = "";

if (time2 < "05:00:00") {
  pushwish = `🌄Good Morning`;
} else if (time2 < "11:00:00") {
  pushwish = `🌄Good Morning`;
} else if (time2 < "15:00:00") {
  pushwish = `🌅Good Afternoon`;
} else if (time2 < "18:00:00") {
  pushwish = `🌃Good Evening`;
} else if (time2 < "19:00:00") {
  pushwish = `🌃Good Evening`;
} else {
  pushwish = `🌌Good Night`;
}

// Fancy font utility
function toFancyFont(text, isUpperCase = false) {
  const fonts = {
    // fonts here
  };
  const formattedText = isUpperCase ? text.toUpperCase() : text.toLowerCase();
  return formattedText
    .split("")
    .map((char) => fonts[char] || char)
    .join("");
}

// Image fetch utility
async function fetchMenuImage() {
  const imageUrl = "https://files.catbox.moe/w2mkty.jpg";
  for (let i = 0; i < 3; i++) {
    try {
      const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
      return Buffer.from(response.data, "binary");
    } catch (error) {
      if (error.response?.status === 429 && i < 2) {
        console.log(`Rate limit hit, retrying in 2s...`);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        continue;
      }
      console.error("❌ Failed to fetch image:", error);
      return null;
    }
  }
}

let currentPage = 1;
const menuItemsPerPage = 5;
const menuItems = [
  "Menu Item 1",
  "Menu Item 2",
  "Menu Item 3",
  "Menu Item 4",
  "Menu Item 5",
  "Menu Item 6",
  "Menu Item 7",
  "Menu Item 8",
  "Menu Item 9",
  "Menu Item 10",
];

const getMenuItems = () => {
  const start = (currentPage - 1) * menuItemsPerPage;
  const end = start + menuItemsPerPage;
  return menuItems.slice(start, end).map((item, index) => `${start + index + 1}. ${item}`).join("\n");
};

const menu = async (m, Matrix) => {
  try {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(" ")[0].toLowerCase() : "";
    const mode = config.MODE === "public" ? "public" : "private";
    const totalCommands = 70;

    const validCommands = ["repo", "script", "sc"];
    const subMenuCommands = [
      "channel-menu",
      "converter-menu",
      "ai-menu",
      "tools-menu",
      "group-menu",
      "search-menu",
      "main-menu",
      "owner-menu",
      "stalk-menu",
    ];

    // Fetch image for all cases
    const menuImage = await fetchMenuImage();

    // Handle main menu
    if (validCommands.includes(cmd)) {
      const mainMenu = `
┌─❖
│ Njabulo Jb    
└┬❖  
┌┤  ${pushwish} 
│└────────┈  
│🕵️ ᴜsᴇʀ ɴᴀᴍᴇ: *${m.pushName}*
│📅 ᴅᴀᴛᴇ: *${xdate}*
│⏰ ᴛɪᴍᴇ: *${xtime}*     
│⭐ ᴜᴘᴛɪᴍᴇ: ${runMessage}      
└─────────────┈

Current Page: ${currentPage}
${getMenuItems()}
`;

      const messageOptions = {
        viewOnce: true,
        buttons: [
          { buttonId: `${prefix}scroll-left`, buttonText: { displayText: ` Scroll Left` }, type: 1 },
          { buttonId: `${prefix}scroll-right`, buttonText: { displayText: ` Scroll Right` }, type: 1 },
          { buttonId: `${prefix}ai-menu`, buttonText: { displayText: ` AI-Menu` }, type: 1 },
          { buttonId: `${prefix}download`, buttonText: { displayText: ` Download` }, type: 1 },
        ],
         contextInfo: {
         mentionedJid: [m.sender],
           forwardingScore: 999,
           isForwarded: true,
           forwardedNewsletterMessageInfo: {
           newsletterJid: '120363399999197102@newsletter',
           newsletterName: "╭••➤®Njabulo Jb",
           serverMessageId: 143
          },
        },
      };

      // Send menu with or without image
      if (menuImage) {
        await Matrix.sendMessage(m.from,{ 
            image: menuImage,
          caption: mainMenu,
          ...messageOptions
          }, { quoted: {
            key: {
                fromMe: false,
                participant: `0@s.whatsapp.net`,
                remoteJid: "status@broadcast"
            },
            message: {
                contactMessage: {
                    displayName: "✆︎NנɐႦυℓσ נႦ verified",
                    vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Njabulo-Jb;BOT;;;\nFN:Njabulo-Jb\nitem1.TEL;waid=254700000000:+254 700 000000\nitem1.X-ABLabel:Bot\nEND:VCARD`
                }
            }
        } });
      } else {
        await Matrix.sendMessage(m.from, { text: mainMenu, ...messageOptions }, { quoted: m });
      }

      // Send audio as a voice note
      await Matrix.sendMessage(m.from,{ 
          audio: { url: "https://files.catbox.moe/mflouf.mp3" },
          mimetype: "audio/mp4", ptt: true
          }, { quoted: {
            key: {
                fromMe: false,
                participant: `0@s.whatsapp.net`,
                remoteJid: "status@broadcast"
            },
            message: {
                contactMessage: {
                    displayName: "✆︎NנɐႦυℓσ נႦ verified",
                    vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Njabulo-Jb;BOT;;;\nFN:Njabulo-Jb\nitem1.TEL;waid=254700000000:+254 700 000000\nitem1.X-ABLabel:Bot\nEND:VCARD`
                }
            }
        } });
     }

    // Handle button clicks
    if (m.type === 'button') {
      const buttonId = m.buttonId;

      if (buttonId === `${prefix}scroll-left`) {
        currentPage--;
        if (currentPage < 1) {
          currentPage = 1;
        }
        const mainMenu = `
┌─❖
│ Njabulo Jb    
└┬❖  
┌┤  ${pushwish} 
│└────────┈  
│🕵️ ᴜsᴇʀ ɴᴀᴍᴇ: *${m.pushName}*
│📅 ᴅᴀᴛᴇ: *${xdate}*
│⏰ ᴛɪᴍᴇ: *${xtime}*     
│⭐ ᴜᴘᴛɪᴍᴇ: ${runMessage}      
└─────────────┈

Current Page: ${currentPage}
${getMenuItems()}
`;
        await Matrix.sendMessage(m.from, { text: mainMenu });
      } else if (buttonId === `${prefix}scroll-right`) {
        currentPage++;
        const totalPages = Math.ceil(menuItems.length / menuItemsPerPage);
        if (currentPage > totalPages) {
          currentPage = totalPages;
        }
        const mainMenu = `
┌─❖
│ Njabulo Jb    
└┬❖  
┌┤  ${pushwish} 
│└────────┈  
│🕵️ ᴜsᴇʀ ɴᴀᴍᴇ: *${m.pushName}*
│📅 ᴅᴀᴛᴇ: *${xdate}*
│⏰ ᴛɪᴍᴇ: *${xtime}*     
│⭐ ᴜᴘᴛɪᴍᴇ: ${runMessage}      
└─────────────┈

Current Page: ${currentPage}
${getMenuItems()}
`;
        await Matrix.sendMessage(m.from, { text: mainMenu });
      } else if (buttonId === `${prefix}ai-menu`) {
        // AI menu logic here
      } else if (buttonId === `${prefix}download`) {
        // Download logic here
      }
    }
  } catch (error) {
    console.error(`❌ Menu error: ${error.message}`);
    await Matrix.sendMessage(m.from, {
      text: `•
• *Njabulo Jb* hit a snag! Error: ${error.message || "Failed to load menu"} 😡
•`,
    }, { quoted: m });
  }
};

export default menu;
