# parcel-plugin-import-maps

[![Build Status](https://florianrappl.visualstudio.com/parcel-plugin-import-maps/_apis/build/status/FlorianRappl.parcel-plugin-import-maps?branchName=master)](https://florianrappl.visualstudio.com/parcel-plugin-import-maps/_build/latest?definitionId=14&branchName=master)
[![npm](https://img.shields.io/npm/v/parcel-plugin-import-maps.svg)](https://www.npmjs.com/package/parcel-plugin-import-maps)
[![GitHub tag](https://img.shields.io/github/tag/FlorianRappl/parcel-plugin-import-maps.svg)](https://github.com/FlorianRappl/parcel-plugin-import-maps/releases)
[![GitHub issues](https://img.shields.io/github/issues/FlorianRappl/parcel-plugin-import-maps.svg)](https://github.com/FlorianRappl/parcel-plugin-import-maps/issues)

Parcel plugin for declaring / using import maps. These externals will not be bundled in directly, but only be loaded if not already present. :rocket:

## Usage

Install the plugin via npm:

```sh
npm i parcel-plugin-import-maps --save-dev
```

### Declaring Import Maps

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
      "lodash": "./node_modules/lodash-es/lodash.js"
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
    "lodash": "./node_modules/lodash-es/lodash.js"
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

### Loading Import Maps

The required import maps are loaded at startup *asynchronously*. Therefore, you'd need to wait before using them.

Unfortunately, in the current version this cannot be done implicitly (reliably), even though its desired for the future.

Right now the only way is to change code like (assumes `lodash` is used from an import map like above)

```js
//app.js
import * as _ from 'lodash';

const _ = require('lodash');

export const partitions = _.partition([1, 2, 3, 4], n => n % 2);
});
```

to be

```js
//app.js
require('importmap').ready().then(() => {
  const _ = require('lodash');
  return {
    partitions: _.partition([1, 2, 3, 4], n => n % 2),
  };
});
```

or, alternatively (more generically),

```js
//index.js
module.exports = require('importmap').ready().then(() => require('./app'));

//app.js
import * as _ from 'lodash';

const _ = require('lodash');

export const partitions = _.partition([1, 2, 3, 4], n => n % 2);
});
```

You could also trigger the loading already in the beginning, i.e.,

```js
//app.js
require('importmap');

// ...
//other.js
require('importmap').ready('lodash').then(() => {
  // either load or do something with require('lodash')
});
```

where we use `ready` with a single argument to determine what package should have been loaded to proceed. This is the deferred loading approach. Alternatively, an array with multiple package identifiers can be passed in.

## Changelog

This project adheres to [semantic versioning](https://semver.org).

You can find the changelog in the [CHANGELOG.md](CHANGELOG.md) file.

## License

This plugin is released using the MIT license. For more information see the [LICENSE file](LICENSE).
