import SoktBot from "./soktdeer/sd-bot.ts";
import owoify from "npm:owoify-js";

import DB from "./db.ts"

console.info('starting bot')

const creds: {
    username: string
    password: string
} = JSON.parse(new TextDecoder().decode(Deno.readFileSync('creds.json')));
const bot = new SoktBot({
    ...creds
});

const db = new DB<number|number>('money.json', true)

bot.command('', {
    aliases: [],
    args: [],
    fn: ({ post, reply }) => {
        if (post.replies.length < 1)
            return reply('You need to reply to a post to use this command');
        reply(owoify.uvuify(post.replies[0].content));
    }
})

bot.command('meow', {
    aliases: [],
    args: ['subcommand'],
    fn: function (this: SoktBot, { args: [subcommand, ...args], reply, post }) {
        if(!db.has(`level-${post.author.username}`))
            db.set(`level-${post.author.username}`, 1);
        if(!db.has(`${post.author.username}`))
            db.set(`${post.author.username}`, 0);
        switch (subcommand) {
            // deno-lint-ignore no-case-declarations
            case 'meow':
                const level = db.get(`level-${post.author.username}`)
                db.set(post.author.username, (db.get(post.author.username) ?? 0) + level);
                reply(`You meowed, you earned ${level} meow point${level == 1 ? '' : 's'}`)
                break;
            
            case 'bal':
                reply(`Your balance is ${db.get(post.author.username)}`)
                break;
            
            case 'level':
                switch (args[0]) {
                    case undefined:
                    case 'list':
                        reply(`Your meow level is ${db.get(`level-${post.author.username}`)}
Buy more levels using \`@${this.username} level buy\``);
                        break;
                    
                    // deno-lint-ignore no-case-declarations
                    case 'buy':
                        const level = db.get(`level-${post.author.username}`)
                        const cost = Math.floor(15 * (1 + ((level - 1) / 2)));
                        if(db.get(post.author.username) < cost)
                            return reply(`You need ${cost - db.get(post.author.username)} more points to upgrade`);
                        db.set(`level-${post.author.username}`, db.get(`level-${post.author.username}`) + 1);
                        db.set(post.author.username, db.get(post.author.username) - cost);
                        reply(`You have purchased an upgrade for ${cost} points, your level is now ${db.get(`level-${post.author.username}`)}`)
                        break;
                }
                break;
            
            case undefined:
            case 'help':
                reply(`Subcommands:
\`@${this.username} meow meow\` - meow to earn meow points
\`@${this.username} meow bal\` - see your meow points balance
\`@${this.username} meow level\` - see your meow level
\`@${this.username} meow level buy\` - purchase an upgrade
\`@${this.username} meow help\` - uh this`)
                break;
        
            default:
                reply(`Unknown subcommand "${subcommand}"`)
                break;
        }
    }
})

bot.events.on('ready', () => console.info('bot ready'))