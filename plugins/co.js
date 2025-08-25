import config from '../config.cjs';

const startTime = new Date().getTime(); // Record start time for uptime calculation

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

    await Matrix.sendMessage(m.from, {
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
      }
    }, { quoted: m });
  }

  if (cmd === "uptime") {
    const currentTime = new Date().getTime();
    const uptime = (currentTime - startTime) / 1000; // Calculate uptime in seconds
    const uptimeText = `*JINX-XMD UPTIME: ${uptime.toFixed(2)} seconds*`;

    await Matrix.sendMessage(m.from, {
      text: uptimeText,
      contextInfo: {
        mentionedJid: [m.sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363302677217436@newsletter',
          newsletterName: "JINX-XMD",
          serverMessageId: 143
        }
      }
    }, { quoted: m });
  }

  if (cmd === "menu") {
    const menuText = `*JINX-XMD MENU:*
    1. ping - Check bot speed
    2. uptime - Check bot uptime`;

    await Matrix.sendMessage(m.from, {
      text: menuText,
      contextInfo: {
        mentionedJid: [m.sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363302677217436@newsletter',
          newsletterName: "JINX-XMD",
          serverMessageId: 143
        }
      }
    }, { quoted: m });
  }

  // For scroll functionality, let's assume you have a specific command for scrolling
  if (cmd.startsWith("scroll")) {
    const scrollAmount = 100; // Define your scroll amount
    const scrollDirection = cmd.split(' ')[1]; // Get scroll direction from command

    if (scrollDirection === "left") {
      // Implement scroll left logic here
      // For demonstration, let's assume you're scrolling a message list
      const scrollLeftText = `*Scrolled left by ${scrollAmount}px*`;
      await Matrix.sendMessage(m.from, {
        text: scrollLeftText,
        contextInfo: {
          mentionedJid: [m.sender],
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363302677217436@newsletter',
            newsletterName: "JINX-XMD",
            serverMessageId: 143
          }
        }
      }, { quoted: m });
    } else if (scrollDirection === "right") {
      // Implement scroll right logic here
      const scrollRightText = `*Scrolled right by ${scrollAmount}px*`;
      await Matrix.sendMessage(m.from, {
        text: scrollRightText,
        contextInfo: {
          mentionedJid: [m.sender],
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363302677217436@newsletter',
            newsletterName: "JINX-XMD",
            serverMessageId: 143
          }
        }
      }, { quoted: m });
    }
  }
};

export default ping;
