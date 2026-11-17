// Snapshot provenance: llgava/mcbedrock-features@166a3170557dde8f44636113e92f0b39458f498c
// Experimental probe only. No Bedrock engine version has been certified for this snapshot.
const oakSnapshot = {"format_version":"1.13.0","minecraft:tree_feature":{"description":{"identifier":"minecraft:oak_tree_feature"},"trunk":{"trunk_height":{"range_min":4,"range_max":7},"trunk_block":{"name":"minecraft:log","states":{"old_log_type":"oak"}}},"canopy":{"canopy_offset":{"min":-3,"max":0},"variation_chance":[{"numerator":1,"denominator":2},{"numerator":1,"denominator":2},{"numerator":1,"denominator":2},{"numerator":1,"denominator":1}],"leaf_block":{"name":"minecraft:leaves","states":{"old_leaf_type":"oak"}}},"base_block":["minecraft:dirt","minecraft:coarse_dirt"],"may_grow_on":["minecraft:dirt","minecraft:grass","minecraft:podzol","minecraft:dirt_with_roots","minecraft:moss_block","minecraft:mycelium","minecraft:mud","minecraft:muddy_mangrove_roots","minecraft:coarse_dirt",{"name":"minecraft:farmland","states":{"moisturized_amount":0}},{"name":"minecraft:farmland","states":{"moisturized_amount":1}},{"name":"minecraft:farmland","states":{"moisturized_amount":2}},{"name":"minecraft:farmland","states":{"moisturized_amount":3}},{"name":"minecraft:farmland","states":{"moisturized_amount":4}},{"name":"minecraft:farmland","states":{"moisturized_amount":5}},{"name":"minecraft:farmland","states":{"moisturized_amount":6}},{"name":"minecraft:farmland","states":{"moisturized_amount":7}}],"may_replace":["minecraft:air","minecraft:mangrove_leaves","minecraft:azalea_leaves","minecraft:azalea_leaves_flowered",{"name":"minecraft:leaves","states":{"old_leaf_type":"oak"}},{"name":"minecraft:leaves","states":{"old_leaf_type":"spruce"}},{"name":"minecraft:leaves","states":{"old_leaf_type":"birch"}},{"name":"minecraft:leaves","states":{"old_leaf_type":"jungle"}},{"name":"minecraft:leaves2","states":{"new_leaf_type":"acacia"}},{"name":"minecraft:leaves2","states":{"new_leaf_type":"dark_oak"}}],"may_grow_through":["minecraft:dirt","minecraft:grass","minecraft:coarse_dirt"]}};
export const CUSTOM_MODEL_WORLDGEN_PROBE = "oak-canopy-probe-v1";

export function buildOakWorldgenProbe(mapping, stagedBlockIds) {
    const candidates = mapping.filter(row => row.java_block === "minecraft:oak_leaves" &&
        !row.java_variant && !row.x && !row.y &&
        /^[a-z0-9_]+:[a-z0-9_]+$/.test(row.bedrock_block) &&
        !row.bedrock_block.startsWith("minecraft:") && stagedBlockIds.has(row.bedrock_block));
    // A rotated/weighted model cannot be represented faithfully by this single target.
    if (candidates.length !== 1 || candidates[0].weight !== 1 ||
        mapping.filter(row => row.java_block === "minecraft:oak_leaves").length !== 1) return null;
    const feature = JSON.parse(JSON.stringify(oakSnapshot));
    const tree = feature["minecraft:tree_feature"];
    if (tree.description.identifier !== "minecraft:oak_tree_feature" ||
        tree.canopy.leaf_block.name !== "minecraft:leaves" ||
        tree.canopy.leaf_block.states.old_leaf_type !== "oak") throw new Error("Unexpected oak feature snapshot");
    const customId = candidates[0].bedrock_block;
    tree.canopy.leaf_block = customId;
    return { path: "features/oak_tree_feature.json", feature, customId,
        restoreTarget: "minecraft:oak_leaves" };
}

export function isOwnedRestoreTarget(source, currentId) {
    return typeof source === "string" && !source.startsWith("minecraft:") &&
        /^[a-z0-9_]+:[a-z0-9_]+$/.test(source) && currentId === source;
}

export function* restoreLoadedOakRegion(dimension, bounds, source, vanillaPermutation) {
    if (!isOwnedRestoreTarget(source,source)) throw new TypeError("Invalid custom block identifier");
    if (vanillaPermutation?.type?.id !== "minecraft:oak_leaves") throw new TypeError("Invalid vanilla permutation");
    const {min,max} = bounds;
    const axes = ["x","y","z"];
    if (!axes.every(k=>Number.isSafeInteger(min[k]) && Number.isSafeInteger(max[k]) && max[k]>=min[k]) ||
      axes.reduce((total,k)=>total*(max[k]-min[k]+1),1)>262144) throw new RangeError("Invalid restore region");
    const result = {restored:0,unavailable:0,failed:0,safeToRemove:false};
    for(let y=min.y;y<=max.y;y++) for(let z=min.z;z<=max.z;z++) for(let x=min.x;x<=max.x;x++){
        const pos={x,y,z}; let block;
        try { block=dimension.getBlock(pos); } catch {}
        if (!block) result.unavailable++;
        else if (isOwnedRestoreTarget(source,block.typeId)) {
            try {
                block.setPermutation(vanillaPermutation);
                if (dimension.getBlock(pos)?.typeId !== "minecraft:oak_leaves") throw new Error("Restore readback failed");
                result.restored++;
            } catch { result.failed++; }
        }
        yield;
    }
    return result;
}
