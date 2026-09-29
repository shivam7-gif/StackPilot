export const handleProjectSteps = (socket: any) => {
  socket.on("project-logs", ({ projectId }: { projectId: string }) => {
    socket.emit("project-step", "folders");
  });
};