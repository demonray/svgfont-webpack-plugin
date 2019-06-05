组件式使用   <svg-icon type=“home” />

字体文件式使用 

https://github.com/HaoyCn/iconfont-plugin-webpack/blob/master/index.js
https://github.com/jaywcjlove/svgtofont
https://github.com/heuuLZP/svg-icon-map/blob/master/vue-svg-icon/vue.config.js
https://github.com/stowball/webpack-svg-icon-system#readme

按需加载图标
https://github.com/vusion/icon-font-loader

图标库管理

webpack 插件
收集使用的图标，打包时替换成css 或者生成svg-spirit

使用场景：

字体文件方式
1. html vue等组件里面通过class匹配出使用的图标名：
<i class="iconfont iconfont-home" />
<Icon type="iconfont-home" />
2. 配置插件传递图标目录，或者名称数组
['iconfont-home','iconfont-plus']
3. css 文件 ？

svg方式

配置支持：

index.html 插入link样式
入口文件注入样式引用

todo：
内置图表库，项目图标配置


