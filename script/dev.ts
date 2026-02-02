import { execSync, spawn } from "child_process";

const PORT = 5000;

try {
    console.log(`Checking for processes on port ${PORT}...`);
    const output = execSync(`netstat -ano | findstr LISTENING | findstr :${PORT}`, { encoding: 'utf8' });
    const lines = output.split('\n').filter(l => l.trim());

    for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && !isNaN(Number(pid))) {
            console.log(`Killing process ${pid} on port ${PORT}...`);
            try {
                execSync(`taskkill /F /PID ${pid} /T`);
            } catch (e) {
                // Ignore errors if process already exited
            }
        }
    }
} catch (e) {
    // netstat returns 1 if no match found, which is fine
    console.log(`No processes found on port ${PORT}.`);
}

console.log("Starting development server...");
const child = spawn("tsx", ["server/index.ts"], {
    stdio: "inherit",
    env: { ...process.env, NODE_ENV: "development" },
    shell: true
});

child.on("exit", (code) => {
    process.exit(code || 0);
});
