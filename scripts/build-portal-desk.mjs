/** Original vector workstation, rasterized at native 4K for the intro plate. */
import sharp from 'sharp';

const keys = Array.from({ length: 5 }, (_, row) =>
  Array.from({ length: 17 }, (_, col) =>
    `<rect x="${2270 + col * 23 + row * 3}" y="${1460 + row * 18}" width="19" height="12" rx="2" fill="#333940" stroke="#555b63"/>`
  ).join('')
).join('');
const vents = Array.from({ length: 25 }, (_, index) =>
  `<path d="M3070 ${1100 + index * 10}h210" stroke="#222930" stroke-width="3"/>`
).join('');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="3840" height="2160" viewBox="0 0 3840 2160">
<defs>
  <radialGradient id="room"><stop stop-color="#253039"/><stop offset=".6" stop-color="#11171c"/><stop offset="1" stop-color="#030507"/></radialGradient>
  <linearGradient id="wall" x2="0" y2="1"><stop stop-color="#1e2831"/><stop offset="1" stop-color="#090d12"/></linearGradient>
  <linearGradient id="desk" x2="0" y2="1"><stop stop-color="#42464a"/><stop offset=".3" stop-color="#20252b"/><stop offset="1" stop-color="#0b0e11"/></linearGradient>
  <linearGradient id="case" x2="1" y2="1"><stop stop-color="#303a44"/><stop offset=".45" stop-color="#0a0f14"/><stop offset="1" stop-color="#232d36"/></linearGradient>
  <radialGradient id="screen"><stop stop-color="#1a111a"/><stop offset=".7" stop-color="#090a0f"/><stop offset="1" stop-color="#030509"/></radialGradient>
  <linearGradient id="glass" x2="1" y2="1"><stop stop-color="#8facbe" stop-opacity=".12"/><stop offset=".48" stop-color="#081018" stop-opacity="0"/></linearGradient>
  <filter id="soft"><feGaussianBlur stdDeviation="18"/></filter>
</defs>
<rect width="3840" height="2160" fill="url(#room)"/>
<path d="M0 0h3840v1480L0 1380Z" fill="url(#wall)"/>
<g stroke="#a6bdcd" stroke-opacity=".08" stroke-width="2">
  <path d="M0 400h3840M0 800h3840M0 1200h3840M600 0v1400M1200 0v1400M1800 0v1400M2400 0v1400M3000 0v1400M3600 0v1400"/>
  <path d="M0 1800h3840M0 2080h3840M1650 1420 1200 2160M2200 1420 2700 2160M2800 1420 3800 2160"/>
</g>
<path d="M3050 90 3360 0H3500L3280 1470H3100Z" fill="#a8c8de" opacity=".035" filter="url(#soft)"/>
<rect x="580" y="430" width="640" height="660" rx="4" fill="#060a0d" stroke="#2b343c" stroke-width="8"/>
<g stroke="#3c4e5c" stroke-width="7" opacity=".55">
  <path d="M590 490h620M590 555h620M590 620h620M590 685h620M590 750h620M590 815h620M590 880h620M590 945h620M590 1010h620"/>
</g>
<ellipse cx="2490" cy="1750" rx="1250" ry="170" fill="#000" opacity=".55" filter="url(#soft)"/>
<path d="M1640 1430 3370 1430 3680 1650 1350 1650Z" fill="url(#desk)" stroke="#53606b" stroke-width="2"/>
<path d="M1350 1650h2330v28H1350Z" fill="#10171e" stroke="#35414c" stroke-width="2"/>
<path d="M1470 1678h60v330h-45ZM3510 1678h60l-15 330h-45Z" fill="#1f2933" stroke="#43525f" stroke-width="2"/>
<path d="M2430 1200h90l18 230-144 40h250l-105-40Z" fill="url(#case)" stroke="#495963" stroke-width="3"/>
<rect x="1910" y="610" width="1150" height="660" rx="22" fill="#04070a" stroke="#607482" stroke-width="4"/>
<rect x="1922" y="622" width="1126" height="624" rx="10" fill="url(#screen)" stroke="#222d36" stroke-width="3"/>
<rect x="1922" y="622" width="1126" height="624" rx="10" fill="url(#glass)"/>
<circle cx="2485" cy="1258" r="3" fill="#9aa9ad"/>
<path d="M3040 1020 3270 1020 3320 1060 3320 1460 3040 1460Z" fill="url(#case)" stroke="#3b4a56" stroke-width="3"/>
${vents}
<circle cx="3270" cy="1080" r="8" fill="none" stroke="#7c8790" stroke-width="3"/>
<path d="M3270 1069v10" stroke="#7c8790" stroke-width="3"/>
<path d="M2220 1448h460l100 120h-530Z" fill="#111820" stroke="#53606b" stroke-width="2"/>
${keys}
<ellipse cx="2870" cy="1510" rx="47" ry="26" fill="#29323c" stroke="#64707a" stroke-width="2"/>
<path d="M2870 1485v28" stroke="#111820" stroke-width="3"/>
<path d="M1810 1475v-110q5-20 85-20v130q-30 30-85 0M1895 1375q65-5 42 50l-42 12" fill="#25303a" stroke="#5b6972" stroke-width="3"/>
<path d="M2500 1340q-140 80 300 75t-25 215" fill="none" stroke="#080c10" stroke-width="9"/>
</svg>`;
await sharp(Buffer.from(svg)).webp({ quality: 92 }).toFile('public/surveillance/desk-4k.webp');
console.log('Rendered original desk plate at 3840 x 2160.');
