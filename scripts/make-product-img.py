# -*- coding: utf-8 -*-
"""恋爱脑观察室 · 商品图合成（3:4 = 1080x1440）"""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import numpy as np

SRC = '/Users/baihuifang/AI测试网页/generated-images/Minimalist_dreamy_vertical_pro_2026-10-15T08-23-28.png'
OUT = '/Users/baihuifang/AI测试网页/恋爱脑观察室-商品图-3x4.png'
W, H = 1080, 1440

# ---------- 字体 ----------
F_SONG_BLACK = '/System/Library/Fonts/Songti.ttc'          # index 0 = Songti SC Black
F_PF = '/System/Library/Fonts/PingFang.ttc'                # index 2 = PingFang SC Regular
F_HEITI_L = '/System/Library/Fonts/STHeiti Light.ttc'

def font(path, size, index=0):
    return ImageFont.truetype(path, size, index=index)

# ---------- 1. 底图 ----------
base = Image.open(SRC).convert('RGB').resize((W, H), Image.LANCZOS)

# ---------- 2. 去右下角水印（大半径中值滤波，该区域为平滑渐变） ----------
a = np.asarray(base).astype(np.uint8)
x0, y0 = 620, 1235
reg = Image.fromarray(a[y0:H, x0:W])
med = reg.filter(ImageFilter.MedianFilter(61))
a[y0:H, x0:W] = np.asarray(med)
base = Image.fromarray(a)

# ---------- 3. 文字层 ----------
img = base.convert('RGBA')
ov = Image.new('RGBA', (W, H), (0, 0, 0, 0))
d = ImageDraw.Draw(ov)

C_PLUM   = (63, 46, 67, 255)      # 深梅紫 —— 主标题
C_ROSE   = (212, 86, 140, 255)    # 玫瑰粉 —— 副标题/CTA
C_MUTED  = (154, 122, 142, 255)   # 灰紫 —— 辅助
C_KICKER = (176, 140, 166, 255)   # 浅紫 —— 英文小字
C_PILL   = (138, 96, 112, 255)    # 胶囊文字

def ctext(y, s, f, fill, tracking=0):
    """居中绘制文本，tracking=字间距"""
    widths = []
    for ch in s:
        bb = d.textbbox((0, 0), ch, font=f)
        widths.append(bb[2] - bb[0])
    total = sum(widths) + tracking * (len(s) - 1)
    x = (W - total) / 2
    for ch, cw in zip(s, widths):
        d.text((x, y), ch, font=f, fill=fill)
        x += cw + tracking
    return total

def pill(cx, cy, s, f):
    """白色半透明圆角胶囊，返回宽度"""
    pad_x, pad_y = 30, 14
    bb = d.textbbox((0, 0), s, font=f)
    tw, th = bb[2] - bb[0], bb[3] - bb[1]
    pw, ph = tw + pad_x * 2, th + pad_y * 2
    x, y = cx - pw / 2, cy - ph / 2
    d.rounded_rectangle([x, y, x + pw, y + ph], radius=ph / 2,
                        fill=(255, 255, 255, 205), outline=(231, 168, 198, 235), width=2)
    d.text((cx - tw / 2 - bb[0], cy - th / 2 - bb[1]), s, font=f, fill=C_PILL)
    return pw

# --- 顶部文字区 ---
f_kick = font(F_HEITI_L, 27)
ctext(104, 'LOVE  BRAIN  OBSERVATORY', f_kick, C_KICKER, tracking=6)

# 分隔小饰件：线—菱形—线
dy = 168
d.line([(W / 2 - 118, dy), (W / 2 - 20, dy)], fill=(214, 170, 197, 220), width=2)
d.line([(W / 2 + 20, dy), (W / 2 + 118, dy)], fill=(214, 170, 197, 220), width=2)
d.polygon([(W / 2, dy - 8), (W / 2 + 8, dy), (W / 2, dy + 8), (W / 2 - 8, dy)],
          fill=(212, 86, 140, 235))

f_title = font(F_SONG_BLACK, 130)
ctext(196, '恋爱脑观察室', f_title, C_PLUM)

f_hook = font(F_PF, 60)
ctext(376, '你的心动，几级上头？', f_hook, C_ROSE)

# 三个卖点胶囊
f_pill = font(F_PF, 30)
gap = 26
labels = ['30 道恋爱修罗场', '五维恋爱画像', '约 3 分钟']
widths = []
for s in labels:
    bb = d.textbbox((0, 0), s, font=f_pill)
    widths.append(bb[2] - bb[0] + 60)
row_w = sum(widths) + gap * (len(labels) - 1)
cx = (W - row_w) / 2
for s, pw in zip(labels, widths):
    pill(cx + pw / 2, 520, s, f_pill)
    cx += pw + gap

# 引导句
f_quote = font(F_PF, 32)
ctext(606, '别听嘴上说，看你怎么选。', f_quote, C_MUTED)

# --- 底部 CTA 胶囊 ---
f_cta = font(F_PF, 46)
cta = '测测我的恋爱脑等级'
bb = d.textbbox((0, 0), cta, font=f_cta)
tw, th = bb[2] - bb[0], bb[3] - bb[1]
pw, ph = tw + 120, th + 74
x, y = (W - pw) / 2, 1276
d.rounded_rectangle([x, y, x + pw, y + ph], radius=ph / 2,
                    fill=(255, 255, 255, 232), outline=(212, 86, 140, 255), width=3)
d.text((x + 60 - bb[0], y + ph / 2 - th / 2 - bb[1]), cta, font=f_cta, fill=C_ROSE)
# 箭头：横线 + 三角头
ax = x + pw - 62 - bb[0]
ay = y + ph / 2
d.line([(ax - 34, ay), (ax + 2, ay)], fill=C_ROSE, width=5)
d.polygon([(ax + 2, ay - 11), (ax + 24, ay), (ax + 2, ay + 11)], fill=C_ROSE)

# 价格角标（左下）
f_price = font(F_PF, 30)
d.text((66, 1320), '¥2.99', font=font(F_PF, 40), fill=C_ROSE)
d.text((66, 1376), '虚拟商品 · 自动发货', font=f_price, fill=C_MUTED)

out = Image.alpha_composite(img, ov).convert('RGB')
out.save(OUT, 'PNG', optimize=True)
print('已生成:', OUT)
print('尺寸:', out.size, '比例: %.4f (3:4=0.75)' % (out.size[0] / out.size[1]))
