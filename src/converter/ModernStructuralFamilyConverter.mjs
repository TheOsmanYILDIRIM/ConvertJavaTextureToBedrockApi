import { AbstractConverter } from "@modifiedcommand/convert-base-api";

/** Java 26.3 structural families assembled from slices/layers/frames before versioned renames consume them. */
class ModernStructuralFamilyConverter extends AbstractConverter {
    isTargetProfile() {
        return this.options?.javaVersion === "26.3" && this.options?.bedrockVersion === "1.26.50.4";
    }

    async splitCopperChain(stage) {
        const prefix = stage ? `${stage}_` : "";
        const from = `textures/blocks/${prefix}copper_chain.png`;
        if (!await this.output.exists(from)) return 0;
        const source = await this.readImage(from);
        const factor = source.getWidth() / 16;
        if (!Number.isInteger(factor) || factor < 1 || source.getHeight() !== 16 * factor) return 0;
        const part2 = await this.createImage(16 * factor, 16 * factor);
        part2.composite(source.clone().crop(0, 0, 3 * factor, 16 * factor), 0, 0);
        const part1 = await this.createImage(16 * factor, 16 * factor);
        part1.composite(source.clone().crop(3 * factor, 0, 3 * factor, 16 * factor), 0, 0);
        await this.writeImage(`textures/blocks/${prefix}copper_chain1.png`, part1);
        await this.writeImage(`textures/blocks/${prefix}copper_chain2.png`, part2);
        return 2;
    }

    async combineEyeblossom() {
        const basePath = "textures/blocks/eyeblossom_stem_blooming.png";
        const emissivePath = "textures/blocks/eyeblossom_eyes_blooming.png";
        if (!(await this.output.exists(basePath) && await this.output.exists(emissivePath))) return false;
        const image = await this.readImage(basePath);
        const emissive = await this.readImage(emissivePath);
        if (image.getWidth() !== emissive.getWidth() || image.getHeight() !== emissive.getHeight()) return false;
        image.composite(emissive, 0, 0);
        await this.writeImage("textures/blocks/eyeblossom_blooming.png", image);
        return true;
    }

    async maskLightningRod() {
        const colorPath = "textures/blocks/lightning_rod_on.png";
        const maskPath = "textures/blocks/lightning_rod.png";
        if (!(await this.output.exists(colorPath) && await this.output.exists(maskPath))) return false;
        const image = await this.readImage(colorPath);
        const mask = await this.readImage(maskPath);
        if (image.getWidth() !== mask.getWidth() || image.getHeight() !== mask.getHeight()) return false;
        image.scan(0, 0, image.getWidth(), image.getHeight(), (x, y, idx) => {
            image.bitmap.data[idx + 3] = mask.bitmap.data[idx + 3];
        });
        await this.writeImage("textures/blocks/lightning_rod_powered.png", image);
        return true;
    }

    async combineBundle(color) {
        const prefix = color ? `bundle_${color}` : "bundle";
        const backPath = `textures/items/${prefix}_open_back.png`;
        const frontPath = `textures/items/${prefix}_open_front.png`;
        const to = `textures/items/${prefix}_open.png`;
        if (!(await this.output.exists(backPath) && await this.output.exists(frontPath))) return false;
        const back = await this.readImage(backPath);
        const front = await this.readImage(frontPath);
        if (back.getWidth() !== front.getWidth() || back.getHeight() !== front.getHeight()) return false;
        back.composite(front, 0, 0);
        await this.writeImage(to, back);
        return true;
    }

    async stackFrames(prefix, indexes, to, direction = "vertical", pad = 0) {
        const paths = indexes.map(i => `textures/${prefix}${i}.png`);
        for (const path of paths) if (!await this.output.exists(path)) return false;
        const first = await this.readImage(paths[0]);
        const fw = first.getWidth(), fh = first.getHeight();
        const cellW = fw + pad * 2, cellH = fh + pad * 2;
        const width = direction === "horizontal" ? cellW * paths.length : cellW;
        const height = direction === "vertical" ? cellH * paths.length : cellH;
        const atlas = await this.createImage(width, height);
        for (let i = 0; i < paths.length; i++) {
            const frame = i === 0 ? first : await this.readImage(paths[i]);
            if (frame.getWidth() !== fw || frame.getHeight() !== fh) return false;
            const x = direction === "horizontal" ? i * cellW + pad : pad;
            const y = direction === "vertical" ? i * cellH + pad : pad;
            atlas.composite(frame, x, y);
        }
        await this.writeImage(to, atlas);
        return true;
    }

    async convert() {
        if (!this.isTargetProfile()) return [];
        let generated = 0;

        // One Java chain texture contains both Bedrock chain variants; apply to every weathering sibling.
        for (const stage of ["", "exposed", "weathered", "oxidized"]) generated += await this.splitCopperChain(stage);
        generated += await this.combineEyeblossom() ? 1 : 0;
        generated += await this.maskLightningRod() ? 1 : 0;

        // Bundle open-front/open-back are two Java layers, one Bedrock item texture.
        for (const color of ["", "black", "blue", "brown", "cyan", "gray", "green", "light_blue", "light_gray", "lime", "magenta", "orange", "pink", "purple", "red", "white", "yellow"]) {
            generated += await this.combineBundle(color) ? 1 : 0;
        }

        // Compass families: 32 separate Java frames -> one vertical Bedrock atlas.
        const compassFrames = Array.from({length:32}, (_, i) => String(i).padStart(2, "0"));
        generated += await this.stackFrames("items/compass_", compassFrames, "textures/items/compass_atlas.png") ? 1 : 0;
        generated += await this.stackFrames("items/recovery_compass_", compassFrames, "textures/items/recovery_compass_atlas.png") ? 1 : 0;

        // Particle frame families selected in the review; unselected siblings follow the same layout rule.
        generated += await this.stackFrames("particle/geyser_base_", ["01","02","03","04","05","06","07","08"], "textures/particle/geyser_base.png") ? 1 : 0;
        generated += await this.stackFrames("particle/sculk_charge_pop_", [0,1,2,3], "textures/particle/sculk_charge_pop.png") ? 1 : 0;
        generated += await this.stackFrames("particle/sculk_soul_", [0,1,2,3,4,5,6,7,8,9,10], "textures/particle/sculk_soul.png") ? 1 : 0;
        generated += await this.stackFrames("particle/soul_", [0,1,2,3,4,5,6,7,8,9,10], "textures/particle/soul.png") ? 1 : 0;
        generated += await this.stackFrames("particle/small_gust_", [0,1,2,3,4,5,6], "textures/particle/small_gust.png", "horizontal") ? 1 : 0;
        for (const color of ["orange", "red", "yellow"]) {
            generated += await this.stackFrames(`particle/${color}_poplar_`, [1,2,3,4], `textures/particle/${color}_poplar_leaves_atlas.png`, "horizontal", 1) ? 1 : 0;
        }

        this.log.log(`Java 26.3 structural family synthesis: ${generated} textures generated/updated`);
        return [];
    }

    static get DEFAULT_CONVERTER_DATA() { return [["java26-structural-families"]]; }
}

export { ModernStructuralFamilyConverter };
