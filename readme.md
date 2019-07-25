
# svgicon-webpack-plugin

本插件目的是改善前端项目中使用svg图标及web字体的开发体验。
插件根据配置，在webpack构建时收集项目中使用到到图标，然后根据这些svg图标，生成字体资源。并输出到html。

插件内置大量SVG图标集，同时支持项目本地图标使用
插件最终生成资源包括：

```
iconfont.css
iconfont.eot
iconfont.js
iconfont.less
iconfont.svg
iconfont.symbol.svg
iconfont.ttf
iconfont.woff
iconfont.woff2
```

注意：
1.本插件需与html-webpack-plugin配合使用。
2.svg文件名即为iconName。<symbol>的唯一标识id、font-class 名格式为 `${fontName}-${iconName}`

## Depenance

[html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin)

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
- 默认值: `'script'`
- 可选值 `'link','script'`

#### inject: 'link'

通过font-class方式使用web字体， 插件会将生成的css文件插入index.html。

#### inject: 'script'

symbol方式引用，插件会将生成iconfont.js插入index.html。


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

svg图标文件名，支持定义图标名，iconNames里的图标名称会和插件rules匹配出的图标名合并，生成web字体等资源文件。

### svgsDir

- 类型: `string`
- 默认值: `'link'`

项目svg文件目录，如配置，则插件优先使用此目录里的 `${iconName}.svg` SVG文件。此目录未找到会在插件内置图标集里寻找。