(() => {
  const style = document.createElement("style");
  style.id = "campus-guide-polish";
  style.textContent = `
    #map-nav-panel,
    #guide-panel {
      color: #203b39;
      font-family: "Microsoft YaHei", "PingFang SC", system-ui, sans-serif;
      text-rendering: optimizeLegibility;
    }
    .brand-copy small { font-size: 10px; }
    .topbar-note, .top-home { font-size: 11px; }
    #home .home-mark, #home .entry-index, #home .home-statline,
    #home .map-frame-top, #home .map-frame-bottom { font-size: 10px; }
    #home .entry-description { font-size: 12px; line-height: 1.65; }
    #experience .crumb { font-size: 11px; }
    #experience .mode-button { font-size: 12px; }
    #experience .map-heading small, #experience .map-badge,
    #experience .map-legend, #experience .experience-footer { font-size: 10px; }
    #guide-panel .panel-kicker { font-size: 11px; }
    #guide-panel .panel-title { font-size: 26px; }
    #guide-panel .panel-intro { font-size: 12px; }
    #guide-panel .route-choice-body small { font-size: 11px; }
    #guide-panel .route-sequence, #guide-panel .route-choice-count small,
    #guide-panel .route-note, #guide-panel .progress-copy { font-size: 10px; }
    #guide-panel .route-stop-copy b { font-size: 12px; }
    #guide-panel .route-stop-copy small { font-size: 10px; }
    #guide-panel .filter-chip { min-height: 32px; padding: 6px 9px; font-size: 10px !important; }
    #guide-panel .place-copy b { font-size: 11px; }
    #guide-panel .place-copy small, #guide-panel .place-quick { font-size: 9px !important; }
    #guide-panel .route-tools > span { font-size: 10px; }
    #guide-panel .route-tool { min-height: 36px; font-size: 10px !important; }
    #guide-panel .builder-step b { font-size: 11px; }
    #guide-panel .builder-step small { font-size: 10px; }
    #guide-panel .route-disclaimer { font-size: 9px; }
    #map-nav-panel input:not([type="checkbox"]):not([type="radio"]),
    #map-nav-panel select,
    #guide-panel input:not([type="checkbox"]):not([type="radio"]),
    #guide-panel select {
      min-height: 42px;
      box-sizing: border-box;
      border: 1px solid #d6e1dc;
      border-radius: 12px;
      padding: 9px 12px;
      color: #193b37;
      background: #fff;
      transition: border-color 160ms ease, box-shadow 160ms ease;
    }
    #map-nav-panel input:focus-visible,
    #map-nav-panel select:focus-visible,
    #guide-panel input:focus-visible,
    #guide-panel select:focus-visible,
    #map-nav-panel button:focus-visible,
    #guide-panel button:focus-visible,
    #guide-panel a:focus-visible {
      outline: 3px solid rgb(51 148 126 / 28%);
      outline-offset: 2px;
      border-color: #398c7b;
    }
    #map-nav-panel button,
    #guide-panel button {
      min-height: 40px;
      border-radius: 11px;
      transition: transform 150ms ease, box-shadow 150ms ease, background-color 150ms ease;
    }
    #map-nav-panel button:hover,
    #guide-panel button:hover {
      box-shadow: 0 5px 14px rgb(23 64 55 / 12%);
    }
    #map-nav-panel button:active,
    #guide-panel button:active {
      transform: translateY(1px);
    }
    #guide-panel .place-photo-slot {
      width: 100%;
      margin: 16px 0 18px;
      box-sizing: border-box;
      padding: 0;
      border: 0;
      border-radius: 0;
      background: transparent;
    }
    #guide-panel .place-photo-card {
      margin: 0;
      overflow: hidden;
      border: 1px solid #e1e8e3;
      border-radius: 16px;
      background: #fff;
      box-shadow: 0 8px 24px rgb(23 64 55 / 8%);
    }
    #guide-panel .place-photo-card img {
      display: block;
      width: 100%;
      max-height: 320px;
      aspect-ratio: 16 / 9;
      object-fit: cover;
      background: #edf3ef;
    }
    #guide-panel .place-photo-card figcaption {
      padding: 9px 12px;
      color: #61756f;
      font-size: 12px;
      line-height: 1.55;
    }
    #guide-panel details.story-accordion > summary {
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }
    @media (max-width: 720px) {
      #map-nav-panel,
      #guide-panel {
        max-width: 100%;
        box-sizing: border-box;
      }
      #map-nav-panel input:not([type="checkbox"]):not([type="radio"]),
      #map-nav-panel select,
      #guide-panel input:not([type="checkbox"]):not([type="radio"]),
      #guide-panel select {
        max-width: 100%;
      }
      #guide-panel .place-photo-card img {
        max-height: 240px;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      #map-nav-panel *,
      #guide-panel * {
        scroll-behavior: auto !important;
        transition-duration: 0.01ms !important;
        animation-duration: 0.01ms !important;
      }
    }
  `;
  (document.head || document.documentElement).appendChild(style);
})();

