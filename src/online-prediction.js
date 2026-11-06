import {STEP,tick} from './engine.js';

// Prediction runs on a CLONE of the authoritative state. Local ticks are
// visual only; commands, balances, rewards and results remain server-owned.
export function visualPrediction(authoritative,elapsed,previous=null,previousSource=null){
  if(!authoritative||authoritative.status!=='playing')return {state:authoritative,source:authoritative};
  let state=previousSource===authoritative&&previous?previous:JSON.parse(JSON.stringify(authoritative));
  const target=authoritative.time+Math.min(4.25,Math.max(0,elapsed));
  let steps=0;
  // Never run a large authoritative prediction burst inside a single
  // animation frame. Visual movement continues via MotionView interpolation.
  // Dense multiplayer fights need an even smaller budget to avoid frame spikes.
  const budget=state.enemies.length>=160?2:state.enemies.length>=75?3:4;
  while(steps<budget&&state.status==='playing'&&state.time+STEP*.5<target){
    tick(state);steps++;
  }
  return {state,source:authoritative};
}

