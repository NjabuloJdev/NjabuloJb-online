import moment from "moment-timezone";
import axios from "axios";
import config from "../config.cjs";
import pkg from "@whiskeysockets/baileys";
const { generateWAMessageFromContent, proto } = pkg;

// Constants
const prefix = config.PREFIX;
const mode = config.MODE === "public" ? "public" : "private";
const xdate = moment.tz("Africa/Nairobi").format("DD/MM/YYYY");
const xtime = moment.tz("Africa/Nairobi").format("HH:mm:ss");

// Fancy font utility
const toFancyFont = (text, isUpperCase = false) => {
  // ...
};

// Image fetch utility
const fetchMenuImage = async () => {
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
};

const menu = async (m, Matrix) => {
  try {
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(" ")[0].toLowerCase() : "";
    const validCommands = ["menu", "help", "list"];

    if (validCommands.includes(cmd)) {
      const listButton = {
        buttonText: "Select an option",
        sections: [
          {
            title: "Njabulo Jb Menu",
            rows: [
              {
                title: "Channel Menu",
                rowId: "channel-menu",
                description: "Access channel-related features",
              },
              {
                title: "Converter Menu",
                rowId: "converter-menu",
                description: "Convert files and formats",
              },
              {
                title: "AI Menu",
                rowId: "ai-menu",
                description: "Access AI-powered features",
              },
              {
                title: "Tools Menu",
                rowId: "tools-menu",
                description: "Use various tools and utilities",
              },
              {
                title: "Group Menu",
                rowId: "group-menu",
                description: "Manage group settings and features",
              },
              {
                title: "Search Menu",
                rowId: "search-menu",
                description: "Search for information and content",
              },
              {
                title: "Main Menu",
                rowId: "main-menu",
                description: "Access main menu features",
              },
              {
                title: "Owner Menu",
                rowId: "owner-menu",
                description: "Access owner-only features",
              },
              {
                title: "Stalk Menu",
                rowId: "stalk-menu",
                description: "Use stalk-related features",
              },
            ],
          },
        ],
      };

      const menuImage = await fetchMenuImage();

      if (menuImage) {
        await Matrix.sendMessage(
          m.from,
          {
            image: menuImage,
            caption: "Select an option",
            footer: "Njabulo Jb",
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
            text: "Select an option",
            buttonText: listButton.buttonText,
            sections: listButton.sections,
            listType: 1,
          },
          { quoted: m }
        );
      }

      // Handle menu selection
      Matrix.ev.on("messages.upsert", async (update) => {
        if (update.messages[0].listResponseMessage) {
          const rowId = update.messages[0].listResponseMessage.singleSelectReply?.selectedRowId;
          handleMenu(m, Matrix, rowId);
        }
      });
    }
  } catch (error) {
    console.error(`❌ Menu error: ${error.message}`);
  }
};

const handleMenu = async (m, Matrix, rowId) => {
  let menuResponse = "";
  let menuTitle = "";

  switch (rowId) {
    case "channel-menu":
      menuTitle = "Channel Menu";
      menuResponse = `Welcome to the channel menu! You can find various channel-related features here.`;
      break;
    case "converter-menu":
      menuTitle = "Converter Menu";
      menuResponse = `Welcome to the converter menu! You can convert files and formats here.`;
      break;
    case "ai-menu":
      menuTitle = "AI Menu";
      menuResponse = `Welcome to the AI menu! You can access AI-powered features here.`;
      break;
    case "tools-menu":
      menuTitle = "Tools Menu";
      menuResponse = `Welcome to the tools menu! You can find various tools and utilities here.`;
      break;
    case "group-menu":
      menuTitle = "Group Menu";
      menuResponse = `Welcome to the group menu! You can manage group settings and features here.`;
      break;
    case "search-menu":
      menuTitle = "Search Menu";
      menuResponse = `Welcome to the search menu! You can search for information and content here.`;
      break;
    case "main-menu":
      menuTitle = "Main Menu";
      menuResponse = `Welcome to the main menu! You can access main menu features here.`;
      break;
    case "owner-menu":
      menuTitle = "Owner Menu";
      menuResponse = `Welcome to the owner menu! You can access owner-only features here.`;
      break;
    case "stalk-menu":
      menuTitle = "Stalk Menu";
      menuResponse = `Welcome to the stalk menu! You can use stalk-related features here.`;
      break;
    default:
      menuResponse = `Unknown menu option.`;
  }

  const fullResponse = `
${menuResponse}    
*📅 Date*: ${xdate}
*⏰ Time*: ${xtime}
*⚙️ Prefix*: ${prefix}
*🌐 Mode*: ${mode}
`;

  const menuImage = await fetchMenuImage();

  if (menuImage) {
    await Matrix.sendMessage(
      m.from,
      {
        image: menuImage,
        caption: fullResponse,
      },
      { quoted: m }
    );
  } else {
    await Matrix.sendMessage(
      m.from,
      {
        text: fullResponse,
      },
      { quoted: m }
    );
  }
};

export default menu;
