import { ConvertJavaTextureToBedrockApi } from "../src/index.mjs";
import { Input, LocalFileInputEntry, LocalFileOutput, ConsoleLog } from "@modifiedcommand/convert-base-api";
import JSZip from "jszip";
import v4 from "uuid/v4.js";
import { readFile, stat, unlink, writeFile } from "node:fs/promises";

const [, , source, destination] = process.argv;
if (!source || !destination) {
    console.error("Usage: node scripts/convert-26-3.mjs input.zip output.mcpack|output.mcaddon");
    process.exit(2);
}

const addonMode = destination.toLowerCase().endsWith(".mcaddon");
const resourceOutput = addonMode ? destination + ".resource.mcpack.tmp" : destination;

const api = new ConvertJavaTextureToBedrockApi(
    new Input(new LocalFileInputEntry(source)),
    new LocalFileOutput(resourceOutput),
    new ConsoleLog(),
    {
        javaVersion: "26.3",
        bedrockVersion: "1.26.50.4",
        experimental: false,
        includeMaterialMaps: !process.argv.slice(4).includes("--no-material-maps"),
        keepCompanionStaging: addonMode
    }
);

await api.convert();

if (addonMode) {
    const resourceBytes = await readFile(resourceOutput);
    const resourceZip = await JSZip.loadAsync(resourceBytes);
    const manifestEntry = resourceZip.file("manifest.json");
    if (!manifestEntry) throw new Error("Converted resource pack has no manifest.json");

    const resourceManifest = JSON.parse(await manifestEntry.async("string"));
    const resourceHeaderUuid = resourceManifest?.header?.uuid;
    const resourceVersion = resourceManifest?.header?.version || [0, 0, 1];
    if (!resourceHeaderUuid) throw new Error("Converted resource pack manifest has no header UUID");

    const behaviorHeaderUuid = v4();
    const behaviorModuleUuid = v4();
    resourceManifest.header.pack_scope = "world";
    resourceManifest.header.min_engine_version = [1, 21, 80];
    resourceManifest.dependencies = [
        ...(Array.isArray(resourceManifest.dependencies) ? resourceManifest.dependencies : []).filter(d => d?.uuid !== behaviorHeaderUuid),
        { uuid: behaviorHeaderUuid, version: [0, 0, 1] }
    ];

    const behaviorManifest = {
        format_version: 2,
        header: {
            name: `${resourceManifest.header.name || "J2B"} Custom Blocks`,
            description: "Companion behavior pack generated from Java custom block models",
            uuid: behaviorHeaderUuid,
            version: [0, 0, 1],
            min_engine_version: [1, 21, 80]
        },
        modules: [{
            type: "data",
            uuid: behaviorModuleUuid,
            version: [0, 0, 1]
        }],
        dependencies: [{
            uuid: resourceHeaderUuid,
            version: resourceVersion
        }]
    };

    const addon = new JSZip();
    let stagedBlocks = 0;
    for (const [name, entry] of Object.entries(resourceZip.files)) {
        if (entry.dir) continue;
        if (name.startsWith("j2b_companion/")) {
            const relative = name.slice("j2b_companion/".length);
            if (!relative) continue;
            addon.file("J2B_BP/" + relative, await entry.async("nodebuffer"));
            if (relative.startsWith("blocks/") && relative.endsWith(".json")) stagedBlocks++;
            continue;
        }
        if (name === "manifest.json") {
            addon.file("J2B_RP/manifest.json", JSON.stringify(resourceManifest, null, 2));
        } else {
            addon.file("J2B_RP/" + name, await entry.async("nodebuffer"));
        }
    }
    addon.file("J2B_BP/manifest.json", JSON.stringify(behaviorManifest, null, 2));

    const addonBytes = await addon.generateAsync({
        type: "nodebuffer",
        compression: "DEFLATE",
        compressionOptions: { level: 6 }
    });
    await writeFile(destination, addonBytes);
    await unlink(resourceOutput);

    const st = await stat(destination);
    if (st.size < 1024) throw new Error("Empty converted addon");
    console.log(JSON.stringify({
        output: destination,
        bytes: st.size,
        addon: true,
        custom_blocks: stagedBlocks
    }));
} else {
    const st = await stat(destination);
    if (st.size < 1024) throw new Error("Empty converted file");
    console.log(JSON.stringify({ output: destination, bytes: st.size, addon: false }));
}
