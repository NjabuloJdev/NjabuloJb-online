import pkg, { prepareWAMessageMedia } from '@whiskeysockets/baileys';
import fs from "fs";
import axios from "axios";
const { generateWAMessageFromContent, proto } = pkg;

const alive = async (m, Matrix) => {
  const uptimeSeconds = process.uptime();
  const days = Math.floor(uptimeSeconds / (24 * 3600));
  const hours = Math.floor((uptimeSeconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  const seconds = Math.floor(uptimeSeconds % 60);
  
  const prefix = /^[\\/!#.]/gi.test(m.body) ? m.body.match(/^[\\/!#.]/gi)[0] : '/';
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).toLowerCase() : '';
    if (['alive', 'uptime'].includes(cmd)) {

  const uptimeMessage = `*🤖 mini bot Status Overview*
_______________________________________

*📆 ${days} Day*
*🕰️ ${hours} Hour*
*⏳ ${minutes} Minute*
*⏲️ ${seconds} Second*
_______________________________________
`;

  const buttons = [
        {
          name: "cta_message",
            buttonParamsJson: JSON.stringify({
              display_text: "message me",
              id: "+26777821911",
            })
          },
         {
          name: "cta_call",
            buttonParamsJson: JSON.stringify({
              display_text: "call owner",
              id: "+26777821911",
            })
          },
          {
            name: "cta_url",
            buttonParamsJson: JSON.stringify({
              display_text: "Follow Channel",
              url: `https://whatsapp.com/channel/0029VbAckOZ7tkj92um4KN3u`
            })
        }
        ];

  let menuImage;
  if (config.MENU_IMAGE && config.MENU_IMAGE.trim() !== "") {
    try {
      const response = await axios.get(config.MENU_IMAGE, { responseType: "arraybuffer" });
      menuImage = Buffer.from(response.data, "binary");
    } catch (error) {
      console.error("Error fetching menu image:", error.message);
      menuImage = fs.readFileSync("./media/fana.jpg");
    }
  } else {
    menuImage = fs.readFileSync("./media/fana.jpg");
  }

  const msg = generateWAMessageFromContent(m.from, {
    viewOnceMessage: {
      message: {
        messageContextInfo: {
          deviceListMetadata: {},
          deviceListMetadataVersion: 2
        },
        interactiveMessage: proto.Message.InteractiveMessage.create({
          body: proto.Message.InteractiveMessage.Body.create({
            text: uptimeMessage
          }),
          footer: proto.Message.InteractiveMessage.Footer.create({
            text: "✆︎Pσɯҽɾҽԃ Ⴆყ NנɐႦυℓσ נႦ"
          }),
          header: proto.Message.InteractiveMessage.Header.create({
            ...(await prepareWAMessageMedia({ image: menuImage }, { upload: Matrix.waUploadToServer })),
            title: "",
            gifPlayback: true,
            subtitle: "",
            hasMediaAttachment: true 
          }),
          nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
            buttons
          }),
          contextInfo: {
                  mentionedJid: [m.sender], 
                  forwardingScore: 999,
                  isForwarded: true,
                forwardedNewsletterMessageInfo: {
                  newsletterJid: '120363399999197102@newsletter',
                  newsletterName: "╭••➤®Njabulo Jb",
                  serverMessageId: 143
                }
              }
        }),
      },
    },
  }, {});

  await Matrix.relayMessage(msg.key.remoteJid, msg.message, {
    messageId: msg.key.id
  });
    }
};

export default alive;
