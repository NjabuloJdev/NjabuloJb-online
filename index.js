import dotenv from 'dotenv';
dotenv.config();

import {
    makeWASocket,
    Browsers,
    fetchLatestBaileysVersion,
    DisconnectReason,
    useMultiFileAuthState,
    getContentType
} from '@whiskeysockets/baileys';
import { Handler, Callupdate, GroupUpdate } from './data/index.js';
import express from 'express';
import pino from 'pino';
import fs from 'fs';
import NodeCache from 'node-cache';
import path from 'path';
import chalk from 'chalk';
import moment from 'moment-timezone';
import axios from 'axios';
import config from './config.cjs';
import pkg from './lib/autoreact.cjs';
const { emojis, doReact } = pkg;

// Chatbot Configuration
let CHATBOT_ENABLED = true; // Default state
const GROQ_API_URL = 'https://api.giftedtech.co.ke/api/ai/groq-beta?apikey=gifted';
const chatbotCache = new NodeCache({ stdTTL: 60, checkperiod: 120 }); // Cache for 1 minute

const prefix = process.env.PREFIX || config.PREFIX;
const sessionName = "session";
const app = express();
const orange = chalk.bold.hex("#FFA500");
const lime = chalk.bold.hex("#32CD32");
let useQR = false;
let initialConnection = true;
const PORT = process.env.PORT || 3000;

const MAIN_LOGGER = pino({
    timestamp: () => `,"time":"${new Date().toJSON()}"`
});
const logger = MAIN_LOGGER.child({});
logger.level = "trace";

const msgRetryCounterCache = new NodeCache();

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

const sessionDir = path.join(__dirname, 'session');
const credsPath = path.join(sessionDir, 'creds.json');

if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
}

// Chatbot Functions
async function handleChatbotToggle(m, Matrix) {
    const buttons = [
        {
            buttonId: 'enable_chatbot',
            buttonText: { displayText: CHATBOT_ENABLED ? '❌ Disable' : '✅ Enable' },
            type: 1
        },
        {
            buttonId: 'chatbot_status',
            buttonText: { displayText: '📊 Status' },
            type: 1
        }
    ];

    await Matrix.sendMessage(m.key.remoteJid, {
        text: `🤖 *Chatbot Status:* ${CHATBOT_ENABLED ? '🟢 ACTIVE' : '🔴 DISABLED'}\n\n_Powered by Groq AI_`,
        buttons,
        footer: config.BOT_NAME || 'Mercedes'
    }, { quoted: m });
}

async function handleChatbotResponse(m, Matrix) {
    try {
        const messageText = m.message?.conversation || 
                          m.message?.extendedTextMessage?.text || 
                          '';
        
        if (!messageText || messageText.startsWith(prefix)) return;

        // Check cache to avoid duplicate processing
        if (chatbotCache.has(m.key.id)) return;
        chatbotCache.set(m.key.id, true);

        await Matrix.sendPresenceUpdate('composing', m.key.remoteJid);
        
        const response = await axios.get(`${GROQ_API_URL}&q=${encodeURIComponent(messageText)}`);
        const aiResponse = response.data?.result || "I couldn't process that request.";
       const listButton = {
      buttonText: "Select an option",
      sections: [
        {
          title: "Njabulo Jb menu info",
          rows: [
            {
              title: "Ai",
              rowId: ".ai",
              description: "AI ask",
            },
            {
              title: "gpt",
              rowId: ".gpt",
              description: "gpt chat",
            },
            {
              title: "Gemini",
              rowId: ".gemini",
              description: "gemini question ",
            },
          ],
        },
      ],
    };

    await Matrix.sendMessage(m.key.remoteJid, {
      m.from,
      {
        text: aiResponse,
        mentions: [m.key.participant || m.key.remoteJid],
        buttonText: listButton.buttonText,
        sections: listButton.sections,
        listType: 1,
      },
      { quoted: m }
    );
    }


    } catch (error) {
        console.error('Chatbot error:', error);
        // Optionally send an error message
        // await Matrix.sendMessage(m.key.remoteJid, { text: "⚠️ Error processing your message" });
    }
}

async function authentification() {
    try {
        const session = process.env.SESSION_ID || config.SESSION_ID;
        
        if (!session) {
            console.log("No session provided, QR code will be used");
            return false;
        }

        if (!fs.existsSync(credsPath)) {
            console.log("Creating session file...");
            await fs.promises.writeFile(credsPath, atob(session), "utf8");
            console.log("🔒 Session file created successfully!");
            return true;
        }
        else if (fs.existsSync(credsPath)) {
            console.log("🔒 Using existing session file");
            return true;
        }
    }
    catch (e) {
        console.log("❌ Session Invalid: " + e);
        return false;
    }
}

async function start() {
    try {
        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
        const { version, isLatest } = await fetchLatestBaileysVersion();
        console.log(`🤖 JAWAD-MD using WA v${version.join('.')}, isLatest: ${isLatest}`);
        
        const Matrix = makeWASocket({
            version,
            logger: pino({ level: 'silent' }),
            printQRInTerminal: useQR,
            browser: ["JAWAD-MD", "safari", "3.3"],
            auth: state,
            getMessage: async (key) => {
                return { conversation: "JAWAD-MD whatsapp user bot" };
            }
        });

        Matrix.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === 'close') {
                if (lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut) {
                    start();
                }
            } else if (connection === 'open') {
                if (initialConnection) {
                    console.log(chalk.green("Connected Successfully NjabuloJb-elite 🤍"));
                    Matrix.sendMessage(Matrix.user.id, { 
                        image: { url: "https://files.catbox.moe/li4olg.jpg" }, 
                        caption: `┏──────────────⊷
┊ ɴᴀᴍᴇ :  *Mercedes*
┊ ᴠᴇʀsɪᴏɴ : *2 ʙᴇᴛᴀ*
┗──────────────⊷
┏           
【 *Device online* 】
┗
┏──────────────⊷
┊ *[Mercedes connected]*
┗──────────────⊷`
                    });
                    initialConnection = false;
                } else {
                    console.log(chalk.blue("♻️ Connection reestablished after restart."));
                }
            }
        });
        
        Matrix.ev.on('creds.update', saveCreds);

        // Enhanced messages.upsert handler
        Matrix.ev.on("messages.upsert", async (chatUpdate) => {
            const m = chatUpdate.messages[0];
            if (!m.message) return;

            // Handle chatbot toggle command
            if (m.message.conversation?.toLowerCase() === prefix + 'chatbot') {
                await handleChatbotToggle(m, Matrix);
                return;
            }

            // Handle button responses
            if (m.message.buttonsResponseMessage) {
                const selected = m.message.buttonsResponseMessage.selectedButtonId;
                if (selected === 'enable_chatbot') {
                    CHATBOT_ENABLED = !CHATBOT_ENABLED;
                    await Matrix.sendMessage(m.key.remoteJid, { 
                        text: `Chatbot ${CHATBOT_ENABLED ? 'ENABLED ✅' : 'DISABLED ❌'}` 
                    });
                    return;
                }
            }

            // Process chatbot responses if enabled
            if (CHATBOT_ENABLED && !m.key.fromMe) {
                await handleChatbotResponse(m, Matrix);
            }

            // Existing handlers
            await Handler(chatUpdate, Matrix, logger);
        });

        Matrix.ev.on("call", async (json) => await Callupdate(json, Matrix));
        Matrix.ev.on("group-participants.update", async (messag) => await GroupUpdate(Matrix, messag));

        if (config.MODE === "public") {
            Matrix.public = true;
        } else if (config.MODE === "private") {
            Matrix.public = false;
        }

        // Auto Reaction to chats
        Matrix.ev.on('messages.upsert', async (chatUpdate) => {
            try {
                const mek = chatUpdate.messages[0];
                if (!mek.key.fromMe && config.AUTO_REACT) {
                    if (mek.message) {
                        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                        await doReact(randomEmoji, mek, Matrix);
                    }
                }
            } catch (err) {
                console.error('Error during auto reaction:', err);
            }
        });

        // Auto Like Status and Mark as Viewed
        Matrix.ev.on('messages.upsert', async (chatUpdate) => {
            try {
                const mek = chatUpdate.messages[0];
                if (!mek || !mek.message) return;

                const contentType = getContentType(mek.message);
                mek.message = (contentType === 'ephemeralMessage')
                    ? mek.message.ephemeralMessage.message
                    : mek.message;

                if (mek.key.remoteJid === 'status@broadcast' && config.AUTO_STATUS_REACT === "true") {
                    const jawadlike = await Matrix.decodeJid(Matrix.user.id);
                    const emojiList = ['❤️', '💸', '😇', '🍂', '💥', '💯', '🔥', '💫', '💎', '💗', '🤍', '🖤', '👀', '🙌', '🙆', '🚩', '🥰', '💐', '😎', '🤎', '✅', '🫀', '🧡', '😁', '😄', '🌸', '🕊️', '🌷', '⛅', '🌟', '🗿', '🇵🇰', '💜', '💙', '🌝', '💚'];
                    const randomEmoji = emojiList[Math.floor(Math.random() * emojiList.length)];

                    await Matrix.readMessages([mek.key]);
                    
                    await Matrix.sendMessage(mek.key.remoteJid, {
                        react: {
                            text: randomEmoji,
                            key: mek.key,
                        }
                    }, { statusJidList: [mek.key.participant, jawadlike] });

                    console.log(`✓ Viewed and reacted to status with: ${randomEmoji}`);
                }
            } catch (err) {
                console.error("✗ Auto Like Status Error:", err);
            }
        });

        // Status Seen and Reply
        Matrix.ev.on('messages.upsert', async (chatUpdate) => {
            try {
                const mek = chatUpdate.messages[0];
                const fromJid = mek.key.participant || mek.key.remoteJid;
                if (!mek || !mek.message) return;
                if (mek.key.fromMe) return;
                if (mek.message?.protocolMessage || mek.message?.ephemeralMessage || mek.message?.reactionMessage) return; 
                if (mek.key && mek.key.remoteJid === 'status@broadcast' && config.AUTO_STATUS_SEEN) {
                    await Matrix.readMessages([mek.key]);
                    
                    if (config.AUTO_STATUS_REPLY) {
                        const customMessage = config.STATUS_READ_MSG || '🥀Yo, caught your status. Straight-up savage!"';
            
                    const listButton = {
      buttonText: "Select an option",
      sections: [
        {
          title: "Njabulo Jb Menu",
          rows: [
            {
              title: "status",
              rowId: ".status beautiful",
              description: "❤️Damn, that status tho! You out here wildin’!",
            },
            {
              title: "hallo",
              rowId: ".hallo my friend",
              description: "🥀Yo, caught your status. Straight-up savage!",
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
            
    await Matrix.sendMessage(fromJid,{
        text: customMessage,
        buttonText: listButton.buttonText,
        sections: listButton.sections,
        listType: 1,
      },{ quoted: mek });
          
                    }
                }
            } catch (err) {
                console.error('Error handling messages.upsert event:', err);
            }
        });

    } catch (error) {
        console.error('Critical Error:', error);
        process.exit(1);
    }
}

async function init() {
    const sessionExists = fs.existsSync(credsPath);
    const sessionAvailable = await authentification();
    
    if (sessionExists || sessionAvailable) {
        console.log("🔒 Session available, starting bot...");
        await start();
    } else {
        console.log("No session available, QR code will be printed for authentication.");
        useQR = true;
        await start();
    }
}

init();

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
