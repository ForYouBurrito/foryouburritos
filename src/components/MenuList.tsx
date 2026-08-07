import { FONTS } from "@/components/menuSheetKit";
import { BURRITOS, LUNCH, POKE, STICKS, TILLAGG } from "@/components/MenuSheet1";
import {
  DELUX,
  FY_BADGED,
  FY_PLAIN,
  INSIDE,
  MAKI,
  MENYER,
  NIGIRI_L,
  NIGIRI_R,
  TILL,
  VALFRI,
  type IoCell,
} from "@/components/MenuSheet2";
import { useMenuItems, type MenuItemRow } from "@/lib/cms";
import { NAVY, RED } from "@/lib/site";

/**
 * The menu sheets, reflowed for phones.
 *
 * `MenuSheet1` / `MenuSheet2` are the printed spreads rebuilt as text positioned on
 * the blanked artwork. They are one rigid unit — every length is `cqw` against a
 * 1024 / 1440 design canvas — so at phone width their smallest type falls to ~4px.
 * The page used to hold them at 860 / 1100px inside a horizontal scroller, which
 * meant only the left half of each spread was ever on screen.
 *
 * So below `md` the artwork is dropped and the same items are stacked in one
 * column at a readable size. Not a second copy of the menu: the item arrays are
 * imported from the sheets and every row is looked up under the *same*
 * `menu_items` slug, so a CMS edit lands in both views and neither can drift.
 *
 * What is lost is the print's own grouping headings and price blocks — those are
 * baked into the artwork, not text — so they are supplied here as `title` / `note`.
 * Keep them in step with the artwork if a sheet is ever re-exported.
 *
 * In-place editing (`<T>`) is deliberately not wired up here. The rows are the same
 * ones the sheet edits, and two contentEditables bound to a single row would share
 * one draft slot; `/admin/edit` is a desktop job, where the sheet is what renders.
 */

export type ListItem = {
  slug: string;
  name: string;
  price?: string;
  desc?: string;
  /** Composition lines — a meny's contents, a lunch box's three rows. */
  lines?: string[];
};

export type ListGroup = {
  title: string;
  /** Copy that sits in the artwork rather than in a row — price blocks, intros. */
  note?: string;
  items: ListItem[];
};

const BODY = "text-[#0a1f44]/70";

function Group({ group, accent }: { group: ListGroup; accent: string }) {
  return (
    <section>
      <h3
        className="rounded-sm px-4 py-2.5 text-[13px] leading-tight font-bold tracking-[0.16em] text-white"
        style={{ backgroundColor: accent }}
      >
        {group.title}
      </h3>

      {group.note && <p className={`mt-3.5 text-[13px] leading-relaxed ${BODY}`}>{group.note}</p>}

      <ul className="mt-1 divide-y divide-[#0a1f44]/10">
        {group.items.map((it) => (
          <li key={it.slug} className="py-3.5">
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-[15px] leading-snug font-bold text-[#0a1f44]">{it.name}</span>
              {it.price && (
                <span
                  className="shrink-0 text-[15px] font-bold text-[#0a1f44]"
                  style={{ fontFamily: FONTS.geo }}
                >
                  {it.price}
                </span>
              )}
            </div>

            {it.desc && <p className={`mt-1 text-[13px] leading-relaxed ${BODY}`}>{it.desc}</p>}

            {it.lines && it.lines.length > 0 && (
              <ul className={`mt-1.5 space-y-0.5 text-[13px] leading-relaxed ${BODY}`}>
                {it.lines.map((l, i) => (
                  <li key={i}>{l}</li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function List({ groups, accent }: { groups: ListGroup[]; accent: string }) {
  return (
    <div className="space-y-10">
      {groups.map((g) => (
        <Group key={g.title} group={g} accent={accent} />
      ))}
    </div>
  );
}

/**
 * Resolver over one sheet's rows. Mirrors the `slot()` in the sheet components:
 * the printed text is the fallback, so the list is correct before the migration
 * that seeds `menu_items` is applied.
 */
function useSlot(sheet: number) {
  const items = useMenuItems(sheet);
  return (slug: string, name: string, price = "", description = ""): MenuItemRow =>
    items.get(slug) ?? { slug, name, price, description };
}

const asItem = (r: MenuItemRow, lines?: string[]): ListItem => ({
  slug: r.slug,
  name: r.name,
  price: r.price || undefined,
  desc: r.description || undefined,
  lines,
});

/* ------------------------------------------------------------------ sheet 01 */

export function MenuList1() {
  const slot = useSlot(1);

  const groups: ListGroup[] = [
    {
      title: "POKE BOWLS",
      note: slot(
        "s1.poke.intro",
        "Alla Bowls Ingår: Ris, Edamamebönor, Wakame Sallad, Mango, Sesam, Picklad rödlök, Chilimayo, Teriyaki, Gurka, Vårlök & Avokado",
      ).name,
      items: POKE.map(([name, price, desc], i) =>
        asItem(slot(`s1.poke.${i + 1}`, name, price, desc)),
      ),
    },
    {
      title: "SUSHI BURRITOS",
      items: BURRITOS.map(([name, price, ing], i) =>
        asItem(slot(`s1.burritos.${i + 1}`, name, price, ing)),
      ),
    },
    {
      // The 59:- / 99:- block is part of the artwork, so it has no row to read.
      title: "SUSHI BURRITO STICKS",
      note: "1 stick · 3 bitar 59:-   ·   2 sticks · 6 bitar 99:-   ·   En valfri sås",
      items: STICKS.map(([name, desc], i) => asItem(slot(`s1.sticks.${i + 1}`, name, "", desc))),
    },
    {
      // Likewise the "119:- MÅN-FRE 11-14" banner.
      title: "LUNCH BOX 119:-",
      note: "Mån–fre 11–14.",
      items: LUNCH.map(([n, rows], li) => {
        const it = slot(`s1.lunch.${li + 1}`, "Lunch box", "14 Sushi Bitar");
        return {
          ...asItem(
            it,
            rows.map((r, i) => slot(`s1.lunch.${li + 1}.${i + 1}`, r).name),
          ),
          name: `${n}. ${it.name}`,
        };
      }),
    },
    {
      title: "TILLÄGG",
      items: TILLAGG.map(([name], i) => asItem(slot(`s1.tillagg.${i + 1}`, name, "15:-"))),
    },
  ];

  return <List groups={groups} accent={RED} />;
}

/* ------------------------------------------------------------------ sheet 02 */

export function MenuList2() {
  const slot = useSlot(2);

  const groups: ListGroup[] = [
    {
      title: "SUSHI MENYER",
      items: MENYER.map((m, mi) => {
        const it = slot(`s2.menyer.${mi + 1}`, m.name, m.price);
        // The sheet positions each cell separately so it can be clicked on its
        // own; stacked, a row reads better as one line.
        const lines = m.rows.map((r, ri) =>
          r.cells
            .map((cell, ci) => slot(`s2.menyer.${mi + 1}.${ri + 1}.${ci + 1}`, cell).name)
            .join("  ·  "),
        );
        return asItem(it, lines);
      }),
    },
    {
      title: slot("s2.valfri.heading", "VALFRI MENY").name,
      items: VALFRI.map(([label, price], i) => asItem(slot(`s2.valfri.${i + 1}`, label, price))),
    },
    {
      title: "NIGIRI 2 BITAR",
      items: [
        ...NIGIRI_L.map((n, i) => asItem(slot(`s2.nigiri_l.${i + 1}`, n.name, n.price, n.desc))),
        ...NIGIRI_R.map((n, i) => asItem(slot(`s2.nigiri_r.${i + 1}`, n.name, n.price, n.desc))),
      ],
    },
    {
      title: "FOR YOU ROLLS - 7 BITAR",
      items: [
        // The first three take "FOR YOU" from the badge beside them, which is
        // markup in the sheet and has nowhere to sit in a list row.
        ...FY_BADGED.map(([name, price, desc], i) => {
          const it = slot(`s2.fy_badged.${i + 1}`, name, price, desc);
          return { ...asItem(it), name: `FOR YOU ${it.name}` };
        }),
        ...FY_PLAIN.map(([name, price, desc], i) =>
          asItem(slot(`s2.fy_plain.${i + 1}`, name, price, desc)),
        ),
      ],
    },
    {
      title: "INSIDE-OUT ROLLS - 8 BITAR",
      items: INSIDE.flatMap((r, ri) =>
        ([r.c1, r.c2].filter(Boolean) as IoCell[]).map((c, ci) =>
          asItem(slot(`s2.inside.${ri + 1}.${ci + 1}`, c.name, c.price, c.desc)),
        ),
      ),
    },
    {
      title: "DELUX ROLLS - 8 BITAR",
      items: DELUX.map(([name, price, desc], i) =>
        asItem(slot(`s2.delux.${i + 1}`, name, price, desc)),
      ),
    },
    {
      title: "MAKI 6 BITAR",
      items: MAKI.map(([name, price, desc], i) =>
        asItem(slot(`s2.maki.${i + 1}`, name, price, desc)),
      ),
    },
    {
      title: "TILLBEHÖR",
      items: TILL.map((t, i) => {
        const it = slot(`s2.till.${i + 1}`, t.name, t.price ?? "", t.desc ?? "");
        if (!t.tiers) return asItem(it);
        // Two-tier pricing ("6st 74:- / 10st 99:-") is a price *pair*, so it goes
        // in the price column rather than reading as a second descriptor.
        const price = t.tiers
          .map(([qty, p], ti) => {
            const tier = slot(`s2.till.${i + 1}.tier.${ti + 1}`, qty, p);
            // The sheet reads name and price off this row from two separate
            // slot() calls, so a row seeded by only one of them can carry an
            // empty price. Fall back to the printed figure rather than "6st ".
            return `${tier.name} ${tier.price || p}`;
          })
          .join("  ·  ");
        return { ...asItem(it), price };
      }),
    },
  ];

  return <List groups={groups} accent={NAVY} />;
}
