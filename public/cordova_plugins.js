
  cordova.define('cordova/plugin_list', function(require, exports, module) {
    module.exports = [
      {
          "id": "cordova-plugin-apkupdater.ApkUpdater",
          "file": "plugins/cordova-plugin-apkupdater/www/ApkUpdater.js",
          "pluginId": "cordova-plugin-apkupdater",
        "clobbers": [
          "window.ApkUpdater"
        ]
        },
      {
          "id": "cordova-plugin-apkupdater.API",
          "file": "plugins/cordova-plugin-apkupdater/www/API.js",
          "pluginId": "cordova-plugin-apkupdater"
        }
    ];
    module.exports.metadata =
    // TOP OF METADATA
    {
      "cordova-plugin-apkupdater": "5.0.1"
    };
    // BOTTOM OF METADATA
    });
    