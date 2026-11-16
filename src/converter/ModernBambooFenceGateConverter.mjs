import { AbstractConverter } from "@modifiedcommand/convert-base-api";

/**
 * Java 26.3 bamboo fence-gate texture -> Bedrock UV layout.
 */
class ModernBambooFenceGateConverter extends AbstractConverter {
    async convert() {
        if (this.options?.javaVersion !== "26.3") return [];

        const [path] = this.data;
        if (!await this.output.exists(path)) return [];

        const image = await this.readImage(path);
        const factor = image.getWidth() / 16;
        if (!Number.isInteger(factor) || factor < 1 || image.getHeight() !== 16 * factor) {
            throw new Error("Unexpected bamboo fence gate dimensions");
        }

        const output = await this.createImage(16 * factor, 16 * factor);
        const paste = (sx,sy,w,h,dx,dy) =>
            output.composite(
                image.clone().crop(sx*factor,sy*factor,w*factor,h*factor),
                dx*factor,dy*factor
            );

        // Mojang Bedrock keeps five UV islands from Java's compact gate sheet.
        paste(0,0,2,13, 0,0);
        paste(2,1,4,5, 3,1);
        paste(2,9,4,3, 3,9);
        paste(6,1,2,11, 8,1);
        paste(8,1,2,11, 11,1);

        await this.writeImage(path, output);
        return [];
    }

    static get DEFAULT_CONVERTER_DATA() {
        return [["textures/blocks/bamboo_fence_gate.png"]];
    }
}

export { ModernBambooFenceGateConverter };
