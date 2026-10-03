import { listTools, callTool } from './tools.mjs';
import { listDocuments, getDocument, packageVersion, builtAt } from './data.mjs';

export function createContext() {
  return { listTools, callTool, listDocuments, getDocument, packageVersion, builtAt };
}
