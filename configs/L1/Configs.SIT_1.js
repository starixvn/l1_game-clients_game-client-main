window.envConfig = {
    systemType: "SC1",
    ssl: true,
    serverDomainMapper: {
        "demo.sabagames.io": "sgamesuat.com"
    },
    subDomain: "l1proxy",
    env: "sit",
    sentry: {
        env: "SIT",
        dsn: "https://b0c34c0de99d7652157835bfa3c07d56@sentrysc.playonesit.com/27",
        browserUrl: "https://browser.sentry-cdn.com/10.5.0/bundle.min.js",
        urlHash: "sha384-SAsRvjfAFRX3iwi3MG6ToeZNJVpHcRXKcITfFVLQipWK3uQ8SakuVmHDoSR3YNmJ",
        ignoreErrors: []
    },
    gameAnalytics: {
        clientId: "093146669bf12df12eeedd2d57ddb469",
        secretKey: "f41dc948ed66a029406413327a68b6ae27fe4e6c"
    },
    subGuideDomain: "l1guides",
    gatewaySubDomain: "l1gwsit",
    enableMsgpackParserAllGames: true,
    enableMsgpackParserOnNotification: true,
    SGConnectSubDomain: "l1sitconnectsite",
    AppDownloadSubDomain: "https://l1sitdownload.sgamesuat.com",
    clientSubDomain: "l1client"
};
