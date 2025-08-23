import config from '../config.cjs';

const ping = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';

  if (cmd === "ping") {
    const start = new Date().getTime();

    const reactionEmojis = ['🔥', '⚡', '🚀', '💨', '🎯', '🎉', '🌟', '💥', '🕐', '🔹'];
    const textEmojis = ['💎', '🏆', '⚡️', '🚀', '🎶', '🌠', '🌀', '🔱', '🛡️', '✨'];

    const reactionEmoji = reactionEmojis[Math.floor(Math.random() * reactionEmojis.length)];
    let textEmoji = textEmojis[Math.floor(Math.random() * textEmojis.length)];

    // Ensure reaction and text emojis are different
    while (textEmoji === reactionEmoji) {
      textEmoji = textEmojis[Math.floor(Math.random() * textEmojis.length)];
    }

    await m.React(textEmoji);

    const end = new Date().getTime();
    const responseTime = (end - start) / 1000;

    const text = `*JINX-XMD SPEED: ${responseTime.toFixed(2)}ms ${reactionEmoji}*`;

    const buttonMessage = {
      text,
      contextInfo: {
        mentionedJid: [m.sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363302677217436@newsletter',
          newsletterName: "JINX-XMD",
          serverMessageId: 143
        }
      },
      buttons: [
        {
          buttonId: "follow_channel",
          buttonText: {
            displayText: "Follow our Channel"
          },
          type: 1,
          url: "https://whatsapp.com/channel/0029VagJlnG6xCSU2tS1Vz19"
        }
      ],
      headerType: 1
    };

    await Matrix.sendMessage(m.from, buttonMessage, { quoted: m });
  }
};

export default ping;
