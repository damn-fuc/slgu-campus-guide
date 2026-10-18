(() => {
  const styles = `
    #guide-panel .story-accordion-card{display:block!important;min-height:0!important;height:auto!important;padding:0!important;margin:6px 0!important;line-height:normal!important}
    #guide-panel .story-accordion:not([open]){display:block!important;min-height:0!important;height:auto!important;padding:0!important;margin:0!important;overflow:hidden!important}
    #guide-panel .story-accordion:not([open])>.story-accordion__body,#guide-panel .story-accordion:not([open])>*:not(summary){display:none!important;height:0!important;min-height:0!important;padding:0!important;margin:0!important;border:0!important}
    #guide-panel .story-accordion:not([open])>summary{min-height:0!important;height:auto!important;padding:11px 50px 11px 16px!important;gap:4px!important}
    #guide-panel .story-accordion:not([open]) .story-accordion__theme{font-size:16px!important;line-height:1.35!important}
    #guide-panel .story-accordion-card:empty{display:none!important}
    #map-viewport .map-nav-launch{min-width:34px!important;min-height:34px!important;padding:6px 9px!important;border-radius:12px!important;font-size:11px!important;line-height:1.15!important;box-shadow:0 5px 16px rgba(19,49,67,.16)!important}
    #map-viewport .map-nav-launch svg,#map-viewport .map-nav-launch img{width:15px!important;height:15px!important}
    #map-viewport .bike-markers-layer>*{width:23px!important;height:23px!important;min-width:23px!important;min-height:23px!important;padding:0!important;font-size:11px!important;border-width:1.5px!important;box-shadow:0 2px 7px rgba(14,42,56,.18)!important}
    #map-viewport .bike-markers-layer svg,#map-viewport .bike-markers-layer img{width:13px!important;height:13px!important}
    #map-viewport .bike-markers-layer [class*="label"]{font-size:9px!important;line-height:1.1!important}
    #map-nav-panel .nav-place-search{margin:10px 0 14px;padding:14px;border:1px solid rgba(43,77,92,.13);border-radius:15px;background:#f8fbfa}
    #map-nav-panel .nav-place-search__title{margin:0 0 9px;color:#173c50;font-size:15px;font-weight:750}
    #map-nav-panel .nav-place-search__row{display:flex;gap:7px}
    #map-nav-panel .nav-place-search__input{min-width:0;flex:1;padding:10px 11px;border:1px solid #d5e0e2;border-radius:10px;background:#fff;color:#203844;font:inherit;font-size:13px;outline:none}
    #map-nav-panel .nav-place-search__input:focus{border-color:#3e8792;box-shadow:0 0 0 3px rgba(62,135,146,.12)}
    #map-nav-panel .nav-place-search__button,#map-nav-panel .nav-place-search__set,#map-nav-panel .nav-place-search__plan{border:0;border-radius:10px;cursor:pointer;font:inherit;font-weight:700}
    #map-nav-panel .nav-place-search__button{padding:0 13px;background:#176779;color:#fff;font-size:13px}
    #map-nav-panel .nav-place-search__selected{display:flex;flex-wrap:wrap;gap:6px;margin:9px 0;color:#52656e;font-size:11px}
    #map-nav-panel .nav-place-search__chip{padding:5px 8px;border-radius:999px;background:#e8f1f1;color:#254c58}
    #map-nav-panel .nav-place-search__plan{width:100%;margin-top:10px;padding:10px 12px;background:#d64c37;color:#fff;font-size:13px}
    #map-nav-panel .nav-place-search__results{display:grid;gap:7px;max-height:250px;overflow:auto;margin-top:10px}
    #map-nav-panel .nav-place-search__hint{margin:7px 0 0;color:#718088;font-size:12px;line-height:1.5}
    #map-nav-panel .nav-place-result{display:grid;grid-template-columns:minmax(0,1fr) auto auto;align-items:center;gap:6px;padding:8px;border:1px solid #e2e9e9;border-radius:11px;background:#fff}
    #map-nav-panel .nav-place-result__name{overflow:hidden;color:#263d48;font-size:12px;text-overflow:ellipsis;white-space:nowrap}
    #map-nav-panel .nav-place-search__set{padding:7px 8px;background:#edf3f3;color:#355765;font-size:11px}
    #map-nav-panel .nav-place-search__set:hover{background:#dcebec}
    #map-nav-panel .nav-place-search__status{min-height:16px;margin:6px 0 0;color:#a04431;font-size:11px}
  `;

  function addStyles() {
    const style = document.createElement("style");
    style.textContent = styles;
    document.head.append(style);
  }

  function addWeaponsPlazaStory(panel) {
    const number = Number(window.__selectedCampusPlaceNumber);
    const place = (window.CAMPUS_PLACES || []).find((item) => Number(item.number) === number);
    const isMuseum = number === 43 || /兵器广场/.test(place?.name || "");
    const oldCard = panel.querySelector("#weapons-plaza-story");
    const detail = panel.querySelector(".detail-panel");
    if (!isMuseum || !detail) {
      oldCard?.remove();
      return;
    }
    if (oldCard) return;

    const card = document.createElement("section");
    card.id = "weapons-plaza-story";
    card.className = "story-accordion-card";
    const details = document.createElement("details");
    details.className = "story-accordion";
    const summary = document.createElement("summary");
    summary.innerHTML = '<span class="story-accordion__eyebrow">兵器广场  /  户外展陈</span><span class="story-accordion__theme">走进露天的兵工故事</span>';
    const body = document.createElement("div");
    body.className = "story-accordion__body";
    body.innerHTML = `
      <p>兵器广场把博物馆的展陈延伸到户外。大型装备从展柜走到校园空间，观众可以先观察它们的体量、结构和运动方式，再思考装备设计如何回应不同的使用需求。</p>
      <p>把室外装备与馆内展品连起来看，会发现兵工知识并不只关于“武器长什么样”，还涉及材料、制造、动力和工程协作。参观时不妨选一件装备，找出它的关键部件，再和室内展陈里的相关知识对照。</p>
      <figure class="story-inline-photo"><img src="https://k.sinaimg.cn/n/ln/37_img/upload/3e29cdcd/213/w2048h1365/20190821/3aa8-icmpfxa9124898.jpg/w640slw.jpg" alt="沈阳理工大学兵器广场室外装备陈列" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()"><figcaption>兵器广场实景 · 学校公开图集</figcaption></figure>
      <p class="story-accordion__source"><a href="https://jyt.ln.gov.cn/jyt/jyzx/jyyw/10C75312802C4A11BC8A9414992CB9EB/index.shtml" target="_blank" rel="noopener noreferrer">辽宁省教育厅：走进沈阳理工大学兵器博物馆</a><br><a href="https://www.yljzc.com/zh_m/News_16887.html" target="_blank" rel="noopener noreferrer">兵器博物馆室内展馆与室外兵器广场介绍</a></p>
    `;
    details.append(summary, body);
    card.append(details);
    const existingStory = detail.querySelector(".story-accordion-card:not(#weapons-plaza-story)");
    if (existingStory) existingStory.after(card);
    else detail.append(card);
  }

  function getSelect(panel, id, pattern) {
    return panel.querySelector(`#${id}`) || [...panel.querySelectorAll("select")].find((select) => pattern.test(select.getAttribute("aria-label") || select.name || select.id || ""));
  }

  function optionFor(select, place) {
    if (!select) return null;
    const options = [...select.options];
    return options.find((option) => Number(option.value) === Number(place.number))
      || options.find((option) => option.textContent.includes(place.name))
      || options.find((option) => Number(option.dataset.placeNumber) === Number(place.number));
  }

  function installSearch(panel) {
    if (panel.querySelector(".nav-place-search")) return;
    const startSelect = getSelect(panel, "nav-start", /start|起点/i);
    const endSelect = getSelect(panel, "nav-end", /end|destination|终点/i);
    if (!startSelect || !endSelect) return;

    const oldControls = new Set();
    [startSelect, endSelect].forEach((select) => {
      const field = select.closest(".nav-field,[data-nav-field],.nav-select-field,.route-field") || select.parentElement;
      if (field) oldControls.add(field);
    });
    oldControls.forEach((field) => { field.style.display = "none"; });
    panel.querySelectorAll("button").forEach((button) => {
      if (/地图选点|设为起点|设为终点/.test(button.textContent.trim())) button.style.display = "none";
    });

    const search = document.createElement("section");
    search.className = "nav-place-search";
    const title = document.createElement("h3");
    title.className = "nav-place-search__title";
    title.textContent = "搜索地点并设定路线";
    const row = document.createElement("div");
    row.className = "nav-place-search__row";
    const input = document.createElement("input");
    input.className = "nav-place-search__input";
    input.type = "search";
    input.placeholder = "搜索图书馆、食堂、兵器广场…";
    input.setAttribute("aria-label", "搜索校园地点");
    const searchButton = document.createElement("button");
    searchButton.className = "nav-place-search__button";
    searchButton.type = "button";
    searchButton.textContent = "搜索";
    row.append(input, searchButton);

    const selected = document.createElement("div");
    selected.className = "nav-place-search__selected";
    const results = document.createElement("div");
    results.className = "nav-place-search__results";
    const hint = document.createElement("p");
    hint.className = "nav-place-search__hint";
    hint.textContent = "搜索地点后，在结果旁选择“起点”或“终点”。";
    const status = document.createElement("p");
    status.className = "nav-place-search__status";
    const planButton = document.createElement("button");
    planButton.className = "nav-place-search__plan";
    planButton.type = "button";
    planButton.textContent = "推荐路线";
    search.append(title, row, selected, results, hint, status, planButton);

    const legacyPlanButton = panel.querySelector("#nav-search-route")
      || [...panel.querySelectorAll("button")].find((button) => /搜索路线|规划路线|生成路线|推荐路线/.test(button.textContent.trim()));
    if (legacyPlanButton) {
      legacyPlanButton.style.display = "none";
      legacyPlanButton.setAttribute("aria-hidden", "true");
    }
    panel.prepend(search);

    const places = window.CAMPUS_PLACES || [];
    function currentLabel(select, fallback) {
      return select.selectedOptions?.[0]?.textContent.trim() || fallback;
    }
    function updateSelected() {
      selected.replaceChildren();
      const startChip = document.createElement("span");
      startChip.className = "nav-place-search__chip";
      startChip.textContent = `起点：${currentLabel(startSelect, "未设置")}`;
      const endChip = document.createElement("span");
      endChip.className = "nav-place-search__chip";
      endChip.textContent = `终点：${currentLabel(endSelect, "未设置")}`;
      selected.append(startChip, endChip);
    }
    function choose(place, target) {
      const select = target === "start" ? startSelect : endSelect;
      const option = optionFor(select, place);
      if (!option) {
        status.textContent = `无法将“${place.name}”设为${target === "start" ? "起点" : "终点"}，请检查地点列表。`;
        return;
      }
      select.value = option.value;
      select.dispatchEvent(new Event("change", { bubbles: true }));
      status.textContent = `已将“${place.name}”设为${target === "start" ? "起点" : "终点"}。`;
      updateSelected();
    }
    function runSearch() {
      const query = input.value.trim().toLowerCase();
      const matches = places.filter((place) => {
        const aliases = Number(place.number) === 43 ? "兵器广场 户外展陈 博物馆" : "";
        return !query || `${place.name || ""} ${place.category || ""} ${place.description || ""} ${aliases}`.toLowerCase().includes(query);
      }).slice(0, 12);
      results.replaceChildren();
      hint.textContent = matches.length ? "在每个搜索结果旁设置起点或终点。" : "没有找到地点，试试简短名称或地图上的标注名称。";
      matches.forEach((place) => {
        const item = document.createElement("div");
        item.className = "nav-place-result";
        const name = document.createElement("span");
        name.className = "nav-place-result__name";
        name.textContent = place.name;
        const setStart = document.createElement("button");
        setStart.className = "nav-place-search__set";
        setStart.type = "button";
        setStart.textContent = "起点";
        setStart.addEventListener("click", () => choose(place, "start"));
        const setEnd = document.createElement("button");
        setEnd.className = "nav-place-search__set";
        setEnd.type = "button";
        setEnd.textContent = "终点";
        setEnd.addEventListener("click", () => choose(place, "end"));
        item.append(name, setStart, setEnd);
        results.append(item);
      });
    }

    searchButton.addEventListener("click", runSearch);
    input.addEventListener("keydown", (event) => { if (event.key === "Enter") runSearch(); });
    planButton.addEventListener("click", () => {
      if (!startSelect.value || !endSelect.value || startSelect.value === endSelect.value) {
        status.textContent = "先设置不同的起点和终点，再生成推荐路线。";
        return;
      }
      if (legacyPlanButton) legacyPlanButton.click();
      else status.textContent = "路线计算控件暂不可用，请刷新页面后重试。";
    });

    updateSelected();
    runSearch();
  }

  function refresh() {
    const panel = document.querySelector("#map-nav-panel");
    if (panel) installSearch(panel);
    const viewport = document.querySelector("#map-viewport");
    const launch = viewport?.querySelector(".map-nav-launch");
    if (launch) {
      launch.setAttribute("aria-label", "搜索校园地点并规划路线");
      launch.title = "搜索地点，设置起点和终点";
    }
  }

  function mount() {
    addStyles();
    const guide = document.querySelector("#guide-panel");
    if (guide) {
      const storyObserver = new MutationObserver(() => addWeaponsPlazaStory(guide));
      storyObserver.observe(guide, { childList: true, subtree: true });
      addWeaponsPlazaStory(guide);
    }
    const map = document.querySelector("#map-viewport");
    if (map) {
      const mapObserver = new MutationObserver(refresh);
      mapObserver.observe(map, { childList: true, subtree: true });
    }
    refresh();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount, { once: true });
  } else {
    mount();
  }
})();

