interface ToolbarProps {
  selectedColor: string;
  setSelectedColor: (color: string) => void;
  buttonRefs: React.MutableRefObject<Record<string, HTMLButtonElement | null>>;
}

// const COLORS = ["red", "blue", "green", "yellow", "black"];
// const COLORS = [
//   "#FF3B30", // soft red (system red)
//   "#FF9500", // orange
//   "#FFCC00", // warm yellow
//   "#34C759", // system green
//   "#007AFF", // system blue
//   "#AF52DE", // purple
//   "#000000", // black (ink)
//   "#8E8E93", // soft gray
// ];

const COLORS = [
  "#E63946", // soft red
  "#F4A261", // sand orange
  "#E9C46A", // warm yellow
  "#2A9D8F", // teal green
  "#25b65c", // muted blue
  "#9B5DE5", // soft purple
  "#222222", // graphite black
  "#ffffff", // light gray
  
];
const Toolbar = ({ selectedColor, setSelectedColor, buttonRefs }: ToolbarProps) => {
  return (
    <div
      style={{
        position: "fixed",
        top: 30,
        left: "50%",
        transform: "translateX(-50%)",

        display: "flex",
        gap: 14,
        padding: "10px 14px",

        background: "rgba(255, 255, 255, 0.08)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",

        borderRadius: 999,
        border: "1px solid rgba(255, 255, 255, 0.12)",

        boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
        zIndex: 100,
      }}
    >
      {COLORS.map((color) => (
        <button
          key={color}
          ref={(el) => {
            buttonRefs.current[color] = el;
          }}
          onClick={() => setSelectedColor(color)}
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",

            backgroundColor: color,

            border:
              selectedColor === color
                ? "2px solid rgba(255,255,255,0.9)"
                : "2px solid rgba(255,255,255,0.2)",

            boxShadow:
              selectedColor === color
                ? "0 0 18px rgba(255,255,255,0.6)"
                : "0 4px 10px rgba(0,0,0,0.25)",

            transform: selectedColor === color ? "scale(1.15)" : "scale(1)",

            transition: "all 0.2s ease",

            cursor: "pointer",
            outline: "none",
          }}
        />
      ))}
    </div>
  );
};

export default Toolbar;