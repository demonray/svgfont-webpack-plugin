const PrettyError = require('pretty-error');
const prettyError = new PrettyError();
prettyError.withoutColors();

prettyError.skipNodeFiles();

module.exports = function (err, context) {
    return {
        toHtml: function () {
            return 'SVG Icon Webpack Plugin:\n<pre>\n' + this.toString() + '</pre>';
        },
        toJsonHtml: function () {
            return JSON.stringify(this.toHtml());
        },
        toString: function () {
            try {
                return prettyError.render(err).replace(/webpack:\/\/\/\./g, context);
            } catch (e) {
                return err;
            }
        }
    };
};
