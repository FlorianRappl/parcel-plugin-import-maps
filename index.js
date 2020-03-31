const { resolve, relative } = require("path");
const { writeFileSync, mkdirSync, existsSync } = require("fs");

function resolveImportMap(dir) {
  const pckg = getPackageJson(dir);
  const map = pckg.importmap;

  if (typeof map === "string") {
    const target = resolve(dir, map);

    if (existsSync(target)) {
      return require(target);
    } else {
      console.warn(
        `Could not find the referenced import maps "${map}" from ${dir}. Skipping.`
      );
    }
  } else if (typeof map === "object") {
    return map;
  }

  return undefined;
}

function getPackageJson(dir) {
  if (dir) {
    const path = resolve(dir, "package.json");
    return require(path);
  }

  return {};
}

function getPackageDir(dir) {
  const path = resolve(dir, "package.json");

  if (existsSync(path)) {
    return dir;
  }

  const upper = resolve(dir, "..");

  if (upper !== dir) {
    return getPackageDir(upper);
  }

  return undefined;
}

function createFile(dir, name, content) {
  const path = resolve(dir, `${name}.js`);
  writeFileSync(path, content, "utf8");
  return path;
}

function getSourcePath(root, file) {
  return `/${relative(root, file)}`;
}

function resolvePath(root, dir, file) {
  if (file.startsWith('/')) {
    return getSourcePath(root, `.${file}`);
  } else {
    return getSourcePath(root, resolve(dir, file));
  }
}

function getHashFor(root, dir, file) {
  if (!file.startsWith('http:') && !file.startsWith('https:')) {
    const path = resolvePath(root, dir, file);
    return `require.resolve(${JSON.stringify(path)})[0][0]`;
  } else {
    return JSON.stringify(file);
  }
}

function getImportFor(root, dir, file) {
  if (!file.startsWith('http:') && !file.startsWith('https:')) {
    const path = resolvePath(root, dir, file);
    return `import(${JSON.stringify(path)})`;
  } else {
    return `new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", ${JSON.stringify(file)});
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            const result = {
              exports: {},
            };
            const f = new Function('module', 'exports', 'require', xhr.responseText);
            f(result, result.exports, require);
            resolve(result.exports);
          } else {
            reject(xhr.statusText);
          }
        }
      };
      xhr.send();
    })`;
  }
}

let original;

module.exports = function(bundler) {
  const root = bundler.options.rootDir;
  const dir = getPackageDir(root);
  const map = resolveImportMap(dir);
  const keys = Object.keys((map && map.imports) || {});

  if (keys.length > 0) {
    const modules = {};
    const temp = resolve(__dirname, "_temp");
    const resolver = bundler.resolver;
    const getAlias = original || (original = resolver.__proto__.getAlias);

    if (!existsSync(temp)) {
      mkdirSync(temp);
    }

    createFile(
      temp,
      "index",
      `
if (!window.__importMaps) {
  const imports = [];
  window.__importMaps = true;

  window.__resolveImport = function (id) {
    for (const item of imports) {
      if (item.id === id) {
        return item;
      }
    }

    return {};
  };

  window.__registerImports = function (newImports) {
    newImports.forEach(i => {
      if (!imports.some(j => j.id === i.id)) {
        const item = {
          id: i.id,
          data: undefined,
        };
        item.loading = i.load().then(data => (item.data = data), err => console.error(err));
        imports.push(item);
      }
    });
  };
}

const localImports = [${keys.map(id => `{
  id: ${getHashFor(root, dir, map.imports[id])},
  reference: ${JSON.stringify(id)},
  load: () => ${getImportFor(root, dir, map.imports[id])},
}`).join(',')}];

window.__registerImports(localImports);

exports.ready = function (id) {
  const ids = Array.isArray(id) ? id : (id ? [id] : localImports.map(i => i.id));
  return Promise.all(ids.map(id => window.__resolveImport(id).loading));
};

exports.resolve = function (reference) {
  const [id] = localImports.filter(i => i.reference === reference).map(i => i.id);
  return window.__resolveImport(id).data;
}
`
    );

    resolver.__proto__.getAlias = function(filename, dir, aliases) {
      if (filename === 'importmap') {
        return resolve(temp, 'index.js');
      } else if (keys.includes(filename)) {
        const m = modules[filename];

        if (!m) {
          return (modules[filename] = createFile(
            temp,
            Object.keys(modules).length.toString(),
            `module.exports = require('importmap').resolve(${JSON.stringify(filename)})`,
          ));
        }

        return m;
      }

      return getAlias.call(resolver, filename, dir, aliases);
    };
  }
};
