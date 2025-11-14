# 🖼️ Imgtool

A tool for your images. As simple as it sounds.

## 🚀 Usage

Use the live web app → [imgtool.netlify.app](https://imgtool.netlify.app).

Or, host it yourself 👇.

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/wasituf/imgtool)

## 👨‍🏭 Under the hood

Under the hood, imgtool uses various libraries to process images, but the core
of it all are the [Squoosh](https://github.com/GoogleChromeLabs/squoosh) codecs
made by Google. Squoosh is an open source web app that provides amazing results
by utilizing web workers in the browser. Imgtool specifically uses the
[jSquash](https://github.com/jamsinclair/jSquash) implementations of the codecs.

This is the short of how the process works:

1. The user uploads an image.
2. The image is decoded into raw image data using one of several jSquash
   helpers.
3. The image data is edited using various libraries and custom functionality.
4. The image is encoded into the desired output format using jSquash helpers.

## Licenses

- Both jSquash, and the Squoosh codecs use the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0.txt).
- Imgtool uses the widely loved, and permissible [MIT License](./LICENSE).

## Acknowledgements

- Built with [Astro](https://astro.build).
- Thanks to:
  - [Squoosh](https://github.com/GoogleChromeLabs/squoosh) for creating the
    image codecs.
  - [jSquash](https://github.com/jamsinclair/jSquash) for creating and
    maintaining the squoosh implementation for browser environments.
