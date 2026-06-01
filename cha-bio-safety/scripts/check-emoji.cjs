// scripts/check-emoji.cjs — 렌더되는 이모지/픽토그램/딩벳 검출 (한글·주석화살표 제외)
const files = process.argv.slice(2);
const isEmoji = cp => (
  (cp >= 0x1F000 && cp <= 0x1FAFF) ||   // pictographs / supplemental symbols
  (cp >= 0x2600 && cp <= 0x27BF)   ||   // misc symbols + dingbats (체크마크 0x2713)
  (cp >= 0x2300 && cp <= 0x23FF)   ||   // misc technical
  cp === 0x2B50 || cp === 0xFE0F        // star + variation selector
);
let bad = [];
for (const f of files) {
  const s = require('fs').readFileSync(f, 'utf8');
  const hits = [...s].map(c => c.codePointAt(0)).filter(isEmoji);
  if (hits.length) bad.push(f + ': ' + hits.map(c => 'U+' + c.toString(16)).join(' '));
}
if (bad.length) { console.log('EMOJI-FOUND\n' + bad.join('\n')); process.exit(1); }
console.log('EMOJI-0'); process.exit(0);
