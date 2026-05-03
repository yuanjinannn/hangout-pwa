# Cloudflare Pages 部署说明

## 推荐方式：连接 Git 仓库

1. 把当前仓库推到 GitHub。
2. 打开 Cloudflare Dashboard。
3. 进入 Workers & Pages。
4. 选择 Pages -> Connect to Git。
5. 选择这个仓库。
6. Framework preset 选择 None。
7. Build command 填：

```text
npm run build:pages
```

8. Build output directory 填：

```text
dist
```

9. 保存并部署。

## 免费部署范围

当前版本是静态 PWA，部署到 Cloudflare Pages 免费计划即可。

项目包含 Cloudflare Pages Function：`functions/api/places.js`。未配置 `AMAP_KEY` 时，地点卡库会自动使用本地推荐和手动添加地点。

## 启用真实地图搜索

公开部署不要把 `AMAP_KEY` 放进前端代码。请在 Cloudflare Pages 项目设置里添加环境变量：

```text
变量名：AMAP_KEY
变量值：你的高德 Web 服务 Key
环境：Production
```

Function 会从 Cloudflare 的环境变量读取 Key，再向高德 Web 服务请求地点数据，并返回前端需要的 `{ provider, places }` 数据结构。
