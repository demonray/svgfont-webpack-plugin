
# svgicon-webpack-plugin

插件目的是改善前端项目中使用svg图标，字体文件的开发体验。
插件根据配置，在构建时收集项目中使用的图标，然后根据这些svg图标，生成字体资源。并输出到html
注意：本插件需与html-webpack-plugin配合使用。

## Depenance

html-webpack-plugin

## Installation

### npm

```sh
npm install SvgIcon
```

### run demo

```sh
$ git clone https://github.com/demonray/svgicon.git
$ cd cyeditor
$ npm install
$ npm run dev
```

## Usage

webpack 配置示例子，如下:

```javascript
// webpack.config.js
const  path = require('path');
const  SvgIconWebpackPlugin = require('svgicon-webpack-plugin');
const  HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    // ...
    plugins: [
        new HtmlWebpackPlugin({
            template: 'index.html'
        }),
        new SvgIconWebpackPlugin({
            inject: 'script',
            fontName: 'iconfont',
            pattern: '**/*.html',
            rules: [{
                match: /<i.*class=".*iconfont-([0-9a-zA-Z_-]*)".*>/,
                ext: /\.html$/
            }],
            iconNames: ['wind','xhs'],
            svgsDir: path.join(__dirname, 'icons') // svg file directory
        })]
}

```

## 配置

### inject

- 类型: `string`
- 默认值: `'link'`

inject: 'link' 生成的css文件插入index.html中
inject: 'script' 生成iconfont.js插入index.html中


### fontName

- 类型: `string`
- 默认值: `'iconfont'`

字体文件名称，最终用于生成字体资源文件的文件名。

### pattern

- 类型: `string`
- 必须: `是`

glob options 匹配用于需要搜索的文件，找出使用的图标。

### rules

- 类型: `Array`
- 默认值: `[]`

匹配规则

### iconNames

- 类型: `Array`
- 默认值: `[]`

图标名，支持定义图标名

### svgsDir

- 类型: `string`
- 默认值: `'link'`

项目svg文件目录