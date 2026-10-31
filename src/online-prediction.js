import {STEP,tick} from './engine.js';

// Prediction runs on a CLONE of the authoritative state. Local ticks are
// visual only; commands, balances, rewards and results remain server-owned.
export function visualPrediction(authoritative,elapsed,previous=null,previousSource=null){
  if(!authoritative||authoritative.status!=='playing')return {state:authoritative,source:authoritative};
  let state=previousSource===authoritative&&previous?previous:JSON.parse(JSON.stringify(authoritative));
  const target=authoritative.time+Math.min(2.9,Math.max(0,elapsed));
  let steps=0;
  // Keep the main thread responsive after tab restoration or slow devices.
  while(steps<12&&state.status==='playing'&&state.time+STEP*.5<target){
    tick(state);steps++;
  }
  return {state,source:authoritative};
}

