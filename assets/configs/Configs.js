const defaultConfig = {
    systemType: "SC",
    ssl: true,
    serverDomainMapper: {
        localhost: "lumigame.com",
        "10.5.10.31": "lumigame.com"
    },
    subDomain: "l1-proxy3",
    env: "",
    sentry: {
        url: "",
        env: "LOCAL3"
    },
    gameAnalytics: {
        clientId: "093146669bf12df12eeedd2d57ddb469",
        secretKey: "f41dc948ed66a029406413327a68b6ae27fe4e6c"
    },
    subGuideDomain: "l1-guide-3",
    enableMsgpackParserAllGames: false,
    enableMsgpackParserOnNotification: false
    //clientSubDomain: "l1-client" // Turn on when new proxy for client && aws
};

const domainMapper = window.envConfig ? undefined : defaultConfig.serverDomainMapper;
const configs =
    window.envConfig && window.envConfig.isDev
        ? defaultConfig
        : { ...defaultConfig, serverDomainMapper: domainMapper, ...window.envConfig };

module.exports = configs;
