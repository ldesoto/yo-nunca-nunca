/**
 * Quita MobileAdsInitProvider del merge de Gradle.
 * Ese ContentProvider inicializa AdMob al cold start y crasheó builds store previos.
 * El init queda solo vía JS (mobileAds().initialize()) después del primer frame.
 */
const {
  withAndroidManifest,
  AndroidConfig,
} = require('expo/config-plugins');

function withRemoveMobileAdsInitProvider(config) {
  return withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults.manifest;
    if (!manifest.$) manifest.$ = {};
    if (!manifest.$['xmlns:tools']) {
      manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';
    }

    const app = AndroidConfig.Manifest.getMainApplicationOrThrow(cfg.modResults);
    const pkg = cfg.android?.package || 'com.yonnunca.party';
    const providers = app.provider || [];
    app.provider = providers.filter(
      (p) =>
        p.$?.['android:name'] !==
        'com.google.android.gms.ads.MobileAdsInitProvider',
    );
    app.provider.push({
      $: {
        'android:name': 'com.google.android.gms.ads.MobileAdsInitProvider',
        'android:authorities': `${pkg}.mobileadsinitprovider`,
        'tools:node': 'remove',
      },
    });
    return cfg;
  });
}

module.exports = withRemoveMobileAdsInitProvider;
