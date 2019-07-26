require("colors-cli/toxic");
const fs = require("fs-extra");
const path = require("path");
const generate = require('./generate');
const color = require('colors-cli');

const {
    createSVG,
    createTTF,
    createEOT,
    createWOFF,
    createWOFF2,
    createSvgSymbol,
    copyTemplate
} = require("./utils");

module.exports = async function create(options) {
    if (!options) options = {};
    options.src = options.src || path.join(process.cwd(), "svg");
    options.unicodeStart = options.unicodeStart || 10000;
    options.svg2ttf = options.svg2ttf || {};
    options.emptyDist = options.emptyDist;
    options.svgicons2svgfont = options.svgicons2svgfont || {
        fontHeight: 1000
    };
    options.svgicons2svgfont.fontName = options.fontName;
    options.clssaNamePrefix = options.clssaNamePrefix || options.fontName;

    if (options.emptyDist) {
        await fs.emptyDir(options.dist);
    }

    await fs.ensureDir(options.dist);
    let cssString = [];

    return createSVG(options)
        .then((UnicodeObject) => {
            Object.keys(UnicodeObject).forEach(name => {
                let _code = UnicodeObject[name];
                cssString.push(`.${options.clssaNamePrefix}-${name}:before { content: "\\${_code.charCodeAt(0).toString(16)}"; }\n`);
            });
        })
        .then(() => createTTF(options))
        .then(() => createEOT(options))
        .then(() => createWOFF(options))
        .then(() => createWOFF2(options))
        .then(() => createSvgSymbol(options))
        .then((data) => {
            const font_temp = path.resolve(__dirname, "../src/scripts");
            return copyTemplate(font_temp, options.dist, {
                fontname: options.fontName,
                symbolString: data,
            });
        })
        .then((filePaths) => {
            filePaths && filePaths.length > 0 && filePaths.forEach(filePath =>
                console.log(`${"SUCCESS".green} Created ${filePath} `)
            );
            const font_temp = path.resolve(__dirname, "../src/styles");
            return copyTemplate(font_temp, options.dist, {
                fontname: options.fontName,
                cssString: cssString.join(""),
                timestamp: new Date().getTime(),
                prefix: options.clssaNamePrefix || options.fontName
            });
        })
        .then(filePaths => {
            filePaths && filePaths.length > 0 && filePaths.forEach(filePath =>
                console.log(`${"SUCCESS".green} Created ${filePath} `)
            );
        })
        .then(async () => {
            if (options.outSVGPath) {
                const outPath = await generate.generateIconsSource(options);
                console.log(`${color.green('SUCCESS')} Created ${outPath} `);
            }
            return options;
        }).catch(err => {
            console.log(`${color.red('ERROR')} ${err} `)
        })
}
