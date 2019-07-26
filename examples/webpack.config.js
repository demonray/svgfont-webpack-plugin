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
            inject: 'link',
            //inject: 'script',
            fontName: 'iconfont',
            pattern: '**/*.html',
            rules: [{
                match: /<i.*class=".*iconfont-([0-9a-zA-Z_-]*)".*>/,
                ext: /\.html$/
            }],
            iconNames: ['wind','xhs','安全_line'],
            svgsDir: path.join(__dirname, 'icons') // svg file directory
        })
    ]
};
