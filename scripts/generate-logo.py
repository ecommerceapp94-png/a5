#!/usr/bin/env python3
"""Generate the Pro Browser Elite "Super Pro Advance Max Level" logo set.

Outputs:
  assets/icon.png            1024x1024 main icon
  assets/adaptive-icon.png   1024x1024 adaptive (foreground)
  assets/splash.png          2048x2048 splash
  assets/favicon.png         196x196 web favicon
  assets/logo-hero.png       2048x1024 marketing hero
"""
from __future__ import annotations

import math
import os
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.join(os.path.dirname(__file__), "..", "assets")
os.makedirs(ROOT, exist_ok=True)

# Color palette - cyber violet -> electric cyan with gold accent
NAVY = (11, 15, 26, 255)
DEEP = (16, 21, 41, 255)
VIOLET = (124, 58, 237, 255)
PINK = (236, 72, 153, 255)
CYAN = (34, 211, 238, 255)
GOLD = (250, 204, 21, 255)
WHITE = (255, 255, 255, 255)


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(len(a)))


def radial_gradient(size, inner, outer):
    img = Image.new("RGBA", (size, size), outer)
    px = img.load()
    cx, cy = size / 2, size / 2
    maxd = math.hypot(cx, cy)
    for y in range(size):
        for x in range(size):
            d = math.hypot(x - cx, y - cy) / maxd
            d = min(1.0, d)
            px[x, y] = lerp(inner, outer, d)
    return img


def linear_gradient(w, h, top, bottom):
    img = Image.new("RGBA", (w, h))
    px = img.load()
    for y in range(h):
        t = y / max(1, h - 1)
        c = lerp(top, bottom, t)
        for x in range(w):
            px[x, y] = c
    return img


def draw_glow(img, mask_img, color, blur=40, alpha=180):
    glow = Image.new("RGBA", img.size, (0, 0, 0, 0))
    g = Image.new("RGBA", img.size, (0, 0, 0, 0))
    g.paste(color + (alpha,), mask=mask_img.split()[-1])
    g = g.filter(ImageFilter.GaussianBlur(blur))
    glow = Image.alpha_composite(glow, g)
    return Image.alpha_composite(img, glow)


def rounded_square_mask(size, radius):
    m = Image.new("L", (size, size), 0)
    d = ImageDraw.Draw(m)
    d.rounded_rectangle((0, 0, size - 1, size - 1), radius=radius, fill=255)
    return m


def find_font(size, bold=True):
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVu" + ("Sans-Bold.ttf" if bold else "Sans.ttf"),
        "/usr/share/fonts/truetype/liberation/LiberationSans-" + ("Bold" if bold else "Regular") + ".ttf",
        "/usr/share/fonts/truetype/freefont/FreeSans" + ("Bold" if bold else "") + ".ttf",
    ]
    for f in candidates:
        if os.path.exists(f):
            return ImageFont.truetype(f, size)
    return ImageFont.load_default()


def draw_compass_emblem(img, cx, cy, r):
    """A futuristic browser/compass emblem combining a globe + chevron."""
    d = ImageDraw.Draw(img)

    # Outer ring (gradient via two arcs)
    ring_w = int(r * 0.10)
    for i, (col, start, end) in enumerate([
        (VIOLET, 200, 360), (PINK, 0, 90), (CYAN, 90, 200),
    ]):
        d.arc((cx - r, cy - r, cx + r, cy + r), start=start, end=end, fill=col, width=ring_w)

    # Inner glassy disk
    inner_r = int(r * 0.78)
    inner = Image.new("RGBA", img.size, (0, 0, 0, 0))
    id_ = ImageDraw.Draw(inner)
    id_.ellipse((cx - inner_r, cy - inner_r, cx + inner_r, cy + inner_r), fill=(20, 25, 50, 230))
    img.alpha_composite(inner)

    # Globe meridians (latitude lines)
    for k in range(-3, 4):
        ry = int(inner_r * (1 - abs(k) / 4) * 0.92)
        if ry <= 1:
            continue
        d.ellipse((cx - inner_r * 0.92, cy - ry, cx + inner_r * 0.92, cy + ry),
                  outline=(34, 211, 238, 110), width=2)
    # Equator highlight
    d.ellipse((cx - inner_r * 0.92, cy - 3, cx + inner_r * 0.92, cy + 3),
              fill=(34, 211, 238, 200))
    # Prime meridian
    d.ellipse((cx - 3, cy - inner_r * 0.92, cx + 3, cy + inner_r * 0.92),
              fill=(124, 58, 237, 220))

    # Forward chevron / play / browser pointer
    chev = Image.new("RGBA", img.size, (0, 0, 0, 0))
    cd = ImageDraw.Draw(chev)
    chev_pts = [
        (cx - r * 0.18, cy - r * 0.42),
        (cx + r * 0.46, cy),
        (cx - r * 0.18, cy + r * 0.42),
        (cx - r * 0.02, cy),
    ]
    cd.polygon(chev_pts, fill=(255, 255, 255, 255))
    # Gold inner highlight
    inner_pts = [
        (cx - r * 0.10, cy - r * 0.30),
        (cx + r * 0.32, cy),
        (cx - r * 0.10, cy + r * 0.30),
        (cx + r * 0.02, cy),
    ]
    cd.polygon(inner_pts, fill=GOLD)
    img.alpha_composite(chev)

    # Sparkle stars
    for (sx, sy, sr) in [
        (cx + r * 0.65, cy - r * 0.55, r * 0.05),
        (cx - r * 0.70, cy + r * 0.50, r * 0.04),
        (cx + r * 0.70, cy + r * 0.55, r * 0.03),
    ]:
        spark = Image.new("RGBA", img.size, (0, 0, 0, 0))
        sd = ImageDraw.Draw(spark)
        sd.polygon([
            (sx, sy - sr * 2.6), (sx + sr * 0.6, sy - sr * 0.6),
            (sx + sr * 2.6, sy), (sx + sr * 0.6, sy + sr * 0.6),
            (sx, sy + sr * 2.6), (sx - sr * 0.6, sy + sr * 0.6),
            (sx - sr * 2.6, sy), (sx - sr * 0.6, sy - sr * 0.6),
        ], fill=(255, 255, 255, 230))
        spark = spark.filter(ImageFilter.GaussianBlur(2))
        img.alpha_composite(spark)


def make_icon(size=1024, with_text=False, transparent_bg=False):
    if transparent_bg:
        img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    else:
        img = radial_gradient(size, (40, 30, 90, 255), NAVY)

    # Background neon swirls
    if not transparent_bg:
        swirl = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        sd = ImageDraw.Draw(swirl)
        for i in range(8):
            t = i / 7
            r = int(size * (0.35 + t * 0.55))
            base = lerp(VIOLET[:3], CYAN[:3], t)
            col = base + (40,)
            sd.ellipse((size // 2 - r, size // 2 - r, size // 2 + r, size // 2 + r),
                       outline=col, width=4)
        swirl = swirl.filter(ImageFilter.GaussianBlur(8))
        img = Image.alpha_composite(img, swirl)

    cx, cy = size // 2, size // 2
    r = int(size * 0.36)

    # Glow under emblem
    glow_layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow_layer)
    gd.ellipse((cx - r - 40, cy - r - 40, cx + r + 40, cy + r + 40), fill=(124, 58, 237, 130))
    glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(60))
    img = Image.alpha_composite(img, glow_layer)

    draw_compass_emblem(img, cx, cy, r)

    return img


def add_text_caption(img, top_text="PRO BROWSER", bottom_text="ELITE  •  MAX"):
    w, h = img.size
    d = ImageDraw.Draw(img)
    f_top = find_font(int(h * 0.06), bold=True)
    f_bot = find_font(int(h * 0.045), bold=True)

    # Top text
    tb = d.textbbox((0, 0), top_text, font=f_top)
    tw, th = tb[2] - tb[0], tb[3] - tb[1]
    d.text(((w - tw) / 2, h * 0.05), top_text, font=f_top, fill=WHITE,
           stroke_width=3, stroke_fill=(124, 58, 237, 255))

    bb = d.textbbox((0, 0), bottom_text, font=f_bot)
    bw, bh = bb[2] - bb[0], bb[3] - bb[1]
    d.text(((w - bw) / 2, h * 0.88), bottom_text, font=f_bot, fill=GOLD,
           stroke_width=2, stroke_fill=NAVY)


def main():
    # 1. App icon (1024x1024) - rounded square not required by Expo, it'll mask
    icon = make_icon(1024)
    icon.save(os.path.join(ROOT, "icon.png"))

    # 2. Adaptive icon foreground (1024) - transparent bg, centered emblem only
    adaptive = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
    cx = cy = 512
    r = int(1024 * 0.30)
    draw_compass_emblem(adaptive, cx, cy, r)
    adaptive.save(os.path.join(ROOT, "adaptive-icon.png"))

    # 3. Splash (2048x2048)
    splash = Image.new("RGBA", (2048, 2048), NAVY)
    bg = radial_gradient(2048, (40, 30, 90, 255), NAVY)
    splash = bg
    cx, cy = 1024, 950
    r = 360
    draw_compass_emblem(splash, cx, cy, r)
    d = ImageDraw.Draw(splash)
    f_brand = find_font(140, bold=True)
    f_sub = find_font(64, bold=True)
    f_tag = find_font(40, bold=False)
    brand = "PRO BROWSER"
    elite = "E L I T E"
    tag = "SUPER • PRO • ADVANCE • MAX • LEVEL"
    bb = d.textbbox((0, 0), brand, font=f_brand)
    d.text(((2048 - (bb[2] - bb[0])) / 2, 1380), brand, font=f_brand, fill=WHITE,
           stroke_width=4, stroke_fill=VIOLET)
    bb = d.textbbox((0, 0), elite, font=f_sub)
    d.text(((2048 - (bb[2] - bb[0])) / 2, 1540), elite, font=f_sub, fill=GOLD,
           stroke_width=2, stroke_fill=NAVY)
    bb = d.textbbox((0, 0), tag, font=f_tag)
    d.text(((2048 - (bb[2] - bb[0])) / 2, 1640), tag, font=f_tag, fill=CYAN)
    splash.save(os.path.join(ROOT, "splash.png"))

    # 4. Favicon
    fav = icon.resize((196, 196), Image.LANCZOS)
    fav.save(os.path.join(ROOT, "favicon.png"))

    # 5. Marketing hero (2048x1024) for PR description
    hero = linear_gradient(2048, 1024, (12, 8, 40, 255), (4, 16, 32, 255))
    # neon grid lines
    hd = ImageDraw.Draw(hero)
    for i in range(0, 2048, 64):
        hd.line([(i, 0), (i, 1024)], fill=(124, 58, 237, 30), width=1)
    for i in range(0, 1024, 64):
        hd.line([(0, i), (2048, i)], fill=(34, 211, 238, 30), width=1)
    draw_compass_emblem(hero, 520, 512, 340)
    f1 = find_font(140, bold=True)
    f2 = find_font(72, bold=True)
    f3 = find_font(48, bold=False)
    hd.text((950, 320), "PRO BROWSER", font=f1, fill=WHITE,
            stroke_width=4, stroke_fill=VIOLET)
    hd.text((950, 470), "E L I T E", font=f2, fill=GOLD,
            stroke_width=2, stroke_fill=NAVY)
    hd.text((950, 580), "Super • Pro • Advance • Max Level", font=f3, fill=CYAN)
    hero.save(os.path.join(ROOT, "logo-hero.png"))

    # 6. Notification icon (white silhouette, optional)
    notif = Image.new("RGBA", (256, 256), (0, 0, 0, 0))
    nd = ImageDraw.Draw(notif)
    nd.ellipse((20, 20, 236, 236), outline=WHITE, width=18)
    nd.polygon([
        (110, 70), (200, 128), (110, 186), (130, 128)
    ], fill=WHITE)
    notif.save(os.path.join(ROOT, "notification-icon.png"))

    print("Generated assets in", ROOT)


if __name__ == "__main__":
    main()
