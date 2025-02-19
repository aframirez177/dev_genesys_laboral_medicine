// scripts/clean-ports.js
const { execSync } = require('child_process');

const PORTS = [3000, 5173];

function cleanPorts() {
  const isWin = process.platform === "win32";
  
  PORTS.forEach(port => {
    try {
      if (isWin) {
        // Windows
        const result = execSync(`netstat -ano | findstr :${port}`);
        const pid = result.toString().split(' ').filter(Boolean).pop();
        if (pid) {
          execSync(`taskkill /F /PID ${pid}`);
          console.log(`✓ Puerto ${port} liberado (PID: ${pid})`);
        }
      } else {
        // Linux/Mac
        execSync(`sudo kill -9 $(sudo lsof -t -i:${port}) || true`);
        console.log(`✓ Puerto ${port} liberado`);
      }
    } catch (error) {
      console.log(`- Puerto ${port} ya estaba libre`);
    }
  });
}

cleanPorts();