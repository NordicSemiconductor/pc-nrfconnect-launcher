const webpack = require('webpack');
const path = require('path');

const nodeEnv = process.env.NODE_ENV || 'development';
const isProd = nodeEnv === 'production';

function createExternals() {
    // Some libraries, e.g. those with native addons, cannot be bundled
    // by webpack. Adding them as externals so that they are not bundled.
    const libs = [
        'pc-ble-driver-js',
        'pc-nrfjprog-js',
        'serialport',
        'usb',
        'nrf-device-setup',
        'osx-temperature-sensor',
    ];
    return libs.reduce((prev, lib) => (
        Object.assign(prev, { [lib]: `commonjs ${lib}` })
    ), {});
}

module.exports = {
    mode: nodeEnv,
    devtool: isProd ? 'hidden-source-map' : 'inline-eval-cheap-source-map',
    entry: {
        app: './lib/windows/app/index',
        launcher: './lib/windows/launcher/index',
    },
    output: {
        path: path.resolve('dist'),
        publicPath: '../dist/',
        filename: '[name]-bundle.js',
    },
    module: {
        rules: [{
            test: /\.(js|jsx)$/,
            use: [{
                loader: require.resolve('babel-loader'),
                options: {
                    cacheDirectory: true,
                },
            }, {
                loader: require.resolve('eslint-loader'),
            }],
            exclude: /node_modules/,
        }, {
            test: /\.scss|\.css$/,
            loaders: [
                require.resolve('style-loader'),
                require.resolve('css-loader'),
                require.resolve('sass-loader'),
            ],
        }, {
            test: /\.(png|gif|ttf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
            loader: require.resolve('file-loader'),
        }],
    },
    resolve: {
        extensions: ['.js', '.jsx'],
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(nodeEnv),
        }),
    ],
    externals: createExternals(),
    target: 'electron-renderer',
};
