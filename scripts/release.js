#!/usr/bin/env node

import { readFileSync, writeFileSync } from "fs";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const packageJsonPath = join(__dirname, "../package.json");
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));

const versionType = process.argv[2] || "patch";

if (!["patch", "minor", "major"].includes(versionType)) {
  console.error(`Invalid version type: ${versionType}`);
  console.error("Usage: node scripts/release.js [patch|minor|major]");
  process.exit(1);
}

// Bump version
const [major, minor, patch] = packageJson.version.split(".").map(Number);
let newVersion;

switch (versionType) {
  case "major":
    newVersion = `${major + 1}.0.0`;
    break;
  case "minor":
    newVersion = `${major}.${minor + 1}.0`;
    break;
  case "patch":
    newVersion = `${major}.${minor}.${patch + 1}`;
    break;
}

packageJson.version = newVersion;
writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + "\n");

console.log(`Version bumped to ${newVersion}`);

// Build
console.log("Building project...");
execSync("pnpm build", { stdio: "inherit" });

// Create git tag and push
const tag = `v${newVersion}`;
console.log(`Creating git tag: ${tag}`);
execSync(`git add package.json`, { stdio: "inherit" });
execSync(`git commit -m "chore: bump version to ${newVersion}"`, { stdio: "inherit" });
execSync(`git tag ${tag}`, { stdio: "inherit" });
console.log(`Pushing changes and tag...`);
execSync(`git push`, { stdio: "inherit" });
execSync(`git push --tags`, { stdio: "inherit" });

console.log(`\n✅ Release ${newVersion} created and pushed!`);
console.log(`GitHub Actions will automatically publish to npm.`);

