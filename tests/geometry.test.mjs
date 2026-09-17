import test from 'node:test';
import assert from 'node:assert/strict';
import {analyse,validQuad,fromDiagonals,parallelogram,SHAPES,FAMILIES,close,distance,missingAngle,parseAnswer,starScore} from '../www/js/math.js';
import {WORLDS,TOTAL_ROUNDS,TOTAL_STARS} from '../www/js/content.js';
import {createStore} from '../www/js/state.js';
test('inclusive family definitions match the chapter',()=>{
 const expected={square:FAMILIES,rectangle:['Quadrilateral','Trapezium','Parallelogram','Rectangle'],rhombus:['Quadrilateral','Trapezium','Parallelogram','Rhombus','Kite'],parallelogram:['Quadrilateral','Trapezium','Parallelogram'],kite:['Quadrilateral','Kite'],trapezium:['Quadrilateral','Trapezium'],isosceles:['Quadrilateral','Trapezium'],concave:['Quadrilateral','Kite'],general:['Quadrilateral']};
 for(const [key,p] of Object.entries(SHAPES)){const a=analyse(p);assert.ok(a.valid,key);assert.deepEqual(a.families,expected[key],key);assert.ok(close(a.angles.reduce((x,y)=>x+y,0),360));}
 assert.equal(analyse(SHAPES.concave).convex,false);assert.ok(analyse(SHAPES.concave).angles.some(a=>a>180));
});
test('degenerate, repeated, collinear and crossed quadrilaterals rejected',()=>{
 for(const p of [[],[[0,0],[1,0],[1,1]],[[0,0],[2,2],[0,2],[2,0]],[[0,0],[2,0],[3,0],[0,2]],[[0,0],[2,0],[2,2],[0,0]],[[0,0],[0,0],[0,0],[0,0]],[[0,0],[NaN,1],[2,2],[0,3]]])assert.equal(validQuad(p),false);
});
test('classification is invariant under rotation, reflection, scaling and orientation',()=>{
 for(const p of Object.values(SHAPES))for(const deg of [0,15,37,90,173,225,300])for(const scale of [.5,2,10]){
  const t=deg*Math.PI/180,transform=p=>p.map(([x,y])=>[scale*(x*Math.cos(t)-y*Math.sin(t))+11,scale*(x*Math.sin(t)+y*Math.cos(t))-7]);
  const expected=analyse(p).families;
  assert.deepEqual(analyse(transform(p)).families,expected);
  assert.deepEqual(analyse(transform(p.map(([x,y])=>[-x,y]))).families,expected);
  assert.deepEqual(analyse([...p].reverse()).families,expected);
 }
});
test('diagonal construction theorems across all rig configurations',()=>{
 for(let a=3;a<=10;a++)for(let b=3;b<=10;b++)for(let angle=30;angle<=150;angle+=15){
  const q=analyse(fromDiagonals(a,b,angle));assert.ok(q.valid&&q.bisect&&q.families.includes('Parallelogram'));
  assert.equal(q.families.includes('Rectangle'),a===b);assert.equal(q.families.includes('Rhombus'),angle===90);assert.equal(q.families.includes('Square'),a===b&&angle===90);
  assert.ok(close(q.diagonals[0],a)&&close(q.diagonals[1],b));
 }
});
test('parallelogram angle relations and kite counterexamples',()=>{
 for(let n=20;n<=160;n+=5){const a=analyse(parallelogram(5,3,n));assert.ok(close(a.angles[0],n));assert.ok(close(a.angles[1],180-n));assert.ok(close(a.angles[2],n));assert.ok(a.bisect);}
 const kite=analyse(SHAPES.kite);assert.ok(kite.perpendicular);assert.equal(kite.bisect,false);
 const iso=analyse(SHAPES.isosceles);assert.ok(close(...iso.diagonals));assert.equal(iso.bisect,false);assert.ok(!iso.families.includes('Rectangle'));
});
test('30 activities, answers reachable and diagram mathematics consistent',()=>{
 assert.equal(TOTAL_ROUNDS,30);assert.equal(TOTAL_STARS,15);assert.equal(new Set(WORLDS.flatMap(w=>w.rounds.map(q=>q.id))).size,30);
 for(const w of WORLDS){assert.equal(w.rounds.length,6);assert.equal(w.chapter,4);for(const q of w.rounds){
  for(const field of ['title','prompt','hint','solution','why'])assert.ok(q[field]?.length>5,`${q.id}: ${field}`);
  if(q.type==='choice')assert.ok(q.options.includes(q.answer));
  if(q.type==='select'){assert.ok(q.answer.every(f=>q.options.includes(f)));if(q.art?.points)assert.deepEqual(q.answer,analyse(q.art.points).families);}
  if(q.type==='geoboard'){
   const solutions=[];for(let x=0;x<=6;x++)for(let y=0;y<=6;y++){const a=analyse([q.fixed[0],q.fixed[1],[x,y],q.fixed[2]]);if(a.families.includes(q.family))solutions.push([x,y]);}
   assert.deepEqual(solutions,[q.answer],q.id);
  }
  if(q.type==='diagonals')assert.ok(analyse(fromDiagonals(q.d1,q.answerLength,q.answerAngle)).families.includes(q.family));
  if(q.type==='order')assert.equal(new Set(q.steps).size,4);
  if(q.art?.points)assert.ok(validQuad(q.art.points),q.id);
 }}
 const q=WORLDS.flatMap(w=>w.rounds).find(q=>q.id==='triangle-join'),p=q.art.points;assert.equal(q.art.diagonal,'bd');assert.ok(close(distance(p[1],p[3]),4));assert.ok(analyse(p).sides.every(s=>close(s,4)));
});
test('numeric answer keys and input parsing independently checked',()=>{
 const q=Object.fromEntries(WORLDS.flatMap(w=>w.rounds.map(q=>[q.id,q])));
 for(const [id,n] of Object.entries({'equal-diagonal':8,'square-half-angle':90/2,'fourth-angle':missingAngle([70,100,80]),'adjacent-angle':180-65,'opposite-angle':65,'bisected-diagonal':3.5,'rhombus-neighbour':180-50,'rhombus-bisector':50/2,'kite-crossing':90,'trapezium-angle':180-70,'isosceles-base':70,'three-right-angles':missingAngle([90,90,90])}))assert.equal(q[id].answer,n,id);
 for(const s of ['',' ','2foo','0x10','Infinity','3/4','1e3'])assert.equal(parseAnswer(s),null);
 assert.equal(parseAnswer(' 3.5 '),3.5);assert.equal(parseAnswer('0'),0);
});
test('isolated storage, assisted resume, best stars, reset and corrupt data',()=>{
 const map=new Map(),storage={getItem:k=>map.get(k),setItem:(k,v)=>map.set(k,v)};let s=createStore(storage);
 assert.ok(s.unlocked(0,WORLDS));assert.ok(!s.unlocked(1,WORLDS));s.saveRun('frame',{index:2,hits:1,missed:true});s=createStore(storage);assert.deepEqual(s.run('frame'),{index:2,hits:1,missed:true});s.finish('frame',3);s.finish('frame',1);assert.equal(s.stars('frame'),3);assert.ok(s.unlocked(1,WORLDS));assert.ok(map.has('quad-quest-v1'));assert.ok(!map.has('power-quest-v1'));
 s.toggleMute();s.reset();assert.equal(s.total(),0);assert.equal(s.muted(),true);assert.equal(createStore({getItem:()=>'{bad'}).total(),0);
 const blocked=createStore({getItem(){throw Error();},setItem(){throw Error();}});blocked.saveRun('frame',{index:0,hits:0,missed:false});assert.equal(blocked.persistent(),false);
 assert.deepEqual(Array.from({length:7},(_,i)=>starScore(i,6)),[1,1,1,1,2,2,3]);
});
