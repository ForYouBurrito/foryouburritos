import type { CSSProperties, ReactNode } from "react";

import EditableImage from "@/components/EditableImage";

/**
 * Shared primitives for the printed menu sheets rebuilt as real text
 * (`MenuSheet1`, `MenuSheet2`).
 *
 * Each sheet is a blanked scan of the printed spread — boxes, banners and food
 * cut-outs baked in, every item line erased — with the copy positioned on top.
 * Coordinates are the original design pixels of that scan, measured by diffing the
 * printed version against the blank. Positions are percentages of the frame and every
 * length is `cqw`, so a sheet scales as one unit at any container width.
 *
 * Both faces are self-hosted from public/assets/fonts (declared in index.css), so the
 * sheets render the same everywhere rather than depending on locally installed fonts.
 * Sizes are calibrated to them — swapping the font means recalibrating.
 */

export const FONTS = {
  /** geometric — uppercase product names and every price */
  geo: 'Montserrat, "Century Gothic", Futura, "Trebuchet MS", sans-serif',
  /** humanist — descriptors, ingredient lines, most item names */
  hum: 'Lato, "Gill Sans MT", "Segoe UI", "Helvetica Neue", sans-serif',
} as const;

export const INK = "#141414";

/**
 * The measured `y` is where the ink starts. CSS `top` is the line box, which sits
 * ~0.18em above the cap line plus half the leading — so both are subtracted back out.
 * BASE is the leftover constant, calibrated by screenshotting a sheet against its print.
 */
const BASE = 1;

export type TxtProps = {
  /** left edge, design px (ignored when `right` is set) */
  x?: number;
  /** right edge, design px */
  right?: number;
  /** top of the ink, design px */
  y: number;
  size: number;
  /** wrap width, design px — omit for a single nowrap line */
  w?: number;
  lh?: number;
  font?: keyof typeof FONTS;
  bold?: boolean;
  ls?: number;
  align?: CSSProperties["textAlign"];
  color?: string;
  /** lay children out on a shared baseline — for a row mixing two type sizes */
  row?: boolean;
  /** extra design-px nudge, used where `row` shifts the baseline */
  dy?: number;
  /** horizontal squeeze, for condensed caps */
  squeeze?: number;
  children: ReactNode;
};

export function makeSheetKit(W: number, H: number) {
  /** design px -> a length that scales with the frame */
  const u = (v: number) => `${(v / W) * 100}cqw`;
  const lx = (v: number) => `${(v / W) * 100}%`;
  const ly = (v: number) => `${(v / H) * 100}%`;

  function Txt({
    x,
    right,
    y,
    size,
    w,
    lh,
    font = "hum",
    bold,
    ls,
    align,
    color,
    row,
    dy = 0,
    squeeze,
    children,
  }: TxtProps) {
    const lineHeight = lh ?? size;
    const style: CSSProperties = {
      position: "absolute",
      top: ly(y + dy + BASE - size * 0.18 - (lineHeight - size) / 2),
      width: w ? u(w) : undefined,
      fontFamily: FONTS[font],
      fontSize: u(size),
      lineHeight: u(lineHeight),
      fontWeight: bold ? 700 : 400,
      letterSpacing: ls ? u(ls) : undefined,
      textAlign: align,
      whiteSpace: w ? "normal" : "nowrap",
      color: color ?? INK,
    };
    if (row) {
      style.display = "flex";
      style.alignItems = "baseline";
    }
    if (squeeze) {
      style.transform = `scaleX(${squeeze})`;
      style.transformOrigin = right !== undefined ? "right" : "left";
    }
    if (right !== undefined) style.right = lx(W - right);
    else style.left = lx(x ?? 0);
    return <div style={style}>{children}</div>;
  }

  /** Solid block, for painting out artwork that is not in the printed sheet. */
  function Rect({
    x,
    y,
    w,
    h,
    fill,
  }: {
    x: number;
    y: number;
    w: number;
    h: number;
    fill: string;
  }) {
    return (
      <div
        style={{
          position: "absolute",
          left: lx(x),
          top: ly(y),
          width: u(w),
          height: `${(h / H) * 100}%`,
          background: fill,
        }}
      />
    );
  }

  /**
   * The scaling frame + the blanked artwork behind it.
   *
   * ⚠️ The artwork is replaceable, but it is the one image on the site where a
   * careless swap breaks the page rather than just looking different. Every
   * item, price and descriptor is positioned as a PERCENTAGE of this frame, so
   * a replacement must have the same layout and proportions as the file it
   * replaces — a different photo leaves the text floating over nothing.
   *
   * `loading="lazy"` matters here beyond the usual: the sheet that is hidden at
   * the current width sits inside `display:none`, which browsers decline to
   * fetch, so phones skip ~950 KB per sheet. EditableImage passes it through.
   */
  function Frame({
    src,
    imageKey,
    className = "",
    children,
  }: {
    src: string;
    imageKey?: string;
    className?: string;
    children: ReactNode;
  }) {
    return (
      <div
        className={"relative w-full select-text " + className}
        style={{ aspectRatio: `${W} / ${H}`, containerType: "inline-size" }}
      >
        <EditableImage
          variant="corner"
          imageKey={imageKey}
          fallback={src}
          alt=""
          ariaHidden
          width={W}
          height={H}
          loading="lazy"
          decoding="async"
          hint="OBS: texten ligger placerad ovanpå bilden. En ersättare måste ha exakt samma mått och layout."
          className="absolute inset-0 h-full w-full"
        />
        {children}
      </div>
    );
  }

  return { u, lx, ly, Txt, Rect, Frame };
}
