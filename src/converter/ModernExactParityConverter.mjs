import { AbstractConverter } from "@modifiedcommand/convert-base-api";

/** High-confidence Java 26.3 family rules verified against the pinned Bedrock tree. */
class ModernExactParityConverter extends AbstractConverter {
    isTargetProfile() {
        return this.options?.javaVersion === "26.3" && this.options?.bedrockVersion === "1.26.50.4";
    }

    async copyIfPresent(from, to) {
        if (!await this.output.exists(from)) return false;
        await this.writeImage(to, await this.readImage(from));
        return true;
    }

    async repeatPane(path) {
        if (!await this.output.exists(path)) return false;
        const source = await this.readImage(path);
        const factor = source.getWidth() / 16;
        if (!Number.isInteger(factor) || factor < 1 || source.getHeight() !== 16 * factor) return false;
        const out = await this.createImage(source.getWidth(), source.getHeight());
        for (let x = 0; x < 16; x++) {
            const sx = (x % 2 === 0 ? 8 : 7) * factor;
            out.composite(source.clone().crop(sx, 0, factor, source.getHeight()), x * factor, 0);
        }
        await this.writeImage(path, out);
        return true;
    }

    async convertEndSky() {
        const path = "textures/environment/end_sky.png";
        if (!await this.output.exists(path)) return false;
        const image = await this.readImage(path);
        image.scan(0, 0, image.getWidth(), image.getHeight(), (x, y, idx) => {
            const r = image.bitmap.data[idx], g = image.bitmap.data[idx + 1], b = image.bitmap.data[idx + 2];
            const v = Math.floor((Math.max(r, g, b) + Math.min(r, g, b)) / 2);
            image.bitmap.data[idx] = v;
            image.bitmap.data[idx + 1] = v;
            image.bitmap.data[idx + 2] = v;
        });
        await this.writeImage(path, image);
        return true;
    }

    async createSunVv() {
        const from = "textures/environment/sun.png";
        if (!await this.output.exists(from)) return false;
        const source = await this.readImage(from);
        const factor = source.getWidth() / 32;
        if (!Number.isInteger(factor) || factor < 1 || source.getHeight() !== 32 * factor) return false;
        const out = await this.createImage(source.getWidth(), source.getHeight());
        out.composite(source.clone().crop(12 * factor, 12 * factor, 8 * factor, 8 * factor), 12 * factor, 12 * factor);
        await this.writeImage("textures/environment/sun_vv.png", out);
        return true;
    }

    async createLegacyPig() {
        const from = "textures/entity/pig/pig_v3.png";
        if (!await this.output.exists(from)) return false;
        const source = await this.readImage(from);
        const factor = source.getWidth() / 64;
        if (!Number.isInteger(factor) || factor < 1 || source.getHeight() !== 64 * factor) return false;
        await this.writeImage("textures/entity/pig/pig.png", source.clone().crop(0, 0, 64 * factor, 32 * factor));
        return true;
    }

    async convert() {
        if (!this.isTargetProfile()) return [];
        let generated = 0;

        for (const color of ["", "black", "blue", "brown", "cyan", "gray", "green", "light_blue", "silver", "lime", "magenta", "orange", "pink", "purple", "red", "white", "yellow"]) {
            generated += await this.repeatPane(`textures/blocks/glass_pane_top${color ? "_" + color : ""}.png`) ? 1 : 0;
        }
        generated += await this.convertEndSky() ? 1 : 0;
        generated += await this.createSunVv() ? 1 : 0;
        generated += await this.createLegacyPig() ? 1 : 0;

        for (const [from, to] of [
            ["textures/blocks/carrots_stage3.png", "textures/blocks/carrots_stage_3.png"],
            ["textures/blocks/cherry_log.png", "textures/blocks/cherry_log_side.png"],
            ["textures/blocks/pale_moss_block.png", "textures/blocks/pale_moss.png"],
            ["textures/blocks/shelf_mushroom_stage1.png", "textures/blocks/shelf_mushroom_large.png"],
            ["textures/blocks/shelf_mushroom_stage0.png", "textures/blocks/shelf_mushroom_small.png"],
            ["textures/blocks/stripped_cherry_log.png", "textures/blocks/stripped_cherry_log_side.png"],
            ["textures/entity/boat/cherry.png", "textures/entity/boat/cherry_boat.png"],
            ["textures/entity/boat/mangrove.png", "textures/entity/boat/mangrove_boat.png"],
            ["textures/entity/chicken.png", "textures/entity/chicken/chicken.png"],
            ["textures/entity/guardian/guardian_elder.png", "textures/entity/guardian_elder.png"],
            ["textures/entity/squid/squid.png", "textures/entity/squid.png"]
        ]) generated += await this.copyIfPresent(from, to) ? 1 : 0;

        for (const variant of ["jellie", "ragdoll", "siamese", "tabby"]) {
            generated += await this.copyIfPresent(
                `textures/entity/cat/cat_${variant}_baby.png`,
                `textures/entity/cat/${variant}_baby.png`
            ) ? 1 : 0;
        }

        for (const variant of ["aggressive", "brown", "lazy", "playful", "weak", "worried"]) {
            generated += await this.copyIfPresent(
                `textures/entity/panda/${variant}_panda_baby.png`,
                `textures/entity/panda/panda_${variant}_baby.png`
            ) ? 1 : 0;
        }

        for (const color of ["black", "brown", "cyan", "gray", "green", "light_blue", "light_gray", "lime", "magenta", "orange", "pink", "purple", "red", "white", "yellow"]) {
            generated += await this.copyIfPresent(
                `textures/entity/equipment/llama_body/${color}.png`,
                `textures/entity/llama/decor/decor_${color === "light_gray" ? "silver" : color}.png`
            ) ? 1 : 0;
        }

        if (await this.output.exists("textures/items/sulfur_cube_spawn_egg.png")) {
            generated += await this.copyIfPresent("textures/items/sulfur_cube_spawn_egg.png", "textures/items/spawn_egg_sulfur_cube.png") ? 1 : 0;
            generated += await this.copyIfPresent("textures/items/sulfur_cube_spawn_egg.png", "textures/items/spawn_eggs/spawn_egg_sulfur_cube.png") ? 1 : 0;
        }

        this.log.log(`Java 26.3 exact family parity: ${generated} textures generated/updated`);
        return [];
    }

    static get DEFAULT_CONVERTER_DATA() { return [["java26-exact-family-parity"]]; }
}

export { ModernExactParityConverter };
