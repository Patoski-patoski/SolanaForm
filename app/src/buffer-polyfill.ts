// src/buffer-polyfill.ts
// This file sets up Buffer globally for Solana libraries

import { Buffer } from 'buffer';

// Make Buffer available globally
(window as any).Buffer = Buffer;
(globalThis as any).Buffer = Buffer;

export { };