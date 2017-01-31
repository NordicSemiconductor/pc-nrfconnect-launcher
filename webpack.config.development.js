const webpack = require('webpack');
const path = require('path');
const fs = require('fs');

// TODO: Replace with package.json dependencies for production
// Add all node modules as externals, but keep the require behavior.
// http://jlongster.com/Backend-Apps-with-Webpack--Part-I
function createExternals(moduleDirectories) {
    const externals = {};
    moduleDirectories.forEach(directory => {
        fs.readdirSync(directory)
            .filter(x => ['.bin'].indexOf(x) === -1)
            .forEach(mod => {
                externals[mod] = `commonjs ${mod}`;
            });
    });
    return externals;
}

const config = {
    devtool: 'inline-eval-cheap-source-map',
    entry: [
        './lib/index',
    ],
    output: {
        path: path.resolve('dist'),
        publicPath: './dist/',
        filename: 'bundle.js',
    },
    module: {
        loaders: [{
            test: /\.(js|jsx)$/,
            loader: 'babel-loader?cacheDirectory',
            exclude: /node_modules/,
        }, {
            test: /\.json$/,
            loader: 'json-loader',
        }, {
            test: /\.less$/,
            loader: 'style-loader!css-loader!less-loader',
        }, {
            test: /\.(png|gif|ttf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
            loader: 'file-loader',
        }],
    },
    resolve: {
        modules: [
            path.resolve(__dirname, 'node_modules'),
        ],
        extensions: ['.js', '.jsx', '.json'],
    },
    plugins: [
        new webpack.NamedModulesPlugin(),
    ],
    externals: createExternals([
        `${__dirname}/node_modules`,
    ]),
    target: 'electron-renderer',
};

module.exports = config;
