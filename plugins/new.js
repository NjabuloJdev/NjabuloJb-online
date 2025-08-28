import pkg, { prepareWAMessageMedia } from '@whiskeysockets/baileys';
const { generateWAMessageFromContent, proto } = pkg;

const alive = async (m, Matrix) => {
  const uptimeSeconds = process.uptime();
  const days = Math.floor(uptimeSeconds / (24 * 3600));
  const hours = Math.floor((uptimeSeconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  const seconds = Math.floor(uptimeSeconds % 60);
  
  const prefix = /^[\\/!#.]/gi.test(m.body) ? m.body.match(/^[\\/!#.]/gi)[0] : '/';
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).toLowerCase() : '';
    if (['am', 'uptimme'].includes(cmd)) {

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
          name: "cta_hello",
            buttonParamsJson: JSON.stringify({
              display_text: "message me",
              id: ".ai",
            })
          },
         {
           name: "cta_Instagram",
            buttonParamsJson: JSON.stringify({
              display_text: "message me",
              id: ".ai",
            })
          },
         {
           name: "cta_image",
            buttonParamsJson: JSON.stringify({
              display_text: "message me",
              id: ".ai",
            })
          },
          {
           name: "cta_WhatsApp",
            buttonParamsJson: JSON.stringify({
              display_text: "message me",
              id: ".ai",
            })
          },
         {
           name: "cta_facebook",
            buttonParamsJson: JSON.stringify({
              display_text: "message me",
              id: ".ai",
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
            title: "",
            viewOnce: true,
            gifPlayback: true,
            subtitle: "",
            hasMediaAttachment: false 
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
