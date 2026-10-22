import fs from 'node:fs';
const p='outputs/PUSHPO-INTEGRATION-UPDATE.md';let s=fs.readFileSync(p,'utf8');s=s.replace('Full automated results: see','After the final slash-pose continuity adjustment, 32/32 focused combat/final/integration/portable tests also passed (`../work/v12-final-focused-tests.txt`). Full automated results: see');fs.writeFileSync(p,s);
