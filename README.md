# standard-cproject

Scaffold a C library project from a template — powered by [degit](https://github.com/Rich-Harris/degit).

## Quick start

### Option 1: Use degit directly

```bash
npx degit depotpkg/standard-cproject/template my-lib
cd my-lib
# Replace {{projectName}}, {{shortPrefix}}, etc. in filenames and file contents
```

### Option 2: Use the guided CLI

```bash
npx standard-cproject my-lib
```

You'll be prompted for:
- **projectName** — the full project name (e.g. `mylib`)
- **shortName** — the short name, defaults to projectName (e.g. `mylib`)

The CLI then:
1. Copies the template to your target directory
2. Renames `{{projectName}}.c` / `{{projectName}}.h` to match your project
3. Replaces all `{{projectName}}`, `{{shortPrefix}}`, `{{PROJECT_NAME_UPPER}}` placeholders in file contents

## What you get

```
my-lib/
├── .clang-format
├── .devcontainer/
│   └── devcontainer.json
├── .editorconfig
├── .gitignore
├── cmake/
│   └── config.cmake.in
├── CMakeLists.txt
├── Dockerfile
├── example/
│   ├── CMakeLists.txt
│   └── main.c
├── LICENSE
├── README.md
├── mylib.c
└── mylib.h
```

## Build

```bash
mkdir build && cd build
cmake ..
make && make install
```

## License

MIT
