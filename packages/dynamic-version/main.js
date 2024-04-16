var path = require("path");
var fs = require("fs");

function onBeforeBuildFinish(options, callback) {
    Editor.log("Building " + options.platform + " to " + options.dest);

    modifyHtmlTemplate(options);

    callback();
}

function modifyHtmlTemplate(options) {
    var indexHtmlFilePath = path.join(options.dest, "index.html");
    var htmlContent = fs.readFileSync(indexHtmlFilePath, "utf8");

    const version = new Date().getTime();
    const newHtmlContent = htmlContent.replace(
        '<script type="text/javascript" src="./c/c.js"></script>',
        `<script type="text/javascript" src="./c/c.js?v=${version}"></script>`
    );

    fs.writeFileSync(indexHtmlFilePath, newHtmlContent);
}

module.exports = {
    load() {
        Editor.Builder.on("before-change-files", onBeforeBuildFinish);
    },

    unload() {
        Editor.Builder.removeListener("before-change-files", onBeforeBuildFinish);
    }
};
