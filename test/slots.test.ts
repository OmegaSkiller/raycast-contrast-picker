import { describe, expect, it } from "vitest";
import { fillFromClipboard, resolveSlots } from "../src/lib/extract";
import { parseColor, toHex } from "../src/lib/color";
import { findFix, tailwindFix } from "../src/lib/fixes";
import { passesTarget } from "../src/lib/contrast";

describe("resolveSlots", () => {
  it("keeps each color in its own slot", () => {
    expect(resolveSlots("#111111", undefined)).toEqual({ foreground: "#111111", background: undefined });
    expect(resolveSlots(undefined, "#eeeeee")).toEqual({ foreground: undefined, background: "#eeeeee" });
  });

  it("splits one field that holds two colors", () => {
    expect(resolveSlots("#fff on #000", undefined)).toEqual({ foreground: "#fff", background: "#000" });
  });
});

describe("fillFromClipboard", () => {
  const clip = ["#aaaaaa", "#bbbbbb"];

  it("uses the two newest colors when both slots are empty", () => {
    expect(fillFromClipboard({}, clip)).toEqual({ foreground: "#aaaaaa", background: "#bbbbbb" });
  });

  it("uses one clipboard color as the text color", () => {
    expect(fillFromClipboard({}, ["#bbbbbb"])).toEqual({ foreground: "#bbbbbb", background: undefined });
  });

  it("fills only the missing background and keeps the typed text color", () => {
    expect(fillFromClipboard({ foreground: "#111111" }, clip)).toEqual({
      foreground: "#111111",
      background: "#bbbbbb",
    });
  });

  it("fills only the missing text color and keeps the typed background", () => {
    expect(fillFromClipboard({ background: "#eeeeee" }, clip)).toEqual({
      foreground: "#bbbbbb",
      background: "#eeeeee",
    });
  });
});

describe("tailwindFix", () => {
  it("returns a class that passes the target", () => {
    const fg = parseColor("#666666")!;
    const bg = parseColor("#000000")!;
    const fix = findFix(fg, bg, { target: "aa", mode: "foreground", sizePx: 16, weight: 400 })!;
    const name = tailwindFix(fix, 16, 400)!;
    expect(name).toBeDefined();
    expect(name).not.toBe("neutral-500"); // #737373 is 4.43:1 on black and fails AA
    const palette = parseColor(name)!;
    expect(passesTarget(palette, bg, "aa", 16, 400)).toBe(true);
    expect(toHex(palette)).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("returns classes for both colors that pass together", () => {
    const fix = findFix(parseColor("#a2d26b")!, parseColor("#a2d26b")!, {
      target: "aa",
      mode: "both",
      sizePx: 16,
      weight: 400,
    })!;
    const classes = tailwindFix(fix, 16, 400)!;
    const [text, background] = classes.split(" ").map((c) => parseColor(c)!);
    expect(passesTarget(text, background, "aa", 16, 400)).toBe(true);
  });
});
