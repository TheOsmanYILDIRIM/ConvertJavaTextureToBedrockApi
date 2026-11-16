import { AbstractConverter } from "@modifiedcommand/convert-base-api";
import { RenameConverter } from "./RenameConverter.mjs";
import { JAVA_26_3_TO_BEDROCK_1_26_50_4 } from "./data/java26_3-bedrock1_26_50_4.mjs";
import {
    BEDROCK_1_26_50_4_TERRAIN_PATH_TO_KEYS,
    BEDROCK_1_26_50_4_SAFE_BLOCK_TO_TERRAIN_KEYS
} from "./data/bedrock1_26_50_4-terrain-variations.mjs";

/**
 * Converts the safe/native subset of OptiFine/Continuity CTM method=random
 * rules to Bedrock terrain_texture.json weighted variations.
 */
class OptifineRandomBlockVariantConverter extends AbstractConverter {
    isTargetProfile() {
        return this.options?.javaVersion === "26.3" && this.options?.bedrockVersion === "1.26.50.4";
    }

    listPropertyFiles() {
        const files = this.output?.zip?.files;
        if (!files) return null;
        const roots = ["assets/minecraft/optifine/ctm/", "assets/minecraft/mcpatcher/ctm/"];
        return Object.keys(files)
            .filter(path => !files[path].dir && path.endsWith(".properties") && roots.some(root => path.startsWith(root)))
            .sort();
    }

    parseProperties(text) {
        const logical = [];
        let current = "";
        for (const raw of text.replace(/\r/g, "").split("\n")) {
            const right = raw.replace(/\s+$/, "");
            if (right.endsWith("\\")) {
                current += right.slice(0, -1);
                continue;
            }
            logical.push(current + raw);
            current = "";
        }
        if (current) logical.push(current);

        const out = {};
        for (const raw of logical) {
            const line = raw.trim();
            if (!line || line.startsWith("#") || line.startsWith("!")) continue;
            let at = line.indexOf("=");
            if (at < 0) at = line.indexOf(":");
            if (at < 0) {
                const m = line.match(/^([^\s]+)\s+(.+)$/);
                if (!m) continue;
                out[m[1].trim()] = m[2].trim();
            } else {
                out[line.slice(0, at).trim()] = line.slice(at + 1).trim();
            }
        }
        return out;
    }

    splitTokens(value = "") {
        return value.trim().split(/\s+/).filter(Boolean);
    }

    expandTiles(value) {
        const out = [];
        for (const token of this.splitTokens(value)) {
            const range = token.match(/^(\d+)-(\d+)$/);
            if (!range) {
                out.push(token);
                continue;
            }
            const a = Number(range[1]), b = Number(range[2]);
            if (b < a || b - a > 255) return null;
            for (let n = a; n <= b; n++) out.push(String(n));
        }
        return out;
    }

    normalizeWeights(value, count) {
        if (!value) return Array(count).fill(1);
        const parsed = this.splitTokens(value).map(Number);
        if (parsed.length === 0 || parsed.some(v => !Number.isFinite(v) || v < 0)) return null;
        const kept = parsed.slice(0, count);
        if (kept.length === 0) return null;
        const average = Math.floor(kept.reduce((a, b) => a + b, 0) / kept.length);
        while (kept.length < count) kept.push(average);
        return kept;
    }

    ruleRoot(path) {
        for (const root of ["assets/minecraft/optifine/ctm/", "assets/minecraft/mcpatcher/ctm/"]) {
            if (path.startsWith(root)) return root;
        }
        return null;
    }

    dirname(path) {
        const at = path.lastIndexOf("/");
        return at >= 0 ? path.slice(0, at + 1) : "";
    }

    cleanRelative(path) {
        const out = [];
        for (const raw of path.split("/")) {
            if (!raw || raw === ".") continue;
            if (raw === "..") {
                if (out.length === 0) return null;
                out.pop();
                continue;
            }
            out.push(raw);
        }
        return out.join("/");
    }

    resolveTileSource(propertiesPath, token) {
        let t = token.replace(/\\/g, "/").replace(/\.png$/i, "");
        if (t.startsWith("<")) return null;
        if (t.startsWith("minecraft:")) t = t.slice("minecraft:".length);
        else if (/^[a-z0-9_.-]+:/.test(t)) return null;

        let path;
        if (t.startsWith("assets/")) path = t;
        else if (t.startsWith("textures/")) path = "assets/minecraft/" + t;
        else path = this.dirname(propertiesPath) + t;

        const clean = this.cleanRelative(path);
        return clean ? clean + ".png" : null;
    }

    javaTextureToBedrock(javaPath) {
        let path = javaPath;
        for (const [from, to] of RenameConverter.DEFAULT_CONVERTER_DATA) {
            if (from.endsWith("/")) {
                if (path.startsWith(from)) path = to + path.slice(from.length);
            } else if (path === from) {
                path = to;
            }
        }
        for (const [from, to] of JAVA_26_3_TO_BEDROCK_1_26_50_4) {
            if (path === from) {
                path = to;
                break;
            }
        }
        return path;
    }

    resolveMatchTile(token) {
        let t = token.replace(/\\/g, "/").replace(/\.png$/i, "");
        if (t.startsWith("minecraft:")) t = t.slice("minecraft:".length);
        else if (/^[a-z0-9_.-]+:/.test(t)) return null;

        if (t.startsWith("assets/minecraft/")) {
            // already complete
        } else if (t.startsWith("textures/")) {
            t = "assets/minecraft/" + t;
        } else if (t.startsWith("block/")) {
            t = "assets/minecraft/textures/" + t;
        } else if (t.startsWith("blocks/")) {
            t = "assets/minecraft/textures/block/" + t.slice("blocks/".length);
        } else {
            t = "assets/minecraft/textures/block/" + t;
        }
        if (!t.endsWith(".png")) t += ".png";
        return this.javaTextureToBedrock(t).replace(/\.png$/i, "");
    }

    terrainKeysForRule(propertiesPath, props) {
        const matchTiles = this.splitTokens(props.matchTiles);
        const matchBlocks = this.splitTokens(props.matchBlocks);
        if (matchTiles.length && matchBlocks.length) {
            return { error: "combined matchTiles+matchBlocks is not safely representable" };
        }

        if (matchTiles.length) {
            const keys = new Set();
            let firstPath = null;
            for (const token of matchTiles) {
                const path = this.resolveMatchTile(token);
                if (!firstPath) firstPath = path;
                const mapped = path ? BEDROCK_1_26_50_4_TERRAIN_PATH_TO_KEYS[path] : null;
                if (!mapped?.length) return { error: `no Bedrock terrain alias for matchTile ${token}` };
                mapped.forEach(key => keys.add(key));
            }
            return { keys: [...keys].sort(), defaultPath: firstPath };
        }

        if (matchBlocks.length) {
            const keys = new Set();
            for (let token of matchBlocks) {
                if (token.includes("=") || token.includes("[") || token.includes("]")) {
                    return { error: `block-state match is not safely representable: ${token}` };
                }
                token = token.replace(/^minecraft:/, "");
                if (token.includes(":")) return { error: `non-minecraft block is not supported: ${token}` };
                const mapped = BEDROCK_1_26_50_4_SAFE_BLOCK_TO_TERRAIN_KEYS[token];
                if (!mapped?.length) return { error: `matchBlock ${token} shares terrain aliases or has no safe mapping` };
                mapped.forEach(key => keys.add(key));
            }
            return { keys: [...keys].sort(), defaultPath: null };
        }

        const root = this.ruleRoot(propertiesPath);
        const relative = root ? propertiesPath.slice(root.length) : propertiesPath;
        const name = relative.split("/").pop().replace(/\.properties$/i, "");
        if (name.startsWith("block_")) {
            const block = name.slice("block_".length);
            const mapped = BEDROCK_1_26_50_4_SAFE_BLOCK_TO_TERRAIN_KEYS[block];
            if (!mapped?.length) return { error: `inferred matchBlock ${block} has no safe mapping` };
            return { keys: [...mapped].sort(), defaultPath: null };
        }
        const path = this.resolveMatchTile(name);
        const mapped = path ? BEDROCK_1_26_50_4_TERRAIN_PATH_TO_KEYS[path] : null;
        if (!mapped?.length) return { error: `inferred matchTile ${name} has no Bedrock terrain alias` };
        return { keys: [...new Set(mapped)].sort(), defaultPath: path };
    }

    existingBasePath(catalog, key, fallback) {
        const value = catalog.texture_data?.[key]?.textures;
        const first = Array.isArray(value) ? value[0] : value;
        if (typeof first === "string") return first;
        if (first && typeof first === "object" && typeof first.path === "string") return first.path;
        return fallback;
    }

    hasUnsupportedConditions(props) {
        const lower = Object.fromEntries(Object.entries(props).map(([k, v]) => [k.toLowerCase(), v]));
        const blockers = [
            "biomes", "heights", "minheight", "maxheight", "name", "nbt",
            "profession", "professions", "baby", "health", "moonphase",
            "daytime", "weather", "sizes", "size", "linked", "randomloops",
            "tintindex", "tintblock"
        ];
        if (blockers.some(k => lower[k] !== undefined)) return true;
        if (lower.faces !== undefined && lower.faces.toLowerCase() !== "all") return true;
        if (lower.symmetry !== undefined && lower.symmetry.toLowerCase() !== "none") return true;
        return false;
    }

    async loadCatalog() {
        const path = "textures/terrain_texture.json";
        if (!await this.output.exists(path)) {
            return {
                resource_pack_name: "vanilla",
                texture_name: "atlas.terrain",
                padding: 8,
                num_mip_levels: 4,
                texture_data: {}
            };
        }
        try {
            const text = (await this.output.read(path)).toString("utf8");
            return JSON.parse(text
                .split("\n").filter(line => !line.trim().startsWith("//")).join("\n")
                .replace(/,\s*([}\]])/g, "$1"));
        } catch (error) {
            this.log.warn(`OptiFine random variants: existing terrain_texture.json could not be parsed (${error.message})`);
            return null;
        }
    }

    async convertRule(path, catalog, claimedKeys) {
        let props;
        try {
            props = this.parseProperties((await this.output.read(path)).toString("utf8"));
        } catch (error) {
            return { converted: false, reason: `read/parse failed: ${error.message}` };
        }

        if ((props.method || "").toLowerCase() !== "random") return { converted: false, ignored: true };
        if (this.hasUnsupportedConditions(props)) {
            return { converted: false, reason: "unsupported conditional/random modifier" };
        }

        const tiles = this.expandTiles(props.tiles || "");
        if (!tiles?.length || tiles.length > 256) {
            return { converted: false, reason: "invalid/empty tiles list or >256 variants" };
        }
        if (tiles.some(t => t === "<skip>")) {
            return { converted: false, reason: "<skip> tile is not representable by terrain variations" };
        }

        const weights = this.normalizeWeights(props.weights, tiles.length);
        if (!weights) return { converted: false, reason: "invalid weights" };

        const target = this.terrainKeysForRule(path, props);
        if (target.error || !target.keys?.length) {
            return { converted: false, reason: target.error || "no terrain keys" };
        }
        if (target.keys.some(key => claimedKeys.has(key))) {
            return { converted: false, reason: "terrain alias already claimed by another random rule" };
        }

        const root = this.ruleRoot(path);
        const relative = root ? path.slice(root.length) : path;
        const stem = relative.replace(/\.properties$/i, "")
            .split("/").map(s => s.replace(/[^a-zA-Z0-9._-]+/g, "_")).filter(Boolean).join("/");

        const variations = [];
        for (let i = 0; i < tiles.length; i++) {
            const weight = weights[i];
            if (weight <= 0) continue;
            if (weight < 0.05 || weight > 1000000) {
                return { converted: false, reason: `weight out of Bedrock range: ${weight}` };
            }

            const token = tiles[i];
            if (token === "<default>") {
                const fallback = target.defaultPath || this.existingBasePath(catalog, target.keys[0], null);
                if (!fallback) {
                    return { converted: false, reason: "<default> has no resolvable Bedrock base texture" };
                }
                variations.push({ path: fallback, weight });
                continue;
            }

            const source = this.resolveTileSource(path, token);
            if (!source || !await this.output.exists(source)) {
                return { converted: false, reason: `missing variant texture ${token}` };
            }
            const dest = `textures/blocks/optifine_random/${stem}/variant_${i}.png`;
            await this.output.copy(source, dest);
            variations.push({ path: dest.replace(/\.png$/i, ""), weight });
        }
        if (!variations.length) return { converted: false, reason: "all variants have zero weight" };

        for (const key of target.keys) {
            catalog.texture_data ??= {};
            catalog.texture_data[key] = {
                ...(catalog.texture_data[key] || {}),
                textures: { variations }
            };
            claimedKeys.add(key);
        }
        return { converted: true, keys: target.keys, variants: variations.length };
    }

    async convert() {
        if (this.options?.optifineRandomBlockVariants === false) return [];
        if (!this.isTargetProfile()) return [];
        const propertyFiles = this.listPropertyFiles();
        if (propertyFiles === null) {
            this.log.warn("OptiFine random variants: current output backend cannot enumerate files; skipped");
            return [];
        }
        if (propertyFiles.length === 0) return [];

        const catalog = await this.loadCatalog();
        if (!catalog) return [];

        let converted = 0, skipped = 0, ignored = 0;
        const claimedKeys = new Set();
        for (const path of propertyFiles) {
            const result = await this.convertRule(path, catalog, claimedKeys);
            if (result.converted) {
                converted++;
                this.log.log(`OptiFine random variants: ${path} -> ${result.keys.join(", ")} (${result.variants} variants)`);
            } else if (result.ignored) {
                ignored++;
            } else {
                skipped++;
                this.log.warn(`OptiFine random variants skipped: ${path}: ${result.reason}`);
            }
        }

        if (converted > 0) await this.writeJson("textures/terrain_texture.json", catalog);
        this.log.log(`OptiFine random variants: ${converted} converted, ${skipped} unsupported/skipped, ${ignored} non-random CTM rules ignored`);
        return [];
    }

    static get DEFAULT_CONVERTER_DATA() { return [["optifine-random-block-variants"]]; }
}

export { OptifineRandomBlockVariantConverter };
