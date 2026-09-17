import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {WORLDS} from '../www/js/content.js';
const arg=name=>process.argv.find(a=>a.startsWith(`--${name}=`))?.slice(name.length+3);
const {chromium}=await import(arg('playwright')||'playwright');
const browser=await chromium.launch({headless:true,...(arg('chromium')?{executablePath:arg('chromium')}:{})});
const base=arg('url')||'http://localhost:8160/';
const context=await browser.newContext({viewport:{width:1440,height:1050},reducedMotion:'reduce'}),page=await context.newPage(),errors=[];
page.on('pageerror',error=>errors.push(error.message));
await mkdir('test-results',{recursive:true});
const shot=name=>page.screenshot({path:`test-results/${name}.png`,fullPage:true});
const heading=title=>page.getByRole('heading',{name:title,exact:true}).waitFor();
async function noOverflow(){const result=await page.evaluate(()=>({ok:document.documentElement.scrollWidth<=innerWidth+1,width:innerWidth,scroll:document.documentElement.scrollWidth,offenders:[...document.querySelectorAll('main *,header *,footer *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1).map(e=>({tag:e.tagName,cls:e.className?.baseVal??e.className,right:e.getBoundingClientRect().right})).slice(0,15)}));assert.ok(result.ok,JSON.stringify(result));}
async function setDial(label,n){const input=page.getByRole('slider',{name:label,exact:true});const min=Number(await input.getAttribute('min')),step=Number(await input.getAttribute('step'))||1;await input.focus();await input.press('Home');for(let i=min;i<n;i+=step)await input.press('ArrowRight');assert.equal(await input.inputValue(),String(n));}
async function solve(q){
  if(q.type==='choice')await page.getByRole('button',{name:q.answer,exact:true}).click();
  else if(q.type==='number'){await page.getByRole('textbox',{name:'Your answer'}).fill(String(q.answer));await page.getByRole('button',{name:'Check answer',exact:true}).click();}
  else{
    if(q.type==='select')for(const n of q.answer)await page.getByRole('button',{name:n,exact:true}).click();
    if(q.type==='geoboard')await page.getByRole('button',{name:`Peg ${q.answer.join(', ')}`,exact:true}).click();
    if(q.type==='diagonals'){if(!q.fixedLength)await setDial('BD length',q.answerLength);await setDial('Crossing angle',q.answerAngle);}
    if(q.type==='order')for(const step of q.steps)await page.locator('.proof-bank').getByRole('button',{name:step,exact:true}).click();
    await page.getByRole('button',{name:'Check answer',exact:true}).click();
  }
  await page.locator('.feedback.success').waitFor();
}
try{
  await page.goto(base);await heading(/Four sides/);await shot('desktop-home');await noOverflow();
  await page.setViewportSize({width:Number(arg('width'))||390,height:844});await shot('mobile-home');await noOverflow();
  assert.equal(await page.locator('.world-card:disabled').count(),4);
  await page.getByRole('button',{name:'Start your adventure',exact:true}).click();await page.getByRole('button',{name:'Let’s build',exact:true}).click();await heading(WORLDS[0].rounds[0].title);await shot('mobile-square');
  if(process.argv.includes('--full')){
    await page.getByRole('button',{name:'Check answer',exact:true}).click();await page.getByRole('button',{name:'Check answer',exact:true}).click();
    await page.getByRole('button',{name:'Show me how',exact:true}).click();assert.ok((await page.locator('.hint-panel').innerText()).length>20);
    await page.getByRole('button',{name:'Map',exact:true}).click();await page.reload();await page.getByRole('button',{name:'Continue adventure',exact:true}).click();await page.getByRole('button',{name:'Resume workshop',exact:true}).click();
    let count=0;
    for(const [wi,w] of WORLDS.entries()){
      if(wi){await page.getByRole('button',{name:`Next: ${w.name}`,exact:true}).click();await page.getByRole('button',{name:'Let’s build',exact:true}).click();}
      for(const [qi,q] of w.rounds.entries()){
        await heading(q.title);await noOverflow();
        if(['square-diagonals','square-passports','fourth-angle','triangle-join','rhombus-proof','kite-bisection','rotated-square'].includes(q.id))await shot(q.id);
        await solve(q);count++;
        if(wi===0&&qi===0){await page.reload();continue;}
        await page.getByRole('button',{name:qi===5?'Collect discovery':'Next discovery',exact:true}).click();
      }
      await page.locator('.results-card').waitFor();console.log(`✓ ${w.name}: ${w.rounds.length} activities`);
    }
    assert.equal(count,30);await heading('A true shape architect.');await shot('completed');
    assert.equal(await page.locator('.star-total').getAttribute('aria-label'),'14 of 15 stars');
    await page.getByRole('button',{name:'Back to the adventure',exact:true}).click();assert.equal(await page.locator('.world-card:disabled').count(),0);
    // Replay must not erase an existing best result; first result resumes at a saved boundary.
    await page.getByRole('button',{name:/The Frame Studio\./}).click();await page.getByRole('button',{name:'Let’s build',exact:true}).click();
    for(const [i,q] of WORLDS[0].rounds.entries()){await solve(q);await page.getByRole('button',{name:i===5?'Collect discovery':'Next discovery',exact:true}).click();}
    assert.equal(await page.locator('.star-total').getAttribute('aria-label'),'15 of 15 stars');
    await page.getByRole('button',{name:'Adventure',exact:true}).click();
  }else if(process.argv.includes('--deployed')){
    await solve(WORLDS[0].rounds[0]);await page.getByRole('button',{name:'Next discovery',exact:true}).click();await heading(WORLDS[0].rounds[1].title);
  }
  await page.getByRole('button',{name:'Field notes',exact:true}).click();await page.locator('summary').first().click();await noOverflow();await shot('field-notes');
  await page.getByRole('button',{name:'Play lab',exact:true}).click();await page.getByLabel('Moving vertex',{exact:true}).selectOption('2');await page.getByRole('button',{name:'Peg 1, 1',exact:true}).click();assert.ok((await page.locator('.lab-panel').innerText()).includes('distinct'));
  await page.getByRole('button',{name:'Reset the geoboard',exact:true}).click();await page.getByLabel('Moving vertex',{exact:true}).selectOption('2');await page.getByLabel('Horizontal coordinate',{exact:true}).selectOption('4');assert.equal(await page.getByLabel('Horizontal coordinate',{exact:true}).inputValue(),'4');await shot('free-geoboard');
  await page.getByRole('button',{name:'Diagonal rig',exact:true}).click();await setDial('Crossing angle',90);assert.ok((await page.locator('.diagonal-rig').innerText()).includes('Square'));await setDial('BD length',8);assert.ok((await page.locator('.diagonal-rig').innerText()).includes('Rhombus'));assert.ok(!(await page.locator('.diagonal-rig').innerText()).includes('Square'));await shot('diagonal-lab');
  await page.getByRole('button',{name:'Shape families',exact:true}).click();await page.getByLabel('Example shape',{exact:true}).selectOption('concave');assert.ok((await page.locator('.family-properties').innerText()).includes('360°'));assert.equal(await page.locator('.family-table td').filter({hasText:/^Yes$/}).count(),2);await shot('family-lab');
  const scope=await page.evaluate(async()=>(await navigator.serviceWorker.ready).scope);assert.equal(scope,new URL('./',base).href);
  await context.setOffline(true);await page.reload();await heading('The geometry playground.');await page.getByRole('button',{name:'Free geoboard',exact:true}).waitFor();
  console.log('✓ All three labs, field notes, correct service-worker scope and offline reload');
  await context.setOffline(false);
  for(const width of [320,768]){
    await page.setViewportSize({width,height:1000});await page.getByRole('button',{name:'Adventure',exact:true}).click();await noOverflow();await shot(`home-${width}`);
  }
  await page.getByRole('button',{name:'Adventure settings',exact:true}).click();await page.getByLabel('Classroom mode').check();await page.getByRole('button',{name:'Done',exact:true}).click();await page.locator('.settings-dialog').waitFor({state:'detached'});await page.locator('.classroom-banner').waitFor();assert.equal(await page.locator('.world-card:disabled').count(),0);
  await page.getByRole('button',{name:'Adventure settings',exact:true}).click();await page.getByRole('button',{name:'Reset this device’s progress',exact:true}).click();await page.getByRole('button',{name:'Keep my progress',exact:true}).click();await page.getByRole('button',{name:'Close settings',exact:true}).click();
  await page.getByRole('button',{name:'Mute sound',exact:true}).click();await page.reload();await page.getByRole('button',{name:'Turn sound on',exact:true}).waitFor();
  if(!process.argv.includes('--full'))assert.equal(await page.locator('.world-card:disabled').count(),4);
  await page.getByRole('button',{name:'Adventure settings',exact:true}).click();await page.getByRole('button',{name:'Reset this device’s progress',exact:true}).click();await page.getByRole('button',{name:'Yes, reset progress',exact:true}).click();
  assert.equal(await page.locator('.star-total').getAttribute('aria-label'),'0 of 15 stars');assert.equal(await page.locator('.world-card:disabled').count(),4);
  assert.deepEqual(errors,[]);console.log('✓ Phone/tablet layouts, classroom controls, confirmed/cancelled reset, sound persistence; no runtime errors');
}catch(error){console.error('Browser runtime errors:',errors);console.error('Current page:',await page.locator('body').innerText());await shot('failure');throw error;}finally{await browser.close();}
