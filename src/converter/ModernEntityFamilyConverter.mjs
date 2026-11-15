import { AbstractConverter } from "@modifiedcommand/convert-base-api";

/** Java 26.3 entity families whose Bedrock atlas is assembled from multiple Java layers. */
class ModernEntityFamilyConverter extends AbstractConverter {
    isTargetProfile() {
        return this.options?.javaVersion === "26.3" && this.options?.bedrockVersion === "1.26.50.4";
    }

    async copyIfPresent(from, to) {
        if (!await this.output.exists(from)) return false;
        const image = await this.readImage(from);
        await this.writeImage(to, image);
        return true;
    }

    async compositeSameUv(basePath, overlayPath, targetPath = basePath) {
        if (!(await this.output.exists(basePath) && await this.output.exists(overlayPath))) return false;
        const base = await this.readImage(basePath);
        const overlay = await this.readImage(overlayPath);
        if (base.getWidth() !== overlay.getWidth() || base.getHeight() !== overlay.getHeight()) return false;
        base.composite(overlay, 0, 0);
        await this.writeImage(targetPath, base);
        return true;
    }

    async composeHorse(basePath, saddlePath, chestTemplate = null) {
        if (!(await this.output.exists(basePath) && await this.output.exists(saddlePath))) return false;
        const base = await this.readImage(basePath);
        const saddle = await this.readImage(saddlePath);
        if (base.getWidth() !== saddle.getWidth() || base.getHeight() !== saddle.getHeight()) return false;
        const factor = base.getWidth() / 64;
        if (!Number.isInteger(factor) || factor < 1 || base.getHeight() !== 64 * factor) return false;

        // Java 26 keeps the saddle in an equipment layer; Bedrock horse2 bakes it into the adult atlas.
        base.composite(saddle, 0, 0);

        // Bedrock duplicates the terminal strap island mirrored into the unused right-hand UV slot.
        const strap = saddle.clone()
            .crop(32 * factor, 18 * factor, 16 * factor, 3 * factor)
            .flip(true, false);
        base.composite(strap, 48 * factor, 18 * factor);

        // Bedrock horse2 keeps the shared chest UV island in every adult atlas. Donkey/mule already carry it.
        if (chestTemplate && await this.output.exists(chestTemplate)) {
            const chest = await this.readImage(chestTemplate);
            if (chest.getWidth() === base.getWidth() && chest.getHeight() === base.getHeight()) {
                base.composite(chest.clone().crop(26 * factor, 20 * factor, 22 * factor, 12 * factor), 26 * factor, 20 * factor);
            }
        }

        await this.writeImage(basePath, base);
        return true;
    }


    async createCowV2(from, to) {
        if (!await this.output.exists(from)) return false;
        const image = await this.readImage(from);
        const factor = image.getWidth() / 64;
        if (!Number.isInteger(factor) || factor < 1 || image.getHeight() !== 64 * factor) return false;
        const clear = (x, y, w, h) => image.scan(x * factor, y * factor, w * factor, h * factor, (px, py, idx) => {
            image.bitmap.data[idx] = 0;
            image.bitmap.data[idx + 1] = 0;
            image.bitmap.data[idx + 2] = 0;
            image.bitmap.data[idx + 3] = 0;
        });
        // Java's current cow family has one legacy UV fringe unused by Bedrock cow.v2.
        clear(2, 32, 12, 1);
        clear(0, 34, 1, 3);
        clear(15, 34, 1, 3);
        await this.writeImage(to, image);
        return true;
    }

    async createPigSaddle() {
        const basePath = "textures/entity/pig/pig_temperate.png";
        const saddlePath = "textures/entity/equipment/pig_saddle/saddle.png";
        if (!(await this.output.exists(basePath) && await this.output.exists(saddlePath))) return 0;
        const base = await this.readImage(basePath);
        const saddle = await this.readImage(saddlePath);
        const factor = base.getWidth() / 64;
        if (!Number.isInteger(factor) || factor < 1 || base.getHeight() !== 64 * factor || saddle.getWidth() !== base.getWidth()) return 0;

        const pigSaddle = base.clone().crop(0, 0, 64 * factor, 32 * factor);
        pigSaddle.composite(saddle.clone().crop(0, 0, 64 * factor, 32 * factor), 0, 0);
        await this.writeImage("textures/entity/pig/pig_saddle.png", pigSaddle);

        // Bedrock's current saddle_v2 is the same Java equipment island shifted down by 24px.
        const saddleV2 = await this.createImage(64 * factor, 64 * factor);
        saddleV2.composite(saddle.clone().crop(0, 0, 64 * factor, 40 * factor), 0, 24 * factor);
        await this.writeImage("textures/entity/saddle_v2.png", saddleV2);

        // Keep the legacy saddle atlas too; its top half is a direct match.
        await this.writeImage("textures/entity/saddle.png", saddle.clone().crop(0, 0, 64 * factor, 32 * factor));
        return 3;
    }

    async createLeadKnot() {
        const from = "textures/entity/lead_knot/lead_knot.png";
        if (!await this.output.exists(from)) return false;
        const image = await this.readImage(from);
        const factor = image.getWidth() / 32;
        if (!Number.isInteger(factor) || factor < 1 || image.getHeight() !== 32 * factor) return false;
        image.scan(1 * factor, 19 * factor, 16 * factor, 7 * factor, (x, y, idx) => {
            image.bitmap.data[idx] = 0;
            image.bitmap.data[idx + 1] = 0;
            image.bitmap.data[idx + 2] = 0;
            image.bitmap.data[idx + 3] = 0;
        });
        await this.writeImage("textures/entity/lead_knot.png", image);
        return true;
    }

    async createTransparentVillagerProfession(path) {
        if (await this.output.exists(path)) return false;
        const image = await this.createImage(64, 64);
        await this.writeImage(path, image);
        return true;
    }

    async convert() {
        if (!this.isTargetProfile()) return [];
        let generated = 0;


        for (const [from, to] of [
            ["textures/entity/cow/cow_temperate.png", "textures/entity/cow/cow_v2.png"],
            ["textures/entity/cow/mooshroom_red.png", "textures/entity/cow/mooshroom_v2.png"],
            ["textures/entity/cow/mooshroom_brown.png", "textures/entity/cow/brown_mooshroom_v2.png"]
        ]) {
            generated += await this.createCowV2(from, to) ? 1 : 0;
        }

        // Same-UV equipment merged into Bedrock entity atlases.
        generated += await this.compositeSameUv(
            "textures/entity/camel/camel.png",
            "textures/entity/equipment/camel_saddle/saddle.png"
        ) ? 1 : 0;
        generated += await this.compositeSameUv(
            "textures/entity/camel/camel_husk.png",
            "textures/entity/equipment/camel_husk_saddle/saddle.png",
            "textures/entity/camel_husk/camel_husk.png"
        ) ? 1 : 0;

        // Horse2 adult family: one structural rule covers every coat/species sibling.
        const muleTemplate = "textures/entity/horse2/mule.png";
        for (const coat of ["black", "brown", "chestnut", "creamy", "darkbrown", "gray", "white"]) {
            generated += await this.composeHorse(
                `textures/entity/horse2/horse_${coat}.png`,
                "textures/entity/equipment/horse_saddle/saddle.png",
                muleTemplate
            ) ? 1 : 0;
        }
        generated += await this.composeHorse("textures/entity/horse2/horse_skeleton.png", "textures/entity/equipment/skeleton_horse_saddle/saddle.png", muleTemplate) ? 1 : 0;
        generated += await this.composeHorse("textures/entity/horse2/horse_zombie.png", "textures/entity/equipment/zombie_horse_saddle/saddle.png", muleTemplate) ? 1 : 0;
        generated += await this.composeHorse("textures/entity/horse2/donkey.png", "textures/entity/equipment/donkey_saddle/saddle.png") ? 1 : 0;
        generated += await this.composeHorse("textures/entity/horse2/mule.png", "textures/entity/equipment/mule_saddle/saddle.png") ? 1 : 0;

        // Horse body armor is already on the modern 64x64 UV; expose the whole material family.
        for (const material of ["copper", "diamond", "gold", "iron", "netherite"]) {
            generated += await this.copyIfPresent(
                `textures/entity/equipment/horse_body/${material}.png`,
                `textures/entity/horse2/armor/horse_armor_${material}.png`
            ) ? 1 : 0;
        }
        if (!await this.output.exists("textures/entity/horse2/armor/horse_armor_none.png")) {
            await this.writeImage("textures/entity/horse2/armor/horse_armor_none.png", await this.createImage(64, 64));
            generated++;
        }

        generated += await this.createPigSaddle();
        generated += await this.createLeadKnot() ? 1 : 0;

        // Villager V2 render definitions require an explicit transparent unskilled profession layer.
        generated += await this.createTransparentVillagerProfession("textures/entity/villager2/professions/unskilled.png") ? 1 : 0;
        generated += await this.createTransparentVillagerProfession("textures/entity/zombie_villager2/professions/unskilled.png") ? 1 : 0;

        this.log.log(`Java 26.3 entity family synthesis: ${generated} textures generated/updated`);
        return [];
    }

    static get DEFAULT_CONVERTER_DATA() { return [["java26-entity-families"]]; }
}

export { ModernEntityFamilyConverter };
