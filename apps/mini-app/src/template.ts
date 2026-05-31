export const BRAND_FOOTER = `
      <div class="brand-attribution">
        <button type="button" onclick="openPromptAnatomy()" class="brand-attribution-link" aria-label="Visit Prompt Anatomy">
          <img src="/branding/prompt-anatomy-logo.png" alt="" class="brand-attribution-logo" width="18" height="18" />
          <span>Prompt Anatomy</span>
          <i class="fa-solid fa-arrow-up-right-from-square text-nano opacity-60" aria-hidden="true"></i>
        </button>
      </div>`;

export const APP_SHELL = `
<div class="cl-phone-shell relative w-full max-w-md rounded-3xl p-3 shadow-2xl border flex flex-col overflow-hidden" style="height: 840px; max-height: 95vh;">
  <div class="cl-phone-notch absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-5 bg-black rounded-b-xl z-50 flex items-center justify-center">
    <div class="w-12 h-1 rounded-full mb-1" style="background: var(--cl-border);"></div>
  </div>
  <button id="soundToggleBtn" type="button" onclick="toggleMute()" class="sound-fab focus-ring" title="Toggle Sound" aria-label="Toggle sound">
    <i id="soundIcon" class="fa-solid fa-volume-high text-sm"></i>
  </button>
  <div class="cl-header flex items-center justify-between pt-5 pb-3 px-3 rounded-t-2xl border-b select-none z-40">
    <div class="flex items-center space-x-2">
      <button onclick="goHome()" class="cl-header-muted min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors duration-150 focus-ring rounded-lg" aria-label="Back to home">
        <i class="fa-solid fa-chevron-left text-lg"></i>
      </button>
      <div>
        <h1 class="font-bold text-sm tracking-wide">Corporate Ladder</h1>
        <p class="text-micro text-emerald-400 flex items-center gap-1">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
          <span id="botHandleLabel">@CorporateLadderBot</span>
        </p>
      </div>
    </div>
    <div class="flex items-center space-x-3 cl-header-muted">
      <i class="fa-solid fa-ellipsis-vertical text-sm cursor-pointer cl-header-muted"></i>
    </div>
  </div>
  <div class="cl-viewport relative flex-grow rounded-b-2xl flex flex-col overflow-hidden office-grid min-h-0">
    <div id="startScreen" class="flex flex-col flex-grow min-h-0 select-none z-10 px-4 pt-4 pb-2">
      <div class="space-y-2.5 flex-shrink-0">
        <div class="text-center">
          <div class="home-hero-enter home-hero-enter-icon inline-flex items-center justify-center w-12 h-12 bg-gradient-to-tr from-cl-primary to-cl-accent-indigo text-white rounded-xl shadow-lg mb-2 transform -rotate-6">
            <i class="fa-solid fa-briefcase text-xl"></i>
          </div>
          <h2 class="home-hero-enter home-hero-enter-title text-2xl font-extrabold text-slate-900 tracking-tight leading-none">CORPORATE<br><span class="text-cl-primary">LADDER</span></h2>
          <p class="home-hero-enter home-hero-enter-tagline text-xs text-slate-500 font-semibold uppercase tracking-wider mt-1">Simulating modern work chaos</p>
        </div>
        <div class="card-light space-y-2 py-3">
          <div class="flex items-center justify-between border-b border-slate-100 pb-2">
            <span class="text-nano font-bold uppercase text-slate-400 tracking-wider">Employee Badge</span>
            <span class="text-nano bg-amber-100 text-amber-800 font-extrabold px-2 py-0.5 rounded-full">ACTIVE EMPLOYMENT</span>
          </div>
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-base border-2 border-indigo-200 shrink-0" id="avatarIcon">🧑‍💻</div>
            <div class="flex-grow min-w-0">
              <input type="text" id="usernameInput" value="CorporateSlave" class="font-bold text-slate-800 border-b border-dashed border-slate-300 focus:border-cl-primary focus:outline-none focus-ring bg-transparent w-full min-h-[44px]" placeholder="Enter Nickname...">
              <p class="text-xs text-slate-500 mt-0.5 truncate" id="userTitleLabel">Starting Rank: Intern</p>
            </div>
            <div class="text-right shrink-0">
              <p class="text-nano font-bold uppercase text-slate-400">Best</p>
              <p class="text-xs font-bold text-slate-950" id="highScoreBadge">0.0 Years</p>
            </div>
          </div>
        </div>
        <div id="homeNewsTicker" class="ticker-bar shrink-0">
          <span class="text-nano font-bold uppercase shrink-0 border-r border-amber-500/30 pr-2 mr-2">News</span>
          <div class="news-ticker-track min-w-0 flex-1">
            <span id="newsTickerText" class="news-ticker-text text-caption font-mono"></span>
          </div>
        </div>
        <div id="dailyShiftBlock" class="shift-badge-enter">
          <div class="flex items-center justify-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5" id="dailyShiftPill" title="">
            <span class="text-nano font-bold uppercase tracking-wider text-indigo-400">Today&apos;s shift</span>
            <span id="dailyShiftLabel" class="text-caption font-extrabold text-indigo-900">Open Floor Plan</span>
          </div>
          <p id="dailyShiftDescription" class="text-caption text-slate-500 text-center mt-1 px-1"></p>
        </div>
      </div>
      <div class="start-cta-bar shrink-0 pb-4 pt-3 mt-auto space-y-2 border-t border-slate-200">
        <p class="text-caption font-semibold text-slate-700 text-center px-1">One tap, one rung. Meetings terminate. Coffee negotiates.</p>
        <button onclick="startGame()" class="cl-primary-btn w-full py-4 px-6 text-lg">
          <i class="fa-solid fa-play"></i><span>PUNCH IN &amp; CLIMB</span>
        </button>
        <div class="grid grid-cols-2 gap-2">
          <button onclick="switchTab('leaderboard')" class="btn-cl-secondary py-2 px-3 text-xs">
            <i class="fa-solid fa-trophy text-amber-500"></i> Leaderboard
          </button>
          <button onclick="switchTab('howtoplay')" class="btn-cl-secondary py-2 px-3 text-xs">
            <i class="fa-solid fa-circle-question text-cl-primary"></i> How to Play
          </button>
        </div>
        ${BRAND_FOOTER}
      </div>
    </div>
    <div id="gameScreen" class="hidden flex-col flex-grow min-h-0 relative select-none">
      <div id="deathFlash" class="pointer-events-none absolute inset-0 bg-red-500/20 opacity-0 z-40"></div>
      <div id="ogCaptureFrame" class="og-capture-frame min-h-0 flex-1 flex flex-col">
      <div id="gameHud" class="game-hud z-10 flex flex-col gap-1.5">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-baseline gap-1 text-slate-900">
            <span class="text-2xl font-black leading-none" id="gameYearsLabel">0.0</span>
            <span class="text-caption font-bold text-slate-500">Years</span>
          </div>
          <div class="text-right min-w-0">
            <span class="badge-rank-intern mt-0.5" id="gameRankBadge">
              <span id="rankBadgeIcon">🧑‍💻</span> <span id="rankBadgeText">Intern</span>
            </span>
            <p id="milestoneChip" class="text-caption font-bold text-cl-primary truncate">Manager in 10.0y</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span class="flex shrink-0 items-center gap-1 text-caption font-bold text-slate-500"><i class="fa-solid fa-bolt text-amber-500"></i></span>
          <div class="h-2 flex-1 overflow-hidden rounded-full border border-slate-200 bg-slate-100 p-px">
            <div id="burnoutMeter" class="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 rounded-full transition-all duration-75" style="width: 100%;"></div>
          </div>
          <span id="burnoutPercentLabel" class="text-caption font-bold text-slate-500 w-8 text-right">100%</span>
        </div>
        <p id="hudTapHint" class="hud-tap-hint hidden">Tap the empty side to climb</p>
      </div>
      <div id="hrMemoRail" class="hr-memo-rail hr-memo-rail--info hidden" aria-live="polite">
        <div class="hr-memo-rail-body">
          <span id="hrMemoFrom" class="hr-memo-from">People Ops</span>
          <p id="hrMemoText" class="hr-memo-text">…</p>
        </div>
        <div class="hr-memo-rail-meta">
          <span class="hr-memo-stamp-wrap hidden">
            <span class="promo-stamp text-nano font-black uppercase text-emerald-700 border-2 border-emerald-600 px-2 py-0.5 rounded rotate-12 shrink-0">PROMOTED</span>
          </span>
          <span id="hrMemoRef" class="hr-memo-ref">REF-00000</span>
        </div>
      </div>
        <div id="gamePlayArea" class="game-play-area">
          <div id="reorgHudStrip" class="reorg-hud-strip reorg-hud-overlay hidden">
            <span class="reorg-hud-strip-label">ORG CHART UNSTABLE</span>
          </div>
          <div class="absolute bottom-8 left-4 right-4 opacity-5 flex justify-between items-end pointer-events-none select-none">
            <div class="w-12 h-36 bg-slate-900 rounded-t"></div>
            <div class="w-16 h-48 bg-slate-900 rounded-t"></div>
            <div class="w-8 h-24 bg-slate-900 rounded-t"></div>
            <div class="w-14 h-40 bg-slate-900 rounded-t"></div>
          </div>
          <div class="absolute inset-y-0 left-1/2 transform -translate-x-1/2 w-48 flex flex-col-reverse justify-start items-center pb-12 select-none pointer-events-none">
            <div class="absolute top-0 bottom-0 left-12 w-2 bg-slate-300 border-x border-slate-400"></div>
            <div class="absolute top-0 bottom-0 right-12 w-2 bg-slate-300 border-x border-slate-400"></div>
            <p id="floorLabel" class="absolute top-1 left-0 right-0 text-center text-nano font-bold uppercase tracking-wider text-slate-400/80">Floor 1 — Intern Pit</p>
            <div id="rungsContainer" class="relative w-full h-full flex flex-col-reverse justify-start"></div>
          </div>
          <div id="playerClimber" class="absolute bottom-16 w-16 h-16 flex flex-col items-center justify-center transition-all duration-100 ease-out select-none pointer-events-none" style="left: calc(50% - 92px);">
            <span id="playerRankProp" class="absolute -top-1 -right-1 text-lg leading-none rank-prop" aria-hidden="true">🪪</span>
            <div id="playerActionEmoji" class="text-4xl filter drop-shadow idle-bob">🧑‍💻</div>
            <div class="mt-1 bg-slate-900/80 text-nano text-white px-1 py-0.5 rounded uppercase font-bold tracking-tight">YOU</div>
          </div>
        </div>
      </div>
      <div id="tapControlsBar" class="tap-controls-bar select-none">
        <button id="btnTapLeft" type="button" aria-label="Climb left" class="btn-tap-zone btn-tap-zone-left touch-none focus-ring">
          <i class="fa-solid fa-arrow-left icon-md text-slate-700" aria-hidden="true"></i>
          <span class="text-caption font-extrabold text-slate-800 tracking-wide">TAP LEFT</span>
          <span class="keyboard-hint text-nano text-slate-400 font-mono">Keyboard: ←</span>
        </button>
        <button id="btnTapRight" type="button" aria-label="Climb right" class="btn-tap-zone btn-tap-zone-right touch-none focus-ring">
          <i class="fa-solid fa-arrow-right icon-md text-slate-700" aria-hidden="true"></i>
          <span class="text-caption font-extrabold text-slate-800 tracking-wide">TAP RIGHT</span>
          <span class="keyboard-hint text-nano text-slate-400 font-mono">Keyboard: →</span>
        </button>
      </div>
    </div>
    <div id="gameOverScreen" class="hidden flex-col flex-grow justify-between p-6 select-none overflow-y-auto">
      <div class="text-center mt-2">
        <span class="inline-flex items-center justify-center w-12 h-12 bg-red-100 text-red-600 rounded-full mb-2">
          <i class="fa-solid fa-triangle-exclamation text-2xl"></i>
        </span>
        <h2 class="text-2xl font-black text-red-600 tracking-tight leading-none uppercase">Employment Terminated</h2>
        <p class="text-micro text-slate-500 font-bold uppercase mt-1 tracking-wide">HR Exit Interview in Progress</p>
      </div>
      <div class="card-performance">
        <div class="absolute -right-6 -bottom-6 w-24 h-24 border-4 border-red-500/20 text-red-500/20 flex items-center justify-center rounded-full font-black text-lg transform -rotate-12 pointer-events-none">REJECTED</div>
        <div class="flex items-center justify-between border-b border-slate-100 pb-1.5">
          <span class="text-caption font-extrabold uppercase text-slate-500">Corporate Performance Card</span>
          <span class="text-micro font-mono text-slate-400" id="reviewId">REF-89412</span>
        </div>
        <div class="grid grid-cols-2 gap-3 text-xs border-b border-slate-100 pb-3">
          <div><p class="text-slate-400 text-label-upper">Years Survived</p><p class="font-extrabold text-slate-900 text-lg" id="statYears">0.0</p><p id="statBestDelta" class="text-nano font-bold text-slate-500 mt-0.5"></p></div>
          <div><p class="text-slate-400 text-label-upper">Highest Level</p><p class="font-extrabold text-cl-primary text-lg flex items-center gap-1" id="statRank"><span>🧑‍💻</span> Intern</p></div>
        </div>
        <p id="careerHighLine" class="text-nano font-bold text-slate-500 -mt-1 mb-1"></p>
        <p id="leaderboardGapLine" class="text-nano font-bold text-indigo-700 text-center hidden"></p>
        <p id="reapplyFlavorLine" class="text-caption text-slate-600 italic text-center px-2"></p>
        <div class="bg-red-50/50 border border-red-100 p-3 rounded-lg text-xs">
          <p class="text-nano uppercase font-bold text-red-700 tracking-wider">Termination Cause</p>
          <div id="terminationCauseRow" class="flex items-center gap-2 mt-1 mb-1">
            <span id="terminationCauseIcon" class="text-lg leading-none">📅</span>
            <span id="terminationCauseLabel" class="text-xs font-extrabold text-red-800">Meeting Overload</span>
          </div>
          <p class="font-bold text-red-950 italic" id="terminationReason">"Attended 214 meetings."</p>
        </div>
        <p class="text-caption text-slate-600 font-semibold text-center px-2 mt-2" id="retryTip"></p>
        <p class="text-caption text-slate-500 italic text-center px-2 mt-1" id="terminationFlavor">"Your synergy did not scale optimally with our paradigms."</p>
      </div>
      <div class="space-y-2 mt-auto">
        <button onclick="startGame()" class="btn-cl-primary w-full py-3.5 px-6 shadow-md">
          <i class="fa-solid fa-rotate-right"></i><span>RE-APPLY FOR ROLE (TRY AGAIN)</span>
        </button>
        <div class="grid grid-cols-2 gap-2">
          <button onclick="copyShareText()" class="btn-cl-share py-2.5 px-3 text-xs">
            <i class="fa-solid fa-share"></i> Share Results
          </button>
          <button onclick="switchTab('leaderboard')" class="btn-cl-secondary py-2.5 px-3 text-xs">
            <i class="fa-solid fa-trophy text-amber-500"></i> Leaderboard
          </button>
        </div>
        <button onclick="goHome()" class="btn-cl-muted text-xs">Back to Corporate Lounge</button>
        ${BRAND_FOOTER}
      </div>
    </div>
    <div id="leaderboardScreen" class="hidden flex-col flex-grow justify-between p-5 select-none overflow-y-auto">
      <div>
        <div class="flex items-center space-x-3 mb-4">
          <span class="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm">🏆</span>
          <div>
            <h3 class="font-black text-slate-900 text-lg leading-none">Global Boardroom</h3>
            <p class="text-xs text-slate-500">Fastest corporate climbers in the organization</p>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-lg mb-4">
          <button data-lb-tab="daily" class="lb-tab-active">Daily</button>
          <button data-lb-tab="weekly" class="lb-tab-inactive">Weekly</button>
        </div>
        <div class="space-y-2 max-h-[380px] overflow-y-auto pr-1" id="leaderboardList"></div>
      </div>
      <div class="pt-4 border-t border-slate-200 mt-4 space-y-2">
        <button onclick="goHome()" class="btn-cl-primary-sm">BACK TO THE OFFICE</button>
        ${BRAND_FOOTER}
      </div>
    </div>
    <div id="howToPlayScreen" class="hidden flex-col flex-grow justify-between p-5 select-none overflow-y-auto">
      <div class="space-y-4">
        <div class="flex items-center space-x-3">
          <span class="w-10 h-10 bg-blue-100 text-cl-primary rounded-xl flex items-center justify-center font-bold text-lg shadow-sm">💡</span>
          <div>
            <h3 class="font-black text-slate-900 text-lg leading-none">Employee Playbook</h3>
            <p class="text-xs text-slate-500">A guide to survive organizational failure</p>
          </div>
        </div>
        <div class="space-y-3.5 text-xs text-slate-600">
          <div class="card-light-sm">
            <span class="text-xl shrink-0">🏃</span>
            <div><h4 class="font-extrabold text-slate-800">Basic Climbing</h4><p class="mt-0.5 text-caption">Tap LEFT or RIGHT on the safe side. One rung per tap.</p></div>
          </div>
          <div class="card-light-sm">
            <span class="text-xl shrink-0">📅</span>
            <div><h4 class="font-extrabold text-slate-800">Meetings</h4><p class="mt-0.5 text-caption">Static blocks. Step on them = instant termination.</p></div>
          </div>
          <div class="card-light-sm">
            <span class="text-xl shrink-0">🔄</span>
            <div><h4 class="font-extrabold text-slate-800">Reorganizations</h4><p class="mt-0.5 text-caption">Swap sides periodically. Time your climbs. Appear after promotion to Manager.</p></div>
          </div>
          <div class="card-light-sm">
            <span class="text-xl shrink-0">⏰</span>
            <div><h4 class="font-extrabold text-slate-800">Deadlines</h4><p class="mt-0.5 text-caption">Quarter-end blocks. Step on them = instant termination. Appear at CEO level.</p></div>
          </div>
          <div class="card-light-sm">
            <span class="text-xl shrink-0">☕</span>
            <div><h4 class="font-extrabold text-slate-800">Energy &amp; Coffee</h4><p class="mt-0.5 text-caption">Energy depletes over time. Climbing adds a little; coffee gives +25%.</p></div>
          </div>
          <div class="card-light-sm">
            <span class="text-xl shrink-0">🏆</span>
            <div><h4 class="font-extrabold text-slate-800">Ranks</h4><p class="mt-0.5 text-caption">Intern → Manager (10y) → CEO (35y).</p></div>
          </div>
          <div class="card-light-sm">
            <span class="text-xl shrink-0">📈</span>
            <div>
              <h4 class="font-extrabold text-slate-800">Career Phases</h4>
              <ul class="mt-1 text-caption space-y-1 list-disc list-inside">
                <li><strong>Intern (0–9y):</strong> Meetings only — learn safe-side tapping.</li>
                <li><strong>Manager (10–34y):</strong> Reorgs swap sides — time your climbs.</li>
                <li><strong>CEO (35y+):</strong> Deadlines join the chaos — coffee is strategic.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div class="pt-4 mt-4 space-y-2">
        <button onclick="goHome()" class="btn-cl-primary-sm">I UNDERSTAND SYNERGY</button>
        ${BRAND_FOOTER}
      </div>
    </div>
    <div id="toastNotification" class="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-full shadow-lg z-50 flex items-center space-x-2 opacity-0 pointer-events-none transition-opacity duration-300">
      <i class="fa-solid fa-circle-check text-emerald-400"></i>
      <span id="toastText">Done!</span>
    </div>
  </div>
</div>
`;
