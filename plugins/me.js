import config from "../config.cjs";
import { proto } from '@whiskeysockets/baileys';
import fs from 'fs';
import { prepareWAMessageMedia } from '@whiskeysockets/baileys';

const alive = async (m, Matrix) => {
  try {
    const uptimeSeconds = process.uptime();
    const days = Math.floor(uptimeSeconds / (3600 * 24));
    const hours = Math.floor((uptimeSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = Math.floor(uptimeSeconds % 60);
    const timeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

    const prefix = config.Prefix || config.PREFIX || ".";
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).trim().split(" ")[0].toLowerCase() : "";

    if (!["me", "uptmime", "runmtime"].includes(cmd)) return;

    const reactionEmojis = ["🔥", "💖", "🚀", "💨", "🎯", "🎉", "🌟", "💥", "🕐", "🔹"];
    const textEmojis = ["💎", "🏆", "⚡", "🎖", "🎶", "🌠", "🌀", "🔱", "🚀", "✩"];

    const reactionEmoji = reactionEmojis[Math.floor(Math.random() * reactionEmojis.length)];
    let textEmoji = textEmojis[Math.floor(Math.random() * textEmojis.length)];

    while (textEmoji === reactionEmoji) {
      textEmoji = textEmojis[Math.floor(Math.random() * textEmojis.length)];
    }

    await m.React(textEmoji);

    const message = `◈━━━━━━━━━━━━━━━━◈
│❒ Toxic-MD alive - ${timeString}! ${reactionEmoji}
◈━━━━━━━━━━━━━━━━◈`;

    const msg = await Matrix.sendMessage(m.from, {
      interactiveMessage: proto.Message.InteractiveMessage.create({
        body: proto.Message.InteractiveMessage.Body.create({
          text: message,
        }),
        footer: proto.Message.InteractiveMessage.Footer.create({
          text: "© Powered By 🇸🇮🇱🇻🇦",
        }),
          title: ``,
          gifPlayback: true,
          subtitle: "",
          hasMediaAttachment: false,
        }),
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
          buttons: [
            {
              "name": "single_select",
              "buttonParamsJson": `{"title":"🔖𝚻𝚫𝚸 𝐅𝚯𝚪 𝚯𝚸𝚵𝚴 𝚳𝚵𝚴𝐔",
             "sections":
               [{
                "title":"😎 🇸🇮🇱🇻🇦-𝛭𝐷 𝛥𝐿𝐿𝛭𝛯𝛮𝑈",
                "highlight_label":"🤩 𝛥𝐿𝐿𝛭𝛯𝛮𝑈",
                "rows":[
                  {
                   "header":"",
                   "title":"🔰 ᴀʟʟ ᴍᴇɴᴜ",
                   "description":"🎨🇸🇮🇱🇻🇦-𝛭𝐷 𝛥𝐿𝐿𝛭𝛯𝛮𝑈🎨",
                   "id":"View All Menu"
                  },
                  // ... other buttons ...
                ]}
              ]}`,
            },
          ],
        }),
        contextInfo: {
          mentionedJid: [m.sender],
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363249960769123@newsletter',
            newsletterName: "Ethix-MD",
            serverMessageId: 143,
          },
        },
      }),
    }, {});

    await Matrix.relayMessage(msg.key.remoteJid, msg.message, {
      messageId: msg.key.id,
    });
  } catch (error) {
    console.error(`❌ Alive error: ${error.message} ${error.stack}`);
    await Matrix.sendMessage(m.from, {
      text: `◈━━━━━━━━━━━━━━━━◈
│❒ *Toxic-MD* hit a snag! Error: ${error.message || "Failed to check status"} 😡
◈━━━━━━━━━━━━━━━━◈`,
    }, { quoted: m });
  }
};

export default alive;
