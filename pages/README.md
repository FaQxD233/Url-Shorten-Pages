# Cloudflare Pages 一体化部署说明

`pages/index.html` 是自包含的管理页。配合仓库根目录的 `functions/`，可以只部署一个 Cloudflare Pages 项目，同时提供管理页、API 和短链跳转。

## 部署

在 Cloudflare Pages 绑定本仓库时使用：

- Framework preset: `None`
- Build command: 留空
- Build output directory: `pages`

部署完成后会得到一个 `*.pages.dev` 域名。

## KV 和密码

在 Pages 项目的 Settings 中绑定 KV：

- Binding name: `LINKS`
- KV namespace: 选择你的短链 KV namespace

密码有两种设置方式，任选一种：

- 在 Pages 环境变量里设置 `USW_PASSWORD`
- 或在 KV 里设置 key 为 `password` 的记录

部署完成后，直接访问 Pages 域名即可使用，短链格式为 `https://your-project.pages.dev/abc123`。
