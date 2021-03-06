require("colors-cli/toxic");
const color = require('colors-cli');
const util = require('util');
const async = require('async');
const fs = require('fs-extra');
const path = require('path');
const create = require('../lib');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const prettyError = require('../lib/errors.js');
const glob = util.promisify(require('glob'));
const tempSvgDir = path.resolve('../tmpsvg');

const pluginName = 'SvgFontWebpackPlugin'
class SvgFontWebpackPlugin {

    constructor(options = {}) {
        const defaultOptions = {
            inject: 'script',
            globOptions: {
                nodir: true
            },
            fontName: "iconfont",
            rules: [],
            iconNames: []
        }
        this.options = Object.assign(defaultOptions, options, {
            svgicons2svgfont: {
                fontHeight: 1000,
                fontName: options.fontName,
                normalize: false,
                ...options.svgicons2svgfont
            }
        })
        this.fontsDir = 'fonts'
        this.iconNames = this.options.iconNames
    }

    apply(compiler) {
        let generateFontsPromise;
        this.options.dist = path.resolve(compiler.options.output.path, 'fonts')
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
                                    this.iconNames.push(matched[1])
                                }
                            }
                            this.iconNames = Array.from(new Set(this.iconNames))
                        })
                        this.generateFonts().then(() => {
                            console.log('SvgFontWebpackPlugin done!')
                            fs.removeSync(tempSvgDir)
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
                        const stylePath = path.join(this.fontsDir, `${this.options.fontName}.css`);
                        const headRegExp = /(<\/head\s*>)/i;
                        let inject;
                        if (this.options.inject === 'link') {
                            inject = `<link rel="stylesheet" type="text/css" href="${stylePath}"/>`;
                        } else if (this.options.inject === 'script') {
                            const jsPath = path.join(this.fontsDir, `${this.options.fontName}.js`);
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
        fs.emptyDirSync(tempSvgDir)
        // Todo caceh icons， no change ？
        console.log(`${color.green('SUCCESS')} ${"iconNames".blue_bt}`, this.iconNames)
        this.iconNames.forEach(item => {
            let iconPath = path.resolve(process.cwd(), `../src/svgs/${item}.svg`)
            let distPath = `${tempSvgDir}/${item}.svg`
            let foundInProj = false
            // use config svg icons dir and built-in svg icons
            if (this.options.svgsDir) {
                let svgPath = `${this.options.svgsDir}/${item}.svg`
                if (fs.existsSync(svgPath) && fs.statSync(svgPath).isFile()) {
                    fs.copySync(svgPath, distPath)
                    foundInProj = true
                }
            }
            // search built-in svg icons
            if (!foundInProj) {
                if (fs.existsSync(iconPath) && fs.statSync(iconPath).isFile()) {
                    fs.copySync(iconPath, distPath)
                } else {
                    console.log(`${color.red('ERROR')} No built-in file '${item}.svg' in ${iconPath},you can config icons directory by options.dir and put you file into the directory`)
                }
            }
        })

        return create({
            src: tempSvgDir,
            dist: this.options.dist,
            emptyDist: true,
            fontName: this.options.fontName,
            svgicons2svgfont: this.options.svgicons2svgfont
        })
    }

}

SvgFontWebpackPlugin.version = '1.0.0';

module.exports = SvgFontWebpackPlugin;
