# Assets you need to recover from Lovable

Lovable's export replaced every binary asset with a JSON metadata stub
(`src/assets/*.asset.json`). The real bytes were never in the download — they
live on Lovable's R2 storage behind a path that only resolves inside Lovable's
own domain. That is why images and the headline font disappear the moment you
run the code locally.

The files below are **labeled grey placeholders**. Drop the real files in this
folder using **exactly these filenames** and everything works — no code change,
no rebuild config. Just overwrite and refresh.

| Filename in this folder | Original | Bytes | Used by |
| --- | --- | --- | --- |
| `BlackhawkItalic.otf` | `BlackhawkItalic.otf` | 473 640 | headline font, `src/index.css` |
| `logo.png` | `logo.png` | 54 176 | header logo |
| `hero2.png` | `hero2.png` | 513 794 | hero image |
| `sushi.png` | `sushi.png` | 680 448 | menu card 1 |
| `varma.png` | `varma.png` | 1 738 043 | menu card 2 |
| `friterade.png` | `friterade.png` | 1 755 171 | menu card 3 |
| `og-image.png` | *(new)* | — | social preview, `index.html` — optional, supply your own |

> Note: the font has **no placeholder** — a missing font file fails silently and
> the headline falls back to `Arial Black / Impact`. If "SHUSHI BURRITO" is not
> in the chunky italic face, the `.otf` is missing.

## How to get them

**Easiest — from your live site.** Open your published site or the Lovable
preview, right-click each image → *Save image as…*, and use the filenames above.
For the font: DevTools → Network → filter `Font` → reload → right-click the
`.otf` request → *Save*.

**Direct — by asset URL.** Every asset is reachable at this pattern on your
Lovable domain:

```
https://<your-project>.lovable.app/__l5e/assets-v1/<asset_id>/<filename>
```

Project ID: `dc690e36-c142-46c5-b6e8-aef5192a4c09`

| Asset ID | Filename |
| --- | --- |
| `3786bd10-c933-4c22-bc8c-8f0b0578eb15` | `BlackhawkItalic.otf` |
| `c142a85e-bda0-4ea4-b154-8665299849f2` | `logo.png` |
| `954dcfcd-5fb0-4867-8e01-b98e0accfd09` | `hero2.png` |
| `0e53da43-67a7-4dad-9dcb-01600ceaf641` | `sushi.png` |
| `7a15d72f-6537-48f6-b9ee-d97719fd9e99` | `varma.png` |
| `74ddcb4e-cb22-453c-a74d-fe6aba81861c` | `friterade.png` |
| `5d49bb29-1f7b-40a8-bf8c-174406347aee` | `hero.png` — **unused**, superseded by `hero2.png`. Skip it. |

**Also fine:** the originals are probably still on whatever machine you first
uploaded them from. `BlackhawkItalic.otf` is a commercial font — use your own
licensed copy.
