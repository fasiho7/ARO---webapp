const { HttpError } = require("../../utils/httpError");
const mock = require("./mock");
const easypaisa = require("./easypaisaManual");
const jazzcash = require("./jazzcash");
const card = require("./card");
const bank = require("./bank");

const providers = [mock, easypaisa, jazzcash, card, bank];
const byId = Object.fromEntries(providers.map((provider) => [provider.id, provider]));

function getProvider(id) {
  const provider = byId[id];
  if (!provider) {
    throw new HttpError(400, "Unknown payment method.", "UNKNOWN_PROVIDER");
  }
  return provider;
}

function listMethods() {
  return providers.map((provider) => {
    const method = {
      id: provider.id,
      label: provider.label,
      description: provider.description,
      available: provider.isAvailable(),
      live: provider.id !== "mock" && provider.isAvailable(),
    };
    if (typeof provider.instructions === "function") {
      method.instructions = provider.instructions();
    }
    return method;
  });
}

module.exports = {
  getProvider,
  listMethods,
};
