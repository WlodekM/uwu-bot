import SoktBot from "./soktdeer/sd-bot.ts";

const creds: {
    username: string
    password: string
} = JSON.parse(new TextDecoder().decode(Deno.readFileSync('creds.json')));
const bot = new SoktBot({
    ...creds
});

bot.command('', {
    aliases: [],
    args: [],
    fn: ({ post, reply }) => {
        if (post.replies.length < 1)
            return reply('You need to reply to a post to use this command');
        reply('uh this is not done yet')
    }
})