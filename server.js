const http = require("http");
const fs = require("fs");
const path = require("path");

const root = process.cwd();
const port = Number(process.env.PORT) || 4173;
const types = {
  ".html": "text/html;charset=utf-8",
  ".js": "text/javascript;charset=utf-8",
  ".css": "text/css;charset=utf-8",
  ".svg": "image/svg+xml",
  ".webmanifest": "application/manifest+json;charset=utf-8",
  ".png": "image/png"
};

function sendJson(response, status, body) {
  response.writeHead(status, {
    "Content-Type": "application/json;charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(JSON.stringify(body));
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

async function handlePlaces(requestUrl, response) {
  const key = process.env.AMAP_KEY;
  const query = requestUrl.searchParams.get("q")?.trim();
  const category = requestUrl.searchParams.get("category")?.trim();
  const city = requestUrl.searchParams.get("city")?.trim() || "广州";

  if (!query && !category) {
    sendJson(response, 400, { places: [], message: "请输入地点关键词" });
    return;
  }

  if (!key) {
    sendJson(response, 503, {
      places: [],
      message: "未配置 AMAP_KEY，正在使用本地推荐"
    });
    return;
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
      sendJson(response, 502, { places: [], message: data.info || "高德搜索失败" });
      return;
    }

    sendJson(response, 200, {
      provider: "amap",
      places: (data.pois || []).slice(0, 12).map(normalizeAmapPoi)
    });
  } catch {
    sendJson(response, 502, { places: [], message: "地图服务连接失败" });
  }
}

const server = http.createServer((request, response) => {
  const requestUrl = new URL(request.url, `http://${request.headers.host || "127.0.0.1"}`);
  if (request.method === "GET" && requestUrl.pathname === "/api/places") {
    handlePlaces(requestUrl, response);
    return;
  }

  let pathname = decodeURIComponent(requestUrl.pathname);
  if (pathname === "/") pathname = "/index.html";

  const file = path.resolve(root, `.${pathname}`);
  if (!file.startsWith(root)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(file, (error, data) => {
    if (error) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "Content-Type": types[path.extname(file)] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    response.end(data);
  });
});

server.listen(port, "127.0.0.1", () => {
  console.log(`约出来玩 PWA: http://127.0.0.1:${port}`);
  console.log("可选：先设置 AMAP_KEY，再点地点卡库里的“搜地图”。");
});
