import {
  ALL,
  CATEGORIES,
  DISTANCE_FILTERS,
  SORTS,
  STORAGE_KEY,
  TIME_FILTERS,
  defaultState,
  icons,
  placeImages
} from "./app-data.js";
import {
  bestTime,
  confirmedCount,
  distanceLimit,
  inferCategory,
  matchesTimeFilter,
  placeDistance,
  placePrice,
  placeRating,
  placeTags,
  scorePlace as scorePlaceForUser,
  voteStats
} from "./app-logic.js";

let state = loadState();
if (state.poi.status.includes("未配置 AMAP_KEY") || state.poi.status.includes("AMAP_KEY is not set")) {
  state.poi.status = "高德服务已连接，可搜地图导入";
  saveState();
}
let startupMessage = "";
let hasRendered = false;
let deferredInstallPrompt = null;
let isComposing = false;
applyInviteFromHash();
window.addEventListener("hashchange", applyInviteFromHash);
setupKeyboardAvoidance();

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadState() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (stored?.activities && stored?.places) {
      return {
        ...clone(defaultState),
        ...stored,
        ui: { ...defaultState.ui, ...stored.ui },
        filters: { ...defaultState.filters, ...stored.filters },
        placeFilters: { ...defaultState.placeFilters, ...stored.placeFilters },
        poi: { ...defaultState.poi, ...stored.poi },
        create: { ...defaultState.create, ...stored.create }
      };
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
  return clone(defaultState);
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function encodePayload(payload) {
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  let binary = "";
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.slice(index, index + 0x8000));
  }
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function decodePayload(value) {
  const base64 = value.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

function buildInvitePayload(activityId) {
  const activity = state.activities.find((item) => item.id === activityId);
  if (!activity) return null;
  const places = activity.placeIds.map(placeById).filter(Boolean);
  return {
    version: 1,
    exportedAt: Date.now(),
    from: { id: currentUser().id, nickname: currentUser().nickname },
    activity,
    places
  };
}

function buildInviteUrl(activityId) {
  const payload = buildInvitePayload(activityId);
  if (!payload) return "";
  return `${location.href.split("#")[0]}#invite=${encodePayload(payload)}`;
}

function applyInviteFromHash() {
  const hash = location.hash.slice(1);
  if (!hash) return;

  if (["discover", "places", "plan", "activity"].includes(hash)) {
    state.activeTab = hash;
    saveState();
    renderIfReady();
    return;
  }

  if (hash.startsWith("activity-")) {
    const activityId = hash.replace("activity-", "");
    if (state.activities.some((activity) => activity.id === activityId)) {
      state.selectedActivityId = activityId;
      state.activeTab = "activity";
      saveState();
      renderIfReady();
    }
    return;
  }

  if (!hash.startsWith("invite=")) return;

  try {
    const payload = decodePayload(hash.slice("invite=".length));
    if (!payload?.activity?.id) return;

    const existingIds = new Set(state.places.map((place) => place.id));
    const incomingPlaces = Array.isArray(payload.places) ? payload.places.filter((place) => place?.id && !existingIds.has(place.id)) : [];
    if (incomingPlaces.length) {
      state.places = [...incomingPlaces, ...state.places];
    }

    const exists = state.activities.some((activity) => activity.id === payload.activity.id);
    if (!exists) {
      state.activities = [payload.activity, ...state.activities];
      startupMessage = `已导入 ${payload.from?.nickname || "朋友"} 发来的活动票`;
    } else {
      startupMessage = "已打开这张邀请票";
    }

    state.selectedActivityId = payload.activity.id;
    state.activeTab = "activity";
    state.ui.profileOpen = true;
    saveState();
    renderIfReady();
  } catch (error) {
    console.warn("Invalid invite payload", error);
    startupMessage = "邀请链接解析失败";
  }
}

function renderIfReady() {
  if (hasRendered && document.querySelector("#app")) {
    render();
    flushStartupMessage();
  }
}

function flushStartupMessage() {
  if (!startupMessage) return;
  showToast(startupMessage);
  startupMessage = "";
}

function currentUser() {
  return state.users.find((user) => user.id === state.currentUserId) || state.users[0];
}

function placeById(id) {
  return state.places.find((place) => place.id === id);
}

function placeImage(place) {
  return place?.image || placeImages[place?.id] || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80";
}

function activityCover(activity) {
  return placeImage(placeById(activity.placeIds[0]));
}

function activityDistance(activity) {
  const distances = activity.placeIds.map((id) => placeDistance(placeById(id))).filter(Number.isFinite);
  return distances.length ? Math.min(...distances) : 9.9;
}

function scorePlace(place, selectedCategory = state.placeFilters.category) {
  return scorePlaceForUser(place, selectedCategory, currentUser());
}

function filteredPlaces(limit) {
  const { query, category, sort } = state.placeFilters;
  const normalized = query.trim().toLowerCase();
  let rows = state.places
    .filter((place) => category === ALL || place.category === category)
    .filter((place) => {
      if (!normalized) return true;
      return [place.name, place.address, place.category, ...placeTags(place)].join(" ").toLowerCase().includes(normalized);
    })
    .map((place) => scorePlace(place, category));

  if (sort === "距离") rows.sort((a, b) => placeDistance(a.place) - placeDistance(b.place));
  if (sort === "评分") rows.sort((a, b) => placeRating(b.place) - placeRating(a.place));
  if (sort === "人均价") rows.sort((a, b) => placePrice(a.place) - placePrice(b.place));
  if (sort === "推荐") rows.sort((a, b) => b.score - a.score);

  return limit ? rows.slice(0, limit) : rows;
}

function filteredActivities() {
  const { query, category, time, distance } = state.filters;
  const normalized = query.trim().toLowerCase();
  const maxDistance = distanceLimit(distance);
  return state.activities
    .filter((activity) => activity.visibility === "公开")
    .filter((activity) => activity.status !== "待审核")
    .filter((activity) => category === ALL || activity.placeIds.some((id) => placeById(id)?.category === category))
    .filter((activity) => matchesTimeFilter(activity, time))
    .filter((activity) => activityDistance(activity) <= maxDistance)
    .filter((activity) => {
      if (!normalized) return true;
      const places = activity.placeIds.map((id) => placeById(id)?.name || "").join(" ");
      return [activity.title, activity.note, places].join(" ").toLowerCase().includes(normalized);
    })
    .sort((a, b) => b.createdAt - a.createdAt);
}

function showToast(message) {
  const toast = document.querySelector(".toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2200);
}

function setTab(tab) {
  state.activeTab = tab;
  saveState();
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateFilter(type, key, value) {
  state[type] = { ...state[type], [key]: value };
  saveState();
  render();
}

function updatePoi(key, value) {
  state.poi = { ...state.poi, [key]: value };
  saveState();
}

function normalizeImportedPlace(raw, index = 0, source = "amap") {
  const typeText = [raw.category, raw.type, ...(Array.isArray(raw.tags) ? raw.tags : [])].join(" ");
  const category = CATEGORIES.includes(raw.category) ? raw.category : inferCategory(typeText || raw.name || "");
  return {
    id: raw.id?.startsWith(source) ? raw.id : `${source}-${raw.id || Date.now()}-${index}`,
    name: raw.name || "未命名地点",
    address: raw.address || "地址待补充",
    source,
    category,
    rating: placeRating(raw),
    avgPrice: placePrice(raw),
    open: raw.open !== false,
    distance: placeDistance(raw),
    tags: placeTags(raw).length ? placeTags(raw) : [source === "amap" ? "高德搜索" : "地图搜索"],
    image: raw.image || ""
  };
}

async function searchLivePlaces() {
  const query = state.placeFilters.query.trim();
  if (!query) {
    showToast("先输入地点关键词");
    return;
  }

  state.poi = { ...state.poi, status: "正在连接地图搜索..." };
  saveState();
  render();

  try {
    const url = new URL("./api/places", location.href);
    url.searchParams.set("q", query);
    url.searchParams.set("category", state.placeFilters.category === ALL ? "" : state.placeFilters.category);
    url.searchParams.set("city", state.poi.city || currentUser().city || "广州");
    url.searchParams.set("provider", state.poi.provider || "amap");

    const response = await fetch(url);
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !Array.isArray(data.places) || data.places.length === 0) {
      let message = data.message || "地图搜索暂不可用，已保留本地推荐";
      if (message === "AMAP_KEY is not set, using local recommendations") {
        message = "未配置 AMAP_KEY，当前使用本地推荐";
      }
      state.poi = { ...state.poi, status: message };
      saveState();
      render();
      showToast(message);
      return;
    }

    const existingIds = new Set(state.places.map((place) => place.id));
    const incoming = data.places
      .map((place, index) => normalizeImportedPlace(place, index, data.provider || "amap"))
      .filter((place) => !existingIds.has(place.id));

    state.places = [...incoming, ...state.places];
    state.poi = {
      ...state.poi,
      status: incoming.length ? `已导入 ${incoming.length} 个地图地点` : "地图结果已在卡库里",
      lastImported: incoming.length
    };
    saveState();
    render();
    showToast(state.poi.status);
  } catch {
    state.poi = { ...state.poi, status: "地图服务未连接，继续使用本地推荐" };
    saveState();
    render();
    showToast(state.poi.status);
  }
}

function updateCreate(key, value) {
  state.create = { ...state.create, [key]: value };
  saveState();
  render();
}

function toggleCreatePlace(placeId) {
  const selected = new Set(state.create.selectedPlaceIds);
  selected.has(placeId) ? selected.delete(placeId) : selected.add(placeId);
  updateCreate("selectedPlaceIds", [...selected]);
}

function updateTimeOption(index, value) {
  const timeOptions = [...state.create.timeOptions];
  timeOptions[index] = value;
  updateCreate("timeOptions", timeOptions);
}

function removeTimeOption(index) {
  const timeOptions = state.create.timeOptions.filter((_, itemIndex) => itemIndex !== index);
  updateCreate("timeOptions", timeOptions.length ? timeOptions : [""]);
}

function addManualPlace() {
  const name = prompt("地点名称");
  if (!name) return;
  const address = prompt("地址或备注", "手动添加地点") || "手动添加地点";
  const category = prompt("分类：吃饭 / 咖啡甜品 / 逛街 / 景点 / 游乐设施 / 室内玩乐 / 夜生活", "吃饭") || "吃饭";
  const place = {
    id: `p${Date.now()}`,
    name,
    address,
    source: "manual",
    category: CATEGORIES.includes(category) ? category : "吃饭",
    rating: 4.2,
    avgPrice: 80,
    open: true,
    distance: 0.6,
    tags: ["手动添加"],
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80"
  };
  state.places = [place, ...state.places];
  state.create.selectedPlaceIds = [place.id, ...state.create.selectedPlaceIds];
  saveState();
  render();
  showToast("已添加为候选地点");
}

function createActivity() {
  const title = state.create.title.trim() || "新的周末计划";
  const timeOptions = state.create.timeOptions.map((slot) => slot.trim()).filter(Boolean);
  const names = state.create.participantNames.split(/[，,]/).map((name) => name.trim()).filter(Boolean);

  if (!timeOptions.length) return showToast("至少添加一个候选时间");
  if (!state.create.selectedPlaceIds.length) return showToast("至少选择一个候选地点");

  const participants = [
    { userId: state.currentUserId, name: currentUser().nickname, status: "已加入", availability: { [timeOptions[0]]: "yes" }, note: "" },
    ...names.map((name, index) => ({
      userId: `guest-${Date.now()}-${index}`,
      name,
      status: "待确认",
      availability: {},
      note: ""
    }))
  ];

  const activity = {
    id: `a${Date.now()}`,
    title,
    creatorId: state.currentUserId,
    visibility: state.create.visibility,
    status: state.create.visibility === "公开" ? "招募中" : "待确认",
    timeOptions,
    placeIds: state.create.selectedPlaceIds,
    finalTime: "",
    finalPlaceId: "",
    capacity: Number(state.create.capacity) || 4,
    note: state.create.note.trim(),
    participants,
    reports: 0,
    createdAt: Date.now()
  };

  state.activities = [activity, ...state.activities];
  state.selectedActivityId = activity.id;
  state.activeTab = "activity";
  state.create = { ...clone(defaultState.create), selectedPlaceIds: state.create.selectedPlaceIds.slice(0, 1) };
  saveState();
  render();
  showToast(activity.visibility === "公开" ? "活动已发布到广场" : "私密邀约已创建");
}

function selectActivity(id) {
  state.selectedActivityId = id;
  state.activeTab = "activity";
  saveState();
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function joinActivity(activityId, status = "已加入") {
  const user = currentUser();
  let blocked = false;
  state.activities = state.activities.map((activity) => {
    if (activity.id !== activityId) return activity;
    const exists = activity.participants.some((participant) => participant.userId === user.id);
    if (!exists && status === "已加入" && confirmedCount(activity) >= activity.capacity) {
      blocked = true;
      return activity;
    }
    if (exists) {
      return {
        ...activity,
        participants: activity.participants.map((participant) =>
          participant.userId === user.id ? { ...participant, status } : participant
        )
      };
    }
    return {
      ...activity,
      participants: [...activity.participants, { userId: user.id, name: user.nickname, status, availability: {}, note: "" }]
    };
  });
  saveState();
  render();
  if (blocked) return showToast("名额已满，可以先点感兴趣");
  showToast(status === "感兴趣" ? "已加入你的感兴趣列表" : "已报名参加");
}

function vote(activityId, slot, value) {
  const user = currentUser();
  state.activities = state.activities.map((activity) => {
    if (activity.id !== activityId) return activity;
    const participants = activity.participants.some((participant) => participant.userId === user.id)
      ? activity.participants
      : [...activity.participants, { userId: user.id, name: user.nickname, status: "已加入", availability: {}, note: "" }];
    return {
      ...activity,
      participants: participants.map((participant) => {
        if (participant.userId !== user.id) return participant;
        return { ...participant, availability: { ...participant.availability, [slot]: value }, status: "已加入" };
      })
    };
  });
  saveState();
  render();
}

function finalizeActivity(activityId) {
  state.activities = state.activities.map((activity) => {
    if (activity.id !== activityId) return activity;
    const finalTime = bestTime(activity);
    const finalPlaceId = activity.placeIds
      .map((id) => placeById(id))
      .filter(Boolean)
      .sort((a, b) => scorePlace(b).score - scorePlace(a).score)[0]?.id || activity.placeIds[0];
    return { ...activity, finalTime, finalPlaceId, status: "已确认" };
  });
  saveState();
  render();
  showToast("已确认最佳方案");
}

function reportActivity(activityId) {
  state.activities = state.activities.map((activity) =>
    activity.id === activityId ? { ...activity, reports: activity.reports + 1, status: activity.reports + 1 >= 3 ? "待审核" : activity.status } : activity
  );
  saveState();
  render();
  showToast("已收到举报");
}

async function copyInvite(activityId) {
  const activity = state.activities.find((item) => item.id === activityId);
  const text = buildInviteUrl(activityId);
  if (!text || !activity) return showToast("没有找到这张活动票");

  const isMobileShare = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (navigator.share && isMobileShare) {
    try {
      await navigator.share({ title: activity.title, text: "来投一下这张约玩票", url: text });
      showToast("邀请已发出");
      return;
    } catch {
      // 用户取消系统分享时，继续走复制兜底。
    }
  }

  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      showToast("邀请链接已复制，朋友打开会导入这张票");
    } catch {
      showToast("复制失败，可以长按地址栏分享当前页面");
    }
  } else {
    showToast(text);
  }
}

async function installApp() {
  if (!deferredInstallPrompt) {
    showToast("浏览器菜单里可以添加到主屏幕");
    return;
  }
  deferredInstallPrompt.prompt();
  const choice = await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  state.ui.canInstall = false;
  saveState();
  render();
  showToast(choice.outcome === "accepted" ? "已开始安装" : "稍后也可以安装");
}

function switchUser() {
  const index = state.users.findIndex((user) => user.id === state.currentUserId);
  state.currentUserId = state.users[(index + 1) % state.users.length].id;
  saveState();
  render();
  showToast(`已切换为 ${currentUser().nickname}`);
}

function resetDemoData() {
  if (!window.confirm("重置后会清空当前演示数据，恢复到初始票夹。确定继续吗？")) return;
  localStorage.removeItem(STORAGE_KEY);
  state = clone(defaultState);
  state.ui.profileOpen = false;
  saveState();
  render();
  showToast("演示数据已重置");
}

function setProfileOpen(open) {
  state.ui.profileOpen = open;
  saveState();
  render();
}

function updateProfile(field, value) {
  const userId = state.currentUserId;
  state.users = state.users.map((user) => {
    if (user.id !== userId) return user;
    const next = { ...user, [field]: value };
    if (field === "nickname") {
      next.avatar = value.trim().slice(0, 1) || user.avatar || "我";
    }
    return next;
  });
  if (field === "nickname") {
    state.activities = state.activities.map((activity) => ({
      ...activity,
      participants: activity.participants.map((participant) =>
        participant.userId === userId ? { ...participant, name: value.trim() || "我" } : participant
      )
    }));
  }
  saveState();
}

function categoryRail(active, action) {
  return `
    <div class="category-rail" aria-label="分类筛选">
      ${CATEGORIES.map((category) => `
        <button class="category-pill ${active === category ? "active" : ""}" data-action="${action}" data-value="${esc(category)}">${esc(category)}</button>
      `).join("")}
    </div>
  `;
}

function selectOptions(options, selected) {
  return options.map((item) => `<option value="${esc(item)}" ${selected === item ? "selected" : ""}>${esc(item)}</option>`).join("");
}

function pillGroup(options, active, filterKey, colorClass = "active") {
  return `<div class="pill-group">${options.map((opt) =>
    `<button class="${active === opt ? colorClass : ""}" data-pill-filter="${filterKey}" data-pill-value="${esc(opt)}">${esc(opt)}</button>`
  ).join("")}</div>`;
}

function rarityForActivity(activity, index = 0) {
  if (activity.visibility === "私密") return { key: "legend", label: "私密", text: "私密票", sigil: "私" };
  if (activity.status === "已确认") return { key: "jade", label: "已确认", text: "已确认", sigil: "定" };
  return index % 2 === 0
    ? { key: "jade", label: "公开", text: "公开局", sigil: "约" }
    : { key: "arcane", label: "招募中", text: "招募中", sigil: "玩" };
}

function passCard(activity, index = 0) {
  const places = activity.placeIds.map(placeById).filter(Boolean);
  const leadPlace = places[0];
  const best = activity.finalTime || bestTime(activity) || "待投票";
  const rarity = rarityForActivity(activity, index);
  return `
    <article class="vault-pass ${rarity.key}">
      <button class="pass-hit" data-action="select-activity" data-id="${esc(activity.id)}" aria-label="查看 ${esc(activity.title)}"></button>
      <div class="pass-top">
        <span>活动 ${String(index + 1).padStart(2, "0")}</span>
        <b>${rarity.label}</b>
      </div>
      <div class="pass-art">
        <img src="${esc(activityCover(activity))}" alt="${esc(activity.title)}" loading="lazy">
        <i>${rarity.sigil}</i>
      </div>
      <div class="pass-copy">
        <small>${rarity.text} · ${activity.participants.length}/${activity.capacity} 人</small>
        <h3>${esc(activity.title)}</h3>
        <p>${leadPlace ? esc(leadPlace.name) : "地点待定"} · ${esc(best)}</p>
      </div>
    </article>
  `;
}

function miniPlace(item) {
  const { place, score, reason } = item;
  const selected = state.create.selectedPlaceIds.includes(place.id);
  const sourceLabel = place.source === "amap" ? "高德" : place.source === "manual" ? "手动" : "推荐";
  return `
    <article class="place-card">
      <button class="image-button" data-action="quick-create" data-id="${esc(place.id)}" aria-label="用 ${esc(place.name)} 发起活动">
        <img src="${esc(placeImage(place))}" alt="${esc(place.name)}" loading="lazy">
        <span class="floating-score">${score}</span>
      </button>
      <div class="place-body">
        <div class="place-title-row">
          <h3>${esc(place.name)}</h3>
          <span>${placeRating(place).toFixed(1)}</span>
        </div>
        <p>${esc(place.address)}</p>
        <div class="meta-line">
          <span>${esc(sourceLabel)}</span>
          <span>${esc(place.category)}</span>
          <span>${placeDistance(place)}km</span>
          <span>￥${placePrice(place)}</span>
        </div>
        <div class="reason">${esc(reason)}</div>
        <button class="quiet-action ${selected ? "selected" : ""}" data-action="toggle-place" data-id="${esc(place.id)}">
          ${selected ? "已加入候选" : "加入候选"}
        </button>
      </div>
    </article>
  `;
}

function activityCard(activity, compact = false) {
  const places = activity.placeIds.map(placeById).filter(Boolean);
  const leadPlace = places[0];
  const joined = confirmedCount(activity);
  return `
    <article class="activity-card ${compact ? "compact" : ""}">
      <button class="activity-media" data-action="select-activity" data-id="${esc(activity.id)}" aria-label="查看 ${esc(activity.title)}">
        <img src="${esc(activityCover(activity))}" alt="${esc(activity.title)}" loading="lazy">
        <span class="glass-badge">${esc(activity.visibility)}</span>
      </button>
      <div class="activity-content">
        <div class="activity-topline">
          <span>${esc(activity.timeOptions[0] || "时间待定")}</span>
          <span>${joined}/${activity.capacity} 人</span>
        </div>
        <h3>${esc(activity.title)}</h3>
        <p>${esc(activity.note || "发起人还没有写备注。")}</p>
        <div class="activity-footer">
          <span>${leadPlace ? esc(leadPlace.name) : "地点待定"} · ${activityDistance(activity)}km</span>
          <div class="activity-actions">
            <button data-action="interest" data-id="${esc(activity.id)}">感兴趣</button>
            <button class="join" data-action="join" data-id="${esc(activity.id)}">报名</button>
          </div>
        </div>
      </div>
    </article>
  `;
}

function renderDiscover() {
  const featured = filteredPlaces(1)[0];
  const places = filteredPlaces(4);
  const walletActivities = state.activities.filter((activity) =>
    activity.creatorId === currentUser().id || activity.participants.some((participant) => participant.userId === currentUser().id)
  );
  const publicActivities = filteredActivities();
  const publicCount = state.activities.filter((item) => item.visibility === "公开").length;

  return `
    <section class="section ${state.activeTab === "discover" ? "active" : ""}">
      <div class="vault-hero">
        <div class="vault-kicker">
          <span>约玩票夹</span>
          <b>V3</b>
        </div>
        <h2>把每次约人，做成可投票的活动票。</h2>
        <p>${featured ? `今晚首推 ${esc(featured.place.name)} · ${esc(featured.reason)}` : "从地点、时间、朋友状态里，生成一张可以分享的活动卡。"}</p>
        <div class="hero-actions">
          <button class="primary-cta" data-tab="plan">${icons.plus} 发起活动</button>
          <button class="secondary-cta" data-tab="places">${icons.search} 浏览卡库</button>
          <button class="secondary-cta dark" data-action="install-app">${icons.spark} 安装</button>
        </div>
      </div>

      <div class="quick-stats">
        <div><strong>${state.activities.length}</strong><span>票夹</span></div>
        <div><strong>${publicCount}</strong><span>公开</span></div>
        <div><strong>${featured?.score || 0}</strong><span>推荐</span></div>
      </div>

      <div class="section-title">
        <div>
          <h2>待确认票夹</h2>
          <p>私密、公开、投票中的计划都在这里。</p>
        </div>
      </div>
      <div class="pass-stack">
        ${walletActivities.slice(0, 4).map(passCard).join("") || `<div class="empty-state">还没有自己的活动票，先创建一张。</div>`}
      </div>

      <div class="section-title">
        <div>
          <h2>公开活动广场</h2>
          <p>附近公开活动，可以报名，也可以先表达感兴趣。</p>
        </div>
      </div>

      <label class="search-shell compact">
        ${icons.search}
        <input data-filter="filters.query" value="${esc(state.filters.query)}" placeholder="搜火锅、逛街、景点、夜生活">
      </label>

      ${categoryRail(state.filters.category, "activity-category")}

      ${pillGroup(TIME_FILTERS, state.filters.time, "filters.time")}
      ${pillGroup(DISTANCE_FILTERS, state.filters.distance, "filters.distance", "active-gold")}

      <div class="stack-list">
        ${publicActivities.map((activity) => activityCard(activity)).join("") || `<div class="empty-state">这个筛选下还没有公开活动，换个时间或距离试试。</div>`}
      </div>

      <div class="section-title">
        <div>
          <h2>地点卡库</h2>
          <p>地点会变成活动卡的候选素材。</p>
        </div>
        <button data-tab="places">全部</button>
      </div>
      <div class="horizontal-strip">
        ${places.map(miniPlace).join("")}
      </div>
    </section>
  `;
}

function renderPlaces() {
  const rows = filteredPlaces();
  const isSearching = state.poi.status === "正在连接地图搜索...";
  return `
    <section class="section ${state.activeTab === "places" ? "active" : ""}">
      <div class="page-heading">
        <span class="eyebrow">地点素材</span>
        <h2>地点卡库</h2>
      </div>

      <label class="search-shell">
        ${icons.search}
        <input data-filter="placeFilters.query" value="${esc(state.placeFilters.query)}" placeholder="搜火锅、咖啡、夜景、桌游">
      </label>

      ${categoryRail(state.placeFilters.category, "place-category")}

      <div class="map-status-card">
        <div>
          <span>地图搜索</span>
          <strong>${esc(state.poi.status)}</strong>
        </div>
        <label>
          <span>搜索城市</span>
          <input data-poi="city" value="${esc(state.poi.city)}" placeholder="广州">
        </label>
      </div>

      ${pillGroup(SORTS, state.placeFilters.sort, "placeFilters.sort")}
      <div class="filter-row" style="margin-top:-8px">
        <button data-action="live-search">${icons.search} ${isSearching ? "搜索中" : "搜地图"}</button>
        <button data-action="manual-place">${icons.plus} 手动添加</button>
      </div>

      <div class="stack-list">
        ${rows.map(miniPlace).join("") || `<div class="empty-state">没有找到地点，换个关键词试试。</div>`}
      </div>
    </section>
  `;
}

function renderPlan() {
  const selectedPlaces = state.create.selectedPlaceIds.map(placeById).filter(Boolean);
  const suggestions = filteredPlaces(3);

  return `
    <section class="section ${state.activeTab === "plan" ? "active" : ""}">
      <div class="page-heading">
        <span class="eyebrow">发起邀约</span>
        <h2>创建新活动票</h2>
      </div>

      <div class="form-card">
        <div class="mint-preview">
          <span>新活动</span>
          <b>${state.create.visibility}</b>
          <strong>${esc(state.create.title || "未命名计划")}</strong>
          <em>${state.create.selectedPlaceIds.length} 个候选地点 · ${state.create.timeOptions.filter(Boolean).length} 个候选时间</em>
        </div>

        <label>
          <span>票面名称</span>
          <input data-create="title" value="${esc(state.create.title)}" placeholder="比如：周六晚饭和散步">
        </label>

        <div class="visibility-switch" role="group" aria-label="活动可见性">
          <button class="${state.create.visibility === "私密" ? "active" : ""}" data-create-visibility="私密">私密邀请</button>
          <button class="${state.create.visibility === "公开" ? "active" : ""}" data-create-visibility="公开">公开广场</button>
        </div>

        <label>
          <span>邀请名单</span>
          <input data-create="participantNames" value="${esc(state.create.participantNames)}" placeholder="阿敏, 女朋友">
        </label>

        <label>
          <span>人数上限</span>
          <input type="number" min="1" max="99" data-create="capacity" value="${esc(state.create.capacity)}">
        </label>

        <label>
          <span>卡背备注</span>
          <textarea data-create="note" placeholder="预算、集合方式、想要的氛围">${esc(state.create.note)}</textarea>
        </label>
      </div>

      <div class="section-title">
        <div>
          <h2>时间槽</h2>
          <p>朋友进来后投有空、也许、没空。</p>
        </div>
        <button data-action="add-time">${icons.plus}</button>
      </div>
      <div class="time-list">
        ${state.create.timeOptions.map((slot, index) => `
          <div class="time-edit">
            <input data-time-index="${index}" value="${esc(slot)}" placeholder="例如：周六 19:00">
            <button data-action="remove-time" data-index="${index}" aria-label="删除时间">${icons.trash}</button>
          </div>
        `).join("")}
      </div>

      <div class="section-title">
        <div>
          <h2>地点素材</h2>
          <p>从卡库里挑几张，组合成活动票。</p>
        </div>
      </div>
      <div class="selected-places">
        ${selectedPlaces.map((place) => `
          <button data-action="toggle-place" data-id="${esc(place.id)}">
            <img src="${esc(placeImage(place))}" alt="${esc(place.name)}" loading="lazy">
            <span>${esc(place.name)}</span>
          </button>
        `).join("") || `<div class="empty-state">还没有候选地点。</div>`}
      </div>

      <div class="stack-list">
        ${suggestions.map(miniPlace).join("")}
      </div>

      <button class="sticky-submit" data-action="create-activity">${icons.calendar} 创建活动票</button>
    </section>
  `;
}

function renderActivity() {
  const activity = state.activities.find((item) => item.id === state.selectedActivityId) || state.activities[0];
  if (!activity) {
    return `<section class="section ${state.activeTab === "activity" ? "active" : ""}"><div class="empty-state">还没有活动。</div></section>`;
  }

  const places = activity.placeIds.map(placeById).filter(Boolean);
  const me = activity.participants.find((participant) => participant.userId === currentUser().id);
  const best = bestTime(activity);
  const finalPlace = placeById(activity.finalPlaceId) || places[0];
  const rarity = rarityForActivity(activity, 0);

  return `
    <section class="section ${state.activeTab === "activity" ? "active" : ""}">
      <article class="detail-pass ${rarity.key}">
        <div class="detail-actions">
          <button data-action="copy" data-id="${esc(activity.id)}" aria-label="分享活动">${icons.share}</button>
        </div>
        <div class="pass-top">
          <span>当前活动</span>
          <b>${rarity.label}</b>
        </div>
        <div class="pass-art">
          <img src="${esc(activityCover(activity))}" alt="${esc(activity.title)}">
          <i>${rarity.sigil}</i>
        </div>
        <div class="detail-copy">
          <span class="eyebrow">${esc(activity.visibility)} · ${esc(activity.status)}</span>
          <h2>${esc(activity.title)}</h2>
          <p>${esc(activity.note || "没有备注。")}</p>
        </div>
      </article>

      <div class="summary-grid">
        <div><span>建议时间</span><strong>${esc(activity.finalTime || best || "待投票")}</strong></div>
        <div><span>建议地点</span><strong>${finalPlace ? esc(finalPlace.name) : "待选择"}</strong></div>
        <div><span>人数</span><strong>${activity.participants.length}/${activity.capacity}</strong></div>
      </div>

      <div class="identity-strip">
        <div>
          <span>当前投票身份</span>
          <strong>${esc(currentUser().nickname)} · ${esc(currentUser().phone || "未填手机号")}</strong>
        </div>
        <button data-action="open-profile">修改</button>
      </div>

      <div class="section-title">
        <div>
          <h2>时间投票</h2>
          <p>你的选择会实时更新统计。</p>
        </div>
      </div>
      <div class="vote-card">
        ${activity.timeOptions.map((slot) => {
          const stats = voteStats(activity, slot);
          const myVote = me?.availability?.[slot];
          return `
            <div class="vote-row">
              <div class="vote-meta">
                <strong>${esc(slot)}</strong>
                <span>有空 ${stats.yes} · 也许 ${stats.maybe} · 没空 ${stats.no}</span>
              </div>
              <div class="vote-actions">
                <button class="${myVote === "yes" ? "active yes" : ""}" data-action="vote" data-id="${esc(activity.id)}" data-slot="${esc(slot)}" data-value="yes">有空</button>
                <button class="${myVote === "maybe" ? "active maybe" : ""}" data-action="vote" data-id="${esc(activity.id)}" data-slot="${esc(slot)}" data-value="maybe">也许</button>
                <button class="${myVote === "no" ? "active no" : ""}" data-action="vote" data-id="${esc(activity.id)}" data-slot="${esc(slot)}" data-value="no">没空</button>
              </div>
            </div>
          `;
        }).join("")}
      </div>

      <div class="section-title">
        <div>
          <h2>地点素材</h2>
          <p>推荐分会考虑距离、评分、营业和偏好。</p>
        </div>
      </div>
      <div class="stack-list">
        ${places.map((place) => miniPlace(scorePlace(place), "detail")).join("")}
      </div>

      <div class="people-card">
        <div class="section-title flush">
          <div>
            <h2>参与人</h2>
            <p>${activity.participants.length} 人在这个计划里。</p>
          </div>
        </div>
        ${activity.participants.map((participant) => `
          <div class="person-row">
            <span>${esc(participant.name).slice(0, 1)}</span>
            <div>
              <strong>${esc(participant.name)}</strong>
              <p>${esc(participant.status)}</p>
            </div>
          </div>
        `).join("")}
      </div>

      <div class="detail-bottom-actions">
        <button class="secondary-cta dark" data-action="interest" data-id="${esc(activity.id)}">收藏</button>
        <button class="primary-cta" data-action="join" data-id="${esc(activity.id)}">加入这张票</button>
      </div>
      <button class="quiet-danger" data-action="report" data-id="${esc(activity.id)}">举报这个公开活动</button>
      <button class="sticky-submit" data-action="finalize" data-id="${esc(activity.id)}">${icons.spark} 封存最佳方案</button>
    </section>
  `;
}

function renderProfileSheet() {
  const user = currentUser();
  return `
    <div class="profile-backdrop ${state.ui.profileOpen ? "open" : ""}" data-action="close-profile" aria-hidden="true"></div>
    <aside class="profile-sheet ${state.ui.profileOpen ? "open" : ""}" aria-label="身份设置" aria-hidden="${state.ui.profileOpen ? "false" : "true"}">
      <div class="profile-cardmark">${esc(user.avatar)}</div>
      <div class="profile-heading">
        <span>身份信息</span>
        <h2>确认你的投票身份</h2>
        <p>朋友会看到这个名字和手机号。当前是本地演示身份，不会发送短信。</p>
      </div>
      <label>
        <span>昵称</span>
        <input data-profile="nickname" value="${esc(user.nickname)}" placeholder="你的名字">
      </label>
      <label>
        <span>手机号</span>
        <input data-profile="phone" value="${esc(user.phone)}" inputmode="tel" placeholder="手机号">
      </label>
      <div class="profile-actions">
        <button class="secondary-cta dark" data-action="switch-user">切换演示用户</button>
        <button class="primary-cta" data-action="close-profile">确认身份</button>
      </div>
      <button class="profile-reset" data-action="reset-demo">重置演示数据</button>
    </aside>
  `;
}

function renderShell() {
  const user = currentUser();
  return `
    <div class="desktop-stage">
      <div class="phone-shell">
        <header class="app-topbar">
          <div>
            <span>约出来玩</span>
            <strong>约玩票夹</strong>
          </div>
          <button class="avatar-button" data-action="open-profile" aria-label="设置身份">${esc(user.avatar)}</button>
        </header>
        <main class="app-main">
          ${renderDiscover()}
          ${renderPlaces()}
          ${renderPlan()}
          ${renderActivity()}
        </main>
        <nav class="bottom-nav" aria-label="主导航">
          ${[
            ["discover", "票夹", icons.compass],
            ["places", "卡库", icons.search],
            ["plan", "发起", icons.plus],
            ["activity", "卡面", icons.calendar]
          ].map(([tab, label, icon]) => `
            <button class="${state.activeTab === tab ? "active" : ""}" data-tab="${tab}" aria-label="${esc(label)}">
              ${icon}<span>${esc(label)}</span>
            </button>
          `).join("")}
        </nav>
        ${renderProfileSheet()}
        <div class="toast" role="status"></div>
      </div>
    </div>
  `;
}

function bindEvents() {
  document.querySelectorAll("[data-tab]").forEach((button) => {
    button.addEventListener("click", () => setTab(button.dataset.tab));
  });

  // Track IME composition globally so we don't re-render mid-input
  document.querySelectorAll("input, textarea").forEach((el) => {
    el.addEventListener("compositionstart", () => { isComposing = true; });
    el.addEventListener("compositionend", () => {
      isComposing = false;
      el.dispatchEvent(new Event("input", { bubbles: true }));
    });
  });

  document.querySelectorAll("[data-filter]").forEach((input) => {
    const eventType = input.tagName === "SELECT" ? "change" : "input";
    input.addEventListener(eventType, () => {
      if (isComposing) return;
      const [type, key] = input.dataset.filter.split(".");
      updateFilter(type, key, input.value);
    });
  });

  document.querySelectorAll("[data-pill-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      const [type, key] = button.dataset.pillFilter.split(".");
      updateFilter(type, key, button.dataset.pillValue);
    });
  });

  document.querySelectorAll("[data-create]").forEach((input) => {
    input.addEventListener("input", () => {
      if (isComposing) return;
      updateCreate(input.dataset.create, input.value);
    });
  });

  document.querySelectorAll("[data-time-index]").forEach((input) => {
    input.addEventListener("input", () => {
      if (isComposing) return;
      updateTimeOption(Number(input.dataset.timeIndex), input.value);
    });
  });

  document.querySelectorAll("[data-create-visibility]").forEach((button) => {
    button.addEventListener("click", () => updateCreate("visibility", button.dataset.createVisibility));
  });

  document.querySelectorAll("[data-profile]").forEach((input) => {
    input.addEventListener("input", () => {
      if (isComposing) return;
      updateProfile(input.dataset.profile, input.value);
    });
  });

  document.querySelectorAll("[data-poi]").forEach((input) => {
    input.addEventListener("input", () => {
      if (isComposing) return;
      updatePoi(input.dataset.poi, input.value);
    });
  });

  document.querySelectorAll("[data-action]").forEach((element) => {
    element.addEventListener("click", () => {
      const { action, id, index, slot, value } = element.dataset;
      if (action === "open-profile") setProfileOpen(true);
      if (action === "close-profile") setProfileOpen(false);
      if (action === "install-app") installApp();
      if (action === "place-category") updateFilter("placeFilters", "category", value);
      if (action === "activity-category") updateFilter("filters", "category", value);
      if (action === "live-search") searchLivePlaces();
      if (action === "manual-place") addManualPlace();
      if (action === "toggle-place") toggleCreatePlace(id);
      if (action === "quick-create") {
        state.create.selectedPlaceIds = [id];
        state.activeTab = "plan";
        saveState();
        render();
      }
      if (action === "add-time") updateCreate("timeOptions", [...state.create.timeOptions, ""]);
      if (action === "remove-time") removeTimeOption(Number(index));
      if (action === "create-activity") createActivity();
      if (action === "select-activity") selectActivity(id);
      if (action === "join") joinActivity(id, "已加入");
      if (action === "interest") joinActivity(id, "感兴趣");
      if (action === "vote") vote(id, slot, value);
      if (action === "finalize") finalizeActivity(id);
      if (action === "report") reportActivity(id);
      if (action === "copy") copyInvite(id);
      if (action === "switch-user") switchUser();
      if (action === "reset-demo") resetDemoData();
    });
  });
}

function isEditableField(element) {
  if (!element) return false;
  const tagName = element.tagName;
  return tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT";
}

function setupKeyboardAvoidance() {
  const touchViewport = window.matchMedia("(max-width: 720px) and (pointer: coarse)");
  const keyboardThreshold = 120;
  let timer = null;

  const update = () => {
    const active = document.activeElement;
    const viewportShrunk = window.visualViewport
      ? window.innerHeight - window.visualViewport.height > keyboardThreshold
      : false;
    document.body.classList.toggle("keyboard-open", isEditableField(active) && (touchViewport.matches || viewportShrunk));
  };

  const scheduleUpdate = () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(update, 80);
  };

  document.addEventListener("focusin", scheduleUpdate, true);
  document.addEventListener("focusout", scheduleUpdate, true);
  window.addEventListener("orientationchange", scheduleUpdate);
  touchViewport.addEventListener?.("change", scheduleUpdate);
  window.visualViewport?.addEventListener("resize", scheduleUpdate);
  window.visualViewport?.addEventListener("scroll", scheduleUpdate);
}

function focusKey(el) {
  if (!el || el === document.body) return null;
  for (const attr of ["data-filter", "data-create", "data-profile", "data-poi", "data-time-index"]) {
    const val = el.getAttribute(attr);
    if (val != null) return { attr, val };
  }
  return null;
}

function render() {
  const prev = document.activeElement;
  const key = focusKey(prev);
  const cursorStart = prev?.selectionStart;
  const cursorEnd = prev?.selectionEnd;

  document.querySelector("#app").innerHTML = renderShell();
  bindEvents();
  hasRendered = true;

  if (key) {
    const next = document.querySelector(`[${key.attr}="${key.val}"]`);
    if (next) {
      next.focus();
      if (typeof cursorStart === "number") {
        try { next.setSelectionRange(cursorStart, cursorEnd); } catch {}
      }
    }
  }
}

render();
flushStartupMessage();

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  state.ui.canInstall = true;
  saveState();
  renderIfReady();
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      console.info("Service worker registration skipped in this environment.");
    });
  });
}
