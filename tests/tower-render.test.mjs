import test from 'node:test';
import assert from 'node:assert/strict';
import {Renderer} from '../src/render.js';

// Regression: the SVG raster cache stores {source, ready}, not an Image.
// A canvas base ring without a visible character is not a rendered tower.
test('placed towers draw the cached sprite, and fall back to the SVG image if rasterization fails',()=>{
  const previousImage=globalThis.Image,previousCanvas=globalThis.OffscreenCanvas;
  const drawn=[];
  let conversions=0,failRaster=false;
  class FakeImage {
    set src(value){
      assert.match(value,/^data:image\/svg\+xml/);
      this.complete=true;
      this.naturalWidth=180;
      this.onload?.();
    }
  }
  class FakeOffscreenCanvas {
    getContext(){
      if(failRaster)throw Error('Canvas unavailable');
      return {drawImage(source){assert.ok(source instanceof FakeImage);conversions++;}};
    }
    transferToImageBitmap(){return {kind:'raster-bitmap'};}
  }
  const ctx={
    save(){},restore(){},translate(){},scale(){},beginPath(){},
    ellipse(){},fill(){},stroke(){},fillRect(){},
    drawImage(...args){drawn.push(args);}
  };
  const tower=(type,angle=0)=>Renderer.prototype.tower.call({},ctx,{
    type,skin:'default',level:0,x:250,y:340,angle
  },1,1);
  try{
    globalThis.Image=FakeImage;
    globalThis.OffscreenCanvas=FakeOffscreenCanvas;
    tower('scout',Math.PI);
    assert.equal(drawn.length,1,'A placed tower must draw its character sprite');
    assert.equal(drawn[0][0].kind,'raster-bitmap','Draw the cached bitmap, not its wrapper');
    assert.equal(conversions,1);
    tower('scout');
    assert.equal(drawn.length,2);
    assert.equal(conversions,1,'Repeated frames reuse the rasterized sprite');

    // A cache-conversion failure must not leave a permanent invisible tower.
    failRaster=true;
    tower('blade');
    assert.equal(drawn.length,3);
    assert.ok(drawn[2][0] instanceof FakeImage,'Use the loaded SVG image as fallback');
  }finally{
    if(previousImage===undefined)delete globalThis.Image;
    else globalThis.Image=previousImage;
    if(previousCanvas===undefined)delete globalThis.OffscreenCanvas;
    else globalThis.OffscreenCanvas=previousCanvas;
  }
});
