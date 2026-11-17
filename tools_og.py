# Builds the share images (assets/og-en.jpg, og-fr.jpg, og-pt.jpg) shown when the site is shared on WhatsApp, Facebook etc.
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter
D = "images/products"
picks = ["enamel-and-crystal-nugget-ring", "dainty-eye-of-providence-charm", "cathedral-hexagon-votive", "copper-and-opalite-eye-necklace"]
TXT = {"en": ("Masonic rings · All-seeing eye jewellery · Talismans", "Free membership  ·  Order on WhatsApp"),
       "fr": ("Bagues maçonniques · Bijoux œil qui voit tout · Talismans", "Adhésion gratuite  ·  Commande sur WhatsApp"),
       "pt": ("Anéis maçônicos · Joias do olho que tudo vê · Talismãs", "Associação grátis  ·  Pedidos pelo WhatsApp")}
serif = "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"; sans = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
for lang, (l1, l2) in TXT.items():
    W, H = 1200, 630
    im = Image.new("RGB", (W, H), "#0d0c0a"); d = ImageDraw.Draw(im)
    for r in range(420, 0, -6):  # warm glow
        c = int(40 * (1 - r / 420)); d.ellipse([900 - r, 150 - r, 900 + r, 150 + r], fill=(13 + c, 12 + int(c * .8), 10 + int(c * .3)))
    tile = 270
    for i, sl in enumerate(picks):
        ph = Image.open(f"{D}/{sl}/1.jpg").resize((tile, tile))
        x = 640 + (i % 2) * (tile + 14); y = 40 + (i // 2) * (tile + 14)
        im.paste(ph, (x, y)); d.rectangle([x - 1, y - 1, x + tile, y + tile], outline="#c9a24a", width=2)
    gold = "#e3c57a"
    d.ellipse([60, 70, 140, 150], outline=gold, width=3); d.polygon([(100, 88), (128, 136), (72, 136)], outline=gold, width=3); d.polygon([(100, 104), (114, 128), (86, 128)], fill=gold)
    d.text((60, 190), "THE GILDED", font=ImageFont.truetype(serif, 64), fill=gold)
    d.text((60, 262), "ORDER", font=ImageFont.truetype(serif, 64), fill=gold)
    f = ImageFont.truetype(sans, 24); y = 380
    for part in l1.split(" · "):
        d.text((60, y), "✦ " + part, font=f, fill="#ece6d8"); y += 38
    d.rounded_rectangle([60, 520, 610, 580], radius=30, fill="#25d366")
    d.text((335, 550), l2, font=ImageFont.truetype(sans, 20), fill="#06251a", anchor="mm")
    im.save(f"assets/og-{lang}.jpg", quality=85)
print("ok")
