const fs=require('node:fs'),path=require('node:path');
const {Draft,requiredRegions,rules}=require('../docs/layout-model.js');
const destination=process.argv[2];
if(!destination || !path.isAbsolute(destination)) throw Error('Pass an absolute fixture output directory');
fs.mkdirSync(destination,{recursive:true});
for(const rule of rules) {
  const d=new Draft(2374,1080);d.setRule(rule);d.name='网页模板 '+rule;
  requiredRegions(rule).forEach((key,i)=>d.setRegion(key,{x:.02+i*.08,y:.2,w:.05,h:.1}));
  fs.writeFileSync(path.join(destination,rule+'.json'),JSON.stringify(d.document(),null,2));
}
console.log('Exported four actual website model fixtures.');
