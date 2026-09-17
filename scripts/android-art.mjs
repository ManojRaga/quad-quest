// Rasterize the code-native diagonal frame for web and Android launchers.
import {readdir,mkdir} from 'node:fs/promises';
const modulePath=process.argv[2] || 'sharp';
const {default:sharp}=await import(modulePath);
const source='www/icons/icon.svg';
for(const n of [192,512])await sharp(source).resize(n,n).png().toFile(`www/icons/icon-${n}.png`);
const densities={mdpi:1,hdpi:1.5,xhdpi:2,xxhdpi:3,xxxhdpi:4};
for(const [density,scale] of Object.entries(densities)){
  const dir=`android/app/src/main/res/mipmap-${density}`;await mkdir(dir,{recursive:true});
  for(const file of ['ic_launcher','ic_launcher_round'])await sharp(source).resize(Math.round(48*scale)).png().toFile(`${dir}/${file}.png`);
  const glyph=await sharp(source).resize(Math.round(66*scale)).png().toBuffer();
  await sharp({create:{width:Math.round(108*scale),height:Math.round(108*scale),channels:4,background:'#f0f3f9'}}).composite([{input:glyph,gravity:'centre'}]).png().toFile(`${dir}/ic_launcher_foreground.png`);
}
const root='android/app/src/main/res';
for(const dir of await readdir(root))if(dir.startsWith('drawable')){
  if(!(await readdir(`${root}/${dir}`)).includes('splash.png'))continue;
  const target=`${root}/${dir}/splash.png`,{width,height}=await sharp(target).metadata();
  const glyph=await sharp(source).resize(Math.round(Math.min(width,height)*.22)).png().toBuffer();
  await sharp({create:{width,height,channels:4,background:'#f0f3f9'}}).composite([{input:glyph,gravity:'centre'}]).png().toFile(target);
}
console.log('Web icons, Android launchers, and splash screens are ready.');
