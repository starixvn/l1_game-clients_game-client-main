// OpenReplay Configuration Constants
window.OpenReplayConstants = {
    defaultInputMode: 0,
    obscureTextNumbers: false,
    obscureTextEmails: true,
    canvas: {
        disableCanvas: false,
        useAnimationFrame: true,
        fileExt: "webp"
    },
    __DISABLE_SECURE_MODE: true,
    network: {
        // Enable HTTP payload capture in the network option
        capturePayload: true
    }
};

// OpenReplay Initialization Function
window.initOpenReplay = function () {
    var projectKey = window.envConfig.openReplay ? window.envConfig.openReplay.projectKey : "";
    var startOpts = {};

    // Only initialize OpenReplay if projectKey is provided
    if (projectKey && projectKey.trim() !== "") {
        // Get ingestPoint from config if available
        var ingestPoint = window.envConfig.openReplay ? window.envConfig.openReplay.ingestPoint : "";

        // Merge projectKey and ingestPoint from config with constants
        var initOpts = Object.assign({}, window.OpenReplayConstants, {
            projectKey: projectKey,
            ingestPoint: ingestPoint
        });

        (function (A, s, a, y, e, r) {
            r = window.OpenReplay = [e, r, y, [s - 1, e]];
            s = document.createElement("script");
            s.src = A;
            s.async = !a;
            document.getElementsByTagName("head")[0].appendChild(s);
            r.start = function (v) {
                r.push([0]);
            };
            r.stop = function (v) {
                r.push([1]);
            };
            r.setUserID = function (id) {
                r.push([2, id]);
            };
            r.setUserAnonymousID = function (id) {
                r.push([3, id]);
            };
            r.setMetadata = function (k, v) {
                r.push([4, k, v]);
            };
            r.event = function (k, p, i) {
                r.push([5, k, p, i]);
            };
            r.issue = function (k, p) {
                r.push([6, k, p]);
            };
            r.isActive = function () {
                return false;
            };
            r.getSessionToken = function () {};
        })("//static.openreplay.com/latest/openreplay.js", 1, 0, initOpts, startOpts);
    } else {
        console.log("OR: Skipping initialization - projectKey is empty or not provided");
    }
};
