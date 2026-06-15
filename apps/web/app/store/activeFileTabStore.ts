import {create} from "zustand";

type ActiveFileTab = {
  path : string ;
  value : string;
  extension : string
}
type ActiveFileTabStore = {
  activeFileTab : ActiveFileTab | null;
  
  setActiveFileTab : (
    path : string , 
    value : string,
    extension : string
  )=> void;
};

export const useActiveFileTabStore = create<ActiveFileTabStore>((set)=>({
  activeFileTab : null,

  setActiveFileTab : (path , value , extension)=>{
    set({
      activeFileTab :{
        path,
        value , 
        extension
      },
    });
  },
}));