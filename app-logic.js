import { ALL } from "./app-data.js";

export function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function placeRating(place) {
  return toNumber(place?.rating, 4.2);
}

export function placePrice(place) {
  return Math.round(toNumber(place?.avgPrice, 80));
}

export function placeDistance(place) {
  return toNumber(place?.distance, 9.9);
}

export function placeTags(place) {
  return Array.isArray(place?.tags) ? place.tags : [];
}

export function confirmedCount(activity) {
  return activity.participants.filter((participant) => participant.status === "已加入").length;
}

export function matchesTimeFilter(activity, filter) {
  if (filter === ALL) return true;
  return activity.timeOptions.some((slot) => {
    if (filter === "周末") return /周六|周日|周末/.test(slot);
    if (filter === "晚上") return /晚上|晚|18|19|20|21|22/.test(slot);
    return slot.includes(filter);
  });
}

export function distanceLimit(filter) {
  if (filter === ALL) return Infinity;
  return Number.parseFloat(filter);
}

export function inferCategory(text = "") {
  if (/咖啡|甜品|茶|蛋糕|饮品/.test(text)) return "咖啡甜品";
  if (/商场|购物|步行街|百货|天地|广场/.test(text)) return "逛街";
  if (/景区|公园|观景|博物馆|展览|塔|山|江|湖/.test(text)) return "景点";
  if (/游乐|乐园|电玩城|密室|剧本|轰趴/.test(text)) return "游乐设施";
  if (/桌游|Switch|KTV|影院|室内|运动|保龄|台球/.test(text)) return "室内玩乐";
  if (/酒吧|Live|夜店|小酌|音乐/.test(text)) return "夜生活";
  return "吃饭";
}

export function scorePlace(place, selectedCategory = ALL, user = null) {
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
  if (user?.favoritePlaceIds?.includes(place.id)) {
    score += 18;
    reasons.push("你的偏好");
  }

  return { place, score, reason: reasons.slice(0, 2).join(" / ") || "综合推荐" };
}

export function voteStats(activity, slot) {
  const totals = { yes: 0, maybe: 0, no: 0 };
  activity.participants.forEach((participant) => {
    const value = participant.availability?.[slot];
    if (value) totals[value] += 1;
  });
  return totals;
}

export function bestTime(activity) {
  return [...activity.timeOptions].sort((a, b) => {
    const aStats = voteStats(activity, a);
    const bStats = voteStats(activity, b);
    return bStats.yes - aStats.yes || bStats.maybe - aStats.maybe;
  })[0];
}
