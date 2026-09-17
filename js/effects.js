import {store} from './state.js';
// The same tiny synthesized-audio approach used by Rational Realms.
let ctx;
function tone(frequency,time,duration=.15) {
  if (store.muted()) return;
  try {
    ctx ||= new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume().catch(()=>{});
    const osc=ctx.createOscillator(), gain=ctx.createGain(), t=ctx.currentTime+time;
    osc.type='triangle'; osc.frequency.value=frequency;
    gain.gain.setValueAtTime(.0001,t); gain.gain.exponentialRampToValueAtTime(.06,t+.01); gain.gain.exponentialRampToValueAtTime(.0001,t+duration);
    osc.connect(gain).connect(ctx.destination); osc.start(t); osc.stop(t+duration+.03);
  } catch { /* Audio is optional. */ }
}
export const sound = {
  tap: () => tone(660,0,.07),
  good: () => [523,659,784].forEach((f,i)=>tone(f,i*.09)),
  retry: () => tone(260,0,.12),
  win: () => [523,659,784,1047,784,1047].forEach((f,i)=>tone(f,i*.12,.22))
};
export function celebrate() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const layer=document.getElementById('fx-layer');
  for(let i=0;i<36;i++) {
    const dot=document.createElement('i'); dot.className='confetti';
    dot.style.cssText=`left:${15+Math.random()*70}%;--x:${(Math.random()-.5)*360}px;--r:${Math.random()*720}deg;background:${['#efbd6c','#84ceb7','#e99683','#92b7e2'][i%4]};animation-delay:${Math.random()*.2}s`;
    layer.append(dot); setTimeout(()=>dot.remove(),1800);
  }
}
