var path = require('path');
var SvgIconWebpackPlugin = require('..');
var  HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './index.js',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist')
    },
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        compress: true,
        port: 9000,
        hot: true
    },
    module: {
        rules: [{
                test: /\.css$/,
                loader: 'style-loader!css-loader'
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'index.html'
        }),
        new SvgIconWebpackPlugin({
            pattern: '**/*',
            dist: path.join(__dirname, 'dist/fonts'),
            rules: [{
                match: /<i.*class=".*iconfont-([0-9a-zA-Z_-]*)".*>/,
                ext: /\.html$/
            }],
            //inject: 'link',
            inject: 'style',
        })
    ]
};
