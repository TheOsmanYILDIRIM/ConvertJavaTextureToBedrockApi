import { AbstractConverter } from "@modifiedcommand/convert-base-api";

/** Split Java copper-chest entity atlases into Bedrock inventory face textures. */
class ModernChestInventoryConverter extends AbstractConverter {
    isTargetProfile() {
        return this.options?.javaVersion === "26.3" && this.options?.bedrockVersion === "1.26.50.4";
    }

    async extract(from, prefix) {
        if (!await this.output.exists(from)) return 0;
        const source = await this.readImage(from);
        source.ensureMinWidth(64);
        const factor = source.getWidth() / 64;
        if (!Number.isInteger(factor) || factor < 1 || source.getHeight() !== 64 * factor) return 0;

        const front = await this.createImage(14 * factor, 14 * factor);
        front.composite(source.clone().crop(14 * factor, 14 * factor, 14 * factor, 5 * factor), 0, 0);
        front.composite(source.clone().crop(14 * factor, 34 * factor, 14 * factor, 9 * factor), 0, 5 * factor);
        front.composite(source.clone().crop(factor, factor, 2 * factor, 4 * factor), 6 * factor, 3 * factor);

        const side = await this.createImage(14 * factor, 14 * factor);
        side.composite(source.clone().crop(28 * factor, 14 * factor, 14 * factor, 5 * factor), 0, 0);
        side.composite(source.clone().crop(28 * factor, 34 * factor, 14 * factor, 9 * factor), 0, 5 * factor);

        await this.writeImage(`textures/blocks/${prefix}_front.png`, front);
        await this.writeImage(`textures/blocks/${prefix}_side.png`, side);
        await this.writeImage(`textures/blocks/${prefix}_top.png`, source.clone().crop(28 * factor, 0, 14 * factor, 14 * factor));
        return 3;
    }

    async convert() {
        if (!this.isTargetProfile()) return [];
        let generated = 0;
        for (const [from, prefix] of [
            ["textures/entity/chest/copper.png", "copper_chest_inventory"],
            ["textures/entity/chest/copper_exposed.png", "exposed_copper_chest_inventory"],
            ["textures/entity/chest/copper_weathered.png", "weathered_copper_chest_inventory"],
            ["textures/entity/chest/copper_oxidized.png", "oxidized_copper_chest_inventory"]
        ]) generated += await this.extract(from, prefix);
        this.log.log(`Java 26.3 copper chest inventory faces: ${generated} textures generated`);
        return [];
    }

    static get DEFAULT_CONVERTER_DATA() { return [["java26-copper-chest-inventory"]]; }
}

export { ModernChestInventoryConverter };
