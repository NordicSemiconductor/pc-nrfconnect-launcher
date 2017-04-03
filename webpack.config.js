const webpack = require('webpack');
const path = require('path');
const dependencies = require('./package.json').dependencies;

const nodeEnv = process.env.NODE_ENV || 'development';
const isProd = nodeEnv === 'production';

function createExternals() {
    // Add production dependencies as externals, but keep the require behavior.
    // http://jlongster.com/Backend-Apps-with-Webpack--Part-I
    const externals = {};
    Object.keys(dependencies).forEach(dependency => {
        externals[dependency] = `commonjs ${dependency}`;
    });
    return externals;
}

module.exports = {
    devtool: isProd ? 'hidden-source-map' : 'inline-eval-cheap-source-map',
    entry: {
        app: './lib/windows/app/index',
        launcher: './lib/windows/launcher/index',
    },
    output: {
        path: path.resolve('dist'),
        publicPath: '../../../dist/',
        filename: '[name]-window-bundle.js',
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

