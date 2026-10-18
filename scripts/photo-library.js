(() => {
  const sources = {
    sinaAlbum: "https://photo.sina.cn/album_37_88171_570970.htm?ch=37&hd=1&vt=4",
    sports: "https://yurenhao1.sizhengwang.cn/a/sylgdx/230628/1560439.shtml",
  };

  const images = {
    campus: {
      src: "https://k.sinaimg.cn/n/ln/37_img/upload/3e29cdcd/744/w2048h1096/20190821/2214-icmpfxa9113515.jpg/w640slw.jpg",
      label: "校内风景 · 校园环境参考",
      note: "校园环境参考；此图不代表所选建筑的近景。",
      source: sources.sinaAlbum,
    },
    teaching: {
      src: "https://k.sinaimg.cn/n/ln/37_img/upload/3e29cdcd/639/w2048h991/20190821/b160-icmpfxa9111351.jpg/w640slw.jpg",
      label: "志学堂 · 教学区参考",
      note: "校内教学空间参考；此图不代表所选楼宇的近景。",
      source: sources.sinaAlbum,
    },
    aerial: {
      src: "https://k.sinaimg.cn/n/ln/37_img/upload/3e29cdcd/235/w2048h1387/20190821/eac9-icmpfxa9108590.jpg/w640slw.jpg",
      label: "校园航拍 · 校园整体参考",
      note: "校园整体环境参考；此图不代表某一栋宿舍楼的近景。",
      source: sources.sinaAlbum,
    },
    dining: {
      src: "https://k.sinaimg.cn/n/ln/37_img/upload/3e29cdcd/0/w2048h1152/20190821/0410-icmpfxa9126309.jpg/w640slw.jpg",
      label: "餐饮服务中心 · 食堂区域参考",
      note: "餐饮服务中心参考；此图不代表每个食堂的室内环境。",
      source: sources.sinaAlbum,
    },
    lake: {
      src: "https://k.sinaimg.cn/n/ln/37_img/upload/3e29cdcd/796/w2048h1148/20190821/6121-icmpfxa9119423.jpg/w640slw.jpg",
      label: "琴湖光影",
      note: "琴湖实景。",
      source: sources.sinaAlbum,
    },
    confucius: {
      src: "https://k.sinaimg.cn/n/ln/37_img/upload/3e29cdcd/209/w2048h1361/20190821/68e2-icmpfxa9118995.jpg/w640slw.jpg",
      label: "孔子像",
      note: "孔子像实景。",
      source: sources.sinaAlbum,
    },
    northGate: {
      src: "https://k.sinaimg.cn/n/ln/37_img/upload/3e29cdcd/0/w2048h1152/20190821/9848-icmpfxa9122126.jpg/w640slw.jpg",
      label: "校园校门实景参考",
      note: "学校公开图集未说明门别；不作为南门或东门的专属照片。",
      source: sources.sinaAlbum,
    },
    museum: {
      src: "https://k.sinaimg.cn/n/ln/37_img/upload/3e29cdcd/188/w2048h540/20190821/ed60-icmpfxa9121739.jpg/w640slw.jpg",
      label: "兵器博物馆",
      note: "兵器博物馆实景。",
      source: sources.sinaAlbum,
    },
    stadium: {
      src: "https://yurenhao1.sizhengwang.cn/upload/resources/image/2023/06/30/6144926.jpg",
      label: "校园体育活动",
      note: "沈阳理工大学运动会报道配图；作为体育区域参考，不代表球场近景。",
      source: sources.sports,
    },
    plaza: {
      src: "https://k.sinaimg.cn/n/ln/37_img/upload/3e29cdcd/213/w2048h1365/20190821/3aa8-icmpfxa9124898.jpg/w640slw.jpg",
      label: "兵器广场",
      note: "兵器广场实景。",
      source: sources.sinaAlbum,
    },
    fallback: {
      src: "https://k.sinaimg.cn/n/ln/37_img/upload/3e29cdcd/744/w2048h1096/20190821/2214-icmpfxa9113515.jpg/w640slw.jpg",
      label: "沈阳理工大学校园环境参考",
      note: "学校公开图集；此图展示校园环境，不代表所选地点的近景。",
      source: sources.sinaAlbum,
    },
  };

  const exact = {
    10: images.campus,
    14: images.lake,
    15: images.stadium,
    38: images.confucius,
    40: images.northGate,
    43: images.museum,
  };
  const diningPlaces = new Set([9, 12, 20]);
  const teachingPlaces = new Set([2, 3, 4, 5, 6, 7, 8, 11, 13, 16, 21]);
  const dormNumbers = new Set(Array.from({ length: 16 }, (_, index) => index + 22));

  function getImage(number) {
    if (exact[number]) return exact[number];
    if (diningPlaces.has(number)) return images.dining;
    if (teachingPlaces.has(number)) return images.teaching;
    if (dormNumbers.has(number)) return images.aerial;
    if ([17, 18, 19].includes(number)) return images.stadium;
    if ([41, 42].includes(number)) return images.fallback;
    return images.campus;
  }

  function placeName(number) {
    const place = (window.CAMPUS_PLACES || []).find((item) => Number(item.number) === number);
    return place?.name || `校园地点 ${number}`;
  }

  function createImageCard(slot, number) {
    const photo = getImage(number);
    const figure = document.createElement("figure");
    figure.className = "place-photo-card";

    const image = document.createElement("img");
    image.className = "place-photo-image";
    image.src = photo.src;
    image.alt = `${placeName(number)}：${photo.label}`;
    image.loading = "lazy";
    image.referrerPolicy = "no-referrer";
    image.addEventListener("error", () => {
      if (image.dataset.fallback !== "used" && photo.src !== images.fallback.src) {
        image.dataset.fallback = "used";
        image.src = images.fallback.src;
        image.alt = `${placeName(number)}：${images.fallback.label}`;
        const fallbackTitle = figure.querySelector("figcaption strong");
        const fallbackNote = figure.querySelector("figcaption .place-photo-note");
        const fallbackSource = figure.querySelector("figcaption a");
        if (fallbackTitle) fallbackTitle.textContent = images.fallback.label;
        if (fallbackNote) fallbackNote.textContent = images.fallback.note;
        if (fallbackSource) fallbackSource.href = images.fallback.source;
        return;
      }
      const unavailable = document.createElement("div");
      unavailable.className = "place-photo-error";
      unavailable.textContent = "校园影像暂时无法载入";
      image.replaceWith(unavailable);
    });

    const caption = document.createElement("figcaption");
    const title = document.createElement("strong");
    title.textContent = photo.label;
    const note = document.createElement("span");
    note.className = "place-photo-note";
    note.textContent = photo.note;
    const source = document.createElement("a");
    source.href = photo.source;
    source.target = "_blank";
    source.rel = "noopener noreferrer";
    source.textContent = "查看图片来源";
    caption.append(title, note, document.createElement("br"), source);
    figure.append(image, caption);

    const heading = slot.querySelector(".place-photo-heading");
    if (heading) slot.replaceChildren(heading, figure);
    else slot.replaceChildren(figure);
    slot.dataset.photoLibraryNumber = String(number);
  }

  function refresh() {
    const number = Number(window.__selectedCampusPlaceNumber);
    if (!Number.isInteger(number) || number < 1 || number > 44) return;
    const panel = document.querySelector("#guide-panel");
    if (!panel) return;
    const slot = panel.querySelector('.place-photo-slot[data-place-number="' + number + '"]');
    if (!slot) return;
    if (!(slot.dataset.photoLibraryNumber === String(number) && slot.querySelector("img"))) createImageCard(slot, number);
  }

  function mount() {
    const panel = document.querySelector("#guide-panel");
    if (!panel) return;
    const observer = new MutationObserver(refresh);
    observer.observe(panel, { childList: true, subtree: true });
    refresh();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount, { once: true });
  } else {
    mount();
  }
})();

