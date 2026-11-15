#!/usr/bin/env python3
import argparse, json, zipfile
from pathlib import Path
from io import BytesIO
from PIL import Image, ImageChops, ImageDraw, ImageFont

CASES = [
    ("camel", "entity/camel/camel.png", "entity/camel/camel.png"),
    ("camel_husk", "entity/camel/camel_husk.png", "entity/camel_husk/camel_husk.png"),
    ("horse_black", "entity/horse/horse_black.png", "entity/horse2/horse_black.png"),
    ("mule", "entity/horse/mule.png", "entity/horse2/mule.png"),
    ("pig_saddle", "entity/pig/pig_temperate.png", "entity/pig/pig_saddle.png"),
    ("dolphin", "entity/dolphin/dolphin.png", "entity/dolphin.png"),
    ("arctic_fox", "entity/fox/fox_snow.png", "entity/fox/arctic_fox.png"),
    ("lead_knot", "entity/lead_knot/lead_knot.png", "entity/lead_knot.png"),
    ("cow_v2", "entity/cow/cow_temperate.png", "entity/cow/cow_v2.png"),
]

def rgba(path): return Image.open(path).convert("RGBA")
def zrgba(z, name): return Image.open(BytesIO(z.read("textures/" + name))).convert("RGBA")
def checker(size, cell=8):
    im=Image.new("RGBA",size,(235,235,235,255)); d=ImageDraw.Draw(im)
    for y in range(0,size[1],cell):
      for x in range(0,size[0],cell):
        if ((x//cell)+(y//cell))%2: d.rectangle((x,y,min(x+cell-1,size[0]-1),min(y+cell-1,size[1]-1)),fill=(205,205,205,255))
    return im

def render(im, box=192):
    bg=checker((box,box),16); cp=im.copy(); cp.thumbnail((box,box),Image.Resampling.NEAREST)
    bg.alpha_composite(cp,((box-cp.width)//2,(box-cp.height)//2)); return bg

def metrics(a,b):
    if a.size != b.size: return {"same_size":False,"source_or_output_size":a.size,"bedrock_size":b.size}
    diff=ImageChops.difference(a,b)
    aa=a.getchannel("A"); ba=b.getchannel("A")
    return {"same_size":True,"pixel_exact":diff.getbbox() is None,"alpha_exact":ImageChops.difference(aa,ba).getbbox() is None}

def main():
    ap=argparse.ArgumentParser(); ap.add_argument("--mcpack",required=True); ap.add_argument("--java-root",required=True); ap.add_argument("--bedrock-root",required=True); ap.add_argument("--out",required=True); args=ap.parse_args()
    out=Path(args.out); out.mkdir(parents=True,exist_ok=True); jr=Path(args.java_root); br=Path(args.bedrock_root)
    report={}
    with zipfile.ZipFile(args.mcpack) as z:
      names=set(z.namelist())
      for label,jrel,brel in CASES:
        jp=jr/jrel; bp=br/brel; oname="textures/"+brel
        if not (jp.exists() and bp.exists() and oname in names):
          report[label]={"output_present":oname in names,"java_present":jp.exists(),"bedrock_present":bp.exists()}; continue
        ji=rgba(jp); oi=zrgba(z,brel); bi=rgba(bp)
        diff=ImageChops.difference(oi,bi) if oi.size==bi.size else Image.new("RGBA",bi.size,(255,0,255,255))
        canvas=Image.new("RGBA",(4*208,240),(30,30,30,255)); draw=ImageDraw.Draw(canvas)
        for i,(title,img) in enumerate([("JAVA",ji),("OUTPUT",oi),("BEDROCK",bi),("DIFF",diff)]):
          x=i*208+8; draw.text((x,8),title,fill="white"); canvas.alpha_composite(render(img),(x,32))
        canvas.save(out/f"{label}.png")
        report[label]={"output_vs_bedrock":metrics(oi,bi),"java_vs_bedrock":metrics(ji,bi),"java_size":ji.size,"output_size":oi.size,"bedrock_size":bi.size}
    (out/"report.json").write_text(json.dumps(report,indent=2),encoding="utf-8")
    print(json.dumps(report))
if __name__=="__main__": main()
