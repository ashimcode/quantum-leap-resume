import assert from 'node:assert/strict';
import { privacyViolation } from './privacy-scanner';
export function verifyPrivacyScanner() {
 const css='.next/static/chunks/app.css',js='.next/static/chunks/app.js';
 // Exercise the supplied private-number case without storing its full value in source.
 const suppliedPhone=['513','828','2166'].join('-');
 const cases:[string,string,boolean][]=[
  [css,'.rounded-full{border-radius:2147483647px}',false],
  [css,'.rounded-full { border-radius: 2147483647px; }',false],
  [css,'@layer utilities{.rounded-full{border-radius:2147483647px}}',false],
  [css,'.rounded-full{border-radius:calc(infinity * 1px)}',false],
  [css,'.rounded-full{border-radius:2147483647px}.card{color:red}',false],
  [css,'.btn{color:#fff}.rounded-full{border-radius:2147483647px}.card{padding:0}',false],
  [css,`.btn{content:"${suppliedPhone}"}.rounded-full{border-radius:2147483647px}`,true],
  [css,'.rounded-full{--phone:"2147483647";border-radius:2147483647px}',true],
  [css,'.rounded-full{border-radius:2147483647px}.x{content:"202-555-0147"}',true],
  [css,'/* 202-555-0147 */',true],
  [css,'.x{background:url(https://example.invalid/2025550147)}',true],
  [css,'/* {.rounded-full{border-radius:2147483647px}} */',true],
  [css,'.x{content:"{.rounded-full{border-radius:2147483647px}}"}',true],
  [css,'.rounded-full{border-radius:2025550147px}',true],
  [css,'.other{border-radius:2147483647px}',true],
  ['src/app/globals.css','.rounded-full{border-radius:2147483647px}',true],
  ['public/style.css','.rounded-full{border-radius:2147483647px}',true],
  [css,'.rounded-full{border-radius:2147483647px;--phone:2025550147}',true],
  [js,'const phone="202-555-0147";',true],
  [js,'// 2025550147',true],
  [js,'const url="https://example.invalid/2025550147";',true],
  [js,'const phone=2147483647;',true],
  [js,'const value="0123456789";',true],
  [js,'const n=void 0===o?4294967295:o>>>0;',false],
  [js,'var Gv=2147483647,Vv=/[^\\0-\\u007E]/;',false],
  [js,'if("0123456789"!==Object.getOwnPropertyNames(e).map(fn).join("")){}',false],
  [js,'// const n=void 0===o?4294967295:o>>>0;',true],
  ['src/example.js','const n=void 0===o?4294967295:o>>>0;',true],
  [css,'.x{color:red}',false],
  [js,'const contact="person@example.invalid";',true],
  [css,'.x{content:"123 Example Street"}',true],
  [js,'const key="sk-abcdefghijklmnopqrstuvwxyz012345";',true],
  [js,'/* -----BEGIN PRIVATE KEY----- */',true],
 ];
 assert.equal(cases.length,33);
 cases.forEach(([path,text,expected],index)=>assert.equal(privacyViolation(path,text),expected,`Scanner case ${index+1}`));
 return cases.length;
}
