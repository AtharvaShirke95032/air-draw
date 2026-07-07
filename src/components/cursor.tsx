
const Cursor = ({selectedColor, cursors}: {selectedColor: string; cursors: any}) => {
  return (
      <div
  style={{
    position: "fixed",
    left: cursors.x,
    top: cursors.y,

    width: 18,
    height: 18,

    borderRadius: "50%",

    background: "rgba(255,255,255,0.08)",

    border: `1px solid ${selectedColor}`,

    backdropFilter: "blur(8px)",

    transform: "translate(-50%, -50%)",

    pointerEvents: "none",

    boxShadow: `
      0 0 10px ${selectedColor},
      0 0 25px ${selectedColor}
    `,

    transition: "border-color 0.15s ease",

    zIndex: 9999,
  }}
/>
  )
}

export default Cursor