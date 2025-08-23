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

if (time2 < "05:00:00" || time2 < "11:00:00") {
  pushwish = `🌄Good Morning`;
} else if (time2 < "15:00:00") {
  pushwish = `🌅Good Afternoon`;
} else if (time2 < "19:00:00") {
  pushwish = `🌃Good Evening`;
} else {
  pushwish = `🌌Good Night`;
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

const menu = async (m, Matrix) => {
  try {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(" ")[0].toLowerCase() : "";
    const mode = config.MODE === "public" ? "public" : "private";
    const totalCommands = 70;
    
    const listButton = {
      buttonText: "Select an option",
      sections: [
        {
          title: "Njabulo Jb Menu",
          rows: [
            {
              title: "Main Menu",
              rowId: `${prefix}menu`,
              description: "View main menu",
            },
            {
              title: "AI Menu",
              rowId: `${prefix}ai-menu`,
              description: "View AI menu",
            },
            {
              title: "Tools Menu",
              rowId: `${prefix}tools-menu`,
              description: "View tools menu",
            },
            {
              title: "Group Menu",
              rowId: `${prefix}group-menu`,
              description: "View group menu",
            },
            {
              title: "Search Menu",
              rowId: `${prefix}search-menu`,
              description: "View search menu",
            },
          ],
        },
      ],
    };

    const menuImage = await fetchMenuImage();

    if (cmd === "menu") {
      await Matrix.sendMessage(
        m.from,
        {
          text: `
┌─❖
│ Njabulo Jb    
└┬❖  
┌┤  ${pushwish} 
│└────────┈⳹  
│🕵️ ᴜsᴇʀ ɴᴀᴍᴇ: *${m.pushName}*
│📅 ᴅᴀᴛᴇ: *${xdate}*
│⏰ ᴛɪᴍᴇ: *${xtime}*     
│⭐ ᴜᴘᴛɪᴍᴇ: ${runMessage}      
└─────────────┈⳹`,
          buttonText: listButton.buttonText,
          sections: listButton.sections,
          listType: 1,
        },
        { quoted: m }
      );
    } else if (cmd === "ai-menu") {
      const aiMenu = `
      AI Menu
*📅 Date*: ${xdate}
*⏰ Time*: ${xtime}
*⚙️ Prefix*: ${prefix}
*🌐 Mode*: ${mode}
      `;
      await Matrix.sendMessage(m.from, { text: aiMenu }, { quoted: m });
    } else if (cmd === "tools-menu") {
      const toolsMenu = `
      Tools Menu
*📅 Date*: ${xdate}
*⏰ Time*: ${xtime}
*⚙️ Prefix*: ${prefix}
*🌐 Mode*: ${mode}
      `;
      await Matrix.sendMessage(m.from, { text: toolsMenu }, { quoted: m });
    } else if (cmd === "group-menu") {
      const groupMenu = `
      Group Menu
*📅 Date*: ${xdate}
*⏰ Time*: ${xtime}
*⚙️ Prefix*: ${prefix}
*🌐 Mode*: ${mode}
      `;
      await Matrix.sendMessage(m.from, { text: groupMenu }, { quoted: m });
    } else if (cmd === "search-menu") {
      const searchMenu = `
      Search Menu
*📅 Date*: ${xdate}
*⏰ Time*: ${xtime}
*⚙️ Prefix*: ${prefix}
*🌐 Mode*: ${mode}
      `;
      await Matrix.sendMessage(m.from, { text: searchMenu }, { quoted: m });
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
