import config from '../config.cjs';

const slotMachine = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';

  if (!['slot', 'spin'].includes(cmd)) return;

  const fruits = ['🍉', '🍎', '🍓', '🥭', '🍑'];
  const reels = 3;
  const spins = 5;

  let result = '';
  for (let i = 0; i < reels; i++) {
    result += fruits[Math.floor(Math.random() * fruits.length)] + ' ';
  }

  let message = `*Spinning...*\n`;
  for (let i = 0; i < spins; i++) {
    let spinningReels = '';
    for (let j = 0; j < reels; j++) {
      spinningReels += fruits[Math.floor(Math.random() * fruits.length)] + ' ';
    }
    message += `*${spinningReels}*\n`;
    await Matrix.sendMessage(m.from, { text: message }, { quoted: m });
    await new Promise(resolve => setTimeout(resolve, 500));
    message = `*Spinning...*\n`;
  }

  message = `*Result:*\n*${result}*`;
  if (result.split(' ')[0] === result.split(' ')[1] && result.split(' ')[1] === result.split(' ')[2]) {
    message += `\n*Congratulations, you won!*`;
  } else {
    message += `\n*Better luck next time!*`;
  }

  await Matrix.sendMessage(m.from, { text: message }, { quoted: m });
};

export default slotMachine;
