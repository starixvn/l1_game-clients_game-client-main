window.envConfig = {
    systemType: "SC2",
    ssl: true,
    serverDomainMapper: {
        "demo.vgaming.io": "sgamesuat.com"
    },
    disabledDirectLogin: true,
    subDomain: "l2proxy",
    env: "sit",
    sentry: {
        env: "SIT",
        dsn: "https://fd677e044f1d2fcd9d20164a79bd0742@sentrysc.playonesit.com/28",
        browserUrl: "https://browser.sentry-cdn.com/10.5.0/bundle.min.js",
        urlHash: "sha384-SAsRvjfAFRX3iwi3MG6ToeZNJVpHcRXKcITfFVLQipWK3uQ8SakuVmHDoSR3YNmJ",
        ignoreErrors: []
    },
    subGuideDomain: "l2guides",
    gatewaySubDomain: "l2gwsit",
    enableMsgpackParserAllGames: true,
    enableMsgpackParserOnNotification: true,
    SGConnectSubDomain: "l2-connect-sit",
    AppDownloadSubDomain: "",
    clientSubDomain: "l2client",
    subPromotionDomain: "l2promotion",
    openReplay: {
        projectKey: "OibHwfsksT3kcgEk57xA",
        ingestPoint: "https://replay.lumigame.com/ingest"
    }
};
