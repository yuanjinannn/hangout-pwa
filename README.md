# 约出来玩 PWA

移动端优先的约朋友出来玩原型：找地点、创建活动票、私密分享、公开广场、报名/感兴趣、时间投票、最终确认。

当前仓库里的用户、手机号、活动和地点都是演示数据。

## 启动

在 PowerShell 里进入项目目录后运行：

```powershell
.\start-pwa.cmd
```

然后打开：

```text
http://127.0.0.1:4173
```

这套启动方式不依赖本机安装 Node。

## 地图搜索

默认会使用本地模拟地点和规则推荐，地点卡库可以直接搜索/筛选。

如果要启用高德 POI 搜索，先在同一个 PowerShell 窗口设置 Web 服务 API Key：

```powershell
$env:AMAP_KEY="你的高德Web服务Key"
.\start-pwa.cmd
```

启动后进入“卡库”，输入关键词，点“搜地图”。没有配置 Key 时，应用会继续使用本地推荐和手动添加地点。

不要把真实 `AMAP_KEY` 提交到仓库。公开部署时应把 Key 放在服务器环境变量或部署平台的密钥配置里。

## 当前范围

- 活动不区分类型，只区分私密/公开。
- 私密活动通过邀请链接导入，朋友打开后确认身份并投票。
- 公开活动在广场里按分类、时间、距离筛选。
- 地点推荐按分类、营业状态、评分、距离、人均价和收藏偏好计算。
- 举报 3 次后活动会进入待审核状态，不再出现在公开广场。
- PWA 支持安装入口和基础离线缓存。

## 项目文档

- [下一阶段工作清单](./docs/NEXT_STEPS.md)
- [QA 冒烟测试清单](./docs/QA_CHECKLIST.md)
- [版本说明](./docs/RELEASE_NOTES.md)
- [公开发布检查清单](./docs/PUBLISHING.md)

## 自动化冒烟测试

在 PowerShell 里运行：

```powershell
.\scripts\smoke-ui.cmd
```

脚本会启动本地 PWA 服务，并用 Edge/Chrome 跑一遍主流程：地图搜索或本地兜底、创建活动、投票、确认方案、举报审核、重置演示数据和 PWA 缓存检查。

如果你是从公开仓库 clone 下来的开发者，可以先安装测试依赖：

```powershell
npm install
npm run smoke
```

## Cloudflare Pages

构建公开静态站点：

```powershell
npm run build:pages
```

Cloudflare Pages 构建设置：

- Build command: `npm run build:pages`
- Build output directory: `dist`

静态部署默认不包含 `/api/places` 后端，地图搜索会自动回到本地推荐。后续如果要启用真实 POI 搜索，可以再加 Cloudflare Pages Functions，并把 `AMAP_KEY` 放在 Cloudflare 环境变量里。
