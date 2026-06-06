import "./EditorButton.css";
export const EditorButton = ({ isActive }: { isActive: boolean }) => {
  function handleClick() {
  }
  return (
    <button
      className="editorButton"
      style={{
        color: isActive ? "white" : "#959eba",
        backgroundColor: isActive ? "#303242" : "#4a4859",
      }}
      onClick={handleClick}
    >
      file.js
    </button>
  );
};
