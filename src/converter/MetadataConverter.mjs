import { AbstractConverter } from "@modifiedcommand/convert-base-api";
import { DeleteConverter } from "./DeleteConverter.mjs";
import v4 from "uuid/v4.js";

const MAX_FORMAT_PART = 0x7fffffff;
const isFormatPart = value => Number.isInteger(value) && value >= 0 && value <= MAX_FORMAT_PART;
const invalidFormat = (field, value) =>
    new Error(`Invalid pack.mcmeta pack.${field}: ${JSON.stringify(value)}`);

function readFormatBound(value, field, defaultMinor, warn) {
    const parts = Array.isArray(value) ? value : [value];
    if (parts.length === 1 && isFormatPart(parts[0])) {
        return { major: parts[0], minor: defaultMinor };
    }
    if (parts.length === 2 && parts.every(isFormatPart)) {
        return { major: parts[0], minor: parts[1] };
    }

    // Some packs (e.g. Patrix) encode a major/minor pair as a decimal.
    // Interpret the parsed decimal's digits as a minor version, never as a range.
    const decimal = parts.length === 1 && typeof parts[0] === "number"
        && /^(\d+)\.(\d+)$/.exec(String(parts[0]));
    if (decimal) {
        const major = Number(decimal[1]);
        const minor = Number(decimal[2]);
        if (isFormatPart(major) && isFormatPart(minor)) {
            warn(`Nonstandard pack.mcmeta pack.${field} ${JSON.stringify(value)}; interpreting as [${major}, ${minor}]`);
            return { major, minor };
        }
    }
    throw invalidFormat(field, value);
}

function readLegacyRange(value) {
    const bounds = typeof value === "number" ? [value, value]
        : Array.isArray(value) ? value
        : value && typeof value === "object" ? [value.min_inclusive, value.max_inclusive] : [];
    if (bounds.length !== 2 || !bounds.every(isFormatPart) || bounds[0] > bounds[1]) {
        throw invalidFormat("supported_formats", value);
    }
    return bounds;
}

/**
 * Class MetadataConverter
 */
class MetadataConverter extends AbstractConverter {
    /**
     * @inheritDoc
     */
    async convert() {
        const [from, to, uuid_header_file, uuid_module_file] = this.data;

        const to_delete = [];

        this.log.log(`Create metadata ${to}`);

        if (!await this.output.exists(from)) {
            throw new Error(`Missing ${from}! Is this really a Java texture pack?`);
        }

        let uuid_header = "";
        if (await this.output.exists(uuid_header_file)) {
            uuid_header = (await this.output.read(uuid_header_file)).toString("utf8");

            to_delete.push(new DeleteConverter(uuid_header_file));
        } else {
            uuid_header = v4();
        }

        let uuid_module = "";
        if (await this.output.exists(uuid_module_file)) {
            uuid_module = (await this.output.read(uuid_module_file)).toString("utf8");

            to_delete.push(new DeleteConverter(uuid_module_file));
        } else {
            uuid_module = v4();
        }

        MetadataConverter.mcmeta = JSON.parse((await this.output.read(from)).toString("utf8").trim()); // trim whitespace and a leading UTF-8 BOM

        const pack = MetadataConverter.mcmeta?.pack;
        if (!pack || typeof pack !== "object" || Array.isArray(pack)) {
            throw new Error("Missing or invalid pack object in pack.mcmeta");
        }

        const has = field => Object.prototype.hasOwnProperty.call(pack, field);
        const modern = has("min_format") || has("max_format");
        let minFormat, maxFormat;
        if (modern) {
            if (!has("min_format") || !has("max_format")) {
                throw new Error(`Missing pack.mcmeta pack.${has("min_format") ? "max_format" : "min_format"}`);
            }
            const warn = message => this.log.warn?.(message);
            minFormat = readFormatBound(pack.min_format, "min_format", 0, warn);
            maxFormat = readFormatBound(pack.max_format, "max_format", MAX_FORMAT_PART, warn);
            if (minFormat.major > maxFormat.major
                || (minFormat.major === maxFormat.major && minFormat.minor > maxFormat.minor)) {
                throw new Error("Invalid pack.mcmeta format range: min_format exceeds max_format");
            }
        }

        const legacyRange = has("supported_formats") ? readLegacyRange(pack.supported_formats) : null;
        if (has("pack_format")) {
            if (!isFormatPart(pack.pack_format)) throw invalidFormat("pack_format", pack.pack_format);
        } else if (modern || legacyRange) {
            // Downstream legacy converters compare integer pack format thresholds.
            pack.pack_format = modern ? maxFormat.major : legacyRange[1];
        } else {
            throw new Error("Missing a resource pack format in pack.mcmeta");
        }

        const major = modern ? maxFormat.major : pack.pack_format;
        if (major < 4) {
            throw new Error(`Unsupported Java resource pack format ${major}; conversion requires format 4 or newer`);
        }

        // Auto-select Java 26.3 only for packs targeting major 97 that include 97.1.
        // A range spanning different major versions does not identify one profile.
        if (modern && minFormat.major === 97 && maxFormat.major === 97
            && minFormat.minor <= 1 && maxFormat.minor >= 1) {
            if (!this.options.javaVersion) this.options.javaVersion = "26.3";
            if (!this.options.bedrockVersion) this.options.bedrockVersion = "1.26.50.4";
        }
        const description = typeof pack.description === "string" ? pack.description : JSON.stringify(pack.description || "Java resource pack");
        const manifest = {
            "format_version": modern ? 2 : 1,
            "header": {
                "description": description,
                "name": await this.input.getName(),
                "platform_locked": false,
                "uuid": uuid_header,
                "version": [0, 0, 1]
            },
            "modules": [{
                "description": description,
                "type": "resources",
                "uuid": uuid_module,
                "version": [0, 0, 1]
            }]
        };

        if (modern) manifest.header.min_engine_version = [1, 26, 0];
        await this.writeJson(to, manifest);

        to_delete.push(new DeleteConverter(from));

        return to_delete;
    }

    /**
     * @inheritDoc
     */
    static get DEFAULT_CONVERTER_DATA() {
        return [
            ["pack.mcmeta", "manifest.json", "bedrock_uuid_header", "bedrock_uuid_module"]
        ];
    }
}

/**
 * @type {Object|null}
 */
MetadataConverter.mcmeta = null;

export { MetadataConverter };
