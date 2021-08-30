'use strict';

import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Helpers
export function getPath (filename) {
  return join(dirname(fileURLToPath(import.meta.url)), 'images', filename);
}

// https://www.flickr.com/photos/grizdave/2569067123/
export const inputJpg = getPath('2569067123_aca715a2ee_o.jpg');

// https://gist.github.com/gasi/769cfb9f2359a1fbedc5
export const inputPng = getPath('alpha-premultiply-2048x1536-paper.png');

// https://www.gstatic.com/webp/gallery/4.webp
export const inputWebP = getPath('4.webp');
