#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const inquirer = require("inquirer");

const TEMPLATE_DIR = path.join(__dirname, "..", "template");

const REPLACEMENTS = {
  projectName: null,
  shortName: null,
  projectNameUpper: null,
  shortPrefix: null,
};

function walkDir(dir, callback) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath, callback);
    }
    callback(fullPath, entry);
  }
  // Also process the directory itself (for rename after children)
  callback(dir, null);
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function replaceContent(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  let changed = false;
  for (const [key, value] of Object.entries(REPLACEMENTS)) {
    if (value === null) continue;
    const placeholder = `{{${key}}}`;
    if (content.includes(placeholder)) {
      content = content.split(placeholder).join(value);
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(filePath, content, "utf8");
  }
}

function renameFiles(dir) {
  // Collect renames bottom-up so we don't walk into renamed dirs prematurely
  const renames = [];
  walkDir(dir, (fullPath) => {
    const dirName = path.dirname(fullPath);
    const baseName = path.basename(fullPath);
    if (baseName.includes("__projectName__")) {
      const newName = baseName.split("__projectName__").join(REPLACEMENTS.projectName);
      renames.push({ oldPath: fullPath, newPath: path.join(dirName, newName) });
    }
  });
  // Process in reverse so deepest paths rename first
  for (const r of renames.reverse()) {
    if (fs.existsSync(r.oldPath)) {
      fs.renameSync(r.oldPath, r.newPath);
    }
  }
}

function scaffold(dest, { projectName, shortName }) {
  REPLACEMENTS.projectName = projectName;
  REPLACEMENTS.shortName = shortName;
  REPLACEMENTS.projectNameUpper = projectName.toUpperCase();
  REPLACEMENTS.shortPrefix = shortName.toUpperCase();

  console.log(`Scaffolding C project in ${dest}...`);

  // Copy template
  copyDir(TEMPLATE_DIR, dest);

  // Rename files with __projectName__ in the name
  renameFiles(dest);

  // Replace placeholders in all file contents
  walkDir(dest, (fullPath, entry) => {
    if (entry && entry.isFile()) {
      replaceContent(fullPath);
    }
  });

  console.log("Done! 🎉");
  console.log(`\n  cd ${path.basename(dest)}`);
  console.log("  mkdir build && cd build");
  console.log("  cmake ..");
  console.log("  make && make install");
}

function parseArgs(argv) {
  const args = [];
  const opts = {};
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--short-name" || argv[i] === "-s") {
      opts.shortName = argv[++i];
    } else if (argv[i].startsWith("-")) {
      // Unknown flag — skip
    } else {
      args.push(argv[i]);
    }
  }
  return { args, opts };
}

async function main() {
  const { args, opts } = parseArgs(process.argv);

  // First positional arg = projectName, second = targetDir
  const projectName = args[0] || null;
  const targetDir = args[1] || args[0] || ".";

  const dest = path.resolve(targetDir);

  if (projectName) {
    // Non-interactive mode — all values from CLI args
    const shortName = opts.shortName || projectName;
    scaffold(dest, { projectName, shortName });
  } else if (!process.stdin.isTTY) {
    // Piped input — can't prompt, show usage
    console.error("Usage: standard-cproject <projectName> [targetDir] [--short-name <name>]");
    console.error("  projectName  Name of the project (required in non-interactive mode)");
    console.error("  targetDir    Directory to create (defaults to projectName)");
    console.error("  -s, --short-name  Short name (defaults to projectName)");
    process.exit(1);
  } else {
    // Interactive mode — prompt for values
    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "projectName",
        message: "What is your project name?",
        default: path.basename(dest),
        validate: (v) => (v.length > 0 ? true : "Project name is required"),
      },
      {
        type: "input",
        name: "shortName",
        message: "What is the short name of your project?",
        default: (ans) => ans.projectName,
        validate: (v) => (v.length > 0 ? true : "Short name is required"),
      },
    ]);

    scaffold(dest, answers);
  }
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
