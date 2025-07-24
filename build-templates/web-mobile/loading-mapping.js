function buildShareResource(configs) {
  const path = getClientPath(configs, "shared-resources");
  return buildUrl("http", path, configs);
}

function buildUrl(protocol = "http", path = "/", configs) {
  const ssl = configs.ssl;
  const domain = getRootDomain(configs);
  const subDomain = configs.clientSubDomain ?? configs.subDomain;
  const subDomainText = `${subDomain}.`;

  return `${protocol}${ssl ? "s" : ""}://${subDomain === "" ? "" : subDomainText}${domain}${path}`;
};

function getRootDomain(configs) {
  const hostName = window.location.hostname;
  return (!!configs.serverDomainMapper && configs.serverDomainMapper[hostName]) || extractDomainFromHostName(hostName);
};

function extractDomainFromHostName(hostName) {
  const domainParts = hostName.split(".").reverse();
  return `${domainParts[1]}.${domainParts[0]}`;
};

function getClientPath(configs, name) {
  const subDirectory = configs?.subDirectory ? `/${configs?.subDirectory}` : "";
  return `${subDirectory}/${name}`;
};

async function getMapping(configPath) {
  try {
    const shareResourceUrl = buildShareResource(globalThis.envConfig);
    const localeMappingUrl = `${shareResourceUrl}/${configPath}`;
    const response = await fetch(localeMappingUrl);
    const data = await response.json();
    return data;
  } catch (error) {
    return {};
  }
};

(async function () {
  globalThis.localeMapping = await getMapping("localization/configs/locale-mapping.json");
  globalThis.fontMapping = await getMapping("localization/configs/font-mapping-v2.json");
})();