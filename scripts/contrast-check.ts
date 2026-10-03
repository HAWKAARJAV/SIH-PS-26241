function rel(hex: string) {
  const n = hex.replace("#", "");
  const vals = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * vals[0]! + 0.7152 * vals[1]! + 0.0722 * vals[2]!;
}
function ratio(a: string, b: string) {
  const l1 = rel(a);
  const l2 = rel(b);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}
const pairs: [string, string, number, string][] = [
  ["#2A211B", "#FBF6EE", 4.5, "ink on bg"],
  ["#6B5B4E", "#FBF6EE", 4.5, "muted on bg"],
  ["#FFFFFF", "#B8472E", 4.5, "white on primary"],
  ["#FFFFFF", "#2F5D7C", 4.5, "white on info"],
  ["#FFFFFF", "#3F6B49", 4.5, "white on growth"],
  ["#8A5A12", "#FBEBC8", 4.5, "warning on soft"],
  ["#8A5A12", "#FCEFD2", 4.5, "warning on accent soft"],
  ["#A63A3A", "#F8E1E1", 4.5, "danger on soft"],
  ["#2F5D7C", "#FBF6EE", 3, "focus"],
];
let failed = false;
for (const [fg, bg, min, name] of pairs) {
  const value = ratio(fg, bg);
  if (value < min) {
    failed = true;
    console.error(`${name} ${value.toFixed(2)} < ${min}`);
  }
}
if (failed) process.exit(1);
console.warn("contrast ok");
