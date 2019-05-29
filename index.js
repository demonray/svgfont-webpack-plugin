const util = require('util');
const async = require('async');
const fs = require('fs');
const fsextra = require('fs-extra');
const path = require('path');
const create = require('./lib');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const prettyError = require('./lib/errors.js');
const fsLstatAsync = util.promisify(fs.lstat);
const fsReaddirAsync = util.promisify(fs.readdir);
const fsReadFileAsync = util.promisify(fs.readFile);
const glob = util.promisify(require('glob'));

class SvgIconWebpackPlugin {

    constructor(options = {}) {
        const defaultOptions = {
            inject: 'html',
            options: {
                nodir: true
            },
            rules: []
        }
        this.options = Object.assign(defaultOptions, options)
        this.svgIcons = []
    }

    apply(compiler) {
        let generateFontsPromise;
        compiler.hooks.make.tapAsync('SvgIconWebpackPlugin', (compilation, callback) => {
            generateFontsPromise = this.getAllFiles(compiler, compilation).then(files => {
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
            }).then((srcs) => {
                return async.mapValuesLimit(srcs, 2, function (file, key, cb) {
                    fs.readFile(key, 'utf-8', cb);
                }, (err, results) => {
                    if (err) {
                        compilation.errors.push(prettyError(err, compiler.context).toString());
                    }
                    Object.keys(results).forEach(key => {
                        let ruleItem = srcs[key]
                        let reg = ruleItem.match
                        if (reg) {
                            reg = new RegExp(ruleItem.match, 'g')
                        }
                        let matched = results[key].match(reg)
                        if (matched) {
                            this.svgIcons = this.svgIcons.concat(matched)
                            this.svgIcons = Array.from(new Set(this.svgIcons))
                        }
                    })
                    this.generateFonts(compiler, compilation).then(() => {
                        console.log('SvgIconWebpackPlugin done!')
                        callback();
                    })
                });
            })
        })

        compiler.hooks.compilation.tap('SvgIconWebpackPlugin', (compilation) => {
            HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync(
                'SvgIconWebpackPlugin',
                (data, cb) => {
                    generateFontsPromise.then(() => {
                        const link = "<link />";
                        const headRegExp = /(<\/head\s*>)/i;
                        data.html = data.html.replace(headRegExp, match => link + match);
                        console.log(data.html)
                        cb(null, data)
                    })
                }
            )
        })
    }

    async getAllFiles(compiler, compilation) {
        const {
            pattern,
            options
        } = this.options
        try {
            const files = await glob(pattern, options);
            return files;
        } catch (err) {
            compilation.errors.push(prettyError(err, compiler.context).toString());
        }
    }

    generateFonts(compiler, compilation) {
        let tempSvgDir = path.resolve('../tmpsvg')
        fsextra.emptyDirSync(tempSvgDir)
        this.svgIcons.forEach(item => {
            let iconPath = path.resolve(process.cwd(), `../src/svgs/${item}.svg`)
            let flag = true
            let distPath = `${tempSvgDir}/${item}.svg`
            if (this.options.dir) {
                let svgPath = `${this.options.dir}/${item}.svg`
                if (fs.existsSync(svgPath) && fsextra.ensureFileSync(svgPath)) {
                    flag = false
                    fsextra.copySync(svgPath, distPath)
                }
            }
            if (flag && fs.existsSync(iconPath) && fsextra.statSync(iconPath).isFile()) {
                fsextra.copySync(iconPath, distPath)
            }
        })

        return create({
            src: tempSvgDir,
            dist: this.options.dist,
            fontName: this.options.fontName
        })
    }

}

SvgIconWebpackPlugin.version = '1.0.0';

module.exports = SvgIconWebpackPlugin;
