forked from https://github.com/crazypeace/Url-Shorten-Worker

# Url Shorten Worker for Cloudflare Pages

这是一个 Cloudflare Pages 一体化短链项目。静态管理页、API、短链跳转都由同一个 Pages 项目提供，不需要再单独部署 Cloudflare Worker，也不依赖 GitHub Pages、jsDelivr、Bootstrap 或 jQuery。

## 项目结构

- `pages/`：静态 404 页面
- `functions/api.js`：Pages Functions API，负责新增、删除、查询短链
- `functions/[key].js`：Pages Functions 跳转逻辑，负责 `/:key` 短链跳转；当路径等于管理密码时返回管理页

## 部署

在 Cloudflare Pages 绑定本仓库时使用以下配置：

- Framework preset: `None`
- Build command: 留空
- Build output directory: `pages`

在 Pages 项目的 Settings 中绑定 KV：

- Binding name: `LINKS`
- KV namespace: 选择你的短链 KV namespace
- Production 和 Preview 环境都需要按需绑定；如果只使用正式域名，至少确认 Production 已绑定

密码有两种设置方式，任选一种：

- 推荐：在 Pages 环境变量里设置 `USW_PASSWORD`
- 兼容旧方案：在 KV 里设置 key 为 `password` 的记录
- 如果使用环境变量，Production 和 Preview 环境变量是分开的，需要分别设置

部署完成后，直接访问 Pages 根域名会返回 404。只有访问密码路径才会显示管理页，例如：

```text
https://your-project.pages.dev/your-password
```

短链格式为：

```text
https://your-project.pages.dev/abc123
```

## 数据保存方式

短链数据保存在绑定名为 `LINKS` 的 Cloudflare KV namespace 中：

- `abc123` -> `https://example.com/long-url`
- `my-link` -> `https://example.org/page`

如果使用 KV 保存密码，会保存：

- `password` -> `你的管理密码`

`password` 不会出现在管理页的全量加载结果里，也不能通过 API 查询、删除或覆盖。

新建短链时，key 只允许 1 到 64 位的字母、数字、下划线和连字符，例如 `my-link`、`blog_2026`。`api` 和 `password` 是保留 key，不能用作短链。

为了兼容旧 KV 数据，查询、删除、全量加载和跳转不会用新建短链规则过滤历史 key，除 `api` 和 `password` 外都会尝试读取。

## 配置说明

`functions/api.js` 中的 `custom_link` 控制是否允许自定义短链 key。

`functions/api.js` 中的 `load_kv` 控制管理页是否可以一次性加载 KV 中的全部短链记录。

## Cloudflare 建议设置

- Pages 重新部署时，如果遇到旧页面残留，使用 `Redeploy` 并勾选 `Clear build cache`
- 自定义域名只绑定到当前 Pages 项目，避免同时指向旧 Worker 或旧 Pages 项目
- 不建议给管理密码路径和 `/api` 配置缓存规则
- 如果要降低短链请求数，可以在前置 CDN 缓存 3xx 响应，但删除或修改短链后可能不会立即生效
- 如果不需要 Cloudflare Web Analytics 或其他额外观测功能，可以关闭以减少额外事件
