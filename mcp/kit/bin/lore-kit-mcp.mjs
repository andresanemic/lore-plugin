#!/usr/bin/env node
import { createInterface } from 'node:readline';
import { handleMessage } from '../src/protocol.mjs';
import { createContext } from '../src/context.mjs';

const input = createInterface({ input: process.stdin, crlfDelay: Infinity });
const context = createContext();
for await (const line of input) {
  const response = await handleMessage(line, context);
  if (response !== null) process.stdout.write(`${JSON.stringify(response)}\n`);
}
