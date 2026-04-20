import fs from "fs/promises";
export const handleProjectSteps = (socket : any)=>{
  socket.on("project-logs",({projectId})=>{
    socket.emit("project-step","folders")
  })
}