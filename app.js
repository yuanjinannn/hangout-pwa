const ALL = "全部";
const CATEGORIES = [ALL, "吃饭", "咖啡甜品", "逛街", "景点", "游乐设施", "室内玩乐", "夜生活"];
const SORTS = ["推荐", "距离", "评分", "人均价"];
const TIME_FILTERS = [ALL, "今天", "明天", "周末", "晚上"];
const DISTANCE_FILTERS = [ALL, "1km", "3km", "5km"];
const STORAGE_KEY = "hangout-pwa-state-v3";

const icons = {
  compass: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="12" cy="12" r="9"/><path d="m15.6 8.4-2.2 5-5 2.2 2.2-5 5-2.2Z"/></svg>`,
  search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.8-3.8"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M12 5v14"/><path d="M5 12h14"/></svg>`,
  calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M8 3v3"/><path d="M16 3v3"/><rect x="4" y="5" width="16" height="16" rx="4"/><path d="M4 10h16"/></svg>`,
  map: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M9 18 4 20V6l5-2 6 2 5-2v14l-5 2-6-2Z"/><path d="M9 4v14"/><path d="M15 6v14"/></svg>`,
  users: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M16 18.5c0-2.2-1.8-4-4-4H7c-2.2 0-4 1.8-4 4"/><circle cx="9.5" cy="8" r="3.5"/><path d="M21 18.5c0-1.8-1.1-3.2-2.7-3.8"/><path d="M16.8 4.5a3.4 3.4 0 0 1 0 6.5"/></svg>`,
  spark: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M12 3l1.7 5.1L19 10l-5.3 1.9L12 17l-1.7-5.1L5 10l5.3-1.9L12 3Z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z"/></svg>`,
  share: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M8 12h8"/><path d="M13 7l5 5-5 5"/><path d="M4 5v14"/></svg>`,
  trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M4 6h16"/><path d="M9 6V4h6v2"/><path d="m18 6-.8 14H6.8L6 6"/></svg>`
};

const placeImages = {
  p1: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=900&q=80",
  p2: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80",
  p3: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=80",
  p4: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
  p5: "https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?auto=format&fit=crop&w=900&q=80",
  p6: "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=900&q=80",
  p7: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=80",
  p8: "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=900&q=80"
};

const seedUsers = [
  { id: "u1", nickname: "小林", phone: "00000000001", avatar: "林", city: "广州", favoritePlaceIds: ["p2", "p6"] },
  { id: "u2", nickname: "阿敏", phone: "00000000002", avatar: "敏", city: "广州", favoritePlaceIds: ["p1"] },
  { id: "u3", nickname: "橙子", phone: "00000000003", avatar: "橙", city: "广州", favoritePlaceIds: ["p6"] },
  { id: "u4", nickname: "演示朋友", phone: "00000000004", avatar: "友", city: "广州", favoritePlaceIds: ["p2", "p4"] }
];

const seedPlaces = [
  { id: "p1", name: "城中里火锅研究所", address: "天河路 88 号 3F", source: "mock-gaode", category: "吃饭", rating: 4.7, avgPrice: 128, open: true, distance: 1.2, tags: ["热闹", "晚餐", "多人"] },
  { id: "p2", name: "月台咖啡甜品", address: "体育西路 26 号", source: "mock-gaode", category: "咖啡甜品", rating: 4.6, avgPrice: 52, open: true, distance: 0.7, tags: ["约会", "拍照", "下午茶"] },
  { id: "p3", name: "万象天地步行街", address: "深南大道 9668 号", source: "mock-gaode", category: "逛街", rating: 4.8, avgPrice: 90, open: true, distance: 4.1, tags: ["逛街", "餐饮多", "地铁近"] },
  { id: "p4", name: "云顶观景台", address: "珠江新城观光层", source: "mock-gaode", category: "景点", rating: 4.5, avgPrice: 68, open: true, distance: 2.8, tags: ["夜景", "拍照", "散步"] },
  { id: "p5", name: "星河游乐中心", address: "青年路 9 号", source: "mock-gaode", category: "游乐设施", rating: 4.4, avgPrice: 158, open: false, distance: 3.5, tags: ["刺激", "周末", "多人"] },
  { id: "p6", name: "北巷桌游与 Switch", address: "建设六马路 12 号 2F", source: "manual", category: "室内玩乐", rating: 4.9, avgPrice: 76, open: true, distance: 1.8, tags: ["下雨可去", "桌游", "包间"] },
  { id: "p7", name: "江边小酌 Live House", address: "沿江东路 118 号", source: "mock-gaode", category: "夜生活", rating: 4.3, avgPrice: 138, open: true, distance: 2.2, tags: ["音乐", "夜晚", "朋友"] },
  { id: "p8", name: "南园早茶馆", address: "文明路 103 号", source: "manual", category: "吃饭", rating: 4.6, avgPrice: 82, open: true, distance: 1.4, tags: ["早茶", "本地味", "舒服"] }
];

const seedActivities = [
  {
    id: "a1",
    title: "周六火锅和江边散步",
    creatorId: "u1",
    visibility: "公开",
    status: "招募中",
    timeOptions: ["5月4日 周一 18:30", "5月5日 周二 19:00", "5月6日 周三 20:00"],
    placeIds: ["p1", "p7"],
    finalTime: "",
    finalPlaceId: "",
    capacity: 6,
    note: "先吃饭，再去江边吹风。晚点到也可以直接来第二站。",
    participants: [
      { userId: "u1", name: "小林", status: "已加入", availability: { "5月4日 周一 18:30": "yes", "5月5日 周二 19:00": "maybe" }, note: "" },
      { userId: "u2", name: "阿敏", status: "感兴趣", availability: { "5月4日 周一 18:30": "yes", "5月6日 周三 20:00": "yes" }, note: "更想周一" }
    ],
    reports: 0,
    createdAt: Date.now() - 7200000
  },
  {
    id: "a2",
    title: "下雨天室内桌游",
    creatorId: "u3",
    visibility: "公开",
    status: "招募中",
    timeOptions: ["5月3日 周日 14:00", "5月3日 周日 19:00"],
    placeIds: ["p6", "p2"],
    finalTime: "",
    finalPlaceId: "",
    capacity: 4,
    note: "轻策略和派对游戏，不会也能玩。",
    participants: [
      { userId: "u3", name: "橙子", status: "已加入", availability: { "5月3日 周日 14:00": "yes" }, note: "" }
    ],
    reports: 0,
    createdAt: Date.now() - 3600000
  },
  {
    id: "a3",
    title: "甜品、夜景、慢慢走",
    creatorId: "u1",
    visibility: "私密",
    status: "待确认",
    timeOptions: ["5月2日 周六 18:00", "5月2日 周六 19:30"],
    placeIds: ["p2", "p4"],
    finalTime: "",
    finalPlaceId: "",
    capacity: 2,
    note: "适合两个人的轻松晚上。",
    participants: [
      { userId: "u1", name: "小林", status: "已加入", availability: { "5月2日 周六 18:00": "yes" }, note: "" },
      { userId: "u4", name: "女朋友", status: "待确认", availability: {}, note: "" }
    ],
    reports: 0,
    createdAt: Date.now() - 1800000
  }
];

const defaultState = {
  activeTab: "discover",
  selectedActivityId: "a1",
  ui: { profileOpen: false, canInstall: false },
  filters: { query: "", category: ALL, time: ALL, distance: ALL },
  placeFilters: { query: "", category: ALL, sort: "推荐" },
  poi: { provider: "amap", city: "广州", status: "本地推荐已就绪，可搜地图导入", lastImported: 0 },
  create: {
    title: "",
    visibility: "私密",
    timeOptions: ["今天 19:00", "明天 14:00"],
    participantNames: "阿敏, 女朋友",
    selectedPlaceIds: ["p2"],
    capacity: 4,
    note: ""
  },
  currentUserId: "u1",
  users: seedUsers,
  places: seedPlaces,
  activities: seedActivities
};

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

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function placeRating(place) {
  return toNumber(place?.rating, 4.2);
}

function placePrice(place) {
  return Math.round(toNumber(place?.avgPrice, 80));
}

function placeDistance(place) {
  return toNumber(place?.distance, 9.9);
}

function placeTags(place) {
  return Array.isArray(place?.tags) ? place.tags : [];
}

function confirmedCount(activity) {
  return activity.participants.filter((participant) => participant.status === "已加入").length;
}

function activityDistance(activity) {
  const distances = activity.placeIds.map((id) => placeDistance(placeById(id))).filter(Number.isFinite);
  return distances.length ? Math.min(...distances) : 9.9;
}

function matchesTimeFilter(activity, filter) {
  if (filter === ALL) return true;
  return activity.timeOptions.some((slot) => {
    if (filter === "周末") return /周六|周日|周末/.test(slot);
    if (filter === "晚上") return /晚上|晚|18|19|20|21|22/.test(slot);
    return slot.includes(filter);
  });
}

function distanceLimit(filter) {
  if (filter === ALL) return Infinity;
  return Number.parseFloat(filter);
}

function inferCategory(text = "") {
  if (/咖啡|甜品|茶|蛋糕|饮品/.test(text)) return "咖啡甜品";
  if (/商场|购物|步行街|百货|天地|广场/.test(text)) return "逛街";
  if (/景区|公园|观景|博物馆|展览|塔|山|江|湖/.test(text)) return "景点";
  if (/游乐|乐园|电玩城|密室|剧本|轰趴/.test(text)) return "游乐设施";
  if (/桌游|Switch|KTV|影院|室内|运动|保龄|台球/.test(text)) return "室内玩乐";
  if (/酒吧|Live|夜店|小酌|音乐/.test(text)) return "夜生活";
  return "吃饭";
}

function scorePlace(place, selectedCategory = state.placeFilters.category) {
  const user = currentUser();
  const rating = placeRating(place);
  const price = placePrice(place);
  const distance = placeDistance(place);
  let score = 0;
  const reasons = [];

  if (selectedCategory !== ALL && place.category === selectedCategory) {
    score += 26;
    reasons.push("分类匹配");
  }
  if (place.open) {
    score += 22;
    reasons.push("营业中");
  }
  if (rating >= 4.6) {
    score += 20;
    reasons.push("高评分");
  } else {
    score += Math.round(rating * 3);
  }
  if (distance <= 2) {
    score += 16;
    reasons.push("很近");
  } else if (distance <= 4) {
    score += 8;
  }
  if (price <= 100) {
    score += 8;
    reasons.push("价格友好");
  }
  if (user.favoritePlaceIds?.includes(place.id)) {
    score += 18;
    reasons.push("你的偏好");
  }

  return { place, score, reason: reasons.slice(0, 2).join(" / ") || "综合推荐" };
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

function voteStats(activity, slot) {
  const totals = { yes: 0, maybe: 0, no: 0 };
  activity.participants.forEach((participant) => {
    const value = participant.availability?.[slot];
    if (value) totals[value] += 1;
  });
  return totals;
}

function bestTime(activity) {
  return [...activity.timeOptions].sort((a, b) => {
    const aStats = voteStats(activity, a);
    const bStats = voteStats(activity, b);
    return bStats.yes - aStats.yes || bStats.maybe - aStats.maybe;
  })[0];
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
        <h2>把每次约人，做成一张可投票的活动票。</h2>
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
