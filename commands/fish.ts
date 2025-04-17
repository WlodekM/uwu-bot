// deno-lint-ignore-file no-case-declarations ban-unused-ignore
import SoktBot from "../soktdeer/sd-bot.ts";
import type * as SDTypes from "../soktdeer/sd-types.ts"
import Post from "../soktdeer/post.ts";
import { parse } from "hjson";
import { User, fdb } from "../lib.ts";

export interface ShopConfig {
    items: Record<string, Item>
    shop: string[]
    sellingPrices: Record<string, number>
    canSell: Record<string, boolean>
}

export interface Item {
    name: string
    description: string
    cost: number
    bonus?: string[]
    requires?: string[]
    type: string
    unique?: boolean
}

export default {
    aliases: [],
    args: [],
    fn: function (this: SoktBot, { args: [subcommand, ...args], reply, post }: { args: string[], reply: (post: SDTypes.SendPost | string) => void, post: Post }) {
        const shop: ShopConfig = parse(Deno.readTextFileSync('shop.hjson'));

        const user = new User(post.author.username);

        if (Date.now() < fdb.get(`cooldown-${user.username}`))
            return reply(`you cant fish yet, try again in ${fdb.get(`cooldown-${user.username}`) - Date.now()} seconds`);

        const fishCaught: string[] = [];

        function fishChance(fish:string, chance: number) {
            if (Math.random() * 100 <= chance)
                fishCaught.push(fish)
        }

        fishChance('salmon', 50)
        fishChance('salmon', 25)
        fishChance('salmon', 15)
        fishChance('salmon', 5)

        const caughtQuantity = fishCaught.reduce<Record<string, number>>((p, c) => {
            if (!p[c])
                p[c] = 0;
            p[c]++;
            return p;
        }, {})

        for (const fish in caughtQuantity) {
            const quantity = caughtQuantity[fish];
            user.addItem(fish, quantity)
        }

        reply(`you caught${Object.entries(caughtQuantity)
            .map(([fish, quant]) => `\n${quant}x ${shop.items[fish].name}`)
            ?? ' nothing'}`)
    }
}
