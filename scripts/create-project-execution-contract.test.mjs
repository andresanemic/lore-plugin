import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
test('create-project requires independent review and preserves the execution choice',async()=>{
 const body=await readFile(new URL('../skills/create-project/SKILL.md',import.meta.url),'utf8');
 assert.match(body,/independent Advisor review before execution/);
 assert.match(body,/read-only review.*does not require writing authority/);
 assert.match(body,/self-review cannot close/);
 assert.match(body,/choice.*pending.*do not execute/is);
});
