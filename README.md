# dsh-mobile-ux

一个独立、可维护的通用 DSH Web 移动端体验插件。它只调整窄视口下的 shell 布局，不参与 session、认证、权限、传输或业务状态管理。只要 DSH 构建保留下面的 web-profile 兼容契约，官方 DSH 及兼容构建都可以复用这个包。

## 设计边界

- `styles/mobile.css` 是行为核心：桌面端不添加任何规则；窄视口将三列布局收缩为 `0 / 1fr / 0`，把 sidebar 变成覆盖层，并保留折叠态的 56px 入口。
- `dist/client.js` 是 DSH 浏览器模块入口：沿用 `window.__ModuleLoader__.load(...)` 的形状，只做幂等 CSS 注入、目标 DOM 兼容性检测和状态报告，不搬运布局状态机。
- CSS 优先使用 DSH 的稳定 `data-*` 钩子，结构兜底使用 `_frame`、`_sidebarCol` 等语义后缀；不依赖构建时生成的 hash class。
- 安装写入 home 级 `cordis.patch.yml`，并在 `profiles/node_modules/dsh-mobile-ux` 建立指向本插件目录的链接。兼容性失败时不会写 patch 或链接。

## 构建与检查

```powershell
npm run build
npm run check
npm test
```

`npm test` 会先构建，然后执行 CSS 契约、通用 web-profile artifact 契约、profile 持久化以及 `client.js` 的真实模块注册/执行测试。

## 安装控制

安装器只有一个通用 `dsh-web` 兼容契约。显式传入实际的 DSH home；省略时使用 `DSH_HOME` 或 `~/.dsh`。`--profile` 默认为 `web`，用于兼容保留相同目录布局但 profile 名称不同的构建。

```powershell
node .\bin\dsh-mobile-ux.mjs install --dsh-home <dsh-home>
node .\bin\dsh-mobile-ux.mjs install --dsh-home <dsh-home> --profile web

node .\bin\dsh-mobile-ux.mjs status --dsh-home <dsh-home> --profile web --json
node .\bin\dsh-mobile-ux.mjs uninstall --dsh-home <dsh-home> --profile web
```

省略 `--dsh-home` 时，安装器按 `DSH_HOME`、`~/.dsh` 顺序解析；显式参数优先，并按原样作为最终 home。安装器不会自动启动、重启或停止 DSH，完成安装后由 owner 决定何时重新启动。

home-level patch 是持久边界：部分 launcher 会刷新 `profiles/<profile>/package.json` 和 `profiles/<profile>/cordis.patch.yml`，因此只改 profile 内 patch 不能形成可靠安装。这个包使用 `<dsh-home>/cordis.patch.yml`，并把模块链接放在 `<dsh-home>/profiles/node_modules`。

## 兼容性与回滚

安装前同时检查本插件的 `dist/client.js`、CSS、package metadata，以及目标 home 中 layout/conversation 的稳定钩子。任何缺失都会终止安装并说明缺少的 token。安装只管理带有 `dsh-mobile-ux: BEGIN/END MANAGED ENTRY` 标记的 patch 行，卸载会保留其他用户 patch；非本插件链接或无标记同名 patch 会拒绝操作。

## Owner 验收

至少覆盖：

1. 1280px 左右桌面视口与安装前布局一致。
2. 390px 和 768px 视口下，中间内容占满，sidebar 打开时覆盖内容而不挤压主列。
3. sidebar 折叠态显示 56px 入口，展开态有可触达的遮罩/层次；窄屏不显示拖拽手柄。
4. composer 在窄屏不被横向 clearance 挤出，刷新后样式仍然存在。
5. 在官方 DSH 或兼容构建的 launcher 中启动一次，确认 home patch 被加载；不能以 profile patch 的暂时存在代替这个验收。
6. 用缺失或变更的 layout/conversation artifact 运行安装，确认 fail closed 且没有新增 patch/link。
