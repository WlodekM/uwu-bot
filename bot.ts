import SoktBot from "./soktdeer/sd-bot.ts";
import fs from 'node:fs'

console.info('starting bot')

const creds: {
    username: string
    password: string
} = JSON.parse(new TextDecoder().decode(Deno.readFileSync('creds.json')));
const bot = new SoktBot({
    ...creds,
    server: 'wss://chaos.goog-search.eu.org/',
    client: 'soktdeew nya cwient'
});

// bot.client.ws.addEventListener('message', (m) => {
//     console.debug(m.data)
// })
bot.events.on('ready', () => console.info('bot ready'))

const cmdFiles = fs.readdirSync('commands').filter(c => c.endsWith('.ts'))

for (const commandfile of cmdFiles) {
    const command = (await import('./commands/' + commandfile)).default;
    bot.command(commandfile.replace(/\..*?$/g, ''), command)
}
