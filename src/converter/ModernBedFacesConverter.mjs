import { AbstractConverter } from "@modifiedcommand/convert-base-api";

/**
 * Java 26.2+ block-face bed textures -> Bedrock 64x64 entity atlas.
 * One face-layout recipe shared by all 16 colors; no source files are deleted.
 * Source is vanilla's template_bed_head / template_bed_foot texture UV schema.
 */
class ModernBedFacesConverter extends AbstractConverter {
    async convert() {
        if (this.options?.javaVersion !== "26.3") return [];
        const color = this.data;
        const base = "textures/blocks/";
        const parts = {
            head_up: `${base}${color}_bed_head_up.png`,
            head_east: `${base}${color}_bed_head_east.png`,
            head_west: `${base}${color}_bed_head_west.png`,
            foot_up: `${base}${color}_bed_foot_up.png`,
            foot_south: `${base}${color}_bed_foot_south.png`,
            foot_east: `${base}${color}_bed_foot_east.png`,
            foot_west: `${base}${color}_bed_foot_west.png`,
            head_north: `${base}bed_head_north.png`,
            down: `${base}bed_down.png`
        };
        const targetColor = color === "light_gray" ? "silver" : color;
        const target = `textures/entity/bed/${targetColor}.png`;
        if (await this.output.exists(target)) return [];
        for (const p of Object.values(parts)) if (!await this.output.exists(p)) {
            this.log.warn(`Incomplete Java bed atlas for ${color}: missing ${p}`);
            return [];
        }
        const source = {};
        for (const [part, path] of Object.entries(parts)) source[part] = await this.readImage(path);
        const factor = source.head_up.getWidth() / 16;
        if (!Number.isInteger(factor) || factor < 1) throw new Error(`Unsupported bed texture resolution for ${color}`);
        for (const image of Object.values(source)) {
            if (image.getWidth() !== 16 * factor || image.getHeight() !== 16 * factor)
                throw new Error(`Inconsistent bed face resolution: ${color}`);
        }
        const atlas = await this.createImage(64 * factor, 64 * factor);
        const place = (name, sx, sy, w, h, dx, dy, mode = 0) => {
            const piece = source[name].clone().crop(sx*factor,sy*factor,w*factor,h*factor);
            if (mode === 1) piece.rotateSimple(90);
            else if (mode === 2) piece.rotateSimple(180);
            else if (mode === 3) piece.rotateSimple(270);
            else if (mode === 4) piece.flip(false, true);
            atlas.composite(piece,dx*factor,dy*factor);
        };
        // Coordinate atlas derived by pixel-matching Java 26.3 block faces
        // against Mojang's vanilla Bedrock 1.26.50.4 red bed entity atlas.
        // The same layout is shared by all sixteen color variants.
        place("head_up",0,0,16,16,6,6);
        place("foot_up",0,0,16,16,6,22);
        place("head_north",0,7,16,6,6,0,2);
        place("foot_south",0,7,16,6,22,0,4);
        place("head_east",0,7,16,6,22,6,1);
        place("head_west",0,7,16,6,0,6,3);
        place("foot_east",0,7,16,6,22,22,1);
        place("foot_west",0,7,16,6,0,22,3);
        place("down",0,0,16,16,28,6,2);
        place("down",0,0,16,16,28,22,2);
        // Four bed posts are 3x3 UV patches repeated in a common pattern.
        // Restore the original nonrectangular atlas alpha footprint.
        for (const y of [38,44]) for (const x of [3,6,15,18]) {
            const p = x < 12 ? "head_west" : "foot_west";
            place(p, x % 6 === 3 ? 0 : 3, 13, 3, 3, x, y);
        }
        for (const y of [41,47]) for (let x=0;x<24;x+=3) {
            const p = x < 12 ? "head_east" : "foot_east";
            place(p, (x % 12) < 6 ? 10 : 13, 13, 3, 3, x, y);
        }
        await this.writeImage(target, atlas);
        return [];
    }
    static get DEFAULT_CONVERTER_DATA() {
        return ["white","orange","magenta","light_blue","yellow","lime","pink",
            "gray","light_gray","cyan","purple","blue","brown","green","red","black"];
    }
}
export { ModernBedFacesConverter };
