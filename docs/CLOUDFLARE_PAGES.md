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

未配置后端函数时，`/api/places` 不存在，地点卡库会自动使用本地推荐和手动添加地点。

## 启用真实地图搜索

公开部署不要把 `AMAP_KEY` 放进前端代码。后续做法：

1. 添加 Cloudflare Pages Function：`functions/api/places.js`。
2. 在 Cloudflare Pages 项目的 Environment variables 中配置 `AMAP_KEY`。
3. 在 Function 里请求高德 Web 服务，并返回现有前端需要的 `{ provider, places }` 数据结构。
