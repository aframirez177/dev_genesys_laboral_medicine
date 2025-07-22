// scripts/fix-inline-css-paths.js
const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');

const pagesDir = path.resolve(__dirname, '../dist/pages');
const htmlFiles = glob.sync(`${pagesDir}/**/*.html`);

console.log(`\n🛠️ Iniciando corrección de rutas en CSS inlinado para ${htmlFiles.length} archivos en ${path.relative(process.cwd(), pagesDir)}...`);

let filesModified = 0;

htmlFiles.forEach(filePath => {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;

        // Expresión regular mejorada para buscar DENTRO de etiquetas <style>
        const styleTagRegex = /(<style[^>]*>)([\s\S]*?)(<\/style>)/gi;
        const urlInStyleTagRegex = /url\((?!['"]?\.\.\/)(['"]?)assets\//g;

        // Expresión regular para buscar DENTRO de atributos style="..."
        const inlineStyleRegex = /style="([^"]*)"/gi;
        const urlInInlineStyleRegex = /url\((?!['"]?\.\.\/)(['"]?)assets\//g;

        let modified = false;

        // 1. Corrección dentro de etiquetas <style>
        content = content.replace(styleTagRegex, (match, styleTagStart, styleContent, styleTagEnd) => {
            const newStyleContent = styleContent.replace(urlInStyleTagRegex, (urlMatch, quote) => {
                modified = true;
                return `url(${quote}../assets/`;
            });
            return styleTagStart + newStyleContent + styleTagEnd;
        });

        // 2. Corrección dentro de atributos style="..."
        content = content.replace(inlineStyleRegex, (match, styleAttributeContent) => {
            const newStyleAttributeContent = styleAttributeContent.replace(urlInInlineStyleRegex, (urlMatch, quote) => {
                modified = true;
                return `url(${quote}../assets/`;
            });
            return `style="${newStyleAttributeContent}"`;
        });

        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`  ✅ Corregido: ${path.basename(filePath)}`);
            filesModified++;
        }

    } catch (error) {
        console.error(`  ❌ Error procesando ${path.basename(filePath)}:`, error);
    }
});

console.log(`\n🛠️ Corrección completada. Archivos modificados: ${filesModified}`);