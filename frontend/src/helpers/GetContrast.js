export function hexToRgb(hex) {
  const result = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.exec(hex);
  if (!result) return null;

  let r, g, b;
  const hexDigits = result[1];

  if (hexDigits.length === 3) {
    r = parseInt(hexDigits.charAt(0) + hexDigits.charAt(0), 16);
    g = parseInt(hexDigits.charAt(1) + hexDigits.charAt(1), 16);
    b = parseInt(hexDigits.charAt(2) + hexDigits.charAt(2), 16);
  } else {
    r = parseInt(hexDigits.substring(0, 2), 16);
    g = parseInt(hexDigits.substring(2, 4), 16);
    b = parseInt(hexDigits.substring(4, 6), 16);
  }
  return { r, g, b };
}
export default function getContrastingTextColor(backgroundColor) {
  const rgb = hexToRgb(backgroundColor.trim());
  if (!rgb) {
    console.error("Invalid color format:", backgroundColor);
    return "black";
  }
  const brightness = 0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b;
  return brightness > 128 ? "black" : "white";
}
