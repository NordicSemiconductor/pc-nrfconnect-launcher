/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const externals = Object.fromEntries(
    [
        'pc-ble-driver-js',
        'serialport',
        '@nordicsemiconductor/nrf-device-lib-js',
        'osx-temperature-sensor',
    ].map(lib => [lib, `commonjs ${lib}`])
);

module.exports = (_, argv) => {
    const mode = argv.mode ?? 'production';
    const isProd = mode === 'production';

    return {
        mode,
        devtool: isProd ? 'source-map' : 'cheap-eval-source-map',
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
                                configFile:
                                    './node_modules/pc-nrfconnect-shared/config/babel.config.js',
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
            new MiniCssExtractPlugin({
                filename: '[name].css',
                chunkFilename: '[id].css',
            }),
        ],
        externals,
        target: 'electron-renderer',
    };
};
