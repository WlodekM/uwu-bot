import DB from "./db.ts"

export const mdb = new DB<number>('money.json', true)
export const invdb = new DB<Record<string, number>>('inventory.json', true)
export const fdb = new DB<number>('fishing.json', true)

export class User {
    username: string;
    get inventory() {
        return invdb.get(this.username)
    }
    set inventory(newInv: Record<string, number>) {
        invdb.set(this.username, newInv)
    }
    get bal() {
        return mdb.get(this.username)
    }
    set bal(newInv: number) {
        mdb.set(this.username, newInv)
    }
    hasItem(item: string): boolean {
        const inventory = this.inventory
        for (const id in inventory) {
            if (id == item)
                return true;
        }
        return false;
    }
    addItem(id: string, addAmount: number = 1) {
        // const itemId = mdb.get(`itemid-${this.username}`)
        // mdb.set(`itemid-${this.username}`, itemId + 1);
        const amount = this.inventory[id] ?? 0;
        this.inventory = {
            ...this.inventory,
            ...Object.fromEntries([[id, amount + addAmount]]),
        }
    }
    constructor(username: string) {
        this.username = username;
        if(!mdb.has(`level-${this.username}`))
            mdb.set(`level-${this.username}`, 1);
        if(!fdb.has(`cooldown-${this.username}`))
            fdb.set(`cooldown-${this.username}`, 0);
        if(!invdb.has(`${this.username}`))
            invdb.set(`${this.username}`, {});
        if(!mdb.has(`itemid-${this.username}`))
            mdb.set(`itemid-${this.username}`, 0);
        if(!mdb.has(`${this.username}`))
            mdb.set(`${this.username}`, 0);
    }
}