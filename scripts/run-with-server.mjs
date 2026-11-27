import { spawn } from "node:child_process";

const targetScript = process.argv[2];
if (!targetScript) {
  console.error("Usage: node scripts/run-with-server.mjs <script-path>");
  process.exit(1);
}

const port = process.env.VERIFY_PORT ?? "3000";
const baseUrl = `http://127.0.0.1:${port}`;

async function waitForServer(url, timeoutMs = 30_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.status < 500) return;
    } catch {
      // keep polling
    }
    await new Promise((resolve) => setTimeout(resolve, 400));
  }
  throw new Error(`Timed out waiting for Next.js server at ${url}`);
}

const isWin = process.platform === "win32";
const server = spawn(
  isWin ? "cmd.exe" : "npx",
  isWin ? ["/c", "npx", "next", "start", "-p", port, "-H", "127.0.0.1"] : ["next", "start", "-p", port, "-H", "127.0.0.1"],
  {
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env },
  },
);

server.stderr.on("data", (chunk) => {
  const text = chunk.toString();
  if (text.trim()) process.stderr.write(`[server] ${text}`);
});

let exitCode = 1;
try {
  await waitForServer(baseUrl);
  const runner = spawn(process.execPath, [targetScript], {
    stdio: "inherit",
    env: { ...process.env, VERIFY_BASE_URL: baseUrl },
  });
  exitCode = await new Promise((resolve) => {
    runner.on("close", (code) => resolve(code ?? 1));
  });
} finally {
  if (isWin && server.pid) {
    spawn("taskkill", ["/pid", String(server.pid), "/t", "/f"], {
      stdio: "ignore",
    });
  } else {
    server.kill("SIGTERM");
  }
}

process.exit(exitCode);
