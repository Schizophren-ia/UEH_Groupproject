// Keep GitHub Pages' root entry in sync with the editable website entry.
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
fs.writeFileSync(path.resolve(root,'../index.html'),html.replaceAll('href="assets/','href="timtro_website/assets/').replaceAll('src="assets/','src="timtro_website/assets/'),'utf8');
console.log('Root entry synchronized.');
