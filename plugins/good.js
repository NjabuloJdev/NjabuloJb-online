import config from "../config.cjs";

const alive = async (m, Matrix) => {
  try {
    if (!m || !m.body) return;

    const uptimeSeconds = process.uptime();
    const days = Math.floor(uptimeSeconds / (3600 * 24));
    const hours = Math.floor((uptimeSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = Math.floor(uptimeSeconds % 60);
    const timeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

    const prefix = config.Prefix || config.PREFIX || ".";
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).trim().split(" ")[0].toLowerCase() : "";

    if (!["kk", "uptkkime", "runtikkme"].includes(cmd)) return;

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

    const buttons = [
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
              {
                "header":"",
                "title":"⬇️ ᴅᴏᴡɴʟᴀᴏᴅᴇʀ ᴍᴇɴᴜ",
                "description":"📂𝐒𝚮𝚯𝐖 𝚫𝐋𝐋 𝐃𝚯𝐖𝚴𝐋𝚯𝚫𝐃 𝐅𝚵𝚫𝚻𝐔𝚪𝚵𝐒🗂",
                "id":"Downloader Menu"
              },
              {
                "header":"",
                "title":"👨‍👨‍👧‍👧ɢʀᴏᴜᴘ ᴍᴇɴᴜ",
                "description":"🥵𝐅𝚵𝚫𝚻𝐔𝚪𝚵 𝚻𝚮𝚫𝚻 𝚫𝚪𝚵 𝚯𝚴𝐋𝐘 𝚫𝛁𝚰𝐋𝚫𝚩𝐋𝚵 𝐅𝚯𝚪 𝐆𝚪𝚯𝐔𝚸🥵",
                "id":"Group Menu"
              },
              {
                "header":"",
                "title":"👨‍🔧 ᴛᴏᴏʟ ᴍᴇɴᴜ",
                "description":"🛠 𝐒𝚮𝚯𝐖 𝚳𝚵 𝚻𝚯𝚯𝐋 𝚳𝚵𝚴𝐔",
                "id":"Tool Menu"
              },
              {
                "header":"",
                "title":"🗿 ᴍᴀɪɴ ᴍᴇɴᴜ",
                "description":"📪 𝚩𝚯𝚻 𝚳𝚫𝚰𝚴 𝐂𝚯𝚳𝚳𝚫𝚴𝐃𝐒🗳",
                "id":"Main Menu"
              },
              {
                "header":"",
                "title":"👨‍💻 ᴏᴡɴᴇʀ ᴍᴇɴᴜ",
                "description":"😎𝐅𝚵𝚫𝚻𝐔𝚪𝚵 𝚻𝚮𝚫𝚻 𝚫𝚪𝚵 𝚯𝚴𝐋𝐘 𝐅𝚯𝚪 𝚳𝐘 𝚮𝚫𝚴𝐃𝐒𝚯𝚳𝚵 𝚯𝐖𝚴𝚵𝚪👨‍💼",
                "id":"Owner Menu"
              },
              {
                "header":"",
                "title":"✨ ᴀɪ ᴍᴇɴᴜ",
                "description":"💫 𝐒𝚮𝚯𝐖 𝚳𝚵 𝚫𝚰 𝚳𝚵𝚴𝐔 🎇",
                "id":"Ai Menu"
              },
              {
                "header":"",
                "title":"🔍sᴇᴀʀᴄʜ ᴍᴇɴᴜ🔎",
                "description":"♂️ 𝐒𝚮𝚯𝐖 𝚳𝚵 𝐒𝚵𝚫𝚪𝐂𝚮 𝚳𝚵𝚴𝐔",
                "id":"Search Menu"
              },
              {
                "header":"",
                "title":"🧚‍♂️ sᴛᴀʟᴋ ᴍᴇɴᴜ",
                "description":"👨‍💼 𝐒𝚮𝚯𝐖 𝚳𝚵 𝐒𝚻𝚫𝐋𝐊 𝚳𝚵𝚴𝐔🪆",
                "id":"Stalk Menu"
              },
              {
                "header":"",
                "title":"🥏 𝚌𝚘𝚗𝚟𝚎𝚛𝚝𝚎𝚛 𝚖𝚎𝚗𝚞",
                "description":"🛷 𝐒𝚮𝚯𝐖 𝚳𝚵 𝐂𝚯𝚴𝛁𝚵𝚪𝚻𝚵𝚪 𝚳𝚵𝚴𝐔",
                "id":"Converter Menu"
              }
            ]}
          ]}`
      }
    ];

    await Matrix.sendMessage(
      m.from,
      {
        text: message,
        buttons: buttons,
        contextInfo: {
          mentionedJid: [m.sender],
          externalAdReply: {
            showAdAttribution: true,
            title: `Toxic-MD Status`,
            body: `Check Toxic-MD's uptime!`,
            mediaType: 1,
            renderLargerThumbnail: true,
            mediaUrl: "https://files.catbox.moe/zaqn1j.jpg",
            thumbnailUrl: "https://files.catbox.moe/zaqn1j.jpg",
          },
        },
      },
      { quoted: m }
    );
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
