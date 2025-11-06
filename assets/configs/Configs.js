const defaultConfig = {
    systemType: "SC2",
    ssl: true,
    serverDomainMapper: {
        localhost: "lumigame.com",
        "10.5.10.31": "lumigame.com"
    },
    subDomain: "l2-proxy1",
    env: "",
    sentry: {
        env: "DEV",
        dsn: "https://9c999f9b51e3b4543cb160b946b5bcbe@sentry-k8s.lumigame.com/30",
        browserUrl: "https://browser.sentry-cdn.com/10.5.0/bundle.min.js",
        urlHash: "sha384-SAsRvjfAFRX3iwi3MG6ToeZNJVpHcRXKcITfFVLQipWK3uQ8SakuVmHDoSR3YNmJ",
        ignoreErrors: []
    },
    gameAnalytics: {
        clientId: "093146669bf12df12eeedd2d57ddb469",
        secretKey: "f41dc948ed66a029406413327a68b6ae27fe4e6c"
    },
    gatewaySubDomain: "l2-gw",
    subGuideDomain: "l2-guide",
    enableMsgpackParserAllGames: false,
    enableMsgpackParserOnNotification: false,
    subPromotionDomain: "l2-promotion",
    clientDomainMapper: {
        localhost: "lumigame.com",
        "10.5.10.31": "lumigame.com"
    }
    // clientSubDomain: "l1-client" // Turn on when new proxy for client && aws
};

const domainMapper = window.envConfig ? undefined : defaultConfig.serverDomainMapper;
const configs =
    window.envConfig && window.envConfig.isDev
        ? defaultConfig
        : { ...defaultConfig, serverDomainMapper: domainMapper, ...window.envConfig };

module.exports = configs;
