# dsh-custom-logo

让 [DeepSeek Harness](https://github.com/deepseek-ai) (dsh) 用上你自己的品牌标识:上传两张图,自动替换网页标签图标和侧边栏 Logo。免切图、免命令行、改完即生效。

[English](./README_EN.md) | 简体中文

## 你能看到什么

| 替换位置 | 用哪张图 | 效果 |
|---|---|---|
| 浏览器标签页 / 收藏夹图标 | 方形图 | favicon 变成你的图标 |
| 侧边栏顶部品牌区(展开态) | 横向宽图 | 替换 DeepSeek Harness 文字标 |
| 侧边栏窄栏图标(折叠态) | 方形图 | 替换小鱼图标 |

安装后侧边栏底部会多一个「品牌」按钮,点开面板:

- **网页图标**:选一张方形图(任意尺寸 PNG/JPG/WebP),浏览器端自动居中裁切、缩放为标准 PNG
- **侧边栏 Logo**:选一张横向宽图(建议约 3:1),自动等比缩放,侧边栏内以 42px 高度显示
- **恢复默认**:一键删掉自定义图,回到 dsh 原生标识

上传后页面自动刷新生效,不需要重启服务,也不需要手动准备任何尺寸的切图。

## 安装

### 方式一:从 npm 安装(推荐)

```bash
dsh plugin --profile web add dsh-custom-logo
```

### 方式二:直接从 GitHub 添加

```bash
dsh plugin --profile web add github:dawsondx/dsh-custom-logo
```

### 方式三:clone 后安装(审阅源码 / 参与贡献)

```bash
git clone https://github.com/dawsondx/dsh-custom-logo.git
dsh plugin --profile web add ./dsh-custom-logo
```

安装后重启 dsh(`dsh start --profile web` 或你的启动脚本),侧边栏底部即出现「品牌」按钮。

## 使用

1. 点击侧边栏底部「品牌」按钮
2. 「网页图标」卡片 → 选择图片 → 自动处理并刷新
3. 「侧边栏 Logo」卡片 → 选择图片 → 自动处理并刷新
4. 不满意随时重传;想回原版点「恢复默认」

两个卡片的当前图会以缩略图预览;面板同时支持中英文(跟随 dsh 界面语言)。

## 工作原理

- 客户端把选中的图片用 canvas 缩放为标准 PNG(方形 256×256 居中裁切;宽图 ≤1080×126 等比),POST 到本机 dsh 服务
- 服务端写入 `<DSH_HOME>/branding/`(`logo-128.png` / `logo-64.png` / `logo-wide.png`),原子落盘
- 每次 index 请求时动态注入:favicon `<link>` 重写 + CSS 隐藏原生 SVG(按稳定的 `viewBox` 属性匹配,不受构建哈希/类名顺序影响)、以背景图绘制自定义 Logo,URL 带 `?v=<mtime>` 自动破缓存
- 图片文件保存在 dsh 用户目录而非插件包内,插件升级不丢品牌图;dsh 升级也不覆盖本插件(patch 层挂载在用户 profile)

## 安全性

- 上传/重置接口仅接受 **loopback 来源**(校验 peer socket 地址,非可伪造的 Host 头),局域网访问者无法改你的品牌图
- 仅接受 PNG(魔数校验),单次上传上限 8MB,文件名白名单,不接受任意路径写入

## 常见问题

**上传后没变化?** 硬刷新一次(Ctrl+Shift+R)。注入 URL 已带版本号,一般普通刷新即可。

**宽图比例多少合适?** 侧边栏品牌区高 42px,3:1(如 126×42、540×180)最饱满;更宽的图会按高度等比缩窄,不会变形。

**折叠窄栏的图标好小?** 窄栏是 36px 圆形位,方形图会被缩到这个尺寸,建议主体图形不要太贴边。

**怎么卸载?** `dsh plugin --profile web remove dsh-custom-logo`,再删掉 `~/.dsh/branding/` 下的 `logo-*.png` 即完全还原。

**升级 dsh 后还生效吗?** 插件通过用户 profile 的 patch 层挂载,dsh 自身升级不覆盖;CSS 锚点使用稳定属性,小版本 UI 更新通常无需跟进。若 dsh 大改版重画了品牌区,欢迎提 issue。

## 开发

```bash
git clone https://github.com/dawsondx/dsh-custom-logo.git
cd dsh-custom-logo
npm run check   # 语法检查 lib/index.js 与 lib/client.js
```

无构建步骤:`lib/index.js`(服务端,ESM)与 `lib/client.js`(浏览器,手写 `__ModuleLoader__` bundle)均为单文件、零第三方依赖。

## 致谢

- 灵感与交互模式参考 [dsh-token-data](https://github.com/dawsondx/dsh-token-data) 的侧边栏面板实现

## 许可证

[MIT](./LICENSE)
