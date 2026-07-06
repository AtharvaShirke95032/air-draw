interface ToolbarProps {
  selectedColor: string;
  setSelectedColor: (color: string) => void;
  buttonRefs: React.MutableRefObject<
    Record<string, HTMLButtonElement | null>
  >;
}

const COLORS = ["red", "blue", "green", "yellow", "black"];

const Toolbar = ({
  selectedColor,
  setSelectedColor,
  buttonRefs
}: ToolbarProps) => {
  return (
    <div
      style={{
        position: "absolute",
        top: 80,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        gap: 16,
        padding: "10px 18px",
        background: "rgba(30,30,30,0.7)",
        backdropFilter: "blur(12px)",
        borderRadius: 40,
        zIndex: 100,
      }}
    >
      {COLORS.map((color) => (
        <button
          ref={(el) => {
    buttonRefs.current[color] = el;
  }}
          key={color}
          onClick={() => setSelectedColor(color)}
          style={{
            width: 42,
            height: 42,
            borderRadius: "50%",
            border:
              selectedColor === color
                ? "4px solid white"
                : "2px solid white",
            backgroundColor: color,
            cursor: "pointer",
            transform:
              selectedColor === color
                ? "scale(1.2)"
                : "scale(1)",
            transition: "all 0.2s ease",
            boxShadow:
              selectedColor === color
                ? "0 0 12px white"
                : "none",
          }}
        />
      ))}
    </div>
  );
};

export default Toolbar;