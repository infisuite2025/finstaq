const fs = require('fs');
const t = fs.readFileSync(process.argv[2], 'utf8');
const re = /<node[^>]*>/g;
let m;
while ((m = re.exec(t))) {
  const tag = m[0];
  const text = (tag.match(/text="([^"]*)"/) || [])[1] || '';
  const desc = (tag.match(/content-desc="([^"]*)"/) || [])[1] || '';
  const cls = (tag.match(/class="([^"]+)"/) || [])[1] || '';
  if (text || (desc && desc.length < 80)) {
    if (text || desc) console.log(cls.split('.').pop(), JSON.stringify(text || desc).slice(0, 120));
  }
}
