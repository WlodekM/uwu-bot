import owoify from "npm:owoify-js";
import type * as SDTypes from "../soktdeer/sd-types.ts"
import type Post from "../soktdeer/post.ts"

export default {
    aliases: [],
    args: [],
    fn: ({ post, reply }: { post: Post, reply: (post: SDTypes.SendPost | string) => void }) => {
        if (post.replies.length < 1)
            return reply('You need to reply to a post to use this command');
        reply(owoify.uvuify(post.replies[0].content));
    }
}