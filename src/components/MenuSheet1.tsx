import { FONTS, makeSheetKit } from "@/components/menuSheetKit";
import { useMenuItems, type MenuItemRow } from "@/lib/cms";
import { T } from "@/lib/editing";

/**
 * Menu sheet 01, rebuilt as real text.
 *
 * `/assets/Menu1_empty.png` is the printed spread with every item line erased — the
 * boxes, red banners, food cut-outs and the two blocks that are *part of the artwork*
 * (the burrito-stick price block, the LUNCH BOX banner, "ALLERGI ?") are still baked in.
 * Everything else below is positioned on top of it.
 *
 * Coordinates are the original 1024x724 design pixels, measured off `Menu1.png` by
 * diffing it against the blank. Positions are percentages of the frame and every length
 * is in `cqw`, so the whole sheet scales as one unit at any container width.
 *
 * Caveat worth knowing: the blank has a burrito-stick photo sitting in the LUNCH BOX
 * card (x 544-662, y 496-609) that the printed original does not have. The lunch-box
 * rows are therefore pulled left of x=540 — that is the one place this deliberately
 * departs from the print layout.
 */

const W = 1024;
const H = 724;
const { u, lx, ly, Txt, Frame } = makeSheetKit(W, H);

/** Tillägg is set in condensed caps; Lato squeezed horizontally stands in for it. */
const CONDENSE = 0.78;

/* ---------------------------------------------------------------- poke bowls */

/** Name x=43, price column x=150. `y` pairs are name / descriptor ink tops. */
export const POKE: Array<[name: string, price: string, desc: string, y: number, dy: number]> = [
  ["SUJUK BOWL", "179:-", "Sujuk", 106, 120],
  ["YAKINIKU BOWL", "159:-", "Yakiniku (Marinerad Biff)", 129, 141],
  ["SHRIMP BOWL", "145:-", "Räkor", 157, 170],
  ["TOFU BOWL", "130:-", "Tofu", 187, 200],
  ["TUNA BOWL", "145:-", "Tonfisk", 220, 235],
  ["SALMON BOWL", "155:-", "Lax", 248, 261],
  ["CRISPY CHICKEN BOWL", "129:-", "Panko (Friterad Kyckling)", 279, 298],
];

/* ------------------------------------------------------ sushi burrito sticks */

/** The 59:- / 99:- price block under these is part of the artwork, not text. */
export const STICKS: Array<[name: string, desc: string, y: number, dy: number]> = [
  ["Burrito stick Lax", "Avokado, lax", 382, 396],
  ["Burrito stick Kyckling", "Cream cheese, kyckling", 413, 428],
  ["Burrito stick Råkor", "Cream cheese, gurka, räkor", 448, 463],
  ["Burrito stick Biff", "Biff, rödlök", 481, 495],
  ["Burrito stick Veg", "Cream cheese, gurka, avokado", 509, 524],
];

/* -------------------------------------------------------------------- tillägg */

export const TILLAGG: Array<[name: string, y: number]> = [
  ["CHILIMAYO", 610],
  ["MANGO CURRY SÅS", 624],
  ["AVOKADO SÅS", 637],
  ["SWEET CHILISÅS", 651],
  ["WASABIMAYO", 665],
];

/* ------------------------------------------------------------- sushi burritos */

/** Price sits inline after the name with a fixed gap — that is what the print does. */
export const BURRITOS: Array<[name: string, price: string, ing: string, y: number, dy: number]> = [
  [
    "Kyckling BURRITO",
    "149:-",
    "Kyckling, ris, gurka, färskost, japansk majonnäs, picklad rödlök, sriracha, Isbergssallad",
    59,
    74,
  ],
  [
    "Spicy kyckling BURRITO",
    "179:-",
    "Stark kyckling, cream cheese, japansk majonnäs, mango curry sås, Majs, rostad lök",
    99,
    113,
  ],
  [
    "Deluxe BURRITO",
    "179:-",
    "Kyckling, paprika, lök, kryddblandning, soja, sriracha, avokadosås",
    137,
    151,
  ],
  ["Sujuk BURRITO", "179:-", "Ris, sujuk, avokado, cream cheese, avokado sås", 170, 184],
  [
    "Biff BURRITO",
    "149:-",
    "Biff, ris, gurka, cream cheese, japansk majonnäs, picklad rödlök, sriracha, isbergssallad",
    201,
    215,
  ],
  [
    "Friterad Räka BURRITO",
    "149:-",
    "Friterad räka, ris, gurka, cream cheese, japansk majonnäs, picklad rödlök, sriracha, isbergssallad",
    243,
    257,
  ],
  [
    "Lax BURRITO",
    "149:-",
    "Lax, ris, gurka, cream cheese, japansk majonnäs, picklad rödlök, sriracha, isbergssallad",
    285,
    299,
  ],
  [
    "Tofu BURRITO",
    "149:-",
    "Tofu, ris, gurka, färskost, japansk majonnäs, picklad rödlök, sriracha, isbergssallad",
    326,
    340,
  ],
  [
    "Vegetarisk BURRITO",
    "149:-",
    "Avokado, ris, gurka, färskost, japansk majonnäs, picklad rödlök, sriracha, isbergssallad",
    365,
    381,
  ],
];

/* ------------------------------------------------------------------ lunch box */

export const LUNCH: Array<[n: string, rows: string[], y: number]> = [
  ["1", ["6 Bitar Philadelphia Roll", "4 Bitar Maki Avokado", "4 Olika Nigiri Bitar"], 483],
  [
    "2",
    ["6 Bitar Crispy Chicken Roll", "4 Bitar Maki Kappa (VEGETARISK)", "4 Olika Nigiri Bitar"],
    544,
  ],
  ["3", ["6 Bitar Fried Ebi Roll", "4 Bitar Maki Ebi", "4 Olika Nigiri Bitar"], 606],
];

export default function MenuSheet1({ className = "" }: { className?: string }) {
  const items = useMenuItems(1);

  /**
   * The row for an artwork slot. Falls back to the printed text hardcoded above
   * when the slug has no row — so the sheet is correct before 0012 is applied,
   * and simply not editable until it is.
   */
  const slot = (slug: string, name: string, price = "", description = ""): MenuItemRow =>
    items.get(slug) ?? { slug, name, price, description };

  return (
    <Frame src="/assets/Menu1_empty.png" className={className}>
      {/* POKE BOWLS ------------------------------------------------------- */}
      <Txt x={43} y={61} w={213} size={10.2} lh={11.6}>
        <T
          row={slot(
            "s1.poke.intro",
            "Alla Bowls Ingår: Ris, Edamamebönor, Wakame Sallad, Mango, Sesam, Picklad rödlök, Chilimayo, Teriyaki, Gurka, Vårlök & Avokado",
          )}
          table="menu_items"
          field="name"
        />
      </Txt>
      {POKE.map(([name, price, desc, y, dy], i) => {
        const it = slot(`s1.poke.${i + 1}`, name, price, desc);
        return (
          <div key={it.slug}>
            {/* w=105 is what makes CRISPY CHICKEN BOWL break after CHICKEN, as in print */}
            <Txt x={43} y={y} w={105} lh={11} size={10.1} font="geo" bold ls={0.15}>
              <T row={it} table="menu_items" field="name" />
            </Txt>
            <Txt x={150} y={y} size={15.7} font="geo" bold>
              <T row={it} table="menu_items" field="price" />
            </Txt>
            <Txt x={44} y={dy} size={8.6}>
              <T row={it} table="menu_items" field="description" />
            </Txt>
          </div>
        );
      })}

      {/* SUSHI BURRITO STICKS --------------------------------------------- */}
      {STICKS.map(([name, desc, y, dy], i) => {
        const it = slot(`s1.sticks.${i + 1}`, name, "", desc);
        return (
          <div key={it.slug}>
            <Txt x={45} y={y} size={13.5} bold>
              <T row={it} table="menu_items" field="name" />
            </Txt>
            <Txt x={45} y={dy} size={8.7}>
              <T row={it} table="menu_items" field="description" />
            </Txt>
          </div>
        );
      })}

      {/* TILLÄGG ----------------------------------------------------------- */}
      {TILLAGG.map(([name, y], i) => {
        const it = slot(`s1.tillagg.${i + 1}`, name, "15:-");
        return (
          <div key={it.slug}>
            <Txt x={45} y={y} size={10} squeeze={CONDENSE} ls={0.5}>
              <T row={it} table="menu_items" field="name" />
            </Txt>
            <Txt right={270} y={y} size={16.2} font="geo" bold>
              <T row={it} table="menu_items" field="price" />
            </Txt>
          </div>
        );
      })}

      {/* SUSHI BURRITOS ---------------------------------------------------- */}
      {BURRITOS.map(([name, price, ing, y, dy], i) => {
        const it = slot(`s1.burritos.${i + 1}`, name, price, ing);
        return (
          <div key={it.slug}>
            <Txt x={378} y={y} size={12.8} bold row dy={1}>
              <T row={it} table="menu_items" field="name" />
              <span style={{ fontFamily: FONTS.geo, fontSize: u(16.2), marginLeft: u(15) }}>
                <T row={it} table="menu_items" field="price" />
              </span>
            </Txt>
            <Txt x={378} y={dy} w={278} size={8.8} lh={10.2}>
              <T row={it} table="menu_items" field="description" />
            </Txt>
          </div>
        );
      })}

      {/* LUNCH BOX --------------------------------------------------------- */}
      {/*
        The blank carries a burrito-stick photo across x 544-670, y 496-609 that the
        printed sheet does not have — an artefact of however the item lines were erased.
        It lands exactly where the "14 Sushi Bitar" labels and the big numerals belong,
        so it is painted out. The card is flat white underneath (sampled 253-255), and
        the print's own right border stops at y~522, which is why only a short stub is
        drawn back in. Remove these two divs and the numerals have nowhere to go.
      */}
      <div
        style={{
          position: "absolute",
          left: lx(540),
          top: ly(486),
          width: u(131),
          height: `${(132 / H) * 100}%`,
          background: "#fff",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: lx(659),
          top: ly(486),
          width: u(2.5),
          height: `${(37 / H) * 100}%`,
          background: "#1c1c1c",
        }}
      />
      {LUNCH.map(([n, rows, y], li) => {
        const it = slot(`s1.lunch.${li + 1}`, "Lunch box", "14 Sushi Bitar");
        return (
          <div key={it.slug}>
            <Txt x={378} y={y} size={20} bold>
              <T row={it} table="menu_items" field="name" />
            </Txt>
            <Txt x={482} y={y + 3} size={12.6} bold>
              <T row={it} table="menu_items" field="price" />
            </Txt>
            <Txt right={614} y={y} size={34.5} font="geo" bold>
              {n}
            </Txt>
            {/* One row per printed line: the three lines sit at fixed offsets,
                so a single field could render them but never be clicked. */}
            {rows.map((r, i) => {
              const line = slot(`s1.lunch.${li + 1}.${i + 1}`, r);
              return (
                <Txt key={line.slug} x={379} y={y + 17 + i * 12} size={10.1}>
                  <T row={line} table="menu_items" field="name" />
                </Txt>
              );
            })}
          </div>
        );
      })}
    </Frame>
  );
}
