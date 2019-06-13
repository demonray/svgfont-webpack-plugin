require("colors-cli/toxic");
const color = require('colors-cli');
const util = require('util');
const async = require('async');
const fs = require('fs');
const fsextra = require('fs-extra');
const path = require('path');
const create = require('../lib');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const prettyError = require('../lib/errors.js');
const glob = util.promisify(require('glob'));
const tempSvgDir = path.resolve('../tmpsvg');

const pluginName = 'SvgIconWebpackPlugin'
class SvgIconWebpackPlugin {

    constructor(options = {}) {
        const defaultOptions = {
            inject: 'link',
            globOptions: {
                nodir: true
            },
            dist: path.join(process.cwd(), "fonts"),
            fontName: "iconfont",
            rules: [],
            svgIcons: []
        }
        this.options = Object.assign(defaultOptions, options)
        this.svgIcons = this.options.svgIcons
    }

    apply(compiler) {
        let generateFontsPromise;
        this.fontsPath = path.relative(compiler.options.output.path, this.options.dist);
        compiler.hooks.make.tapAsync(pluginName, (compilation, callback) => {
            generateFontsPromise = this.getAllFiles(compiler, compilation)
                .then(files => {
                    const rules = this.options.rules;
                    const srcs = {}
                    files.forEach(file => {
                        let ruleItem = rules.find(rule => rule.ext.test(file))
                        if (ruleItem) {
                            const src = path.resolve(file)
                            return srcs[src] = ruleItem
                        }
                    })
                    return srcs
                })
                .then((srcs) => {
                    return async.mapValuesLimit(srcs, 2, function (file, key, cb) {
                        fs.readFile(key, 'utf-8', cb);
                    }, (err, results) => {
                        if (err) {
                            compilation.errors.push(prettyError(err, compiler.context).toString());
                        }
                        Object.keys(results).forEach(key => {
                            let ruleItem = srcs[key]
                            if (ruleItem.match) {
                                ruleItem.match = new RegExp(ruleItem.match, 'g')
                            }
                            let matched = []
                            while ((matched = ruleItem.match.exec(results[key])) !== null) {
                                if (matched[1]) {
                                    this.svgIcons.push(matched[1])
                                }
                            }
                            this.svgIcons = Array.from(new Set(this.svgIcons))
                        })
                        this.generateFonts().then(() => {
                            console.log('SvgIconWebpackPlugin done!')
                            fsextra.removeSync(tempSvgDir)
                            callback();
                        }).catch(err => {
                            compilation.errors.push(prettyError(err, compiler.context).toString());
                        })
                    });
                })
        })

        compiler.hooks.compilation.tap(pluginName, (compilation) => {
            HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync(
                pluginName,
                (data, cb) => {
                    generateFontsPromise.then(() => {
                        const stylePath = path.join(this.fontsPath, `${this.options.fontName}.css`);
                        const headRegExp = /(<\/head\s*>)/i;
                        let inject;
                        if (this.options.inject === 'link') {
                            inject = `<link rel="stylesheet" type="text/css" href="${stylePath}"/>`;
                        } else if (this.options.inject === 'style') {
                            const filePath = path.resolve(this.options.dist, `${this.options.fontName}.css`)
                            const content = fs.readFileSync(filePath)
                            inject = `<style type="text/css">${content}</style>`
                        } else if (this.options.inject === 'script') {
                            const jsPath = path.join(this.fontsPath, `${this.options.fontName}.js`);
                            inject = `<script  type="text/javascript" src="${jsPath}"></script>`;
                        }
                        if (inject) data.html = data.html.replace(headRegExp, match => inject + match);
                        cb(null, data)
                    })
                }
            )
        })
    }

    async getAllFiles(compiler, compilation) {
        const {
            pattern,
            globOptions
        } = this.options
        try {
            const files = await glob(pattern, globOptions);
            return files;
        } catch (err) {
            compilation.errors.push(prettyError(err, compiler.context).toString());
        }
    }

    generateFonts() {
        fsextra.emptyDirSync(tempSvgDir)
        // Todo caceh icons， no change ？
        this.svgIcons.forEach(item => {
            let iconPath = path.resolve(process.cwd(), `../src/svgs/${item}.svg`)
            let distPath = `${tempSvgDir}/${item}.svg`
            // use config svg icons dir and built-in svg icons
            if (this.options.dir) {
                let svgPath = `${this.options.dir}/${item}.svg`
                if (fs.existsSync(svgPath) && fsextra.ensureFileSync(svgPath)) {
                    useProjSvgs = true
                    fsextra.copySync(svgPath, distPath)
                } else if (fs.existsSync(iconPath) && fsextra.statSync(iconPath).isFile()) {
                    fsextra.copySync(iconPath, distPath)
                } else {
                    console.log(`${color.red('ERROR')} Can't found file '${item}.svg' in ${svgPath}`)
                }
            }

            // use built-in svg icons
            if (fs.existsSync(iconPath) && fsextra.statSync(iconPath).isFile()) {
                fsextra.copySync(iconPath, distPath)
            } else {
                console.log(`${color.red('ERROR')} No built-in file '${item}.svg' in ${iconPath},you can config icons directory by options.dir and put you file into the directory`)
            }
        })

        return create({
            src: tempSvgDir,
            dist: this.options.dist,
            emptyDist: true,
            fontName: this.options.fontName,
            fontsPath: this.fontsPath
        })
    }

}

SvgIconWebpackPlugin.version = '1.0.0';

module.exports = SvgIconWebpackPlugin;
