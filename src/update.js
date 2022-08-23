import fs from "fs-extra";
import { strict as assert } from "node:assert";
import { execSync } from "child_process";
import { dirname, resolve } from "path";

class Config {
  #value;
  #location;

  constructor(value, location) {
    this.#value = value;
    this.#location = location;
  }

  get(property) {
    return new Config(this.#checkedGet(property), this.#propertyLocation(property))
  }

  has(property) {
    return property in this.#value;
  }

  #propertyLocation(property) {
    return `${this.#location}[${property}]`;
  }

  #checkedGet(property) {
    assert(property in this.#value, `${this.#location}: There is no "${property}"`);
    return this.#value[property];
  }

  getString(property) {
    const value = this.#checkedGet(property);
    assert(typeof value === "string", `${this.#propertyLocation(property)}: Expected string, found ${typeof value}`);
    return value;
  }

  getStrings(property) {
    const value = this.#checkedGet(property);
    return Array.isArray(value) ? value : [value];
  }

  get keys() {
    return Object.keys(this.#value);
  }

  get items() {
    return this.keys.map(key => [key, this.get(key)]);
  }

  toString() {
    return this.#location;
  }

  static readJson(file) {
    return new Config(JSON.parse(fs.readFileSync(file)), file);
  }
}

function execCommand(command, options) {
  console.log(`> ${command}`);
  execSync(command, { stdio: "inherit", ...options });
}

function getConfig(dir) {
  return Config.readJson(resolve(dir, "package.json")).get("pcms-node-build");
}

function symlink(source, target) {
  console.log(`Linking ${source} -> ${target}`);
  if (fs.existsSync(target)) {
    fs.unlinkSync(target);
  }
  fs.symlink(source, target, fs.statSync(source).isDirectory() ? "junction" : "file", (err) => {
    if (err) {
      throw err
    }
  });
}

function symlinkRelative(source, target, path) {
  const targetPath = resolve(target, path);
  fs.mkdirSync(dirname(targetPath), { recursive: true });
  symlink(resolve(source, path), targetPath);
}

function copy(source, target) {
  console.log(`Copying ${source} -> ${target}`);
  fs.copySync(source, target);
}

function copyRelative(source, target, path) {
  const targetPath = resolve(target, path);
  fs.mkdirSync(dirname(targetPath), { recursive: true });
  copy(resolve(source, path), targetPath);
}

function importExports(directory, dependency, dependencyDir, dependencyExports) {
  for (const importName of dependency.getStrings("import")) {
    for (const path of dependencyExports.getStrings(importName)) {
      symlinkRelative(dependencyDir, directory, path);
    }
  }
}

function resolveDependencies(dependencies, registry, registryPath, directory) {
  for (const [name, dependency] of dependencies.items) {
    assert(registry.has(name), `${dependencies}: Unknown dependency ${name}`);
    const dependencyDir = resolve(dirname(registryPath), registry.getString(name));
    const dependencyConfig = getConfig(dependencyDir);

    if (dependencyConfig.has("export")) {
      importExports(directory, dependency, dependencyDir, dependencyConfig.get("export"));
    }

    const dependencyNodeDir = resolve(directory, "node_modules", name);
    copyRelative(dependencyDir, dependencyNodeDir, "package.json");
    for (const path of dependencyConfig.getStrings("node-copy")) {
      copyRelative(dependencyDir, dependencyNodeDir, path);
    }
  }
}

export function update({ directory }) {
  const config = getConfig(directory);
  const registryPath = resolve(directory, config.getString("registry"));
  const registry = Config.readJson(registryPath);

  if (config.has("dependencies")) {
    resolveDependencies(config.get("dependencies"), registry, registryPath, directory);
  }
}
