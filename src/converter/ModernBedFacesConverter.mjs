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
        const place = (name, sx, sy, w, h, dx, dy) => {
            atlas.composite(source[name].clone().crop(sx*factor,sy*factor,w*factor,h*factor),dx*factor,dy*factor);
        };
        // Head and foot top; side strips are the 16x6 regions used by Java's
        // template_bed_head/foot model. Fixed destination coordinates are
        // inherited from the historic 64x64 Bedrock bed atlas.
        place("head_up", 0,0,16,16, 6,6);
        place("foot_up", 0,0,16,16, 6,28);
        place("head_north", 0,7,16,6, 6,0);
        place("head_east", 0,7,16,6, 22,6);
        place("head_west", 0,7,16,6, 22,12);
        place("foot_south", 0,7,16,6, 6,22);
        place("foot_east", 0,7,16,6, 22,28);
        place("foot_west", 0,7,16,6, 22,34);
        place("down", 0,0,16,16, 28,44);
        // Four 3x3 corner posts. Their material comes from the model's
        // UV [0,13..16] side strips, not from a fixed material color.
        place("head_west", 0,13,3,3, 0,44);
        place("head_east", 13,13,3,3, 12,44);
        place("foot_west", 0,13,3,3, 0,50);
        place("foot_east", 13,13,3,3, 12,50);
        await this.writeImage(target, atlas);
        return [];
    }
    static get DEFAULT_CONVERTER_DATA() {
        return ["white","orange","magenta","light_blue","yellow","lime","pink",
            "gray","light_gray","cyan","purple","blue","brown","green","red","black"];
    }
}
export { ModernBedFacesConverter };
