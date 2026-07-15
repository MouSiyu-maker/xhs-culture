# 文化种草机 v3

这是一个 C 端 AI Agent 文化种草原型，包含「种草」「探画」「体验」「我的」等页面与交互。项目为纯静态前端，可以直接在浏览器打开，也可以用本地静态服务运行。

## 项目内容

```text
cultural-seeder-v3/
├── index.html          # 页面入口
├── app.js              # 页面交互逻辑
├── model.js            # 内容数据与状态模型
├── styles.css          # 页面样式
├── assets/             # 图片与视觉素材
├── tests/              # Node 内置测试
├── package.json        # 测试脚本
└── README.md
```

## 本地打开

最简单方式：

1. 下载项目后进入 `cultural-seeder-v3` 文件夹。
2. 双击 `index.html`，用浏览器打开。

推荐方式：

```bash
cd cultural-seeder-v3
python3 -m http.server 5173
```

然后在浏览器打开：

```text
http://127.0.0.1:5173
```

## 运行测试

本项目没有第三方依赖，测试使用 Node.js 内置能力。建议使用 Node.js 18 或更高版本。

```bash
cd cultural-seeder-v3
npm test
```

## 上传 GitHub

如果这是第一次上传到新仓库，可以在项目目录中执行：

```bash
git init
git add .
git commit -m "Archive cultural seeder prototype"
git branch -M main
git remote add origin <你的 GitHub 仓库地址>
git push -u origin main
```

注意：`assets/` 中包含完整图片素材，上传时请保留该目录。当前项目没有超过 GitHub 单文件 100MB 限制的资源。

## 版本说明

此归档版本来自本地当前可运行稿，已包含最近一版页面样式、交互逻辑、图片素材和测试文件。
