import { BeforeMount, Editor  } from "@monaco-editor/react";
import { on } from "events";
import dynamic from "next/dynamic";

export default function EditorPanel(){
  const Editor = dynamic(()=> import ("@monaco-editor/react"),{ssr : false});
   const handleBeforeMount: BeforeMount = (monaco) => {
    // Enable full TS/JS language features
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ESNext,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      esModuleInterop: true,
      jsx: monaco.languages.typescript.JsxEmit.React,
      reactNamespace: "React",
      allowJs: true,
      typeRoots: ["node_modules/@types"],
    });
}
// const hanldemount : onMount = (editor , monaco)=>{
//   editor.onDidcangeModelContent((event)=>{
//     const model = editor.getModel();
//     if(!model) return;

//     for( const change of event.changes){
//       if(change.exist == ">"){
//         const position = editor.getPosition();
//         if(!position) continue;

//         const lineContent = model.getLineContent(position.lineNumber);
//         const textBeforeCursor = linecontent.substring(0,position.column-1);
//         const open TageMatch
//       }
//     }
//   })
// }
return (
  <Editor
  height="100%"
  defaultLanguage="typescript"
  defaultValue="//start coding"
  theme="vs-dark"
  beforeMount = {handleBeforeMount}
  options={{
    fontSize : 13,
    fontFamily:"Jetbrains Mono,Fira Code , monospace",
    minimap : {enabled : false},
    scrollBeyondLastLine : false,
    lineNumbers:"on",
    renderLineHighlight:"line",
    padding:{top : 12},
    tabSize : 2,
  }}
  />
)
}
