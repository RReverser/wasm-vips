# Changelog
All notable changes to wasm-vips will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.2] - TBD
Uses libvips v8.12.1, compiled with Emscripten v3.0.0.

### Added
- Add `vips.shutdown()` helper for Node.js.
- Add `vips.emscriptenVersion()` for identifying the Emscripten version.
- Support for loading GIF images with vendored `libnsgif`.
- Support for saving GIF images with `cgif` and `imagequant`.

### Fixed
- Don't intercept errors in Node.js.
- Distribute the web variant within the NPM package ([#4](https://github.com/kleisauke/wasm-vips/issues/4)).
- Ensure that deprecated args are not listed in `vips.d.ts`.

### Changed
- Split utilities to separate classes/functions.
- Enable shipped WebAssembly features by default (i.e. [fixed-width SIMD](https://github.com/webassembly/simd) and [JS-BigInt-integration](https://github.com/WebAssembly/JS-BigInt-integration) proposals).
- Build a dual CommonJS/ES6 module package for Node.js.
- Enable Closure Compiler to minify Emscripten-generated code.
- Update methods/enums for libvips 8.12.
- `image.writeToBuffer()` tries to use the new target API first.

## [0.0.1] - 2020-09-01
Uses libvips v8.10.0, compiled with Emscripten v2.0.0.

### Added
- Initial release.

[0.0.2]: https://github.com/kleisauke/wasm-vips/compare/v0.0.1...v0.0.2
[0.0.1]: https://github.com/kleisauke/wasm-vips/releases/tag/v0.0.1
