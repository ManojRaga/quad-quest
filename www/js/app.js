import {h,button,stars} from './dom.js';
import {WORLDS,TOTAL_ROUNDS,TOTAL_STARS} from './content.js';
import {store} from './state.js';
import {sound,celebrate} from './effects.js';
import {icon,heroArt,workshopArt} from './visuals.js';
import {renderPuzzle} from './puzzles.js';
import {starScore} from './math.js';
import {mountLabs} from './labs.js';

const app=document.getElementById('app');
let classroom=false,activeDispose=()=>{},offlineReady=false;
const go=route=>{sound.tap();if(location.hash===`#${route}`)render();else location.hash=route;};
const unlocked=w=>classroom||store.unlocked(WORLDS.indexOf(w),WORLDS);
const worldLink=w=>`world/${w.id}`;
const resumeWorld=()=>WORLDS.find(w=>store.run(w.id)&&unlocked(w))||WORLDS.find(w=>!store.stars(w.id)&&unlocked(w))||WORLDS[0];
function navButton(name,text,route,current){const b=button([icon(name,18),h('span',{},text)],()=>go(route),`nav-button ${current===route?'active':''}`);if(current===route)b.setAttribute('aria-current','page');return b;}
function shell(current='journey'){
  const mute=button(icon(store.muted()?'mute':'sound',18),()=>{store.toggleMute();mute.replaceChildren(icon(store.muted()?'mute':'sound',18));mute.setAttribute('aria-label',store.muted()?'Turn sound on':'Mute sound');},'icon-button');mute.setAttribute('aria-label',store.muted()?'Turn sound on':'Mute sound');
  const settings=button(icon('settings',18),showSettings,'icon-button');settings.setAttribute('aria-label','Adventure settings');
  const header=h('header',{class:'site-header'},button([h('span',{class:'brand-mark'},icon('bolt',26)),h('span',{class:'brand-name'},'quad',h('b',{},'quest'),h('small',{},'A GEOMETRY ADVENTURE'))],()=>go('journey'),'brand'),h('nav',{class:'main-nav','aria-label':'Main navigation'},navButton('map','Adventure','journey',current),navButton('book','Field notes','guide',current),navButton('flask','Play lab','lab',current)),h('div',{class:'header-tools'},h('span',{class:'star-total','aria-label':`${store.total()} of ${TOTAL_STARS} stars`},'✦ ',store.total(),h('small',{},` / ${TOTAL_STARS}`)),mute,settings));
  const main=h('main',{id:'main',tabindex:'-1'});
  app.replaceChildren(header,main,h('footer',{class:'site-footer'},h('span',{},'GANITA PRAKASH · CLASS 8 · CHAPTER 4'),h('span',{},'Made for curious minds. Not for racing clocks.')));
  return main;
}
function pageHeading(kicker,title,subtitle){return h('div',{class:'page-heading'},h('p',{class:'eyebrow'},kicker),h('h1',{},title),h('p',{class:'lead'},subtitle));}
function showMap(){
  const main=shell(),next=resumeWorld(),done=WORLDS.filter(w=>store.stars(w.id)).length;
  const hero=h('section',{class:'hero'},h('div',{class:'hero-copy'},h('p',{class:'eyebrow'},h('span',{class:'live-dot'}),' A FIELD GUIDE TO THE ART OF FOUR SIDES'),h('h1',{},'Four sides.',h('br'),h('em',{},'Endless'),h('br'),'possibilities.'),h('p',{class:'hero-description'},'Move a corner. Cross two lines. Discover the beautiful rules that hold a shape together.'),h('div',{class:'hero-actions'},button([store.run(next.id)?'Continue adventure':done===WORLDS.length?'Explore again':'Start your adventure',icon('arrow',19)],()=>go(worldLink(next)),'button primary'),h('span',{class:'hero-note'},'Build first. Ask why.')),h('div',{class:'hero-stats'},h('span',{},h('b',{},'04'),' chapter'),h('span',{},h('b',{},'05'),' studios'),h('span',{},h('b',{},TOTAL_ROUNDS),' discoveries'))),heroArt());
  const progress=h('div',{class:'trail-progress'},h('span',{},`${done} of ${WORLDS.length} workshops explored`),h('div',{class:'progress-track',role:'progressbar','aria-label':'Workshops completed','aria-valuemin':0,'aria-valuemax':WORLDS.length,'aria-valuenow':done},h('i',{style:`width:${done/WORLDS.length*100}%`})));
  const heading=h('div',{class:'section-heading'},h('div',{},h('p',{class:'eyebrow'},'FOLLOW YOUR CURIOSITY'),h('h2',{},'Your discovery trail')),progress);
  main.append(hero,h('section',{class:'trail','aria-label':'Adventure workshops'},heading,classroom?h('p',{class:'classroom-banner'},'Classroom mode is on. Explore any workshop in any order.'):null));
  const trail=main.querySelector('.trail');
  for(const chapter of [4]){
    trail.append(h('div',{class:'chapter-divider'},h('span',{},'CHAPTER 04'),h('h3',{},'Quadrilaterals'),h('span',{class:'chapter-line'})));
    trail.append(h('div',{class:'world-grid'},WORLDS.filter(w=>w.chapter===chapter).map(w=>{
      const i=WORLDS.indexOf(w),open=unlocked(w),score=store.stars(w.id),run=store.run(w.id);
      const b=button([h('span',{class:'world-topline'},h('span',{class:'world-index'},String(i+1).padStart(2,'0')),h('span',{class:'world-status'},score?'EXPLORED':run?'IN PROGRESS':open?'READY TO EXPLORE':'COMING UP')),h('span',{class:`world-scene scene-${w.id}`},workshopArt(w.id)),h('span',{class:'world-title'},w.name),h('span',{class:'world-topic'},w.topic),h('span',{class:'world-bottom'},score?stars(score):h('span',{},`${w.rounds.length} discoveries`),icon(open?'arrow':'lock',18))],()=>go(worldLink(w)),`world-card ${open?'available':'locked'}`);
      b.style.setProperty('--accent',w.color);b.disabled=!open;b.setAttribute('aria-label',`${w.name}. ${w.topic}. ${open?(score?`${score} stars earned`:'Open workshop'):`Complete ${WORLDS[i-1].name} to unlock`}`);return b;
    })));
  }
  trail.querySelector('.world-grid').append(h('article',{class:'lab-invitation'},icon('flask',29),h('span',{class:'eyebrow'},'ALWAYS OPEN'),h('h3',{},'Your drafting table'),h('p',{},'A geoboard, a diagonal rig, and a shape-family explorer. No scores. Just possibilities.'),button(['Open play lab',icon('arrow',17)],()=>go('lab'),'button secondary')));
  main.append(h('aside',{class:'map-note'},icon('bulb',26),h('div',{},h('strong',{},'Getting it wrong is part of getting it.'),h('p',{},'Try, tweak, and try again. Every discovery comes with a clue and a clear explanation.')),button('Open field notes',()=>go('guide'),'text-button')));
}
function showWorld(w){
  if(!unlocked(w)){go('journey');return;}
  const main=shell();main.style.setProperty('--accent',w.color);
  const run=store.run(w.id);
  main.append(h('section',{class:'world-intro-card'},h('div',{class:`intro-art scene-${w.id}`},workshopArt(w.id)),h('p',{class:'eyebrow'},`WORKSHOP ${WORLDS.indexOf(w)+1} · CHAPTER ${w.chapter}`),h('h1',{},w.name),h('p',{class:'lead'},w.intro),h('div',{class:'lesson-card'},h('span',{class:'eyebrow'},'THE IDEA TO START WITH'),h('p',{},w.lesson)),h('div',{class:'intro-meta'},h('span',{},'6 short discoveries'),h('span',{},'No time limit'),h('span',{},'Clues on tap')),button([run?'Resume workshop':'Let’s build',icon('arrow',20)],()=>go(`play/${w.id}`),'button primary wide'),h('p',{class:'small-note'},'3 stars: all 6 unaided · 2 stars: 4–5 unaided · 1 star: finish and learn'),button('Back to the trail',()=>go('journey'),'text-button')));
}
function play(w){
  if(!unlocked(w)){go('journey');return;}
  let alive=true;activeDispose=()=>{alive=false;};
  const main=shell(),saved=store.run(w.id);main.style.setProperty('--accent',w.color);
  let index=saved&&saved.index<=w.rounds.length?saved.index:0,hits=saved?.hits||0,missed=saved?.missed||false;
  function results(){
    const score=starScore(hits,w.rounds.length);store.finish(w.id,score);sound.win();celebrate();
    const next=WORLDS[WORLDS.indexOf(w)+1],all=WORLDS.every(x=>store.stars(x.id));
    main.replaceChildren(h('section',{class:'results-card'},h('div',{class:'result-seal'},icon('bolt',35)),h('p',{class:'eyebrow'},all?'ALL FIVE STUDIOS EXPLORED':'WORKSHOP COMPLETE'),h('h1',{},all?'A true shape architect.':'Look what you discovered.'),stars(score),h('p',{class:'lead'},`${w.name} · ${hits} of 6 solved without a hint or retry.`),h('div',{class:'lesson-card'},h('span',{class:'eyebrow'},'TAKE THIS IDEA WITH YOU'),h('p',{},w.takeaway)),h('p',{class:'small-note'},score===3?'Three stars. One excellent new idea.':'The clues helped you learn. Replay to improve your stars; your best score stays.'),button([next?`Next: ${next.name}`:'Back to the adventure',icon('arrow',18)],()=>go(next?worldLink(next):'journey'),'button primary wide'),h('div',{class:'button-row'},button('Replay workshop',()=>{index=0;hits=0;missed=false;showRound();},'button secondary'),button('Adventure map',()=>go('journey'),'text-button'))));
    main.querySelector('h1').setAttribute('tabindex','-1');main.querySelector('h1').focus({preventScroll:true});window.scrollTo(0,0);
    const total=document.querySelector('.star-total');total.replaceChildren('✦ ',String(store.total()),h('small',{},` / ${TOTAL_STARS}`));total.setAttribute('aria-label',`${store.total()} of ${TOTAL_STARS} stars`);
  }
  function showRound(){
    if(!alive)return;if(index>=w.rounds.length){results();return;}
    const round=w.rounds[index];let locked=false,tries=0;store.saveRun(w.id,{index,hits,missed});
    const feedback=h('div',{class:'feedback-area','aria-live':'polite','aria-atomic':'true'}),hintPanel=h('div',{class:'hint-panel',hidden:true,role:'status'});
    const hint=button([icon('bulb',18),'Need a clue?'],()=>{if(locked)return;missed=true;store.saveRun(w.id,{index,hits,missed});hintPanel.hidden=false;hintPanel.replaceChildren(h('strong',{},tries>=2?'Let’s work it out':'A little nudge'),h('p',{},tries>=2?`${round.solution} ${round.why}`:round.hint));hint.textContent=tries>=2?'Solution shown':'Clue shown';},'hint-button');
    const api={
      note(message){feedback.replaceChildren(h('div',{class:'feedback note'},message));},
      answer(correct){
        if(locked||!alive)return;
        if(correct){
          locked=true;puzzle.lock();hint.disabled=true;if(!missed)hits++;sound.good();store.saveRun(w.id,{index:index+1,hits,missed:false});
          const next=button([index===w.rounds.length-1?'Collect discovery':'Next discovery',icon('arrow',18)],()=>{index++;missed=false;showRound();},'button primary');
          feedback.replaceChildren(h('div',{class:'feedback success'},h('span',{class:'feedback-icon'},icon('check',22)),h('div',{},h('strong',{},missed?'You worked it out.':'That’s the idea!'),h('p',{},round.why)),next));
          next.focus({preventScroll:true});feedback.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'nearest'});
        }else{tries++;missed=true;store.saveRun(w.id,{index,hits,missed});sound.retry();feedback.replaceChildren(h('div',{class:'feedback retry'},h('strong',{},'A useful attempt. Try another way.'),h('p',{},tries===1?'Adjust your answer, or tap the clue for a little help.':round.hint)));if(tries>=2)hint.replaceChildren(icon('bulb',18),'Show me how');}
      }
    };
    const puzzle=renderPuzzle(round,api);
    main.replaceChildren(h('section',{class:'game-shell'},h('div',{class:'game-hud'},button([icon('back',17),'Map'],()=>go('journey'),'text-button'),h('span',{class:'game-world'},w.name),h('span',{class:'round-position'},`${index+1} / 6`)),h('div',{class:'round-progress','aria-label':`Discovery ${index+1} of 6`},w.rounds.map((_,i)=>h('span',{class:i<index?'done':i===index?'current':''}))),h('div',{class:'round-heading'},h('p',{class:'eyebrow'},index===w.rounds.length-1?'THE WORKSHOP CHALLENGE':`DISCOVERY ${String(index+1).padStart(2,'0')}`),h('h1',{tabindex:'-1'},round.title),h('p',{class:'round-prompt'},round.prompt)),puzzle.el,h('div',{class:'hint-row'},hint,h('span',{class:'small-note'},'Think. Try. Discover.')),hintPanel,feedback));
    main.querySelector('h1').focus({preventScroll:true});window.scrollTo(0,0);
  }showRound();
}
function showGuide(){
  const main=shell('guide');
  main.append(pageHeading('YOUR POCKETFUL OF AHA!','Field notes for curious minds.','All the ideas, always available. Open a note before a challenge or revisit it when something clicks.'),h('div',{class:'guide-grid'},WORLDS.map(w=>h('details',{class:'guide-card',style:`--accent:${w.color}`},h('summary',{},h('span',{class:'guide-mark'},w.mark),h('span',{},h('strong',{},w.name),h('small',{},w.topic)),h('span',{class:'disclosure'},'+')),h('div',{class:'guide-body'},w.guide.map(p=>h('p',{},p)),h('p',{class:'takeaway'},w.takeaway),h('p',{class:'small-note'},`Ganita Prakash · Chapter ${w.chapter} · printed pages ${w.pages}`),unlocked(w)?button('Explore this workshop',()=>go(worldLink(w)),'button secondary'):h('p',{class:'small-note'},'Unlock this workshop by following the trail, or open Classroom mode in settings.'))))));
  main.append(h('aside',{class:'teacher-note'},h('h2',{},'Make room for “why?”'),h('p',{},'Ask children to predict the shape before moving a diagonal, explain why a square needs several family names, or find a counterexample to a tempting rule. Seeing a pattern is a start; explaining why it holds is the next discovery.'),h('p',{class:'small-note'},'Aligned to Ganita Prakash, Chapter 4. Trapezium means at least one parallel pair; the kite definition includes rhombuses. Schematics with assigned angles are labelled when not to scale. Original diagrams; the textbook is not bundled.')));
}
function showLab(){ const main=shell('lab');main.append(pageHeading('YOUR IDEAS. YOUR EXPERIMENTS.','The geometry playground.','Move a point, change a diagonal, or explore a family. Predict first, then test your idea.'));mountLabs(main); }
function showSettings(){
  const dialog=h('dialog',{class:'settings-dialog','aria-labelledby':'settings-title'}),opener=document.activeElement;
  const close=button(icon('close',20),()=>dialog.close(),'icon-button');close.setAttribute('aria-label','Close settings');
  const classroomInput=h('input',{type:'checkbox',checked:classroom,onchange:e=>{classroom=e.target.checked;}}),resetArea=h('div',{class:'reset-area'});
  dialog.append(h('div',{class:'dialog-heading'},h('h2',{id:'settings-title'},'Adventure settings'),close),h('label',{class:'setting-row'},h('span',{},h('strong',{},'Classroom mode'),h('small',{},'Open all five studios to teach in any order.')),classroomInput),h('p',{class:'small-note'},'Stars and progress stay on this device. Classroom mode lasts until you reload. A discovery resumes from its start; answered discoveries are saved immediately.'),h('p',{class:'offline-status'},offlineReady?'✓ The adventure is ready for offline play.':'The Android app includes every activity. Browser offline play is ready after the first complete load.'),h('p',{class:'small-note'},store.persistent()?'No account, adverts, tracking or external services. Sound is optional.':'This browser is blocking storage. You can play, but progress may not survive a reload.'),resetArea,button('Done',()=>dialog.close(),'button primary wide'));
  const reset=()=>resetArea.replaceChildren(button('Reset this device’s progress',()=>resetArea.replaceChildren(h('p',{},'Reset all Quad Quest stars and saved discoveries on this device?'),h('div',{class:'button-row'},button('Keep my progress',reset,'button secondary'),button('Yes, reset progress',()=>{store.reset();dialog.close();go('journey');},'button danger'))),'text-button danger-text'));
  reset();dialog.addEventListener('close',()=>{dialog.remove();render();if(opener?.getAttribute('aria-label')==='Adventure settings')document.querySelector('[aria-label="Adventure settings"]')?.focus();},{once:true});app.append(dialog);dialog.showModal();
}
function render(){
  activeDispose();activeDispose=()=>{};
  const [route='journey',id]=location.hash.slice(1).split('/');
  if(route==='guide')showGuide();else if(route==='lab')showLab();else if(route==='world'||route==='play'){
    const w=WORLDS.find(w=>w.id===id);if(w)(route==='play'?play:showWorld)(w);else showMap();
  }else showMap();window.scrollTo(0,0);
}
document.querySelector('.skip-link').addEventListener('click',e=>{e.preventDefault();document.getElementById('main').focus();});
window.addEventListener('hashchange',render);render();
if('serviceWorker' in navigator&&['http:','https:'].includes(location.protocol))navigator.serviceWorker.register('./sw.js').then(()=>navigator.serviceWorker.ready).then(()=>{offlineReady=true;}).catch(()=>{});
