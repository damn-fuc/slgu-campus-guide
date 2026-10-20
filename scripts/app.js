(() => {
  const content = window.GUIDE_CONTENT;
  const allItems = [...content.places, ...content.exhibits];
  const byId = new Map(allItems.map(item => [item.id, item]));

  const state = {
    mode: "home", guidedRouteId: null, routeStep: 0, routePicker: true,
    selectedId: null, detour: false, zoneId: null, category: "全部", query: "",
    exploreTab: "places", customRoute: { startId: null, focusIds: [], endId: null },
    zoom: 1, panX: 0, panY: 0
  };

  const home = document.querySelector("#home");
  const experience = document.querySelector("#experience");
  const panel = document.querySelector("#guide-panel");
  const pins = document.querySelector("#map-pins");
  const plane = document.querySelector("#map-plane");
  const viewport = document.querySelector("#map-viewport");
  const routeLine = document.querySelector("#route-line");
  const routeHalo = document.querySelector("#route-halo");
  const mapStatus = document.querySelector("#map-status");
  const modeTitle = document.querySelector("#mode-title");
  const modeCrumb = document.querySelector("#mode-crumb");
  const mapHint = document.querySelector("#map-hint");
  const sourceDialog = document.querySelector("#sources-dialog");
  const toast = document.querySelector("#toast");
  let toastTimer;
  let drag = null;

  const currentRoute = () => content.routes.find(route => route.id === state.guidedRouteId) || null;
  const currentStops = () => currentRoute()?.stops || [];
  const currentStop = () => currentStops()[state.routeStep] || null;
  const currentPlace = () => byId.get(currentStop()?.id) || null;
  const customStopIds = () => [state.customRoute.startId, ...state.customRoute.focusIds, state.customRoute.endId].filter(Boolean);

  function escapeHtml(value = "") {
    return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
  }
  function icon(id) { return '<svg aria-hidden="true"><use href="#i-' + id + '"></use></svg>'; }
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2400);
  }

  function updateExperienceLabels() {
    const guided = state.mode === "guided";
    document.querySelectorAll(".mode-button").forEach(button => {
      const active = (guided && button.dataset.action === "switch-guided") ||
        ((state.mode === "explore" || state.mode === "museum") && button.dataset.action === "switch-explore");
      button.classList.toggle("is-active", active);
    });
    modeTitle.textContent = guided ? (state.routePicker ? "选择一条主题路线" : currentRoute()?.title || "主题导览") :
      state.mode === "museum" ? "兵器博物馆" : "我想自己逛";
    modeCrumb.textContent = guided ? "跟我走" : state.mode === "museum" ? "博物馆展区" : "自由探索";
    mapStatus.textContent = guided
      ? state.routePicker ? "选择主题路线" : currentRoute()?.title || "主题导览"
      : state.mode === "museum" ? "博物馆主题" : "44 个地点 · 自由探索";
    mapHint.classList.toggle("is-visible", guided && state.routePicker && !state.selectedId);
    experience.classList.toggle("is-guided", guided);
    experience.classList.toggle("is-explore", state.mode === "explore" || state.mode === "museum");
  }

  function setMode(mode) {
    state.mode = mode;
    state.selectedId = null;
    state.detour = false;
    state.zoneId = null;
    state.category = "全部";
    state.query = "";
    if (mode === "guided") state.routePicker = !state.guidedRouteId;
    if (mode === "explore") state.exploreTab = "places";
    home.classList.add("is-hidden");
    experience.classList.remove("is-hidden");
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goHome() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    state.mode = "home";
    state.selectedId = null;
    state.detour = false;
    home.classList.remove("is-hidden");
    experience.classList.add("is-hidden");
    sourceDialog.close?.();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function setZoom(value) {
    state.zoom = Math.max(.85, Math.min(2.1, value));
    plane.style.transform = "translate(" + state.panX + "px, " + state.panY + "px) scale(" + state.zoom + ")";
  }

  function routeIdsForMap() {
    if (state.mode === "guided" && !state.routePicker) return currentStops().map(stop => stop.id);
    if (state.mode === "explore") return customStopIds();
    return [];
  }

  function renderPins() {
    const routeIds = new Set(routeIdsForMap());
    pins.innerHTML = content.places.map(item => {
      const isCurrent = state.mode === "guided" && !state.routePicker && currentPlace()?.id === item.id && !state.detour;
      const isSelected = state.selectedId === item.id;
      const classes = ["map-pin"];
      if (item.type === "museum") classes.push("is-museum");
      if (routeIds.has(item.id)) classes.push("is-route-stop");
      if (isCurrent) classes.push("is-current");
      if (isSelected) classes.push("is-selected");
      if (item.position[0] > 75) classes.push("flip-label");
      return '<button type="button" class="' + classes.join(" ") + '" data-place="' + item.id + '" data-map-number="' + item.mapNumber +
        '" style="left:' + item.position[0] + '%;top:' + item.position[1] + '%" aria-label="地点 ' + item.mapNumber + '，' + escapeHtml(item.name) + '，打开详情">' +
        '<span class="map-pin-number">' + String(item.mapNumber).padStart(2, "0") + '</span><span class="map-pin-label">' + escapeHtml(item.name) + '</span></button>';
    }).join("");
  }

  function renderRouteLine() {
    const ids = routeIdsForMap();
    const points = ids.map(id => byId.get(id)).filter(Boolean).map(item =>
      (item.position[0] * 10.24).toFixed(1) + "," + (item.position[1] * 6.8).toFixed(1)
    ).join(" ");
    routeLine.setAttribute("points", points);
    routeHalo.setAttribute("points", points);
    document.querySelector("#route-overlay").classList.toggle("is-visible", ids.length > 1);
  }

  function filteredPlaces() {
    const needle = state.query.trim().toLocaleLowerCase();
    return content.places.filter(item => {
      const categoryMatches = state.category === "全部" || item.category === state.category;
      const queryMatches = !needle || item.name.toLocaleLowerCase().includes(needle) ||
        String(item.mapNumber).includes(needle) || item.subtitle.toLocaleLowerCase().includes(needle);
      return categoryMatches && queryMatches;
    });
  }

  function categoryMarkup() {
    return content.categories.map(category => '<button type="button" class="filter-chip' +
      (state.category === category ? " is-active" : "") + '" data-category="' + escapeHtml(category) + '">' +
      escapeHtml(category) + '</button>').join("");
  }

  function placeRows(items) {
    if (!items.length) return '<div class="empty-note">没有找到这个地点。试试更短的名称，或切换分类。</div>';
    return items.map(item => {
      const hasStart = Boolean(state.customRoute.startId);
      const isStart = state.customRoute.startId === item.id;
      const quickText = isStart ? "已设起点" : hasStart ? "＋加入" : "设起点";
      return '<div class="place-row' + (item.type === "museum" ? " is-museum" : "") + '">' +
        '<button type="button" class="place-open" data-place="' + item.id + '" aria-label="打开地点 ' + item.mapNumber + ' ' + escapeHtml(item.name) + '">' +
        '<span class="place-number">' + String(item.mapNumber).padStart(2, "0") + '</span><span class="place-copy"><b>' + escapeHtml(item.name) + '</b><small>' + escapeHtml(item.category) + '</small></span>' +
        '</button><button type="button" class="place-quick' + (isStart ? " is-set" : "") + '" data-action="quick-add" data-location="' + item.id + '" aria-label="' + quickText + '：' + escapeHtml(item.name) + '">' + quickText + '</button></div>';
    }).join("");
  }

  function routeProgressMarkup(stops) {
    const progress = stops.length ? Math.round(((state.routeStep + 1) / stops.length) * 100) : 0;
    return '<div class="route-progress"><div class="progress-copy"><span>导览进度</span><b>' +
      String(state.routeStep + 1).padStart(2, "0") + '<i>/</i>' + String(stops.length).padStart(2, "0") +
      '</b></div><div class="progress-track"><span style="width:' + progress + '%"></span></div></div>';
  }

  function routeListMarkup(route) {
    return '<ol class="route-list">' + route.stops.map((stop, index) => {
      const place = byId.get(stop.id);
      const current = index === state.routeStep;
      const done = index < state.routeStep;
      return '<li class="route-stop' + (current ? " is-active" : "") + (done ? " is-done" : "") + '">' +
        '<button type="button" data-route-step="' + index + '" aria-current="' + (current ? "step" : "false") + '">' +
        '<span class="route-stop-number">' + String(index + 1).padStart(2, "0") + '</span><span class="route-stop-copy"><b>' + escapeHtml(place.name) +
        '</b><small>' + escapeHtml(stop.note) + '</small></span><span class="route-stop-mapno">' + String(place.mapNumber).padStart(2, "0") + '</span></button></li>';
    }).join("") + '</ol>';
  }

  function routePickerMarkup() {
    return '<div class="panel-scroll route-picker-panel"><div class="panel-kicker">跟我走 / 主题路线</div>' +
      '<h2 class="panel-title">选一条路线<br>认识校园。</h2><p class="panel-intro">每条路线都是一段不同的校园故事。选择后可以逐站浏览，也能随时点开地图上的其他地点。</p>' +
      '<div class="route-card-list">' + content.routes.map((route, index) => {
        const tone = "tone-" + route.tone;
        return '<button type="button" class="route-choice ' + tone + '" data-select-route="' + route.id + '">' +
          '<span class="route-choice-index">' + String(index + 1).padStart(2, "0") + '</span><span class="route-choice-body"><b>' + escapeHtml(route.title) +
          '</b><small>' + escapeHtml(route.subtitle) + '</small><span class="route-sequence">' + route.stops.map(stop => escapeHtml(byId.get(stop.id).name)).join("　/　") +
          '</span></span><span class="route-choice-count">' + route.stops.length + '<small>站</small></span></button>';
      }).join("") + '</div><p class="route-note">精选主题路线 · 不代表客流排名或真实步行导航</p></div>' +
      '<div class="panel-actions"><button type="button" class="action-button action-primary" data-action="switch-explore">' + icon("compass") + '自己规划路线</button></div>';
  }

  function placePhotoMarkup(item) {
    if (!item?.mapNumber) return '<div class="exhibit-image-note"><span>展签资料</span><b>馆藏影像以现场展陈为准</b></div>';
    return '<section class="place-photo-slot" data-place-number="' + item.mapNumber + '" aria-label="' + escapeHtml(item.name) + '地点影像"><h3 class="place-photo-heading">地点影像</h3><p class="photo-loading">正在载入校园影像…</p></section>';
  }

  function guidedMarkup() {
    if (state.detour && state.selectedId) return detailMarkup(byId.get(state.selectedId), "guided");
    if (state.routePicker || !currentRoute()) return routePickerMarkup();

    const route = currentRoute();
    const stop = currentStop();
    const place = currentPlace();
    const storyData = window.CAMPUS_STORY_PROVIDER?.getStoryForNumber(place.mapNumber);
    const narration = stop.narration || storyData?.story || place.story;
    const knowledge = storyData?.fact || place.knowledge;
    const storySource = storyData?.source
      ? '<a class="story-source" href="' + escapeHtml(storyData.source) + '" target="_blank" rel="noopener noreferrer">资料来源：' + escapeHtml(storyData.sourceName || "公开资料") + ' ↗</a>'
      : '';
    return '<div class="panel-scroll guided-panel"><div class="panel-kicker">跟我走 / ' + escapeHtml(route.title) + '</div>' +
      '<div class="route-heading"><div><h2 class="panel-title">' + escapeHtml(route.title) + '</h2><p class="panel-intro">' + escapeHtml(route.description) + '</p></div>' +
      '<button type="button" class="quiet-button" data-action="choose-route">换路线</button></div>' +
      routeProgressMarkup(route.stops) + routeListMarkup(route) + placePhotoMarkup(place) +
      '<article class="story-stop"><div class="story-stop-meta"><span>第 ' + String(state.routeStep + 1).padStart(2, "0") + ' 站</span><span>地点编号 ' + String(place.mapNumber).padStart(2, "0") + '</span></div>' +
      '<h3>' + escapeHtml(place.name) + '</h3><p>' + escapeHtml(narration) + '</p>' + storySource +
      '<div class="story-tip"><b>知识提示</b><span>' + escapeHtml(knowledge) + '</span></div>' +
      '</article>' +
      '<p class="panel-hint">地图上的其他地点也可以点开；查看后可回到当前路线进度。</p></div>' +
      '<div class="panel-actions"><button type="button" class="action-button" data-action="speak" data-text="' + escapeHtml(narration) + '">' + icon("volume") + '听讲解</button>' +
      '<div class="step-actions"><button type="button" class="action-button" data-action="prev" ' + (state.routeStep === 0 ? "disabled" : "") + '>上一站</button>' +
      '<button type="button" class="action-button action-primary" data-action="next">' + (state.routeStep === route.stops.length - 1 ? "完成路线" : "下一站") + icon("arrow") + '</button></div></div>';
  }

  function routeToolButtons(item) {
    const route = state.customRoute;
    const isStart = route.startId === item.id;
    const isEnd = route.endId === item.id;
    const isStop = route.focusIds.includes(item.id);
    return '<div class="route-tools"><span>把这个地点加入你的路线</span><div>' +
      '<button type="button" class="route-tool' + (isStart ? " is-set" : "") + '" data-action="custom-start" data-location="' + item.id + '">' + (isStart ? "✓ 起点已设" : "设为起点") + '</button>' +
      '<button type="button" class="route-tool' + (isStop ? " is-set" : "") + '" data-action="custom-add" data-location="' + item.id + '">' + (isStop ? "✓ 已加入重点" : "加入重点站") + '</button>' +
      '<button type="button" class="route-tool' + (isEnd ? " is-set" : "") + '" data-action="custom-end" data-location="' + item.id + '">' + (isEnd ? "✓ 终点已设" : "设为终点") + '</button></div></div>';
  }

  function detailMarkup(item, mode) {
    if (!item) return '<div class="panel-scroll"><div class="empty-note">暂时没有这条地点资料。</div></div>';
    const isGuidedDetour = mode === "guided";
    const showRouteTools = mode === "explore";
    const label = item.type === "museum" ? "校园博物馆" : item.type === "exhibit" ? "博物馆主题" : item.category;
    const storyData = item.mapNumber ? window.CAMPUS_STORY_PROVIDER?.getStoryForNumber(item.mapNumber) : null;
    const mainCopy = storyData?.story || item.story || item.summary;
    const storyTitle = storyData?.title || item.name + "的故事";
    const knowledge = storyData?.fact || item.knowledge;
    const storySource = storyData?.source
      ? '<a class="story-source" href="' + escapeHtml(storyData.source) + '" target="_blank" rel="noopener noreferrer">资料来源：' + escapeHtml(storyData.sourceName || "公开资料") + ' ↗</a>'
      : '';
    const sourceMarkup = '';
    return '<div class="panel-scroll detail-panel"><div class="detail-topline"><span>' + escapeHtml(label) +
      '</span>' + (item.mapNumber ? '<b>地图编号 ' + String(item.mapNumber).padStart(2, "0") + '</b>' : '') + '</div>' +
      '<h2 class="panel-title detail-title">' + escapeHtml(item.name) + '</h2><p class="detail-subtitle">' + escapeHtml(item.subtitle || item.category || "博物馆主题") + '</p>' +
      placePhotoMarkup(item) + '<section class="story-accordion-card"><details class="story-accordion"><summary><span class="story-accordion__eyebrow">知识科普 / 地点故事</span><span class="story-accordion__theme">' + escapeHtml(storyTitle) + '</span></summary><div class="story-accordion__body"><p>' + escapeHtml(mainCopy) + '</p>' + storySource + '</div></details></section>' +
      (knowledge ? '<div class="story-tip"><b>知识提示</b><span>' + escapeHtml(knowledge) + '</span></div>' : '') +
      sourceMarkup +
      (showRouteTools ? routeToolButtons(item) : '') +
      (item.type === "museum" ? '<button class="museum-entry" type="button" data-action="show-zones">' + icon("book") + '<span><b>浏览博物馆主题</b><small>从展区主题继续探索 · 从展区主题继续了解装备结构与发展</small></span>' + icon("arrow") + '</button>' : '') +
      (item.type === "exhibit" ? '<div class="verify-tag"><i></i>主题示例，不对应具体实物</div>' : '') +
      '</div><div class="panel-actions">' +
      (isGuidedDetour ? '<button type="button" class="action-button action-primary" data-action="return-guided">' + icon("back") + (currentRoute() ? "回到 " + escapeHtml(currentRoute().title) + " · 第 " + (state.routeStep + 1) + " 站" : "返回路线选择") + '</button>' :
        mode === "explore" ? '<button type="button" class="action-button action-text" data-action="place-list">' + icon("back") + '返回地点</button>' :
        '<button type="button" class="action-button action-text" data-action="museum-back">' + icon("back") + '返回展区</button>') +
      (isGuidedDetour ? '' : '<button type="button" class="action-button" data-action="speak" data-text="' + escapeHtml(mainCopy) + '">' + icon("volume") + '听讲解</button>') +
      '</div>';
  }

  function customRouteMarkup() {
    const route = state.customRoute;
    const stops = customStopIds();
    const rows = stops.map((id, index) => {
      const item = byId.get(id);
      const focusIndex = route.focusIds.indexOf(id);
      const isFocus = focusIndex >= 0;
      const role = id === route.startId ? "起点" : id === route.endId ? "终点" : "站点";
      const reorder = isFocus
        ? '<span class="route-row-actions"><button type="button" data-action="move-focus" data-index="' + focusIndex + '" data-delta="-1" aria-label="上移 ' + escapeHtml(item.name) + '" ' + (focusIndex === 0 ? "disabled" : "") + '>↑</button><button type="button" data-action="move-focus" data-index="' + focusIndex + '" data-delta="1" aria-label="下移 ' + escapeHtml(item.name) + '" ' + (focusIndex === route.focusIds.length - 1 ? "disabled" : "") + '>↓</button></span>'
        : '<span class="route-row-role">' + role + '</span>';
      return '<li class="draft-stop"><span class="draft-stop-number">' + String(index + 1).padStart(2, "0") + '</span><span class="draft-stop-copy"><b>' + escapeHtml(item.name) +
        '</b><small>地图编号 ' + String(item.mapNumber).padStart(2, "0") + '</small></span>' + reorder +
        '<button type="button" class="draft-remove" data-action="remove-custom" data-location="' + id + '" aria-label="从路线移除 ' + escapeHtml(item.name) + '">×</button></li>';
    }).join("");

    const startItem = byId.get(route.startId);
    return '<div class="route-builder"><div class="builder-heading"><div><span class="panel-kicker">我的路线 / 自己安排</span><h3>按你的兴趣来走。</h3></div>' +
      '<button type="button" class="quiet-button" data-action="clear-custom" ' + (stops.length ? "" : "disabled") + '>清空</button></div>' +
      '<div class="builder-steps">' +
      '<div class="builder-step' + (startItem ? " is-filled" : "") + '"><span class="builder-step-mark">起</span><div><b>设置起点</b><small>' + (startItem ? escapeHtml(startItem.name) : "从地图或地点列表中选择") + '</small></div></div>' +
      '<div class="builder-step' + (route.focusIds.length ? " is-filled" : "") + '"><span class="builder-step-mark">中</span><div><b>添加重点站</b><small>' + (route.focusIds.length ? "已选 " + route.focusIds.length + " 处，可上下调整顺序" : "选择你最想看的地点") + '</small></div></div>' +
      '<div class="builder-step' + (route.endId ? " is-filled" : "") + '"><span class="builder-step-mark">终</span><div><b>终点（可选）</b><small>' + (route.endId ? escapeHtml(byId.get(route.endId).name) : "需要时再设置") + '</small></div></div></div>' +
      (stops.length ? '<ol class="draft-route-list">' + rows + '</ol>' : '<div class="empty-route"><span>＋</span><b>从一个地点开始</b><small>设好起点后，地图上会出现你的路线。</small></div>') +
      '<div class="route-disclaimer">路线线条表示你选择的顺序，不包含实测距离或步行导航。</div>' +
      (stops.length ? '<button type="button" class="start-custom" data-action="begin-custom">' + icon("route") + '沿我的路线浏览</button>' : '') + '</div>';
  }

  function exploreMarkup() {
    if (state.selectedId) return detailMarkup(byId.get(state.selectedId), "explore");
    const locations = state.exploreTab === "places";
    return '<div class="panel-scroll explore-panel"><div class="panel-kicker">我想自己逛 / 自由探索</div>' +
      '<div class="explore-head"><h2 class="panel-title">' + (locations ? "你想先去哪？" : "安排自己的路线") + '</h2>' +
      '<span class="explore-count">' + (locations ? "44 个地点" : customStopIds().length + " 个站点") + '</span></div>' +
      '<div class="explore-tabs" role="tablist" aria-label="自由探索内容"><button type="button" role="tab" aria-selected="' + locations + '" class="' + (locations ? "is-active" : "") + '" data-explore-tab="places">地点列表</button>' +
      '<button type="button" role="tab" aria-selected="' + !locations + '" class="' + (!locations ? "is-active" : "") + '" data-explore-tab="route">我的路线' + (state.customRoute.startId ? '<i>●</i>' : '') + '</button></div>' +
      (locations
        ? '<div class="location-tools"><label class="search-box">' + icon("search") + '<input id="place-search" type="search" value="' + escapeHtml(state.query) + '" placeholder="搜地点名称或编号" aria-label="搜索地点"></label>' +
          '<div class="category-filters" role="group" aria-label="地点分类">' + categoryMarkup() + '</div></div><div class="place-list">' + placeRows(filteredPlaces()) + '</div>'
        : customRouteMarkup()) +
      '</div><div class="panel-actions"><span class="source-caution-inline">地图上的 44 个地点都可选择</span>' +
      (locations ? '<button type="button" class="action-button action-primary" data-explore-tab="route">' + icon("route") + '编辑路线</button>' :
        '<button type="button" class="action-button" data-explore-tab="places">' + icon("pin") + '选地点</button>') + '</div>';
  }

  function museumMarkup() {
    if (state.selectedId && byId.get(state.selectedId)?.type === "exhibit") return detailMarkup(byId.get(state.selectedId), "museum");
    if (state.zoneId) {
      const zone = content.museumZones.find(item => item.id === state.zoneId);
      return '<div class="panel-scroll museum-panel"><div class="panel-kicker">兵器博物馆 / 主题浏览</div><button type="button" class="quiet-button" data-action="museum-back">' + icon("back") + '返回主题目录</button>' +
        '<h2 class="panel-title">' + escapeHtml(zone.name) + '</h2><p class="panel-intro">' + escapeHtml(zone.description) + '</p><div class="verify-tag"><i></i>主题分类参考公开资料 · 待馆方确认</div>' +
        '<div class="exhibit-list">' + content.exhibits.map(item => '<button type="button" class="exhibit-row" data-place="' + item.id + '"><span>科普主题示例</span><b>' + escapeHtml(item.name) + '</b><small>具体展品与展签待核实</small></button>').join("") + '</div></div>';
    }
    return '<div class="panel-scroll museum-panel"><div class="panel-kicker">兵器博物馆 / 展览主题</div><h2 class="panel-title">从主题读懂装备。</h2>' +
      '<p class="panel-intro">展区主题用于打开科普探索入口。实际展厅、展品、年代和说明以馆内展签或馆方资料为准。</p>' +
      '<div class="zone-grid">' + content.museumZones.map(zone => '<button type="button" class="zone-card" data-zone="' + zone.id + '"><span>' + zone.index + '</span><b>' + escapeHtml(zone.name) + '</b><small>' + escapeHtml(zone.description) + '</small></button>').join("") + '</div>' +
      '<div class="verify-tag"><i></i>馆内展厅位置与具体藏品信息待确认</div></div>' +
      '<div class="panel-actions"><button type="button" class="action-button action-text" data-action="return-explore">' + icon("back") + '回到校园地图</button></div>';
  }

  function render() {
    renderPins();
    renderRouteLine();
    updateExperienceLabels();
    const activeItem = state.mode === "guided"
      ? (state.detour ? byId.get(state.selectedId) : currentPlace())
      : (state.mode === "explore" ? byId.get(state.selectedId) : null);
    window.__selectedCampusPlaceNumber = activeItem?.mapNumber || 0;
    if (state.mode === "guided") panel.innerHTML = guidedMarkup();
    else if (state.mode === "museum") panel.innerHTML = museumMarkup();
    else panel.innerHTML = exploreMarkup();
  }

  function openPlace(id) {
    const item = byId.get(id);
    if (!item) return;
    if (state.mode === "guided") {
      const routeIndex = currentStops().findIndex(stop => stop.id === id);
      if (!state.routePicker && !state.detour && routeIndex >= 0) {
        state.routeStep = routeIndex;
        state.selectedId = null;
      } else {
        state.selectedId = id;
        state.detour = true;
      }
    } else {
      if (state.mode === "museum" && item.type !== "exhibit") state.mode = "explore";
      if (item.type === "exhibit") state.mode = "museum";
      state.selectedId = id;
      if (item.type !== "exhibit") state.zoneId = null;
    }
    render();
  }

  function goToStep(index) {
    const stops = currentStops();
    if (index < 0 || index >= stops.length) return;
    state.routeStep = index;
    state.selectedId = null;
    state.detour = false;
    state.routePicker = false;
    render();
  }

  function chooseRoute(id) {
    if (!content.routes.some(route => route.id === id)) return;
    state.guidedRouteId = id;
    state.routePicker = false;
    state.routeStep = 0;
    state.selectedId = null;
    state.detour = false;
    state.mode = "guided";
    render();
  }

  function setCustomStart(id) {
    const route = state.customRoute;
    route.focusIds = route.focusIds.filter(value => value !== id);
    if (route.endId === id) route.endId = null;
    route.startId = id;
    state.selectedId = null;
    state.exploreTab = "route";
    render();
    showToast("已将“" + byId.get(id).name + "”设为起点");
  }

  function addCustomFocus(id) {
    const route = state.customRoute;
    if (!route.startId) {
      setCustomStart(id);
      showToast("起点已设置，可以继续添加重点站");
      return;
    }
    if (route.startId === id) {
      showToast("这个地点已经是起点");
      return;
    }
    if (route.endId === id) route.endId = null;
    if (!route.focusIds.includes(id)) route.focusIds.push(id);
    state.selectedId = null;
    state.exploreTab = "route";
    render();
    showToast("已加入重点站");
  }

  function setCustomEnd(id) {
    const route = state.customRoute;
    if (!route.startId) {
      showToast("请先设置起点");
      return;
    }
    if (route.startId === id) {
      showToast("终点不能与起点相同");
      return;
    }
    route.focusIds = route.focusIds.filter(value => value !== id);
    route.endId = id;
    state.selectedId = null;
    state.exploreTab = "route";
    render();
    showToast("已设置路线终点");
  }

  function removeCustomStop(id) {
    const route = state.customRoute;
    if (route.startId === id) route.startId = null;
    route.focusIds = route.focusIds.filter(value => value !== id);
    if (route.endId === id) route.endId = null;
    render();
  }

  function moveFocus(index, delta) {
    const focus = state.customRoute.focusIds;
    const target = index + delta;
    if (target < 0 || target >= focus.length) return;
    [focus[index], focus[target]] = [focus[target], focus[index]];
    render();
  }

  function startSpeech(text) {
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
      showToast("当前浏览器不支持语音朗读，请阅读讲解文字。");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "zh-CN";
    utterance.rate = .92;
    window.speechSynthesis.speak(utterance);
    showToast("正在朗读讲解内容");
  }

  function refreshPlaceRows() {
    const list = panel.querySelector(".place-list");
    if (list) list.innerHTML = placeRows(filteredPlaces());
  }

  document.addEventListener("click", event => {
    const placeButton = event.target.closest("[data-place]");
    if (placeButton) {
      openPlace(placeButton.dataset.place);
      return;
    }
    const routeStop = event.target.closest("[data-route-step]");
    if (routeStop) {
      goToStep(Number(routeStop.dataset.routeStep));
      return;
    }
    const routeChoice = event.target.closest("[data-select-route]");
    if (routeChoice) {
      chooseRoute(routeChoice.dataset.selectRoute);
      return;
    }
    const zoneCard = event.target.closest("[data-zone]");
    if (zoneCard) {
      state.mode = "museum";
      state.zoneId = zoneCard.dataset.zone;
      state.selectedId = null;
      render();
      return;
    }
    const category = event.target.closest("[data-category]");
    if (category) {
      state.category = category.dataset.category;
      refreshPlaceRows();
      render();
      return;
    }
    const tab = event.target.closest("[data-explore-tab]");
    if (tab) {
      state.exploreTab = tab.dataset.exploreTab;
      state.selectedId = null;
      render();
      return;
    }

    const button = event.target.closest("[data-action]");
    const action = button?.dataset.action;
    if (!action) return;
    const locationId = button.dataset.location;

    switch (action) {
      case "home": goHome(); break;
      case "start-guided":
      case "switch-guided": setMode("guided"); break;
      case "start-explore":
      case "switch-explore": setMode("explore"); break;
      case "choose-route":
        state.routePicker = true;
        state.detour = false;
        state.selectedId = null;
        render();
        break;
      case "next":
        if (state.routeStep < currentStops().length - 1) goToStep(state.routeStep + 1);
        else showToast("已到达路线终点，可以继续探索地图上的其他地点。");
        break;
      case "prev": goToStep(state.routeStep - 1); break;
      case "return-guided":
        state.detour = false;
        state.selectedId = null;
        state.routePicker = !state.guidedRouteId;
        render();
        break;
      case "return-explore":
      case "place-list":
        state.mode = "explore";
        state.selectedId = null;
        state.exploreTab = "places";
        render();
        break;
      case "quick-add":
        if (!state.customRoute.startId) setCustomStart(locationId);
        else addCustomFocus(locationId);
        break;
      case "custom-start": setCustomStart(locationId); break;
      case "custom-add": addCustomFocus(locationId); break;
      case "custom-end": setCustomEnd(locationId); break;
      case "remove-custom": removeCustomStop(locationId); break;
      case "move-focus": moveFocus(Number(button.dataset.index), Number(button.dataset.delta)); break;
      case "clear-custom":
        state.customRoute = { startId: null, focusIds: [], endId: null };
        render();
        showToast("已清空自定义路线");
        break;
      case "begin-custom":
        state.exploreTab = "places";
        render();
        showToast("地图已显示你的路线顺序，可逐个打开地点");
        break;
      case "show-zones":
        state.mode = "museum";
        state.selectedId = null;
        state.zoneId = null;
        render();
        break;
      case "museum-back":
        if (state.selectedId && byId.get(state.selectedId)?.type === "exhibit") state.selectedId = null;
        else state.zoneId = null;
        render();
        break;
      case "speak": startSpeech(button.dataset.text || ""); break;
      case "zoom-in": setZoom(state.zoom + .15); break;
      case "zoom-out": setZoom(state.zoom - .15); break;
      case "zoom-reset":
        state.zoom = 1;
        state.panX = 0;
        state.panY = 0;
        setZoom(1);
        break;
      case "sources": sourceDialog.showModal(); break;
      case "close-sources": sourceDialog.close(); break;
    }
  });

  document.addEventListener("input", event => {
    if (event.target.matches("#place-search")) {
      state.query = event.target.value;
      refreshPlaceRows();
    }
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && sourceDialog.open) sourceDialog.close();
  });

  viewport.addEventListener("pointerdown", event => {
    if (event.target.closest(".map-pin")) return;
    drag = { x: event.clientX - state.panX, y: event.clientY - state.panY, pointerId: event.pointerId };
    viewport.setPointerCapture?.(event.pointerId);
    viewport.classList.add("is-dragging");
  });
  viewport.addEventListener("pointermove", event => {
    if (!drag || drag.pointerId !== event.pointerId) return;
    state.panX = event.clientX - drag.x;
    state.panY = event.clientY - drag.y;
    setZoom(state.zoom);
  });
  const endDrag = () => {
    drag = null;
    viewport.classList.remove("is-dragging");
  };
  viewport.addEventListener("pointerup", endDrag);
  viewport.addEventListener("pointercancel", endDrag);
  sourceDialog.addEventListener("click", event => {
    if (event.target === sourceDialog) sourceDialog.close();
  });

  render();
})();

