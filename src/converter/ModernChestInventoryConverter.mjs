import { AbstractConverter } from "@modifiedcommand/convert-base-api";

/**
 * Split Java chest entity atlases into Bedrock inventory/block-face textures.
 * Java's model face is 14 units wide; current Bedrock inventory textures are
 * 16x16.  The final resize is nearest-neighbour so custom pixel art stays crisp.
 */
class ModernChestInventoryConverter extends AbstractConverter {
    isTargetProfile() {
        return this.options?.javaVersion === "26.3" && this.options?.bedrockVersion === "1.26.50.4";
    }

    async nearest14To16(image, factor) {
        const srcSize = 14 * factor;
        const dstSize = 16 * factor;
        const out = await this.createImage(dstSize, dstSize);
        for (let y = 0; y < dstSize; y++) {
            const sy = Math.min(srcSize - 1, Math.floor(y * srcSize / dstSize));
            for (let x = 0; x < dstSize; x++) {
                const sx = Math.min(srcSize - 1, Math.floor(x * srcSize / dstSize));
                const si = (sy * srcSize + sx) * 4;
                const di = (y * dstSize + x) * 4;
                out.bitmap.data[di] = image.bitmap.data[si];
                out.bitmap.data[di + 1] = image.bitmap.data[si + 1];
                out.bitmap.data[di + 2] = image.bitmap.data[si + 2];
                out.bitmap.data[di + 3] = image.bitmap.data[si + 3];
            }
        }
        return out;
    }

    async extract(from, targets) {
        if (!await this.output.exists(from)) return 0;
        const source = await this.readImage(from);
        source.ensureMinWidth(64);
        const factor = source.getWidth() / 64;
        if (!Number.isInteger(factor) || factor < 1 || source.getHeight() !== 64 * factor) return 0;

        const front14 = await this.createImage(14 * factor, 14 * factor);
        front14.composite(source.clone().crop(14 * factor, 14 * factor, 14 * factor, 5 * factor), 0, 0);
        front14.composite(source.clone().crop(14 * factor, 34 * factor, 14 * factor, 9 * factor), 0, 5 * factor);
        front14.composite(source.clone().crop(factor, factor, 2 * factor, 4 * factor), 6 * factor, 3 * factor);

        const side14 = await this.createImage(14 * factor, 14 * factor);
        side14.composite(source.clone().crop(28 * factor, 14 * factor, 14 * factor, 5 * factor), 0, 0);
        side14.composite(source.clone().crop(28 * factor, 34 * factor, 14 * factor, 9 * factor), 0, 5 * factor);

        const top14 = source.clone().crop(28 * factor, 0, 14 * factor, 14 * factor);
        let generated = 0;
        if (targets.front) { await this.writeImage(targets.front, await this.nearest14To16(front14, factor)); generated++; }
        if (targets.side) { await this.writeImage(targets.side, await this.nearest14To16(side14, factor)); generated++; }
        if (targets.top) { await this.writeImage(targets.top, await this.nearest14To16(top14, factor)); generated++; }
        return generated;
    }

    async convert() {
        if (!this.isTargetProfile()) return [];
        let generated = 0;
        for (const [from, targets] of [
            ["textures/entity/chest/normal.png", {
                front:"textures/blocks/chest_front.png", side:"textures/blocks/chest_side.png", top:"textures/blocks/chest_top.png"
            }],
            ["textures/entity/chest/trapped.png", {
                front:"textures/blocks/trapped_chest_front.png"
            }],
            ["textures/entity/chest/ender.png", {
                front:"textures/blocks/ender_chest_front.png", side:"textures/blocks/ender_chest_side.png", top:"textures/blocks/ender_chest_top.png"
            }],
            ["textures/entity/chest/copper.png", {
                front:"textures/blocks/copper_chest_inventory_front.png", side:"textures/blocks/copper_chest_inventory_side.png", top:"textures/blocks/copper_chest_inventory_top.png"
            }],
            ["textures/entity/chest/copper_exposed.png", {
                front:"textures/blocks/exposed_copper_chest_inventory_front.png", side:"textures/blocks/exposed_copper_chest_inventory_side.png", top:"textures/blocks/exposed_copper_chest_inventory_top.png"
            }],
            ["textures/entity/chest/copper_weathered.png", {
                front:"textures/blocks/weathered_copper_chest_inventory_front.png", side:"textures/blocks/weathered_copper_chest_inventory_side.png", top:"textures/blocks/weathered_copper_chest_inventory_top.png"
            }],
            ["textures/entity/chest/copper_oxidized.png", {
                front:"textures/blocks/oxidized_copper_chest_inventory_front.png", side:"textures/blocks/oxidized_copper_chest_inventory_side.png", top:"textures/blocks/oxidized_copper_chest_inventory_top.png"
            }]
        ]) generated += await this.extract(from, targets);
        this.log.log(`Java 26.3 chest inventory family: ${generated} textures generated`);
        return [];
    }

    static get DEFAULT_CONVERTER_DATA() { return [["java26-chest-inventory-family"]]; }
}

export { ModernChestInventoryConverter };
