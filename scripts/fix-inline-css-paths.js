// scripts/fix-inline-css-paths.js
const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');

const pagesDir = path.resolve(__dirname, '../dist/pages'); // Directorio de las páginas con rutas a corregir
const htmlFiles = glob.sync(`${pagesDir}/**/*.html`); // Encuentra todos los HTML en dist/pages/

console.log(`\n🛠️ Iniciando corrección de rutas en CSS inlinado para ${htmlFiles.length} archivos en ${path.relative(process.cwd(), pagesDir)}...`);

let filesModified = 0;

htmlFiles.forEach(filePath => {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;

        // Expresión regular para encontrar etiquetas <style> y reemplazar dentro de ellas
        // Busca url(assets/ pero no url(../assets/
        const regex = /(<style[^>]*>)([\s\S]*?)(<\/style>)/gi;
        const urlRegex = /url\((?!['"]?\.\.\/)(['"]?)assets\//g; // Busca url(assets/ o url('assets/ o url("assets/ pero NO url(../assets/

        let modified = false;
        content = content.replace(regex, (match, styleTagStart, styleContent, styleTagEnd) => {
            // Solo reemplaza dentro del contenido de la etiqueta style
            const newStyleContent = styleContent.replace(urlRegex, (urlMatch, quote) => {
                modified = true;
                // Añade ../ después del paréntesis y la comilla opcional
                return `url(${quote}../assets/`;
            });
            return styleTagStart + newStyleContent + styleTagEnd;
        });

        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`  ✅ Corregido: ${path.basename(filePath)}`);
            filesModified++;
        } else {
            // console.log(`  ℹ️ Sin cambios: ${path.basename(filePath)}`); // Descomenta si quieres ver todos los archivos
        }

    } catch (error) {
        console.error(`  ❌ Error procesando ${path.basename(filePath)}:`, error);
    }
});

console.log(`\n🛠️ Corrección completada. Archivos modificados: ${filesModified}`);