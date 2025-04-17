// deno-lint-ignore-file no-case-declarations
import SoktBot from "../soktdeer/sd-bot.ts";
import type * as SDTypes from "../soktdeer/sd-types.ts"
import DB from "../db.ts"
import Post from "../soktdeer/post.ts";

const db = new DB<number|number>('money.json', true)

export default {
    aliases: [],
    args: ['subcommand'],
    fn: function (this: SoktBot, { args: [subcommand, ...args], reply, post }: { args: string[], reply: (post: SDTypes.SendPost | string) => void, post: Post }) {
        if(!db.has(`level-${post.author.username}`))
            db.set(`level-${post.author.username}`, 1);
        if(!db.has(`${post.author.username}`))
            db.set(`${post.author.username}`, 0);
        switch (subcommand) {
            case 'meow':
                const level = db.get(`level-${post.author.username}`)
                db.set(post.author.username, (db.get(post.author.username) ?? 0) + level);
                reply(`You meowed, you earned ${level} meow point${level == 1 ? '' : 's'}`)
                break;
            
            case 'balance':
            case 'bal':
                reply(`Your balance is ${db.get(post.author.username)}`)
                break;
            
            case 'level':
                switch (args[0]) {
                    case undefined:
                    case 'list':
                        reply(`Your meow level is ${db.get(`level-${post.author.username}`)}
Buy 1 level for ${Math.floor(15 * (1 + ((db.get(`level-${post.author.username}`) - 1) / 2)))} using \`@${this.username} meow level buy\``);
                        break;
                    
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
            
            case 'gamble':
                if (!args[0] || Number.isNaN(+args[0]) || +args[0] < 5)
                    return reply('you have to bet atleast 5 meows');
                if (+args[0] > db.get(post.author.username))
                    return reply('you do NOT have that much');
                const won = Math.random() >= 0.5;
                if (!won) {
                    db.set(post.author.username, (db.get(post.author.username) ?? 0) - +args[0]);
                    return reply(`aw dang it, you lost ~~L~~ (you now have ${db.get(post.author.username)} meows)`)
                }
                db.set(post.author.username, (db.get(post.author.username) ?? 0) + +args[0]);
                return reply(`you won ${args[0]}, hooray (you now have ${db.get(post.author.username)} meows)`)
            
            case undefined:
            case 'help':
                reply(`Subcommands:
\`@${this.username} meow meow\` - meow to earn meow points
\`@${this.username} meow bal\` - see your meow points balance
\`@${this.username} meow level\` - see your meow level
\`@${this.username} meow level buy\` - purchase an upgrade
\`@${this.username} meow help\` - uh this
\`@${this.username} meow gamble\` - gamble your meows away`)
                break;
        
            default:
                reply(`Unknown subcommand "${subcommand}"`)
                break;
        }
    }
}