import { AbstractConverter } from "@modifiedcommand/convert-base-api";

/**
 * Derive Bedrock 16x16 inventory/block chest faces from Java's 64x64 entity atlas.
 *
 * Bedrock does not scale the Java 14px faces to 16px. The 14px face stays at its
 * native pixel phase and sits inside a one-pixel UV rim. Front/side also keep the
 * complete 5px lid + 10px base height (15px), with the remaining row used as the
 * top rim. This preserves custom-pack pixels instead of baking Bedrock vanilla art.
 */
class ModernChestInventoryConverter extends AbstractConverter {
    isTargetProfile() {
        return this.options?.javaVersion === "26.3" && this.options?.bedrockVersion === "1.26.50.4";
    }

    async padTopAndSides(core, factor) {
        const out = await this.createImage(16 * factor, 16 * factor);
        out.composite(core, factor, factor);
        out.composite(core.clone().crop(0, 0, 14 * factor, factor), factor, 0);
        out.composite(core.clone().crop(0, 0, factor, 15 * factor), 0, factor);
        out.composite(core.clone().crop(13 * factor, 0, factor, 15 * factor), 15 * factor, factor);
        out.composite(core.clone().crop(0, 0, factor, factor), 0, 0);
        out.composite(core.clone().crop(13 * factor, 0, factor, factor), 15 * factor, 0);
        return out;
    }

    async padAllSides(core, factor) {
        const out = await this.createImage(16 * factor, 16 * factor);
        out.composite(core, factor, factor);
        out.composite(core.clone().crop(0, 0, 14 * factor, factor), factor, 0);
        out.composite(core.clone().crop(0, 13 * factor, 14 * factor, factor), factor, 15 * factor);
        out.composite(core.clone().crop(0, 0, factor, 14 * factor), 0, factor);
        out.composite(core.clone().crop(13 * factor, 0, factor, 14 * factor), 15 * factor, factor);
        out.composite(core.clone().crop(0, 0, factor, factor), 0, 0);
        out.composite(core.clone().crop(13 * factor, 0, factor, factor), 15 * factor, 0);
        out.composite(core.clone().crop(0, 13 * factor, factor, factor), 0, 15 * factor);
        out.composite(core.clone().crop(13 * factor, 13 * factor, factor, factor), 15 * factor, 15 * factor);
        return out;
    }

    async buildVerticalFace(source, x, factor) {
        const core = await this.createImage(14 * factor, 15 * factor);
        core.composite(source.clone().crop(x * factor, 14 * factor, 14 * factor, 5 * factor).rotateSimple(180), 0, 0);
        core.composite(source.clone().crop(x * factor, 33 * factor, 14 * factor, 10 * factor).rotateSimple(180), 0, 5 * factor);
        return this.padTopAndSides(core, factor);
    }

    async buildTopFace(source, factor) {
        const core = source.clone().crop(28 * factor, 0, 14 * factor, 14 * factor).flip(true, false);
        return this.padAllSides(core, factor);
    }

    async extract(from, targets) {
        if (!await this.output.exists(from)) return 0;
        const source = await this.readImage(from);
        source.ensureMinWidth(64);
        const factor = source.getWidth() / 64;
        if (!Number.isInteger(factor) || factor < 1 || source.getHeight() !== 64 * factor) return 0;

        let generated = 0;
        if (targets.front) { await this.writeImage(targets.front, await this.buildVerticalFace(source, 42, factor)); generated++; }
        if (targets.side) { await this.writeImage(targets.side, await this.buildVerticalFace(source, 28, factor)); generated++; }
        if (targets.top) { await this.writeImage(targets.top, await this.buildTopFace(source, factor)); generated++; }
        return generated;
    }

    async convert() {
        if (!this.isTargetProfile()) return [];
        let generated = 0;
        const family = [
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
        ];
        for (const [from, targets] of family) generated += await this.extract(from, targets);
        this.log.log(`Java 26.3 chest inventory family: ${generated} source-derived textures generated`);
        return [];
    }

    static get DEFAULT_CONVERTER_DATA() { return [["java26-chest-inventory-family"]]; }
}

export { ModernChestInventoryConverter };
