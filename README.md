# parcel-plugin-import-maps

[![Build Status](https://florianrappl.visualstudio.com/parcel-plugin-import-maps/_apis/build/status/FlorianRappl.parcel-plugin-import-maps?branchName=master)](https://florianrappl.visualstudio.com/parcel-plugin-import-maps/_build/latest?definitionId=14&branchName=master)
[![npm](https://img.shields.io/npm/v/parcel-plugin-import-maps.svg)](https://www.npmjs.com/package/parcel-plugin-import-maps)
[![GitHub tag](https://img.shields.io/github/tag/FlorianRappl/parcel-plugin-import-maps.svg)](https://github.com/FlorianRappl/parcel-plugin-import-maps/releases)
[![GitHub issues](https://img.shields.io/github/issues/FlorianRappl/parcel-plugin-import-maps.svg)](https://github.com/FlorianRappl/parcel-plugin-import-maps/issues)

Parcel plugin for declaring / using import maps. These externals will not be bundled in directly, but only be loaded if not already present. :rocket:

## Usage

Install the plugin via npm:

```sh
npm i parcel-plugin-import-maps
```

You can now add a new key to your *package.json*: `importmap`. The key can either hold an `importmap` structure (see [specification](https://wicg.github.io/import-maps/)) or a reference to a valid JSON file holding the structure.

Example for the containing the structure in the *package.json*:

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "devDependencies": {
    "parcel-bundler": "1.x",
    "parcel-plugin-at-alias": "latest",
  },
  "importmap": {
    "imports": {
      "/app/helper": "node_modules/helper/index.mjs",
      "lodash": "/node_modules/lodash-es/lodash.js"
    }
  }
}
```

Alternative version:

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "devDependencies": {
    "parcel-bundler": "1.x",
    "parcel-plugin-at-alias": "latest",
  },
  "importmap": "./my-imports.json"
}
```

where the *my-imports.json* looks like

```json
{
  "imports": {
    "/app/helper": "node_modules/helper/index.mjs",
    "lodash": "/node_modules/lodash-es/lodash.js"
  }
}
```

With this equipped the given modules are loaded *asynchronously* at the beginning of the application. If multiple applications with import maps are loaded then the dependencies are either *shared* or *not shared* depending on their individual hashes.

This ensures proper dependency isolation while still being able to share what makes sense to be shared.

Most importantly, the plugin allows you to place scripts from other locations easily without bundling them in:

```json
{
  "imports": {
    "lodash": "https://cdn.jsdelivr.net/npm/lodash@4.17.15/lodash.min.js"
  }
}
```

For proper IDE (or even TypeScript) usage we still advise to install the respective package or at least its bindings locally.

## Changelog

This project adheres to [semantic versioning](https://semver.org).

You can find the changelog in the [CHANGELOG.md](CHANGELOG.md) file.

## License

This plugin is released using the MIT license. For more information see the [LICENSE file](LICENSE).
