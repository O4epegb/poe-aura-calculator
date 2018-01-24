const path = require('path');
const webpack = require('webpack');
// const precss = require('precss');
const autoprefixer = require('autoprefixer');
const nodeExternals = require('webpack-node-externals');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const isProduction = process.env.NODE_ENV === 'production';

const plugins = [new ExtractTextPlugin('[name].css')];

if (isProduction) {
    plugins.push(
        new webpack.LoaderOptionsPlugin({
            minimize: true,
            options: {
                context: __dirname
            }
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
        }),
        new webpack.optimize.UglifyJsPlugin({
            compressor: {
                warnings: false
            }
        })
    );
}

const tsRule = {
    test: /\.tsx?$/,
    use: [
        {
            loader: 'ts-loader',
            options: {
                compilerOptions: {
                    noEmit: false
                }
            }
        }
    ]
};

const imageRuleFactory = options => {
    return {
        test: /\.(png|jpg|jpeg|svg|gif)$/,
        use: [
            {
                loader: 'url-loader',
                options: Object.assign(
                    {
                        limit: '10000',
                        name: '[name].[ext]'
                    },
                    options
                )
            },
            {
                loader: 'image-webpack-loader',
                options: {
                    bypassOnDebug: true,
                    gifsicle: {
                        interlaced: false
                    },
                    optipng: {
                        optimizationLevel: 7
                    },
                    pngquant: {
                        quality: '65-90',
                        speed: 4
                    },
                    mozjpeg: {
                        progressive: true,
                        quality: 65
                    }
                }
            }
        ]
    };
};

const clientConfig = {
    entry: {
        client: './src/client/index.tsx'
    },
    output: {
        path: path.resolve(__dirname, 'build/static'),
        filename: '[name].js',
        libraryTarget: 'umd'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.css', '.styl']
    },
    plugins: plugins,
    module: {
        rules: [
            imageRuleFactory({
                publicPath: '/static/'
            }),
            tsRule,
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        {
                            loader: 'css-loader',
                            options: {
                                minimize: true
                            }
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                plugins: loader => [autoprefixer],
                                sourceMap: true
                            }
                        }
                    ]
                })
            },
            {
                test: /\.styl$/,
                loader: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        {
                            loader: 'css-loader',
                            options: {
                                minimize: true
                            }
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                plugins: loader => [autoprefixer],
                                sourceMap: true
                            }
                        },
                        {
                            loader: 'stylus-loader'
                        }
                    ]
                })
            }
        ]
    },
    devtool: 'source-map'
};

const serverConfig = {
    entry: {
        server: './src/server/index.tsx'
    },
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: '[name].js',
        libraryTarget: 'commonjs2'
    },
    target: 'node',
    node: {
        __dirname: false
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx']
    },
    plugins: plugins.concat(
        new CopyWebpackPlugin([
            {
                context: 'src/assets',
                from: '**/*',
                to: './assets/'
            }
        ])
    ),
    externals: [nodeExternals()],
    module: {
        rules: [
            imageRuleFactory({
                outputPath: '/static/'
            }),
            tsRule
        ]
    }
};

module.exports = [clientConfig, serverConfig];
