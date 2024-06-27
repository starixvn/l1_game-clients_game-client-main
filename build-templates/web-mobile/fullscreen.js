window.mobilecheck = function () {
    let check = false;
    (function (a) {
        if (
            /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
                a
            ) ||
            /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
                a.substr(0, 4)
            )
        )
            check = true;
    })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
};

const userAgent = window.navigator.userAgent;
const ios15 = /OS 15/.test(userAgent);
const instruction = document.getElementById("myInstruction");

function reloadMicrositeWhenSSO() {
    const micrositeIframe = document.getElementById("microsite");
    const tokenKey = "?token";
    if (micrositeIframe?.src?.includes(tokenKey)) {
        micrositeIframe.src = window.microsite?.hasSSO ? micrositeIframe.src.split(tokenKey)[0] : micrositeIframe.src;
    }
}

function toggleFullScreen() {
    const doc = window.document;
    const docEl = document.documentElement;

    const requestFullScreen =
        docEl.webkitEnterFullscreen ||
        docEl.requestFullscreen ||
        docEl.mozRequestFullScreen ||
        docEl.webkitRequestFullScreen ||
        docEl.msRequestFullscreen;
    // const cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

    if (
        !doc.fullscreenElement &&
        !doc.mozFullScreenElement &&
        !doc.webkitFullscreenElement &&
        !doc.msFullscreenElement &&
        requestFullScreen
    ) {
        requestFullScreen.call(docEl);
    }

    reloadMicrositeWhenSSO();
}

function showAddressBar() {
    window.scroll({
        top: 0,
        behavior: "instant"
    });
}

function showIntruction() {
    instruction.style.display = "block";
    const isPortrait = window.outerWidth < window.outerHeight;
    if (isPortrait) {
        showAddressBar();
        updateViewport();
        showInstructionAndScroll(false);
        return;
    }

    const navBarHeight = getMiniNavigationBarHeight();
    const deltaHeight = window.outerHeight - window.innerHeight;
    const isShowAddressBar = deltaHeight > navBarHeight;
    const isShowOnPrivateMode = window.outerHeight === window.innerHeight && window.scrollY <= 40; // safari IOS v17
    if ((isShowAddressBar || isShowOnPrivateMode) && !window.skipFullscreen) {
        showInstructionAndScroll();
        showAddressBar();
    } else {
        showInstructionAndScroll(false);
        updateViewport();
    }
}

var timeoutDelayEnableScroll;

function showInstructionAndScroll(isShow = true) {
    clearTimeout(timeoutDelayEnableScroll);
    if (isShow) {
        instruction.style.visibility = "visible";
        timeoutDelayEnableScroll = setTimeout(() => {
            document.body.style.overflowY = "scroll";
        }, 100);
        instruction.onclick = () => {};
    } else {
        instruction.style.visibility = "hidden";
        document.body.style.overflow = "hidden";
        instruction.onclick = null;
    }
}

function getMiniNavigationBarHeight() {
    let navBarHeight = 0;
    const isLandscape = window.outerWidth > window.outerHeight;
    if (isLandscape) {
        navBarHeight = 20;

        if (userAgent.match(/ipad/i)) {
            navBarHeight = 40;
        }
    }
    return navBarHeight;
}

function updateViewport() {
    if (userAgent.match(/iphone|ipad|ipod/i)) {
        let width = screen.width;
        if (window.innerWidth > window.innerHeight) {
            width = window.innerHeight;
        }
        const vh = width * 0.01;
        document.documentElement.style.setProperty("--vh", `${vh}px`);
    } else if (userAgent.match(/android/i)) {
        const height = window.innerHeight < window.innerWidth ? window.innerHeight : window.innerWidth;
        const vh = height * 0.01;
        document.documentElement.style.setProperty("--vh", `${vh}px`);
    } else {
        document.documentElement.style.setProperty("--vh", `1%`);
    }
}

function updateFullScreen() {
    showIntruction();
    const gameContainer = document.getElementById("Cocos2dGameContainer");
    if (gameContainer) {
        gameContainer.style.top = window.scrollY + "px";
    }
}

function handleFullScreen() {
    if (userAgent.match(/iPad|iPhone|iPod/i)) {
        showIntruction();
        updateViewport();
        var timeoutScroll;
        var timeoutResize;
        var timeoutOrientationChange;
        var timeoutExtraResize;

        function triggerEventResize() {
            clearTimeout(timeoutExtraResize);
            timeoutExtraResize = setTimeout(function () {
                window.dispatchEvent(new Event("resize"));
            }, 500);
        }

        const canvas = document.getElementById("GameCanvas");
        canvas.onfocus = () => {
            showIntruction();
        };
        canvas.onblur = () => {
            showIntruction();
        };

        window.addEventListener("orientationchange", function () {
            if (document.getElementById("microsite")) {
                triggerEventResize();
            } else {
                clearTimeout(timeoutOrientationChange);
                timeoutOrientationChange = setTimeout(function () {
                    updateFullScreen();
                }, 100);
            }
        });
        window.addEventListener("resize", function () {
            clearTimeout(timeoutResize);
            timeoutResize = setTimeout(function () {
                updateFullScreen();
            }, 100);
        });
        window.addEventListener("scroll", () => {
            clearTimeout(timeoutScroll);
            timeoutScroll = setTimeout(function () {
                updateFullScreen();
                if (document.getElementById("microsite") && window.innerWidth > window.innerHeight) {
                    triggerEventResize();
                }
            }, 100);
        });
    }

    if (userAgent.match(/android/i)) {
        if (!userAgent.includes("wv")) {
            // if browser is not web view
            const fullButton = document.getElementById("buttonFullAndroid");
            fullButton.style.display = "block";
            window.onresize = () => {
                const isFullScreen = screen.height - window.innerHeight < 1;
                fullButton.style.display = isFullScreen || window.skipFullscreen ? "none" : "block";
                updateViewport();
            };
            fullButton.onclick = () => {
                toggleFullScreen();
                fullButton.style.display = "none";
            };
        } else {
            updateViewport();
        }
    }
}

function initGameEngine() {
    // console.log("initGameEngine");
    // open web debugger console
    if (typeof VConsole !== "undefined") {
        window.vConsole = new VConsole();
    }

    const debug = window._CCSettings.debug;
    const splash = document.getElementById("splash");
    splash.style.display = "block";

    function loadScript(moduleName, cb) {
        function scriptLoaded() {
            document.body.removeChild(domScript);
            domScript.removeEventListener("load", scriptLoaded, false);
            cb && cb();
        }
        const domScript = document.createElement("script");
        domScript.async = true;
        domScript.src = moduleName;
        domScript.addEventListener("load", scriptLoaded, false);
        document.body.appendChild(domScript);
    }

    loadScript(debug ? "cocos2d-js.js" : "cocos2d-js-min.js", function () {
        if (CC_PHYSICS_BUILTIN || CC_PHYSICS_CANNON) {
            loadScript(debug ? "physics.js" : "physics-min.js", window.boot);
        } else {
            window.boot();
        }
    });
    handleFullScreen();
}

function initGA() {
    const gaCode = window.envConfig.systemType === "SC1" ? "G-GJDD3FENTH" : "G-JHKMX35LM3";

    loadScript(`https://www.googletagmanager.com/gtag/js?id=${gaCode}`).then(
        () => {
            window.dataLayer = window.dataLayer || [];
            function gtag() {
                dataLayer.push(arguments);
            }
            gtag("js", new Date());
            gtag("config", gaCode);
        },
        (reason) => {
            console.log("Init GA failed with" + reason);
        }
    );
}

function addGATrackingButton() {
    if (window.envConfig.sentry.env !== "PRO") {
        return;
    }
    const gaCode = "G-W13X2FGNGN";
    loadScript(`https://www.googletagmanager.com/gtag/js?id=${gaCode}`).then(
        () => {
            window.dataLayer = window.dataLayer || [];
            function gtag() {
                dataLayer.push(arguments);
            }
            gtag("js", new Date());
            gtag("config", gaCode);
            window.gtag = gtag;
        },
        (reason) => {
            console.log("Init GA failed with" + reason);
        }
    );
}

function loadScript(src) {
    return new Promise(function (resolve, reject) {
        let script;
        script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

function getLanguageURLparams(locale) {
    const dict = {
        "vi-VN": "vi",
        "en-US": "en",
        "en-UK": "en",
        "th-TH": "th",
        "id-ID": "id",
        "zh-CN": "zh_cn",
        "zh-TW": "zh_tw"
    };
    return dict[locale] || "en";
}

function getCurrentLanguage() {
    let language = "vi";
    try {
        if (localStorage.getItem("current_language")) {
            language = localStorage.getItem("current_language");
        }
    } catch (e) {}
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("lang")) {
        const lang = urlParams.get("lang");
        language = getLanguageURLparams(lang);
    }
    return language;
}

function getOperator() {
    let operator = "";
    try {
        if (localStorage.getItem("current_operator")) {
            operator = localStorage.getItem("current_operator");
        }
    } catch (e) {}
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("op")) {
        operator = urlParams.get("op");
    }
    return operator;
}

function updateLocalizedImages() {
    const language = getCurrentLanguage();
    const operator = getOperator()?.toUpperCase();

    const OperatorAlias = {
        SP: "SP",
        VG: "VG",
        SG: "SG",
        TIP88: "TIP88"
    };

    let title, favicon;
    switch (OperatorAlias[operator]) {
        case OperatorAlias.SP:
            title = "SabaPlay";
            favicon = "favicon_sabaplay.ico?v=5";
            break;
        case OperatorAlias.VG:
            title = "Vgaming";
            favicon = "favicon_vgaming.ico?v=4";
            break;
        case OperatorAlias.SG:
            title = language === "vi" ? "Cổng Game SABA" : "SABA.games";
            favicon = "favicon.ico?v=4";
            break;
        case OperatorAlias.TIP88:
            title = "Tip88";
            favicon = "favicon_tip88.ico?v=4";
            break;
        default:
            title = "Default Title";
            favicon = "default_favicon.ico";
            break;
    }

    setTitleAndFavicon(title, favicon);
    setSplashTextClass(language);
    setSplashPoweredByClass(language);
}

function setTitleAndFavicon(title, favicon) {
    document.title = title;
    const rel = document.getElementById("favicon");
    rel.href = favicon;
}

function setSplashTextClass(language) {
    const splashText = document.getElementById("splash_text");
    const systemType = window.envConfig.systemType;
    const suffixSite = systemType === "SC2" ? "_sc2" : "_sc1";
    const className = `splash_text${suffixSite}_${language}`;
    splashText.className += ` ${className}`;
}

function setSplashPoweredByClass(language) {
    const splashText = document.getElementById("splash_powered");
    const operator = getOperator().toUpperCase();
    const suffixSite = operator === "TIP88" ? "_sc2" : "_sc1";
    const className = `splash_powered${suffixSite}_${language}`;
    splashText.className += ` ${className}`;
}

function updateSplashLogo() {
    const operator = getOperator().toUpperCase();
    const splash = document.getElementById("splash_logo");
    const splashText = document.getElementById("splash_text");
    const suffix = getCSSClassName(operator);
    splash.className = `splash${suffix}`;
    splashText.className = `splash_text${suffix}`;
}

function getCSSClassName(operator) {
    const operators = {
        TIP88: "_tip88",
        SP: "_sabaplay",
        VG: "_Vgaming",
        SG: ""
    };

    if (operators.hasOwnProperty(operator)) {
        return operators[operator];
    } else {
        return window.envConfig.systemType === "SC2" ? "_other_sc2" : "_other_sc1";
    }
}

updateSplashLogo();
updateLocalizedImages();
initGameEngine();
initGA();
addGATrackingButton();
