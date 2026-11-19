import test from "node:test";
import assert from "node:assert/strict";
import { SpriteConverter } from "../../src/converter/SpriteConverter.mjs";
import { TrialSpawnerAtlasConverter } from "../../src/converter/TrialSpawnerAtlasConverter.mjs";
import { JAVA_26_3_TO_BEDROCK_1_26_50_4 } from "../../src/converter/data/java26_3-bedrock1_26_50_4.mjs";

const data = SpriteConverter.DEFAULT_CONVERTER_DATA;
const byTarget = new Map(data.map(rule => [rule[3], rule]));
const modernTargets = [
  ["textures/environment/moon_phases.png", 8],
  ["textures/particle/cherry_petal_atlas.png", 12],
  ["textures/particle/biome_tinted_leaves_atlas.png", 12],
  ["textures/particle/pale_oak_leaves_atlas.png", 12],
  ["textures/particle/orange_poplar_leaves_atlas.png", 4],
  ["textures/particle/red_poplar_leaves_atlas.png", 4],
  ["textures/particle/yellow_poplar_leaves_atlas.png", 4],
  ["textures/particle/geyser_base.png", 8],
  ["textures/particle/geyser_plume.png", 8],
  ["textures/particle/geyser_poof.png", 8],
  ["textures/particle/noxious_gas.png", 8],
  ["textures/particle/sculk_charge.png", 7],
  ["textures/particle/sculk_charge_pop.png", 4],
  ["textures/particle/sculk_soul.png", 11],
  ["textures/particle/gust.png", 12],
  ["textures/particle/small_gust.png", 7],
  ["textures/particle/sonic_explosion.png", 16]
];

test("Java 26.3 modern sprite atlases are wired with all source frames", () => {
  let count = 0;
  const sources = new Set();
  for (const [target, expectedFrames] of modernTargets) {
    const rule = byTarget.get(target);
    assert.ok(rule, `missing rule for ${target}`);
    assert.equal(rule[2].length, expectedFrames, `wrong frame count for ${target}`);
    count += rule[2].length;
    for (const [source] of rule[2]) {
      assert.equal(sources.has(source), false, `duplicate modern source frame: ${source}`);
      sources.add(source);
    }
  }
  assert.equal(count, 145);
});

test("atlas geometry matches Bedrock layouts used by 26.3", () => {
  assert.deepEqual(byTarget.get("textures/environment/moon_phases.png").slice(0, 2), [128, 64]);
  assert.deepEqual(byTarget.get("textures/particle/gust.png").slice(0, 2), [384, 32]);
  assert.deepEqual(byTarget.get("textures/particle/small_gust.png").slice(0, 2), [56, 8]);
  assert.deepEqual(byTarget.get("textures/particle/sonic_explosion.png").slice(0, 2), [32, 512]);
  assert.deepEqual(byTarget.get("textures/particle/biome_tinted_leaves_atlas.png").slice(0, 2), [28, 21]);
  const leaf = byTarget.get("textures/particle/biome_tinted_leaves_atlas.png")[2];
  assert.deepEqual(leaf[0].slice(1), [1, 1, 5]);
  assert.deepEqual(leaf[11].slice(1), [22, 15, 5]);
});


test("trial-spawner detector frames are packed into Bedrock 8x8 atlases", () => {
  assert.deepEqual(TrialSpawnerAtlasConverter.DEFAULT_CONVERTER_DATA, [
    [
      "textures/particle/trial_spawner_detection_",
      "textures/particles/trial_spawner_atlas.png"
    ],
    [
      "textures/particle/trial_spawner_detection_ominous_",
      "textures/particles/trial_spawner_ominous_atlas.png"
    ]
  ]);
});


test("reviewed Java 26.3 direct mappings are retained without known visual-only false positives", () => {
  const mapping = new Map(JAVA_26_3_TO_BEDROCK_1_26_50_4);
  for (let i = 0; i < 16; i++) {
    const suffix = String(i).padStart(2, "0");
    assert.equal(mapping.get(`textures/items/light_${suffix}.png`), `textures/items/light_block_${i}.png`);
  }
  assert.equal(mapping.get("textures/items/glass_bottle.png"), "textures/items/potion_bottle_empty.png");
  assert.equal(mapping.get("textures/items/pitcher_plant.png"), "textures/blocks/pitcher_crop_top_stage_4.png");
  assert.equal(mapping.get("textures/items/sulfur_spike.png"), "textures/blocks/sulfur_spike_down_tip.png");
  assert.equal(mapping.get("textures/map/decorations/mineshaft.png"), "textures/map/mineshaft.png");
  assert.equal(mapping.get("textures/map/decorations/trial_chambers.png"), "textures/map/trial_chambers.png");
  assert.equal(mapping.get("textures/map/map_background_checkerboard.png"), "textures/map/map_background.png");
  assert.notEqual(mapping.get("textures/blocks/lightning_rod_on.png"), "textures/map/player_icon_background.png");
  assert.notEqual(mapping.get("textures/map/decorations/ocean_monument.png"), "textures/items/map_monument.png");
  assert.notEqual(mapping.get("textures/map/decorations/red_x.png"), "textures/ui/realms_red_x.png");
});
