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
    ];
    return libs.reduce((prev, lib) => (
        Object.assign(prev, { [lib]: `commonjs ${lib}` })
    ), {});
}

module.exports = {
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
        loaders: [{
            test: /\.(js|jsx)$/,
            loaders: [
                'babel-loader?cacheDirectory',
                'eslint-loader',
            ],
            exclude: /node_modules/,
        }, {
            test: /\.json$/,
            loader: 'json-loader',
        }, {
            test: /\.less$/,
            loaders: [
                'style-loader',
                'css-loader',
                'less-loader',
            ],
        }, {
            test: /\.(png|gif|ttf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
            loader: 'file-loader',
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
