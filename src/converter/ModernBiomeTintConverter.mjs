import { AbstractConverter } from "@modifiedcommand/convert-base-api";

/**
 * Modern Java 26.3 biome tint synthesis.
 *
 * Bedrock's carried textures are pre-tinted while Java keeps biome-tintable
 * sources grey.  We preserve Bedrock's vanilla baseline tint but modulate it
 * by the user's Java colormap relative to the pinned Java vanilla colormap.
 * This makes custom colormaps affect the result without baking Mojang's
 * vanilla colormap pixels directly into every pack.
 */
class ModernBiomeTintConverter extends AbstractConverter {
    isTargetProfile() {
        return this.options?.javaVersion === "26.3" && this.options?.bedrockVersion === "1.26.50.4";
    }

    async sampleColormap(path, vanillaSample) {
        if (!await this.output.exists(path)) return null;
        const map = await this.readImage(path);
        const x = Math.round(51 / 255 * (map.getWidth() - 1));
        const y = Math.round(173 / 255 * (map.getHeight() - 1));
        const idx = (y * map.getWidth() + x) * 4;
        const sample = [map.bitmap.data[idx], map.bitmap.data[idx + 1], map.bitmap.data[idx + 2]];
        return sample.map((value, channel) => vanillaSample[channel] ? value / vanillaSample[channel] : 1);
    }

    async tint(from, to, baseTint, colormapPath, vanillaSample) {
        if (!await this.output.exists(from)) return false;
        const image = await this.readImage(from);
        const relative = await this.sampleColormap(colormapPath, vanillaSample) ?? [1, 1, 1];
        const tint = baseTint.map((value, channel) => Math.max(0, Math.min(255, Math.round(value * relative[channel]))));
        image.scan(0, 0, image.getWidth(), image.getHeight(), (x, y, idx) => {
            image.bitmap.data[idx] = Math.round(image.bitmap.data[idx] * tint[0] / 255);
            image.bitmap.data[idx + 1] = Math.round(image.bitmap.data[idx + 1] * tint[1] / 255);
            image.bitmap.data[idx + 2] = Math.round(image.bitmap.data[idx + 2] * tint[2] / 255);
        });
        await this.writeImage(to, image);
        return true;
    }

    async convert() {
        if (!this.isTargetProfile()) return [];
        let generated = 0;
        const grassMap = "textures/colormap/grass.png";
        const foliageMap = "textures/colormap/foliage.png";
        const vanillaGrassSample = [145, 189, 89];
        const vanillaFoliageSample = [119, 171, 47];

        const grassFamilies = [
            ["textures/blocks/grass_top.png", "textures/blocks/grass_carried.png", [135, 205, 73]],
            ["textures/blocks/double_plant_fern_top.png", "textures/blocks/double_plant_fern_carried.png", [148, 222, 79]],
            ["textures/blocks/double_plant_grass_top.png", "textures/blocks/double_plant_grass_carried.png", [141, 216, 75]],
            ["textures/blocks/fern.png", "textures/blocks/fern_carried.png", [123, 188, 105]],
            ["textures/blocks/tallgrass.png", "textures/blocks/tallgrass_carried.png", [132, 196, 70]]
        ];
        for (const [from, to, tint] of grassFamilies) {
            generated += await this.tint(from, to, tint, grassMap, vanillaGrassSample) ? 1 : 0;
        }

        const foliageFamilies = [
            ["textures/blocks/vine.png", "textures/blocks/vine_carried.png", [166, 235, 90]],
            ["textures/blocks/leaves_acacia.png", "textures/blocks/leaves_acacia_carried.png", [76, 195, 21]],
            ["textures/blocks/leaves_big_oak.png", "textures/blocks/leaves_big_oak_carried.png", [77, 180, 21]],
            ["textures/blocks/leaves_birch.png", "textures/blocks/leaves_birch_carried.png", [111, 156, 72]],
            ["textures/blocks/leaves_jungle.png", "textures/blocks/leaves_jungle_carried.png", [67, 173, 17]],
            ["textures/blocks/leaves_oak.png", "textures/blocks/leaves_oak_carried.png", [70, 180, 20]],
            ["textures/blocks/leaves_spruce.png", "textures/blocks/leaves_spruce_carried.png", [107, 170, 107]]
        ];
        for (const [from, to, tint] of foliageFamilies) {
            generated += await this.tint(from, to, tint, foliageMap, vanillaFoliageSample) ? 1 : 0;
        }
        generated += await this.tint("textures/blocks/bush.png", "textures/items/bush.png", [122, 187, 105], foliageMap, vanillaFoliageSample) ? 1 : 0;

        this.log.log(`Java 26.3 colormap-relative carried tint synthesis: ${generated} textures generated/updated`);
        return [];
    }

    static get DEFAULT_CONVERTER_DATA() { return [["java26-colormap-tint"]]; }
}

export { ModernBiomeTintConverter };
