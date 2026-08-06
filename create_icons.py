from PIL import Image, ImageDraw

def draw_flowzone_logo(size):
    # Create RGBA canvas
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Scale factor relative to 128px
    scale = size / 128.0
    
    # 3 Pill Rectangles with rounded corners and slight rotation
    # Pill 1: Royal Blue (#1D4ED8)
    # Pill 2: Electric Blue (#3B82F6)
    # Pill 3: Mint Emerald (#10B981)
    
    pills = [
        {"color": (29, 78, 216, 255), "box": [16, 14, 98, 38], "radius": 10},
        {"color": (59, 130, 246, 255), "box": [24, 46, 106, 70], "radius": 10},
        {"color": (16, 185, 129, 255), "box": [32, 78, 114, 102], "radius": 10}
    ]
    
    for p in pills:
        box = [coord * scale for coord in p["box"]]
        rad = p["radius"] * scale
        draw.rounded_rectangle(box, radius=rad, fill=p["color"])
        
    return img

sizes = [16, 48, 128]
for s in sizes:
    icon_img = draw_flowzone_logo(s)
    icon_img.save(f"/Users/hassanshahid/Desktop/Projects/Browser API/tabExtension/icons/icon{s}.png")
    print(f"Created icon{s}.png successfully ({s}x{s})")
