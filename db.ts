async function loadIfExists(name: string, contents: string) {
    try {
        return await Deno.readTextFile(name);
    } catch {
        await Deno.writeTextFile(name, contents);
        return contents;
    }
};

/** Convert text to a Uint8Array */
function Uint8ify(text: string): Uint8Array {
    const numarr: number[] = text.split('').map<number>((char: string): number => { return char.charCodeAt(0) });
    return Uint8Array.from(numarr)
}

export default class DB<T> {
    data: {[key: string]: T} = {};
    filename: string;
    write: boolean = false;
    constructor (filename: string, write:boolean=true) {
        this.write = write;
        if(!write) {
            this.data = {};
            this.filename = '';
            return;
        }
        this.filename = filename
        loadIfExists(filename, '{}').then(d => this.data = JSON.parse(d.toString()));
    }

    get(key: string): T {
        return this.data[key]
    }

    has (key: string) {
        return Object.prototype.hasOwnProperty.call(this.data, key)
    }

    set(key: string, value: T) {
        this.data[key] = value;
        if(!this.write) return;
        Deno.writeFileSync(this.filename, Uint8ify(JSON.stringify(this.data)))
    }
}