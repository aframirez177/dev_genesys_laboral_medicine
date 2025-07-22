// scripts/fix-inline-css-paths.js
const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');

const pagesDir = path.resolve(__dirname, '../dist/pages');
const htmlFiles = glob.sync(`${pagesDir}/**/*.html`);

console.log(`\n🛠️ Iniciando corrección de rutas en CSS inlinado para ${htmlFiles.length} archivos en ${path.relative(process.cwd(), pagesDir)}...`);

let filesModified = 0;

// Expresión regular final: más robusta.
// Busca 'url(' (con posibles espacios), seguido opcionalmente por comillas, y luego 'assets/'.
// Es insensible a mayúsculas/minúsculas (i) y busca todas las ocurrencias (g).
const finalUniversalUrlRegex = /url\(\s*(?!['"]?\.\.\/)(['"]?)assets\//gi;

htmlFiles.forEach(filePath => {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;

        // Reemplaza todas las ocurrencias encontradas en todo el archivo.
        content = content.replace(finalUniversalUrlRegex, (match, quote) => {
            // `quote` captura la comilla simple o doble si existe, para preservarla.
                return `url(${quote}../assets/`;
        });

        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`  ✅ Corregido: ${path.basename(filePath)}`);
            filesModified++;
        }

    } catch (error) {
        console.error(`  ❌ Error procesando ${path.basename(filePath)}:`, error);
    }
});

console.log(`\n🛠️ Corrección completada. Archivos modificados: ${filesModified}`);