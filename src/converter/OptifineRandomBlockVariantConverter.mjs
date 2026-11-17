import { AbstractConverter } from "@modifiedcommand/convert-base-api";
import { RenameConverter } from "./RenameConverter.mjs";
import { JAVA_26_3_TO_BEDROCK_1_26_50_4 } from "./data/java26_3-bedrock1_26_50_4.mjs";
import {
    BEDROCK_1_26_50_4_TERRAIN_PATH_TO_KEYS,
    BEDROCK_1_26_50_4_SAFE_BLOCK_TO_TERRAIN_KEYS
} from "./data/bedrock1_26_50_4-terrain-variations.mjs";

// Non-scalar vanilla atlas layouts, from Mojang/bedrock-samples 46ba6ea.
// Preserve slot order and slot properties when writing a resource-pack override.
const VANILLA_LAYOUTS = {
    "acacia_leaves": ["textures/blocks/leaves_acacia","textures/blocks/leaves_acacia_opaque"],
    "acacia_leaves_carried": ["textures/blocks/leaves_acacia_carried","textures/blocks/leaves_acacia_carried"],
    "acacia_shelf": ["textures/blocks/acacia_shelf"],
    "anvil_base": ["textures/blocks/anvil_base","textures/blocks/anvil_base","textures/blocks/anvil_base","textures/blocks/anvil_base"],
    "anvil_top_damaged_x": ["textures/blocks/anvil_top_damaged_0","textures/blocks/anvil_top_damaged_1","textures/blocks/anvil_top_damaged_2","textures/blocks/anvil_base"],
    "azalea_leaves": ["textures/blocks/azalea_leaves","textures/blocks/azalea_leaves_opaque"],
    "azalea_leaves_flowered": ["textures/blocks/azalea_leaves_flowers","textures/blocks/azalea_leaves_flowers_opaque"],
    "bamboo_shelf": ["textures/blocks/bamboo_shelf"],
    "barrel_bottom": ["textures/blocks/barrel_bottom","textures/blocks/barrel_bottom"],
    "barrel_side": ["textures/blocks/barrel_side","textures/blocks/barrel_side"],
    "barrel_top": ["textures/blocks/barrel_top","textures/blocks/barrel_top_open"],
    "bee_nest_bottom": ["textures/blocks/bee_nest_bottom"],
    "bee_nest_front": ["textures/blocks/bee_nest_front","textures/blocks/bee_nest_front_honey"],
    "bee_nest_side": ["textures/blocks/bee_nest_side"],
    "bee_nest_top": ["textures/blocks/bee_nest_top"],
    "beehive_front": ["textures/blocks/beehive_front","textures/blocks/beehive_front_honey"],
    "beehive_side": ["textures/blocks/beehive_side"],
    "beehive_top": ["textures/blocks/beehive_top"],
    "beetroot": ["textures/blocks/beetroots_stage_0","textures/blocks/beetroots_stage_1","textures/blocks/beetroots_stage_2","textures/blocks/beetroots_stage_3"],
    "big_oak_leaves": ["textures/blocks/leaves_big_oak","textures/blocks/leaves_big_oak_opaque"],
    "big_oak_leaves_carried": ["textures/blocks/leaves_big_oak_carried","textures/blocks/leaves_big_oak_carried"],
    "birch_leaves": ["textures/blocks/leaves_birch","textures/blocks/leaves_birch_opaque"],
    "birch_leaves_carried": ["textures/blocks/leaves_birch_carried","textures/blocks/leaves_birch_carried"],
    "birch_shelf": ["textures/blocks/birch_shelf"],
    "black_candle": ["textures/blocks/candles/black_candle","textures/blocks/candles/black_candle_lit"],
    "blast_furnace": ["textures/blocks/blast_furnace_front_off","textures/blocks/blast_furnace_front_on","textures/blocks/blast_furnace_side","textures/blocks/blast_furnace_top"],
    "blast_furnace_front": ["textures/blocks/blast_furnace_front_off","textures/blocks/blast_furnace_front_on"],
    "blast_furnace_side": ["textures/blocks/blast_furnace_side","textures/blocks/blast_furnace_side"],
    "blast_furnace_top": ["textures/blocks/blast_furnace_top","textures/blocks/blast_furnace_top"],
    "blue_candle": ["textures/blocks/candles/blue_candle","textures/blocks/candles/blue_candle_lit"],
    "brown_candle": ["textures/blocks/candles/brown_candle","textures/blocks/candles/brown_candle_lit"],
    "bubble_column_down_top": ["textures/blocks/bubble_column_down_top_a","textures/blocks/bubble_column_down_top_b","textures/blocks/bubble_column_down_top_c","textures/blocks/bubble_column_down_top_d"],
    "bubble_column_mid": ["textures/blocks/bubble_column_inner_a","textures/blocks/bubble_column_inner_b"],
    "bubble_column_outer": ["textures/blocks/bubble_column_outer_a","textures/blocks/bubble_column_outer_b","textures/blocks/bubble_column_outer_c","textures/blocks/bubble_column_outer_d","textures/blocks/bubble_column_outer_e","textures/blocks/bubble_column_outer_f","textures/blocks/bubble_column_outer_g","textures/blocks/bubble_column_outer_h"],
    "bubble_column_up_top": ["textures/blocks/bubble_column_up_top_a","textures/blocks/bubble_column_up_top_b","textures/blocks/bubble_column_up_top_c","textures/blocks/bubble_column_up_top_d"],
    "cake_bottom": ["textures/blocks/cake_bottom","textures/blocks/cake_bottom"],
    "cake_side": ["textures/blocks/cake_side","textures/blocks/cake_side"],
    "cake_top": ["textures/blocks/cake_top","textures/blocks/cake_top"],
    "cake_west": ["textures/blocks/cake_side","textures/blocks/cake_inner"],
    "candle": ["textures/blocks/candles/candle","textures/blocks/candles/candle_lit"],
    "carrots": ["textures/blocks/carrots_stage_0","textures/blocks/carrots_stage_1","textures/blocks/carrots_stage_2","textures/blocks/carrots_stage_3"],
    "cave_vines_body": ["textures/blocks/cave_vines_body","textures/blocks/cave_vines_body_berries"],
    "cave_vines_head": ["textures/blocks/cave_vines_head","textures/blocks/cave_vines_head_berries"],
    "cherry_leaves": ["textures/blocks/cherry_leaves","textures/blocks/cherry_leaves_opaque"],
    "cherry_shelf": ["textures/blocks/cherry_shelf"],
    "chest_inventory": ["textures/blocks/chest_top","textures/blocks/chest_side","textures/blocks/chest_front"],
    "chest_inventory_front": ["textures/blocks/chest_front"],
    "chest_inventory_side": ["textures/blocks/chest_side"],
    "chest_inventory_top": ["textures/blocks/chest_top"],
    "chiseled_bookshelf_front": ["textures/blocks/chiseled_bookshelf_empty","textures/blocks/chiseled_bookshelf_occupied"],
    "chorus_flower": ["textures/blocks/chorus_flower","textures/blocks/chorus_flower_dead"],
    "closed_eyeblossom": ["textures/blocks/eyeblossom_dormant"],
    "cobblestone_wall": ["textures/blocks/cobblestone","textures/blocks/cobblestone_mossy","textures/blocks/stone_granite","textures/blocks/stone_diorite","textures/blocks/stone_andesite","textures/blocks/sandstone_normal","textures/blocks/brick","textures/blocks/stonebrick","textures/blocks/stonebrick_mossy","textures/blocks/nether_brick","textures/blocks/end_bricks","textures/blocks/prismarine_rough","textures/blocks/red_sandstone_normal","textures/blocks/red_nether_brick"],
    "cocoa": ["textures/blocks/cocoa_stage_0","textures/blocks/cocoa_stage_1","textures/blocks/cocoa_stage_2"],
    "comparator_torch": ["textures/blocks/redstone_torch_off","textures/blocks/redstone_torch_on"],
    "comparator_up": ["textures/blocks/comparator_off","textures/blocks/comparator_on"],
    "composter_top": ["textures/blocks/composter_top","textures/blocks/compost","textures/blocks/compost_ready"],
    "concrete": ["textures/blocks/concrete_white","textures/blocks/concrete_orange","textures/blocks/concrete_magenta","textures/blocks/concrete_light_blue","textures/blocks/concrete_yellow","textures/blocks/concrete_lime","textures/blocks/concrete_pink","textures/blocks/concrete_gray","textures/blocks/concrete_silver","textures/blocks/concrete_cyan","textures/blocks/concrete_purple","textures/blocks/concrete_blue","textures/blocks/concrete_brown","textures/blocks/concrete_green","textures/blocks/concrete_red","textures/blocks/concrete_black"],
    "concretePowder": ["textures/blocks/concrete_powder_white","textures/blocks/concrete_powder_orange","textures/blocks/concrete_powder_magenta","textures/blocks/concrete_powder_light_blue","textures/blocks/concrete_powder_yellow","textures/blocks/concrete_powder_lime","textures/blocks/concrete_powder_pink","textures/blocks/concrete_powder_gray","textures/blocks/concrete_powder_silver","textures/blocks/concrete_powder_cyan","textures/blocks/concrete_powder_purple","textures/blocks/concrete_powder_blue","textures/blocks/concrete_powder_brown","textures/blocks/concrete_powder_green","textures/blocks/concrete_powder_red","textures/blocks/concrete_powder_black"],
    "copper_bulb": ["textures/blocks/copper_bulb","textures/blocks/copper_bulb_lit","textures/blocks/copper_bulb_powered","textures/blocks/copper_bulb_lit_powered"],
    "copper_chest_inventory_front": ["textures/blocks/copper_chest_inventory_front"],
    "copper_chest_inventory_side": ["textures/blocks/copper_chest_inventory_side"],
    "copper_chest_inventory_top": ["textures/blocks/copper_chest_inventory_top"],
    "coral": ["textures/blocks/coral_plant_blue","textures/blocks/coral_plant_pink","textures/blocks/coral_plant_purple","textures/blocks/coral_plant_red","textures/blocks/coral_plant_yellow","textures/blocks/coral_plant_blue_dead","textures/blocks/coral_plant_pink_dead","textures/blocks/coral_plant_purple_dead","textures/blocks/coral_plant_red_dead","textures/blocks/coral_plant_yellow_dead"],
    "coral_block": ["textures/blocks/coral_blue","textures/blocks/coral_pink","textures/blocks/coral_purple","textures/blocks/coral_red","textures/blocks/coral_yellow","textures/blocks/coral_blue_dead","textures/blocks/coral_pink_dead","textures/blocks/coral_purple_dead","textures/blocks/coral_red_dead","textures/blocks/coral_yellow_dead"],
    "coral_fan": ["textures/blocks/coral_fan_blue","textures/blocks/coral_fan_pink","textures/blocks/coral_fan_purple","textures/blocks/coral_fan_red","textures/blocks/coral_fan_yellow"],
    "coral_fan_dead": ["textures/blocks/coral_fan_blue_dead","textures/blocks/coral_fan_pink_dead","textures/blocks/coral_fan_purple_dead","textures/blocks/coral_fan_red_dead","textures/blocks/coral_fan_yellow_dead"],
    "coral_fan_hang_a": ["textures/blocks/coral_fan_blue","textures/blocks/coral_fan_pink","textures/blocks/coral_fan_blue_dead","textures/blocks/coral_fan_pink_dead"],
    "coral_fan_hang_b": ["textures/blocks/coral_fan_purple","textures/blocks/coral_fan_red","textures/blocks/coral_fan_purple_dead","textures/blocks/coral_fan_red_dead"],
    "coral_fan_hang_c": ["textures/blocks/coral_fan_yellow","textures/blocks/coral_fan_yellow","textures/blocks/coral_fan_yellow_dead","textures/blocks/coral_fan_yellow_dead"],
    "crafter_bottom": ["textures/blocks/crafter_bottom","textures/blocks/crafter_bottom","textures/blocks/crafter_bottom"],
    "crafter_east": ["textures/blocks/crafter_east","textures/blocks/crafter_east_triggered","textures/blocks/crafter_east_crafting"],
    "crafter_north": ["textures/blocks/crafter_north","textures/blocks/crafter_north","textures/blocks/crafter_north_crafting"],
    "crafter_south": ["textures/blocks/crafter_south","textures/blocks/crafter_south_triggered","textures/blocks/crafter_south_triggered"],
    "crafter_top": ["textures/blocks/crafter_top","textures/blocks/crafter_top_triggered","textures/blocks/crafter_top_crafting"],
    "crafter_west": ["textures/blocks/crafter_west","textures/blocks/crafter_west_triggered","textures/blocks/crafter_west_crafting"],
    "creaking_heart_side": ["textures/blocks/creaking_heart_side_inactive","textures/blocks/creaking_heart_side_dormant","textures/blocks/creaking_heart_side_active"],
    "creaking_heart_top": ["textures/blocks/creaking_heart_top_inactive","textures/blocks/creaking_heart_top_dormant","textures/blocks/creaking_heart_top_active"],
    "crimson_shelf": ["textures/blocks/crimson_shelf"],
    "cyan_candle": ["textures/blocks/candles/cyan_candle","textures/blocks/candles/cyan_candle_lit"],
    "dark_oak_shelf": ["textures/blocks/dark_oak_shelf"],
    "daylight_detector_side": ["textures/blocks/daylight_detector_side","textures/blocks/daylight_detector_side"],
    "daylight_detector_top": ["textures/blocks/daylight_detector_top","textures/blocks/daylight_detector_inverted_top"],
    "decorated_pot": ["textures/blocks/decorated_pot_side","textures/blocks/decorated_pot_base"],
    "dirt": ["textures/blocks/dirt","textures/blocks/coarse_dirt"],
    "door_lower": ["textures/blocks/door_wood_lower","textures/blocks/door_spruce_lower","textures/blocks/door_birch_lower","textures/blocks/door_jungle_lower","textures/blocks/door_acacia_lower","textures/blocks/door_dark_oak_lower","textures/blocks/door_iron_lower"],
    "door_upper": ["textures/blocks/door_wood_upper","textures/blocks/door_spruce_upper","textures/blocks/door_birch_upper","textures/blocks/door_jungle_upper","textures/blocks/door_acacia_upper","textures/blocks/door_dark_oak_upper","textures/blocks/door_iron_upper"],
    "double_plant_bottom": ["textures/blocks/double_plant_sunflower_bottom","textures/blocks/double_plant_syringa_bottom","textures/blocks/double_plant_grass_bottom","textures/blocks/double_plant_fern_bottom","textures/blocks/double_plant_rose_bottom","textures/blocks/double_plant_paeonia_bottom"],
    "double_plant_carried": ["textures/blocks/double_plant_sunflower_front","textures/blocks/double_plant_syringa_top","textures/blocks/double_plant_grass_carried","textures/blocks/double_plant_fern_carried","textures/blocks/double_plant_rose_top","textures/blocks/double_plant_paeonia_top"],
    "double_plant_top": ["textures/blocks/double_plant_sunflower_top","textures/blocks/double_plant_syringa_top","textures/blocks/double_plant_grass_top","textures/blocks/double_plant_fern_top","textures/blocks/double_plant_rose_top","textures/blocks/double_plant_paeonia_top"],
    "dried_ghast_back": ["textures/blocks/dried_ghast_state_1_back","textures/blocks/dried_ghast_state_2_back","textures/blocks/dried_ghast_state_3_back","textures/blocks/dried_ghast_state_4_back"],
    "dried_ghast_bottom": ["textures/blocks/dried_ghast_state_1_bottom","textures/blocks/dried_ghast_state_2_bottom","textures/blocks/dried_ghast_state_3_bottom","textures/blocks/dried_ghast_state_4_bottom"],
    "dried_ghast_front": ["textures/blocks/dried_ghast_state_1_front","textures/blocks/dried_ghast_state_2_front","textures/blocks/dried_ghast_state_3_front","textures/blocks/dried_ghast_state_4_front"],
    "dried_ghast_left": ["textures/blocks/dried_ghast_state_1_left","textures/blocks/dried_ghast_state_2_left","textures/blocks/dried_ghast_state_3_left","textures/blocks/dried_ghast_state_4_left"],
    "dried_ghast_right": ["textures/blocks/dried_ghast_state_1_right","textures/blocks/dried_ghast_state_2_right","textures/blocks/dried_ghast_state_3_right","textures/blocks/dried_ghast_state_4_right"],
    "dried_ghast_tentacles": ["textures/blocks/dried_ghast_state_1_tentacles","textures/blocks/dried_ghast_state_2_tentacles","textures/blocks/dried_ghast_state_3_tentacles","textures/blocks/dried_ghast_state_4_tentacles"],
    "dried_ghast_top": ["textures/blocks/dried_ghast_state_1_top","textures/blocks/dried_ghast_state_2_top","textures/blocks/dried_ghast_state_3_top","textures/blocks/dried_ghast_state_4_top"],
    "ender_chest_inventory_front": ["textures/blocks/ender_chest_front"],
    "ender_chest_inventory_side": ["textures/blocks/ender_chest_side"],
    "ender_chest_inventory_top": ["textures/blocks/ender_chest_top"],
    "exposed_copper_bulb": ["textures/blocks/exposed_copper_bulb","textures/blocks/exposed_copper_bulb_lit","textures/blocks/exposed_copper_bulb_powered","textures/blocks/exposed_copper_bulb_lit_powered"],
    "exposed_copper_chest_inventory_front": ["textures/blocks/exposed_copper_chest_inventory_front"],
    "exposed_copper_chest_inventory_side": ["textures/blocks/exposed_copper_chest_inventory_side"],
    "exposed_copper_chest_inventory_top": ["textures/blocks/exposed_copper_chest_inventory_top"],
    "exposed_lightning_rod": ["textures/blocks/exposed_lightning_rod","textures/blocks/lightning_rod_powered"],
    "farmland": ["textures/blocks/farmland_wet","textures/blocks/farmland_dry"],
    "firefly_bush": ["textures/blocks/firefly_bush","textures/blocks/firefly_bush_firefly"],
    "frosted_ice": ["textures/blocks/frosted_ice_0","textures/blocks/frosted_ice_1","textures/blocks/frosted_ice_2","textures/blocks/frosted_ice_3"],
    "furnace": ["textures/blocks/furnace_front_off","textures/blocks/furnace_front_on","textures/blocks/furnace_side","textures/blocks/furnace_top"],
    "furnace_front": ["textures/blocks/furnace_front_off","textures/blocks/furnace_front_on"],
    "furnace_side": ["textures/blocks/furnace_side","textures/blocks/furnace_side"],
    "furnace_top": ["textures/blocks/furnace_top","textures/blocks/furnace_top"],
    "grass_bottom": ["textures/blocks/dirt","textures/blocks/dirt","textures/blocks/dirt","textures/blocks/dirt","textures/blocks/dirt","textures/blocks/dirt","textures/blocks/dirt","textures/blocks/dirt","textures/blocks/dirt","textures/blocks/dirt","textures/blocks/dirt","textures/blocks/dirt","textures/blocks/dirt","textures/blocks/dirt","textures/blocks/dirt","textures/blocks/dirt","textures/blocks/dirt"],
    "grass_carried": {"path":"textures/blocks/grass_side","overlay_color":"#79c05a"},
    "grass_path_side": ["textures/blocks/grass_path_side"],
    "grass_path_top": ["textures/blocks/grass_path_top"],
    "grass_side": [{"path":"textures/blocks/grass_side","overlay_color":"#df6827"}],
    "grass_top": ["textures/blocks/grass_top","textures/blocks/grass_top","textures/blocks/grass_top","textures/blocks/grass_top","textures/blocks/grass_top","textures/blocks/grass_top","textures/blocks/grass_top","textures/blocks/grass_top","textures/blocks/grass_top","textures/blocks/grass_top","textures/blocks/grass_top","textures/blocks/grass_top","textures/blocks/grass_top","textures/blocks/grass_top","textures/blocks/grass_top","textures/blocks/grass_top","textures/blocks/grass_top"],
    "gray_candle": ["textures/blocks/candles/gray_candle","textures/blocks/candles/gray_candle_lit"],
    "green_candle": ["textures/blocks/candles/green_candle","textures/blocks/candles/green_candle_lit"],
    "hanging_pale_moss": ["textures/blocks/hanging_pale_moss_middle","textures/blocks/hanging_pale_moss_tip"],
    "honey_bottom": ["textures/blocks/honey_bottom"],
    "honey_side": ["textures/blocks/honey_side"],
    "honey_top": ["textures/blocks/honey_top"],
    "honeycomb_block": ["textures/blocks/honeycomb"],
    "jungle_leaves": ["textures/blocks/leaves_jungle","textures/blocks/leaves_jungle_opaque"],
    "jungle_leaves_carried": ["textures/blocks/leaves_jungle_carried","textures/blocks/leaves_jungle_carried"],
    "jungle_shelf": ["textures/blocks/jungle_shelf"],
    "leaf_litter": ["textures/blocks/leaf_litter"],
    "leaves": ["textures/blocks/leaves_oak","textures/blocks/leaves_spruce","textures/blocks/leaves_birch","textures/blocks/leaves_jungle","textures/blocks/leaves_oak_opaque","textures/blocks/leaves_spruce_opaque","textures/blocks/leaves_birch_opaque","textures/blocks/leaves_jungle_opaque"],
    "leaves_carried": ["textures/blocks/leaves_oak_carried","textures/blocks/leaves_spruce_carried","textures/blocks/leaves_birch_carried","textures/blocks/leaves_jungle_carried","textures/blocks/leaves_oak_carried","textures/blocks/leaves_spruce_carried","textures/blocks/leaves_birch_carried","textures/blocks/leaves_jungle_carried"],
    "leaves_carried2": ["textures/blocks/leaves_acacia_carried","textures/blocks/leaves_big_oak_carried","textures/blocks/leaves_acacia_carried","textures/blocks/leaves_big_oak_carried"],
    "leaves2": ["textures/blocks/leaves_acacia","textures/blocks/leaves_big_oak","textures/blocks/leaves_acacia_opaque","textures/blocks/leaves_big_oak_opaque"],
    "light_blue_candle": ["textures/blocks/candles/light_blue_candle","textures/blocks/candles/light_blue_candle_lit"],
    "light_gray_candle": ["textures/blocks/candles/light_gray_candle","textures/blocks/candles/light_gray_candle_lit"],
    "lightning_rod": ["textures/blocks/lightning_rod","textures/blocks/lightning_rod_powered"],
    "lime_candle": ["textures/blocks/candles/lime_candle","textures/blocks/candles/lime_candle_lit"],
    "lodestone_side": ["textures/blocks/lodestone_side"],
    "lodestone_top": ["textures/blocks/lodestone_top"],
    "log_side": ["textures/blocks/log_oak","textures/blocks/log_spruce","textures/blocks/log_birch","textures/blocks/log_jungle"],
    "log_side2": ["textures/blocks/log_acacia","textures/blocks/log_big_oak"],
    "log_top": ["textures/blocks/log_oak_top","textures/blocks/log_spruce_top","textures/blocks/log_birch_top","textures/blocks/log_jungle_top"],
    "log_top2": ["textures/blocks/log_acacia_top","textures/blocks/log_big_oak_top"],
    "log2": ["textures/blocks/log_acacia","textures/blocks/log_acacia_top","textures/blocks/log_big_oak","textures/blocks/log_big_oak_top"],
    "magenta_candle": ["textures/blocks/candles/magenta_candle","textures/blocks/candles/magenta_candle_lit"],
    "mangrove_leaves": ["textures/blocks/mangrove_leaves","textures/blocks/mangrove_leaves_opaque"],
    "mangrove_leaves_carried": ["textures/blocks/mangrove_leaves_carried","textures/blocks/mangrove_leaves_carried"],
    "mangrove_propagule": ["textures/blocks/mangrove_propagule","textures/blocks/mangrove_propagule_hanging"],
    "mangrove_shelf": ["textures/blocks/mangrove_shelf"],
    "melon_stem": ["textures/blocks/melon_stem_disconnected","textures/blocks/melon_stem_connected"],
    "monster_egg": ["textures/blocks/cobblestone","textures/blocks/stonebrick","textures/blocks/stonebrick_mossy","textures/blocks/stonebrick_cracked","textures/blocks/stonebrick_carved","textures/blocks/stone"],
    "mushroom_block": ["textures/blocks/mushroom_block_skin_brown","textures/blocks/mushroom_block_skin_red","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_skin_stem"],
    "mushroom_brown_bottom": ["textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_skin_brown","textures/blocks/mushroom_block_skin_stem"],
    "mushroom_brown_east": ["textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_skin_brown","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_skin_brown","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_skin_brown","textures/blocks/mushroom_block_skin_stem","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_skin_brown","textures/blocks/mushroom_block_skin_stem"],
    "mushroom_brown_north": ["textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_skin_brown","textures/blocks/mushroom_block_skin_brown","textures/blocks/mushroom_block_skin_brown","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_skin_stem","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_skin_brown","textures/blocks/mushroom_block_skin_stem"],
    "mushroom_brown_south": ["textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_skin_brown","textures/blocks/mushroom_block_skin_brown","textures/blocks/mushroom_block_skin_brown","textures/blocks/mushroom_block_skin_stem","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_skin_brown","textures/blocks/mushroom_block_skin_stem"],
    "mushroom_brown_top": ["textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_skin_brown","textures/blocks/mushroom_block_skin_brown","textures/blocks/mushroom_block_skin_brown","textures/blocks/mushroom_block_skin_brown","textures/blocks/mushroom_block_skin_brown","textures/blocks/mushroom_block_skin_brown","textures/blocks/mushroom_block_skin_brown","textures/blocks/mushroom_block_skin_brown","textures/blocks/mushroom_block_skin_brown","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_skin_brown","textures/blocks/mushroom_block_skin_stem"],
    "mushroom_brown_west": ["textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_skin_brown","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_skin_brown","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_skin_brown","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_skin_stem","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_skin_brown","textures/blocks/mushroom_block_skin_stem"],
    "mushroom_red_bottom": ["textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_skin_red","textures/blocks/mushroom_block_skin_stem"],
    "mushroom_red_east": ["textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_skin_red","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_skin_red","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_skin_red","textures/blocks/mushroom_block_skin_stem","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_skin_red","textures/blocks/mushroom_block_skin_stem"],
    "mushroom_red_north": ["textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_skin_red","textures/blocks/mushroom_block_skin_red","textures/blocks/mushroom_block_skin_red","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_skin_stem","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_skin_red","textures/blocks/mushroom_block_skin_stem"],
    "mushroom_red_south": ["textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_skin_red","textures/blocks/mushroom_block_skin_red","textures/blocks/mushroom_block_skin_red","textures/blocks/mushroom_block_skin_stem","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_skin_red","textures/blocks/mushroom_block_skin_stem"],
    "mushroom_red_top": ["textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_skin_red","textures/blocks/mushroom_block_skin_red","textures/blocks/mushroom_block_skin_red","textures/blocks/mushroom_block_skin_red","textures/blocks/mushroom_block_skin_red","textures/blocks/mushroom_block_skin_red","textures/blocks/mushroom_block_skin_red","textures/blocks/mushroom_block_skin_red","textures/blocks/mushroom_block_skin_red","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_skin_red","textures/blocks/mushroom_block_skin_stem"],
    "mushroom_red_west": ["textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_skin_red","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_skin_red","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_skin_red","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_skin_stem","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_skin_red","textures/blocks/mushroom_block_skin_stem"],
    "mushroom_stem_bottom": ["textures/blocks/mushroom_block_skin_stem","textures/blocks/mushroom_block_skin_stem","textures/blocks/mushroom_block_skin_stem","textures/blocks/mushroom_block_skin_stem","textures/blocks/mushroom_block_skin_stem","textures/blocks/mushroom_block_skin_stem","textures/blocks/mushroom_block_skin_stem","textures/blocks/mushroom_block_skin_stem","textures/blocks/mushroom_block_skin_stem","textures/blocks/mushroom_block_skin_stem","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_skin_stem","textures/blocks/mushroom_block_skin_stem","textures/blocks/mushroom_block_skin_stem","textures/blocks/mushroom_block_skin_stem","textures/blocks/mushroom_block_skin_stem"],
    "mushroom_stem_top": ["textures/blocks/mushroom_block_skin_stem","textures/blocks/mushroom_block_skin_stem","textures/blocks/mushroom_block_skin_stem","textures/blocks/mushroom_block_skin_stem","textures/blocks/mushroom_block_skin_stem","textures/blocks/mushroom_block_skin_stem","textures/blocks/mushroom_block_skin_stem","textures/blocks/mushroom_block_skin_stem","textures/blocks/mushroom_block_skin_stem","textures/blocks/mushroom_block_skin_stem","textures/blocks/mushroom_block_inside","textures/blocks/mushroom_block_skin_stem","textures/blocks/mushroom_block_skin_stem","textures/blocks/mushroom_block_skin_stem","textures/blocks/mushroom_block_skin_stem","textures/blocks/mushroom_block_skin_stem"],
    "mycelium_bottom": ["textures/blocks/dirt","textures/blocks/dirt"],
    "mycelium_side": ["textures/blocks/mycelium_side","textures/blocks/grass_side_snowed"],
    "mycelium_top": ["textures/blocks/mycelium_top","textures/blocks/mycelium_top"],
    "nether_sprouts": ["textures/blocks/nether_sprouts"],
    "nether_wart": ["textures/blocks/nether_wart_stage_0","textures/blocks/nether_wart_stage_1","textures/blocks/nether_wart_stage_1","textures/blocks/nether_wart_stage_2"],
    "oak_leaves": ["textures/blocks/leaves_oak","textures/blocks/leaves_oak_opaque"],
    "oak_leaves_carried": ["textures/blocks/leaves_oak_carried","textures/blocks/leaves_oak_carried"],
    "oak_shelf": ["textures/blocks/oak_shelf"],
    "observer_bottom": ["textures/blocks/observer_top","textures/blocks/observer_top"],
    "observer_east": ["textures/blocks/observer_side","textures/blocks/observer_side"],
    "observer_north": ["textures/blocks/observer_front","textures/blocks/observer_front"],
    "observer_south": ["textures/blocks/observer_back","textures/blocks/observer_back_lit"],
    "observer_top": ["textures/blocks/observer_top","textures/blocks/observer_top"],
    "observer_west": ["textures/blocks/observer_side","textures/blocks/observer_side"],
    "open_eyeblossom": ["textures/blocks/eyeblossom_stem_blooming","textures/blocks/eyeblossom_eyes_blooming"],
    "open_eyeblossom_carried": ["textures/blocks/eyeblossom_blooming"],
    "orange_candle": ["textures/blocks/candles/orange_candle","textures/blocks/candles/orange_candle_lit"],
    "orange_poplar_leaves": ["textures/blocks/orange_poplar_leaves","textures/blocks/orange_poplar_leaves_opaque"],
    "oxidized_copper_bulb": ["textures/blocks/oxidized_copper_bulb","textures/blocks/oxidized_copper_bulb_lit","textures/blocks/oxidized_copper_bulb_powered","textures/blocks/oxidized_copper_bulb_lit_powered"],
    "oxidized_copper_chest_inventory_front": ["textures/blocks/oxidized_copper_chest_inventory_front"],
    "oxidized_copper_chest_inventory_side": ["textures/blocks/oxidized_copper_chest_inventory_side"],
    "oxidized_copper_chest_inventory_top": ["textures/blocks/oxidized_copper_chest_inventory_top"],
    "oxidized_lightning_rod": ["textures/blocks/oxidized_lightning_rod","textures/blocks/lightning_rod_powered"],
    "pale_hanging_moss": ["textures/blocks/pale_hanging_moss_middle","textures/blocks/pale_hanging_moss_tip"],
    "pale_moss_carpet_side": ["textures/blocks/pale_moss_carpet_side_base","textures/blocks/pale_moss_carpet_side_tip"],
    "pale_oak_leaves": ["textures/blocks/pale_oak_leaves","textures/blocks/pale_oak_leaves_opaque"],
    "pale_oak_shelf": ["textures/blocks/pale_oak_shelf"],
    "pink_candle": ["textures/blocks/candles/pink_candle","textures/blocks/candles/pink_candle_lit"],
    "pink_petals": ["textures/blocks/pink_petals","textures/blocks/pink_petals_stem"],
    "piston_bottom": ["textures/blocks/piston_bottom"],
    "piston_side": ["textures/blocks/piston_side"],
    "piston_top": ["textures/blocks/piston_inner"],
    "piston_top_normal": ["textures/blocks/piston_top_normal"],
    "piston_top_sticky": ["textures/blocks/piston_top_sticky"],
    "pitcher_crop_lower_flower": ["textures/blocks/pitcher_crop_bottom_stage_1","textures/blocks/pitcher_crop_bottom_stage_2","textures/blocks/pitcher_crop_bottom_stage_3","textures/blocks/pitcher_crop_bottom_stage_4"],
    "pitcher_crop_upper_flower": ["textures/blocks/pitcher_crop_top_stage_3","textures/blocks/pitcher_crop_top_stage_4"],
    "planks": ["textures/blocks/planks_oak","textures/blocks/planks_spruce","textures/blocks/planks_birch","textures/blocks/planks_jungle","textures/blocks/planks_acacia","textures/blocks/planks_big_oak"],
    "pointed_dripstone_base": ["textures/blocks/pointed_dripstone_down_base","textures/blocks/pointed_dripstone_up_base"],
    "pointed_dripstone_frustum": ["textures/blocks/pointed_dripstone_down_frustum","textures/blocks/pointed_dripstone_up_frustum"],
    "pointed_dripstone_merge": ["textures/blocks/pointed_dripstone_down_merge","textures/blocks/pointed_dripstone_up_merge"],
    "pointed_dripstone_middle": ["textures/blocks/pointed_dripstone_down_middle","textures/blocks/pointed_dripstone_up_middle"],
    "pointed_dripstone_tip": ["textures/blocks/pointed_dripstone_down_tip","textures/blocks/pointed_dripstone_up_tip"],
    "poplar_shelf": ["textures/blocks/poplar_shelf"],
    "potatoes": ["textures/blocks/potatoes_stage_0","textures/blocks/potatoes_stage_1","textures/blocks/potatoes_stage_2","textures/blocks/potatoes_stage_3"],
    "prismarine": ["textures/blocks/prismarine_rough","textures/blocks/prismarine_dark","textures/blocks/prismarine_bricks"],
    "pumpkin_face": ["textures/blocks/pumpkin_face_off","textures/blocks/pumpkin_face_on","textures/blocks/pumpkin_side"],
    "pumpkin_side": ["textures/blocks/pumpkin_side","textures/blocks/pumpkin_side","textures/blocks/pumpkin_side"],
    "pumpkin_stem": ["textures/blocks/pumpkin_stem_disconnected","textures/blocks/pumpkin_stem_connected"],
    "pumpkin_top": ["textures/blocks/pumpkin_top","textures/blocks/pumpkin_top","textures/blocks/pumpkin_top"],
    "purple_candle": ["textures/blocks/candles/purple_candle","textures/blocks/candles/purple_candle_lit"],
    "purpur_block_bottom": ["textures/blocks/purpur_block","textures/blocks/purpur_block","textures/blocks/purpur_pillar_top"],
    "purpur_block_side": ["textures/blocks/purpur_block","textures/blocks/purpur_block","textures/blocks/purpur_pillar"],
    "purpur_block_top": ["textures/blocks/purpur_block","textures/blocks/purpur_block","textures/blocks/purpur_pillar_top"],
    "quartz_block_bottom": ["textures/blocks/quartz_block_top","textures/blocks/quartz_block_chiseled_top","textures/blocks/quartz_block_lines_top","textures/blocks/quartz_block_bottom"],
    "quartz_block_side": ["textures/blocks/quartz_block_side","textures/blocks/quartz_block_chiseled","textures/blocks/quartz_block_lines","textures/blocks/quartz_block_bottom"],
    "quartz_block_top": ["textures/blocks/quartz_block_top","textures/blocks/quartz_block_chiseled_top","textures/blocks/quartz_block_lines_top","textures/blocks/quartz_block_bottom"],
    "reactor_core": ["textures/blocks/reactor_core_stage_0","textures/blocks/reactor_core_stage_1","textures/blocks/reactor_core_stage_2"],
    "red_candle": ["textures/blocks/candles/red_candle","textures/blocks/candles/red_candle_lit"],
    "red_flower": ["textures/blocks/flower_rose","textures/blocks/flower_blue_orchid","textures/blocks/flower_allium","textures/blocks/flower_houstonia","textures/blocks/flower_tulip_red","textures/blocks/flower_tulip_orange","textures/blocks/flower_tulip_white","textures/blocks/flower_tulip_pink","textures/blocks/flower_oxeye_daisy","textures/blocks/flower_cornflower","textures/blocks/flower_lily_of_the_valley"],
    "red_poplar_leaves": ["textures/blocks/red_poplar_leaves","textures/blocks/red_poplar_leaves_opaque"],
    "redsandstone_bottom": ["textures/blocks/red_sandstone_bottom","textures/blocks/red_sandstone_top","textures/blocks/red_sandstone_top","textures/blocks/red_sandstone_top"],
    "redsandstone_side": ["textures/blocks/red_sandstone_normal","textures/blocks/red_sandstone_carved","textures/blocks/red_sandstone_smooth","textures/blocks/red_sandstone_top"],
    "redsandstone_top": ["textures/blocks/red_sandstone_top","textures/blocks/red_sandstone_top","textures/blocks/red_sandstone_top","textures/blocks/red_sandstone_top"],
    "repeater_floor": ["textures/blocks/stone_slab_top","textures/blocks/stone_slab_top"],
    "repeater_torch": ["textures/blocks/redstone_torch_off","textures/blocks/redstone_torch_on"],
    "repeater_up": ["textures/blocks/repeater_off","textures/blocks/repeater_on"],
    "respawn_anchor_bottom": ["textures/blocks/respawn_anchor_bottom","textures/blocks/respawn_anchor_bottom","textures/blocks/respawn_anchor_bottom","textures/blocks/respawn_anchor_bottom","textures/blocks/respawn_anchor_bottom"],
    "respawn_anchor_side": ["textures/blocks/respawn_anchor_side0","textures/blocks/respawn_anchor_side1","textures/blocks/respawn_anchor_side2","textures/blocks/respawn_anchor_side3","textures/blocks/respawn_anchor_side4"],
    "respawn_anchor_top": ["textures/blocks/respawn_anchor_top_off","textures/blocks/respawn_anchor_top","textures/blocks/respawn_anchor_top","textures/blocks/respawn_anchor_top","textures/blocks/respawn_anchor_top"],
    "sand": ["textures/blocks/sand","textures/blocks/red_sand"],
    "sandstone_bottom": ["textures/blocks/sandstone_bottom","textures/blocks/sandstone_top","textures/blocks/sandstone_top","textures/blocks/sandstone_top"],
    "sandstone_side": ["textures/blocks/sandstone_normal","textures/blocks/sandstone_carved","textures/blocks/sandstone_smooth","textures/blocks/sandstone_top"],
    "sandstone_top": ["textures/blocks/sandstone_top","textures/blocks/sandstone_top","textures/blocks/sandstone_top","textures/blocks/sandstone_top"],
    "sapling": ["textures/blocks/sapling_oak","textures/blocks/sapling_spruce","textures/blocks/sapling_birch","textures/blocks/sapling_jungle","textures/blocks/sapling_acacia","textures/blocks/sapling_roofed_oak"],
    "sculk_catalyst_bottom": ["textures/blocks/sculk_catalyst_bottom","textures/blocks/sculk_catalyst_bottom"],
    "sculk_catalyst_side": ["textures/blocks/sculk_catalyst_side","textures/blocks/sculk_catalyst_side_bloom"],
    "sculk_catalyst_top": ["textures/blocks/sculk_catalyst_top","textures/blocks/sculk_catalyst_top_bloom"],
    "sculk_shrieker_inner_top": ["textures/blocks/sculk_shrieker_inner_top","textures/blocks/sculk_shrieker_can_summon_inner_top"],
    "short_dry_grass": ["textures/blocks/short_dry_grass"],
    "shulker_box_top": ["textures/blocks/shulker_top_white","textures/blocks/shulker_top_orange","textures/blocks/shulker_top_magenta","textures/blocks/shulker_top_light_blue","textures/blocks/shulker_top_yellow","textures/blocks/shulker_top_lime","textures/blocks/shulker_top_pink","textures/blocks/shulker_top_gray","textures/blocks/shulker_top_silver","textures/blocks/shulker_top_cyan","textures/blocks/shulker_top_purple","textures/blocks/shulker_top_blue","textures/blocks/shulker_top_brown","textures/blocks/shulker_top_green","textures/blocks/shulker_top_red","textures/blocks/shulker_top_black","textures/blocks/shulker_top_undyed"],
    "smoker": ["textures/blocks/smoker_front_off","textures/blocks/smoker_front_on","textures/blocks/smoker_side","textures/blocks/smoker_top"],
    "smoker_bottom": ["textures/blocks/smoker_bottom","textures/blocks/smoker_bottom"],
    "smoker_side": ["textures/blocks/smoker_side","textures/blocks/smoker_side"],
    "smoker_top": ["textures/blocks/smoker_top","textures/blocks/smoker_top"],
    "sniffer_egg_bottom": ["textures/blocks/sniffer_egg_not_cracked_bottom","textures/blocks/sniffer_egg_slightly_cracked_bottom","textures/blocks/sniffer_egg_very_cracked_bottom"],
    "sniffer_egg_east": ["textures/blocks/sniffer_egg_not_cracked_east","textures/blocks/sniffer_egg_slightly_cracked_east","textures/blocks/sniffer_egg_very_cracked_east"],
    "sniffer_egg_north": ["textures/blocks/sniffer_egg_not_cracked_north","textures/blocks/sniffer_egg_slightly_cracked_north","textures/blocks/sniffer_egg_very_cracked_north"],
    "sniffer_egg_south": ["textures/blocks/sniffer_egg_not_cracked_south","textures/blocks/sniffer_egg_slightly_cracked_south","textures/blocks/sniffer_egg_very_cracked_south"],
    "sniffer_egg_top": ["textures/blocks/sniffer_egg_not_cracked_top","textures/blocks/sniffer_egg_slightly_cracked_top","textures/blocks/sniffer_egg_very_cracked_top"],
    "sniffer_egg_west": ["textures/blocks/sniffer_egg_not_cracked_west","textures/blocks/sniffer_egg_slightly_cracked_west","textures/blocks/sniffer_egg_very_cracked_west"],
    "sponge": ["textures/blocks/sponge","textures/blocks/sponge_wet"],
    "spruce_leaves": ["textures/blocks/leaves_spruce","textures/blocks/leaves_spruce_opaque"],
    "spruce_leaves_carried": ["textures/blocks/leaves_spruce_carried","textures/blocks/leaves_spruce_carried"],
    "spruce_shelf": ["textures/blocks/spruce_shelf"],
    "stained_clay": ["textures/blocks/hardened_clay_stained_white","textures/blocks/hardened_clay_stained_orange","textures/blocks/hardened_clay_stained_magenta","textures/blocks/hardened_clay_stained_light_blue","textures/blocks/hardened_clay_stained_yellow","textures/blocks/hardened_clay_stained_lime","textures/blocks/hardened_clay_stained_pink","textures/blocks/hardened_clay_stained_gray","textures/blocks/hardened_clay_stained_silver","textures/blocks/hardened_clay_stained_cyan","textures/blocks/hardened_clay_stained_purple","textures/blocks/hardened_clay_stained_blue","textures/blocks/hardened_clay_stained_brown","textures/blocks/hardened_clay_stained_green","textures/blocks/hardened_clay_stained_red","textures/blocks/hardened_clay_stained_black"],
    "stained_glass": ["textures/blocks/glass_white","textures/blocks/glass_orange","textures/blocks/glass_magenta","textures/blocks/glass_light_blue","textures/blocks/glass_yellow","textures/blocks/glass_lime","textures/blocks/glass_pink","textures/blocks/glass_gray","textures/blocks/glass_silver","textures/blocks/glass_cyan","textures/blocks/glass_purple","textures/blocks/glass_blue","textures/blocks/glass_brown","textures/blocks/glass_green","textures/blocks/glass_red","textures/blocks/glass_black"],
    "stained_glass_pane_top": ["textures/blocks/glass_pane_top_white","textures/blocks/glass_pane_top_orange","textures/blocks/glass_pane_top_magenta","textures/blocks/glass_pane_top_light_blue","textures/blocks/glass_pane_top_yellow","textures/blocks/glass_pane_top_lime","textures/blocks/glass_pane_top_pink","textures/blocks/glass_pane_top_gray","textures/blocks/glass_pane_top_silver","textures/blocks/glass_pane_top_cyan","textures/blocks/glass_pane_top_purple","textures/blocks/glass_pane_top_blue","textures/blocks/glass_pane_top_brown","textures/blocks/glass_pane_top_green","textures/blocks/glass_pane_top_red","textures/blocks/glass_pane_top_black"],
    "stone": ["textures/blocks/stone","textures/blocks/stone_granite","textures/blocks/stone_granite_smooth","textures/blocks/stone_diorite","textures/blocks/stone_diorite_smooth","textures/blocks/stone_andesite","textures/blocks/stone_andesite_smooth"],
    "stone_slab": ["textures/blocks/stone_slab_top","textures/blocks/stone_slab_side"],
    "stone_slab_bottom": ["textures/blocks/stone_slab_top","textures/blocks/sandstone_bottom","textures/blocks/planks_oak","textures/blocks/cobblestone","textures/blocks/brick","textures/blocks/stonebrick","textures/blocks/quartz_block_top","textures/blocks/nether_brick"],
    "stone_slab_bottom_2": ["textures/blocks/red_sandstone_bottom","textures/blocks/purpur_block","textures/blocks/prismarine_rough","textures/blocks/prismarine_dark","textures/blocks/prismarine_bricks","textures/blocks/cobblestone_mossy","textures/blocks/sandstone_top","textures/blocks/red_nether_brick"],
    "stone_slab_bottom_3": ["textures/blocks/end_bricks","textures/blocks/red_sandstone_top","textures/blocks/stone_andesite_smooth","textures/blocks/stone_andesite","textures/blocks/stone_diorite","textures/blocks/stone_diorite_smooth","textures/blocks/stone_granite","textures/blocks/stone_granite_smooth"],
    "stone_slab_bottom_4": ["textures/blocks/stonebrick_mossy","textures/blocks/quartz_block_bottom","textures/blocks/stone","textures/blocks/sandstone_top","textures/blocks/red_sandstone_top"],
    "stone_slab_side": ["textures/blocks/stone_slab_side","textures/blocks/sandstone_normal","textures/blocks/planks_oak","textures/blocks/cobblestone","textures/blocks/brick","textures/blocks/stonebrick","textures/blocks/quartz_block_side","textures/blocks/nether_brick"],
    "stone_slab_side_2": ["textures/blocks/red_sandstone_normal","textures/blocks/purpur_block","textures/blocks/prismarine_rough","textures/blocks/prismarine_dark","textures/blocks/prismarine_bricks","textures/blocks/cobblestone_mossy","textures/blocks/sandstone_top","textures/blocks/red_nether_brick"],
    "stone_slab_side_3": ["textures/blocks/end_bricks","textures/blocks/red_sandstone_top","textures/blocks/stone_andesite_smooth","textures/blocks/stone_andesite","textures/blocks/stone_diorite","textures/blocks/stone_diorite_smooth","textures/blocks/stone_granite","textures/blocks/stone_granite_smooth"],
    "stone_slab_side_4": ["textures/blocks/stonebrick_mossy","textures/blocks/quartz_block_bottom","textures/blocks/stone","textures/blocks/sandstone_smooth","textures/blocks/red_sandstone_smooth"],
    "stone_slab_top": ["textures/blocks/stone_slab_top","textures/blocks/sandstone_top","textures/blocks/planks_oak","textures/blocks/cobblestone","textures/blocks/brick","textures/blocks/stonebrick","textures/blocks/quartz_block_top","textures/blocks/nether_brick"],
    "stone_slab_top_2": ["textures/blocks/red_sandstone_top","textures/blocks/purpur_block","textures/blocks/prismarine_rough","textures/blocks/prismarine_dark","textures/blocks/prismarine_bricks","textures/blocks/cobblestone_mossy","textures/blocks/sandstone_top","textures/blocks/red_nether_brick"],
    "stone_slab_top_3": ["textures/blocks/end_bricks","textures/blocks/red_sandstone_top","textures/blocks/stone_andesite_smooth","textures/blocks/stone_andesite","textures/blocks/stone_diorite","textures/blocks/stone_diorite_smooth","textures/blocks/stone_granite","textures/blocks/stone_granite_smooth"],
    "stone_slab_top_4": ["textures/blocks/stonebrick_mossy","textures/blocks/quartz_block_bottom","textures/blocks/stone","textures/blocks/sandstone_top","textures/blocks/red_sandstone_top"],
    "stonebrick": ["textures/blocks/stonebrick","textures/blocks/stonebrick_mossy","textures/blocks/stonebrick_cracked","textures/blocks/stonebrick_carved"],
    "structure_block": ["textures/blocks/structure_block","textures/blocks/structure_block_data","textures/blocks/structure_block_save","textures/blocks/structure_block_load","textures/blocks/structure_block_corner","textures/blocks/structure_block_export"],
    "structure_void": ["textures/blocks/structure_void","textures/blocks/structure_air"],
    "sulfur_spike_base": ["textures/blocks/sulfur_spike_down_base","textures/blocks/sulfur_spike_up_base"],
    "sulfur_spike_frustum": ["textures/blocks/sulfur_spike_down_frustum","textures/blocks/sulfur_spike_up_frustum"],
    "sulfur_spike_merge": ["textures/blocks/sulfur_spike_down_tip_merge","textures/blocks/sulfur_spike_up_tip_merge"],
    "sulfur_spike_middle": ["textures/blocks/sulfur_spike_down_middle","textures/blocks/sulfur_spike_up_middle"],
    "sulfur_spike_tip": ["textures/blocks/sulfur_spike_down_tip","textures/blocks/sulfur_spike_up_tip"],
    "sunflower_additional": ["textures/blocks/double_plant_sunflower_front","textures/blocks/double_plant_sunflower_back"],
    "suspicious_gravel": ["textures/blocks/suspicious_gravel_0","textures/blocks/suspicious_gravel_1","textures/blocks/suspicious_gravel_2","textures/blocks/suspicious_gravel_3"],
    "suspicious_sand": ["textures/blocks/suspicious_sand_0","textures/blocks/suspicious_sand_1","textures/blocks/suspicious_sand_2","textures/blocks/suspicious_sand_3"],
    "tall_dry_grass": ["textures/blocks/tall_dry_grass"],
    "tallgrass": ["textures/blocks/tallgrass","textures/blocks/tallgrass","textures/blocks/fern","textures/blocks/fern"],
    "tallgrass_carried": ["textures/blocks/tallgrass_carried","textures/blocks/tallgrass_carried","textures/blocks/fern_carried","textures/blocks/fern_carried"],
    "torchflower_crop": ["textures/blocks/torchflower_crop_stage_0","textures/blocks/torchflower_crop_stage_1"],
    "trapped_chest_inventory_front": ["textures/blocks/trapped_chest_front"],
    "trial_spawner_bottom": ["textures/blocks/trial_spawner_bottom","textures/blocks/trial_spawner_bottom","textures/blocks/trial_spawner_bottom","textures/blocks/trial_spawner_bottom","textures/blocks/trial_spawner_bottom","textures/blocks/trial_spawner_bottom","textures/blocks/trial_spawner_bottom","textures/blocks/trial_spawner_bottom","textures/blocks/trial_spawner_bottom","textures/blocks/trial_spawner_bottom","textures/blocks/trial_spawner_bottom","textures/blocks/trial_spawner_bottom"],
    "trial_spawner_side": ["textures/blocks/trial_spawner_side_inactive","textures/blocks/trial_spawner_side_active","textures/blocks/trial_spawner_side_active","textures/blocks/trial_spawner_side_active","textures/blocks/trial_spawner_side_active","textures/blocks/trial_spawner_side_inactive","textures/blocks/trial_spawner_side_inactive_ominous","textures/blocks/trial_spawner_side_active_ominous","textures/blocks/trial_spawner_side_active_ominous","textures/blocks/trial_spawner_side_active_ominous","textures/blocks/trial_spawner_side_active_ominous","textures/blocks/trial_spawner_side_inactive_ominous"],
    "trial_spawner_top": ["textures/blocks/trial_spawner_top_inactive","textures/blocks/trial_spawner_top_active","textures/blocks/trial_spawner_top_active","textures/blocks/trial_spawner_top_ejecting_reward","textures/blocks/trial_spawner_top_ejecting_reward","textures/blocks/trial_spawner_top_inactive","textures/blocks/trial_spawner_top_inactive_ominous","textures/blocks/trial_spawner_top_active_ominous","textures/blocks/trial_spawner_top_active_ominous","textures/blocks/trial_spawner_top_ejecting_reward_ominous","textures/blocks/trial_spawner_top_ejecting_reward_ominous","textures/blocks/trial_spawner_top_inactive_ominous"],
    "turtle_egg": ["textures/blocks/turtle_egg_not_cracked","textures/blocks/turtle_egg_slightly_cracked","textures/blocks/turtle_egg_very_cracked"],
    "twisting_vines_base": ["textures/blocks/twisting_vines_base"],
    "twisting_vines_bottom": ["textures/blocks/twisting_vines_bottom"],
    "vault_bottom": ["textures/blocks/vault_bottom","textures/blocks/vault_bottom","textures/blocks/vault_bottom","textures/blocks/vault_bottom","textures/blocks/vault_bottom_ominous","textures/blocks/vault_bottom_ominous","textures/blocks/vault_bottom_ominous","textures/blocks/vault_bottom_ominous"],
    "vault_front": ["textures/blocks/vault_front_off","textures/blocks/vault_front_on","textures/blocks/vault_front_ejecting","textures/blocks/vault_front_ejecting","textures/blocks/vault_front_off_ominous","textures/blocks/vault_front_on_ominous","textures/blocks/vault_front_ejecting_ominous","textures/blocks/vault_front_ejecting_ominous"],
    "vault_side": ["textures/blocks/vault_side_off","textures/blocks/vault_side_on","textures/blocks/vault_side_on","textures/blocks/vault_side_on","textures/blocks/vault_side_off_ominous","textures/blocks/vault_side_on_ominous","textures/blocks/vault_side_on_ominous","textures/blocks/vault_side_on_ominous"],
    "vault_top": ["textures/blocks/vault_top","textures/blocks/vault_top","textures/blocks/vault_top","textures/blocks/vault_top_ejecting","textures/blocks/vault_top_ominous","textures/blocks/vault_top_ominous","textures/blocks/vault_top_ominous","textures/blocks/vault_top_ejecting_ominous"],
    "warped_shelf": ["textures/blocks/warped_shelf"],
    "warped_wart_block": ["textures/blocks/warped_wart_block"],
    "waterlily": [{"path":"textures/blocks/waterlily","tint_color":"#208030"}],
    "weathered_copper_bulb": ["textures/blocks/weathered_copper_bulb","textures/blocks/weathered_copper_bulb_lit","textures/blocks/weathered_copper_bulb_powered","textures/blocks/weathered_copper_bulb_lit_powered"],
    "weathered_copper_chest_inventory_front": ["textures/blocks/weathered_copper_chest_inventory_front"],
    "weathered_copper_chest_inventory_side": ["textures/blocks/weathered_copper_chest_inventory_side"],
    "weathered_copper_chest_inventory_top": ["textures/blocks/weathered_copper_chest_inventory_top"],
    "weathered_lightning_rod": ["textures/blocks/weathered_lightning_rod","textures/blocks/lightning_rod_powered"],
    "weeping_vines_base": ["textures/blocks/weeping_vines_base"],
    "weeping_vines_bottom": ["textures/blocks/weeping_vines_bottom"],
    "wheat": ["textures/blocks/wheat_stage_0","textures/blocks/wheat_stage_1","textures/blocks/wheat_stage_2","textures/blocks/wheat_stage_3","textures/blocks/wheat_stage_4","textures/blocks/wheat_stage_5","textures/blocks/wheat_stage_6","textures/blocks/wheat_stage_7"],
    "white_candle": ["textures/blocks/candles/white_candle","textures/blocks/candles/white_candle_lit"],
    "wildflowers": ["textures/blocks/wildflowers","textures/blocks/wildflowers_stem"],
    "wood": ["textures/blocks/log_oak","textures/blocks/stripped_oak_log","textures/blocks/log_spruce","textures/blocks/stripped_spruce_log","textures/blocks/log_birch","textures/blocks/stripped_birch_log","textures/blocks/log_jungle","textures/blocks/stripped_jungle_log","textures/blocks/log_acacia","textures/blocks/stripped_acacia_log","textures/blocks/log_big_oak","textures/blocks/stripped_dark_oak_log"],
    "wool": ["textures/blocks/wool_colored_white","textures/blocks/wool_colored_orange","textures/blocks/wool_colored_magenta","textures/blocks/wool_colored_light_blue","textures/blocks/wool_colored_yellow","textures/blocks/wool_colored_lime","textures/blocks/wool_colored_pink","textures/blocks/wool_colored_gray","textures/blocks/wool_colored_silver","textures/blocks/wool_colored_cyan","textures/blocks/wool_colored_purple","textures/blocks/wool_colored_blue","textures/blocks/wool_colored_brown","textures/blocks/wool_colored_green","textures/blocks/wool_colored_red","textures/blocks/wool_colored_black"],
    "yellow_candle": ["textures/blocks/candles/yellow_candle","textures/blocks/candles/yellow_candle_lit"],
    "yellow_poplar_leaves": ["textures/blocks/yellow_poplar_leaves","textures/blocks/yellow_poplar_leaves_opaque"]
};

// Rotation-enabled RP entries from the pinned Bedrock 1.26.50.4 reference blocks.json.
// Keep the complete entry when adding an override so textures, tint-related settings,
// carried aliases and sounds are not replaced with guessed defaults.
const VANILLA_ROTATING_BLOCKS = {
  "acacia_leaves": {
    "ambient_occlusion_exponent": 0.8,
    "carried_textures": "acacia_leaves_carried",
    "isotropic": {
      "down": true,
      "up": true
    },
    "sound": "grass",
    "textures": "acacia_leaves"
  },
  "azalea_leaves": {
    "ambient_occlusion_exponent": 0.8,
    "isotropic": {
      "down": true,
      "up": true
    },
    "sound": "azalea_leaves",
    "textures": "azalea_leaves"
  },
  "azalea_leaves_flowered": {
    "ambient_occlusion_exponent": 0.8,
    "isotropic": {
      "down": true,
      "up": true
    },
    "sound": "azalea_leaves",
    "textures": "azalea_leaves_flowered"
  },
  "birch_leaves": {
    "ambient_occlusion_exponent": 0.8,
    "carried_textures": "birch_leaves_carried",
    "isotropic": {
      "down": true,
      "up": true
    },
    "sound": "grass",
    "textures": "birch_leaves"
  },
  "camera": {
    "isotropic": true,
    "textures": {
      "down": "camera_top",
      "east": "camera_side",
      "north": "camera_back",
      "south": "camera_front",
      "up": "camera_top",
      "west": "camera_side"
    }
  },
  "chiseled_red_sandstone": {
    "ambient_occlusion_exponent": 1,
    "isotropic": {
      "down": true,
      "up": true
    },
    "sound": "stone",
    "textures": {
      "down": "flattened_redsandstone_top",
      "side": "chiseled_red_sandstone",
      "up": "flattened_redsandstone_top"
    }
  },
  "chiseled_sandstone": {
    "ambient_occlusion_exponent": 1,
    "isotropic": {
      "down": true,
      "up": true
    },
    "sound": "stone",
    "textures": {
      "down": "flattened_sandstone_top",
      "side": "chiseled_sandstone",
      "up": "flattened_sandstone_top"
    }
  },
  "clay": {
    "isotropic": true,
    "sound": "gravel",
    "textures": "clay"
  },
  "coarse_dirt": {
    "isotropic": true,
    "sound": "gravel",
    "textures": "coarse_dirt"
  },
  "crimson_nylium": {
    "isotropic": {
      "down": true,
      "up": true
    },
    "sound": "nylium",
    "textures": {
      "down": "netherrack",
      "east": "crimson_nylium_side",
      "north": "crimson_nylium_side",
      "south": "crimson_nylium_side",
      "up": "crimson_nylium_top",
      "west": "crimson_nylium_side"
    }
  },
  "crying_obsidian": {
    "ambient_occlusion_exponent": 2,
    "isotropic": true,
    "sound": "stone",
    "textures": "crying_obsidian"
  },
  "cut_red_sandstone": {
    "ambient_occlusion_exponent": 1,
    "isotropic": {
      "down": true,
      "up": true
    },
    "sound": "stone",
    "textures": {
      "down": "flattened_redsandstone_top",
      "side": "cut_red_sandstone",
      "up": "flattened_redsandstone_top"
    }
  },
  "cut_sandstone": {
    "ambient_occlusion_exponent": 1,
    "isotropic": {
      "down": true,
      "up": true
    },
    "sound": "stone",
    "textures": {
      "down": "flattened_sandstone_top",
      "side": "cut_sandstone",
      "up": "flattened_sandstone_top"
    }
  },
  "dark_oak_leaves": {
    "ambient_occlusion_exponent": 0.8,
    "carried_textures": "big_oak_leaves_carried",
    "isotropic": {
      "down": true,
      "up": true
    },
    "sound": "grass",
    "textures": "big_oak_leaves"
  },
  "deepslate": {
    "isotropic": {
      "down": true,
      "up": true
    },
    "sound": "deepslate",
    "textures": {
      "down": "deepslate_top",
      "side": "deepslate",
      "up": "deepslate_top"
    }
  },
  "dirt": {
    "isotropic": true,
    "sound": "gravel",
    "textures": "flattened_dirt"
  },
  "dirt_with_roots": {
    "isotropic": true,
    "sound": "dirt_with_roots",
    "textures": "dirt_with_roots"
  },
  "glowstone": {
    "isotropic": true,
    "sound": "glass",
    "textures": "glowstone"
  },
  "grass": {
    "carried_textures": {
      "down": "grass_carried_bottom",
      "side": "grass_carried",
      "up": "grass_carried_top"
    },
    "isotropic": {
      "down": true,
      "up": true
    },
    "sound": "grass",
    "textures": {
      "down": "grass_bottom",
      "side": "grass_side",
      "up": "grass_top"
    }
  },
  "grass_path": {
    "isotropic": {
      "down": true,
      "up": true
    },
    "sound": "grass",
    "textures": {
      "down": "dirt",
      "side": "grass_path_side",
      "up": "grass_path_top"
    }
  },
  "hardened_clay": {
    "isotropic": true,
    "sound": "terracotta",
    "textures": "hardened_clay"
  },
  "infested_deepslate": {
    "isotropic": {
      "down": true,
      "up": true
    },
    "sound": "deepslate",
    "textures": {
      "down": "deepslate_top",
      "side": "deepslate",
      "up": "deepslate_top"
    }
  },
  "jungle_leaves": {
    "ambient_occlusion_exponent": 0.8,
    "carried_textures": "jungle_leaves_carried",
    "isotropic": {
      "down": true,
      "up": true
    },
    "sound": "grass",
    "textures": "jungle_leaves"
  },
  "lava": {
    "isotropic": true,
    "textures": {
      "down": "still_lava",
      "side": "flowing_lava",
      "up": "still_lava"
    }
  },
  "leaves": {
    "ambient_occlusion_exponent": 0.8,
    "carried_textures": "leaves_carried",
    "isotropic": {
      "down": true,
      "up": true
    },
    "sound": "grass",
    "textures": "leaves"
  },
  "leaves2": {
    "ambient_occlusion_exponent": 0.8,
    "carried_textures": "leaves_carried2",
    "isotropic": {
      "down": true,
      "up": true
    },
    "sound": "grass",
    "textures": "leaves2"
  },
  "magma": {
    "isotropic": true,
    "sound": "stone",
    "textures": "magma"
  },
  "mycelium": {
    "isotropic": {
      "down": true,
      "up": true
    },
    "sound": "grass",
    "textures": {
      "down": "mycelium_bottom",
      "side": "mycelium_side",
      "up": "mycelium_top"
    }
  },
  "netherrack": {
    "isotropic": true,
    "sound": "netherrack",
    "textures": "netherrack"
  },
  "oak_leaves": {
    "ambient_occlusion_exponent": 0.8,
    "carried_textures": "oak_leaves_carried",
    "isotropic": {
      "down": true,
      "up": true
    },
    "sound": "grass",
    "textures": "oak_leaves"
  },
  "obsidian": {
    "ambient_occlusion_exponent": 2,
    "isotropic": true,
    "sound": "stone",
    "textures": "obsidian"
  },
  "podzol": {
    "isotropic": {
      "down": true,
      "up": true
    },
    "sound": "gravel",
    "textures": {
      "down": "dirt_podzol_bottom",
      "side": "dirt_podzol_side",
      "up": "dirt_podzol_top"
    }
  },
  "red_sand": {
    "ambient_occlusion_exponent": 0.55,
    "isotropic": true,
    "sound": "sand",
    "textures": "red_sand"
  },
  "red_sandstone": {
    "ambient_occlusion_exponent": 1,
    "isotropic": {
      "down": true,
      "up": true
    },
    "sound": "stone",
    "textures": {
      "down": "flattened_redsandstone_bottom",
      "side": "flattened_redsandstone",
      "up": "flattened_redsandstone_top"
    }
  },
  "red_sandstone_stairs": {
    "isotropic": {
      "down": true,
      "up": true
    },
    "textures": {
      "down": "redsandstone_bottom",
      "side": "redsandstone_side",
      "up": "redsandstone_top"
    }
  },
  "sand": {
    "ambient_occlusion_exponent": 0.55,
    "isotropic": true,
    "sound": "sand",
    "textures": "flattened_sand"
  },
  "sandstone": {
    "ambient_occlusion_exponent": 1,
    "isotropic": {
      "down": true,
      "up": true
    },
    "sound": "stone",
    "textures": {
      "down": "flattened_sandstone_bottom",
      "side": "flattened_sandstone",
      "up": "flattened_sandstone_top"
    }
  },
  "sandstone_stairs": {
    "isotropic": {
      "down": true,
      "up": true
    },
    "textures": {
      "down": "sandstone_bottom",
      "side": "sandstone_side",
      "up": "sandstone_top"
    }
  },
  "sculk": {
    "isotropic": true,
    "sound": "sculk",
    "textures": "sculk"
  },
  "smooth_red_sandstone": {
    "ambient_occlusion_exponent": 1,
    "isotropic": {
      "down": true,
      "up": true
    },
    "sound": "stone",
    "textures": {
      "down": "flattened_redsandstone_top",
      "side": "smooth_red_sandstone",
      "up": "flattened_redsandstone_top"
    }
  },
  "smooth_sandstone": {
    "ambient_occlusion_exponent": 1,
    "isotropic": {
      "down": true,
      "up": true
    },
    "sound": "stone",
    "textures": {
      "down": "flattened_sandstone_top",
      "side": "smooth_sandstone",
      "up": "flattened_sandstone_top"
    }
  },
  "snow": {
    "ambient_occlusion_exponent": 1,
    "isotropic": true,
    "sound": "snow",
    "textures": "snow"
  },
  "snow_layer": {
    "ambient_occlusion_exponent": 1,
    "isotropic": true,
    "sound": "snow",
    "textures": "snow"
  },
  "sponge": {
    "isotropic": true,
    "sound": "sponge",
    "textures": "flattened_sponge"
  },
  "spruce_leaves": {
    "ambient_occlusion_exponent": 0.8,
    "carried_textures": "spruce_leaves_carried",
    "isotropic": {
      "down": true,
      "up": true
    },
    "sound": "grass",
    "textures": "spruce_leaves"
  },
  "stained_hardened_clay": {
    "isotropic": true,
    "sound": "stone",
    "textures": "stained_clay"
  },
  "warped_nylium": {
    "isotropic": {
      "down": true,
      "up": true
    },
    "sound": "nylium",
    "textures": {
      "down": "netherrack",
      "east": "warped_nylium_side",
      "north": "warped_nylium_side",
      "south": "warped_nylium_side",
      "up": "warped_nylium_top",
      "west": "warped_nylium_side"
    }
  },
  "wet_sponge": {
    "isotropic": true,
    "sound": "wet_sponge",
    "textures": "wet_sponge"
  }
};
const STATIC_CTM = new Set(["top", "fixed", "repeat", "ctm", "ctm_compact", "horizontal", "vertical", "horizontal+vertical", "vertical+horizontal"]);
const OVERLAY_CTM = new Set(["overlay_fixed", "overlay_random", "overlay_repeat"]);
const slotPath = slot => typeof slot === "string" ? slot : slot?.path;
const own = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

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

        const out = Object.create(null);
        for (const raw of logical) {
            const line = raw.trim();
            if (!line || line.startsWith("#") || line.startsWith("!")) continue;
            const m = line.match(/^([^\s=:]+)(?:\s*[=:]\s*|\s+)(.*)$/);
            if (m) out[m[1]] = m[2].trim();
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
            if (!Number.isSafeInteger(a) || !Number.isSafeInteger(b) || b < a || b - a > 255) return null;
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
        else if (t.startsWith("textures/") || t.startsWith("optifine/") || t.startsWith("mcpatcher/")) path = "assets/minecraft/" + t;
        else if (t.startsWith("~/")) path = "assets/minecraft/optifine/" + t.slice(2);
        else if (t.startsWith("/")) return null;
        else path = this.dirname(propertiesPath) + t;

        const clean = this.cleanRelative(path);
        if (!clean?.startsWith("assets/minecraft/")) return null;
        const png = clean + ".png";
        return clean.startsWith("assets/minecraft/textures/") ? this.javaTextureToBedrock(png) : png;
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
        const faces = (props.faces ?? "all").toLowerCase();
        const asBlock = token => token.replace(/^minecraft:/,"");
        const restrict = matchBlocks.length ? new Set(matchBlocks.flatMap(token =>
            BEDROCK_1_26_50_4_SAFE_BLOCK_TO_TERRAIN_KEYS[asBlock(token)] || [])) : null;
        if (matchTiles.length && matchBlocks.some(token => !own(BEDROCK_1_26_50_4_SAFE_BLOCK_TO_TERRAIN_KEYS,asBlock(token)))) {
            return { error:matchBlocks.some(token=>token.includes("snowy=true")) ?
                "snowy top/side exception has no equivalent Bedrock slot (snowed side is not a snowy top)" :
                "combined matchTiles+matchBlocks lacks a lossless block/state mapping" };
        }
        if (!matchTiles.length && faces !== "all") return {error:"face restriction requires a proven terrain tile"};

        if (matchTiles.length) {
            const targets = new Map();
            for (const token of matchTiles) {
                const path = this.resolveMatchTile(token);
                const mapped = path ? BEDROCK_1_26_50_4_TERRAIN_PATH_TO_KEYS[path] : null;
                if (!mapped?.length) return { error: `no Bedrock terrain alias for matchTile ${token}` };
                if (faces !== "all" && !this.provenFace(path, faces)) {
                    return {error:`face restriction is not proven for ${token}: ${faces}`};
                }
                for (const key of mapped) {
                    if (restrict && !restrict.has(key)) continue;
                    if (!targets.has(key)) targets.set(key, new Set());
                    targets.get(key).add(path);
                }
            }
            return { keys: [...targets.keys()].sort(), targets };
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
        return { keys: [...new Set(mapped)].sort(), targets: new Map(mapped.map(key => [key, new Set([path])])) };
    }

    baseLayout(catalog, key, matchedPaths) {
        const existing = catalog.texture_data?.[key]?.textures;
        if (existing !== undefined) return existing;
        if (own(VANILLA_LAYOUTS, key)) return VANILLA_LAYOUTS[key];
        if (matchedPaths?.size === 1) return [...matchedPaths][0];
        const paths = Object.keys(BEDROCK_1_26_50_4_TERRAIN_PATH_TO_KEYS)
            .filter(path => BEDROCK_1_26_50_4_TERRAIN_PATH_TO_KEYS[path].includes(key));
        return paths.length === 1 ? paths[0] : undefined;
    }

    unsupportedCondition(props) {
        const blockers = new Set([
            "biomes", "heights", "minheight", "maxheight", "name", "nbt",
            "profession", "professions", "baby", "health", "moonphase",
            "daytime", "weather", "sizes", "size", "tintblock"
        ]);
        for (const [key, raw] of Object.entries(props)) {
            const k = key.toLowerCase(), v = raw.toLowerCase();
            if (blockers.has(k) || k.startsWith("nbt.") ||
                (k === "symmetry" && v !== "none") ||
                (k === "linked" && v !== "false") || (k === "randomloops" && v !== "0") ||
                (k === "tintindex" && v !== "-1") ||
                (k === "layer" && !["cutout", "cutout_mipped", "translucent"].includes(v))) {
                return `${key}=${raw}`;
            }
        }
        return null;
    }

    async resolveCtmSource(path, token) {
        const file = this.resolveTileSource(path, token);
        return file && await this.output.exists(file) ? file : null;
    }

    // Static compatibility mode: do not pretend a single tile preserves world
    // repeat or neighbor matching. CTM full uses the isolated tile; compact uses
    // the unconnected base. Straight strip layouts use their isolated tile.
    staticTileIndex(method) {
        return ["horizontal", "vertical", "horizontal+vertical", "vertical+horizontal"].includes(method) ? 3 : 0;
    }

    async bakeOverlay(base, layer, dest) {
        const image = await this.readImage(base);
        const overlay = await this.readImage(layer);
        const w = image.getWidth(), h = image.getHeight();
        if (!w || !h || w !== h || overlay.getWidth() !== overlay.getHeight() ||
            w > 2048 || overlay.getWidth() > 2048) {
            throw Error("overlay requires square, non-animated textures up to 2048px");
        }
        const size = Math.max(w, overlay.getWidth());
        // Upscale by nearest-neighbor without depending on the image backend's resize modes.
        const merged = await this.createImage(size, size);
        const a = image.bitmap.data, z = overlay.bitmap.data, out = merged.bitmap.data;
        const zw = overlay.getWidth();
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const ai = (Math.floor(y*w/size)*w + Math.floor(x*w/size))*4;
                const zi = (Math.floor(y*zw/size)*zw + Math.floor(x*zw/size))*4;
                const o = (y*size+x)*4;
                const fg = z[zi+3]/255, bg = a[ai+3]/255*(1-fg), alpha = fg+bg;
                for (let c=0;c<3;c++) out[o+c] = alpha ? Math.round((z[zi+c]*fg+a[ai+c]*bg)/alpha) : 0;
                out[o+3] = Math.round(alpha*255);
            }
        }
        await this.writeImage(dest, merged);
    }

    provenFace(path, faces) {
        // Only vanilla aliases whose use is unambiguous; a filename suffix alone is not proof.
        const table = {
            "textures/blocks/grass_top":"top",
            "textures/blocks/barrel_top":"top",
            "textures/blocks/barrel_top_open":"top",
            "textures/blocks/barrel_bottom":"bottom",
            "textures/blocks/barrel_side":"sides"
        };
        const side = table[path];
        return !!side && this.splitTokens(faces).some(f => f === side ||
            (side === "top" && f === "up") || (side === "bottom" && f === "down"));
    }

    overlayBudget() { return 256; }

    async imageKey(source) {
        const image=await this.readImage(source);
        const bytes=image.bitmap.data;
        let hash=2166136261;
        for(const value of bytes) hash=Math.imul(hash^value,16777619);
        return {bytes,key:`${image.getWidth()}x${image.getHeight()}:${hash>>>0}`};
    }

    async uniqueTiles(variants) {
        const winners=[], buckets=new Map();
        // Scoped to one dedup pass, so regenerated output paths cannot use
        // stale pixels. Keep decoded memory bounded on mobile.
        const cache = new Map();
        const budget = 8 * 1024 * 1024;
        let retained = 0;
        const getImageKey = async source => {
            const cached = cache.get(source);
            if (cached) {
                cache.delete(source);
                cache.set(source, cached);
                return cached;
            }
            const decoded = await this.imageKey(source);
            if (decoded.bytes.byteLength <= budget) {
                while (retained + decoded.bytes.byteLength > budget) {
                    const oldest = cache.keys().next().value;
                    retained -= cache.get(oldest).bytes.byteLength;
                    cache.delete(oldest);
                }
                cache.set(source, decoded);
                retained += decoded.bytes.byteLength;
            }
            return decoded;
        };
        for (const variant of variants) {
            if (!variant.source) { winners.push({...variant}); continue; }
            const a=await getImageKey(variant.source);
            // Material metadata matters only when requested. Exact compare on hash
            // collisions keeps the digest from merging unrelated visible textures.
            const material=this.options?.includeMaterialMaps === false ? "" : await this.materialIdentity(variant.source);
            const key=a.key+"|"+material;
            const candidates=buckets.get(key)||[];
            let merged=false;
            for(const i of candidates) {
                const b=await getImageKey(winners[i].source);
                if(a.bytes.length===b.bytes.length && a.bytes.every((n,j)=>n===b.bytes[j])) {
                    winners[i].weight+=variant.weight; merged=true; break;
                }
            }
            if(!merged) {
                candidates.push(winners.length);
                buckets.set(key,candidates);
                winners.push({...variant});
            }
        }
        return winners;
    }

    materialPath(source,suffix) { return source.replace(/\.png$/i,suffix); }

    async readTextureSet(source) {
        const path=this.materialPath(source,".texture_set.json");
        if(!await this.output.exists(path)) return null;
        const parsed=JSON.parse((await this.output.read(path)).toString("utf8"));
        const set=parsed["minecraft:texture_set"];
        if(!set || typeof set!=="object") throw Error("invalid texture set: "+path);
        return {path,parsed,set};
    }

    async materialIdentity(source) {
        // Conservatively keep separate material sets; Java shader maps are not
        // automatically equivalent to Bedrock MER or tangent-space conventions.
        for(const suffix of [".texture_set.json","_n.png","_s.png","_normal.png","_specular.png","_mer.png","_heightmap.png"]) {
            if(await this.output.exists(this.materialPath(source,suffix))) return source;
        }
        return "";
    }

    async copyCtmMaterial(source,dest) {
        if(this.options?.includeMaterialMaps===false) return;
        try {
            const entry=await this.readTextureSet(source);
            if(!entry) {
                if(await this.materialIdentity(source)) this.log.warn("OptiFine CTM: Java shader maps are not Bedrock texture sets: "+source);
                return;
            }
            const {parsed,set}=entry;
            const oldBase=source.split("/").pop().slice(0,-4);
            if(set.color!==oldBase && set.color!==oldBase+".png") throw Error("texture set uses nonlocal or different color");
            const newBase=dest.split("/").pop().slice(0,-4);
            const copies=[];
            for(const [k,value] of Object.entries(set)) {
                if(k==="color" || typeof value!=="string") continue;
                if(!/^[a-zA-Z0-9_.-]+$/.test(value) || value==="." || value==="..") throw Error("nonlocal material path");
                const file=this.dirname(source)+value.replace(/\.png$/i,"")+".png";
                const destMap=this.materialPath(dest,"_"+k+".png");
                if(!await this.output.exists(file)) throw Error("missing material "+file);
                copies.push([file,destMap]);
                set[k]=newBase+"_"+k;
            }
            set.color=newBase;
            for(const [from,to] of copies) await this.output.copy(from,to);
            await this.writeJson(this.materialPath(dest,".texture_set.json"),parsed);
        } catch(error) {
            this.log.warn("OptiFine CTM: material conversion skipped: "+source+": "+error.message);
        }
    }

    async cleanMaterialMaps() {
        const optOut = this.options?.includeMaterialMaps === false;
        const files = this.output?.zip?.files;
        if (!files) {
            if (optOut) this.log.warn("Material opt-out: backend cannot enumerate resources");
            return;
        }
        const paths = Object.keys(files).filter(p => !files[p].dir && p.startsWith("textures/"));
        const existing = new Set(paths), remove = new Set(), colors = new Set(), bound = new Set();
        const materialFields = /^(normal|heightmap|metalness_emissive_roughness(_subsurface)?|metalness|emissive|roughness|specular)$/;
        const sidecar = /_(n|s|normal|specular|mer|heightmap)\.png$/i;
        const local = (path, value) =>
            typeof value === "string" && /^[a-zA-Z0-9_.-]+$/.test(value) && value !== "." && value !== ".." ?
                this.dirname(path) + value.replace(/\.png$/i, "") + ".png" : null;
        for (const path of paths.filter(p => p.endsWith(".texture_set.json"))) {
            try {
                const {parsed, set} = await this.readTextureSet(path.replace(/\.texture_set\.json$/, ".png"));
                const color = local(path, set.color);
                if (color) colors.add(color);
                let changed = false;
                for (const [key, value] of Object.entries(set)) if (materialFields.test(key)) {
                    const map = local(path, value);
                    if (!optOut) {
                        if (map) bound.add(map);
                        continue;
                    }
                    if (map) remove.add(map);
                    delete set[key];
                    changed = true;
                }
                if (changed) {
                    const base = path.replace(/\.texture_set\.json$/, ".png");
                    if (color === base && existing.has(base)) await this.output.delete(path);
                    else await this.writeJson(path, parsed);
                }
            } catch (error) {
                if (optOut) {
                    this.log.warn("Material opt-out: invalid texture set removed: " + path + ": " + error.message);
                    await this.output.delete(path);
                }
            }
        }
        // Java sidecars keep their original basename when only the color is
        // renamed; alpha-bearing colors may also have been converted to TGA.
        for (const path of paths) {
            const base = path.replace(sidecar, ".png");
            if (base === path) continue;
            const java = base.replace(/^textures\/blocks\//, "textures/block/")
                .replace(/^textures\/items\//, "textures/item/");
            const target = this.javaTextureToBedrock("assets/minecraft/" + java);
            const hasColor = candidate => existing.has(candidate) ||
                existing.has(candidate.replace(/\.png$/i, ".tga"));
            if (hasColor(base) || hasColor(target) ||
                (target !== base && !existing.has(base))) remove.add(path);
        }
        let removed = 0;
        for (const path of remove) {
            const keys = BEDROCK_1_26_50_4_TERRAIN_PATH_TO_KEYS[path.replace(/\.png$/i, "")];
            if (existing.has(path) && !colors.has(path) && !keys?.length && (optOut || !bound.has(path))) {
                await this.output.delete(path);
                removed++;
            }
        }
        if (removed) this.log.log("Material cleanup: removed " + removed +
            (optOut ? " disabled material maps" : " unbound material maps"));
    }

    indexChains(rules) {
        const index=new Map(),paths=new Set();
        for(const rule of rules) {
            const method=rule.props.method?.toLowerCase();
            if(!["fixed","random"].includes(method) || rule.props.matchBlocks ||
                (rule.props.faces && rule.props.faces!=="all") || this.unsupportedCondition(rule.props)) continue;
            const targets=this.splitTokens(rule.props.matchTiles);
            if(!targets.length || targets.some(t=>BEDROCK_1_26_50_4_TERRAIN_PATH_TO_KEYS[this.resolveMatchTile(t)])) continue;
            const sources=targets.map(t=>this.resolveTileSource(rule.path,t));
            if(sources.some(p=>!p || !this.ruleRoot(p))) continue;
            for(const p of sources) {
                if(!index.has(p)) index.set(p,[]);
                index.get(p).push(rule);
            }
            paths.add(rule.path);
        }
        return {index,paths,used:new Set()};
    }

    async followChains(variants, parent, chains) {
        if(!chains) return variants;
        let expanded=0;
        const walk=async (v,seen,depth)=>{
            if(!v.source || !chains.index.has(v.source)) return [v];
            if(depth>=4 || seen.has(v.source)) throw Error("cycle or depth limit at "+v.source);
            if(++expanded>256) throw Error("chain expansion budget exceeded");
            for(const rule of chains.index.get(v.source)) {
                if(rule.path===parent) throw Error("recursive CTM rule: "+parent);
                const tokens=this.expandTiles(rule.props.tiles||"");
                const fixed=rule.props.method.toLowerCase()==="fixed";
                if(!tokens?.length || tokens.length>256 || (fixed && tokens.length!==1)) continue;
                if(tokens.every(token=>token==="<skip>")) { chains.used.add(rule.path); continue; }
                if(tokens.includes("<skip>")) {
                    this.log.warn("OptiFine CTM: weighted <skip> chain cannot be flattened: "+rule.path);
                    continue;
                }
                const weights=this.normalizeWeights(fixed?"":rule.props.weights,tokens.length);
                const total=weights?.reduce((a,b)=>a+b,0);
                if(!total || !Number.isFinite(total)) continue;
                const out=[];
                for(let i=0;i<tokens.length;i++) {
                    if(!weights[i]) continue;
                    const weight=v.weight*weights[i]/total;
                    if(tokens[i]==="<default>") { out.push({...v,weight}); continue; }
                    const source=await this.resolveCtmSource(rule.path,tokens[i]);
                    if(!source) { out.length=0; break; }
                    const next={source,weight,dest:v.dest.replace(/\.png$/,`_chain_${i}.png`)};
                    out.push(...await walk(next,new Set([...seen,v.source]),depth+1));
                    if(out.length>256) throw Error("chain expansion budget exceeded");
                }
                if(out.length) { chains.used.add(rule.path); return out; }
            }
            return [v];
        };
        try {
            const out=[];
            for(const v of variants) {
                out.push(...await walk(v,new Set(),0));
                if(out.length>256) throw Error("chain output limit exceeded");
            }
            return out;
        } catch(error) {
            this.log.warn("OptiFine CTM: chain kept at its original tiles: "+parent+": "+error.message);
            return variants;
        }
    }

    // OptiFine's symmetry correlates/mirrors faces; it is not an opt-in to
    // Bedrock's random UV rotation. Do not generate rotated/mirrored copies.
    async disableVariantRotation(aliases) {
        if (!aliases.size) return;
        const path = "blocks.json";
        let blocks = {};
        if (await this.output.exists(path)) {
            try {
                blocks = JSON.parse((await this.output.read(path)).toString("utf8").replace(/^\uFEFF/,""));
                if (!blocks || typeof blocks !== "object" || Array.isArray(blocks)) throw Error("expected an object");
            } catch (error) {
                this.log.warn("OptiFine CTM: cannot apply rotation overrides to blocks.json: "+error.message);
                return;
            }
        }
        const faces = ["up","down","north","south","east","west"];
        const texture = (entry, face) => typeof entry.textures === "string" ?
            entry.textures : entry.textures?.[face] ?? (face !== "up" && face !== "down" ? entry.textures?.side : undefined);
        let count = 0;
        const names = new Set([...Object.keys(VANILLA_ROTATING_BLOCKS),...Object.keys(blocks)]);
        for (const name of names) {
            const vanillaName = name.replace(/^minecraft:/,"");
            if (!own(blocks,name) && own(blocks,"minecraft:"+name)) continue;
            const vanilla = VANILLA_ROTATING_BLOCKS[vanillaName];
            const existing = blocks[name];
            if (existing !== undefined && (!existing || typeof existing !== "object" || Array.isArray(existing))) continue;
            const entry = {...vanilla,...existing}, iso = entry.isotropic;
            const enabled = face => iso === true || (iso && typeof iso === "object" &&
                (iso[face] ?? (face !== "up" && face !== "down" ? iso.side : undefined)) === true);
            const off = faces.filter(face => enabled(face) && aliases.has(texture(entry,face)));
            if (!off.length) continue;
            if (iso === true) {
                entry.isotropic = off.length === faces.length ? false :
                    Object.fromEntries(faces.map(face => [face,!off.includes(face)]));
            } else {
                entry.isotropic = {...iso};
                for (const face of off) entry.isotropic[face] = false;
            }
            blocks[name] = entry;
            count++;
        }
        if (count) {
            await this.writeJson(path,blocks);
            this.log.log(`OptiFine CTM: disabled random face rotation in ${count} RP block entries`);
        }
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
            this.log.warn(`OptiFine CTM: existing terrain_texture.json could not be parsed (${error.message})`);
            return null;
        }
    }

    async convertRule(path, catalog, claims, parsed) {
        let props;
        try {
            props = parsed ?? this.parseProperties((await this.output.read(path)).toString("utf8").replace(/^\uFEFF/, ""));
        } catch (error) {
            return { converted: false, reason: `read/parse failed: ${error.message}` };
        }

        const method = (props.method || "ctm").toLowerCase();
        const overlay = OVERLAY_CTM.has(method);
        const random = method === "random" || method === "overlay_random";
        if (!random && !overlay && !STATIC_CTM.has(method)) {
            return { converted: false, reason: `unsupported method=${method} (requires runtime context)` };
        }
        const condition = this.unsupportedCondition(props);
        if (condition) return { converted: false, reason: `unsupported CTM condition: ${condition}` };
        if (overlay && (props.connectTiles || props.connectBlocks || props.innerSeams === "true")) {
            return { converted: false, reason: "overlay connection conditions cannot be baked unconditionally" };
        }
        let tiles = this.expandTiles(props.tiles || "");
        if (!tiles?.length || tiles.length > 256) {
            return { converted: false, reason: "invalid/empty tiles list or >256 variants" };
        }
        if (method.endsWith("repeat")) {
            const w=Number(props.width), h=Number(props.height);
            if (!Number.isSafeInteger(w) || !Number.isSafeInteger(h) || w<1 || h<1 || w*h!==tiles.length) {
                return { converted:false, reason:"invalid repeat dimensions or tile count" };
            }
        }
        const repeat = method.endsWith("repeat");
        const inputCount = tiles.length;
        if (!random && !repeat) {
            if ((method.endsWith("fixed") && tiles.length !== 1) ||
                (method === "ctm" && tiles.length !== 47) ||
                (method === "ctm_compact" && tiles.length !== 5)) {
                return { converted:false, reason:`invalid tile count for ${method}` };
            }
            const at = this.staticTileIndex(method);
            tiles = [tiles[at]];
        }
        if (!tiles[0] || tiles.includes("<skip>") || (overlay && tiles.includes("<default>"))) {
            return { converted: false, reason: "missing tile or unsupported <skip>/<default> overlay control" };
        }
        const weights = this.normalizeWeights(random ? props.weights : "", tiles.length);
        if (!weights) return { converted: false, reason: "invalid weights" };

        const target = this.terrainKeysForRule(path, props);
        if (target.error || !target.keys?.length) {
            return { converted: false, reason: target.error || "no terrain keys" };
        }
        const root = this.ruleRoot(path);
        const relative = root ? path.slice(root.length) : path;
        const stem = (root?.includes("/mcpatcher/") ? "~mcpatcher/" : "") + relative.replace(/\.properties$/i, "")
            .split("/").map(part => encodeURIComponent(part).replace(/%/g, "~").replace(/^\.{1,2}$/, dots => "~" + dots.length)).join("/");
        // Resolve all sources before copying any file; rejected rules leave no PNGs.
        let variants = [];
        const notes = [];
        for (let i = 0; i < tiles.length; i++) {
            const weight = weights[i];
            if (weight <= 0) continue;
            if (weight < 0.05 || weight > 1000000) {
                return { converted: false, reason: `weight out of Bedrock range: ${weight}` };
            }
            const token = tiles[i];
            const source = token === "<default>" ? null : await this.resolveCtmSource(path, token);
            if (token !== "<default>" && !source) {
                if (repeat) { notes.push(`missing tile ${token}`); continue; }
                return { converted: false, reason: `missing variant texture ${token}` };
            }
            variants.push({ source, weight, dest: `textures/blocks/optifine_random/${stem}/variant_${i}.png` });
        }
        if (!variants.length) return { converted: false, reason: "no readable, positive-weight CTM tiles" };
        try {
            if (!overlay) variants = await this.followChains(variants, path, claims.chains);
            const count = variants.length;
            if (variants.length > 1) variants = await this.uniqueTiles(variants);
            if (variants.length < count) notes.push(`merged ${count-variants.length} identical tiles`);
        } catch (error) {
            return { converted:false, reason:`CTM tile inspection failed: ${error.message}` };
        }

        const applied = [], conflicts = [], duplicates = [];
        const pending = new Map();
        const pendingClaims = [];
        const writes = new Map();
        const overlayMemo = new Map();
        for (const key of target.keys) {
            const matchedPaths = target.targets?.get(key);
            const layout = this.baseLayout(catalog, key, matchedPaths);
            if (layout === undefined || (Array.isArray(layout) && !matchedPaths)) {
                conflicts.push(`${key}: no unambiguous texture slot`);
                continue;
            }
            const slots = Array.isArray(layout) ? layout.slice() : [layout];
            for (let i = 0; i < slots.length; i++) {
                const slot = slots[i];
                const id = JSON.stringify([key, i]);
                const previous = claims.get(id);
                const base = previous?.base ?? slotPath(slot);
                if (matchedPaths && !matchedPaths.has(base)) {
                    if (!base && slot?.variations) conflicts.push(`${key}[${i}]: existing Bedrock variations preserved`);
                    continue;
                }
                if (slot?.variations && !previous) {
                    conflicts.push(`${key}[${i}]: existing Bedrock variations preserved`);
                    continue;
                }
                if (!base) continue;
                const signature = JSON.stringify(variants.map(({source, weight}) => [source ?? base, weight]));
                if (previous && !overlay) {
                    if (signature === previous.signature) duplicates.push(`${key}[${i}]`);
                    else conflicts.push(`${key}[${i}]: already mapped by ${previous.rule}`);
                    continue;
                }
                const original = typeof slot === "object" && slot ? { ...slot } : {};
                delete original.path;
                delete original.variations;
                let variations;
                if (overlay) {
                    const under = slot?.variations ?? [{path: slotPath(slot) ?? base, weight:1}];
                    if (under.length * variants.length > this.overlayBudget()) {
                        conflicts.push(`${key}[${i}]: overlay exceeds the bounded blend budget`);
                        continue;
                    }
                    variations = [];
                    try {
                        for (let u=0;u<under.length;u++) for (let n=0;n<variants.length;n++) {
                            const layer = variants[n], lower = under[u];
                            const core = lower.path + ".png";
                            const dest = `${layer.dest.slice(0,-4)}_base_${writes.size}.png`;
                            const weight = lower.weight * layer.weight;
                            if (weight < 0.05 || weight > 1000000) throw Error("combined weight out of range");
                            if (!await this.output.exists(core) || await this.output.exists(lower.path+".tga")) {
                                throw Error("missing PNG base or TGA base cannot be safely baked: " + core);
                            }
                            const pair = JSON.stringify([core, layer.source]);
                            let output = overlayMemo.get(pair);
                            if (!output) {
                                output = dest;
                                await this.bakeOverlay(core, layer.source, output);
                                overlayMemo.set(pair, output);
                                writes.set(output, [core, layer.source]);
                            }
                            variations.push({source:output,dest:output,weight});
                        }
                        variations = (await this.uniqueTiles(variations)).map(({dest,weight}) => ({path:dest.slice(0,-4),weight}));
                        if (variations.length > 256) throw Error("overlay exceeds 256 distinct output tiles");
                    } catch (error) {
                        conflicts.push(`${key}[${i}]: ${error.message}`);
                        continue;
                    }
                } else {
                    variations = variants.map(({source, weight, dest}) => ({
                        path: source ? dest.slice(0, -4) : base, weight
                    }));
                }
                const total = variations.reduce((sum,v)=>sum+v.weight,0);
                const max = variations.reduce((m,v)=>Math.max(m,v.weight),0);
                if (max > 1000000) for (const v of variations) v.weight = Math.max(0.05,v.weight / total * 1000000);
                if (!random && variations.length === 1) {
                    slots[i] = Object.keys(original).length ? {...original,path:variations[0].path} : variations[0].path;
                } else {
                    slots[i] = { ...original, variations };
                }
                pendingClaims.push([id, { base, signature, rule: path }]);
                applied.push(`${key}[${i}]`);
                pending.set(key, Array.isArray(layout) ? slots : slots[0]);
            }
        }
        if (!applied.length && !conflicts.length && !duplicates.length) {
            conflicts.push("no matching texture slot in the Bedrock atlas");
        }
        if (!applied.length) {
            for (const output of writes.keys()) await this.output.delete(output);
            return { converted: false, duplicates, conflicts };
        }

        if (overlay) {
            const used = new Set();
            for (const layout of pending.values()) for (const slot of Array.isArray(layout) ? layout : [layout]) {
                if (slot?.variations) for (const v of slot.variations) used.add(v.path+".png");
                else used.add(slotPath(slot)+".png");
            }
            for (const output of writes.keys()) if (!used.has(output)) await this.output.delete(output);
        } else {
            for (const { source, dest } of variants) {
                if (!source) continue;
                await this.output.copy(source, dest);
                await this.copyCtmMaterial(source, dest);
                if (!await this.output.exists(dest)) throw Error("CTM output texture missing: " + dest);
            }
        }
        catalog.texture_data ??= {};
        for (const [key, textures] of pending) {
            catalog.texture_data[key] = { ...(catalog.texture_data[key] || {}), textures };
        }
        for (const [id, claim] of pendingClaims) {
            if (!overlay || !claims.has(id)) claims.set(id, claim);
        }
        const quality = overlay || !["fixed","random"].includes(method) ? "approximate" : "native";
        const distinct = new Set(), variedKeys = new Set();
        for (const [id] of pendingClaims) {
            const [key, index] = JSON.parse(id);
            const layout = pending.get(key);
            const slot = Array.isArray(layout) ? layout[index] : layout;
            if (slot?.variations?.length > 1) variedKeys.add(key);
            if (slot?.variations) for (const v of slot.variations) distinct.add(v.path);
            else if (slotPath(slot)?.startsWith("textures/blocks/optifine_random/")) distinct.add(slotPath(slot));
        }
        return { converted:true, method, quality, slots:applied, variants:distinct.size, inputCount, notes, duplicates, conflicts, variedKeys };
    }

    async convert() {
        await this.cleanMaterialMaps();
        if (this.options?.optifineRandomBlockVariants === false) return [];
        if (!this.isTargetProfile()) return [];
        const propertyFiles = this.listPropertyFiles();
        if (propertyFiles === null) {
            this.log.warn("OptiFine CTM: current output backend cannot enumerate files; skipped");
            return [];
        }
        if (propertyFiles.length === 0) return [];

        const catalog = await this.loadCatalog();
        if (!catalog) return [];

        let converted = 0, skipped = 0, native = 0, approximate = 0, duplicateRules = 0;
        const claims = new Map(), variedKeys = new Set();
        const rules = [];
        for (const path of propertyFiles) {
            try {
                const props = this.parseProperties((await this.output.read(path)).toString("utf8").replace(/^\uFEFF/, ""));
                rules.push({path, props, overlay: String(props.method).toLowerCase().startsWith("overlay"),
                    priority: Number(props.weight) || 0});
            } catch (error) {
                skipped++;
                this.log.warn(`OptiFine CTM skipped: ${path}: ${error.message}`);
            }
        }
        rules.sort((a,b) => Number(a.overlay)-Number(b.overlay) || b.priority-a.priority ||
            (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
        claims.chains = this.indexChains(rules);
        for (const {path, props} of rules) {
            if (claims.chains.paths.has(path)) continue;
            const result = await this.convertRule(path, catalog, claims, props);
            if (result.converted) {
                converted++;
                for (const key of result.variedKeys) variedKeys.add(key);
                if (result.quality === "native") native++; else approximate++;
                this.log.log(`OptiFine CTM: ${path} -> ${result.slots.join(", ")} (${result.method}, ${result.quality}, ${result.inputCount} source tiles -> ${result.variants} distinct textures)`);
                for (const note of result.notes) this.log.warn(`OptiFine CTM: ${path}: ${note}`);
            } else if (result.duplicates?.length && !result.conflicts?.length) {
                duplicateRules++;
            } else {
                skipped++;
            }
            if (result.reason) this.log.warn(`OptiFine CTM skipped: ${path}: ${result.reason}`);
            if (result.conflicts?.length) {
                this.log.warn(`OptiFine random variant slot conflicts: ${path}: ${result.conflicts.join("; ")}`);
            }
        }

        for(const path of claims.chains.paths) if(!claims.chains.used.has(path)) this.log.warn("OptiFine CTM: unmatched dependent rule: "+path);
        if (converted > 0) {
            // Every vanilla grass_top tint slot references the same base file.
            // Mirror a uniform static fallback at that file, not just in the atlas.
            const grass = catalog.texture_data?.grass_top?.textures;
            const slots = Array.isArray(grass) ? grass : grass ? [grass] : [];
            const pick = slot => slotPath(slot) ?? slot?.variations?.find(v => v.path.startsWith("textures/blocks/optifine_random/"))?.path;
            const fallback = pick(slots[0]);
            const base = "textures/blocks/grass_top";
            if (fallback?.startsWith("textures/blocks/optifine_random/") &&
                slots.length === VANILLA_LAYOUTS.grass_top.length &&
                VANILLA_LAYOUTS.grass_top.every(slot => slotPath(slot) === base) &&
                slots.every(slot => pick(slot) === fallback) &&
                slots.every((_,i) => claims.get(JSON.stringify(["grass_top",i]))?.base === base) &&
                await this.output.exists(fallback + ".png") &&
                !await this.output.exists(base + ".tga") &&
                !await this.output.exists(base + ".texture_set.json")) {
                await this.output.copy(fallback + ".png", base + ".png");
            }
            await this.writeJson("textures/terrain_texture.json", catalog);
            await this.disableVariantRotation(variedKeys);
        }
        this.log.log(`OptiFine CTM: ${converted} converted (${native} native, ${approximate} approximate), ${skipped} skipped, ${duplicateRules} duplicate rules`);
        return [];
    }

    static get DEFAULT_CONVERTER_DATA() { return [["optifine-random-block-variants"]]; }
}

export { OptifineRandomBlockVariantConverter };
