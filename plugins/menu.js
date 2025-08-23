import moment from "moment-timezone";
import fs from "fs";
import os from "os";
import config from "../config.cjs";
import pkg, { prepareWAMessageMedia } from "@whiskeysockets/baileys";
const { generateWAMessageFromContent, proto } = pkg;
import axios from "axios";

// Time logic
const xtime = moment.tz("Africa/Nairobi").format("HH:mm:ss");
const xdate = moment.tz("Africa/Nairobi").format("DD/MM/YYYY");
const time2 = moment().tz("Africa/Nairobi").format("HH:mm:ss");
let pushwish = "";

if (time2 < "05:00:00") {
  pushwish = `Good Morning 🌄`;
} else if (time2 < "11:00:00") {
  pushwish = `Good Morning 🌄`;
} else if (time2 < "15:00:00") {
  pushwish = `Good Afternoon 🌅`;
} else if (time2 < "18:00:00") {
  pushwish = `Good Evening 🌃`;
} else if (time2 < "19:00:00") {
  pushwish = `Good Evening 🌃`;
} else {
  pushwish = `Good Night 🌌`;
}

// Fancy font utility
function toFancyFont(text, isUpperCase = false) {
  const fonts = {
    A: "𝘼",
    B: "𝘽",
    C: "𝘾",
    D: "𝘿",
    E: "𝙀",
    F: "𝙁",
    G: "𝙂",
    H: "𝙃",
    I: "𝙄",
    J: "𝙅",
    K: "𝙆",
    L: "𝙇",
    M: "𝙈",
    N: "𝙉",
    O: "𝙊",
    P: "𝙋",
    Q: "𝙌",
    R: "𝙍",
    S: "𝙎",
    T: "𝙏",
    U: "𝙐",
    V: "𝙑",
    W: "𝙒",
    X: "𝙓",
    Y: "𝙔",
    Z: "𝙕",
    a: "𝙖",
    b: "𝙗",
    c: "𝙘",
    d: "𝙙",
    e: "𝙚",
    f: "𝙛",
    g: "𝙜",
    h: "𝙝",
    i: "𝙞",
    j: "𝙟",
    k: "𝙠",
    l: "𝙡",
    m: "𝙢",
    n: "𝙣",
    o: "𝙤",
    p: "𝙥",
    q: "𝙦",
    r: "𝙧",
    s: "𝙨",
    t: "𝙩",
    u: "𝙪",
    v: "𝙫",
    w: "𝙬",
    x: "𝙭",
    y: "𝙮",
    z: "𝙯",
  };
  const formattedText = isUpperCase ? text.toUpperCase() : text.toLowerCase();
  return formattedText
    .split("")
    .map((char) => fonts[char] || char)
    .join("");
}

// Image fetch utility
async function fetchMenuImage() {
  const imageUrl = "https://files.catbox.moe/y2utve.jpg";
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

    const validCommands = ["list", "help", "menu"];
    const subMenuCommands = [
      "download-menu",
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
◈━━━━━━━━━━━━━━━━◈
│❒ ${toFancyFont("Toxic-MD")} Command Menu ⚠
│
│ 🤖 *${toFancyFont("Bot")}*: ${toFancyFont("Toxic-MD")}
│ 📋 *${toFancyFont("Total Commands")}*: ${totalCommands}
│ 🔣 *${toFancyFont("Prefix")}*: ${prefix}
│ 🌐 *${toFancyFont("Mode")}*: ${mode}
│ 📚 *${toFancyFont("Library")}*: Baileys
◈━━━━━━━━━━━━━━━━◈

${pushwish} @*${m.pushName}*! Select a menu category:

> Pσɯҽɾҽԃ Ⴆყ Tσxιƈ-ɱԃȥ
`;

      const listButton = {
        buttonText: "Select a menu",
        sections: [
          {
            title: "Menu Categories",
            rows: [
              {
                title: "Download",
                rowId: `${prefix}download-menu`,
                description: "Download menu",
              },
              {
                title: "Converter",
                rowId: `${prefix}converter-menu`,
                description: "Converter menu",
              },
              {
                title: "AI",
                rowId: `${prefix}ai-menu`,
                description: "AI menu",
              },
              {
                title: "Tools",
                rowId: `${prefix}tools-menu`,
                description: "Tools menu",
              },
              {
                title: "Group",
                rowId: `${prefix}group-menu`,
                description: "Group menu",
              },
              {
                title: "Search",
                rowId: `${prefix}search-menu`,
                description: "Search menu",
              },
              {
                title: "Main",
                rowId: `${prefix}main-menu`,
                description: "Main menu",
              },
              {
                title: "Owner",
                rowId: `${prefix}owner-menu`,
                description: "Owner menu",
              },
              {
                title: "Stalk",
                rowId: `${prefix}stalk-menu`,
                description: "Stalk menu",
              },
            ],
          },
        ],
      };

      // Send menu with or without image
      if (menuImage) {
        await Matrix.sendMessage(
          m.from,
          {
            image: menuImage,
            caption: mainMenu,
            buttonText: listButton.buttonText,
            sections: listButton.sections,
            listType: 1,
          },
          { quoted: m }
        );
      } else {
        await Matrix.sendMessage(
          m.from,
          {
            text: mainMenu,
            buttonText: listButton.buttonText,
            sections: listButton.sections,
            listType: 1,
          },
          { quoted: m }
        );
      }

      Matrix.ev.on("messages.upsert", async (update) => {
        const msg = update.messages[0];
        if (msg.key.remoteJid === m.from && msg.listResponseMessage) {
          const selectedOption = msg.listResponseMessage.singleSelectReply.selectedRowId;
          if (selectedOption) {
            await Matrix.sendMessage(m.from, { text: `You selected: ${selectedOption}` });
            // Call the corresponding menu function
            await handleMenu(m, Matrix, selectedOption);
          }
        }
      });
    }
  } catch (error) {
    console.error(`❌ Menu error: ${error.message}`);
    await Matrix.sendMessage(m.from, {
      text: `◈━━━━━━━━━━━━━━━━◈
│❒ *Toxic-MD* hit a snag! Error: ${error.message || "Failed to load menu"} 😡
◈━━━━━━━━━━━━━━━━◈`,
    }, { quoted: m });
  }
};

const handleMenu = async (m, Matrix, selectedOption) => {
  try {
    // Handle sub-menu commands
    let menuTitle;
    let menuResponse;

    switch (selectedOption) {
      case `${config.PREFIX}download-menu`:
        menuTitle = "Download";
        menuResponse = `
◈━━━━━━━━━━━━━━━━◈
│❒ ${toFancyFont("Download")} 📥
│ ✘ *${toFancyFont("apk")}*
│ ✘ *${toFancyFont("facebook")}*
│ ✘ *${toFancyFont("mediafire")}*
│ ✘ *${toFancyFont("pinters")}*
│ ✘ *${toFancyFont("gitclone")}*
│ ✘ *${toFancyFont("gdrive")}*
│ ✘ *${toFancyFont("insta")}*
│ ✘ *${toFancyFont("ytmp3")}*
│ ✘ *${toFancyFont("ytmp4")}*
│ ✘ *${toFancyFont("play")}*
│ ✘ *${toFancyFont("song")}*
│ ✘ *${toFancyFont("video")}*
│ ✘ *${toFancyFont("ytmp3doc")}*
│ ✘ *${toFancyFont("ytmp4doc")}*
│ ✘ *${toFancyFont("tiktok")}*
◈━━━━━━━━━━━━━━━━◈
`;
        break;

      // Add more cases for other menus...

      default:
        return;
    }

    // Format the full response
    const fullResponse = `
◈━━━━━━━━━━━━━━━━◈
│❒ ${toFancyFont("Toxic-MD")} - ${toFancyFont(menuTitle)} ⚠
│
│ 🤖 *${toFancyFont("Bot")}*: ${toFancyFont("Toxic-MD")}
│ 👤 *${toFancyFont("User")}*: ${m.pushName}
│ 🔣 *${toFancyFont("Prefix")}*: ${config.PREFIX}
│ 📚 *${toFancyFont("Library")}*: Baileys
◈━━━━━━━━━━━━━━━━◈

${menuResponse}

> Pσɯҽɾҽԃ Ⴆყ Tσxιƈ-ɱԃȥ
`;

    await Matrix.sendMessage(m.from, { text: fullResponse });
  } catch (error) {
    console.error(`❌ Menu error: ${error.message}`);
  }
};

export default menu;