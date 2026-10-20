(() => {
  const PLACES = window.CAMPUS_PLACES || [];
  if (!PLACES.length) return;

  const SOURCE = {
    campus: "https://photo.sina.cn/album_37_88171_570970.htm?ch=37&hd=1&vt=4",
    museum: "https://www.yljzc.com/zh_m/News_16887.html",
    education: "https://jyt.ln.gov.cn/jyt/jyzx/jyyw/10C75312802C4A11BC8A9414992CB9EB/index.shtml",
    lake: "https://www.jynsvc.com/yurenhao1/a/sylgdx/260416/2372495.shtml",
    athletics: "https://yurenhao1.sizhengwang.cn/a/sylgdx/230628/1560439.shtml",
    library: "https://www.sohu.com/a/167390473_796904",
    northGate: "https://ditu.amap.com/place/B00181C5XY",
    schoolHistory: "https://www.gx211.cn/collegemanage/content330_03.shtml",
    ministryRename: "https://www.moe.gov.cn/srcsite/A03/s181/200405/t20040513_77454.html",
    anniversary: "https://www.sohu.com/a/255715455_664963",
    openDay: "https://jyt.ln.gov.cn/jyt/index/gdjy/2026052510341622132/index.shtml"
  };

  const state = { start:null, end:null, mode:"walk", pickMode:null, routes:[], activeRoute:0, points:new Map(), bikeVisible:true };
  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (ch) => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[ch]));

  function pinNumber(element) {
    if (!element) return null;
    const number = Number(element.dataset.mapNumber || element.dataset.placeNumber || element.dataset.number);
    if (number && PLACES.some((place) => place.number === number)) return number;
    const rawId = element.dataset.placeId || element.dataset.id;
    const byId = PLACES.find((place) => place.id === rawId);
    if (byId) return byId.number;
    const label = [element.getAttribute("aria-label"), element.title, element.textContent].filter(Boolean).join(" ");
    const match = [...PLACES].sort((a,b) => b.name.length-a.name.length).find((place) => label.includes(place.name));
    return match?.number || null;
  }

  function ensurePointEntries() {
    const plane = document.getElementById("map-plane");
    const container = document.getElementById("map-pins");
    if (!plane || !container) return new Map();
    const planeBox = plane.getBoundingClientRect();
    const next = new Map();
    const pins = [...container.querySelectorAll("button,[role='button']")];
    for (const pin of pins) {
      const number = pinNumber(pin);
      if (!number) continue;
      let x, y;
      const left = pin.style.left, top = pin.style.top;
      if (left.endsWith("%") && top.endsWith("%")) {
        x = parseFloat(left) * 10.24;
        y = parseFloat(top) * 6.8;
      } else {
        const box = pin.getBoundingClientRect();
        x = ((box.left + box.width/2 - planeBox.left) / planeBox.width) * 1024;
        y = ((box.top + box.height/2 - planeBox.top) / planeBox.height) * 680;
      }
      next.set(number, { number, x, y, element:pin });
    }
    state.points = next;
    return next;
  }

  function plannerMarkup() {
    return `
      <button type="button" class="map-nav-launch" aria-expanded="false" aria-controls="map-nav-panel"><span class="map-nav-launch__glyph">↗</span><span><strong>路线规划</strong><small>选择起点与终点</small></span><span class="map-nav-launch__chevron">⌄</span></button>
      <section class="map-nav-panel" id="map-nav-panel" hidden aria-label="校园路线规划">
        <header class="map-nav-panel__head"><div><small>SHENYANG LIGONG · CAMPUS</small><h2>校园导航</h2></div><button type="button" class="map-nav-close" aria-label="收起路线规划">×</button></header>
        <div class="map-nav-form">
          <label><span class="map-nav-dot map-nav-dot--start">A</span><select id="nav-start" aria-label="起点"><option value="">选择起点</option></select><button type="button" data-pick="start">地图选点</button></label>
          <div class="map-nav-link"></div>
          <label><span class="map-nav-dot map-nav-dot--end">B</span><select id="nav-end" aria-label="终点"><option value="">选择终点</option></select><button type="button" data-pick="end">地图选点</button></label>
        </div>
        <div class="map-nav-modes"><button type="button" data-mode="walk" class="is-active">步行</button><button type="button" data-mode="bike">骑行</button><button type="button" class="map-bike-toggle is-active" aria-pressed="true">🚲 单车点</button></div>
        <p class="map-nav-hint" id="map-nav-hint">可以从列表选择，也可以按“地图选点”后点击地图地点。</p>
        <button type="button" id="nav-search-route" class="map-nav-search">推荐路线</button>
        <div class="map-nav-results" id="map-nav-results"></div>
        <div class="map-nav-disclaimer">校园路线与骑行停放点为地图示意；不含实时交通、车辆数量或校门开放状态。</div>
      </section>
      <div class="bike-map-legend" aria-live="polite"><span class="bike-map-legend__icon">🚲</span><span>自行车参考停放点</span><button type="button" aria-label="说明自行车点位">i</button><div class="bike-map-legend__tip">按校园入口、图书馆和食堂附近设置的示意点位，需现场核实；不代表实时有车。</div></div>
      <div class="map-nav-pick-toast" id="map-nav-pick-toast" hidden></div>
    `;
  }

  function ensureStyles() {
    const style = document.createElement("style");
    style.textContent = `
      #map-viewport{position:relative}
      .map-nav-launch{position:absolute;z-index:40;left:14px;top:14px;display:flex;align-items:center;gap:10px;min-width:172px;padding:10px 13px;border:1px solid rgba(23,59,52,.12);border-radius:14px;background:rgba(250,248,242,.96);box-shadow:0 8px 24px rgba(24,42,36,.16);color:#173b34;text-align:left;cursor:pointer;backdrop-filter:blur(12px)}
      .map-nav-launch__glyph{display:grid;place-items:center;width:32px;height:32px;border-radius:10px;background:#173b34;color:#f7f4e9;font-size:18px}
      .map-nav-launch strong,.map-nav-launch small{display:block}.map-nav-launch strong{font-size:13px}.map-nav-launch small{margin-top:2px;color:#738078;font-size:10px}.map-nav-launch__chevron{margin-left:auto;color:#869089}
      .map-nav-panel{position:absolute;z-index:42;left:14px;top:61px;width:min(350px,calc(100% - 28px));max-height:min(76vh,640px);overflow:auto;padding:18px;border:1px solid rgba(23,59,52,.12);border-radius:17px;background:rgba(250,248,242,.98);box-shadow:0 18px 48px rgba(24,42,36,.2);color:#173b34;backdrop-filter:blur(15px)}
      .map-nav-panel[hidden]{display:none}.map-nav-panel__head{display:flex;align-items:start;justify-content:space-between;margin-bottom:16px}.map-nav-panel__head small{font-size:9px;letter-spacing:.17em;color:#a04e3d}.map-nav-panel__head h2{margin:4px 0 0;font-family:"Noto Serif SC","Songti SC",serif;font-size:24px}.map-nav-close{border:0;background:transparent;color:#53635b;font-size:23px;cursor:pointer}
      .map-nav-form{position:relative;display:grid;gap:7px}.map-nav-form label{display:flex;align-items:center;gap:8px;position:relative}.map-nav-form select{width:0;flex:1;min-width:0;height:40px;padding:0 10px;border:1px solid #ddd8c9;border-radius:9px;background:#fffefa;color:#263c35;font:inherit;font-size:12px}.map-nav-form label>button{height:36px;padding:0 9px;border:1px solid #ddd8c9;border-radius:9px;background:#fffefa;color:#54655d;font-size:10px;white-space:nowrap;cursor:pointer}.map-nav-dot{display:grid;place-items:center;width:22px;height:22px;flex:0 0 auto;border-radius:50%;font-size:10px;font-weight:700}.map-nav-dot--start{background:#173b34;color:white}.map-nav-dot--end{background:#c94b38;color:white}.map-nav-link{height:7px;width:1px;margin:-6px 0 -6px 10px;background:#c6c4b5}
      .map-nav-modes{display:flex;gap:7px;margin:14px 0 8px}.map-nav-modes button{padding:7px 11px;border:1px solid #dfdccf;border-radius:20px;background:#fffefa;color:#59665f;font-size:11px;cursor:pointer}.map-nav-modes button.is-active{border-color:#173b34;background:#173b34;color:white}.map-nav-modes .map-bike-toggle{margin-left:auto}.map-nav-hint{min-height:17px;margin:8px 0;color:#7a817a;font-size:10px;line-height:1.6}.map-nav-search{width:100%;height:40px;border:0;border-radius:9px;background:#c94b38;color:white;font-weight:650;cursor:pointer}.map-nav-search:hover{background:#ab3d2e}
      .map-nav-results{display:grid;gap:8px;margin-top:12px}.map-route-option{padding:11px;border:1px solid #e4e0d4;border-radius:11px;background:#fffefa;cursor:pointer}.map-route-option.is-active{border-color:#4c7564;box-shadow:0 0 0 2px rgba(76,117,100,.12)}.map-route-option__top{display:flex;justify-content:space-between;gap:10px}.map-route-option strong{font-size:12px}.map-route-option__meta{color:#64736a;font-size:10px;white-space:nowrap}.map-route-option p{margin:5px 0 0;color:#69746d;font-size:10px;line-height:1.55}.map-route-steps{margin:9px 0 0;padding:0 0 0 16px;color:#46584f;font-size:10px;line-height:1.8}.map-nav-disclaimer{margin-top:12px;padding-top:10px;border-top:1px solid #e8e3d6;color:#858981;font-size:9px;line-height:1.6}
      .bike-map-legend{position:absolute;z-index:39;right:14px;top:14px;display:flex;align-items:center;gap:7px;padding:8px 10px;border:1px solid rgba(23,59,52,.12);border-radius:12px;background:rgba(250,248,242,.95);box-shadow:0 6px 20px rgba(24,42,36,.12);color:#31574a;font-size:10px;backdrop-filter:blur(12px)}.bike-map-legend__icon{font-size:15px}.bike-map-legend>button{width:16px;height:16px;padding:0;border:1px solid #b6c2b8;border-radius:50%;background:transparent;color:#436353;font-size:10px;cursor:pointer}.bike-map-legend__tip{display:none;position:absolute;right:0;top:calc(100% + 7px);width:200px;padding:10px;border-radius:9px;background:#173b34;color:#fff;font-size:10px;line-height:1.6;box-shadow:0 8px 20px #0002}.bike-map-legend.is-open .bike-map-legend__tip{display:block}
      .bike-markers-layer{position:absolute;z-index:12;inset:0;pointer-events:none}.bike-map-marker{position:absolute;pointer-events:auto;transform:translate(-50%,-50%);display:flex;align-items:center;gap:5px;padding:4px 7px;border:1px solid rgba(16,67,53,.18);border-radius:999px;background:#f8fff9;color:#1d654e;font-size:9px;font-weight:650;white-space:nowrap;box-shadow:0 3px 10px rgba(16,55,43,.2);cursor:help}.bike-map-marker__icon{display:grid;place-items:center;width:18px;height:18px;border-radius:50%;background:#2a8e68;color:white;font-size:12px}.bike-map-marker[hidden]{display:none}
      .nav-route-svg{position:absolute;z-index:6;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none}.nav-route-shadow{fill:none;stroke:rgba(255,255,255,.9);stroke-width:12;stroke-linecap:round;stroke-linejoin:round}.nav-route-line{fill:none;stroke:#d34d36;stroke-width:6;stroke-linecap:round;stroke-linejoin:round;filter:drop-shadow(0 1px 2px rgba(60,26,14,.35))}.nav-route-line.is-bike{stroke:#2b8a68}.nav-route-marker circle{stroke:white;stroke-width:4}.nav-route-marker text{font:700 17px system-ui;fill:white;text-anchor:middle;dominant-baseline:central}.map-nav-pick-toast{position:absolute;z-index:45;left:50%;bottom:16px;transform:translateX(-50%);padding:9px 14px;border-radius:999px;background:#173b34;color:white;font-size:11px;box-shadow:0 8px 24px #0003}.map-nav-pick-toast[hidden]{display:none}
      .place-story-card{margin:14px 0 20px;padding:15px 16px 14px;border:1px solid rgba(25,59,53,.14);border-left:3px solid #c94b38;border-radius:10px;background:linear-gradient(145deg,#faf8f1,#f0eee5);color:#243c34}.place-story-card__eyebrow{margin:0 0 5px;color:#ad4b3a;font-size:9px;font-weight:700;letter-spacing:.16em}.place-story-card h3{margin:0 0 8px;font-family:"Noto Serif SC","Songti SC",serif;font-size:17px;line-height:1.45}.place-story-card p{margin:7px 0;color:#536259;font-size:11px;line-height:1.8}.place-story-card__fact{padding:9px 10px;border-radius:7px;background:#e8e7db;color:#354f43!important}.place-story-card__source{display:inline-block;margin-top:3px;color:#3f6a57;font-size:10px;text-decoration:underline;text-underline-offset:3px}
      @media(max-width:760px){.map-nav-launch{left:8px;top:8px}.map-nav-panel{left:8px;top:54px;width:min(340px,calc(100% - 16px));padding:14px}.bike-map-legend{right:8px;top:8px;padding:6px 8px}.bike-map-legend>span:nth-child(2){max-width:70px;line-height:1.2}.bike-map-marker{font-size:0;padding:3px}.bike-map-marker__icon{width:17px;height:17px}.place-story-card{padding:13px}}
    `;
    document.head.append(style);
  }

  function distancePx(a,b) { return Math.abs(a.x-b.x) + Math.abs(a.y-b.y); }
  function appendLeg(output, a, b) {
    const middleY = Math.max(20, Math.min(66, (a.y+b.y)/2));
    const bendA = [{x:a.x,y:middleY},{x:b.x,y:middleY}];
    const bendB = [{x:Math.max(7,Math.min(96,(a.x+b.x)/2)),y:a.y},{x:Math.max(7,Math.min(96,(a.x+b.x)/2)),y:b.y}];
    const costA = Math.abs(a.y-middleY)+Math.abs(b.y-middleY)+Math.abs(a.x-b.x);
    const costB = Math.abs(a.x-bendB[0].x)+Math.abs(b.x-bendB[0].x)+Math.abs(a.y-b.y);
    const bends = costA <= costB ? bendA : bendB;
    output.push(...bends,b);
  }
  function makePath(stops) {
    const path=[];
    for (let i=0;i<stops.length-1;i++) appendLeg(path,stops[i],stops[i+1]);
    return [stops[0],...path];
  }
  function polylineLength(points) {
    return points.slice(1).reduce((total,p,i)=>total+Math.hypot(p.x-points[i].x,p.y-points[i].y),0);
  }
  function formatDistance(meters) { return meters >= 1000 ? `${(meters/1000).toFixed(1)} 公里` : `${Math.round(meters/10)*10} 米`; }
  function estimateMinutes(meters) { return Math.max(1,Math.round(meters/(state.mode === "bike" ? 220 : 72))); }
  function routeSteps(route) {
    const points=route.stops;
    const first=PLACES.find((p)=>p.number===state.start)?.name || "起点";
    const last=PLACES.find((p)=>p.number===state.end)?.name || "终点";
    const steps=[`从${first}出发，接入校园主通道。`];
    if (points.length>2) steps.push(`途经${PLACES.find((p)=>p.number===route.via)?.name || "校园地标"}，沿地图通道继续前行。`);
    steps.push(`按地图路线前往${last}，抵达终点。`);
    return steps;
  }

  function computeRoutes() {
    const points=ensurePointEntries();
    const start=points.get(Number(state.start)), end=points.get(Number(state.end));
    if (!start || !end || state.start === state.end) return [];
    const shortestStops=[start,end];
    const options=[{id:"main",title:"校园主通道 · 推荐",summary:"按地图通道示意规划，转弯较少。",stops:shortestStops,via:null}];
    const landmarks=[1,14,15,38,43,44].filter((number)=>number!==Number(state.start)&&number!==Number(state.end)).map((number)=>points.get(number)).filter(Boolean);
    const direct=distancePx(start,end);
    const scenic=landmarks.map((point)=>({point,extra:distancePx(start,point)+distancePx(point,end)-direct})).filter((item)=>item.extra>6).sort((a,b)=>a.extra-b.extra)[0];
    if (scenic && scenic.extra < 185) {
      const place=PLACES.find((item)=>item.number===scenic.point.number);
      options.push({id:"scenic",title:`经${place?.name || "校园地标"} · 探索路线`,summary:"多看一处校园地标，适合慢逛。",stops:[start,scenic.point,end],via:scenic.point.number});
    }
    return options.map((route)=>{
      const shape=makePath(route.stops);
      const meters=polylineLength(shape)*1.3;
      return {...route,shape,meters,minutes:estimateMinutes(meters)};
    });
  }

  function ensureSvg() {
    const plane=document.getElementById("map-plane");
    if (!plane) return null;
    let svg=plane.querySelector("#navigation-path-svg");
    if (!svg) {
      svg=document.createElementNS("http://www.w3.org/2000/svg","svg");
      svg.id="navigation-path-svg";svg.setAttribute("viewBox","0 0 1024 680");svg.setAttribute("preserveAspectRatio","none");svg.classList.add("nav-route-svg");
      plane.append(svg);
    }
    return svg;
  }

  function renderPath(route) {
    const svg=ensureSvg();if(!svg)return;
    const pathD=route.shape.map((p,i)=>`${i?"L":"M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
    const start=route.stops[0],end=route.stops[route.stops.length-1];
    svg.innerHTML=`<path class="nav-route-shadow" d="${pathD}"/><path class="nav-route-line ${state.mode === "bike" ? "is-bike" : ""}" d="${pathD}"/><g class="nav-route-marker"><circle cx="${start.x}" cy="${start.y}" r="14" fill="#173b34"/><text x="${start.x}" y="${start.y}">A</text></g><g class="nav-route-marker"><circle cx="${end.x}" cy="${end.y}" r="14" fill="#c94b38"/><text x="${end.x}" y="${end.y}">B</text></g>`;
    const old=document.getElementById("route-overlay");if(old)old.style.opacity="0";
  }

  function clearPath() {
    const svg=document.getElementById("navigation-path-svg");if(svg)svg.innerHTML="";
    const old=document.getElementById("route-overlay");if(old)old.style.opacity="";
  }

  function renderOptions() {
    const result=document.getElementById("map-nav-results");
    if(!result)return;
    if(!state.routes.length){result.innerHTML="";return;}
    result.innerHTML=state.routes.map((route,index)=>`<article class="map-route-option ${index===state.activeRoute?"is-active":""}" data-route-index="${index}" tabindex="0" role="button" aria-label="选择${escapeHtml(route.title)}"><div class="map-route-option__top"><strong>${escapeHtml(route.title)}</strong><span class="map-route-option__meta">${route.minutes} 分钟 · ${formatDistance(route.meters)}</span></div><p>${escapeHtml(route.summary)}</p><ol class="map-route-steps">${routeSteps(route).map((step)=>`<li>${escapeHtml(step)}</li>`).join("")}</ol></article>`).join("");
    renderPath(state.routes[state.activeRoute]);
  }

  function calculate() {
    if(!state.start||!state.end){setHint("请先选择起点和终点。",true);return;}
    if(state.start===state.end){setHint("起点和终点不能是同一个地点。",true);return;}
    state.routes=computeRoutes();state.activeRoute=0;
    if(!state.routes.length){setHint("地图点位还未加载，请先打开校园地图后再试。",true);return;}
    setHint(`已生成${state.mode==="bike"?"骑行":"步行"}路线示意，可切换方案查看。`);
    renderOptions();
  }
  function setHint(text,error=false){const hint=document.getElementById("map-nav-hint");if(hint){hint.textContent=text;hint.classList.toggle("is-error",error);}}
  function fillSelects() {
    for(const id of ["nav-start","nav-end"]){
      const select=document.getElementById(id);if(!select)continue;
      const selected=id==="nav-start"?state.start:state.end;
      select.innerHTML=`<option value="">选择${id==="nav-start"?"起点":"终点"}</option>${PLACES.map((place)=>`<option value="${place.number}" ${String(selected)===String(place.number)?"selected":""}>${String(place.number).padStart(2,"0")} · ${escapeHtml(place.name)}</option>`).join("")}`;
    }
  }

  function positionBikeMarkers() {
    const plane=document.getElementById("map-plane");if(!plane)return;
    ensurePointEntries();
    let layer=plane.querySelector(".bike-markers-layer");if(!layer){layer=document.createElement("div");layer.className="bike-markers-layer";plane.append(layer);}
    const locations=[{near:40,label:"北门参考停放点",dx:4,dy:3},{near:41,label:"南门参考停放点",dx:4,dy:-2.4},{near:42,label:"东门参考停放点",dx:-5,dy:3},{near:1,label:"图书馆周边参考点",dx:5,dy:5},{near:20,label:"学生食堂周边参考点",dx:-5,dy:3}];
    layer.innerHTML=locations.map((station)=>{
      const point=state.points.get(station.near);if(!point)return "";
      const left=Math.max(4,Math.min(96,point.x/10.24+station.dx));
      const top=Math.max(7,Math.min(90,point.y/6.8+station.dy));
      return `<span class="bike-map-marker" style="left:${left}%;top:${top}%" title="${station.label}：示意位置，非实时车辆信息"><span class="bike-map-marker__icon">🚲</span><span>${station.label}</span></span>`;
    }).join("");
    layer.hidden=!state.bikeVisible;
  }

  function mountPlanner() {
    const viewport=document.getElementById("map-viewport");
    if(!viewport||viewport.querySelector(".map-nav-launch"))return;
    const shell=document.createElement("div");shell.className="map-nav-shell";shell.innerHTML=plannerMarkup();viewport.append(shell);
    const launch=shell.querySelector(".map-nav-launch"),panel=shell.querySelector(".map-nav-panel");
    launch.addEventListener("click",()=>{const open=panel.hidden;panel.hidden=!open;launch.setAttribute("aria-expanded",String(open));});
    shell.querySelector(".map-nav-close").addEventListener("click",()=>{panel.hidden=true;launch.setAttribute("aria-expanded","false");});
    shell.querySelector("#nav-start").addEventListener("change",(event)=>{state.start=event.target.value?Number(event.target.value):null;});
    shell.querySelector("#nav-end").addEventListener("change",(event)=>{state.end=event.target.value?Number(event.target.value):null;});
    shell.querySelectorAll("[data-pick]").forEach((button)=>button.addEventListener("click",()=>{
      state.pickMode=button.dataset.pick;
      const toast=document.getElementById("map-nav-pick-toast");toast.hidden=false;toast.textContent=`请点击地图，选择${state.pickMode==="start"?"起点":"终点"}`;
      setHint("地图选点已开启。点击任一地点设置为起点或终点。");
    }));
    shell.querySelectorAll("[data-mode]").forEach((button)=>button.addEventListener("click",()=>{
      state.mode=button.dataset.mode;shell.querySelectorAll("[data-mode]").forEach((item)=>item.classList.toggle("is-active",item===button));
      if(state.start&&state.end)calculate();
    }));
    shell.querySelector(".map-bike-toggle").addEventListener("click",(event)=>{
      state.bikeVisible=!state.bikeVisible;event.currentTarget.classList.toggle("is-active",state.bikeVisible);event.currentTarget.setAttribute("aria-pressed",String(state.bikeVisible));
      const layer=document.querySelector(".bike-markers-layer");if(layer)layer.hidden=!state.bikeVisible;
    });
    shell.querySelector("#nav-search-route").addEventListener("click",calculate);
    shell.querySelector("#map-nav-results").addEventListener("click",(event)=>{
      const option=event.target.closest("[data-route-index]");if(!option)return;
      state.activeRoute=Number(option.dataset.routeIndex);renderOptions();
    });
    shell.querySelector("#map-nav-results").addEventListener("keydown",(event)=>{
      if(event.key!=="Enter"&&event.key!==" ")return;const option=event.target.closest("[data-route-index]");if(!option)return;event.preventDefault();state.activeRoute=Number(option.dataset.routeIndex);renderOptions();
    });
    shell.querySelector(".bike-map-legend > button").addEventListener("click",(event)=>event.currentTarget.closest(".bike-map-legend").classList.toggle("is-open"));
    fillSelects();positionBikeMarkers();
  }

  function handleMapPick(event) {
    if(!state.pickMode)return;
    const target=event.target instanceof Element?event.target:null;
    const pin=target?.closest("#map-pins button,#map-pins [role='button']");
    if(!pin)return;
    const number=pinNumber(pin);if(!number)return;
    event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();
    if(state.pickMode==="start")state.start=number;else state.end=number;
    state.pickMode=null;fillSelects();
    const toast=document.getElementById("map-nav-pick-toast");toast.hidden=true;
    setHint(`已设置${state.start===number?"起点":"终点"}：${PLACES.find((place)=>place.number===number)?.name || "地图地点"}`);
    if(state.start&&state.end)calculate();
  }

  function storyFor(place) {
    return window.PLACE_STORIES?.[place.number] || null;
  }

  window.CAMPUS_STORY_PROVIDER = {
    getStoryForNumber(number) {
      const place = PLACES.find((item) => Number(item.number) === Number(number));
      return place ? storyFor(place) : null;
    }
  };

  function mount() {
    ensureStyles();
    const plane=document.getElementById("map-plane");if(plane){plane.style.position="relative";}
    mountPlanner();
    const pins=document.getElementById("map-pins");if(pins){new MutationObserver(()=>{ensurePointEntries();positionBikeMarkers();}).observe(pins,{childList:true,subtree:true,attributes:true,attributeFilter:["style","aria-label","title"]});}
    document.addEventListener("click",handleMapPick,true);
    if(window.ResizeObserver&&document.getElementById("map-viewport")){new ResizeObserver(()=>positionBikeMarkers()).observe(document.getElementById("map-viewport"));}
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});else mount();
})();

