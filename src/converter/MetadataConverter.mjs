import { AbstractConverter } from "@modifiedcommand/convert-base-api";
import { DeleteConverter } from "./DeleteConverter.mjs";
import v4 from "uuid/v4.js";

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

        MetadataConverter.mcmeta = JSON.parse((await this.output.read(from)).toString("utf8").trim()); // trim it to supports UF8 files with 'BOOM' at the beginning

        const pack = MetadataConverter.mcmeta.pack || {};
        const parseFormat = value => {
            if (Array.isArray(value)) {
                const major = Number(value[0]);
                const minor = Number(value[1] ?? 0);
                if (!Number.isFinite(major) || !Number.isFinite(minor)) return null;
                return { major, minor, numeric: Number(`${major}.${minor}`) };
            }
            const numeric = Number(value);
            if (!Number.isFinite(numeric)) return null;
            const [majorText, minorText = "0"] = String(numeric).split(".");
            return {
                major: Number(majorText),
                minor: Number(minorText),
                numeric
            };
        };

        const minFormat = parseFormat(pack.min_format);
        const maxFormat = parseFormat(pack.max_format);
        const modern = minFormat !== null && maxFormat !== null;
        if (modern && minFormat.numeric > maxFormat.numeric) throw new Error("Invalid pack.mcmeta format range");
        if (!Number.isFinite(Number(pack.pack_format)) && modern) pack.pack_format = maxFormat.numeric;
        if (!Number.isFinite(Number(pack.pack_format))) throw new Error("Missing a resource pack format in pack.mcmeta");
        if (pack.pack_format < 4 ) {
            throw new Error("Only supports pack_format 4 (v.13–1.14.4), 5 (v.15–1.16.1), 6 (v1.16.2-.16.5), 7 (v1.17), 8(v1.18), or 9(v1.19)!");
        }

        // The browser app currently passes no version options. Detect only the
        // exact supported Java profile; unknown future pack formats stay legacy.
        if (modern && minFormat.major === 97 && minFormat.minor === 1
            && maxFormat.major === 97 && maxFormat.minor === 1) {
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
                "description": MetadataConverter.mcmeta.pack.description,
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
