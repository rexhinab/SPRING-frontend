const path = require('path');
const outputDir = path.resolve(__dirname, "dist");
const libraryName = "SPRING";
const webpack = require("webpack");
const CopyPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    mode: "production",
    entry: './index.ts',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.scss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: "css-loader"
                    },
                    "sass-loader"
                ]
            }
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        path: outputDir,
        filename: libraryName + ".js"
    },
    devServer:
    {
        contentBase: outputDir,
        compress: true,
        port: 7000
    },
    performance: { hints: false },
    plugins: [
        new CopyPlugin({
            patterns: [
                {
                    from: './*.html',
                    to: outputDir,
                    toType: 'dir'
                },
                {
                    from: './*.ico',
                    to: outputDir,
                    toType: 'dir'
                },
                {
                    from: "./media",
                    to: path.resolve(outputDir, "media"),
                    toType: "dir"
                }
            ],
        }),

        new MiniCssExtractPlugin({
            filename: "./css/" + libraryName  + ".min.css",
            chunkFilename: "[name].css"
        }),

        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery"
        })
    ]
};