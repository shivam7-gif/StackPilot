import "./EditorButton.css";
export const EditorButton = ({isActive})=>{
  return(
    <button className = "editorButton"
    style = {{
      color : isActive ? "white":"#959eba",
      backgroundColor : isActive ? "#303242" : "#4a4859"
        }}>
      file.js
    </button>
  )
}