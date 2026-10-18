(() => {
  const albumSource = "https://photo.sina.cn/album_37_88171_570970.htm?ch=37&hd=1&vt=4";
  const photos = [
    {
      title: "校园入口",
      note: "校园入口实景",
      image: "https://k.sinaimg.cn/n/ln/37_img/upload/3e29cdcd/0/w2048h1152/20190821/9848-icmpfxa9122126.jpg/w640slw.jpg",
      alt: "沈阳理工大学校园入口实景，公开图集未标注门别",
      source: albumSource,
      shape: "photo-tall"
    },
    {
      title: "校园的开阔与秩序",
      note: "校园鸟瞰",
      image: "https://k.sinaimg.cn/n/ln/37_img/upload/3e29cdcd/235/w2048h1387/20190821/eac9-icmpfxa9108590.jpg/w640slw.jpg",
      alt: "沈阳理工大学校园鸟瞰",
      source: albumSource,
      shape: "photo-wide"
    },
    {
      title: "琴湖光影",
      note: "湖畔景观",
      image: "https://k.sinaimg.cn/n/ln/37_img/upload/3e29cdcd/796/w2048h1148/20190821/6121-icmpfxa9119423.jpg/w640slw.jpg",
      alt: "沈阳理工大学琴湖",
      source: albumSource,
      shape: ""
    },
    {
      title: "志学堂",
      note: "校园地标实景",
      image: "https://k.sinaimg.cn/n/ln/37_img/upload/3e29cdcd/639/w2048h991/20190821/b160-icmpfxa9111351.jpg/w640slw.jpg",
      alt: "沈阳理工大学志学堂",
      source: albumSource,
      shape: ""
    },
    {
      title: "兵器广场",
      note: "室外装备陈列",
      image: "https://k.sinaimg.cn/n/ln/37_img/upload/3e29cdcd/213/w2048h1365/20190821/3aa8-icmpfxa9124898.jpg/w640slw.jpg",
      alt: "沈阳理工大学兵器广场",
      source: albumSource,
      shape: "photo-wide"
    },
    {
      title: "兵器博物馆",
      note: "馆内展陈",
      image: "https://k.sinaimg.cn/n/ln/37_img/upload/3e29cdcd/188/w2048h540/20190821/ed60-icmpfxa9121739.jpg/w640slw.jpg",
      alt: "沈阳理工大学兵器博物馆",
      source: albumSource,
      shape: ""
    },
    {
      title: "走进展馆",
      note: "参观活动报道配图 · 辽宁省教育厅",
      image: "https://jyt.ln.gov.cn/eportal/fileDir/data/lnsjyt/W020210512541687796566.jpg",
      alt: "辽宁省教育厅报道中的兵器博物馆参观活动照片",
      source: "https://jyt.ln.gov.cn/jyt/jyzx/jyyw/10C75312802C4A11BC8A9414992CB9EB/index.shtml",
      shape: ""
    }
  ];

  const places = [
    [1,"library","图书馆"],[2,"complex","综合楼"],[3,"materials","材料楼"],[4,"information","信息楼"],
    [5,"mechanical","机械楼"],[6,"engineering-practice","工程实践中心"],[7,"administration","党政办公楼"],[8,"science-hall","科学会堂"],
    [9,"faculty-dining","教工食堂"],[10,"lihe-hotel","利合宾馆"],[11,"science-school","理学院"],[12,"light-dining","轻餐馆"],
    [13,"laboratory","实验室"],[14,"qinhu","琴湖"],[15,"longxiang-stadium","龙翔体育场"],[16,"art-gallery","艺术馆"],
    [17,"tennis-courts","网球场"],[18,"basketball-courts","篮球场"],[19,"mini-football","小足球场"],[20,"student-dining","学生食堂"],
    [21,"service-center","综合服务中心"],
    ...Array.from({ length: 16 }, (_, index) => [index + 22, `dorm-${index + 1}`, `宿舍${index + 1}号楼`]),
    [38,"confucius","孔子像"],[39,"clinic","校医院"],[40,"north-gate","北门"],[41,"south-gate","南门"],
    [42,"east-gate","东门"],[43,"weapons-museum","兵器博物馆"],[44,"history-hall","校史馆"]
  ].map(([number,id,name]) => ({ number, id, name }));

  const placePhotos = {
    14: { image:"https://k.sinaimg.cn/n/ln/37_img/upload/3e29cdcd/796/w2048h1148/20190821/6121-icmpfxa9119423.jpg/w640slw.jpg", source:albumSource, caption:"琴湖实景" },
    15: { image:"https://yurenhao1.sizhengwang.cn/upload/resources/image/2023/06/30/6144926.jpg", source:"https://yurenhao1.sizhengwang.cn/a/sylgdx/230628/1560439.shtml", caption:"田径运动会现场 · 报道配图" },
    9: { image:"https://k.sinaimg.cn/n/ln/37_img/upload/3e29cdcd/0/w2048h1152/20190821/0410-icmpfxa9126309.jpg/w640slw.jpg", source:albumSource, caption:"校园餐饮中心参考照 · 具体食堂待现场核对" },
    10: { image:"https://k.sinaimg.cn/n/ln/37_img/upload/3e29cdcd/0/w2048h1152/20190821/0410-icmpfxa9126309.jpg/w640slw.jpg", source:albumSource, caption:"校园餐饮中心参考照 · 具体食堂待现场核对" },
    20: { image:"https://k.sinaimg.cn/n/ln/37_img/upload/3e29cdcd/0/w2048h1152/20190821/0410-icmpfxa9126309.jpg/w640slw.jpg", source:albumSource, caption:"校园餐饮中心参考照 · 具体食堂待现场核对" },
    38: { image:"https://k.sinaimg.cn/n/ln/37_img/upload/3e29cdcd/209/w2048h1361/20190821/68e2-icmpfxa9118995.jpg/w640slw.jpg", source:albumSource, caption:"孔子像实景" },
    40: { image:"https://k.sinaimg.cn/n/ln/37_img/upload/3e29cdcd/0/w2048h1152/20190821/9848-icmpfxa9122126.jpg/w640slw.jpg", source:albumSource, caption:"校园入口实景" },
    43: { image:"https://k.sinaimg.cn/n/ln/37_img/upload/3e29cdcd/188/w2048h540/20190821/ed60-icmpfxa9121739.jpg/w640slw.jpg", source:albumSource, caption:"兵器博物馆实景" }
  };

  const style = document.createElement("style");
  style.textContent = `
    .photo-archive{--photo-ink:#193b35;--photo-rust:#b84734;position:relative;grid-column:1/-1;flex:1 0 100%;width:100%;isolation:isolate;overflow:hidden;margin:clamp(48px,8vw,104px) auto 0;padding:clamp(26px,5vw,66px) clamp(18px,5.5vw,76px) clamp(34px,6vw,72px);max-width:1440px;color:var(--photo-ink);background:#ebe7dc;border:1px solid rgba(25,59,53,.12);box-shadow:0 22px 60px rgba(35,45,37,.08)}
    .photo-archive:before{content:"";position:absolute;z-index:-1;width:370px;height:370px;right:-90px;top:-155px;border:1px solid rgba(184,71,52,.15);border-radius:50%;box-shadow:0 0 0 22px rgba(184,71,52,.025),0 0 0 48px rgba(184,71,52,.025)}
    .photo-archive__head{display:flex;align-items:end;justify-content:space-between;gap:24px;margin:0 0 27px}
    .photo-archive__eyebrow{margin:0 0 9px;font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:var(--photo-rust);font-weight:700}
    .photo-archive__title{margin:0;font-family:"Noto Serif SC","Songti SC",serif;font-size:clamp(27px,4vw,43px);font-weight:650;letter-spacing:.06em;line-height:1.2}
    .photo-archive__intro{max-width:420px;margin:0;color:#53635a;font-size:13px;line-height:1.9}
    .photo-archive__grid{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));grid-auto-rows:clamp(118px,13vw,190px);gap:12px}
    .photo-archive__item{position:relative;grid-column:span 4;grid-row:span 1;min-width:0;margin:0;overflow:hidden;background:#d5d1c3;isolation:isolate}
    .photo-archive__item.photo-tall{grid-column:span 4;grid-row:span 2}
    .photo-archive__item.photo-wide{grid-column:span 8}
    .photo-archive__item a{position:absolute;z-index:1;inset:0;display:block;color:white;text-decoration:none}
    .photo-archive__item img{width:100%;height:100%;display:block;object-fit:cover;transition:transform .7s cubic-bezier(.2,.7,.2,1),filter .4s ease;filter:saturate(.84)}
    .photo-archive__item:hover img{transform:scale(1.045);filter:saturate(1)}
    .photo-archive__item:after{content:"";position:absolute;z-index:0;inset:35% 0 0;background:linear-gradient(180deg,transparent,rgba(8,24,22,.8));pointer-events:none}
    .photo-archive__caption{position:absolute;z-index:1;left:17px;right:17px;bottom:15px;display:flex;flex-direction:column;gap:4px;color:white}
    .photo-archive__caption strong{font-family:"Noto Serif SC","Songti SC",serif;font-size:clamp(15px,1.6vw,20px);letter-spacing:.05em;font-weight:600}
    .photo-archive__caption small{font-size:10px;letter-spacing:.08em;color:rgba(255,255,255,.76)}
    .photo-archive__item.is-unavailable{background:linear-gradient(140deg,#d6d1c3,#b9c0ae)}
    .photo-archive__item.is-unavailable:before{content:"影像暂不可用";position:absolute;inset:0;display:grid;place-items:center;color:rgba(25,59,53,.7);font-size:12px;letter-spacing:.12em}
    .photo-archive__credit{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-top:17px;padding-top:12px;border-top:1px solid rgba(25,59,53,.16);color:#66736b;font-size:11px;line-height:1.8}
    .photo-archive__credit a{color:#365d50;text-decoration:underline;text-underline-offset:3px}
    @media(max-width:760px){.photo-archive{margin-top:48px;padding:27px 16px 30px}.photo-archive__head{display:block}.photo-archive__intro{margin-top:10px}.photo-archive__grid{grid-template-columns:repeat(2,minmax(0,1fr));grid-auto-rows:145px;gap:8px}.photo-archive__item,.photo-archive__item.photo-tall,.photo-archive__item.photo-wide{grid-column:span 1;grid-row:span 1}.photo-archive__item:first-child,.photo-archive__item:nth-child(5){grid-column:span 2}.photo-archive__caption{left:12px;right:12px;bottom:11px}.photo-archive__credit{align-items:flex-start;flex-direction:column;gap:4px}}
  `;
  document.head.append(style);

  function mount() {
    const home = document.getElementById("home");
    if (!home || home.querySelector(".photo-archive")) return;
    const section = document.createElement("section");
    section.className = "photo-archive";
    section.setAttribute("aria-labelledby", "photo-archive-title");
    section.innerHTML = `
      <header class="photo-archive__head">
        <div><p class="photo-archive__eyebrow">FIELD NOTES · SHENYANG LIGONG UNIVERSITY</p><h2 class="photo-archive__title" id="photo-archive-title">沿着地图，看见真实校园</h2></div>
        <p class="photo-archive__intro">从校园入口、琴湖与志学堂，到兵器广场和馆内展陈。每张照片都附有来源，带你从地图上的点位走进真实场景。</p>
      </header>
      <div class="photo-archive__grid">${photos.map((photo) => `
        <figure class="photo-archive__item ${photo.shape}">
          <a href="${photo.source}" target="_blank" rel="noopener noreferrer" aria-label="查看${photo.title}来源页面">
            <img src="${photo.image}" alt="${photo.alt}" loading="lazy" referrerpolicy="no-referrer" onerror="this.closest('figure').classList.add('is-unavailable')">
            <figcaption class="photo-archive__caption"><strong>${photo.title}</strong><small>${photo.note}</small></figcaption>
          </a>
        </figure>`).join("")}</div>
      <div class="photo-archive__credit"><span>校园影像来源：新浪图片《带你走进沈阳理工大学》</span><a href="https://photo.sina.cn/album_37_88171_570970.htm?ch=37&hd=1&vt=4" target="_blank" rel="noopener noreferrer">查看校园图集 ↗</a><span>参观现场：<a href="https://jyt.ln.gov.cn/jyt/jyzx/jyyw/10C75312802C4A11BC8A9414992CB9EB/index.shtml" target="_blank" rel="noopener noreferrer">辽宁省教育厅报道 ↗</a></span></div>
    `;
    home.append(section);
  }

  window.CAMPUS_PLACES = places;

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount, { once: true });
  else mount();
})();

