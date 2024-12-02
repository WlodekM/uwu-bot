import SoktBot from "./soktdeer/sd-bot.ts";
import owoify from "npm:owoify-js";

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
        reply(owoify.uvuify(post.replies[0].content));
    }
})