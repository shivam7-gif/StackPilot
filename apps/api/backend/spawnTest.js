const { spawn } = require("child_process");
const path = require("path");
const cwd = path.join(__dirname, "src", "services", "../../../../projects");
console.log("cwd resolved", cwd);
const p = spawn("echo hi", { cwd, shell: true });
p.on("error", (err) => {
  console.error("err", err);
});
p.stdout.on("data", (data) => console.log("out:", data.toString()));
