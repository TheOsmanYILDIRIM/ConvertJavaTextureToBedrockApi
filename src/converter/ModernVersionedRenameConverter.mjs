import { AbstractConverter } from "@modifiedcommand/convert-base-api";
import { MetadataConverter } from "./MetadataConverter.mjs";
import { JAVA_26_3_TO_BEDROCK_1_26_50_4 } from "./data/java26_3-bedrock1_26_50_4.mjs";

/** Opt-in, report-derived path corrections after legacy transformations. */
class ModernVersionedRenameConverter extends AbstractConverter {
    async convert() {
        const pack = MetadataConverter.mcmeta?.pack;
        const min = pack?.min_format;
        const major = Array.isArray(min) ? min[0] : min;
        const minor = Array.isArray(min) ? (min[1] ?? 0) : 0;
        const java26_3 = this.options?.javaVersion === "26.3" ||
            (!this.options?.javaVersion && major === 97 && minor === 1);
        const target = this.options?.bedrockVersion ?? "1.26.50.4";
        if (!java26_3 || target !== "1.26.50.4") return [];
        let applied = 0, skipped = 0;
        for (const [from, to] of JAVA_26_3_TO_BEDROCK_1_26_50_4) {
            if (!await this.output.exists(from)) continue;
            if (await this.output.exists(to)) { skipped++; continue; }
            await this.output.rename(from, to);
            applied++;
        }
        this.log.log(`Java 26.3 path corrections: ${applied} renamed, ${skipped} target collisions skipped`);
        return [];
    }
    static get DEFAULT_CONVERTER_DATA() { return [["java-26.3"]]; }
}
export { ModernVersionedRenameConverter };
