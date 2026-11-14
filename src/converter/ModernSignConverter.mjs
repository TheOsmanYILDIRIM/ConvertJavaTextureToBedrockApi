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
        const targetName = hanging ? `${wood}_hanging_sign` : (wood === "oak" ? "sign" : `sign_${wood}`);
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
            // Two faces on the sign board; chains are sampled from the
            // 32px Java model texture's upper 8px area.
            paste(2,16,14,10, 4,4);
            paste(18,16,14,10, 24,4);
            paste(2,14,14,2, 4,2);
            paste(22,6,6,8, 2,18);
            paste(4,6,6,8, 12,18);
        } else {
            // Faces from template_sign_rot_0.json (model UV 0..16 mapped
            // onto a 32px tile); Bedrock's board/pole texture is 64x32.
            paste(0,16,24,12, 2,2);
            paste(0,2,24,12, 28,2);
            paste(24,2,2,12, 0,2);
            paste(24,16,2,12, 26,2);
            paste(28,0,2,14, 2,17);
            paste(30,0,2,14, 4,17);
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
