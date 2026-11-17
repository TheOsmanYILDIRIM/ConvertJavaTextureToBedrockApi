import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { buildOakWorldgenProbe } from '../../src/companion/OakWorldgenProbe.mjs';

const root = process.argv[2];
if (!root) throw Error('Pass an isolated BDS directory');
const id = 'j2b_ci:oak_leaves';
const bp = '08ddc6af-c257-4dcc-ab7f-59545de99b6d';
const probe = buildOakWorldgenProbe([{
  java_block:'minecraft:oak_leaves', java_variant:'', bedrock_block:id, x:0, y:0, weight:1
}], new Set([id]));
if (!probe) throw Error('Fixture not eligible for worldgen probe');
const make = (prefix, path, data) => {
  const target=join(root,prefix,path);
  mkdirSync(join(target,'..'),{recursive:true});
  writeFileSync(target,typeof data==='string' ? data : JSON.stringify(data));
};
const pack='behavior_packs/j2b_ci';
make(pack,'manifest.json',{
 format_version:2,
 header:{name:'J2B CI',description:'Disposable BDS smoke test',uuid:bp,version:[1,0,0],min_engine_version:[1,26,50]},
 modules:[
  {type:'data',uuid:'cf4eec70-086d-4b35-b983-58e0861dbddd',version:[1,0,0]},
  {type:'script',language:'javascript',entry:'scripts/main.js',uuid:'12343984-464d-40b7-913a-725bf51641fc',version:[1,0,0]}
 ],
 dependencies:[{module_name:'@minecraft/server',version:'2.10.0'}]
});
make(pack,'blocks/oak_leaves.json',{
 format_version:'1.21.80',
 'minecraft:block':{description:{identifier:id},components:{
    'minecraft:geometry':'geometry.full_block',
    'minecraft:material_instances':{'*':{texture:'leaves_oak',render_method:'alpha_test'}},
    'tag:minecraft:leaves':{}
 }}
});
make(pack,'scripts/main.js',`import {system, world} from '@minecraft/server';
const dim=world.getDimension('overworld');
const custom='${id}';
system.afterEvents.scriptEventReceive.subscribe(event=>{
 if(event.id!=='j2b_ci:scan') return;
 system.runJob((function*(){
  let vanilla=0, converted=0, hash=2166136261, loaded=0, missing=0;
  for(let z=-56;z<56;z++) for(let x=-56;x<56;x++){
   try{
    dim.getBlock({x,y:64,z}).typeId;
    loaded++;
    for(let y=50;y<160;y++){
     const id=dim.getBlock({x,y,z})?.typeId;
     if(id==='minecraft:oak_leaves' || id===custom){
      if(id===custom) converted++; else vanilla++;
      for(const v of [x,y,z]) hash=Math.imul(hash^v,16777619)>>>0;
     }
    }
   } catch {missing++;}
   yield;
  }
  console.warn('J2B_SMOKE '+JSON.stringify({vanilla,converted,hash,loaded,missing}));
 })());
});`);
const extra='behavior_packs/j2b_ci_worldgen';
const featureBp='d32be6aa-c90a-4b23-a08b-42907aa7f4e0';
make(extra,'manifest.json',{
 format_version:2,
 header:{name:'J2B CI Worldgen ON',description:'Disposable BDS smoke test',uuid:featureBp,version:[1,0,0],min_engine_version:[1,26,50]},
 modules:[{type:'data',uuid:'b3d837a2-553d-4665-8471-4239d44d4231',version:[1,0,0]}],
 dependencies:[{uuid:bp,version:[1,0,0]}]
});
make(extra,probe.path,probe.feature);
for(const [name,ids] of [['control',[bp]],['candidate',[bp,featureBp]]]){
 make('worlds/'+name,'world_behavior_packs.json',ids.map(pack_id=>({pack_id,version:[1,0,0]})));
}
