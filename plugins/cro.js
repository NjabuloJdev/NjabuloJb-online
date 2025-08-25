import config from '../config.cjs';

const startTime = new Date().getTime(); // Record start time for uptime calculation
const scrollPosition = 0; // Initialize scroll position
const scrollAmount = 100; // Define scroll amount

const ping = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';

  if (cmd === "menu") {
    const buttons = [
      {
        "buttonId": "uptime",
        "buttonText": {
          "displayText": "Uptime"
        },
        "type": 1
      },
      {
        "buttonId": "ping",
        "buttonText": {
          "displayText": "Ping"
        },
        "type": 1
      },
      {
        "buttonId": "scroll_left",
        "buttonText": {
          "displayText": "Scroll Left"
        },
        "type": 1
      },
      {
        "buttonId": "scroll_right",
        "buttonText": {
          "displayText": "Scroll Right"
        },
        "type": 1
      }
    ];

    const buttonMessage = {
      "text": "Select an option:",
      "footer": "JINX-XMD Menu",
      "buttons": buttons,
      "headerType": 1
    };

    await Matrix.sendMessage(m.from, buttonMessage);
  }

  // Handle button clicks
  if (m.type === 'button') {
    const buttonId = m.buttonId;

    if (buttonId === "uptime") {
      // ... (rest of the uptime code remains the same)
    } else if (buttonId === "ping") {
      // ... (rest of the ping code remains the same)
    } else if (buttonId === "scroll_left") {
      scrollPosition -= scrollAmount;
      const scrollLeftText = `*Scrolled left to position ${scrollPosition}*`;
      await Matrix.sendMessage(m.from, {
        text: scrollLeftText,
      });
      // Load content for new scroll position
      loadContent(scrollPosition);
    } else if (buttonId === "scroll_right") {
      scrollPosition += scrollAmount;
      const scrollRightText = `*Scrolled right to position ${scrollPosition}*`;
      await Matrix.sendMessage(m.from, {
        text: scrollRightText,
      });
      // Load content for new scroll position
      loadContent(scrollPosition);
    }
  }
};

// Function to load content for new scroll position
const loadContent = async (position) => {
  // Implement logic to load content for new scroll position
  // For demonstration purposes, let's assume you're loading a list of messages
  const messages = [
    { id: 1, text: "Message 1" },
    { id: 2, text: "Message 2" },
    { id: 3, text: "Message 3" },
    // ...
  ];

  const content = messages.slice(position, position + 10); // Load 10 messages for new scroll position
  // Send content to user
  await Matrix.sendMessage(m.from, {
    text: content.map((message) => message.text).join("\n"),
  });
};

export default ping;
