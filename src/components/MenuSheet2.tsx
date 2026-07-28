import type { CSSProperties } from "react";

import { FONTS, makeSheetKit } from "@/components/menuSheetKit";
import { useMenuItems, type MenuItemRow } from "@/lib/cms";
import { T } from "@/lib/editing";

/**
 * Menu sheet 02 (sushi & rolls), rebuilt as real text.
 *
 * `/assets/Menu2_canvas.png` is the printed spread with every item line erased — the
 * eight boxes, their banners and the four food cut-outs are still baked in. Everything
 * below sits on top of it.
 *
 * Coordinates are the blank's own 1440x1022 pixels. The printed spread (`Menu2.png`) is
 * the same artwork at 1217x864, so it was scaled up 1.1832x and diffed against the blank
 * to recover the exact ink box of every printed line. Prices and item names therefore sit
 * where the print puts them, including the places where the print is inconsistent (the
 * inside-out rolls alternate between one and two columns; the first three "For You" rolls
 * carry the red/navy badge and the last three do not).
 */

const W = 1440;
const H = 1022;
const { u, lx, ly, Txt, Frame } = makeSheetKit(W, H);

const BADGE_RED = "#8d1a24";
const BADGE_NAVY = "#0e3560";

/** One place to tune type size per box, since each box is set slightly differently. */
const S = {
  menyName: 18.5,
  menyPrice: 24,
  menySub: 12.1,
  valfriHead: 18,
  valfriLabel: 12.5,
  valfriPrice: 24,
  nigiriName: 14.7,
  nigiriPrice: 19,
  nigiriDesc: 10.3,
  fyName: 18,
  fyPrice: 24,
  fyDesc: 12.6,
  fyBadge: 15,
  ioName: 17,
  ioPrice: 19,
  ioDesc: 11.8,
  dxName: 18.3,
  dxPrice: 25,
  dxDesc: 12.6,
  makiName: 17.5,
  makiPrice: 22.5,
  makiDesc: 12.4,
  makiInline: 12.3,
  tillName: 22.5,
  tillPrice: 29,
  tillDesc: 12.3,
  tillQty: 19,
};

/* ============================================================ SUSHI MENYER */

/** A sub-list row; `xs` overrides the menu's column positions for that row alone. */
type SubRow = { cells: string[]; xs?: number[] };
type Meny = { name: string; price: string; y: number; xs: number[]; rows: SubRow[] };

const MENY_PRICE_RIGHT = 440;
const MENY_SUB_OFFSET = 18;
const MENY_SUB_PITCH = 14.5;

const MENYER: Meny[] = [
  { name: "NIGIRI MENY - 6 BITAR", price: "89:-", y: 83, xs: [52], rows: [{ cells: ["Valfri"] }] },
  {
    name: "LAX MENY - 14 BITAR",
    price: "149:-",
    y: 137,
    xs: [52],
    rows: [{ cells: ["6 st Nigiri Shake  ·  8 st Philadelphia"] }],
  },
  {
    name: "YOKOHAMA MENY - 16 BITAR",
    price: "189:-",
    y: 189,
    xs: [52],
    rows: [{ cells: ["8 st Blandade Nigiri  ·  8 st Inside-Out Philadelphia"] }],
  },
  {
    name: "CHICKEN ROLL MENY - 29 BITAR",
    price: "265:-",
    y: 252,
    xs: [52, 208],
    rows: [
      { cells: ["6 st Maki Chicken", "7 st For you Chicken"] },
      { cells: ["8 st Inside-Out Chicken", "8 st Inside-Out Crispy Chicken"] },
    ],
  },
  {
    name: "TAIYO MENY - 29 BITAR",
    price: "299:-",
    y: 325,
    xs: [52, 194],
    rows: [
      { cells: ["6 st Maki Avokado", "7 st For you Salmon"] },
      { cells: ["8 st Inside-Out Alaska", "8 st Inside-Out Friterad crabstick"] },
    ],
  },
  {
    name: "SUPER MENY - 42 BITAR",
    price: "499:-",
    y: 398,
    // second column pushed out: "8 st Inside-Out Ebi Avokado" is the longest cell here
    xs: [52, 212],
    rows: [
      { cells: ["20 st Blandade Nigiri", "6 st Maki Shake"] },
      { cells: ["8 st Inside-Out Ebi Avokado", "8 st Inside-Out Tekka"] },
    ],
  },
  {
    name: "PARTY MENY - 53 BITAR",
    price: "599:-",
    y: 476,
    xs: [52, 198],
    rows: [
      { cells: ["25 st Blandad Nigiri"] },
      { cells: ["6 st Maki Shake Avokado", "8 st Inside-Out Philadelphia"] },
      { cells: ["6 st Maki Kappa", "8 st Inside-Out Alaska"] },
    ],
  },
  {
    name: "XL MENY 60 BITAR",
    price: "649:-",
    y: 557,
    xs: [52, 198],
    rows: [
      { cells: ["6 st Blandade Nigiri"] },
      { cells: ["6 st Maki Shake Avokado", "6 st Maki Ebi"] },
      { cells: ["6 st Maki Shake", "8 st Inside-Out Philadelphia"] },
      { cells: ["6 st Maki Kappa", "8 st Inside-Out Alaska"] },
      { cells: ["6 st Maki Tuna", "8 st Inside-Out Ebi Avokado"] },
    ],
  },
  {
    name: "XXL MENY - 96 BITAR",
    price: "849:-",
    y: 663,
    xs: [52, 161, 275],
    rows: [
      { cells: ["4 st Nigiri Shake", "4 st Nigiri Tuna", "4 st Nigiri Ebi"] },
      { cells: ["12 st Maki Kappa", "12 st Maki Tuna", "12 st Maki Shake"] },
      { cells: ["16 st Inside-Out Philadelphia", "16 st Inside-Out Tekka"], xs: [52, 225] },
      { cells: ["16 st California Roll"], xs: [52] },
    ],
  },
];

/* ============================================================= VALFRI MENY */

const VALFRI: Array<[label: string, price: string, y: number]> = [
  ["16 bitar", "239:-", 878],
  ["20 bitar", "279:-", 899],
  ["30 bitar", "359:-", 921],
];

/* ========================================================= NIGIRI 2 BITAR */

type Nigiri = {
  name: string;
  price: string;
  desc: string;
  y: number;
  descY: number;
  /** wrap width for the name — only the two-line FLAMBERAD entry needs it */
  nameW?: number;
  /** descriptor start, when it does not sit under the name */
  descX?: number;
  descW?: number;
};

const NIGIRI_L: Nigiri[] = [
  { name: "NIGIRI SHAKE", price: "34:-", desc: "Lax", y: 66, descY: 85 },
  { name: "NIGIRI MAGURO", price: "37:-", desc: "Tuna", y: 109, descY: 128 },
  { name: "NIGIRI SURIMI", price: "32:-", desc: "Crabstick", y: 155, descY: 173 },
  {
    name: "NIGIRI SHAKE FLAMBERAD",
    price: "39:-",
    desc: "Flamberad Lax",
    y: 200,
    descY: 217,
    nameW: 105,
    descX: 634,
  },
];

const NIGIRI_R: Nigiri[] = [
  { name: "NIGIRI EBI", price: "34:-", desc: "Räka", y: 66, descY: 85 },
  { name: "NIGIRI AVOKADO", price: "34:-", desc: "Avokado", y: 109, descY: 128 },
  {
    name: "NIGIRI SPICY TUNA",
    price: "39:-",
    desc: "Tonfisk, Japansk Mayo, Siracha, Sesam, Vårlök",
    y: 155,
    descY: 173,
    descW: 140,
  },
];

/* ====================================================== FOR YOU ROLLS 7 ST */

/** The first three carry the FOR|YOU badge and a price column further left. */
const FY_BADGED: Array<[name: string, price: string, desc: string, y: number, dy: number]> = [
  ["SHRIMP", "94:-", "Räkor, Gurka, Cream cheese, Sesam", 320, 342],
  ["CHICKEN", "79:-", "Kyckling, Cream cheese, Gurka, Sesam", 361, 382],
  ["SALMON", "89:-", "Lax, Cream cheese, Gurka, Sesam", 402, 423],
];

const FY_PLAIN: Array<[name: string, price: string, desc: string, y: number, dy: number]> = [
  ["FOR YOU LAX", "94:-", "Lax, Avokado, Gurka, Cream cheese, Sesam", 447, 465],
  ["FOR YOU TUNA", "94:-", "Tonfisk, Gurka, Sesam, Cream cheese", 487, 504],
  ["FOR YOU VEGETARISK", "79:-", "Avokado, Gurka, Cream cheese", 529, 546],
];

/* =================================================== INSIDE-OUT ROLLS 8 ST */

type IoCell = {
  name: string;
  price: string;
  desc: string;
  x: number;
  priceRight: number;
  descW: number;
  /** the print sets the longer right-column names smaller so they clear the price */
  nameSize?: number;
};
type IoRow = { y: number; descY: number; c1: IoCell; c2?: IoCell };

const INSIDE: IoRow[] = [
  {
    y: 656,
    descY: 673,
    c1: {
      name: "ALASKA ROLL",
      price: "80:-",
      desc: "Lax, Avokado",
      x: 538,
      priceRight: 719,
      descW: 190,
    },
  },
  {
    // This row's names sit lower than the even spacing implies — ALASKA's
    // descriptor is one line, so the print closes the gap above EBI rather than
    // leaving a hole. Measured against the scan, not interpolated.
    y: 700,
    descY: 716,
    c1: {
      name: "EBI ROLL",
      price: "100:-",
      desc: "Räka, Cream cheese, Gurka, Sesam",
      x: 538,
      priceRight: 737,
      descW: 152,
    },
    c2: {
      name: "TEKKA ROLL",
      price: "104:-",
      desc: "Tonfisk, Gurka, Cream cheese",
      x: 750,
      priceRight: 955,
      descW: 205,
    },
  },
  {
    y: 751,
    descY: 769,
    c1: {
      name: "SHAKE ROLL",
      price: "104:-",
      desc: "Lax, Cream cheese, Avokado, Sesam",
      x: 538,
      priceRight: 733,
      descW: 152,
    },
    c2: {
      name: "AVOKADO KAPPA ROLL",
      price: "90:-",
      desc: "Avokado, Gurka, Cream cheese, Sesam",
      // starts further right than the other c2 cells so it clears SHAKE ROLL's price
      x: 742,
      priceRight: 955,
      descW: 213,
      nameSize: 14.5,
    },
  },
  {
    y: 806,
    descY: 823,
    c1: {
      name: "FRIED EBI ROLL",
      price: "104:-",
      desc: "Ebi Tempura, Gurka, Avokado, Chilimayo",
      x: 538,
      priceRight: 727,
      descW: 152,
    },
    c2: {
      name: "CALIFORNIA ROLL",
      price: "90:-",
      desc: "Krabba, Avokado",
      x: 735,
      priceRight: 955,
      descW: 220,
    },
  },
  {
    y: 863,
    descY: 880,
    c1: {
      name: "PHILADELPHIA ROLL",
      price: "90:-",
      desc: "Lax, Gurka, Cream cheese",
      x: 538,
      priceRight: 767,
      descW: 200,
    },
  },
  {
    y: 901,
    descY: 918,
    c1: {
      name: "CRISPY CHICKEN ROLL",
      price: "94:-",
      desc: "Krispig Kyckling, Gurka, Cream cheese",
      x: 538,
      priceRight: 768,
      descW: 210,
    },
  },
  {
    y: 940,
    descY: 957,
    c1: {
      name: "EBI AVOKADO ROLL",
      price: "92:-",
      desc: "Räkor, Avokado",
      x: 538,
      priceRight: 769,
      descW: 200,
    },
  },
];

/* ======================================================== DELUX ROLLS 8 ST */

/** Item 1's descriptor wraps early to stay clear of the photo above it. */
const DELUX: Array<[name: string, price: string, desc: string, y: number, dy: number, w: number]> =
  [
    [
      "TEMPURA DELUX",
      "135:-",
      "Friterad Räka, Avokado, Gurka Topping: Flamberad Lax, Teriyakisås, Chilimayo, Sesam",
      82,
      99,
      258,
    ],
    [
      "CHICKEN DELUX",
      "119:-",
      "Kyckling, Cream cheese, Gurka. Topping: Avokado, Teriyakisås, Chilimayo",
      150,
      168,
      345,
    ],
    [
      "SPICY SALMON ROLL",
      "125:-",
      "Lax, Avokado, Gurka Topping: Flamberad Lax, Japansk Mayo, Chilipeppar, siracha sås",
      210,
      227,
      345,
    ],
    [
      "TEMPURA ROYAL",
      "135:-",
      "Friterad Räka, gurka Topping: Avokado, Chilli Mayo, Teriyakisås, sesam",
      278,
      297,
      345,
    ],
  ];

/* =========================================================== MAKI 6 BITAR */

/** `dy === null` means the descriptor sits inline after the name, as the print does. */
const MAKI: Array<[name: string, price: string, desc: string, y: number, dy: number | null]> = [
  ["MAKI AVOKADO", "49:-", "Avokado", 404, null],
  ["MAKI CHICKEN", "45:-", "Kyckling, Cream Cheese", 441, 460],
  ["MAKI EBI", "55:-", "Räkor", 492, null],
  ["MAKI SALMON", "55:-", "Flamberad Lax, Chilli Mayo, Teriyakisås, Sesam", 525, 544],
  ["MAKI SHAKE AVOKADO", "49:-", "Lax, Avokado", 576, 595],
  ["MAKI SHAKE", "49:-", "Lax", 624, null],
  ["MAKI TUNA", "49:-", "Tonfisk, Majonnäs", 650, 667],
];

/* ============================================================== TILLBEHÖR */

type Till = {
  name: string;
  desc?: string;
  y: number;
  descY?: number;
  /** single price, right-aligned */
  price?: string;
  /** or a two-tier "6st / 10st" pair: label row on the name, prices on the descriptor */
  tiers?: Array<[qty: string, price: string, right: number]>;
};

const TILL: Till[] = [
  {
    name: "VÅRRULLAR",
    price: "49:-",
    desc: "12 st Vegetariska Vårrullar med Sweet Chilisås",
    y: 755,
    descY: 781,
  },
  {
    name: "EDAMAME",
    price: "49:-",
    desc: "Kokta Sojabönor kryddade med Shichimi & Flingsalt",
    y: 806,
    descY: 828,
  },
  {
    name: "EBI TEMPURA STICKS",
    desc: "Tempurafriterade Räkor med Chilimayo",
    y: 849,
    descY: 870,
    tiers: [
      ["6st", "74:-", 1357],
      ["10st", "99:-", 1419],
    ],
  },
  {
    name: "CRISPY CHICKEN STICKS",
    desc: "Panerade Kycklingsticks med Chilimayo",
    y: 900,
    descY: 922,
    tiers: [
      ["6st", "49:-", 1357],
      ["9st", "69:-", 1419],
    ],
  },
  { name: "ALGSALLAD", price: "39:-", y: 953 },
];

/* ===================================================================== */

function Badge({ y }: { y: number }) {
  const cell: CSSProperties = {
    padding: `${u(1)} ${u(5)}`,
    display: "inline-block",
  };
  return (
    <div
      style={{
        position: "absolute",
        left: lx(530),
        top: ly(y - 2),
        display: "flex",
        fontFamily: FONTS.hum,
        fontWeight: 700,
        fontSize: u(S.fyBadge),
        lineHeight: u(S.fyBadge + 3),
        color: "#fff",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ ...cell, background: BADGE_RED }}>FOR</span>
      <span style={{ ...cell, background: BADGE_NAVY }}>YOU</span>
    </div>
  );
}

export default function MenuSheet2({ className = "" }: { className?: string }) {
  const items = useMenuItems(2);

  /** See MenuSheet1: falls back to the printed text until 0013 is applied. */
  const slot = (slug: string, name: string, price = "", description = ""): MenuItemRow =>
    items.get(slug) ?? { slug, name, price, description };

  return (
    <Frame src="/assets/Menu2_canvas.png" className={className}>
      {/* SUSHI MENYER ----------------------------------------------------- */}
      {MENYER.map((m, mi) => {
        const it = slot(`s2.menyer.${mi + 1}`, m.name, m.price);
        return (
          <div key={it.slug}>
            <Txt x={52} y={m.y} size={S.menyName} bold>
              <T row={it} table="menu_items" field="name" />
            </Txt>
            <Txt right={MENY_PRICE_RIGHT} y={m.y} size={S.menyPrice} font="geo" bold>
              <T row={it} table="menu_items" field="price" />
            </Txt>
            {/* Each cell of the contents list is its own row, so each one is
                editable on its own. Packing them into a single field would draw
                fine but leave nothing clickable — the cells are separately
                positioned, and one contentEditable cannot span them. */}
            {m.rows.map((r, ri) => {
              const xs = r.xs ?? m.xs;
              return r.cells.map((cell, ci) => {
                const sub = slot(`s2.menyer.${mi + 1}.${ri + 1}.${ci + 1}`, cell);
                return xs[ci] === undefined ? null : (
                  <Txt
                    key={sub.slug}
                    x={xs[ci]}
                    y={m.y + MENY_SUB_OFFSET + ri * MENY_SUB_PITCH}
                    size={S.menySub}
                  >
                    <T row={sub} table="menu_items" field="name" />
                  </Txt>
                );
              });
            })}
          </div>
        );
      })}

      {/* VALFRI MENY ------------------------------------------------------ */}
      <Txt x={60} y={846} size={S.valfriHead} bold>
        <T row={slot("s2.valfri.heading", "VALFRI MENY")} table="menu_items" field="name" />
      </Txt>
      {VALFRI.map(([label, price, y], i) => {
        const it = slot(`s2.valfri.${i + 1}`, label, price);
        return (
          <div key={it.slug}>
            <Txt x={62} y={y} size={S.valfriLabel}>
              <T row={it} table="menu_items" field="name" />
            </Txt>
            <Txt right={289} y={y} size={S.valfriPrice} font="geo" bold>
              <T row={it} table="menu_items" field="price" />
            </Txt>
          </div>
        );
      })}

      {/* NIGIRI 2 BITAR --------------------------------------------------- */}
      {[
        { items: NIGIRI_L, x: 532, priceRight: 711, section: "nigiri_l" },
        { items: NIGIRI_R, x: 729, priceRight: 926, section: "nigiri_r" },
      ].map((col) =>
        col.items.map((n, i) => {
          const it = slot(`s2.${col.section}.${i + 1}`, n.name, n.price, n.desc);
          return (
            <div key={it.slug}>
              <Txt x={col.x} y={n.y} size={S.nigiriName} w={n.nameW} lh={17} bold>
                <T row={it} table="menu_items" field="name" />
              </Txt>
              <Txt right={col.priceRight} y={n.y} size={S.nigiriPrice} font="geo" bold>
                <T row={it} table="menu_items" field="price" />
              </Txt>
              <Txt
                x={n.descX ?? col.x}
                y={n.descY}
                size={S.nigiriDesc}
                w={n.descW}
                lh={n.descW ? 12.5 : undefined}
              >
                <T row={it} table="menu_items" field="description" />
              </Txt>
            </div>
          );
        }),
      )}

      {/* FOR YOU ROLLS ---------------------------------------------------- */}
      {FY_BADGED.map(([name, price, desc, y, dy], i) => {
        const it = slot(`s2.fy_badged.${i + 1}`, name, price, desc);
        return (
          <div key={it.slug}>
            <Badge y={y} />
            <Txt x={620} y={y} size={S.fyName} bold>
              <T row={it} table="menu_items" field="name" />
            </Txt>
            <Txt right={780} y={y} size={S.fyPrice} font="geo" bold>
              <T row={it} table="menu_items" field="price" />
            </Txt>
            <Txt x={534} y={dy} size={S.fyDesc}>
              <T row={it} table="menu_items" field="description" />
            </Txt>
          </div>
        );
      })}
      {FY_PLAIN.map(([name, price, desc, y, dy], i) => {
        const it = slot(`s2.fy_plain.${i + 1}`, name, price, desc);
        return (
          <div key={it.slug}>
            <Txt x={535} y={y} size={S.fyName} bold>
              <T row={it} table="menu_items" field="name" />
            </Txt>
            <Txt right={916} y={y} size={S.fyPrice} font="geo" bold>
              <T row={it} table="menu_items" field="price" />
            </Txt>
            <Txt x={534} y={dy} size={S.fyDesc}>
              <T row={it} table="menu_items" field="description" />
            </Txt>
          </div>
        );
      })}

      {/* INSIDE-OUT ROLLS ------------------------------------------------- */}
      {INSIDE.map((r, ri) =>
        ([r.c1, r.c2].filter(Boolean) as IoCell[]).map((c, ci) => {
          const it = slot(`s2.inside.${ri + 1}.${ci + 1}`, c.name, c.price, c.desc);
          return (
            <div key={it.slug}>
              <Txt x={c.x} y={r.y} size={c.nameSize ?? S.ioName} bold>
                <T row={it} table="menu_items" field="name" />
              </Txt>
              <Txt right={c.priceRight} y={r.y} size={S.ioPrice} font="geo" bold>
                <T row={it} table="menu_items" field="price" />
              </Txt>
              <Txt x={c.x} y={r.descY} size={S.ioDesc} w={c.descW} lh={12.5}>
                <T row={it} table="menu_items" field="description" />
              </Txt>
            </div>
          );
        }),
      )}

      {/* DELUX ROLLS ------------------------------------------------------ */}
      {DELUX.map(([name, price, desc, y, dy, w], i) => {
        const it = slot(`s2.delux.${i + 1}`, name, price, desc);
        return (
          <div key={it.slug}>
            <Txt x={1028} y={y} size={S.dxName} bold>
              <T row={it} table="menu_items" field="name" />
            </Txt>
            <Txt right={1308} y={y} size={S.dxPrice} font="geo" bold>
              <T row={it} table="menu_items" field="price" />
            </Txt>
            <Txt x={1028} y={dy} size={S.dxDesc} w={w} lh={16}>
              <T row={it} table="menu_items" field="description" />
            </Txt>
          </div>
        );
      })}

      {/* MAKI 6 BITAR ----------------------------------------------------- */}
      {MAKI.map(([name, price, desc, y, dy], i) => {
        const it = slot(`s2.maki.${i + 1}`, name, price, desc);
        return (
          <div key={it.slug}>
            {dy === null ? (
              <Txt x={1023} y={y} size={S.makiName} bold row>
                <T row={it} table="menu_items" field="name" />
                <span style={{ fontWeight: 400, fontSize: u(S.makiInline), marginLeft: u(12) }}>
                  <T row={it} table="menu_items" field="description" />
                </span>
              </Txt>
            ) : (
              <>
                <Txt x={1023} y={y} size={S.makiName} bold>
                  <T row={it} table="menu_items" field="name" />
                </Txt>
                <Txt x={1023} y={dy} size={S.makiDesc} w={290} lh={15}>
                  <T row={it} table="menu_items" field="description" />
                </Txt>
              </>
            )}
            <Txt right={1307} y={y} size={S.makiPrice} font="geo" bold>
              <T row={it} table="menu_items" field="price" />
            </Txt>
          </div>
        );
      })}

      {/* TILLBEHÖR -------------------------------------------------------- */}
      {TILL.map((t, i) => {
        // Two-tier rows carry a row per tier — quantity in `name`, that tier's
        // price in `price` — so both are editable where they are printed. Only
        // the x positions stay in code; the artwork fixes those.
        const it = slot(`s2.till.${i + 1}`, t.name, t.price ?? "", t.desc ?? "");
        return (
          <div key={it.slug}>
            <Txt x={1036} y={t.y} size={S.tillName} bold>
              <T row={it} table="menu_items" field="name" />
            </Txt>
            {!t.tiers && (
              <Txt right={1402} y={t.y} size={S.tillPrice} font="geo" bold>
                <T row={it} table="menu_items" field="price" />
              </Txt>
            )}
            {t.tiers?.map(([qty, , right], ti) => (
              <Txt key={qty} right={right} y={t.y} size={S.tillQty} font="geo" bold>
                <T
                  row={slot(`s2.till.${i + 1}.tier.${ti + 1}`, qty)}
                  table="menu_items"
                  field="name"
                />
              </Txt>
            ))}
            {t.desc && t.descY !== undefined && (
              <Txt x={1036} y={t.descY} size={S.tillDesc} w={280} lh={15}>
                <T row={it} table="menu_items" field="description" />
              </Txt>
            )}
            {t.tiers?.map(([qty, price, right], ti) => (
              <Txt
                key={qty + ti}
                right={right}
                y={t.descY ?? t.y}
                size={S.tillPrice}
                font="geo"
                bold
              >
                <T
                  row={slot(`s2.till.${i + 1}.tier.${ti + 1}`, qty, price)}
                  table="menu_items"
                  field="price"
                />
              </Txt>
            ))}
          </div>
        );
      })}
    </Frame>
  );
}
