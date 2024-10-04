window.envConfig = {
    isDev: true,
    systemType: "SC1",
    ssl: true,
    serverDomainMapper: {
        "l1-games1.lumigame.com": "lumigame.com"
    },
    subDomain: "l1-proxy1",
    env: "",
    sentry: {
        url: "https://2af29bdacdbf4d9ba2db6600b450541f@sentry.lumigame.com/28",
        env: "LOCAL1"
    },
    gameAnalytics: {
        clientId: "093146669bf12df12eeedd2d57ddb469",
        secretKey: "f41dc948ed66a029406413327a68b6ae27fe4e6c"
    },
    guideDomain: "https://l1-guide-1.lumigame.com",
    enableMsgpackParserAllGames: false,
    enableMsgpackParserOnNotification: false
};

console.error("Wrong mapping config, please check your deployment");
