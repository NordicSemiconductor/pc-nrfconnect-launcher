/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const webpack = require('webpack');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');

const nodeEnv = process.env.NODE_ENV || 'development';
const isProd = nodeEnv === 'production';

function createExternals() {
    // Some libraries, e.g. those with native addons, cannot be bundled
    // by webpack. Adding them as externals so that they are not bundled.
    const libs = [
        'pc-ble-driver-js',
        'serialport',
        '@nordicsemiconductor/nrf-device-lib-js',
        'osx-temperature-sensor',
    ];
    return libs.reduce(
        (prev, lib) => Object.assign(prev, { [lib]: `commonjs ${lib}` }),
        {}
    );
}

module.exports = {
    mode: nodeEnv,
    devtool: isProd ? 'source-map' : 'inline-eval-cheap-source-map',
    entry: {
        app: './src/app',
        shared: './node_modules/pc-nrfconnect-shared/src/index.ts',
        launcher: './src/launcher',
    },
    output: {
        path: path.resolve('dist'),
        publicPath: '../dist/',
        filename: '[name]-bundle.js',
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx|ts|tsx)$/,
                use: [
                    {
                        loader: require.resolve('babel-loader'),
                        options: {
                            cacheDirectory: true,
                            configFile: './babel.config.js',
                        },
                    },
                ],
                exclude: /node_modules\/(?!pc-nrfconnect-shared\/)/,
            },
            {
                test: /\.scss|\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    {
                        loader: 'sass-loader',
                        options: {
                            // eslint-disable-next-line global-require
                            implementation: require('sass'),
                        },
                    },
                ],
            },
            {
                test: /\.(png|gif|ttf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
                loader: require.resolve('file-loader'),
            },
        ],
    },
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        symlinks: false,
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(nodeEnv),
        }),
        new MiniCssExtractPlugin({
            filename: '[name].css',
            chunkFilename: '[id].css',
        }),
        new ESLintPlugin(),
    ],
    externals: createExternals(),
    target: 'electron-renderer',
};
