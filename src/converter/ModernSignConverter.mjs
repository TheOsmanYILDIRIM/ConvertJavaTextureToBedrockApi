import { AbstractConverter } from "@modifiedcommand/convert-base-api";

/** Java 26.2+ 32x32 block-model sign textures -> legacy Bedrock 64x32 atlases.
 * Two templates: standing sign and hanging sign, each shared by all woods.
 * Geometry-dependent fidelity still requires in-game validation.
 */
class ModernSignConverter extends AbstractConverter {
    async convert() {
        if (this.options?.javaVersion !== "26.3") return [];
        const [wood, hanging] = this.data;
        const input = `textures/blocks/${wood}${hanging ? "_hanging" : ""}_sign.png`;
        if (!await this.output.exists(input)) return [];
        const suffix = new Set(["bamboo","cherry","mangrove","pale_oak","poplar"]);
        const targetName = hanging ? `${wood}_hanging_sign`
            : wood === "oak" ? "sign"
            : suffix.has(wood) ? `${wood}_sign`
            : `sign_${wood === "dark_oak" ? "darkoak" : wood}`;
        const output = `textures/entity/${targetName}.png`;
        if (await this.output.exists(output)) return [];
        const image = await this.readImage(input);
        const factor = image.getWidth() / 32;
        if (!Number.isInteger(factor) || factor < 1 || image.getHeight() !== 32 * factor)
            throw new Error(`Unexpected sign tile dimensions for ${wood}`);
        const atlas = await this.createImage(64 * factor, 32 * factor);
        const paste = (sx,sy,w,h,dx,dy) =>
            atlas.composite(image.clone().crop(sx*factor,sy*factor,w*factor,h*factor),dx*factor,dy*factor);
        if (hanging) {
            // Java sign board faces are the 14x10 tiles at y=16; Bedrock
            // places the pair adjacent at (2,14) and (18,14).
            paste(0,0,16,6, 4,0);
            paste(16,0,16,6, 10,6);
            paste(24,7,8,6, 2,6);
            paste(2,14,14,2, 2,12);
            paste(2,16,14,10, 2,14);
            paste(18,16,14,10, 18,14);
            paste(2,26,14,2, 16,12);
        } else {
            // Exact front/back/pole locations for the 32x32 Java sign tile
            // and Mojang's classic 64x32 Bedrock standing-sign atlas.
            paste(0,0,24,2, 2,0);
            paste(0,14,24,2, 28,0);
            paste(0,2,24,12, 2,2);
            paste(0,16,24,12, 28,2);
            paste(24,2,2,12, 26,2);
            paste(24,16,2,12, 0,2);
            paste(28,0,2,14, 2,16);
            paste(30,0,2,14, 4,16);
        }
        await this.writeImage(output,atlas);
        return [];
    }
    static get DEFAULT_CONVERTER_DATA() {
        const woods = ["oak","spruce","birch","jungle","acacia","dark_oak",
            "mangrove","cherry","bamboo","crimson","warped","pale_oak","poplar"];
        return woods.flatMap(wood=>[[wood,false],[wood,true]]);
    }
}
export { ModernSignConverter };
