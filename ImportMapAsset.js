const { Asset } = require("parcel-bundler");
const { createHash } = require("crypto");

function computeMd5(content) {
  return createHash("md5")
    .update(content || "")
    .digest("hex");
}

class ImportMapAsset extends Asset {
  constructor(path, options) {
    super(path, options);
    this.content = "";
  }

  load() {}

  generate() {
    return {
      js: this.content
    };
  }

  generateHash() {
    return Promise.resolve(computeMd5(this.content));
  }
}

module.exports = ImportMapAsset;
