const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { plugins } = require('@babel/preset-env/lib/plugins-compat-data');
const CopyPlugin = require('copy-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    entry: {
        main:'./src/main.js',            // Chunk común para todas las páginas 
        index: './src/index.js',
        riesgos: './src/main_matriz_riesgos_profesional.js',
        profesiograma:'./src/main_profesiograma.js',
        examenes:'./src/main_examenes_medicos_ocupacionales.js',
        bateriaPsicosocial: './src/main_bateria_de_riesgo_psicosocial.js',
        analisispuestodetrabajo: './src/main_analisis_puesto_de_trabajo.js',
        perdidacapacidadlaboral: '/src/main_perdida_de_capacidad_laboral.js',
        examenmedicoescolar: '/src/main_examen_medico_escolar.js',
        sst: '/src/main_sst.js'
        
    },
    output: {
        path: path.resolve(__dirname, "../dist"),
        filename: '[name].bundle.js',
        
    },

    resolve: {
        extensions: ['.js'],
    },
    module: {
        rules: [
        {
            test: /\.m?js$/,
            exclude: /node_modules/,
            use: {
            loader: 'babel-loader',
            },
        },
        {
            test: /\.(css|scss)$/i,
            use: [MiniCssExtractPlugin.loader,'css-loader','sass-loader'
            ],
        },
        {
            test: /\.(png|jpe?g|gif|svg)$/i,
            type: 'asset/resource', // Esto es para manejar las imágenes
            generator: {
                filename: 'assets/images/[name][ext][query]'
            }
        },
        {
            test: /\.(woff|woff2)$/,
            type: 'asset/resource', // Cambiamos a asset/resource para manejar fuentes
            generator: {
                filename: 'assets/fonts/[name][ext][query]', // Mantenemos la estructura de carpetas
            }
        }
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
        chunks: ['main','index'],
        inject: true,
        template: './public/index.html',
        filename: './index.html',
        }),
        new HtmlWebpackPlugin({
        inject: true,
        template: './public/pages/Analisis_de_puesto_de_trabajo.html',
        filename: './pages/Analisis_de_puesto_de_trabajo.html',
        }),
        new HtmlWebpackPlugin({
        chunks: ['main', 'bateriaPsicosocial'],
        inject: true,
        template: './public/pages/Bateria_de_riesgo_psicosocial.html',
        filename: './pages/Bateria_de_riesgo_psicosocial.html',
        }),
        new HtmlWebpackPlugin({
        inject: true,
        template: './public/pages/Blog.html',
        filename: './pages/Blog.html',
        }),
        new HtmlWebpackPlugin({
        inject: true,
        template: './public/pages/Contacto.html',
        filename: './pages/Contacto.html',
        }),
        new HtmlWebpackPlugin({
        inject: true,
        template: './public/pages/examen_medico_escolar.html',
        filename: './pages/examen_medico_escolar.html',
        }),
        new HtmlWebpackPlugin({
        chunks:['main','examenes'],
        inject: true,
        template: './public/pages/Examenes_medicos_ocupacionales.html',
        filename: './pages/Examenes_medicos_ocupacionales.html',
        }),
        new HtmlWebpackPlugin({
        inject: true,
        template: './public/pages/Genesys_BI.html',
        filename: './pages/Genesys_BI.html',
        }),
        new HtmlWebpackPlugin({
        inject: true,
        template: './public/pages/Informacion_financiera.html',
        filename: './pages/Informacion_financiera.html',
        }),
        new HtmlWebpackPlugin({
        inject: true,
        template: './public/pages/Informacion_legal.html',
        filename: './pages/Informacion_legal.html',
        }),
        new HtmlWebpackPlugin({
        chunks:['main','riesgos'],
        inject: true,
        template: './public/pages/Matriz_de_riesgos_profesional.html',
        filename: './pages/Matriz_de_riesgos_profesional.html',
        }),
        new HtmlWebpackPlugin({
        inject: true,
        template: './public/pages/Nosotros.html',
        filename: './pages/Nosotros.html',
        }),
        new HtmlWebpackPlugin({
            inject: true,
            template: './public/pages/Perdida_de_capacidad_laboral.html',
            filename: './pages/Perdida_de_capacidad_laboral.html',
            }),
        new HtmlWebpackPlugin({
        chunks:['main','profesiograma'],
        inject: true,
        template: './public/pages/Profesiograma.html',
        filename: './pages/Profesiograma.html',
        }),
        new HtmlWebpackPlugin({
        inject: true,
        template: './public/pages/resultados.html',
        filename: './pages/resultados.html',
        }),
        new HtmlWebpackPlugin({
        inject: true,
        template: './public/pages/Servicios.html',
        filename: './pages/Servicios.html',
        }),
        new HtmlWebpackPlugin({
        inject: true,
        template: './public/pages/SST.html',
        filename: './pages/SST.html',
        }),

        new MiniCssExtractPlugin(),
        new CopyPlugin({
            patterns:[
                {
                    from: path.resolve(__dirname, 'src', 'assets/images'),
                    to: 'assets/images'
                },
                // Eliminamos la copia de fuentes de aquí
            ]
        })
    ],
    optimization: {
        minimize: true,
        minimizer: [
            new CssMinimizerPlugin(),
            new TerserPlugin(),
        ]
    }
};