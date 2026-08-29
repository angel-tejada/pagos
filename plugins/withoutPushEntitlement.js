const { withEntitlementsPlist } = require('expo/config-plugins');

/**
 * Pagos only uses local notifications (the optional due-date reminder).
 * It never registers for remote push, and never will — there is no backend.
 *
 * expo-notifications adds the `aps-environment` entitlement unconditionally,
 * which makes iOS demand the Push Notifications capability on the App ID and
 * fails the build. This strips it back out after that plugin has run.
 */
module.exports = function withoutPushEntitlement(config) {
  return withEntitlementsPlist(config, (config) => {
    delete config.modResults['aps-environment'];
    return config;
  });
};
