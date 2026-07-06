import Camera from "./components/Camera";

function App() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "#121212",
      }}
    >
      <Camera />
    </div>
  );
}

export default App;