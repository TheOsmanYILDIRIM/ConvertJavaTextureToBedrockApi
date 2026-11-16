import { AbstractConverter } from "@modifiedcommand/convert-base-api";
import { DeleteConverter } from "./DeleteConverter.mjs";

/**
 * Class ArrowConverter
 */
class ArrowConverter extends AbstractConverter {

    rgbToHsv(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
        let h = 0;
        if (d) {
            if (max === r) h = ((g - b) / d) % 6;
            else if (max === g) h = (b - r) / d + 2;
            else h = (r - g) / d + 4;
            h /= 6;
            if (h < 0) h += 1;
        }
        return [h, max === 0 ? 0 : d / max, max];
    }

    hsvToRgb(h, s, v) {
        const i = Math.floor(h * 6);
        const f = h * 6 - i;
        const p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s);
        const table = [[v,t,p],[q,v,p],[p,v,t],[p,q,v],[t,p,v],[v,p,q]];
        return table[i % 6].map(x => Math.max(0, Math.min(255, Math.round(x * 255))));
    }

    async convertModern(from, to) {
        if (!await this.output.exists(from)) return [];
        const source = await this.readImage(from);
        const factor = source.getWidth() / 32;
        if (!Number.isInteger(factor) || factor < 1 || source.getHeight() !== 32 * factor) return [];

        const top = source.clone().crop(0, 0, 16 * factor, 10 * factor);
        const clear = (x, y, w, h) => top.scan(x * factor, y * factor, w * factor, h * factor, (px, py, idx) => {
            top.bitmap.data[idx] = 0;
            top.bitmap.data[idx + 1] = 0;
            top.bitmap.data[idx + 2] = 0;
            top.bitmap.data[idx + 3] = 0;
        });
        // Java keeps a cross-shaped unused island inside the left 16px half.
        clear(7, 5, 1, 5);
        clear(5, 7, 5, 1);

        const lower = top.clone();
        lower.scan(0, 0, lower.getWidth(), lower.getHeight(), (x, y, idx) => {
            if (!lower.bitmap.data[idx + 3]) return;
            const r = lower.bitmap.data[idx], g = lower.bitmap.data[idx + 1], b = lower.bitmap.data[idx + 2];
            let [h, s, v] = this.rgbToHsv(r, g, b);
            if (s > 0.02) {
                h = (h - 0.2322 + 1) % 1;
                s *= 0.995;
            }
            if (v < 0.999) v *= 0.99;
            const [nr, ng, nb] = this.hsvToRgb(h, s, v);
            lower.bitmap.data[idx] = nr;
            lower.bitmap.data[idx + 1] = ng;
            lower.bitmap.data[idx + 2] = nb;
        });

        const out = await this.createImage(32 * factor, 32 * factor);
        out.composite(top, 0, 0);
        out.composite(lower, 0, 10 * factor);
        await this.writeImage(to, out);
        return [new DeleteConverter(from)];
    }

    /**
     * @inheritDoc
     */
    async convert() {
        const [from, to] = this.data;

        if (this.options?.javaVersion === "26.3" && this.options?.bedrockVersion === "1.26.50.4") {
            return this.convertModern(from, to);
        }

        const to_delete = [];

        if (!await this.output.exists(from)) {
            return to_delete;
        }

        this.log.log(`Convert arrow ${to}`);

        const image_from = await this.readImage(from);

        const factor = (image_from.getWidth() / 32);

        const image = await this.createImage((32 * factor), (32 * factor));

        image_from.crop(0, 0, image_from.getWidth(), (10 * factor));

        image.composite(image_from, 0, 0);

        image_from.grayscale();

        image_from.scan(0, 0, image_from.getWidth(), image_from.getHeight(), (x, y, idx) => {
            if (image_from.bitmap.data[idx] < 192 || image_from.bitmap.data[idx + 1] < 192 || image_from.bitmap.data[idx + 2] < 192) {
                image_from.bitmap.data[idx] = (image_from.bitmap.data[idx] / 255 * 186);
                image_from.bitmap.data[idx + 1] = (image_from.bitmap.data[idx + 1] / 255 * 98);
                image_from.bitmap.data[idx + 2] = (image_from.bitmap.data[idx + 2] / 255 * 168);
            }
        });

        image.composite(image_from, 0, (10 * factor));

        await this.writeImage(to, image);

        to_delete.push(new DeleteConverter(from));

        return to_delete;
    }

    /**
     * @inheritDoc
     */
    static get DEFAULT_CONVERTER_DATA() {
        return [
            ["textures/entity/projectiles/arrow.png", "textures/entity/arrows.png"]
        ];
    }
}

export { ArrowConverter };