import { AbstractConverter } from "@modifiedcommand/convert-base-api";

/**
 * Class OpaqueConverter
 */
class OpaqueConverter extends AbstractConverter {
    /**
     * @inheritDoc
     */
    async convert() {
        const [from, to] = this.data;

        if (!await this.output.exists(from)) {
            return [];
        }

        this.log.log(`Create opaque ${to}`);

        let image;
        try {
            image = await this.readImage(from);
        } catch (error) {
            this.log.warn(`Opaque variant skipped: ${from} -> ${to} (${error.message})`);
            return [];
        }

        // Bedrock's opaque leaf variants do not use pure black for transparent
        // holes. Pick a dark shade from the source pack's dominant colour
        // family instead, so custom packs retain their own palette.
        const pixels = [];
        let chromaR = 0;
        let chromaG = 0;
        let chromaB = 0;
        for (let y = 0; y < image.getHeight(); y++) {
            for (let x = 0; x < image.getWidth(); x++) {
                const rgba = image.getPixelColor(x, y) >>> 0;
                const a = rgba & 0xff;
                if (a === 0) continue;
                const r = (rgba >>> 24) & 0xff;
                const g = (rgba >>> 16) & 0xff;
                const b = (rgba >>> 8) & 0xff;
                const sum = Math.max(1, r + g + b);
                const cr = r / sum;
                const cg = g / sum;
                const cb = b / sum;
                pixels.push({r, g, b, cr, cg, cb});
                chromaR += cr;
                chromaG += cg;
                chromaB += cb;
            }
        }

        let fill = {r: 0, g: 0, b: 0};
        if (pixels.length > 0) {
            const center = {
                r: chromaR / pixels.length,
                g: chromaG / pixels.length,
                b: chromaB / pixels.length
            };
            const ranked = pixels.map(pixel => ({
                ...pixel,
                distance: Math.hypot(
                    pixel.cr - center.r,
                    pixel.cg - center.g,
                    pixel.cb - center.b
                ),
                luma: (0.2126 * pixel.r) + (0.7152 * pixel.g) + (0.0722 * pixel.b)
            }));
            let candidates = ranked.filter(pixel => pixel.distance <= 0.10);
            if (candidates.length < Math.max(4, pixels.length * 0.25)) {
                ranked.sort((a, b) => a.distance - b.distance);
                candidates = ranked.slice(0, Math.max(4, Math.ceil(pixels.length * 0.5)));
            }
            candidates.sort((a, b) => a.luma - b.luma);
            fill = candidates[0];
        }

        const hex = "#" + [fill.r, fill.g, fill.b]
            .map(value => value.toString(16).padStart(2, "0"))
            .join("");
        const background_image = await this.createImage(image.getWidth(), image.getHeight(), hex);
        background_image.composite(image, 0, 0);

        try {
            await this.writeImage(to, background_image);
        } catch (error) {
            this.log.warn(`Opaque variant skipped: ${from} -> ${to} (${error.message})`);
        }

        return [];
    }

    /**
     * @inheritDoc
     */
    static get DEFAULT_CONVERTER_DATA() {
        return [
            // Leaves
			["textures/blocks/azalea_leaves.png", "textures/blocks/azalea_leaves_opaque.png"],
			["textures/blocks/azalea_leaves_flowers.png", "textures/blocks/azalea_leaves_flowers_opaque.png"],
			["textures/blocks/cherry_leaves.png", "textures/blocks/cherry_leaves_opaque.png"],
            ["textures/blocks/leaves_acacia.png", "textures/blocks/leaves_acacia_opaque.png"],
            ["textures/blocks/leaves_big_oak.png", "textures/blocks/leaves_big_oak_opaque.png"],
            ["textures/blocks/leaves_birch.png", "textures/blocks/leaves_birch_opaque.png"],
            ["textures/blocks/leaves_jungle.png", "textures/blocks/leaves_jungle_opaque.png"],
            ["textures/blocks/leaves_oak.png", "textures/blocks/leaves_oak_opaque.png"],
            ["textures/blocks/leaves_spruce.png", "textures/blocks/leaves_spruce_opaque.png"],
			["textures/blocks/mangrove_leaves.png", "textures/blocks/mangrove_leaves_opaque.png"],
			["textures/blocks/orange_poplar_leaves.png", "textures/blocks/orange_poplar_leaves_opaque.png"],
			["textures/blocks/pale_oak_leaves.png", "textures/blocks/pale_oak_leaves_opaque.png"],
			["textures/blocks/red_poplar_leaves.png", "textures/blocks/red_poplar_leaves_opaque.png"],
			["textures/blocks/yellow_poplar_leaves.png", "textures/blocks/yellow_poplar_leaves_opaque.png"]
        ];
    }
}

export { OpaqueConverter };
