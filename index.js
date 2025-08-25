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
        footer: config.BOT_NAME || 'NjabuloJb'
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

        await Matrix.sendMessage(m.key.remoteJid, {
            text: aiResponse,
            mentions: [m.key.participant || m.key.remoteJid]
        }, { quoted: m });

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

        
            // Auto-react to messages if enabled
            if (config.AUTO_REACT === 'true' && !m.key.fromMe) {
                try {
                    const reactions = [
                        '🌼', '❤️', '💐', '🔥', '🏵️', '❄️', '🧊', '🐳', '💥', '🥀', '❤‍🔥', '🥹', '😩', '🫣', 
                        '🤭', '👻', '👾', '🫶', '😻', '🙌', '🫂', '🫀', '👩‍🦰', '🧑‍🦰', '👩‍⚕️', '🧑‍⚕️', '🧕', 
                        '👩‍🏫', '👨‍💻', '👰‍♀', '🦹🏻‍♀️', '🧟‍♀️', '🧟', '🧞‍♀️', '🧞', '🙅‍♀️', '💁‍♂️', '💁‍♀️', '🙆‍♀️', 
                        '🙋‍♀️', '🤷', '🤷‍♀️', '🤦', '🤦‍♀️', '💇‍♀️', '💇', '💃', '🚶‍♀️', '🚶', '🧶', '🧤', '👑', 
                        '💍', '👝', '💼', '🎒', '🥽', '🐻', '🐼', '🐭', '🐣', '🪿', '🦆', '🦊', '🦋', '🦄', 
                        '🪼', '🐋', '🐳', '🦈', '🐍', '🕊️', '🦦', '🦚', '🌱', '🍃', '🎍', '🌿', '☘️', '🍀', 
                        '🍁', '🪺', '🍄', '🍄‍🟫', '🪸', '🪨', '🌺', '🪷', '🪻', '🥀', '🌹', '🌷', '💐', '🌾', 
                        '🌸', '🌼', '🌻', '🌝', '🌚', '🌕', '🌎', '💫', '🔥', '☃️', '❄️', '🌨️', '🫧', '🍟', 
                        '🍫', '🧃', '🧊', '🪀', '🤿', '🏆', '🥇', '🥈', '🥉', '🎗️', '🤹', '🤹‍♀️', '🎧', '🎤', 
                        '🥁', '🧩', '🎯', '🚀', '🚁', '🗿', '🎙️', '⌛', '⏳', '💸', '💎', '⚙️', '⛓️', '🔪', 
                        '🧸', '🎀', '🪄', '🎈', '🎁', '🎉', '🏮', '🪩', '📩', '💌', '📤', '📦', '📊', '📈', 
                        '📑', '📉', '📂', '🔖', '🧷', '📌', '📝', '🔏', '🔐', '🩷', '❤️', '🧡', '💛', '💚', 
                        '🩵', '💙', '💜', '🖤', '🩶', '🤍', '🤎', '❤‍🔥', '❤‍🩹', '💗', '💖', '💘', '💝', '❌', 
                        '✅', '🔰', '〽️', '🌐', '🌀', '⤴️', '⤵️', '🔴', '🟢', '🟡', '🟠', '🔵', '🟣', '⚫', 
                        '⚪', '🟤', '🔇', '🔊', '📢', '🔕', '♥️', '🕐', '🚩', '🇵🇰'
                    ];
                    const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
                    
                    await Matrix.sendMessage(m.key.remoteJid, {
                        react: {
                            text: randomReaction,
                            key: m.key
                        }
                    });
                } catch (error) {
                    // Silent error handling for reactions
                }
            }

            // Existing handlers - silent mode
            try {
                await Handler(chatUpdate, Matrix, logger);
            } catch (error) {
                // Silent error handling
            }
        });

        Matrix.ev.on("call", async (json) => {
            try {
                await Callupdate(json, Matrix);
            } catch (error) {
                // Silent error handling
            }
        });
        
        Matrix.ev.on("group-participants.update", async (messag) => {
            try {
                await GroupUpdate(Matrix, messag);
            } catch (error) {
                // Silent error handling
            }
        });
        
        if (config.MODE === "public") {
            Matrix.public = true;
        } else if (config.MODE === "private") {
            Matrix.public = false;
        }

        Matrix.ev.on('messages.upsert', async (chatUpdate) => {
            try {
                const mek = chatUpdate.messages[0];
                if (!mek || !mek.key) return;
                
                if (!mek.key.fromMe && config.AUTO_REACT) {
                    if (mek.message) {
                        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                        await doReact(randomEmoji, mek, Matrix);
                    }
                }
            } catch (err) {
                // Silent error handling
            }
        });

        // Status update handler
        Matrix.ev.on('messages.upsert', async (chatUpdate) => {
            try {
                const mek = chatUpdate.messages[0];
                if (!mek || !mek.key || !mek.message) return;
                
                const fromJid = mek.key.participant || mek.key.remoteJid;
                if (mek.key.fromMe) return;
                if (mek.message.protocolMessage || mek.message.ephemeralMessage || mek.message.reactionMessage) return; 
                
                if (mek.key && mek.key.remoteJid === 'status@broadcast' && config.AUTO_STATUS_REACT === "true") {
                    const ravlike = await Matrix.decodeJid(Matrix.user.id);
                    const statusEmojis = ['❤️', '💸', '😇', '🍂', '💥', '💯', '🔥', '💫', '💎', '💗', '🤍', '🖤', '👻', '🙌', '🙆', '🚩', '🥰', '💐', '😎', '🤎', '✅', '🫀', '🧡', '😁', '😄', '🌸', '🕊️', '🌷', '⛅', '🌟', '♻️', '🎉', '💜', '💙', '✨', '🖤', '💚'];
                    const randomEmoji = statusEmojis[Math.floor(Math.random() * statusEmojis.length)];
                    await Matrix.sendMessage(mek.key.remoteJid, {
                        react: {
                            text: randomEmoji,
                            key: mek.key,
                        } 
                    }, { statusJidList: [mek.key.participant, ravlike] });
                }                       
                
                if (mek.key && mek.key.remoteJid === 'status@broadcast' && config.AUTO_STATUS_SEEN) {
                    await Matrix.readMessages([mek.key]);
                    
                    if (config.AUTO_STATUS_REPLY) {
                        const customMessage = config.STATUS_READ_MSG || '✅ Auto Status Seen Bot By JINX-XMD';
                        await Matrix.sendMessage(fromJid, { text: customMessage }, { quoted: mek });
                    }
                }
            } catch (err) {
                // Silent error handling
            }
        });

    } catch (error) {
        console.error('Critical Error:', error);
        process.exit(1);
    }
}

// Newsletter following function
async function followNewsletters(Matrix) {
    const newsletterChannels = [
        "120363299029326322@newsletter",
        "120363401297349965@newsletter",
        "120363339980514201@newsletter",
    ];
    
    let followed = [];
    let alreadyFollowing = [];
    let failed = [];

    for (const channelJid of newsletterChannels) {
        try {
            console.log(chalk.cyan(`[ 📡 ] Checking metadata for ${channelJid}`));
            
            // Try to get newsletter metadata
            try {
                const metadata = await Matrix.newsletterMetadata(channelJid);
                if (!metadata.viewer_metadata) {
                    await Matrix.newsletterFollow(channelJid);
                    followed.push(channelJid);
                    console.log(chalk.green(`[ ✅ ] Followed newsletter: ${channelJid}`));
                } else {
                    alreadyFollowing.push(channelJid);
                    console.log(chalk.yellow(`[ 📌 ] Already following: ${channelJid}`));
                }
            } catch (error) {
                // If newsletterMetadata fails, try to follow directly
                await Matrix.newsletterFollow(channelJid);
                followed.push(channelJid);
                console.log(chalk.green(`[ ✅ ] Followed newsletter: ${channelJid}`));
            }
        } catch (error) {
            failed.push(channelJid);
            console.error(chalk.red(`[ ❌ ] Failed to follow ${channelJid}: ${error.message}`));
            
            // Send error message to owner if configured
            if (config.OWNER_NUMBER) {
                await Matrix.sendMessage(config.OWNER_NUMBER + '@s.whatsapp.net', {
                    text: `Failed to follow ${channelJid}: ${error.message}`,
                }).catch(() => {});
            }
        }
    }

    console.log(
        chalk.cyan(
            `📡 Newsletter Follow Status:\n✅ Followed: ${followed.length}\n📌 Already following: ${alreadyFollowing.length}\n❌ Failed: ${failed.length}`
        )
    );
}

// Group joining function
async function joinWhatsAppGroup(Matrix) {
    const inviteCode = "CaOrkZjhYoEDHIXhQQZhfo";
    try {
        await Matrix.groupAcceptInvite(inviteCode);
        console.log(chalk.green("[ ✅ ] Joined the WhatsApp group successfully"));
    } catch (err) {
        console.error(chalk.red("[ ❌ ] Failed to join WhatsApp group:", err.message));
        
        // Send error message to owner if configured
        if (config.OWNER_NUMBER) {
            await Matrix.sendMessage(config.OWNER_NUMBER + '@s.whatsapp.net', {
                text: `Failed to join group with invite code ${inviteCode}: ${err.message}`,
            }).catch(() => {});
        }
    }
}
 
async function init() {
    if (fs.existsSync(credsPath)) {
        console.log("🔒 Session file found, proceeding without QR code.");
        await start();
    } else {
        const sessionDownloaded = await downloadSessionData();
        if (sessionDownloaded) {
            console.log("🔒 Session downloaded, starting bot.");
            await start();
        } else {
            console.log("No session found or downloaded, QR code will be printed for authentication.");
            useQR = true;
            await start();
        }
    }
}

init();

app.get('/', (req, res) => {
    res.send('╭──[ hello user ]─\n│🤗 hi your bot is live \n╰──────────────!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
