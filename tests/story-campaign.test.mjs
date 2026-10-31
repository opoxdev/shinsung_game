import test from 'node:test';
import assert from 'node:assert/strict';
import {STORIES,STORY_CHARACTERS,sceneForWave,storyMilestones,storyProgress,
  storyPreviewMarkup,storyGuideMarkup,dialogueMarkup,storySceneIndex} from '../src/story.js';
import {DIFFICULTIES} from '../src/data.js';

test('six difficulties have independent stories, endings and six authored wave conversations',()=>{
  assert.equal(Object.keys(STORIES).length,DIFFICULTIES.length);
  const titles=new Set(),summaries=new Set(),endings=new Set();
  for(const difficulty of DIFFICULTIES){
    const chapter=STORIES[difficulty.id];
    assert.ok(chapter,difficulty.id);
    assert.equal(chapter.scenes.length,6,difficulty.id);
    assert.ok(chapter.synopsis.length>35);
    assert.ok(chapter.ending.length>20);
    assert.ok(chapter.failure.length>20);
    titles.add(chapter.title);summaries.add(chapter.synopsis);endings.add(chapter.ending);
    const waves=chapter.scenes.map(([wave])=>wave);
    assert.equal(waves[0],1);
    assert.equal(waves.at(-1),difficulty.waves.length,'final scene belongs to actual last wave');
    assert.deepEqual(waves,[...new Set(waves)].sort((a,b)=>a-b));
    for(const [wave,title,lines] of chapter.scenes){
      assert.ok(wave>=1&&wave<=difficulty.waves.length);
      assert.ok(title.length>3);
      assert.equal(lines.length,3,difficulty.id+' wave '+wave);
      assert.ok(new Set(lines.map(([id])=>id)).size>=2);
      for(const [id,dialogue] of lines){
        assert.ok(STORY_CHARACTERS[id],'unknown cast member '+id);
        assert.ok(dialogue.length>=12);
      }
    }
  }
  assert.equal(titles.size,6);
  assert.equal(summaries.size,6);
  assert.equal(endings.size,6);
});
test('narrative triggers only at authored waves, in ascending order',()=>{
  for(const diff of DIFFICULTIES){
    const milestones=storyMilestones(diff.id);
    assert.deepEqual(milestones.map(x=>x.wave),STORIES[diff.id].scenes.map(x=>x[0]));
    assert.equal(storyProgress(diff.id,0),0);
    assert.equal(storyProgress(diff.id,diff.waves.length),6);
    for(let w=1;w<=diff.waves.length;w++){
      const index=storySceneIndex(diff.id,w);
      assert.equal(index>=0,!!sceneForWave(diff.id,w));
      if(index>=0)assert.equal(STORIES[diff.id].scenes[index][0],w);
    }
  }
  assert.equal(sceneForWave('invalid',1),null);
});
test('archive reveals visited scenes and keeps future scenes hidden',()=>{
  for(const diff of DIFFICULTIES){
    const intro=storyPreviewMarkup(diff.id);
    assert.match(intro,new RegExp(STORIES[diff.id].title));
    assert.match(intro,/data-action="storyGuide"/);
    const full=storyGuideMarkup(diff.id,diff.waves.length);
    assert.equal((full.match(/class="story-chapter-step unlocked"/g)||[]).length,6);
    const locked=storyGuideMarkup(diff.id,0);
    assert.equal((locked.match(/미공개 기록/g)||[]).length,6);
    assert.doesNotMatch(locked,new RegExp(STORIES[diff.id].scenes[5][1]));
    const partial=storyGuideMarkup(diff.id,STORIES[diff.id].scenes[2][0]);
    assert.equal((partial.match(/class="story-chapter-step unlocked"/g)||[]).length,3);
  }
});
test('wave dialogue renders with speaker identity, progression and manual controls',()=>{
  for(const diff of DIFFICULTIES){
    const html=dialogueMarkup(diff.id,0,0);
    assert.match(html,/STORY · WAVE 1/);
    assert.match(html,/data-action="storyNext"/);
    assert.match(html,/data-action="storyDismiss"/);
    assert.match(html,/story-speaker-name/);
    assert.match(html,/story-line-track/);
    assert.equal((html.match(/<i class="/g)||[]).length,3);
    assert.equal(dialogueMarkup(diff.id,0,10),'');
  }
});
test('story reads do not alter combat data or wave balance',()=>{
  const diff=DIFFICULTIES[0];
  const snapshot=JSON.stringify(diff.waves[0]);
  storyPreviewMarkup(diff.id);
  dialogueMarkup(diff.id,0,0);
  storyGuideMarkup(diff.id,10);
  assert.equal(JSON.stringify(diff.waves[0]),snapshot);
});
