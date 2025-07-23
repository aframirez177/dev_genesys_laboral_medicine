const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { plugins } = require("@babel/preset-env/lib/plugins-compat-data");
const CopyPlugin = require("copy-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
/* const PreloadWebpackPlugin = require("preload-webpack-plugin"); */
const TerserPlugin = require("terser-webpack-plugin");
const SitemapPlugin = require("sitemap-webpack-plugin").default;
const BeastiesPlugin = require("beasties-webpack-plugin");

const websiteBaseUrl = "https://www.genesyslm.com.co"; // ¡TU DOMINIO REAL!
const paths = [
  "/", // Para index.html
  "/pages/Analisis_de_puesto_de_trabajo.html",
  "/pages/Bateria_de_riesgo_psicosocial.html",
  "/pages/Blog.html", // Asumiendo que tienes un Blog.html listado
  "/pages/Contacto.html",
  "/pages/Enrollment.html",
  "/pages/Examenes_medicos_ocupacionales.html",
  "/pages/Genesys_BI.html",
  "/pages/Informacion_financiera.html",
  "/pages/Informacion_legal.html",
  "/pages/Matriz_de_riesgos_profesional.html",
  "/pages/Nosotros.html",
  "/pages/Perdida_de_capacidad_laboral.html",
  "/pages/Profesiograma.html",
  "/pages/SST.html",
  "/pages/examen_medico_escolar.html",
  "/pages/resultados.html",
  // Añade CUALQUIER OTRA PÁGINA que quieras incluir
];

module.exports = {
  entry: {
    main: "./src/main.js", // Chunk común para todas las páginas
    index: "./src/index.js",
    riesgos: "./src/main_matriz_riesgos_profesional.js",
    profesiograma: "./src/main_profesiograma.js",
    examenes: "./src/main_examenes_medicos_ocupacionales.js",
    bateriaPsicosocial: "./src/main_bateria_de_riesgo_psicosocial.js",
    analisispuestodetrabajo: "./src/main_analisis_puesto_de_trabajo.js",
    perdidacapacidadlaboral: "./src/main_perdida_de_capacidad_laboral.js",
    examenmedicoescolar: "./src/main_examen_medico_escolar.js",
    sst: "./src/main_sst.js",
    nosotros: "./src/main_nosotros.js",
    informacionlegal: "./src/main_informacion_legal.js",
    enrollment: "./src/main_enrollment.js",
    genesysbi: "./src/main_genesys_bi.js",
    diagnosticointeractivo: "./src/main_diagnostico_interactivo.js",
    resultados: "./src/main_resultados.js",
  },
  output: {
    path: path.resolve(__dirname, "../dist"),
    filename: "[name].bundle.js",
  },

  resolve: {
    extensions: [".js"],
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.(css|scss)$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
      },
      {
        test: /\.(png|jpe?g|gif|svg|webp)$/i,
        type: "asset/resource", // Esto es para manejar las imágenes
        generator: {
          filename: "assets/images/[name][ext][query]",
        },
      },
      {
        test: /\.(woff|woff2)$/,
        type: "asset/resource", // Cambiamos a asset/resource para manejar fuentes
        generator: {
          filename: "assets/fonts/[name][ext][query]", // Mantenemos la estructura de carpetas
        },
      },
      {
        test: /\.pdf$/,
        type: "asset/resource",
        generator: {
          filename: "assets/pdf/[name][ext][query]",
        },
      },
      {
        test: /\.ttf$/i, // Añadido para TrueType Fonts
        type: "asset/resource",
        generator: {
          filename: "assets/fonts/[name][ext][query]",
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      chunks: ["main", "index"],
      inject: true,
      template: "./public/index.html",
      filename: "./index.html",
    }),
    new HtmlWebpackPlugin({
      chunks: ["main", "analisispuestodetrabajo"],
      inject: true,
      template: "./public/pages/Analisis_de_puesto_de_trabajo.html",
      filename: "./pages/Analisis_de_puesto_de_trabajo.html",
    }),
    new HtmlWebpackPlugin({
      chunks: ["main", "bateriaPsicosocial"],
      inject: true,
      template: "./public/pages/Bateria_de_riesgo_psicosocial.html",
      filename: "./pages/Bateria_de_riesgo_psicosocial.html",
    }),
    new HtmlWebpackPlugin({
      inject: true,
      template: "./public/pages/Blog.html",
      filename: "./pages/Blog.html",
    }),
    new HtmlWebpackPlugin({
      inject: true,
      template: "./public/pages/Contacto.html",
      filename: "./pages/Contacto.html",
    }),
    new HtmlWebpackPlugin({
      chunks: ["main", "enrollment"],
      inject: true,
      template: "./public/pages/Enrollment.html",
      filename: "./pages/Enrollment.html",
    }),
    new HtmlWebpackPlugin({
      chunks: ["main", "examenmedicoescolar"],
      inject: true,
      template: "./public/pages/examen_medico_escolar.html",
      filename: "./pages/examen_medico_escolar.html",
    }),
    new HtmlWebpackPlugin({
      chunks: ["main", "examenes"],
      inject: true,
      template: "./public/pages/Examenes_medicos_ocupacionales.html",
      filename: "./pages/Examenes_medicos_ocupacionales.html",
    }),
    new HtmlWebpackPlugin({
      chunks: ["main", "genesysbi"],
      inject: true,
      template: "./public/pages/Genesys_BI.html",
      filename: "./pages/Genesys_BI.html",
    }),
    new HtmlWebpackPlugin({
      inject: true,
      template: "./public/pages/Informacion_financiera.html",
      filename: "./pages/Informacion_financiera.html",
    }),
    new HtmlWebpackPlugin({
      chunks: ["main", "informacionlegal"],
      inject: true,
      template: "./public/pages/Informacion_legal.html",
      filename: "./pages/Informacion_legal.html",
    }),
    new HtmlWebpackPlugin({
      chunks: ["main", "riesgos"],
      inject: true,
      template: "./public/pages/Matriz_de_riesgos_profesional.html",
      filename: "./pages/Matriz_de_riesgos_profesional.html",
    }),
    new HtmlWebpackPlugin({
      chunks: ["main", "nosotros"],
      inject: true,
      template: "./public/pages/Nosotros.html",
      filename: "./pages/Nosotros.html",
    }),
    new HtmlWebpackPlugin({
      chunks: ["main", "perdidacapacidadlaboral"],
      inject: true,
      template: "./public/pages/Perdida_de_capacidad_laboral.html",
      filename: "./pages/Perdida_de_capacidad_laboral.html",
    }),
    new HtmlWebpackPlugin({
      chunks: ["main", "profesiograma"],
      inject: true,
      template: "./public/pages/Profesiograma.html",
      filename: "./pages/Profesiograma.html",
    }),
    new HtmlWebpackPlugin({
      chunks: ["main", "resultados"],
      inject: true,
      template: "./public/pages/resultados.html",
      filename: "./pages/resultados.html",
      excludeChunks: ['main.css'] // Excluimos el CSS global
    }),
    new HtmlWebpackPlugin({
      chunks: ["main", "sst"],
      inject: true,
      template: "./public/pages/SST.html",
      filename: "./pages/SST.html",
    }),
    new HtmlWebpackPlugin({
      chunks: ["main", "diagnosticointeractivo"],
      inject: true,
      template: "./public/pages/diagnostico_interactivo.html",
      filename: "./pages/diagnostico_interactivo.html",
    }),
    /* new PreloadWebpackPlugin({
      rel: "preload",
      // En lugar de 'include: "font"', prueba incluyendo los chunks que
      // generan los archivos de fuentes (si los tienes definidos)
      // o simplemente precarga todo y deja que el navegador decida.
      // Para fonts, usualmente vienen con el CSS.
      // Vamos a intentar precargar los tipos de archivo explícitamente.
      fileWhitelist: [/(\/|\\)assets(\/|\\)fonts(\/|\\).*\.woff2?$/i],
      as(entry) {
        if (/\.woff2?$/i.test(entry)) return 'font';
    },
      // Filtra explícitamente por extensión de archivo
      include: "allAssets", // Considera todos los assets generados por Webpack
      
      crossorigin: "anonymous",
    }), */
    new MiniCssExtractPlugin(),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "src", "assets/images"),
          to: "assets/images",
        },
        {
          from: path.resolve(__dirname, "src", "assets/pdf"),
          to: "assets/pdf",
        },
        {from: path.resolve(__dirname, "public", "robots.txt"), // Asume que está en client/public/robots.txt
          to: "robots.txt",
        },

        {from: path.resolve(__dirname, "public", ".htaccess"), 
          to: ".htaccess",
          toType: "file"
        }
        // Eliminamos la copia de fuentes de aquí
      ],
    }),
    new SitemapPlugin({
      base: websiteBaseUrl,
      paths, // El array de rutas definido arriba
      options: {
        filename: "sitemap.xml", // Nombre del archivo de salida
        lastmod: true, // Añade fecha de última modificación (basada en build time)
        changefreq: "weekly", // Frecuencia por defecto
        priority: 0.7, // Prioridad por defecto
        // Puedes configurar prioridades/frecuencias específicas por ruta si quieres
        // skipgzip: true // Descomenta si tu servidor ya comprime los sitemaps
      },
    }),
    new BeastiesPlugin({
            preload: 'media',     // O swap
            pruneSource: false,   // <-- NO podar
            fonts: false,        // Dejar que Beasties maneje fuentes
            keyframes: 'critical',
            noscriptFallback: true,
            compress: true,
            logLevel: 'info',    // Para ver qué hace
            additionalStylesheets: [
              'main*.css'
              // NO listes los CSS específicos aquí (index.css, sst.css)
              // porque Beasties los tomará del <link> de cada HTML.
              // Solo necesitamos asegurarnos de que SIEMPRE vea el 'main.css'.
          ],
        })

  ],
  optimization: {
    minimize: true,
    minimizer: [new CssMinimizerPlugin(), new TerserPlugin()],
  },
};