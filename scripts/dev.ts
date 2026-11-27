import { spawn } from "node:child_process";

const client = spawn("bun", ["run", "dev:client"], {
  stdio: "inherit",
  shell: true,
});

const worker = spawn("bun", ["run", "dev:worker"], {
  stdio: "inherit",
  shell: true,
});

function shutdown() {
  client.kill();
  worker.kill();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

client.on("exit", shutdown);
worker.on("exit", shutdown);
