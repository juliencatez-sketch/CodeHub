(()=>{
  const field=document.getElementById('dot-field'), glow=document.getElementById('mouse-glow');
  if(!field)return;
  const c=document.createElement('canvas'); field.appendChild(c);
  const ctx=c.getContext('2d'); let dpr=1,w=0,h=0,points=[],mx=-9999,my=-9999,raf=0;
  const spacing=23, baseRadius=.8, influence=155;
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function resize(){
    dpr=Math.min(devicePixelRatio||1,2);w=innerWidth;h=innerHeight;c.width=w*dpr;c.height=h*dpr;
    c.style.width=w+'px';c.style.height=h+'px';ctx.setTransform(dpr,0,0,dpr,0,0);points=[];
    for(let y=10;y<h+spacing;y+=spacing)for(let x=10;x<w+spacing;x+=spacing)points.push({x,y,phase:Math.random()*Math.PI*2});
  }
  function draw(t){
    ctx.clearRect(0,0,w,h);
    for(const p of points){
      const dist=Math.hypot(p.x-mx,p.y-my),k=dist<influence?Math.pow(1-dist/influence,2):0;
      let r=baseRadius+k*5.8;if(!reduce)r+=Math.sin(t*.0012+p.phase)*.12;
      ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx.fillStyle=`rgba(155,175,220,${.13+k*.75})`;ctx.fill();
    }
    if(!reduce)raf=requestAnimationFrame(draw);
  }
  addEventListener('resize',resize,{passive:true});
  addEventListener('pointermove',e=>{mx=e.clientX;my=e.clientY;glow.style.left=mx+'px';glow.style.top=my+'px';glow.style.opacity='.95'},{passive:true});
  addEventListener('pointerleave',()=>{mx=-9999;my=-9999;glow.style.opacity='0'},{passive:true});
  resize();draw(0);
})();