export const ALL = "全部";
export const CATEGORIES = [ALL, "吃饭", "咖啡甜品", "逛街", "景点", "游乐设施", "室内玩乐", "夜生活"];
export const SORTS = ["推荐", "距离", "评分", "人均价"];
export const TIME_FILTERS = [ALL, "今天", "明天", "周末", "晚上"];
export const DISTANCE_FILTERS = [ALL, "1km", "3km", "5km"];
export const STORAGE_KEY = "hangout-pwa-state-v3";

export const icons = {
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

export const placeImages = {
  p1: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=900&q=80",
  p2: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80",
  p3: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=80",
  p4: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
  p5: "https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?auto=format&fit=crop&w=900&q=80",
  p6: "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=900&q=80",
  p7: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=80",
  p8: "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=900&q=80"
};

export const seedUsers = [
  { id: "u1", nickname: "小林", phone: "00000000001", avatar: "林", city: "广州", favoritePlaceIds: ["p2", "p6"] },
  { id: "u2", nickname: "阿敏", phone: "00000000002", avatar: "敏", city: "广州", favoritePlaceIds: ["p1"] },
  { id: "u3", nickname: "橙子", phone: "00000000003", avatar: "橙", city: "广州", favoritePlaceIds: ["p6"] },
  { id: "u4", nickname: "演示朋友", phone: "00000000004", avatar: "友", city: "广州", favoritePlaceIds: ["p2", "p4"] }
];

export const seedPlaces = [
  { id: "p1", name: "城中里火锅研究所", address: "天河路 88 号 3F", source: "mock-gaode", category: "吃饭", rating: 4.7, avgPrice: 128, open: true, distance: 1.2, tags: ["热闹", "晚餐", "多人"] },
  { id: "p2", name: "月台咖啡甜品", address: "体育西路 26 号", source: "mock-gaode", category: "咖啡甜品", rating: 4.6, avgPrice: 52, open: true, distance: 0.7, tags: ["约会", "拍照", "下午茶"] },
  { id: "p3", name: "万象天地步行街", address: "深南大道 9668 号", source: "mock-gaode", category: "逛街", rating: 4.8, avgPrice: 90, open: true, distance: 4.1, tags: ["逛街", "餐饮多", "地铁近"] },
  { id: "p4", name: "云顶观景台", address: "珠江新城观光层", source: "mock-gaode", category: "景点", rating: 4.5, avgPrice: 68, open: true, distance: 2.8, tags: ["夜景", "拍照", "散步"] },
  { id: "p5", name: "星河游乐中心", address: "青年路 9 号", source: "mock-gaode", category: "游乐设施", rating: 4.4, avgPrice: 158, open: false, distance: 3.5, tags: ["刺激", "周末", "多人"] },
  { id: "p6", name: "北巷桌游与 Switch", address: "建设六马路 12 号 2F", source: "manual", category: "室内玩乐", rating: 4.9, avgPrice: 76, open: true, distance: 1.8, tags: ["下雨可去", "桌游", "包间"] },
  { id: "p7", name: "江边小酌 Live House", address: "沿江东路 118 号", source: "mock-gaode", category: "夜生活", rating: 4.3, avgPrice: 138, open: true, distance: 2.2, tags: ["音乐", "夜晚", "朋友"] },
  { id: "p8", name: "南园早茶馆", address: "文明路 103 号", source: "manual", category: "吃饭", rating: 4.6, avgPrice: 82, open: true, distance: 1.4, tags: ["早茶", "本地味", "舒服"] }
];

export const seedActivities = [
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

export const defaultState = {
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
