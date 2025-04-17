// deno-lint-ignore-file no-case-declarations ban-unused-ignore
import SoktBot from "../soktdeer/sd-bot.ts";
import type * as SDTypes from "../soktdeer/sd-types.ts"
import Post from "../soktdeer/post.ts";
import { parse } from "hjson";
import { User } from "../lib.ts";

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
    args: ['subcommand'],
    fn: function (this: SoktBot, { args: [subcommand, ...args], reply, post }: { args: string[], reply: (post: SDTypes.SendPost | string) => void, post: Post }) {
        const shop: ShopConfig = parse(Deno.readTextFileSync('shop.hjson'));

        const user = new User(post.author.username);

        switch (subcommand) {
            case undefined:
            case 'shop':
                let sResult = "";
                for (const item of shop.shop) {
                    const itemDef = shop.items[item];
                    sResult += `> ## ${itemDef.name}${itemDef.name != item ? ` \`${item}\`` : ''}
> ${itemDef.description}
> costs ${itemDef.cost} meows\
${itemDef.bonus ? `\n> when you purchase this item you alse get these items for free: ${itemDef.bonus.map(i => `\`${i}\``).join(', ')}` : ''}\
${itemDef.requires ? `\n> to purchase this item you need to have these items first: ${itemDef.requires.map(i => `\`${i}\``).join(', ')}` : ''}\
${shop.canSell[itemDef.type] ? `\n> you can sell this item for ${Math.ceil(itemDef.cost * shop.sellingPrices[itemDef.type])} meows` : '\n> you can\'t sell this item'}\
${itemDef.unique ? '\n> this item is unique, you can only have one of it in your inventory' : ''}

---
`
                }
                reply(sResult+`\nWIP, run \`@${this.username} shop help\` to see the subcommands`)
                break;
            
            case 'inv':
            case 'inventory':
                let result = "";
                for (const id in user.inventory) {
                    const count = user.inventory[id];
                    const itemDef = shop.items[id]
                    result += `> ## ${itemDef.name} - \`${count}x\`
> ${itemDef.description}
`
                }
                reply(result)
                break;
            
            case 'buy':
                let itemName = '';
                for (const item of Object.keys(shop.items)) {
                    if (args[0].toLowerCase() == item.replaceAll(' ', '').toLowerCase()) {
                        itemName = item;
                        break;
                    }
                    if (args.join(' ').toLowerCase() == item.toLowerCase()) {
                        itemName = item;
                        break;
                    }
                }
                if (!shop.items[itemName])
                    return reply('unknown item')
                if (!shop.shop.includes(itemName))
                    return reply('this item is not purchasable');
                const item: Item = shop.items[itemName];
                if (user.bal < item.cost)
                    return reply('you do NOT have that much');
                if (item.requires && item.requires.map(i => user.hasItem(i)).includes(false))
                    return reply(`you nees the following items to purchase this item: ${item.requires.filter(i => !user.hasItem(i)).join(', ')}`)
                if (item.unique && user.hasItem(itemName))
                    return reply(`this item can only be bought once`)

                user.bal -= item.cost;
                user.addItem(itemName)

                if (item.bonus)
                    item.bonus.filter(i => !user.hasItem(i)).forEach(i => user.addItem(i));
                reply(`bought ${item.name} for ${item.cost}`)
                break;
            
            case 'sell':
                let itemId = '';
                console.log(args.join(' '))
                for (const item of Object.keys(shop.items)) {
                    if (args[0].toLowerCase() == item.replaceAll(' ', '').toLowerCase()) {
                        itemId = item;
                        break;
                    }
                    console.log(item)
                    if (args.join(' ').toLowerCase() == item.toLowerCase()) {
                        itemId = item;
                        break;
                    }
                }
                if (!shop.items[itemId])
                    return reply('what the hell is that item');
                if (!user.hasItem(itemId))
                    return reply('you dont even have that.,,');
                const itemDef = shop.items[itemId]
                if (!shop.canSell[itemDef.type])
                    return reply('you cant sell that type of item');
                const sellPrice = Math.ceil(itemDef.cost * shop.sellingPrices[itemDef.type]);
                user.bal += sellPrice;
                user.inventory[itemId]--;
                if (user.inventory[itemId] < 1)
                    delete user.inventory[itemId];
                reply(`sold item for ${sellPrice} meows`)
                break;
            
            case 'help':
                reply(`subcommands:
\`@${this.username} shop shop\` - see the shop
\`@${this.username} shop inventory\` - see what items you have
\`@${this.username} shop buy\` - purchase an item
\`@${this.username} shop help\` - uh this`)
                break;
        
            default:
                reply(`unknown subcommand "${subcommand}"`)
                break;
        }
    }
}
