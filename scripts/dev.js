// Arranca `next dev` mostrando además la dirección de la red local, para
// poder abrir la app desde el móvil (misma WiFi) sin buscar la IP a mano.
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");

const PUERTO = process.env.PORT || 3000;

function ipLocal() {
  const interfaces = os.networkInterfaces();
  for (const nombre of Object.keys(interfaces)) {
    for (const iface of interfaces[nombre] ?? []) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return null;
}

const ip = ipLocal();
if (ip) {
  console.log(`  \x1b[36m📱 Red local:\x1b[0m   http://${ip}:${PUERTO}  (para abrir desde el móvil en la misma WiFi)\n`);
} else {
  console.log("  ⚠ No se ha encontrado una IP de red local — ¿estás conectado a alguna red?\n");
}

const nextCli = path.join(__dirname, "..", "node_modules", "next", "dist", "bin", "next");
const next = spawn(process.execPath, [nextCli, "dev"], { stdio: "inherit" });
next.on("exit", (code) => process.exit(code ?? 0));
