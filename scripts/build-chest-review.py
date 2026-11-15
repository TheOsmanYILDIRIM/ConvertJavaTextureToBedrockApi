#!/usr/bin/env python3
import argparse, json, zipfile
from pathlib import Path
from io import BytesIO
from PIL import Image, ImageDraw

CASES = [
    ("chest_front","blocks/chest_front.png"),
    ("chest_side","blocks/chest_side.png"),
    ("chest_top","blocks/chest_top.png"),
    ("trapped_chest_front","blocks/trapped_chest_front.png"),
    ("ender_chest_front","blocks/ender_chest_front.png"),
    ("ender_chest_side","blocks/ender_chest_side.png"),
    ("ender_chest_top","blocks/ender_chest_top.png"),
    ("copper_chest_front","blocks/copper_chest_inventory_front.png"),
    ("copper_chest_side","blocks/copper_chest_inventory_side.png"),
    ("copper_chest_top","blocks/copper_chest_inventory_top.png"),
    ("exposed_copper_chest_front","blocks/exposed_copper_chest_inventory_front.png"),
    ("exposed_copper_chest_side","blocks/exposed_copper_chest_inventory_side.png"),
    ("exposed_copper_chest_top","blocks/exposed_copper_chest_inventory_top.png"),
    ("weathered_copper_chest_front","blocks/weathered_copper_chest_inventory_front.png"),
    ("weathered_copper_chest_side","blocks/weathered_copper_chest_inventory_side.png"),
    ("weathered_copper_chest_top","blocks/weathered_copper_chest_inventory_top.png"),
    ("oxidized_copper_chest_front","blocks/oxidized_copper_chest_inventory_front.png"),
    ("oxidized_copper_chest_side","blocks/oxidized_copper_chest_inventory_side.png"),
    ("oxidized_copper_chest_top","blocks/oxidized_copper_chest_inventory_top.png"),
]

def rgba_bytes(data):
    return Image.open(BytesIO(data)).convert("RGBA")

def rgba_file(path):
    return Image.open(path).convert("RGBA")

def checker(size, cell=16):
    im=Image.new("RGBA",size,(235,235,235,255)); d=ImageDraw.Draw(im)
    for y in range(0,size[1],cell):
        for x in range(0,size[0],cell):
            if ((x//cell)+(y//cell))%2:
                d.rectangle((x,y,min(x+cell-1,size[0]-1),min(y+cell-1,size[1]-1)),fill=(205,205,205,255))
    return im

def render(im, box=192):
    bg=checker((box,box))
    cp=im.copy()
    cp.thumbnail((box,box),Image.Resampling.NEAREST)
    bg.alpha_composite(cp,((box-cp.width)//2,(box-cp.height)//2))
    return bg

def diff_image(a,b):
    if a.size != b.size:
        return Image.new("RGBA",b.size,(255,0,255,255))
    out=Image.new("RGBA",a.size)
    out.putdata([(abs(ap[0]-bp[0]),abs(ap[1]-bp[1]),abs(ap[2]-bp[2]),255) for ap,bp in zip(a.getdata(),b.getdata())])
    return out

def metrics(a,b):
    if a.size != b.size:
        return {"same_size":False,"output_size":a.size,"bedrock_size":b.size}
    aa=a.getchannel("A"); ba=b.getchannel("A")
    return {
        "same_size":True,
        "pixel_exact":a.tobytes()==b.tobytes(),
        "alpha_exact":aa.tobytes()==ba.tobytes(),
        "diff_pixels":sum(1 for ap,bp in zip(a.getdata(),b.getdata()) if ap != bp),
        "visible_rgb_diffs":sum(1 for ap,bp in zip(a.getdata(),b.getdata()) if bp[3] and ap[:3] != bp[:3]),
    }

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--mcpack",required=True)
    ap.add_argument("--bedrock-root",required=True)
    ap.add_argument("--out",required=True)
    args=ap.parse_args()
    out=Path(args.out); out.mkdir(parents=True,exist_ok=True)
    br=Path(args.bedrock_root)
    report={}
    with zipfile.ZipFile(args.mcpack) as z:
        names=set(z.namelist())
        for label,rel in CASES:
            oname="textures/"+rel
            bp=br/rel
            if oname not in names or not bp.exists():
                report[label]={"output_present":oname in names,"bedrock_present":bp.exists()}
                continue
            oi=rgba_bytes(z.read(oname)); bi=rgba_file(bp); di=diff_image(oi,bi)
            panels=[("OUTPUT",oi),("BEDROCK REF",bi),("DIFF",di)]
            canvas=Image.new("RGBA",(3*208,240),(30,30,30,255)); draw=ImageDraw.Draw(canvas)
            for i,(title,img) in enumerate(panels):
                x=i*208+8
                draw.text((x,8),title,fill="white")
                canvas.alpha_composite(render(img),(x,32))
            canvas.save(out/f"{label}.png")
            report[label]=metrics(oi,bi)
    (out/"report.json").write_text(json.dumps(report,indent=2),encoding="utf-8")
    print(json.dumps(report))

if __name__=="__main__":
    main()
