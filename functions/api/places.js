function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json;charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

function categoryFromText(text = "") {
  if (/咖啡|甜品|茶|蛋糕|饮品/.test(text)) return "咖啡甜品";
  if (/商场|购物|步行街|百货|天地|广场/.test(text)) return "逛街";
  if (/景区|公园|观景|博物馆|展览|塔|山|江|湖/.test(text)) return "景点";
  if (/游乐|乐园|电玩城|密室|剧本|轰趴/.test(text)) return "游乐设施";
  if (/桌游|Switch|KTV|影院|室内|运动|保龄|台球/.test(text)) return "室内玩乐";
  if (/酒吧|Live|夜店|小酌|音乐/.test(text)) return "夜生活";
  return "吃饭";
}

function number(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeAmapPoi(poi, index) {
  const biz = poi.biz_ext && typeof poi.biz_ext === "object" ? poi.biz_ext : {};
  const tags = [poi.type, poi.tag, poi.business_area].filter(Boolean);
  const photo = Array.isArray(poi.photos) && poi.photos[0]?.url ? poi.photos[0].url : "";

  return {
    id: `amap-${poi.id || index}`,
    name: poi.name || "未命名地点",
    address: [poi.adname, poi.address].filter(Boolean).join(" · ") || "地址待补充",
    source: "amap",
    category: categoryFromText([poi.type, poi.tag, poi.name].filter(Boolean).join(" ")),
    rating: number(biz.rating, 4.3),
    avgPrice: Math.round(number(biz.cost, 80)),
    open: true,
    distance: Number((0.7 + index * 0.35).toFixed(1)),
    tags: tags.length ? tags.slice(0, 3) : ["高德搜索"],
    image: photo,
    location: poi.location || ""
  };
}

export async function onRequestGet({ request, env }) {
  const requestUrl = new URL(request.url);
  const key = env.AMAP_KEY;
  const query = requestUrl.searchParams.get("q")?.trim();
  const category = requestUrl.searchParams.get("category")?.trim();
  const city = requestUrl.searchParams.get("city")?.trim() || "广州";

  if (!query && !category) {
    return json(400, { places: [], message: "请输入地点关键词" });
  }

  if (!key) {
    return json(503, {
      places: [],
      message: "未配置 AMAP_KEY，正在使用本地推荐"
    });
  }

  const upstream = new URL("https://restapi.amap.com/v3/place/text");
  upstream.searchParams.set("key", key);
  upstream.searchParams.set("keywords", [query, category].filter(Boolean).join("|"));
  upstream.searchParams.set("city", city);
  upstream.searchParams.set("citylimit", "true");
  upstream.searchParams.set("children", "1");
  upstream.searchParams.set("offset", "12");
  upstream.searchParams.set("page", "1");
  upstream.searchParams.set("extensions", "all");
  upstream.searchParams.set("output", "JSON");

  try {
    const apiResponse = await fetch(upstream);
    const data = await apiResponse.json();

    if (data.status !== "1") {
      return json(502, { places: [], message: data.info || "高德搜索失败" });
    }

    return json(200, {
      provider: "amap",
      places: (data.pois || []).slice(0, 12).map(normalizeAmapPoi)
    });
  } catch {
    return json(502, { places: [], message: "地图服务连接失败" });
  }
}
