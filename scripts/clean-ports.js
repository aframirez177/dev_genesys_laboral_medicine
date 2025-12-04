// scripts/clean-ports.js
const { execSync } = require('child_process');

// Puertos críticos del proyecto
const PORTS = [3000, 3001, 8080];

console.log('🧹 Limpiando puertos ocupados...\n');

function cleanPorts() {
  const isWin = process.platform === "win32";

  PORTS.forEach(port => {
    try {
      if (isWin) {
        // Windows
        const result = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
        const lines = result.split('\n').filter(line => line.includes(`LISTENING`));

        lines.forEach(line => {
          const pid = line.trim().split(/\s+/).pop();
          if (pid && !isNaN(pid)) {
            execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
            console.log(`   ✓ Puerto ${port} liberado (PID: ${pid})`);
          }
        });
      } else {
        // Linux/Mac (WSL)
        // Intentar sin sudo primero (funciona en WSL)
        const pids = execSync(`lsof -ti:${port} || true`, { encoding: 'utf8' }).trim();

        if (pids) {
          pids.split('\n').forEach(pid => {
            if (pid) {
              execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
              console.log(`   ✓ Puerto ${port} liberado (PID: ${pid})`);
            }
          });
        } else {
          console.log(`   - Puerto ${port} ya estaba libre`);
        }
      }
    } catch (error) {
      console.log(`   - Puerto ${port} ya estaba libre`);
    }
  });

  console.log('\n✅ Limpieza completa\n');
}

cleanPorts();