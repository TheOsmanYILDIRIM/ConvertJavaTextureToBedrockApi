import { AbstractConverter } from "@modifiedcommand/convert-base-api";

/**
 * Class ChestSideConverter
 */
class ChestSideConverter extends AbstractConverter {
    /**
     * @inheritDoc
     */
    async convert() {
        const [from, to] = this.data;

        // Modern profile already generated a 16x16 face from the original Java atlas.
        if (this.options?.javaVersion === "26.3" && this.options?.bedrockVersion === "1.26.50.4" && await this.output.exists(to)) return [];

        if (!await this.output.exists(from)) {
            return [];
        }

        this.log.log(`Create chest side ${to}`);

        const image_from = await this.readImage(from);

        image_from.ensureMinWidth(64);

        const factor = (image_from.getWidth() / 64);

        const image = await this.createImage((14 * factor), (14 * factor));

        image.composite(image_from.clone().crop((28 * factor), (14 * factor), (14 * factor), (5 * factor)), 0, 0);

        image.composite(image_from.clone().crop((28 * factor), (34 * factor), (14 * factor), (9 * factor)), 0, (5 * factor));

        await this.writeImage(to, image);

        return [];
    }

    /**
     * @inheritDoc
     */
    static get DEFAULT_CONVERTER_DATA() {
        return [
            ["textures/entity/chest/normal.png", "textures/blocks/chest_side.png"],
            ["textures/entity/chest/ender.png", "textures/blocks/ender_chest_side.png"]
        ];
    }
}

export { ChestSideConverter };