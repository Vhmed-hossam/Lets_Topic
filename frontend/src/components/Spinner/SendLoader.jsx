import getContrastingTextColor from "../../helpers/GetContrast";

export default function SendLoader({ color }) {
  return (
    <div
      style={{
        width: "20px",
        height: "20px",
        border: "3px solid transparent",
        borderTop: `3px solid ${getContrastingTextColor(color)}`,
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
      }}
    />
  );
}
