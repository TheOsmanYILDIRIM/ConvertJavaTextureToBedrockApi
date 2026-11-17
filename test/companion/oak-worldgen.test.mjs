import test from "node:test";
import assert from "node:assert/strict";
import {buildOakWorldgenProbe,restoreLoadedOakRegion} from "../../src/companion/OakWorldgenProbe.mjs";
const row={java_block:"minecraft:oak_leaves",java_variant:"",bedrock_block:"j2b_example:oak",weight:1,x:0,y:0};
const ids=new Set([row.bedrock_block]);
test("reuses vanilla feature ID; no extra placement rule",()=>{
 const result=buildOakWorldgenProbe([row],ids);
 assert.equal(result.path,"features/oak_tree_feature.json");
 const tree=result.feature["minecraft:tree_feature"];
 assert.equal(tree.description.identifier,"minecraft:oak_tree_feature");
 assert.equal(tree.canopy.leaf_block,row.bedrock_block);
 assert.ok(tree.trunk.trunk_block);
 assert.equal(result.restoreTarget,"minecraft:oak_leaves");
});
test("refuses missing, weighted, rotated, multipart-equivalent or foreign targets",()=>{
 for(const [rows,staged] of [[[row],new Set()],[[row,row],ids],[[{...row,weight:2}],ids],[[{...row,y:90}],ids],[[{...row,java_variant:"distance=1"}],ids],[[{...row,bedrock_block:"minecraft:oak_leaves"}],new Set(["minecraft:oak_leaves"])]])
  assert.equal(buildOakWorldgenProbe(rows,staged),null);
});
test("restore touches only owned IDs and cannot certify world-wide removal",()=>{
 let blocks=[{typeId:row.bedrock_block,setPermutation(p){this.typeId=p.type.id;}},{typeId:"other:oak"},undefined];
 let scan=restoreLoadedOakRegion({getBlock:p=>blocks[p.x]},{min:{x:0,y:0,z:0},max:{x:2,y:0,z:0}},row.bedrock_block,{type:{id:"minecraft:oak_leaves"}});
 let step; do {step=scan.next();} while(!step.done);
 assert.deepEqual(step.value,{restored:1,unavailable:1,failed:0,safeToRemove:false});
 assert.equal(blocks[1].typeId,"other:oak");
});
