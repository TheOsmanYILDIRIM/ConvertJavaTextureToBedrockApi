import { AbstractConverter } from "@modifiedcommand/convert-base-api";

const FACE_NAMES = ["north", "south", "east", "west", "up", "down"];

function resourceLocation(id, fallbackNamespace = "minecraft") {
    const text = String(id || "");
    const at = text.indexOf(":");
    if (at >= 0) return { namespace: text.slice(0, at), path: text.slice(at + 1) };
    return { namespace: fallbackNamespace, path: text };
}

function safeName(value) {
    return String(value).toLowerCase().replace(/[^a-z0-9._-]+/g, "_").replace(/^_+|_+$/g, "") || "model";
}

function hashText(text) {
    let h = 2166136261;
    for (let i = 0; i < text.length; i++) {
        h ^= text.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return (h >>> 0).toString(36);
}

function cubeFaces(refs) {
    const out = {};
    for (const face of FACE_NAMES) out[face] = { texture: refs[face] || refs.all || "#all" };
    return out;
}

class CustomBlockModelConverter extends AbstractConverter {
    isTargetProfile() {
        return this.options?.javaVersion === "26.3" && this.options?.bedrockVersion === "1.26.50.4";
    }

    listFiles(pattern) {
        const files = this.output?.zip?.files;
        if (!files) return null;
        return Object.keys(files).filter(path => !files[path].dir && pattern.test(path)).sort();
    }

    async readJson(path) {
        try {
            return JSON.parse((await this.output.read(path)).toString("utf8").replace(/^\uFEFF/, ""));
        } catch (error) {
            this.log.warn(`Custom block model skipped: ${path}: invalid JSON (${error.message})`);
            return null;
        }
    }

    modelPath(id) {
        const loc = resourceLocation(id);
        return `assets/${loc.namespace}/models/${loc.path}.json`;
    }

    texturePath(id) {
        const loc = resourceLocation(id);
        return `assets/${loc.namespace}/textures/${loc.path}.png`;
    }

    builtinElements(parent) {
        const p = String(parent || "").replace(/^minecraft:/, "");
        const full = (faces) => [{ from: [0, 0, 0], to: [16, 16, 16], faces }];
        if (p === "block/cube_all") return full(cubeFaces({ all: "#all" }));
        if (p === "block/cube") {
            return full(cubeFaces({
                north: "#north", south: "#south", east: "#east", west: "#west", up: "#up", down: "#down"
            }));
        }
        if (p === "block/cube_bottom_top") {
            return full(cubeFaces({ north: "#side", south: "#side", east: "#side", west: "#side", up: "#top", down: "#bottom" }));
        }
        if (p === "block/cube_column") {
            return full(cubeFaces({ north: "#side", south: "#side", east: "#side", west: "#side", up: "#end", down: "#end" }));
        }
        if (p === "block/orientable") {
            return full(cubeFaces({ north: "#front", south: "#side", east: "#side", west: "#side", up: "#top", down: "#top" }));
        }
        if (p === "block/orientable_with_bottom") {
            return full(cubeFaces({ north: "#front", south: "#side", east: "#side", west: "#side", up: "#top", down: "#bottom" }));
        }
        return null;
    }

    resolveTextureRefs(textures) {
        const out = { ...textures };
        for (const key of Object.keys(out)) {
            let value = out[key];
            const seen = new Set();
            while (typeof value === "string" && value.startsWith("#")) {
                const ref = value.slice(1);
                if (seen.has(ref) || out[ref] === undefined) break;
                seen.add(ref);
                value = out[ref];
            }
            out[key] = value;
        }
        return out;
    }

    async resolveModel(id) {
        const chain = [];
        const models = [];
        let current = id;
        let terminalParent = null;

        for (let depth = 0; current && depth < 32; depth++) {
            const path = this.modelPath(current);
            if (!await this.output.exists(path)) {
                terminalParent = current;
                break;
            }
            const model = await this.readJson(path);
            if (!model) return null;
            chain.push(current);
            models.push(model);
            current = model.parent || null;
        }
        if (!models.length) return null;

        const textures = {};
        for (let i = models.length - 1; i >= 0; i--) Object.assign(textures, models[i].textures || {});

        let elements = null;
        for (const model of models) {
            if (Array.isArray(model.elements)) {
                elements = model.elements;
                break;
            }
        }
        if (!elements && terminalParent) elements = this.builtinElements(terminalParent);
        if (!elements?.length) return null;

        return {
            id,
            chain,
            textures: this.resolveTextureRefs(textures),
            elements,
            terminalParent
        };
    }

    resolveFaceTexture(textures, ref) {
        let value = ref;
        const seen = new Set();
        while (typeof value === "string" && value.startsWith("#")) {
            const key = value.slice(1);
            if (seen.has(key)) return null;
            seen.add(key);
            value = textures[key];
            if (value === undefined) return null;
        }
        return typeof value === "string" ? value : null;
    }

    defaultUv(face, from, to) {
        const [x1, y1, z1] = from;
        const [x2, y2, z2] = to;
        switch (face) {
            case "down": return [x1, 16 - z2, x2, 16 - z1];
            case "up": return [x1, z1, x2, z2];
            case "north": return [16 - x2, 16 - y2, 16 - x1, 16 - y1];
            case "south": return [x1, 16 - y2, x2, 16 - y1];
            case "west": return [z1, 16 - y2, z2, 16 - y1];
            case "east": return [16 - z2, 16 - y2, 16 - z1, 16 - y1];
            default: return [0, 0, 16, 16];
        }
    }

    async loadTexture(id) {
        const path = this.texturePath(id);
        if (!await this.output.exists(path)) return null;
        const image = await this.readImage(path);
        // Java animated block textures are vertical strips; block UVs address one square frame.
        // Keep the first frame in this initial block-model implementation rather than distorting UVs.
        if (image.getHeight() > image.getWidth() && image.getHeight() % image.getWidth() === 0) {
            return image.clone().crop(0, 0, image.getWidth(), image.getWidth());
        }
        return image;
    }

    async missingTexture() {
        const image = await this.createImage(16, 16);
        for (let y = 0; y < 16; y++) {
            for (let x = 0; x < 16; x++) {
                const magenta = ((x >> 2) + (y >> 2)) % 2 === 0;
                const idx = (y * 16 + x) * 4;
                image.bitmap.data[idx] = magenta ? 255 : 0;
                image.bitmap.data[idx + 1] = 0;
                image.bitmap.data[idx + 2] = magenta ? 255 : 0;
                image.bitmap.data[idx + 3] = 255;
            }
        }
        return image;
    }

    async buildAtlas(resolved) {
        const ids = [];
        for (const element of resolved.elements) {
            for (const faceName of FACE_NAMES) {
                const face = element.faces?.[faceName];
                if (!face?.texture) continue;
                const id = this.resolveFaceTexture(resolved.textures, face.texture);
                if (id && !ids.includes(id)) ids.push(id);
            }
        }
        if (!ids.length) return null;

        const loaded = [];
        for (const id of ids) {
            let image = await this.loadTexture(id);
            if (!image) {
                this.log.warn(`Custom block model: missing texture ${id}; using placeholder`);
                image = await this.missingTexture();
            }
            loaded.push({ id, image, width: image.getWidth(), height: image.getHeight() });
        }

        const width = loaded.reduce((sum, t) => sum + t.width, 0);
        const height = Math.max(...loaded.map(t => t.height));
        const atlas = await this.createImage(width, height);
        const placements = new Map();
        let x = 0;
        let transparent = false;
        for (const texture of loaded) {
            atlas.composite(texture.image, x, 0);
            placements.set(texture.id, { x, y: 0, width: texture.width, height: texture.height });
            for (let i = 3; i < texture.image.bitmap.data.length; i += 4) {
                if (texture.image.bitmap.data[i] < 255) {
                    transparent = true;
                    break;
                }
            }
            x += texture.width;
        }
        return { atlas, placements, transparent };
    }

    rescaledBounds(element) {
        let from = [...element.from];
        let to = [...element.to];
        const rot = element.rotation;
        if (rot?.rescale === true && Number(rot.angle) !== 0) {
            const factor = 1 / Math.cos((Math.abs(Number(rot.angle)) * Math.PI) / 180);
            const axis = { x: 0, y: 1, z: 2 }[rot.axis];
            if (axis !== undefined && Number.isFinite(factor)) {
                const origin = rot.origin || [8, 8, 8];
                const scale = (v) => v.map((c, i) => i === axis ? c : origin[i] + (c - origin[i]) * factor);
                from = scale(from);
                to = scale(to);
            }
        }
        return { from, to };
    }

    buildGeometry(identifier, resolved, atlasInfo, blockRotation) {
        const cubes = [];
        let usedUvRotation = false;

        for (const element of resolved.elements) {
            if (!Array.isArray(element.from) || !Array.isArray(element.to)) continue;
            const bounds = this.rescaledBounds(element);
            const cube = {
                origin: [8 - bounds.to[0], bounds.from[1], bounds.from[2] - 8],
                size: [
                    bounds.to[0] - bounds.from[0],
                    bounds.to[1] - bounds.from[1],
                    bounds.to[2] - bounds.from[2]
                ],
                uv: {}
            };

            const er = element.rotation;
            const angle = Number(er?.angle || 0);
            if (er && angle !== 0 && Number.isFinite(angle)) {
                const origin = er.origin || [8, 8, 8];
                cube.pivot = [8 - origin[0], origin[1], origin[2] - 8];
                cube.rotation = er.axis === "x" ? [-angle, 0, 0]
                    : er.axis === "y" ? [0, -angle, 0] : [0, 0, angle];
            }

            for (const faceName of FACE_NAMES) {
                const face = element.faces?.[faceName];
                if (!face) continue;
                const textureId = this.resolveFaceTexture(resolved.textures, face.texture);
                const placement = textureId ? atlasInfo.placements.get(textureId) : null;
                if (!placement) continue;
                const uv = Array.isArray(face.uv) ? face.uv : this.defaultUv(faceName, element.from, element.to);
                const sx = placement.width / 16;
                const sy = placement.height / 16;
                const faceUv = {
                    uv: [placement.x + uv[0] * sx, placement.y + uv[1] * sy],
                    uv_size: [(uv[2] - uv[0]) * sx, (uv[3] - uv[1]) * sy]
                };
                if ([90, 180, 270].includes(Number(face.rotation))) {
                    faceUv.uv_rotation = Number(face.rotation);
                    usedUvRotation = true;
                }
                cube.uv[faceName] = faceUv;
            }
            cubes.push(cube);
        }

        const xRot = Number(blockRotation?.x || 0);
        const yRot = Number(blockRotation?.y || 0);
        const root = { name: "root", pivot: [0, 8, 0], cubes };
        if (xRot || yRot) root.rotation = [-xRot, -yRot, 0];

        return {
            format_version: usedUvRotation ? "1.21.0" : "1.16.0",
            "minecraft:geometry": [{
                description: {
                    identifier,
                    texture_width: atlasInfo.atlas.getWidth(),
                    texture_height: atlasInfo.atlas.getHeight(),
                    visible_bounds_width: 4,
                    visible_bounds_height: 4.5,
                    visible_bounds_offset: [0, 0.75, 0]
                },
                bones: [root]
            }]
        };
    }

    async loadTerrainTexture() {
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
            return JSON.parse((await this.output.read(path)).toString("utf8"));
        } catch {
            return {
                resource_pack_name: "vanilla",
                texture_name: "atlas.terrain",
                padding: 8,
                num_mip_levels: 4,
                texture_data: {}
            };
        }
    }

    normalizeVariantEntries(value) {
        if (Array.isArray(value)) return value;
        if (value && typeof value === "object") return [value];
        return [];
    }

    async convertVariant(blockId, variantKey, entry, choiceIndex, terrain, mapping) {
        if (!entry?.model) return false;
        const rotation = { x: Number(entry.x || 0), y: Number(entry.y || 0) };
        if (![0, 90, 180, 270].includes(rotation.x) || ![0, 90, 180, 270].includes(rotation.y)) {
            this.log.warn(`Custom block model skipped: ${blockId} ${variantKey}: unsupported blockstate rotation`);
            return false;
        }

        const resolved = await this.resolveModel(entry.model);
        if (!resolved) {
            this.log.warn(`Custom block model skipped: ${blockId} ${variantKey}: unresolved model ${entry.model}`);
            return false;
        }
        const atlasInfo = await this.buildAtlas(resolved);
        if (!atlasInfo) {
            this.log.warn(`Custom block model skipped: ${blockId} ${variantKey}: model has no resolved textures`);
            return false;
        }

        const keyText = `${blockId}|${variantKey}|${entry.model}|${rotation.x}|${rotation.y}|${choiceIndex}`;
        const base = safeName(`${blockId.replace(":", "_")}__${hashText(keyText)}_${choiceIndex}`);
        const blockIdentifier = `j2b:${base}`;
        const geometryIdentifier = `geometry.j2b.${base}`;
        const textureKey = `j2b_${base}`;
        const texturePath = `textures/blocks/j2b_custom/${base}_atlas`;
        const geometryPath = `models/blocks/j2b_custom/${base}.geo.json`;
        const behaviorPath = `j2b_companion/blocks/${base}.json`;

        await this.writeImage(texturePath + ".png", atlasInfo.atlas);
        await this.writeJson(geometryPath, this.buildGeometry(geometryIdentifier, resolved, atlasInfo, rotation));
        terrain.texture_data[textureKey] = { textures: texturePath };

        if (this.options?.keepCompanionStaging === true) {
            await this.writeJson(behaviorPath, {
                format_version: "1.21.80",
                "minecraft:block": {
                    description: {
                        identifier: blockIdentifier,
                        menu_category: { category: "construction" }
                    },
                    components: {
                        "minecraft:geometry": geometryIdentifier,
                        "minecraft:material_instances": {
                            "*": {
                                texture: textureKey,
                                render_method: atlasInfo.transparent ? "alpha_test" : "opaque"
                            }
                        }
                    }
                }
            });
        }

        mapping.push({
            java_block: blockId,
            java_variant: variantKey,
            java_model: entry.model,
            weight: Number(entry.weight || 1),
            x: rotation.x,
            y: rotation.y,
            bedrock_block: blockIdentifier,
            geometry: geometryIdentifier,
            geometry_file: geometryPath,
            texture_key: textureKey,
            texture_file: texturePath + ".png",
            behavior_file: behaviorPath
        });
        return true;
    }

    async convert() {
        if (!this.isTargetProfile()) return [];

        const blockstates = this.listFiles(/^assets\/[^/]+\/blockstates\/.+\.json$/);
        if (blockstates === null) {
            this.log.warn("Custom block models: current output backend cannot enumerate Java model files; skipped");
            return [];
        }
        if (!blockstates.length) return [];

        const terrain = await this.loadTerrainTexture();
        const mapping = [];
        const skippedMultipart = [];
        let converted = 0;

        for (const path of blockstates) {
            const match = path.match(/^assets\/([^/]+)\/blockstates\/(.+)\.json$/);
            if (!match) continue;
            const blockId = `${match[1]}:${match[2]}`;
            const state = await this.readJson(path);
            if (!state) continue;

            if (state.multipart !== undefined) {
                skippedMultipart.push(blockId);
                this.log.warn(`Custom block models: multipart blockstate ${blockId} is not converted in this first implementation`);
            }
            for (const [variantKey, raw] of Object.entries(state.variants || {})) {
                const entries = this.normalizeVariantEntries(raw);
                for (let i = 0; i < entries.length; i++) {
                    if (await this.convertVariant(blockId, variantKey, entries[i], i, terrain, mapping)) converted++;
                }
            }
        }

        if (converted > 0) {
            await this.writeJson("textures/terrain_texture.json", terrain);
            await this.writeJson("j2b_custom_blocks.json", {
                format: 1,
                target: "bedrock-1.21.80+",
                namespace: "j2b",
                note: "Generated custom blocks are creator-namespace blocks; they do not replace minecraft: vanilla block identifiers.",
                mappings: mapping,
                skipped_multipart: skippedMultipart
            });
        }

        this.log.log(`Custom block models: ${converted} blockstate model variants converted, ${skippedMultipart.length} multipart blockstates skipped`);
        return [];
    }

    static get DEFAULT_CONVERTER_DATA() { return [["java-custom-block-models"]]; }
}

export { CustomBlockModelConverter };
