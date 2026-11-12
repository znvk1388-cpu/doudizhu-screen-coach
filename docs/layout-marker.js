(function () {
  'use strict';
  var M = window.LayoutModel, draft = new M.Draft(0, 0);
  var cv = document.getElementById('cv'), ctx = cv.getContext('2d');
  var stage = document.getElementById('stage'), statusEl = document.getElementById('status');
  var outEl = document.getElementById('out'), regionSelect = document.getElementById('region');
  var img = null, active = 'hand', drag = null, corner = null, cssW = 0, cssH = 0, request = 0;
  var seats = {SELF:'我的', LEFT:'左侧玩家', RIGHT:'右侧玩家', OPPOSITE:'对家'};
  function label(key) {
    if (key === 'hand') return '我的手牌点数区';
    if (key === 'controls') return '操作按钮区（可选）';
    if (key === 'bottom') return '三张底牌点数区（可选）';
    var parts = key.split(':');
    return seats[parts[1]] + (parts[0] === 'play' ? '出牌区' : '余牌张数区');
  }
  function color(key) { return key === 'hand' ? '#4c8dff' : key.indexOf('count:') === 0 ? '#6ee7b7' : '#f0b429'; }
  function setStatus(text, kind) { statusEl.textContent = text; statusEl.className = 'status ' + (kind || ''); }
  function fields() {
    var r = draft.rects[active];
    ['left','top','right','bottom'].forEach(function (key, i) {
      document.getElementById('coord-' + key).value = r ? +([r.x,r.y,r.x+r.w,r.y+r.h][i]*100).toFixed(4) : '';
    });
  }
  function choose(key) { active = key; regionSelect.value = key; corner = null; drag = null; fields(); draw(); }
  function sync() {
    outEl.value = '';
    document.getElementById('rule').value = draft.rule;
    var team = /^TEAM_/.test(draft.rule);
    document.getElementById('team-fields').hidden = !team;
    document.getElementById('chain-fields').hidden = draft.rule !== 'CLASSIC_CHAIN_54';
    var keys = M.requiredRegions(draft.rule).concat(['controls','bottom']);
    if (keys.indexOf(active) < 0) active = 'hand';
    while(regionSelect.firstChild) regionSelect.removeChild(regionSelect.firstChild);
    keys.forEach(function (key) {
      var option = document.createElement('option');
      option.value = key; option.textContent = (draft.rects[key] ? '✓ ' : '') + label(key);
      regionSelect.appendChild(option);
    });
    regionSelect.value = active;
    var missing = draft.missing(), ready = !!img && !missing.length;
    ['export','copy','save'].forEach(function (id) { document.getElementById(id).disabled = !ready; });
    document.getElementById('undo').disabled = !draft.history.length;
    var done = M.requiredRegions(draft.rule).length - missing.length;
    setStatus(img ? '必选区域 ' + done + '/' + M.requiredRegions(draft.rule).length +
      (missing.length ? '，下一步：' + label(missing[0]) : ' 已齐。下载后仍需在应用内试识别。') : '先选一张完整牌桌截图。', ready ? 'ok' : '');
    fields(); draw();
  }
  function fitCanvas() {
    if (!img) return;
    var maxW = Math.max(1, stage.clientWidth - 4), maxH = Math.max(160, Math.min(window.innerHeight*.62,720));
    var scale = Math.min(maxW/img.naturalWidth, maxH/img.naturalHeight);
    cssW = Math.max(1, Math.floor(img.naturalWidth*scale)); cssH = Math.max(1, Math.floor(img.naturalHeight*scale));
    cv.style.width = cssW+'px'; cv.style.height = cssH+'px';
    var dpr=window.devicePixelRatio || 1;
    cv.width=Math.round(cssW*dpr); cv.height=Math.round(cssH*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0); draw();
  }
  function draw() {
    if (!img) return;
    ctx.clearRect(0,0,cssW,cssH); ctx.drawImage(img,0,0,cssW,cssH);
    Object.keys(draft.rects).forEach(function (key) {
      var r=draft.rects[key], x=r.x*cssW,y=r.y*cssH,w=r.w*cssW,h=r.h*cssH;
      ctx.save(); ctx.strokeStyle=color(key); ctx.fillStyle=color(key);
      ctx.globalAlpha=.12;ctx.fillRect(x,y,w,h);ctx.globalAlpha=1;
      ctx.lineWidth=key===active?3:1.5;ctx.strokeRect(x,y,w,h);ctx.font='12px system-ui';
      if(key===active) ctx.fillText(label(key),Math.max(2,Math.min(x+3,cssW-100)),y>18?y-5:y+14);ctx.restore();
    });
    if (drag) {
      ctx.save();ctx.setLineDash([5,4]);ctx.strokeStyle=color(active);
      ctx.strokeRect(drag.x0,drag.y0,drag.x1-drag.x0,drag.y1-drag.y0);ctx.restore();
    }
    if (corner) {
      ctx.save();ctx.fillStyle=color(active);ctx.beginPath();ctx.arc(corner.x*cssW,corner.y*cssH,5,0,Math.PI*2);ctx.fill();ctx.restore();
    }
  }
  function pos(e) {
    var r=cv.getBoundingClientRect();
    return {x:Math.max(0,Math.min(cssW,(e.clientX-r.left)*cssW/r.width)),
      y:Math.max(0,Math.min(cssH,(e.clientY-r.top)*cssH/r.height))};
  }
  function commit(rect) {
    if (!rect) { setStatus('区域太小，已忽略；请重画或输入坐标。','warn');draw();return; }
    try {
      draft.setRegion(active,rect);
      var next=draft.missing()[0];
      if(next) active=next;
      corner=null;sync();
    } catch(e) {setStatus(e.message,'bad');}
  }
  cv.addEventListener('pointerdown',function(e){
    if(!img || e.button !== 0)return;
    cv.setPointerCapture(e.pointerId);var p=pos(e);
    drag={x0:p.x,y0:p.y,x1:p.x,y1:p.y};draw();
  });
  cv.addEventListener('pointermove',function(e){if(drag){var p=pos(e);drag.x1=p.x;drag.y1=p.y;draw();}});
  cv.addEventListener('pointerup',function(e){
    if(!drag)return;var p=pos(e),d=drag;drag=null;
    if(Math.hypot(p.x-d.x0,p.y-d.y0)<4){
      if(!corner){corner={x:p.x/cssW,y:p.y/cssH};setStatus('已选第一个角，再点相对的角。');draw();return;}
      var c=corner;corner=null;commit(M.normalizeRect(c.x*cssW,c.y*cssH,p.x,p.y,cssW,cssH));
    }else{corner=null;commit(M.normalizeRect(d.x0,d.y0,p.x,p.y,cssW,cssH));}
  });
  cv.addEventListener('pointercancel',function(){drag=null;corner=null;draw();});
  regionSelect.addEventListener('change',function(){choose(regionSelect.value);});
  document.getElementById('apply-coordinates').addEventListener('click',function(){
    if(!img){setStatus('请先选图。','warn');return;}
    var inputs=['left','top','right','bottom'].map(function(k){return document.getElementById('coord-'+k);});
    if(inputs.some(function(input){return input.value==='' || !input.checkValidity();})){setStatus('请填写 0–100 的四个坐标。','bad');return;}
    var v=inputs.map(function(input){return Number(input.value)/100;});
    if(v[2]<=v[0] || v[3]<=v[1]){setStatus('右、下坐标须分别大于左、上坐标。','bad');return;}
    commit({x:v[0],y:v[1],w:v[2]-v[0],h:v[3]-v[1]});
  });
  document.getElementById('pname').addEventListener('input',function(){draft.name=this.value;sync();});
  document.getElementById('rule').addEventListener('change',function(){draft.setRule(this.value);corner=null;sync();});
  document.getElementById('mate').addEventListener('change',function(){draft.mate=this.value;sync();});
  document.getElementById('chain-high').addEventListener('change',function(){draft.chainSameLengthHighWins=this.checked;sync();});
  document.getElementById('undo').addEventListener('click',function(){draft.undo();corner=null;drag=null;sync();});
  document.getElementById('clear').addEventListener('click',function(){draft.clear();corner=null;drag=null;sync();});
  ['pick','reload'].forEach(function(id){document.getElementById(id).addEventListener('click',function(){document.getElementById('file').click();});});
  document.getElementById('file').addEventListener('change',function(e){var file=e.target.files[0];e.target.value='';if(file)loadFile(file);});
  ['dragenter','dragover'].forEach(function(event){stage.addEventListener(event,function(e){e.preventDefault();stage.classList.add('drag');});});
  ['dragleave','drop'].forEach(function(event){stage.addEventListener(event,function(e){e.preventDefault();stage.classList.remove('drag');});});
  stage.addEventListener('drop',function(e){if(e.dataTransfer.files[0])loadFile(e.dataTransfer.files[0]);});
  function loadFile(file){
    if(!/^image\//.test(file.type)){setStatus('请选择图片文件。','bad');return;}
    if(Object.keys(draft.rects).length && !window.confirm('更换截图会清空当前标注。需要保留时请先取消并下载模板。继续更换？'))return;
    var token=++request,url=URL.createObjectURL(file),im=new Image();
    im.onload=function(){
      URL.revokeObjectURL(url);if(token!==request)return;
      img=im;draft=new M.Draft(im.naturalWidth,im.naturalHeight);
      draft.name=document.getElementById('pname').value;
      draft.setRule(document.getElementById('rule').value);draft.history=[];
      draft.mate=document.getElementById('mate').value;
      draft.chainSameLengthHighWins=document.getElementById('chain-high').checked;
      active='hand';corner=null;drag=null;
      document.getElementById('hint').hidden=true;cv.hidden=false;document.getElementById('tools').hidden=false;
      document.getElementById('dimensions').textContent=im.naturalWidth+' × '+im.naturalHeight+
        (im.naturalWidth<im.naturalHeight?'（竖屏：客户端校准主要按横屏设计，尚未实机验证）':'（横屏）');
      fitCanvas();sync();
    };
    im.onerror=function(){URL.revokeObjectURL(url);if(token===request)setStatus('图片读取失败，原标注已保留。','bad');};
    im.src=url;
  }
  function generate(){
    try{var doc=draft.document();outEl.value=JSON.stringify(doc,null,2);return outEl.value;}
    catch(e){setStatus(e.message,'bad');return null;}
  }
  document.getElementById('export').addEventListener('click',function(){if(generate())setStatus('已生成。到“更多识牌设置 → 备份／导入区域模板”导入，再试识别。','ok');});
  document.getElementById('copy').addEventListener('click',async function(){
    var value=generate();if(!value)return;
    try{
      if(!navigator.clipboard || !navigator.clipboard.writeText)throw Error('unavailable');
      await navigator.clipboard.writeText(value);setStatus('已复制模板。','ok');
    }catch(e){
      outEl.focus();outEl.select();
      var copied=false;try{copied=document.execCommand('copy');}catch(ignore){}
      setStatus(copied?'已复制模板。':'复制失败，已选中文本；请手动复制或下载文件。',copied?'ok':'warn');
    }
  });
  document.getElementById('save').addEventListener('click',function(){
    var value=generate();if(!value)return;
    var a=document.createElement('a'),url=URL.createObjectURL(new Blob([value],{type:'application/json'}));
    a.href=url;a.download='斗地主区域-'+draft.name.trim().replace(/[\\/:*?"<>|\u0000-\u001f]/g,'_')+'.json';
    document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url);},4000);
    setStatus('已交给浏览器下载。导入后仍需在应用内核对区域。','ok');
  });
  document.addEventListener('keydown',function(e){
    if(e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;
    var key=Number(e.key),regions=M.requiredRegions(draft.rule);
    if(key>=1 && key<=regions.length)choose(regions[key-1]);
    if(e.key==='Escape'){drag=null;corner=null;draw();}
    if((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='z'){e.preventDefault();document.getElementById('undo').click();}
  });
  window.addEventListener('resize',fitCanvas);sync();
})();
