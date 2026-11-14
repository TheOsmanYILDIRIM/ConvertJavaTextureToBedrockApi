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

        const pack = MetadataConverter.mcmeta?.pack;
        const major = Array.isArray(pack?.min_format) ? pack.min_format[0] : pack?.min_format ?? pack?.pack_format;
        if (!Number.isInteger(major) || major < 4) {
            throw new Error("Only supports pack_format 4 (v.13–1.14.4), 5 (v.15–1.16.1), 6 (v1.16.2-.16.5), 7 (v1.17), 8(v1.18), or 9(v1.19)!");
        }

        // Java 1.21.9+ uses min_format/max_format; Bedrock 1.26 uses manifest v2.
        const modern = major >= 65;
        const description = typeof pack.description === "string" ? pack.description : JSON.stringify(pack.description ?? "");
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

        if (modern) {
            manifest.header.min_engine_version = [1, 26, 50];
        }
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
