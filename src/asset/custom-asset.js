﻿var CustomAsset = (function () {

    var CustomAsset = Fire.define('Fire.CustomAsset', Fire.Asset);

    return CustomAsset;
})();

Fire.CustomAsset = CustomAsset;

Fire.addCustomAssetMenu = Fire.addCustomAssetMenu || function (constructor, menuPath, priority) {
    // implement only available in editor
};
