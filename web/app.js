(() => {
  const GD = window.GAME_DATA;
  const STORAGE_KEY = "fog_harbor_court_v2";
  const PAGES = ["案件卷宗", "詢問證人", "時間線推理", "證據攻防", "最後推理"];
  const PAGE_GUIDES = {
    案件卷宗:
      "💡 <b>步驟 1｜6 區域互動解謎搜查</b>：從<b>🏛️ 2F B 展廳</b>出發，動手解開<b>側光角度＋紫外線顯影</b>、<b>中控室密碼鎖（1842）</b>、<b>警報分區開關</b>、<b>修復室 R-07 顯微鏡找碴</b>、<b>複寫聯掀頁</b>與<b>策展人黃銅密碼箱</b>，探索三層樓 6 大空間並收齊卷宗！",
    詢問證人:
      "💡 <b>步驟 2｜詢問三位證人</b>：點選證人切換對象，可用「快捷追問」或自由輸入問題，觀察誰的說法有破綻。在現場蒐集更多證物會解鎖新的追問。",
    時間線推理:
      "💡 <b>步驟 3｜重建案發時間線</b>：把四張關鍵紀錄放回正確時間，再判斷出庫單和勤務簿「能證明什麼、不能證明什麼」。答錯會逐步給提示，可不限次重試。",
    證據攻防:
      "💡 <b>步驟 4｜在法庭上提出矛盾</b>：先選一句「說謊或有誤的證詞」，再選一項「能推翻它的證物」，找出 <b>2 項關鍵矛盾</b>。答錯會逐步提示，第三級會揭示正確配對，不會直接判輸。",
    最後推理:
      "💡 <b>步驟 5｜揭開真相並結案</b>：蒐集證物、重建時間線、辨明證據界線並揭穿兩項矛盾後，指出誰移走原畫，並選出能說明原因的證據鏈。",
  };

  const EVIDENCE_BY_ID = Object.fromEntries(GD.EVIDENCE.map((e) => [e.id, e]));
  const SCENES_BY_ID = Object.fromEntries(GD.SCENES.map((s) => [s.id, s]));
  const ENV_BY_ID = Object.fromEntries(GD.ENV_OBJECTS.map((o) => [o.id, o]));
  const WHEEL_SETS = [
    ["A", "B", "L", "R", "S"],
    ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
    ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
  ];

  function esc(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function createInitialState() {
    return {
      introCompleted: false,
      introPanelIndex: 0,
      activePage: PAGES[0],
      activeInfoTab: "bag",
      activeWitness: "curator",
      viewedEvidence: [],
      inspectedObjects: [],
      unlockedScenes: GD.SCENES.filter((s) => s.initial_unlocked).map((s) => s.id),
      currentScene: "gallery",
      radarOn: false,
      fullscreen: false,
      activeOverlay: null, // null | evId | objId | "BAG" | "MAP"
      // Interactive puzzle states
      lightAngle: 15,
      uvOn: false,
      peelPct: 0,
      nbPage: "1",
      kpCode: "",
      kpError: "",
      e1Unlocked: false,
      e2Zones: { "2F-A": false, "2F-B": false, "1F-W": false },
      e2Error: "",
      e2Unlocked: false,
      diffFound: {},
      diffHintOn: false,
      dialIdx: [0, 3, 2],
      dialError: "",
      brassUnlocked: false,
      // Chat & AI
      aiCalls: 0,
      apiEnabled: false,
      aiBusy: false,
      chatHistory: Object.fromEntries(Object.keys(GD.WITNESSES).map((k) => [k, []])),
      // Timeline puzzle
      timelineSlots: { "18:41": "", "18:42": "", "18:54": "", "18:56": "" },
      scopeE4Choice: null,
      scopeE3Choice: null,
      timelineSolved: false,
      timelineAttempts: 0,
      e4ScopeSolved: false,
      e4ScopeAttempts: 0,
      e3ScopeSolved: false,
      e3ScopeAttempts: 0,
      timelineFeedback: null,
      hintLevel: 0,
      // Courtroom
      courtStatement: "",
      courtEvidence: "",
      foundClues: [],
      wrongChallenges: 0,
      lastCourtResult: null,
      // Verdict
      finalSuspect: "",
      finalReason: "",
      verdictWarning: "",
      ending: null,
    };
  }

  function loadState() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return createInitialState();
      const parsed = JSON.parse(raw);
      return { ...createInitialState(), ...parsed, aiBusy: false, fullscreen: false };
    } catch (_) {
      return createInitialState();
    }
  }

  let state = loadState();
  let toastTimer = null;

  function saveState() {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_) {}
  }

  function syncSceneUnlocks() {
    const set = new Set(state.unlockedScenes || []);
    GD.SCENES.forEach((sc) => {
      if (sc.initial_unlocked) set.add(sc.id);
    });
    state.viewedEvidence.forEach((evId) => {
      (EVIDENCE_BY_ID[evId]?.unlocks_scenes || []).forEach((s) => set.add(s));
    });
    state.inspectedObjects.forEach((objId) => {
      (ENV_BY_ID[objId]?.unlocks_scenes || []).forEach((s) => set.add(s));
    });
    state.unlockedScenes = Array.from(set);
    if (!set.has(state.currentScene)) {
      state.currentScene = state.unlockedScenes[0] || "gallery";
    }
  }
  syncSceneUnlocks();

  // Check if server has GEMINI_API_KEY configured (non-blocking)
  fetch("/api/ask")
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => {
      if (data && typeof data.apiEnabled === "boolean") {
        state.apiEnabled = data.apiEnabled;
        if (state.introCompleted && state.activePage === "詢問證人") render();
      }
    })
    .catch(() => {});

  function resetGame(showPrologue = true) {
    const apiEnabled = state.apiEnabled;
    state = createInitialState();
    state.apiEnabled = apiEnabled;
    state.introCompleted = !showPrologue;
    saveState();
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function showToast(msg) {
    const el = document.querySelector(".scene-toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 3200);
  }

  function collectTarget(targetId) {
    if (EVIDENCE_BY_ID[targetId]) {
      if (!state.viewedEvidence.includes(targetId)) {
        state.viewedEvidence.push(targetId);
      }
      if (targetId === "E1") state.e1Unlocked = true;
      if (targetId === "E2") state.e2Unlocked = true;
    } else if (ENV_BY_ID[targetId]) {
      if (!state.inspectedObjects.includes(targetId)) {
        state.inspectedObjects.push(targetId);
      }
      if (targetId === "OBJ_UV_EASEL") state.diffFound = { d1: true, d2: true, d3: true };
      if (targetId === "OBJ_BRASS_BOX") state.brassUnlocked = true;
    }
    syncSceneUnlocks();
    saveState();
    render();
  }

  function fallbackWitnessReply(witnessId, question) {
    const q = question.toLowerCase();
    const pools = GD.FALLBACK_REPLIES[witnessId];
    let candidates = null;
    let bestHits = 0;
    for (const topic of pools.topics) {
      const hits = topic.keywords.reduce((acc, w) => acc + (q.includes(w) ? 1 : 0), 0);
      if (hits > bestHits) {
        bestHits = hits;
        candidates = topic.replies;
      }
    }
    if (!candidates) {
      const isRelevant = GD.CASE_KEYWORDS.some((w) => q.includes(w));
      candidates = isRelevant ? pools.default : pools.irrelevant;
    }
    const history = state.chatHistory[witnessId] || [];
    const lastReply = [...history].reverse().find((m) => m.role === "assistant")?.text;
    const fresh = candidates.filter((line) => line !== lastReply);
    const pool = fresh.length ? fresh : candidates;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  async function submitWitnessQuestion(witnessId, question, useAi = true) {
    const cleanQ = question.trim().slice(0, 240);
    if (!cleanQ || state.ending || state.aiBusy) return;

    state.chatHistory[witnessId].push({ role: "user", text: cleanQ });

    if (!useAi || !state.apiEnabled || state.aiCalls >= GD.MAX_AI_CALLS_PER_SESSION) {
      const reply = fallbackWitnessReply(witnessId, cleanQ);
      state.chatHistory[witnessId].push({ role: "assistant", text: reply });
      saveState();
      render();
      scrollChatBottom();
      return;
    }

    state.aiBusy = true;
    render();
    scrollChatBottom();

    let reply = null;
    try {
      const resp = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          witnessId,
          question: cleanQ,
          history: state.chatHistory[witnessId].slice(-7, -1),
          sessionCallCount: state.aiCalls,
        }),
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.attempted) state.aiCalls += 1;
        if (data.reply) reply = data.reply;
      }
    } catch (_) {}

    if (!reply) {
      reply = fallbackWitnessReply(witnessId, cleanQ);
    }
    state.aiBusy = false;
    state.chatHistory[witnessId].push({ role: "assistant", text: reply });
    saveState();
    render();
    scrollChatBottom();
  }

  function scrollChatBottom() {
    const log = document.querySelector(".chat-log");
    if (log) log.scrollTop = log.scrollHeight;
  }

  /* ==================== RENDER: PROLOGUE ==================== */
  function renderPrologue() {
    const idx = Math.min(state.introPanelIndex, GD.PROLOGUE_PANELS.length - 1);
    const panel = GD.PROLOGUE_PANELS[idx];
    const shortLabels = ["01 第六個人影", "02 R-07 仿作", "03 嫌疑人", "04 被刮掉的名字"];
    const pct = Math.round(((idx + 1) / GD.PROLOGUE_PANELS.length) * 100);

    return `
      <div class="app-shell">
        <div class="prologue-shell">
          <div class="prologue-kicker">CASE FILE 01 · INTERACTIVE COMIC PROLOGUE</div>
          <h1 class="prologue-title">《${esc(GD.CASE_TITLE)}》</h1>
          <p class="prologue-intro">先逐格翻開四格漫畫序章，再踏入市立霧港美術館展開三層樓 6 區域搜查。線索將逐步浮現，真相留待你親自推理。</p>

          <div class="prologue-chapters">
            ${shortLabels
              .map(
                (label, i) => `
              <button class="btn ${i === idx ? "btn-primary" : ""}" data-prologue-jump="${i}">${label}</button>`
              )
              .join("")}
          </div>

          <div style="font-size:0.82rem;color:#c4bbaa;margin-bottom:0.35rem;">漫畫序章｜第 ${idx + 1} 格 / 共 ${GD.PROLOGUE_PANELS.length} 格</div>
          <div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:${pct}%"></div></div>

          <section class="comic-panel">
            <div class="comic-image-wrap">
              <span class="comic-panel-badge">PANEL 0${idx + 1} / 0${GD.PROLOGUE_PANELS.length}</span>
              <img src="${esc(panel.image)}" alt="${esc(panel.alt)}" />
            </div>
            <div class="comic-copy">
              <div class="comic-chapter">${esc(panel.chapter)}</div>
              <h2>${esc(panel.title)}</h2>
              <p>${esc(panel.text)}</p>
              <div class="comic-caption">${esc(panel.caption)}</div>
            </div>
          </section>

          <div class="prologue-controls">
            <div>
              ${idx > 0 ? `<button class="btn btn-block" data-prologue-prev="1">← 上一格</button>` : ""}
            </div>
            <div>
              <button class="btn btn-block" data-prologue-skip="1">⏭️ 跳過序章</button>
            </div>
            <div>
              ${
                idx < GD.PROLOGUE_PANELS.length - 1
                  ? `<button class="btn btn-primary btn-block" data-prologue-next="1">下一格 →</button>`
                  : `<button class="btn btn-primary btn-block" data-prologue-start="1">⚖️ 進入美術館開始調查</button>`
              }
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /* ==================== RENDER: 2D EXPLORER & PUZZLES ==================== */
  function buildEvidenceGadgetHtml(evId, imgSrc) {
    if (evId === "E1") {
      const screenCls = state.e1Unlocked ? "unlocked" : state.kpError ? "error" : "";
      const screenText = state.e1Unlocked
        ? "ACCESS GRANTED · 門禁日誌已解鎖"
        : state.kpError || (state.kpCode + "____").slice(0, 4);
      return `
        <div class="puzzle-panel">
          <div style="font-size:0.75rem;color:#79C0FF;font-weight:800;">🔐 關卡｜中控主機 4 位數時間密碼鎖</div>
          <div class="puzzle-screen ${screenCls}">${esc(screenText)}</div>
          <div class="keypad-grid">
            ${["1", "2", "3", "4", "5", "6", "7", "8", "9"]
              .map((n) => `<button type="button" class="kp-btn" data-kp-key="${n}">${n}</button>`)
              .join("")}
            <button type="button" class="kp-btn clear" data-kp-key="CLR">清除</button>
            <button type="button" class="kp-btn" data-kp-key="0">0</button>
            <button type="button" class="kp-btn enter" data-kp-key="ENT">✓ 解鎖</button>
          </div>
          <button type="button" class="puzzle-hint-btn" data-toggle-hint="#hint-e1">💡 查看密碼線索提示</button>
          <div class="puzzle-hint-text" id="hint-e1">提示：回想序章或 B1 勤務簿第 2 頁寫著「＿＿：＿＿，燈光轉暗，第六個人又出現了」的 4 位數字（答案：1842）。</div>
        </div>
      `;
    }
    if (evId === "E2") {
      const screenCls = state.e2Unlocked ? "unlocked" : state.e2Error ? "error" : "";
      const screenText = state.e2Unlocked
        ? "⚠️ ZONE 2F-B 偵測到旁路日誌 · 已還原"
        : state.e2Error || "請切換案發分區開關並掃描";
      const zones = [
        ["2F-A", "ZONE 2F-A（A 展廳常設展）"],
        ["2F-B", "ZONE 2F-B（B 展廳《海霧港灣》）"],
        ["1F-W", "ZONE 1F-W（1F 西側裝卸區）"],
      ];
      return `
        <div class="puzzle-panel">
          <div style="font-size:0.75rem;color:#E3B341;font-weight:800;">🎛️ 關卡｜分區防盜警報開關檢測器</div>
          <div class="puzzle-screen ${screenCls}">${esc(screenText)}</div>
          <div class="switch-list">
            ${zones
              .map(([z, label]) => {
                const on = Boolean(state.e2Zones[z]);
                return `<button type="button" class="zone-switch-btn ${on ? "is-on" : ""}" data-zone-sw="${z}">
                  <span>${label}</span><span class="sw-pill">${on ? "SCAN ON" : "OFF"}</span>
                </button>`;
              })
              .join("")}
          </div>
          <button type="button" class="gadget-toggle-btn" data-action="e2-scan">📡 掃描選定分區的旁路日誌</button>
          <button type="button" class="puzzle-hint-btn" data-toggle-hint="#hint-e2">💡 查看操作提示</button>
          <div class="puzzle-hint-text" id="hint-e2">提示：《海霧港灣》位於 2F B 展廳。請單獨開啟「ZONE 2F-B」，保持其餘兩區為 OFF 再按下掃描！</div>
        </div>
      `;
    }
    if (evId === "E5") {
      const angle = state.lightAngle;
      const angleHit = angle >= 42 && angle <= 56;
      const shadowOp = Math.max(0, 1 - Math.abs(angle - 48) / 24).toFixed(2);
      const statusHtml = state.uvOn
        ? "🟣 <b>UV 365nm 顯影成功！</b>清漆底下浮出女子剪影與被覆蓋的署名<b>「林月琴」</b>，畫框角落確認為 <b>R-07</b> 仿作！"
        : angleHit
        ? "🟡 <b>側光角度對齊（48°）！</b>斜光照在玻璃上浮出第六道人影。再按上方「紫外線燈」檢視清漆底下吧！"
        : "⚪ 請先拖動上方「夜間側光角度拉桿」重現 18:42 玻璃人影，再開啟紫外線燈照射！";
      return `
        <div class="gadget-box">
          <div class="angle-control">
            <label><span>🔦 步驟 1｜夜間側光角度</span><span class="angle-val-display">${angleHit ? `${angle}° ✅ 第六個人影浮現！` : `${angle}°（調至 18:42 斜射光角）`}</span></label>
            <input type="range" class="angle-slider" min="0" max="90" value="${angle}" data-gadget="light-angle" />
          </div>
          <button type="button" class="gadget-toggle-btn uv-btn ${state.uvOn ? "active" : ""}" data-gadget="uv-toggle">
            ${state.uvOn ? "💡 關閉紫外線燈（切回白光）" : "🔦 步驟 2｜開啟紫外線燈照射底片"}
          </button>
          <div class="uv-viewport ${state.uvOn ? "uv-on" : ""}">
            <img src="${esc(imgSrc)}" alt="海霧港灣紫外線底片檢視" />
            <div class="uv-side-shadow" style="opacity:${shadowOp}">
              <svg width="74" height="110" viewBox="0 0 60 90" aria-hidden="true" style="filter:drop-shadow(0 0 10px rgba(255,230,160,0.85));">
                <circle cx="30" cy="18" r="10" fill="rgba(255,244,210,0.72)"/>
                <path d="M16 86 C17 48 21 34 30 34 C39 34 43 48 44 86 Z" fill="rgba(255,244,210,0.58)"/>
              </svg>
            </div>
            <div class="uv-reveal-layer">
              <span class="uv-badge">UV 365nm · 原作清漆下顯影</span>
              <div class="uv-signature-bar">
                <svg width="72" height="92" viewBox="0 0 60 80" aria-hidden="true" style="opacity:0.88;filter:drop-shadow(0 0 8px #A78BFA);">
                  <circle cx="30" cy="18" r="10" fill="rgba(224,242,254,0.82)"/>
                  <path d="M16 76 C17 44 21 32 30 32 C39 32 43 44 44 76 Z" fill="rgba(224,242,254,0.72)"/>
                </svg>
                <div style="text-align:right;">
                  <div style="font-size:0.68rem;color:#DDD6FE;font-weight:700;">清漆下被覆蓋的原作署名</div>
                  <div class="uv-sig-text">林月琴</div>
                </div>
              </div>
            </div>
          </div>
          <div class="uv-status-note">${statusHtml}</div>
        </div>
      `;
    }
    if (evId === "E4") {
      const pct = state.peelPct;
      return `
        <div class="gadget-box">
          <div class="angle-control">
            <label><span>📄 滑動掀開白色正本</span><span class="peel-val-display">${pct >= 65 ? `已掀開 ${pct}% ✅ 露出「林月琴舊畫室」！` : `已掀開 ${pct}%（向右拖動）`}</span></label>
            <input type="range" class="angle-slider" min="0" max="100" value="${pct}" data-gadget="carbon-peel" />
          </div>
          <div class="peel-stage">
            <div><b>【第二聯｜底部藍色複寫聯壓痕】</b></div>
            <div>正本塗改後，墊在底下的藍色複寫紙清晰印出目的地：</div>
            <span class="carbon-stamp traced">📍 運送目的地：林月琴舊畫室</span>
            <div style="margin-top:0.35rem;font-size:0.74rem;">※ 註：貨物欄依舊空白，複寫聯能證明去向，不能單獨證明箱內物品。</div>
            <div class="peel-top-sheet" style="transform:translateX(-${pct}%)">
              <div><b>【第一聯｜白色正本存根】</b></div>
              <div>放行時間：18:56 ｜ 出口：1F 西側裝卸區</div>
              <div>項目：恆溫運輸箱 1 只（標示：器材退庫）｜簽核：林書妍</div>
              <span class="carbon-stamp blank">箱內物品欄：【空白未填】</span>
            </div>
          </div>
        </div>
      `;
    }
    if (evId === "E3") {
      const p1 = state.nbPage === "1";
      return `
        <div class="gadget-box">
          <div class="nb-tabs">
            <button type="button" class="nb-tab-btn ${p1 ? "active" : ""}" data-nb-page="1">📋 第 1 頁：當晚簽到表</button>
            <button type="button" class="nb-tab-btn ${!p1 ? "active" : ""}" data-nb-page="2">✏️ 第 2 頁：三晚前頁角速寫</button>
          </div>
          <div class="nb-page ${p1 ? "active" : ""}">
            <div><b>B1 地下器材室｜清潔勤務簽到欄</b></div>
            <div>• 值班人員：王冠宇（清潔員）</div>
            <div>• <b>18:30</b> 打卡簽到（B1 器材室整理清潔車）</div>
            <div>• <b>19:00</b> 值班主管核對簽退</div>
            <div style="margin-top:0.3rem;font-size:0.74rem;color:#6E5836;">※ 僅有起訖兩個時間戳記，未逐分鐘記錄行蹤。</div>
          </div>
          <div class="nb-page ${!p1 ? "active" : ""}">
            <div><b>三晚前頁角手寫筆記（王冠宇筆跡）：</b></div>
            <div style="font-weight:800;color:#5C2B18;margin:0.2rem 0;">「18:42，燈光轉暗，玻璃裡又多出一個人影。」</div>
            <div class="sketch-svg-wrap">
              <svg viewBox="0 0 260 66" width="100%" height="58" aria-hidden="true">
                <rect x="8" y="6" width="244" height="54" rx="4" fill="none" stroke="#5C4B38" stroke-width="1.5" stroke-dasharray="4 3"/>
                <g fill="#6D5D4B" opacity="0.55">
                  <circle cx="34" cy="24" r="5"/><path d="M26 52 C26 36 42 36 42 52 Z"/>
                  <circle cx="66" cy="24" r="5"/><path d="M58 52 C58 36 74 36 74 52 Z"/>
                  <circle cx="98" cy="24" r="5"/><path d="M90 52 C90 36 106 36 106 52 Z"/>
                  <circle cx="130" cy="24" r="5"/><path d="M122 52 C122 36 138 36 138 52 Z"/>
                  <circle cx="162" cy="24" r="5"/><path d="M154 52 C154 36 170 36 170 52 Z"/>
                </g>
                <g fill="#9E2A2B">
                  <circle cx="212" cy="21" r="6"/><path d="M202 54 C203 33 221 33 222 54 Z"/>
                </g>
                <text x="230" y="24" fill="#9E2A2B" font-size="11" font-weight="bold">18:42</text>
              </svg>
            </div>
          </div>
        </div>
      `;
    }
    return "";
  }

  function renderOverlay() {
    const ovId = state.activeOverlay;
    if (!ovId) return "";

    if (ovId === "MAP") {
      const floors = [
        ["2F", "2F｜展廳與策展人辦公樓層"],
        ["1F", "1F｜保全中控與西側貨運樓層"],
        ["B1", "B1｜地下器材與秘密修復室樓層"],
      ];
      return `
        <div class="board-overlay" data-overlay-backdrop="1">
          <div class="board-sheet theme-terminal">
            <div class="board-top">
              <div>
                <div class="board-kicker">FOG HARBOR MUSEUM // 3-FLOOR INTERACTIVE MAP</div>
                <div class="board-title">🗺️ 市立霧港美術館三層樓導覽（已解鎖 ${state.unlockedScenes.length} / ${GD.SCENES.length} 區域）</div>
                <div class="board-sub">點擊任一已解鎖房間即可直接切換樓層；未解鎖區域會顯示解鎖所需線索。</div>
              </div>
              <button type="button" class="board-close-btn" data-close-overlay="1">↩️ 返回現場</button>
            </div>
            <div>
              ${floors
                .map(([code, title]) => {
                  const cards = GD.SCENES.filter((s) => s.floor === code)
                    .map((sc) => {
                      const unlocked = state.unlockedScenes.includes(sc.id);
                      const isCur = sc.id === state.currentScene;
                      const status = !unlocked ? "🔒 尚未解鎖" : isCur ? "📍 目前所在" : "👉 點擊前往";
                      return `
                        <button type="button" class="map-room-card ${!unlocked ? "locked" : isCur ? "current" : ""}" data-jump-scene="${sc.id}">
                          <div style="display:flex;justify-content:space-between;align-items:center;font-weight:800;font-size:0.9rem;">
                            <span>${sc.icon} ${esc(sc.name)}</span>
                            <span style="font-size:0.72rem;color:#E8C574;">${status}</span>
                          </div>
                          <div style="font-size:0.76rem;color:#BEB6A7;line-height:1.45;">${esc(unlocked ? sc.description : sc.unlock_hint)}</div>
                        </button>`;
                    })
                    .join("");
                  return `<div class="floor-section"><div class="floor-heading">${title}</div><div class="floor-grid">${cards}</div></div>`;
                })
                .join("")}
            </div>
          </div>
        </div>
      `;
    }

    if (ovId === "BAG") {
      const cards = GD.EVIDENCE.map((item) => {
        const collected = state.viewedEvidence.includes(item.id);
        const scInfo = SCENES_BY_ID[item.scene_id] || GD.SCENES[0];
        if (collected) {
          return `
            <div class="bag-card">
              <div style="font-size:0.75rem;color:#7EE787;font-weight:700;">✅ 已收進卷宗 · ${esc(item.tag)}（${scInfo.icon} ${esc(scInfo.short_name)}）</div>
              <div style="font-size:0.98rem;font-weight:800;color:#F3E3BE;">${item.id}｜${esc(item.title)}</div>
              <div style="font-size:0.81rem;color:#D2C8B7;line-height:1.45;">${esc(item.detail)}</div>
              <button type="button" class="hud-btn" data-open-target="${item.id}" data-target-scene="${scInfo.id}" style="margin-top:auto;align-self:flex-start;">🖐️ 再次檢視近景報告</button>
            </div>`;
        }
        const hint = state.unlockedScenes.includes(scInfo.id)
          ? `線索位於「${scInfo.icon} ${scInfo.short_name}」`
          : `需先解鎖「${scInfo.icon} ${scInfo.short_name}」後前往調查`;
        return `
          <div class="bag-card locked">
            <div style="font-size:0.75rem;color:#DAB76A;font-weight:700;">❓ 尚未發現的核心證物</div>
            <div style="font-size:0.94rem;font-weight:700;color:#9CA3AF;">未知現場線索</div>
            <div style="font-size:0.79rem;color:#8B949E;line-height:1.45;">${esc(hint)}。</div>
          </div>`;
      }).join("");
      return `
        <div class="board-overlay" data-overlay-backdrop="1">
          <div class="board-sheet theme-terminal">
            <div class="board-top">
              <div>
                <div class="board-kicker">DEFENSE ATTORNEY CASE FILE & NOTEBOOK</div>
                <div class="board-title">📓 卷宗／調查筆記（核心證物 ${state.viewedEvidence.length} / ${GD.EVIDENCE.length} · 解鎖區域 ${state.unlockedScenes.length} / ${GD.SCENES.length}）</div>
                <div class="board-sub">你在各個美術館區域解開機關並採集的證物會整理於此，供時間線推理與法庭詰問使用。</div>
              </div>
              <button type="button" class="board-close-btn" data-close-overlay="1">↩️ 返回現場</button>
            </div>
            <div class="bag-grid">${cards}</div>
          </div>
        </div>
      `;
    }

    if (EVIDENCE_BY_ID[ovId]) {
      const item = EVIDENCE_BY_ID[ovId];
      const cfg = GD.CLOSEUP_BOARDS[ovId];
      const collected = state.viewedEvidence.includes(ovId);
      const gadgetHtml = buildEvidenceGadgetHtml(ovId, item.image);
      const leftVisual =
        ovId === "E1" || ovId === "E2" || ovId === "E5"
          ? `<div>${gadgetHtml}<div class="board-photo-cap" style="margin-top:0.45rem;border-radius:8px;">📍 現場位置：${esc(item.scene_spot)}</div></div>`
          : `<div><div class="board-photo-box"><img src="${esc(item.image)}" alt="現場實物特寫" /><div class="board-photo-cap">📍 現場位置：${esc(item.scene_spot)}</div></div>${gadgetHtml}</div>`;

      const isLocked = (ovId === "E1" && !state.e1Unlocked && !collected) || (ovId === "E2" && !state.e2Unlocked && !collected);
      const lockMsg =
        ovId === "E1"
          ? "🔐 請先在左側金屬鍵盤輸入 4 位數時間碼（1842）解鎖終端機"
          : "🎛️ 請先在左側將「ZONE 2F-B」切換至 SCAN ON 並按下掃描還原紀錄";

      const rowsHtml = cfg.rows
        .map(
          (row) => `
          <button type="button" class="board-row" data-row-ev="${ovId}" data-is-clue="${row.is_clue ? "1" : "0"}">
            <div class="board-row-label"><span>${esc(row.label)}</span><span class="row-tag"></span></div>
            <div class="board-row-val">${esc(row.value)}</div>
          </button>`
        )
        .join("");

      return `
        <div class="board-overlay" data-overlay-backdrop="1">
          <div class="board-sheet theme-${cfg.board_theme} ${collected ? "is-collected" : ""}">
            <div class="board-top">
              <div>
                <div class="board-kicker">${esc(cfg.header_kicker)}</div>
                <div class="board-title">${esc(cfg.header_title)}</div>
                <div class="board-sub">${esc(cfg.header_sub)}</div>
              </div>
              <button type="button" class="board-close-btn" data-close-overlay="1">↩️ 返回場景</button>
            </div>
            <div class="board-instruction">${esc(cfg.instruction)}</div>
            <div class="board-body">
              ${leftVisual}
              <div class="board-rows ${ovId === "E1" || ovId === "E2" ? `puzzle-locked-rows ${isLocked ? "is-locked" : ""}` : ""}">
                ${ovId === "E1" || ovId === "E2" ? `<div class="puzzle-lock-veil"><div>${lockMsg}</div></div>` : ""}
                ${rowsHtml}
                ${cfg.unlock_banner ? `<div class="board-unlock-hint">${esc(cfg.unlock_banner)}</div>` : ""}
              </div>
            </div>
            <div class="board-conclusion">
              <strong>🖍️ 採證筆記（已收錄為卷宗證物 ${ovId}｜${esc(item.title)}）：</strong><br/>
              ${esc(item.detail)}
            </div>
            <div class="board-footer">
              <button type="button" class="collect-action-btn" data-collect-target="${ovId}">
                ${collected ? `✅ 已收進卷宗（${ovId} ${esc(item.title)}）` : "📥 標記可疑紀錄並收進卷宗"}
              </button>
              <button type="button" class="board-close-btn" data-close-overlay="1">🔍 繼續探索現場</button>
            </div>
          </div>
        </div>
      `;
    }

    if (ENV_BY_ID[ovId]) {
      const obj = ENV_BY_ID[ovId];
      const scInfo = SCENES_BY_ID[obj.scene_id] || GD.SCENES[0];
      const checked = state.inspectedObjects.includes(ovId);

      let leftBlock = `
        <div class="board-photo-box">
          <img src="${esc(scInfo.image)}" alt="${esc(obj.title)}" />
          <div class="board-photo-cap">📍 所在空間：${scInfo.icon} ${esc(scInfo.name)}</div>
        </div>`;
      let rightBlock = `
        <div class="board-rows">
          <div style="font-size:0.9rem;line-height:1.68;color:#EFE6D5;">${esc(obj.summary)}</div>
          <div class="board-unlock-hint">${esc(obj.unlock_msg)}</div>
        </div>`;

      if (obj.puzzle_type === "spot_diff") {
        const cnt = ["d1", "d2", "d3"].filter((k) => state.diffFound[k]).length;
        const locked = cnt < 3 && !checked;
        leftBlock = `
          <div class="puzzle-panel">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span style="font-size:0.78rem;color:#E8C574;font-weight:800;">🔬 顯微鏡找碴｜點出畫上 3 處仿作破綻</span>
              <span style="font-size:0.74rem;color:#7EE787;font-weight:800;">已找出破綻：${cnt} / 3</span>
            </div>
            <div class="diff-stage ${state.diffHintOn ? "hint-on" : ""}">
              <img src="assets/prologue_2.jpg" alt="R-07 仿作畫布放大檢視" />
              <button type="button" class="diff-hotspot ${state.diffFound.d1 ? "found" : ""}" data-diff-spot="d1" style="left:64%;top:62%;">${state.diffFound.d1 ? "✓" : ""}</button>
              <button type="button" class="diff-hotspot ${state.diffFound.d2 ? "found" : ""}" data-diff-spot="d2" style="left:34%;top:42%;">${state.diffFound.d2 ? "✓" : ""}</button>
              <button type="button" class="diff-hotspot ${state.diffFound.d3 ? "found" : ""}" data-diff-spot="d3" style="left:78%;top:79%;">${state.diffFound.d3 ? "✓" : ""}</button>
            </div>
            <button type="button" class="puzzle-hint-btn" data-action="diff-hint">💡 閃爍顯示 3 處可疑位置</button>
          </div>`;
        rightBlock = `
          <div class="board-rows puzzle-locked-rows ${locked ? "is-locked" : ""}">
            <div class="puzzle-lock-veil"><div>🔬 請先在左側畫布上點出全部 3 處仿作破綻，解開修復室結論！</div></div>
            <div class="diff-checklist">
              <div class="diff-check-item ${state.diffFound.d1 ? "found" : ""}">🔍 破綻 ①：畫布邊角露出修復室編號「R-07」貼條</div>
              <div class="diff-check-item ${state.diffFound.d2 ? "found" : ""}">🔍 破綻 ②：中央海霧缺少清漆下的第六道女子人影</div>
              <div class="diff-check-item ${state.diffFound.d3 ? "found" : ""}">🔍 破綻 ③：外框角落留有快速拆換的細微刮痕</div>
            </div>
            <div class="board-row" style="cursor:default;"><div class="board-row-val">${esc(obj.summary)}</div></div>
            <div class="board-unlock-hint">${esc(obj.unlock_msg)}</div>
          </div>`;
      } else if (obj.puzzle_type === "brass_dial") {
        const locked = !state.brassUnlocked && !checked;
        const curCode = [0, 1, 2].map((i) => WHEEL_SETS[i][state.dialIdx[i]]).join("-");
        const screenCls = state.brassUnlocked ? "unlocked" : state.dialError ? "error" : "";
        const screenText = state.brassUnlocked
          ? "🔓 喀噠！黃銅木匣已開啟（編號 R-07）"
          : state.dialError || `鎖頭刻度：${curCode}`;
        leftBlock = `
          <div class="puzzle-panel brass-theme">
            <div style="font-size:0.78rem;color:#E8C574;font-weight:800;">🔐 三輪黃銅密碼箱｜轉出仿作編號解鎖</div>
            <div class="puzzle-screen ${screenCls}">${esc(screenText)}</div>
            <div class="dial-row">
              ${[0, 1, 2]
                .map(
                  (i) => `
                <div class="dial-col">
                  <button type="button" class="dial-step-btn" data-dial-step="${i},1">▲</button>
                  <div class="dial-val">${WHEEL_SETS[i][state.dialIdx[i]]}</div>
                  <button type="button" class="dial-step-btn" data-dial-step="${i},-1">▼</button>
                </div>`
                )
                .join("")}
            </div>
            <button type="button" class="gadget-toggle-btn" data-action="brass-open">🔓 嘗試開啟黃銅木匣</button>
            <button type="button" class="puzzle-hint-btn" data-toggle-hint="#hint-brass">💡 查看密碼提示</button>
            <div class="puzzle-hint-text" id="hint-brass">提示：林書妍用來調包《海霧港灣》的修復室仿作編號是哪三碼？（答案：R - 0 - 7）</div>
          </div>`;
        rightBlock = `
          <div class="board-rows puzzle-locked-rows ${locked ? "is-locked" : ""}">
            <div class="puzzle-lock-veil"><div>🔐 請先在左側轉盤對齊三碼修復編號（R-0-7）開啟黃銅木匣！</div></div>
            <div style="padding:0.7rem 0.85rem;border-radius:10px;background:rgba(218,183,106,0.12);border:1px solid #8C6D3F;font-size:0.84rem;line-height:1.6;">
              <b>📜 暗匣內藏物品（解鎖後顯現）：</b><br/>
              1. 被紅筆用力圈起的拍賣預展清樣：<b>《海霧港灣》作者：沈景川</b><br/>
              2. 一張老舊手寫地址標籤：<b>「林月琴舊畫室」</b>
            </div>
            <div class="board-row" style="cursor:default;"><div class="board-row-val">${esc(obj.summary)}</div></div>
            <div class="board-unlock-hint">${esc(obj.unlock_msg)}</div>
          </div>`;
      }

      return `
        <div class="board-overlay" data-overlay-backdrop="1">
          <div class="board-sheet theme-env ${checked ? "is-collected" : ""}">
            <div class="board-top">
              <div>
                <div class="board-kicker">${esc(obj.kicker)}</div>
                <div class="board-title">${obj.object_icon} ${esc(obj.title)}</div>
                <div class="board-sub">${esc(obj.sub)}</div>
              </div>
              <button type="button" class="board-close-btn" data-close-overlay="1">↩️ 返回場景</button>
            </div>
            <div class="board-body">${leftBlock}${rightBlock}</div>
            <div class="board-conclusion"><strong>📝 已記錄現場觀察：</strong>${esc(obj.unlock_msg)}</div>
            <div class="board-footer">
              <button type="button" class="collect-action-btn" data-collect-target="${ovId}">
                ${checked ? "✅ 已寫入調查筆記" : "📝 記錄這項現場線索"}
              </button>
              <button type="button" class="board-close-btn" data-close-overlay="1">🔍 繼續在現場調查</button>
            </div>
          </div>
        </div>
      `;
    }
    return "";
  }

  function renderStage1() {
    const curSc = SCENES_BY_ID[state.currentScene] || GD.SCENES[0];
    const tabsHtml = GD.SCENES.map((sc) => {
      const unlocked = state.unlockedScenes.includes(sc.id);
      const scEvs = GD.EVIDENCE.filter((e) => e.scene_id === sc.id);
      const scObjs = GD.ENV_OBJECTS.filter((o) => o.scene_id === sc.id);
      const doneEv = scEvs.filter((e) => state.viewedEvidence.includes(e.id)).length;
      const doneObj = scObjs.filter((o) => state.inspectedObjects.includes(o.id)).length;
      const badge = !unlocked
        ? `<span class="tab-badge">🔒</span>`
        : scEvs.length > 0
        ? `<span class="tab-badge ${doneEv === scEvs.length ? "done" : ""}">證物 ${doneEv}/${scEvs.length}</span>`
        : `<span class="tab-badge ${doneObj === scObjs.length ? "done" : ""}">線索 ${doneObj}/${scObjs.length}</span>`;
      return `
        <button type="button" class="scene-tab-btn ${!unlocked ? "locked" : sc.id === state.currentScene ? "active" : ""}" data-jump-scene="${sc.id}">
          <span>${sc.icon} ${esc(sc.short_name)}</span>${badge}
        </button>`;
    }).join("");

    const roomEvSpots = GD.EVIDENCE.filter((e) => e.scene_id === curSc.id)
      .map((item) => {
        const visited = state.viewedEvidence.includes(item.id);
        const cfg = GD.CLOSEUP_BOARDS[item.id];
        const tip = visited ? `✓ 已採證：${item.title}（點擊再次檢視）` : cfg.hover_prompt;
        return `
          <button type="button" class="scene-spot ${visited ? "visited" : "unvisited"}" data-open-target="${item.id}" style="left:${item.hotspot_x}%;top:${item.hotspot_y}%;">
            <span class="spot-hover-tip">${esc(tip)}</span>
            <div class="spot-pin"><span>${item.object_icon}</span><span class="spot-glint">${visited ? "✓" : "✦"}</span></div>
          </button>`;
      })
      .join("");

    const roomObjSpots = GD.ENV_OBJECTS.filter((o) => o.scene_id === curSc.id)
      .map((obj) => {
        const checked = state.inspectedObjects.includes(obj.id);
        const isPuzzle = Boolean(obj.puzzle_type);
        const tip = checked ? `✓ 已完成：${obj.title}` : obj.hover_prompt;
        return `
          <button type="button" class="scene-spot ${isPuzzle ? "" : "env-spot"} ${checked ? "visited" : "unvisited"}" data-open-target="${obj.id}" style="left:${obj.hotspot_x}%;top:${obj.hotspot_y}%;">
            <span class="spot-hover-tip">${esc(tip)}</span>
            <div class="spot-pin"><span>${obj.object_icon}</span><span class="spot-glint">${checked ? "✓" : isPuzzle ? "🧩" : "?"}</span></div>
          </button>`;
      })
      .join("");

    let tabContent = "";
    if (state.activeInfoTab === "bag") {
      if (!state.viewedEvidence.length) {
        tabContent = `<div class="alert alert-info">🕵️ <b>卷宗目前是空的</b>：請先在上方 <b>🏛️ 2F B 展廳</b> 點擊中央畫框（操作側光與紫外線燈）或讀卡機，就能收進卷宗並逐步解鎖其餘 5 個空間！</div>`;
      } else {
        const cards = GD.EVIDENCE.filter((e) => state.viewedEvidence.includes(e.id))
          .map(
            (item) => `
            <div class="card">
              <img class="ev-card-img" src="${esc(item.image)}" alt="${esc(item.title)}" loading="lazy" />
              <div style="margin-bottom:0.4rem;">
                <span class="pill-done">✅ 已親自採證收錄</span>
                <span class="pill-tag">${esc(item.tag)}</span>
              </div>
              <h3 style="margin:0.2rem 0 0.3rem;">${item.id}｜${esc(item.title)}</h3>
              <div style="font-size:0.8rem;color:#b5ac9c;margin-bottom:0.5rem;">📍 ${esc(item.scene_spot)}　｜　🕒 ${esc(item.time_hint)}</div>
              <p style="margin:0;font-size:0.9rem;line-height:1.6;">${esc(item.detail)}</p>
            </div>`
          )
          .join("");
        const rem = GD.EVIDENCE.length - state.viewedEvidence.length;
        tabContent = `
          <div class="grid-2">${cards}</div>
          <div style="margin-top:0.8rem;">
            ${
              rem > 0
                ? `<div class="alert alert-info">🔎 館內六個區域還有 <b>${rem} 項尚未發現的核心證物</b>，切換上方場景或打開「🗺️ 館內地圖」繼續探索吧！</div>`
                : `<div class="alert alert-ok">🎯 5 項核心證物已全數收進卷宗！可前往「② 詢問證人」或「③ 時間線推理」。</div>`
            }
          </div>`;
      }
    } else if (state.activeInfoTab === "timeline") {
      const nodes = GD.CASE_TIMELINE.map((node) => {
        const ok = !node.evidence || state.viewedEvidence.includes(node.evidence);
        return ok
          ? `<div class="timeline-item"><div class="timeline-time">${esc(node.time)}</div><div class="timeline-event">${esc(node.event)}</div><div class="timeline-detail">${esc(node.detail)}</div></div>`
          : `<div class="timeline-item locked"><div class="timeline-time">？？：？？</div><div class="timeline-event">尚未查證的時段</div><div class="timeline-detail">在現場找到並採集對應證物後自動解鎖</div></div>`;
      }).join("");
      tabContent = `
        <div class="grid-2">
          <div class="card">
            <h3 style="margin-top:0;">🏛️ 案件背景</h3>
            <p style="line-height:1.7;font-size:0.92rem;">${esc(GD.CASE_BACKGROUND)}</p>
            <div class="alert alert-warn">🕯️ <b>霧港館怪談</b>：每逢閉館熄燈，工作人員都說畫框玻璃裡會多出一個人影。王冠宇的筆記比今晚早了三天；那究竟是鬼影、倒影，還是有人留下的暗號？</div>
            <div class="alert alert-info" style="margin-bottom:0;">
              🗺️ <b>館內三層樓 6 大探索區域</b>：<br/>
              • <b>🏛️ 2F B 展廳</b>：主牆畫框（側光角度＋紫外線顯影）<br/>
              • <b>🕯️ 2F 策展人辦公室</b>：拍賣清冊與三輪黃銅密碼箱（R-0-7）<br/>
              • <b>🛡️ 1F 保全中控區</b>：門禁密碼鎖（1842）與警報分區開關<br/>
              • <b>📦 1F 西側裝卸區</b>：可滑動掀開複寫聯的出庫單<br/>
              • <b>🧹 B1 地下器材室</b>：清潔推車與雙頁勤務簿速寫<br/>
              • <b>🎨 B1 修復室 R-07</b>：仿作畫架顯微鏡找碴與底片燈箱
            </div>
          </div>
          <div class="card">
            <h3 style="margin-top:0;">⏱️ 案發當晚時間軸（隨現場採證自動解鎖）</h3>
            ${nodes}
          </div>
        </div>`;
    } else {
      tabContent = `
        <div class="grid-3">
          ${Object.entries(GD.WITNESSES)
            .map(
              ([wId, w]) => `
            <div class="card">
              <img class="witness-avatar-img" src="${esc(w.image)}" alt="${esc(w.name)}" loading="lazy" />
              <div style="font-size:1.15rem;font-weight:800;color:#e6c882;">${esc(w.name)}</div>
              <div style="font-size:0.8rem;color:#b5ac9c;margin:0.2rem 0 0.65rem;">🎯 ${esc(w.role)} ｜ 📍 ${esc(w.location)}</div>
              <div class="alert alert-info" style="font-size:0.86rem;">🗣️ <b>公開證詞</b>：「${esc(w.statement)}」</div>
              <button class="btn btn-block" data-ask-witness="${wId}">💬 詢問 ${esc(w.name)}</button>
            </div>`
            )
            .join("")}
        </div>`;
    }

    return `
      <div class="scene-wrapper ${state.radarOn ? "radar-on" : ""} ${state.fullscreen ? "is-fullscreen" : ""}">
        <div class="scene-topbar">
          <div class="scene-topbar-title">
            <span>🕵️ 市立霧港美術館 · 6 區域互動搜查</span>
            <span class="hud-pill">🗺️ 區域：${state.unlockedScenes.length} / ${GD.SCENES.length}</span>
            <span class="hud-pill">🗂️ 證物：${state.viewedEvidence.length} / ${GD.EVIDENCE.length}</span>
          </div>
          <div class="scene-actions">
            ${
              state.viewedEvidence.length === GD.EVIDENCE.length
                ? `<button type="button" class="hud-btn primary" data-nav-page="詢問證人">⚖️ 證物齊全！前往詢問 ➔</button>`
                : ""
            }
            <button type="button" class="hud-btn" data-open-target="MAP">🗺️ 館內地圖</button>
            <button type="button" class="hud-btn" data-open-target="BAG">📓 卷宗 (${state.viewedEvidence.length}/${GD.EVIDENCE.length})</button>
            <button type="button" class="hud-btn ${state.radarOn ? "active-toggle" : ""}" data-toggle-radar="1">💡 提示光圈</button>
            <button type="button" class="hud-btn primary ${state.fullscreen ? "active-toggle" : ""}" data-toggle-fs="1">${state.fullscreen ? "🖥️ 退出全螢幕" : "🖥️ 全螢幕"}</button>
          </div>
        </div>
        <div class="scene-tabs-bar">
          ${tabsHtml}
          <span class="scene-room-desc">${esc(curSc.description)}</span>
        </div>
        <div class="scene-canvas">
          <div class="scene-toast"></div>
          <div class="scene-stage">
            <img class="scene-bg" src="${esc(curSc.image)}" alt="${esc(curSc.name)}" />
            <div class="scene-flashlight"></div>
            ${roomEvSpots}
            ${roomObjSpots}
            <div class="scene-bottom-hint">${curSc.icon} <b>${esc(curSc.name)}</b>｜點擊發光熱區解開互動機關或採證；右上角可開「🗺️ 館內地圖」</div>
          </div>
        </div>
      </div>

      <div class="sub-tabs">
        <button class="btn btn-sm ${state.activeInfoTab === "bag" ? "btn-primary" : ""}" data-info-tab="bag">🗂️ 已收進卷宗的證物（${state.viewedEvidence.length}/${GD.EVIDENCE.length}）</button>
        <button class="btn btn-sm ${state.activeInfoTab === "timeline" ? "btn-primary" : ""}" data-info-tab="timeline">⏱️ 案件背景與當晚時間軸</button>
        <button class="btn btn-sm ${state.activeInfoTab === "witnesses" ? "btn-primary" : ""}" data-info-tab="witnesses">👥 三位關鍵證人與公開證詞</button>
      </div>
      ${tabContent}
    `;
  }

  /* ==================== RENDER: STAGE 2 WITNESS ==================== */
  function renderStage2() {
    const wId = state.activeWitness;
    const w = GD.WITNESSES[wId];
    const history = state.chatHistory[wId] || [];
    let lockedQ = 0;
    const quickButtons = w.sample_questions
      .map(([q, reqEv], i) => {
        if (reqEv && !state.viewedEvidence.includes(reqEv)) {
          lockedQ += 1;
          return "";
        }
        return `<button class="btn btn-block" style="justify-content:flex-start;text-align:left;margin-bottom:0.45rem;" data-quick-q="${i}">${esc(q)}</button>`;
      })
      .join("");

    const chatHtml = history.length
      ? history
          .map((m) => {
            const isUser = m.role === "user";
            const av = isUser
              ? `<div class="chat-avatar">🧑‍⚖️</div>`
              : `<img class="chat-avatar" src="${esc(w.image)}" alt="${esc(w.name)}" />`;
            return `<div class="chat-bubble ${isUser ? "user" : "assistant"}">${av}<div class="chat-text">${esc(m.text)}</div></div>`;
          })
          .join("") +
        (state.aiBusy
          ? `<div class="chat-bubble assistant"><img class="chat-avatar" src="${esc(w.image)}" alt="" /><div class="chat-text" style="opacity:0.7;">⏳ ${esc(w.name)} 思考中…</div></div>`
          : "")
      : `<div style="color:#9ca3af;font-size:0.86rem;">尚未開始詢問 ${esc(w.name)}。請點選上方快捷問題，或在下方輸入你的提問。</div>`;

    return `
      <div class="grid-3" style="margin-bottom:0.85rem;">
        ${Object.entries(GD.WITNESSES)
          .map(
            ([id, data]) =>
              `<button class="btn ${id === wId ? "btn-primary" : ""}" data-select-witness="${id}">${esc(data.name)}（${esc(data.role)}）</button>`
          )
          .join("")}
      </div>
      <div class="grid-witness">
        <div class="card">
          <img class="witness-avatar-img" src="${esc(w.image)}" alt="${esc(w.name)}" />
          <div style="font-size:1.2rem;font-weight:800;color:#e6c882;">${esc(w.name)}</div>
          <div style="font-size:0.82rem;color:#b5ac9c;margin:0.2rem 0 0.6rem;">${esc(w.role)} ｜ 📍 ${esc(w.location)}</div>
          <p style="font-size:0.88rem;line-height:1.55;"><b>性格特徵</b>：${esc(w.personality)}</p>
          <div class="alert alert-info" style="margin-bottom:0;">🗣️ <b>公開證詞</b>：<br/>「${esc(w.statement)}」</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:0.85rem;">
          <div class="card">
            <h4 style="margin:0 0 0.6rem;">⚡ 快捷追問（固定回覆，不消耗 AI 額度）</h4>
            ${quickButtons}
            ${lockedQ ? `<div style="font-size:0.8rem;color:#b5ac9c;">🔒 還有 ${lockedQ} 個追問，在現場採集相關證物後自動解鎖。</div>` : ""}
          </div>
          <div class="card">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.55rem;flex-wrap:wrap;gap:0.4rem;">
              <h4 style="margin:0;">📝 詢問紀錄</h4>
              <span class="hud-pill">${
                state.apiEnabled
                  ? `🤖 Gemini 自由提問：${state.aiCalls} / ${GD.MAX_AI_CALLS_PER_SESSION}`
                  : "💡 固定備援台詞模式（免 API Key 可破關）"
              }</span>
            </div>
            <div class="chat-log">${chatHtml}</div>
            <form class="chat-form" id="witnessForm">
              <input class="text-input" id="witnessInput" maxlength="240" placeholder="向 ${esc(w.name)} 提問，例如：閉館後你去了哪裡？" ${state.aiBusy ? "disabled" : ""} />
              <button class="btn btn-primary" type="submit" style="white-space:nowrap;" ${state.aiBusy ? "disabled" : ""}>📨 送出</button>
            </form>
            <div style="font-size:0.75rem;color:#9ca3af;margin-top:0.45rem;">🔒 只有自由輸入的問題會傳送至 Google API；請勿輸入真實姓名或個人資料。</div>
          </div>
        </div>
      </div>
    `;
  }

  /* ==================== RENDER: STAGE 3 TIMELINE ==================== */
  function renderStage3() {
    const tp = GD.TIMELINE_PUZZLE;
    const nodes = tp.slots
      .map(
        (slot) => `
        <div class="track-node ${state.timelineSolved ? "solved" : ""}">
          <div class="track-node-time">🕒 ${slot.time}</div>
          <div class="track-node-label">${state.timelineSolved ? `✅ ${esc(tp.events[slot.correct])}` : "⏳ 待配對關鍵事件卡"}</div>
        </div>`
      )
      .join("");

    const boardHeader = `
      <div class="deduction-board">
        <div style="color:#dab76a;font-size:0.74rem;font-weight:800;letter-spacing:0.14em;">FORENSIC DEDUCTION BOARD · STAGE 03</div>
        <div style="color:#f8f2e8;font-size:1.22rem;font-weight:800;margin:0.2rem 0 0.45rem;">🧩 案情推理白板：重建名畫失竊的關鍵 15 分鐘</div>
        <div style="color:#c9bfa9;font-size:0.9rem;line-height:1.55;">把四張關鍵紀錄放回正確時間點，再區分 <b>E4 出庫單</b> 與 <b>E3 勤務簿</b>「能直接證明的事」與「過度推論」。答錯可不限次重試，提示不計入法庭錯誤次數。</div>
        <div class="timeline-track">${nodes}</div>
      </div>`;

    if (state.viewedEvidence.length < GD.EVIDENCE.length) {
      return `
        ${boardHeader}
        <div class="alert alert-warn">先回到美術館六個區域，蒐集齊全五項核心證物後才能開始排時間線（目前 ${state.viewedEvidence.length} / ${GD.EVIDENCE.length}）。</div>
        <button class="btn btn-primary btn-block" data-nav-page="案件卷宗">🔎 回到現場繼續搜查</button>
      `;
    }

    const fb = state.timelineFeedback;
    let fbHtml = "";
    if (fb) {
      if (fb.wrongTimes.length) {
        fbHtml += `<div class="alert alert-warn">還有時間點沒有配對正確：${fb.wrongTimes.join("、")}。重新核對 E1、E2、E4 的時間再試一次。</div>`;
      } else if (state.timelineSolved) {
        fbHtml += `<div class="alert alert-ok">✅ 時間線成立：18:42 的進入紀錄落在警報旁路期間，恆溫箱則在旁路結束後離館。</div>`;
      }
      if (fb.e4Correct) {
        fbHtml += `<div class="alert alert-ok">✅ E4 判讀正確：出庫與簽核有紀錄，複寫聯指向舊畫室，但箱內物品欄沒有填寫。</div>`;
      } else if (fb.e4Checked) {
        fbHtml += `<div class="alert alert-err">❌ E4 的答案還不正確。留意出庫單正本上有沒有寫明箱內物品。</div>`;
      }
      if (fb.e3Correct) {
        fbHtml += `<div class="alert alert-ok">✅ E3 判讀正確：簽到和簽退是兩個時間點，不代表中間每分鐘都有人確認位置。</div>`;
      } else if (fb.e3Checked) {
        fbHtml += `<div class="alert alert-err">❌ E3 的答案還不正確。把「有簽到、簽退紀錄」和「全程都在同一地點」分開判斷。</div>`;
      }
    }

    const allDone = state.timelineSolved && state.e4ScopeSolved && state.e3ScopeSolved;
    const hintLvl = Math.max(
      state.hintLevel,
      Math.min(state.timelineAttempts, 3),
      Math.min(state.e4ScopeAttempts, 3),
      Math.min(state.e3ScopeAttempts, 3)
    );

    return `
      ${boardHeader}
      <form id="timelineForm" class="card" style="display:flex;flex-direction:column;gap:1rem;">
        <h3 style="margin:0;">🗂️ 證據桌｜把事件卡放回時間點</h3>
        <div class="grid-2">
          ${tp.slots
            .map(
              (slot) => `
            <div>
              <label class="field-label">${slot.time} 發生什麼事？</label>
              <select class="select-input" data-slot-time="${slot.time}" ${state.timelineSolved ? "disabled" : ""}>
                <option value="">選擇一張事件卡…</option>
                ${Object.entries(tp.events)
                  .map(
                    ([k, label]) =>
                      `<option value="${k}" ${state.timelineSlots[slot.time] === k ? "selected" : ""}>${esc(label)}</option>`
                  )
                  .join("")}
              </select>
            </div>`
            )
            .join("")}
        </div>

        <hr style="border:none;border-top:1px solid #353028;margin:0.2rem 0;" />
        <h3 style="margin:0;">🔍 證據範圍｜哪一項是紀錄直接說明的事？</h3>
        <div>
          <div class="field-label">${esc(tp.scope_questions.e4.question)} ${state.e4ScopeSolved ? "✅" : ""}</div>
          <div class="radio-group">
            ${tp.scope_questions.e4.options
              .map(
                (opt, i) => `
              <label class="radio-option">
                <input type="radio" name="scope_e4" value="${i}" ${state.scopeE4Choice === i ? "checked" : ""} ${state.e4ScopeSolved ? "disabled" : ""} />
                <span>${esc(opt)}</span>
              </label>`
              )
              .join("")}
          </div>
        </div>
        <div>
          <div class="field-label">${esc(tp.scope_questions.e3.question)} ${state.e3ScopeSolved ? "✅" : ""}</div>
          <div class="radio-group">
            ${tp.scope_questions.e3.options
              .map(
                (opt, i) => `
              <label class="radio-option">
                <input type="radio" name="scope_e3" value="${i}" ${state.scopeE3Choice === i ? "checked" : ""} ${state.e3ScopeSolved ? "disabled" : ""} />
                <span>${esc(opt)}</span>
              </label>`
              )
              .join("")}
          </div>
        </div>
        <button type="submit" class="btn btn-primary btn-block">🧠 核對我的推理</button>
      </form>

      <div style="margin-top:0.9rem;">
        ${fbHtml}
        ${
          !allDone
            ? `<button class="btn" data-timeline-hint="1" style="margin-bottom:0.65rem;">🔦 顯示下一個提示（${hintLvl}/3）</button>`
            : ""
        }
        ${hintLvl && !allDone ? `<div class="alert alert-info">💡 提示 ${hintLvl}／3：${esc(tp.hints[hintLvl - 1])}</div>` : ""}
        ${
          allDone
            ? `<div class="alert alert-ok">🎯 推理關卡完成！你已把時間線排好，也區分了直接紀錄與推論。</div>
               <button class="btn btn-primary btn-block" data-nav-page="證據攻防">⚖️ 前往法庭提出矛盾 ➔</button>`
            : ""
        }
      </div>
    `;
  }

  /* ==================== RENDER: STAGE 4 COURTROOM ==================== */
  function renderStage4() {
    const clueMeta = [
      ["curator_access", "矛盾一", "有人對自己閉館後的行蹤說了謊"],
      ["alarm_bypass", "矛盾二", "有人對館內保全系統的說法與紀錄不符"],
    ];
    const cluesHtml = clueMeta
      .map(([id, title, hint]) => {
        const ok = state.foundClues.includes(id);
        return ok
          ? `<div class="alert alert-ok" style="margin-bottom:0;">✅ <b>${title}</b><br/>已成功揭穿！</div>`
          : `<div class="alert alert-warn" style="margin-bottom:0;">🔒 <b>${title}</b><br/>提示：${hint}</div>`;
      })
      .join("");

    const selectedStmt = state.courtStatement ? GD.STATEMENTS[state.courtStatement] : null;
    const selectedEv = state.courtEvidence ? EVIDENCE_BY_ID[state.courtEvidence] : null;
    const ready = Boolean(selectedStmt && selectedEv);

    const res = state.lastCourtResult;
    const resHtml = res
      ? res.success
        ? `<div class="alert alert-ok" style="margin-top:0.85rem;"><b>🎯 異議成立！${esc(res.summary)}</b><br/><br/>🗣️ <b>證人反應</b>：${esc(res.text)}</div>`
        : `<div class="alert alert-err" style="margin-top:0.85rem;"><b>❌ 異議駁回！</b><br/>${esc(res.text)}（目前提示等級：${state.wrongChallenges} / ${GD.MAX_COURT_HINT_LEVEL}）</div>`
      : "";

    const allClues = state.foundClues.length === GD.REQUIRED_CLUES.length;
    const timelineDone = state.timelineSolved && state.e4ScopeSolved && state.e3ScopeSolved;

    return `
      <div class="grid-2" style="margin-bottom:0.9rem;">
        <div class="card" style="padding:0.65rem;">
          <img src="${esc(GD.SCENE_IMAGES.courtroom)}" alt="法庭現場" style="width:100%;height:245px;object-fit:cover;border-radius:10px;display:block;" />
          <div style="font-size:0.78rem;color:#b5ac9c;margin-top:0.45rem;text-align:center;">法庭交互詰問與證物對決現場</div>
        </div>
        <div class="card" style="display:flex;flex-direction:column;justify-content:space-between;gap:0.75rem;">
          <div>
            <h2 style="margin:0 0 0.45rem;">⚡ 法庭證據攻防：揭穿證詞矛盾</h2>
            <p style="margin:0;color:#d2c8b7;line-height:1.65;font-size:0.92rem;">在法庭上，單靠懷疑無法定罪。請從左側選出一句<b>與事實不符的證人證詞</b>，並從右側出示<b>能直接打臉該證詞的關鍵證物</b>！</p>
          </div>
          <div class="grid-2">${cluesHtml}</div>
        </div>
      </div>

      ${
        !state.viewedEvidence.length
          ? `<div class="alert alert-warn">⚠️ 你還沒有將任何證物收進卷宗！請先到「① 現場搜查」採證。</div>
             <button class="btn btn-primary" data-nav-page="案件卷宗">👉 前往現場蒐集證物</button>`
          : `
        <div class="grid-2" style="margin-bottom:0.85rem;">
          <div class="card">
            <label class="field-label">🗣️ 1. 選擇要質疑的證詞</label>
            <select class="select-input" id="courtStmtSelect">
              <option value="">請選擇一段證詞…</option>
              ${Object.entries(GD.STATEMENTS)
                .map(
                  ([k, s]) =>
                    `<option value="${k}" ${state.courtStatement === k ? "selected" : ""}>${esc(s.witness_name)}：「${esc(s.text)}」</option>`
                )
                .join("")}
            </select>
            ${
              selectedStmt
                ? `<div class="alert alert-info" style="margin-top:0.75rem;margin-bottom:0;"><b>${esc(selectedStmt.witness_name)}</b>：「${esc(selectedStmt.text)}」</div>`
                : ""
            }
          </div>
          <div class="card">
            <label class="field-label">🗂️ 2. 選擇要出示的證物</label>
            <select class="select-input" id="courtEvSelect">
              <option value="">請選擇一項證物…</option>
              ${state.viewedEvidence
                .map((id) => {
                  const ev = EVIDENCE_BY_ID[id];
                  return `<option value="${id}" ${state.courtEvidence === id ? "selected" : ""}>${id}｜${esc(ev.title)}</option>`;
                })
                .join("")}
            </select>
            ${
              selectedEv
                ? `<div class="alert alert-warn" style="margin-top:0.75rem;margin-bottom:0;"><b>${selectedEv.id}｜${esc(selectedEv.title)}</b><br/><span style="font-size:0.82rem;">${esc(selectedEv.detail)}</span></div>`
                : ""
            }
          </div>
        </div>
        <button class="btn btn-primary btn-block" id="objectionBtn" ${ready ? "" : "disabled"}>
          ${ready ? "⚖️ 提出異議！" : "⚖️ 請先選擇證詞與證物"}
        </button>
        ${resHtml}
        ${
          allClues
            ? timelineDone
              ? `<div class="alert alert-info" style="margin-top:0.85rem;">🎉 兩項矛盾已成立，時間線與證據範圍也已推理完成，可以進入最後結案！</div>
                 <button class="btn btn-primary btn-block" data-nav-page="最後推理">👉 前往最後推理（法庭結案）</button>`
              : `<div class="alert alert-info" style="margin-top:0.85rem;">矛盾已成立！完成時間線與證據範圍推理後，就能進入最後結案。</div>
                 <button class="btn btn-primary btn-block" data-nav-page="時間線推理">🧩 前往時間線推理</button>`
            : ""
        }`
      }
    `;
  }

  /* ==================== RENDER: STAGE 5 VERDICT ==================== */
  function renderStage5() {
    const evOk = state.viewedEvidence.length === GD.EVIDENCE.length;
    const tlOk = state.timelineSolved && state.e4ScopeSolved && state.e3ScopeSolved;
    const clueOk = state.foundClues.length === GD.REQUIRED_CLUES.length;
    const canSubmit = evOk && tlOk && clueOk;

    return `
      <div class="card" style="margin-bottom:0.9rem;">
        <h2 style="margin:0 0 0.4rem;">🏛️ 最後推理：向法官提出結案陳詞</h2>
        <p style="margin:0 0 0.85rem;color:#d2c8b7;line-height:1.6;">誰在拍賣前移走原畫？林書妍的進出紀錄、警報旁路、勤務簿怪談和紫外線底片各說明了什麼？請把線索串在一起，也別把空白出庫單當成箱內物品的直接證明。</p>
        <div class="grid-3">
          <div class="alert ${evOk ? "alert-ok" : "alert-warn"}" style="margin:0;">${evOk ? "✅" : "⚠️"} <b>證物蒐集</b>：${state.viewedEvidence.length} / ${GD.EVIDENCE.length}</div>
          <div class="alert ${tlOk ? "alert-ok" : "alert-warn"}" style="margin:0;">${tlOk ? "✅" : "⚠️"} <b>時間線與證據範圍</b>：${tlOk ? "已完成" : "尚待完成"}</div>
          <div class="alert ${clueOk ? "alert-ok" : "alert-warn"}" style="margin:0;">${clueOk ? "✅" : "⚠️"} <b>法庭關鍵矛盾</b>：${state.foundClues.length} / ${GD.REQUIRED_CLUES.length}</div>
        </div>
      </div>

      <div class="grid-3" style="margin-bottom:0.9rem;">
        ${Object.entries(GD.WITNESSES)
          .map(
            ([id, w]) => `
          <div class="card">
            <img class="witness-avatar-img" src="${esc(w.image)}" alt="${esc(w.name)}" loading="lazy" />
            <div style="font-size:1.1rem;font-weight:800;color:#e6c882;">${esc(w.name)}</div>
            <div style="font-size:0.8rem;color:#b5ac9c;">${esc(w.role)} ｜ ${esc(w.location)}</div>
          </div>`
          )
          .join("")}
      </div>

      <form id="verdictForm" class="card" style="display:flex;flex-direction:column;gap:0.95rem;">
        <div>
          <div class="field-label">👉 1. 誰在閉館後移走了《${esc(GD.ARTWORK_NAME)}》原作？</div>
          <div class="radio-group">
            ${Object.entries(GD.WITNESSES)
              .map(
                ([id, w]) => `
              <label class="radio-option">
                <input type="radio" name="final_suspect" value="${id}" ${state.finalSuspect === id ? "checked" : ""} />
                <span>${esc(w.name)}｜${esc(w.role)}</span>
              </label>`
              )
              .join("")}
          </div>
        </div>
        <div>
          <div class="field-label">👉 2. 哪條證據鏈能說明她為什麼移走原畫？</div>
          <div class="radio-group">
            ${Object.entries(GD.FINAL_REASONS)
              .map(
                ([id, text]) => `
              <label class="radio-option">
                <input type="radio" name="final_reason" value="${id}" ${state.finalReason === id ? "checked" : ""} />
                <span>${esc(text)}</span>
              </label>`
              )
              .join("")}
          </div>
        </div>
        ${state.verdictWarning ? `<div class="alert alert-warn" style="margin:0;">${esc(state.verdictWarning)}</div>` : ""}
        <button type="submit" class="btn btn-primary btn-block" ${canSubmit ? "" : "disabled"}>⚖️ 請法官做出最終裁決！</button>
      </form>
    `;
  }

  function renderEnding() {
    const end = state.ending;
    return `
      <div class="ending-box">
        <div>
          <img src="${esc(GD.SCENE_IMAGES.courtroom)}" alt="市立霧港地方法院" />
          <div style="font-size:0.8rem;color:#b5ac9c;text-align:center;margin-top:0.4rem;">市立霧港地方法院 · 最終裁決現場</div>
        </div>
        <div class="card">
          <div class="alert ${end.success ? "alert-ok" : "alert-err"}" style="white-space:pre-line;">
            <h2 style="margin:0 0 0.6rem;">${end.success ? "🎉" : "💥"} ${esc(end.title)}</h2>
            ${esc(end.body)}
          </div>
          <button class="btn btn-primary btn-block" data-reset-game="1">🔄 再玩一局（重看序章）</button>
        </div>
      </div>
    `;
  }

  /* ==================== MAIN RENDER & EVENTS ==================== */
  function render() {
    const root = document.getElementById("app");
    if (!state.introCompleted) {
      root.innerHTML = renderPrologue();
      bindEvents();
      return;
    }

    const stepLabels = [
      `① 現場 ${state.viewedEvidence.length}/${GD.EVIDENCE.length}`,
      "② 詢問",
      `③ 時間線 ${state.timelineSolved && state.e4ScopeSolved && state.e3ScopeSolved ? "✅" : "🧩"}`,
      `④ 法庭 ${state.foundClues.length}/${GD.REQUIRED_CLUES.length}`,
      "⑤ 結案",
    ];

    let bodyHtml = "";
    if (state.ending) {
      bodyHtml = renderEnding();
    } else if (state.activePage === "案件卷宗") {
      bodyHtml = renderStage1();
    } else if (state.activePage === "詢問證人") {
      bodyHtml = renderStage2();
    } else if (state.activePage === "時間線推理") {
      bodyHtml = renderStage3();
    } else if (state.activePage === "證據攻防") {
      bodyHtml = renderStage4();
    } else {
      bodyHtml = renderStage5();
    }

    root.innerHTML = `
      <div class="app-shell">
        <section class="hero">
          <div>
            <div class="hero-kicker">CASE FILE 01 · INTERACTIVE COURTROOM MYSTERY</div>
            <h1>⚖️ AI 逆轉法庭：證詞的破綻 —《${esc(GD.CASE_TITLE)}》</h1>
          </div>
          <div class="badge-row">
            <span class="case-badge">🖼️ 失竊畫作：《${esc(GD.ARTWORK_NAME)}》</span>
            <span class="case-badge">🗺️ 已解鎖區域：${state.unlockedScenes.length} / ${GD.SCENES.length}</span>
            <span class="case-badge">🧑‍🔧 委託人：王冠宇</span>
            <button class="btn btn-sm" data-reset-game="1">🔄 重玩／重看序章</button>
          </div>
        </section>

        <nav class="top-nav">
          ${PAGES.map(
            (pg, i) =>
              `<button class="btn ${state.activePage === pg ? "btn-primary" : ""}" data-nav-page="${pg}">${stepLabels[i]}</button>`
          ).join("")}
        </nav>

        <div class="guide-banner">${PAGE_GUIDES[state.activePage]}</div>
        ${bodyHtml}
        ${renderOverlay()}
      </div>
    `;
    bindEvents();
  }

  function bindEvents() {
    // Prologue controls
    document.querySelectorAll("[data-prologue-jump]").forEach((b) => {
      b.onclick = () => {
        state.introPanelIndex = Number(b.getAttribute("data-prologue-jump"));
        saveState();
        render();
      };
    });
    const prevBtn = document.querySelector("[data-prologue-prev]");
    if (prevBtn) prevBtn.onclick = () => { state.introPanelIndex = Math.max(0, state.introPanelIndex - 1); saveState(); render(); };
    const nextBtn = document.querySelector("[data-prologue-next]");
    if (nextBtn) nextBtn.onclick = () => { state.introPanelIndex += 1; saveState(); render(); };
    document.querySelectorAll("[data-prologue-skip], [data-prologue-start]").forEach((b) => {
      b.onclick = () => { state.introCompleted = true; saveState(); render(); };
    });

    // Global nav & reset
    document.querySelectorAll("[data-reset-game]").forEach((b) => {
      b.onclick = () => resetGame(true);
    });
    document.querySelectorAll("[data-nav-page]").forEach((b) => {
      b.onclick = () => {
        state.activePage = b.getAttribute("data-nav-page");
        state.fullscreen = false;
        state.activeOverlay = null;
        saveState();
        render();
      };
    });

    // Stage 1 Explorer
    const canvas = document.querySelector(".scene-canvas");
    if (canvas) {
      canvas.onmousemove = (e) => {
        const rect = canvas.getBoundingClientRect();
        canvas.style.setProperty("--mx", `${(((e.clientX - rect.left) / rect.width) * 100).toFixed(1)}%`);
        canvas.style.setProperty("--my", `${(((e.clientY - rect.top) / rect.height) * 100).toFixed(1)}%`);
      };
    }

    document.querySelectorAll("[data-jump-scene]").forEach((btn) => {
      btn.onclick = () => {
        const scId = btn.getAttribute("data-jump-scene");
        if (!state.unlockedScenes.includes(scId)) {
          showToast(SCENES_BY_ID[scId]?.unlock_hint || "🔒 尚未解鎖此區域");
          return;
        }
        state.currentScene = scId;
        state.activeOverlay = null;
        saveState();
        render();
      };
    });

    document.querySelectorAll("[data-open-target]").forEach((btn) => {
      btn.onclick = () => {
        const sc = btn.getAttribute("data-target-scene");
        if (sc && state.unlockedScenes.includes(sc)) state.currentScene = sc;
        state.activeOverlay = btn.getAttribute("data-open-target");
        saveState();
        render();
      };
    });

    document.querySelectorAll("[data-close-overlay]").forEach((btn) => {
      btn.onclick = () => { state.activeOverlay = null; saveState(); render(); };
    });
    const backdrop = document.querySelector("[data-overlay-backdrop]");
    if (backdrop) {
      backdrop.onclick = (e) => {
        if (e.target === backdrop) { state.activeOverlay = null; saveState(); render(); }
      };
    }

    const radarBtn = document.querySelector("[data-toggle-radar]");
    if (radarBtn) radarBtn.onclick = () => { state.radarOn = !state.radarOn; saveState(); render(); };

    const fsBtn = document.querySelector("[data-toggle-fs]");
    if (fsBtn) {
      fsBtn.onclick = () => {
        state.fullscreen = !state.fullscreen;
        render();
      };
    }

    document.querySelectorAll("[data-info-tab]").forEach((b) => {
      b.onclick = () => { state.activeInfoTab = b.getAttribute("data-info-tab"); saveState(); render(); };
    });
    document.querySelectorAll("[data-ask-witness]").forEach((b) => {
      b.onclick = () => {
        state.activeWitness = b.getAttribute("data-ask-witness");
        state.activePage = "詢問證人";
        saveState();
        render();
      };
    });

    // Interactive Puzzles inside overlays
    document.querySelectorAll("[data-toggle-hint]").forEach((b) => {
      b.onclick = () => {
        const el = document.querySelector(b.getAttribute("data-toggle-hint"));
        if (el) el.classList.toggle("show");
      };
    });

    const angleSlider = document.querySelector('[data-gadget="light-angle"]');
    if (angleSlider) {
      angleSlider.oninput = (e) => {
        state.lightAngle = Number(e.target.value);
        const angleHit = state.lightAngle >= 42 && state.lightAngle <= 56;
        const valEl = document.querySelector(".angle-val-display");
        if (valEl) valEl.textContent = angleHit ? `${state.lightAngle}° ✅ 第六個人影浮現！` : `${state.lightAngle}°（調至 18:42 斜射光角）`;
        const shadow = document.querySelector(".uv-side-shadow");
        if (shadow) shadow.style.opacity = Math.max(0, 1 - Math.abs(state.lightAngle - 48) / 24).toFixed(2);
        const note = document.querySelector(".uv-status-note");
        if (note && !state.uvOn) {
          note.innerHTML = angleHit
            ? "🟡 <b>側光角度對齊（48°）！</b>斜光照在玻璃上浮出第六道人影。再按上方「紫外線燈」檢視清漆底下吧！"
            : "⚪ 請先拖動上方「夜間側光角度拉桿」重現 18:42 玻璃人影，再開啟紫外線燈照射！";
        }
        saveState();
      };
    }

    const uvBtn = document.querySelector('[data-gadget="uv-toggle"]');
    if (uvBtn) uvBtn.onclick = () => { state.uvOn = !state.uvOn; saveState(); render(); };

    const peelSlider = document.querySelector('[data-gadget="carbon-peel"]');
    if (peelSlider) {
      peelSlider.oninput = (e) => {
        state.peelPct = Number(e.target.value);
        const topSheet = document.querySelector(".peel-top-sheet");
        if (topSheet) topSheet.style.transform = `translateX(-${state.peelPct}%)`;
        const valEl = document.querySelector(".peel-val-display");
        if (valEl) valEl.textContent = state.peelPct >= 65 ? `已掀開 ${state.peelPct}% ✅ 露出「林月琴舊畫室」！` : `已掀開 ${state.peelPct}%（向右拖動）`;
        saveState();
      };
    }

    document.querySelectorAll("[data-nb-page]").forEach((b) => {
      b.onclick = () => { state.nbPage = b.getAttribute("data-nb-page"); saveState(); render(); };
    });

    document.querySelectorAll("[data-kp-key]").forEach((b) => {
      b.onclick = () => {
        if (state.e1Unlocked) return;
        const k = b.getAttribute("data-kp-key");
        state.kpError = "";
        if (k === "CLR") {
          state.kpCode = "";
        } else if (k === "ENT") {
          if (state.kpCode === "1842") {
            state.e1Unlocked = true;
          } else {
            state.kpCode = "";
            state.kpError = "密碼錯誤 · 請重試";
          }
        } else if (state.kpCode.length < 4) {
          state.kpCode += k;
        }
        saveState();
        render();
      };
    });

    document.querySelectorAll("[data-zone-sw]").forEach((b) => {
      b.onclick = () => {
        if (state.e2Unlocked) return;
        const z = b.getAttribute("data-zone-sw");
        state.e2Zones[z] = !state.e2Zones[z];
        state.e2Error = "";
        saveState();
        render();
      };
    });
    const scanBtn = document.querySelector('[data-action="e2-scan"]');
    if (scanBtn) {
      scanBtn.onclick = () => {
        if (state.e2Zones["2F-B"] && !state.e2Zones["2F-A"] && !state.e2Zones["1F-W"]) {
          state.e2Unlocked = true;
          state.e2Error = "";
        } else {
          state.e2Error = "分區不符：請只開啟「2F B 展廳」";
        }
        saveState();
        render();
      };
    }

    document.querySelectorAll("[data-diff-spot]").forEach((b) => {
      b.onclick = () => {
        state.diffFound[b.getAttribute("data-diff-spot")] = true;
        saveState();
        render();
      };
    });
    const diffHintBtn = document.querySelector('[data-action="diff-hint"]');
    if (diffHintBtn) diffHintBtn.onclick = () => { state.diffHintOn = !state.diffHintOn; render(); };

    document.querySelectorAll("[data-dial-step]").forEach((b) => {
      b.onclick = () => {
        if (state.brassUnlocked) return;
        const [idx, delta] = b.getAttribute("data-dial-step").split(",").map(Number);
        const len = WHEEL_SETS[idx].length;
        state.dialIdx[idx] = (state.dialIdx[idx] + delta + len) % len;
        state.dialError = "";
        saveState();
        render();
      };
    });
    const brassBtn = document.querySelector('[data-action="brass-open"]');
    if (brassBtn) {
      brassBtn.onclick = () => {
        const code = [0, 1, 2].map((i) => WHEEL_SETS[i][state.dialIdx[i]]).join("");
        if (code === "R07") {
          state.brassUnlocked = true;
          state.dialError = "";
        } else {
          state.dialError = "鎖芯未對齊！想想仿作編號";
        }
        saveState();
        render();
      };
    }

    document.querySelectorAll("[data-row-ev]").forEach((b) => {
      b.onclick = () => {
        if (b.getAttribute("data-is-clue") === "1") {
          collectTarget(b.getAttribute("data-row-ev"));
        } else {
          b.classList.add("normal-checked");
        }
      };
    });
    document.querySelectorAll("[data-collect-target]").forEach((b) => {
      b.onclick = () => collectTarget(b.getAttribute("data-collect-target"));
    });

    // Stage 2 Witness
    document.querySelectorAll("[data-select-witness]").forEach((b) => {
      b.onclick = () => { state.activeWitness = b.getAttribute("data-select-witness"); saveState(); render(); };
    });
    document.querySelectorAll("[data-quick-q]").forEach((b) => {
      b.onclick = () => {
        const qIdx = Number(b.getAttribute("data-quick-q"));
        const qText = GD.WITNESSES[state.activeWitness].sample_questions[qIdx][0];
        submitWitnessQuestion(state.activeWitness, qText, false);
      };
    });
    const wForm = document.getElementById("witnessForm");
    if (wForm) {
      wForm.onsubmit = (e) => {
        e.preventDefault();
        const input = document.getElementById("witnessInput");
        const val = input ? input.value : "";
        if (val.trim()) submitWitnessQuestion(state.activeWitness, val, true);
      };
    }

    // Stage 3 Timeline
    document.querySelectorAll("[data-slot-time]").forEach((sel) => {
      sel.onchange = () => { state.timelineSlots[sel.getAttribute("data-slot-time")] = sel.value; saveState(); };
    });
    document.querySelectorAll('input[name="scope_e4"]').forEach((r) => {
      r.onchange = () => { state.scopeE4Choice = Number(r.value); saveState(); };
    });
    document.querySelectorAll('input[name="scope_e3"]').forEach((r) => {
      r.onchange = () => { state.scopeE3Choice = Number(r.value); saveState(); };
    });
    const tlForm = document.getElementById("timelineForm");
    if (tlForm) {
      tlForm.onsubmit = (e) => {
        e.preventDefault();
        const tp = GD.TIMELINE_PUZZLE;
        const wrongTimes = tp.slots.filter((s) => state.timelineSlots[s.time] !== s.correct).map((s) => s.time);
        if (!wrongTimes.length) state.timelineSolved = true;
        else state.timelineAttempts += 1;

        const e4Checked = state.scopeE4Choice !== null;
        const e3Checked = state.scopeE3Choice !== null;
        const e4Correct = state.scopeE4Choice === tp.scope_questions.e4.correct;
        const e3Correct = state.scopeE3Choice === tp.scope_questions.e3.correct;

        if (e4Correct) state.e4ScopeSolved = true;
        else if (e4Checked && !state.e4ScopeSolved) state.e4ScopeAttempts += 1;

        if (e3Correct) state.e3ScopeSolved = true;
        else if (e3Checked && !state.e3ScopeSolved) state.e3ScopeAttempts += 1;

        state.timelineFeedback = { wrongTimes, e4Correct, e3Correct, e4Checked, e3Checked };
        if (wrongTimes.length || (e4Checked && !e4Correct) || (e3Checked && !e3Correct)) {
          const attempts = Math.max(state.timelineAttempts, state.e4ScopeAttempts, state.e3ScopeAttempts);
          state.hintLevel = Math.max(state.hintLevel, Math.min(attempts, 3));
        }
        saveState();
        render();
      };
    }
    const tlHintBtn = document.querySelector("[data-timeline-hint]");
    if (tlHintBtn) {
      tlHintBtn.onclick = () => { state.hintLevel = Math.min(3, state.hintLevel + 1); saveState(); render(); };
    }

    // Stage 4 Courtroom
    const cStmt = document.getElementById("courtStmtSelect");
    if (cStmt) cStmt.onchange = () => { state.courtStatement = cStmt.value; saveState(); render(); };
    const cEv = document.getElementById("courtEvSelect");
    if (cEv) cEv.onchange = () => { state.courtEvidence = cEv.value; saveState(); render(); };
    const objBtn = document.getElementById("objectionBtn");
    if (objBtn) {
      objBtn.onclick = () => {
        const key = `${state.courtStatement}|${state.courtEvidence}`;
        const challenge = GD.CORRECT_CHALLENGES[key];
        if (challenge && !state.foundClues.includes(challenge.clue_id)) {
          state.foundClues.push(challenge.clue_id);
          state.lastCourtResult = { success: true, summary: challenge.summary, text: challenge.fallback_reaction };
        } else if (challenge) {
          state.lastCourtResult = {
            success: true,
            summary: challenge.summary,
            text: "這項矛盾已經成立並寫入法庭筆錄，請繼續找出另一項矛盾！",
          };
        } else {
          state.wrongChallenges = Math.min(state.wrongChallenges + 1, GD.MAX_COURT_HINT_LEVEL);
          const hint =
            state.wrongChallenges === 1
              ? "提示 1：比對證詞裡明確提到的時間、地點或系統狀態。"
              : state.wrongChallenges === 2
              ? "提示 2：『閉館後沒有進入 B 展廳』要對照 E1；『警報沒有被解除』要對照 E2。"
              : "提示 3：正確配對是「策展人證詞＋E1」和「保全證詞＋E2」。選好後重新提出異議即可繼續。";
          state.lastCourtResult = {
            success: false,
            summary: "矛盾不成立",
            text: "這組「證詞」與「證物」無法構成直接矛盾。" + hint,
          };
        }
        saveState();
        render();
      };
    }

    // Stage 5 Verdict
    document.querySelectorAll('input[name="final_suspect"]').forEach((r) => {
      r.onchange = () => { state.finalSuspect = r.value; state.verdictWarning = ""; saveState(); };
    });
    document.querySelectorAll('input[name="final_reason"]').forEach((r) => {
      r.onchange = () => { state.finalReason = r.value; state.verdictWarning = ""; saveState(); };
    });
    const vForm = document.getElementById("verdictForm");
    if (vForm) {
      vForm.onsubmit = (e) => {
        e.preventDefault();
        if (!state.finalSuspect || !state.finalReason) {
          state.verdictWarning = "請先選出你要指控的人，以及支持指控的證據鏈。";
          render();
          return;
        }
        const complete =
          state.foundClues.length === GD.REQUIRED_CLUES.length &&
          state.viewedEvidence.length === GD.EVIDENCE.length &&
          state.timelineSolved &&
          state.e4ScopeSolved &&
          state.e3ScopeSolved;
        const ok = state.finalSuspect === GD.CULPRIT_ID && state.finalReason === GD.CORRECT_REASON_ID && complete;
        if (ok) {
          state.ending = {
            success: true,
            title: "逆轉成功！第六個人影的真相",
            body:
              "法官採納你的證據鏈。怪談裡的『第六個人』不是鬼，而是原作清漆下被覆蓋的人像；紫外線底片證明她曾參與創作，卻被隔日拍賣目錄抹去。\n\n" +
              "• 18:41–18:54：林書妍專用帳號將展廳警報切成旁路，讓她能在閉館後進入（證物 E2）。\n" +
              "• 18:42：門禁和入口影像證實她進入展廳，與她的證詞矛盾；這項紀錄單獨看仍不能證明她拿走畫作（證物 E1）。\n" +
              "• 18:56：她簽核的恆溫箱送往林月琴舊畫室。貨物欄雖然空白，但出庫時間、目的地與畫框中的 R-07 仿作互相呼應（證物 E4、E5）。\n" +
              "• 王冠宇早在三天前就記下熄燈時出現的人影；勤務簿能證明他簽到與簽退，不能單獨當成全程不在場證明（證物 E3）。\n\n" +
              "林書妍承認，她把原畫換下、留下 R-07 仿作，再將原畫送到外祖母林月琴的舊畫室；她想在沈景川的名字再次蓋過外祖母署名前保住證據。她交出藏畫位置，法院判王冠宇無罪，並暫停拍賣、下令調查館藏來源。",
          };
        } else {
          let body = "你找到了正確的嫌疑人，卻沒有選出能串起全案的正確證據鏈；法官裁定證據不足。";
          if (!complete) body = "卷宗仍有關鍵證物未讀或矛盾尚未在法庭上揭穿，法官認為你的結論程序與證據不足。";
          else if (state.finalSuspect !== GD.CULPRIT_ID) body = "你的指控與門禁紀錄、警報旁路及拍賣預展出庫紀錄無法互相印證；法官駁回你的結論。";
          state.ending = {
            success: false,
            title: "證據不足，結案失敗",
            body: body + " 你可以重新開始，再整理一次證詞與證物。",
          };
        }
        saveState();
        render();
        window.scrollTo({ top: 0, behavior: "smooth" });
      };
    }
  }

  render();
})();
