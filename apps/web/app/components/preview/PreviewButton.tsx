import {ActivePreviewStore} from "@/store/activePreviewStore";

export default function PreviewButton(){
  const openPreview = ActivePreviewStore((state)=> state.openPreview);

  const handlePreview = async ()=>{
    openPreview("http://localhost:5173");
  };
  return(
    <>
    <button onClick = {handlePreview}>
    Preview
    </button>
    </>
  )
}