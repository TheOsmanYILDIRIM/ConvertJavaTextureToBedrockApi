import { AbstractConverter } from "@modifiedcommand/convert-base-api";
import { DeleteConverter } from "./DeleteConverter.mjs";

/**
 * Packs Java's five trial-spawner detection columns into the 8x8 Bedrock atlas.
 *
 * Java stores each animation step as an 8x8 image whose useful pixels live in
 * column x=3, starting at y=1. Bedrock stores those five columns side by side.
 */
class TrialSpawnerAtlasConverter extends AbstractConverter {
    /**
     * @inheritDoc
     */
    async convert() {
        const [base, to] = this.data;

        const to_delete = [];
        let image = null;
        let factor = null;

        for (let i = 0; i < 5; i++) {
            const from = `${base}${i}.png`;

            if (!await this.output.exists(from)) {
                continue;
            }

            const frame = await this.readImage(from);
            const frame_factor = (frame.getWidth() / 8);

            if (!Number.isInteger(frame_factor) || frame_factor < 1 || frame.getHeight() !== (8 * frame_factor)) {
                this.log.warn(`Skip malformed trial spawner frame ${from}`);
                continue;
            }

            if (factor === null) {
                factor = frame_factor;
                image = await this.createImage((8 * factor), (8 * factor));
                this.log.log(`Create trial spawner atlas ${to}`);
            } else if (frame_factor !== factor) {
                this.log.warn(`Skip inconsistent trial spawner frame ${from}`);
                continue;
            }

            const column = frame.clone().crop(
                (3 * factor),
                (1 * factor),
                factor,
                (7 * factor)
            );

            image.composite(column, (i * factor), 0);
            to_delete.push(new DeleteConverter(from));
        }

        if (image !== null) {
            await this.writeImage(to, image);
        }

        return to_delete;
    }

    /**
     * @inheritDoc
     */
    static get DEFAULT_CONVERTER_DATA() {
        return [
            [
                "textures/particle/trial_spawner_detection_",
                "textures/particles/trial_spawner_atlas.png"
            ],
            [
                "textures/particle/trial_spawner_detection_ominous_",
                "textures/particles/trial_spawner_ominous_atlas.png"
            ]
        ];
    }
}

export { TrialSpawnerAtlasConverter };
