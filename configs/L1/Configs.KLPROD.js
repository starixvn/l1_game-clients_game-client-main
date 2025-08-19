window.envConfig = {
    systemType: "SC1",
    ssl: true,
    subDomain: "proxy",
    serverDomainMapper: {
        "www.gamesaba.com": "sabagame.net",
        "gamesaba.com": "sabagame.net"
    },
    env: "",
    sentry: {
        env: "PRO",
        dsn: "https://3b6b749771b4a2b67d4b90eb7f59741f@sentrysc.starixplay.com/25",
        browserUrl: "https://browser.sentry-cdn.com/10.5.0/bundle.min.js",
        urlHash: "sha384-SAsRvjfAFRX3iwi3MG6ToeZNJVpHcRXKcITfFVLQipWK3uQ8SakuVmHDoSR3YNmJ",
        ignoreErrors: []
    },
    gameAnalytics: {
        clientId: "093146669bf12df12eeedd2d57ddb469",
        secretKey: "f41dc948ed66a029406413327a68b6ae27fe4e6c"
    },
    subGuideDomain: "guides",
    gatewaySubDomain: "gw",
    enableMsgpackParserAllGames: true,
    enableMsgpackParserOnNotification: true,
    SGConnectSubDomain: "connect",
    AppDownloadSubDomain: "https://www.taisaba.com",
    clientSubDomain: "client"
};
