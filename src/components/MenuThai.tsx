import { FONTS } from "@/components/menuSheetKit";
import { useContent, useMenuItems, type MenuItemRow } from "@/lib/cms";
import { T } from "@/lib/editing";
import { RED } from "@/lib/site";

/**
 * The Thai category on /meny.
 *
 * Unlike sheets 01 and 02 this category was never printed, so there is no
 * artwork to position text against and no second reflowed rendering to keep in
 * step. That makes it the simplest section on the page and the only one where
 * a single layout serves every width — the grid collapses from three columns to
 * one, and the rows themselves are the same shape at both ends.
 *
 * Two consequences worth knowing:
 *
 *  - It is the only menu section where in-place editing is wired up at *every*
 *    width. MenuList deliberately leaves `<T>` out because its rows are also
 *    rendered by a sheet, and two contentEditables bound to one row would share
 *    a single draft slot. Nothing renders these rows twice, so that hazard does
 *    not exist here.
 *  - Items live under `sheet = 3` in `menu_items`. The sheet number is just a
 *    grouping key for the fetch; it does not imply a printed spread.
 *
 * The arrays below are the fallback, exactly as the sheets do it: the section
 * renders correctly before 0024 is applied, and on a cold Supabase.
 *
 * VISUAL: this borrows the printed sheets' own device rather than inventing one.
 * Every group on Menu1/Menu2 is a bordered panel under a red banner of white
 * tracked caps — POKE BOWLS, SUSHI BURRITO STICKS, TILLÄGG. Without that, plain
 * rules on white read as a page of text sitting between two colour-saturated
 * scans instead of as another part of the same menu.
 */

/**
 * The printed-text fallback, and the only place these words live in the bundle.
 *
 * Not exported, unlike the sheets' arrays — those are exported because MenuList
 * re-lays them out for phones. Nothing renders Thai twice, so exporting this
 * would only invite a second view that could drift out of step.
 *
 * No photos, deliberately: the item shots that exist are inconsistent in crop and
 * background, and a half-populated grid of thumbnails reads worse than none.
 */
const THAI: Array<[name: string, price: string, desc: string]> = [
  ["Panko Chicken", "119:-", "Marinerad kyckling med ris & jordnötssås."],
  ["Koong Tod", "119:-", "Friterade tigerräkor med sweetchilisås och ris."],
  [
    "Pad Thai",
    "Från 119:-",
    "Stekta risnudlar med pad thai sås, ägg, krossade jordnötter, böngroddar",
  ],
  [
    "Kaeng Ped",
    "Från 119:-",
    "Röd currygryta, limeblad, bambuskott, thaibasilika, paprika, zucchini, sockerärtor, kokosmjölk och ris. Välj protein i nästa steg.",
  ],
  [
    "Kaen Khiew Wan",
    "Från 119:-",
    "Grön currygryta. thaibasilika, Limeblad, chili, bambu, thaibasilika och serveras med ris.",
  ],
  [
    "Kaeng Ped Noodles",
    "Från 119:-",
    "Stekta nudlar i röd currygryta med zucchini, paprika, bambuskott, thaibasilika, sockerärtor och kokosmjölk.",
  ],
];

const BODY = "text-[#0a1f44]/70";

export default function MenuThai() {
  const items = useMenuItems(3);
  const t = useContent();

  /** Same resolver the sheets use: the row wins, the printed text is the floor. */
  const slot = (slug: string, name: string, price: string, description: string): MenuItemRow =>
    items.get(slug) ?? { slug, name, price, description };

  return (
    <div className="overflow-hidden rounded-xl border border-[#0a1f44]/15">
      {/* The banner repeats the section's own <h2>, exactly as the sheets do —
          "SUSHI BURRITOS" is both the Blackhawk heading and the red bar in the
          artwork beneath it. It reads the same key rather than owning one, so the
          owner never has to type the category name twice.

          Deliberately NOT wrapped in <T>: two contentEditables on one key would
          share a single draft slot. The <h2> above is the editable one, and this
          follows it on save. */}
      <div style={{ backgroundColor: RED }} className="px-5 py-3 sm:px-7">
        <p className="text-[13px] leading-tight font-bold tracking-[0.16em] text-white sm:text-sm">
          {t("meny.thai_title")}
        </p>
      </div>

      {/* Each cell carries its own top rule rather than the grid carrying
          dividers: grid rows align, so the rules line up across columns at one,
          two or three columns without a dangling edge at either end of a short
          final row. The panel border closes the block at the bottom. */}
      <ul className="grid grid-cols-1 px-5 pt-2 pb-3 sm:grid-cols-2 sm:gap-x-10 sm:px-7 sm:pt-3 sm:pb-4 lg:grid-cols-3">
        {THAI.map(([name, price, desc], i) => {
          const row = slot(`s3.thai.${i + 1}`, name, price, desc);
          return (
            <li key={row.slug} className="border-t border-[#0a1f44]/10 py-5">
              <div className="flex items-baseline justify-between gap-4">
                <T
                  as="h3"
                  row={row}
                  table="menu_items"
                  field="name"
                  className="text-[15px] leading-snug font-bold text-[#0a1f44] sm:text-base"
                />
                {/* Prices are set in the geometric face everywhere else on this
                    page — the sheets, the reflowed lists — so they match here. */}
                <T
                  row={row}
                  table="menu_items"
                  field="price"
                  style={{ fontFamily: FONTS.geo }}
                  className="shrink-0 text-[15px] font-bold whitespace-nowrap text-[#0a1f44] sm:text-base"
                />
              </div>
              <T
                as="p"
                row={row}
                table="menu_items"
                field="description"
                className={`mt-1.5 text-[13px] leading-relaxed sm:text-sm ${BODY}`}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
