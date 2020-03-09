module.exports = function(bundler) {
  bundler.addAssetType("importmap", require.resolve("./ImportMapAsset"));
  bundler.addPackager("importmap", require.resolve("./ImportMapPackager"));
};
