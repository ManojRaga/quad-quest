import {h,button} from './dom.js';
import {pegBoard,diagonalRig} from './puzzles.js';
import {quad,familyChips,measurements} from './visuals.js';
import {analyse,SHAPES,FAMILIES,pretty} from './math.js';
export function mountLabs(main){
 const tabs=h('div',{class:'lab-tabs',role:'group','aria-label':'Choose an experiment'}),stage=h('div',{class:'lab-stage'});let mode='board';
 function draw(){
  tabs.replaceChildren(...[['board','Free geoboard'],['diagonals','Diagonal rig'],['families','Shape families']].map(([id,label])=>{const b=button(label,()=>{mode=id;draw();},`lab-tab ${mode===id?'selected':''}`);b.setAttribute('aria-pressed',mode===id);return b;}));
  if(mode==='board'){
   const info=h('div'),initial=[[1,1],[5,1],[5,4],[1,4]],update=p=>info.replaceChildren(familyChips(p),measurements(p));
   const board=pegBoard(initial,update,{editable:[0,1,2,3]});
   stage.replaceChildren(h('section',{class:'lab-panel'},h('h2',{},'Every corner is yours.'),h('p',{class:'lab-intro'},'Choose a vertex, then tap a peg or change its coordinates. Keep the order A → B → C → D around the boundary.'),board.el,info,h('p',{class:'lab-insight'},'Try a rectangle, a tilted parallelogram, then a concave shape. Can you keep a shape in one family while changing its angles?'),button('Reset the geoboard',draw,'button secondary')));update(initial);
  }else if(mode==='diagonals'){
   const info=h('div'),rig=diagonalRig({d1:6,initialLength:6,initialAngle:60},v=>info.replaceChildren(measurements(v.points)));
   stage.replaceChildren(h('section',{class:'lab-panel'},h('h2',{},'Two strips. Many shapes.'),h('p',{class:'lab-intro'},'AC stays 6 cm long. Both diagonals stay bisected. Change BD or the angle and watch the family names.'),rig.el,info,h('p',{class:'lab-insight'},'Predict: equal diagonals → rectangle; perpendicular diagonals → rhombus. What if both conditions hold?')));
  }else{
   let key='square';const board=h('div',{class:'family-stage'}),info=h('div',{class:'family-properties'}),table=h('div',{class:'family-table'});
   const labels={square:'Square',rectangle:'Non-square rectangle',rhombus:'Non-square rhombus',parallelogram:'Slanted parallelogram',kite:'Kite',trapezium:'Trapezium',isosceles:'Isosceles trapezium',concave:'Concave kite',general:'General quadrilateral'};
   const update=()=>{const p=SHAPES[key],a=analyse(p);board.replaceChildren(quad(p,{diagonals:true,midpoint:true}),familyChips(p));info.replaceChildren(h('div',{},h('span',{},'PARALLEL PAIRS'),h('b',{},a.parallelPairs)),h('div',{},h('span',{},'ANGLE TOTAL'),h('b',{},`${pretty(a.angles.reduce((x,y)=>x+y,0))}°`)),h('div',{},h('span',{},'DIAGONALS BISECT EACH OTHER'),h('b',{},a.bisect?'Yes':'No')),h('div',{},h('span',{},'DIAGONALS PERPENDICULAR'),h('b',{},a.perpendicular?'Yes':'No')));table.replaceChildren(h('table',{},h('caption',{},'Every valid family name for this example'),h('thead',{},h('tr',{},h('th',{scope:'col'},'Family'),h('th',{scope:'col'},'Belongs?'))),h('tbody',{},FAMILIES.map(f=>h('tr',{},h('th',{scope:'row'},f),h('td',{},a.families.includes(f)?'Yes':'No'))))));};
   const select=h('select',{'aria-label':'Example shape',onchange:e=>{key=e.target.value;update();}},Object.entries(labels).map(([id,label])=>h('option',{value:id},label)));
   stage.replaceChildren(h('section',{class:'lab-panel'},h('h2',{},'More than one name.'),h('label',{class:'shape-picker'},h('span',{class:'control-label'},'Choose an example'),select),board,info,table,h('p',{class:'lab-insight'},'The names are inclusive: squares are rectangles AND rhombuses. Rhombuses are kites AND parallelograms. Every parallelogram is a trapezium here.')));update();
  }
 }
 main.append(tabs,stage);draw();
}
