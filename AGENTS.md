# ShuangCustomAssets - AI Agent 规则

## 项目简介

BC（Bondage Club）游戏的自定义贴图/装扮插件，油猴脚本形式加载。支持多层贴图编辑、隐藏系统、姿势独立配置、域名白名单、玩家屏蔽、动图/APNG 播放、多语言文档。构建产物为 ES 模块入口及应用包，经 Netlify/Cloudflare 分发。

## 核心规则

### 1. 每次对话必须读取本文件
- 每次新对话开始时，**必须先读取** `AGENTS.md` 获取最新规则与项目状态。
- 若文件缺失，自动创建并写入默认规则。

### 2. 修改必须提交 Git（权威历史）
- 每次代码修改后**必须 git commit**，commit message 遵循约定式提交（`feat:` / `fix:` / `refactor:` / `docs:` / `style:` …）。
- 修改历史以 `git log` 为准，**不要在文档中维护冗长的修改日志**。
- 重大设计决策、踩坑结论、架构变更 → 记录到 `docs/` 或本文件「项目状态快照」。
- 提交前 `git diff` 检查变更内容；**禁止**直接 push `main`/`master`，禁止未经确认执行 `push --force`、`reset --hard`、`clean -f`。

### 3. 项目上下文规则
- 始终先理解项目整体结构与当前状态（见下）再动手修改。
- 修改前先阅读相关文件，不盲目编辑。
- 优先复用已有的工具函数、组件、样式，避免重复造轮子。

---

## 项目状态快照（给下一个 AI 的指导）

> 每次重要改动后更新本节，保持精简（几百字内）。历史细节看 `git log`，功能说明看 `docs/`。

### 当前进度
- 仅使用两个 ExtensionSettings KEY：ShuangCustomAssets 保存原偏好/白名单及 appearanceBackup，ShuangCustomAssetsCraft 保存 Craft，分别同步；不迁移未发布的旧合并备份。登录校验前捕获原始资料，资产就绪后恢复；正常删除同步备份，冲突槽位保留但不覆盖。实现与限制见 docs/architecture.md。
- 槽位采用 Canvas 顺序布局，与其他页面一致；方形放大镜悬停预览，加载失败改为警告图标，支持批量删除模式；取消恢复优先级，导入超限不再部分写入，姿势字段统一校验。
- 设置页从 Y=75 加宽，四区锚点导航及 200px 备份容量摘要；独立插件总开关与加载贴图开关，停用插件拒绝他人新增/修改自己的贴图。容量仅显示 ShuangCustomAssetsCraft 估算，外观备份并入原设置 KEY；缓存管理导入/导出外观与 Craft JSON 备份。他人管理页可快捷封锁佩戴者。登入还原前重建 Craft 索引，残缺登入/验证结果不覆盖完整备份。
- 编辑页保留原始 MouseX/MouseY 差值「移动」与缩放「拖移」两个 100×40 按钮，和任意变形互斥；缩放拖移每像素 0.5%，支持等比与独立 XY，旋转保留 BAR。BAR 使用 SCA_slider.png 缩为 35px；容量摘要带底框与线性进度条。
- 实验任意变形：编辑页新增独立按钮，支持中心缩放/旋转与平移，仅当前编辑角色/物件/图层启用；与旧移动/拖移互斥。不可见/未信任或无有效绘图捕获时不画框；最小边长约 32 CSS px，启用工具时恢复旧零/极小尺寸。
- 清理完成：容量只保留纯计算，不再 hook ServerSend 统计历史；拖曳鼠标/触控共用开始/结束处理；移除旧容量词条与重复封锁按钮分派。
- 图片下载有超时/大小限制，动图解码有单图和全局预算；关闭动图跳过完整 JS 解码。翻译引擎、字库及教程结构集中 src/i18n/。npm test 运行回归测试。
- Rollup 输出 dist/assets/main.js + 内容哈希应用模块，SDK 随包，入口在载入相依模块前检查同名 SDK 注册（等待游戏后再次检查）；旧 shuang-assets.js 保留相容入口，构建复制 PNG 资源。部署整个 dist。

### 技术要点 / 关键结构
- **入口**：`src/main.js`（HookManager 注册所有 hooks）
- **贴图逻辑**：`src/assets/customTexture.js`（asset 定义、extended hooks、Load/Click/Draw）
- **模块拆分**：`src/assets/`（constants / state / editPanel / listView / render / importExport / dialogHooks / hideArray / serverSync / loginBadge / cdnFallback / tutorial / modTag / settings）+ `src/lib/`（gifPlayer / gifAnimationLoop / refreshScheduler / utils / modTag）
- **构建**：rollup 输出 ES 模块，版本号 tag-based（`git describe --tags`），`package.json` + `rollup.config.js`
- **UI 偏好**：设置页使用 HTML/CSS；贴图管理按用户要求使用 Canvas，与其他道具页面一致，绘制与点击共用布局
- **配置版本**：导入导出有 version 字段（当前 v7），改动需配套迁移逻辑
- **兼容性**：配置需兼容旧数据导入（Load 钩子做字段迁移）；canvas 绘制与 DOM 输入框生命周期挂在道具 Load/Draw/Exit 钩子上

### 已知坑（踩过，别再踩）
- **拖曳与 Canvas**：旧变形框曾在实机错位。新实验模式由 render.js 捕获当前编辑角色/物件/图层几何，通过 DrawCharacter 内最终 DrawImageEx 的 SourcePos/目标尺寸/上下文矩阵映射到 SVG，反矩阵处理指针。GLDraw2DCanvas 捕获当前贴图实际 atlas 偏移（含 ECHO 扩画布），排除眨眼。 不 hook 原生 Canvas；受控浏览器已验证，仍待完整游戏测试。原始移动/拖移保留。
- **Crafting 校验**：BC 的 `CraftingValidate` 用 `typeof value !== typeof baseline[key]` 校验，删字段会导致老配置被静默丢弃 → 删字段时必须留兼容字段 + Load 钩子迁移。
- **锁机制**：noarch archetype 的 `ChangeWhenLocked` 不自动生效，需手动检查 `item.Property.LockedBy`。
- **Block 拦截**：贴图需 `Block=[]` + `InventoryGroupIsBlockedForCharacter` 豁免，避免被其他道具 Block。
- **拖拽卡顿**：`CharacterRefresh` 节流 200ms，拖拽场景需独立更短的刷新间隔。
- **CDN 双源 fallback**：固定资源（logo、警告图）主源失败自动回退备用源。
- **图层底图 404**：贴图靠 AfterDraw 手绘，图层本身没有服务器 PNG。BC 会为每个 `HasImage` 的图层请求 `<Group>/<AssetName>_LayerN.png` → 全部 404。解法：afterLoad 里给每层设 `HasImage=false`（AfterDraw 与 HasImage 相互独立，仍照常逐层触发），比映射 1x1 透明 PNG 更干净。
- **图层数量**：改 `MAX_TEXTURE_COUNT`（constants.js）即可，LAYER_NAMES / asset.Layer / 分页 / 导入上限全部由它派生；教程数字文案位于 src/i18n/messages.js，修改上限时需同步。

### 部署 / 分发
- Netlify（`netlify.toml`）+ Cloudflare Pages 双源分发。
- 油猴脚本：`loader.user.js`（发布版）/ `loader.dev.user.js`（开发版）。

---

## 行业通用规则

### 4. 代码质量
- 保持代码简洁，不过度设计（YAGNI 原则）。
- 遵循项目现有代码风格与命名规范。
- 单个函数/方法不超过 50 行，超过考虑拆分。
- 避免魔法数字，使用有意义的常量。

### 5. Git 操作规范
- 只有用户明确说「幫我推送」时才可 push；本地 commit 不代表授权推送。
- 禁止未经用户确认执行 `git push --force`、`git reset --hard`、`git clean -f` 等破坏性操作。
- 禁止直接 push 到 `main` / `master` 分支。
- 提交前进行 `git diff` 检查，确认变更内容。
- Commit message 遵循约定式提交（Conventional Commits）。

### 6. 安全规则
- 绝不硬编码密钥、Token、密码等敏感信息。
- 对用户输入和外部 API 返回数据做校验和转义。
- 不引入已知有漏洞的依赖版本。

### 7. 文件操作规则
- 优先编辑已有文件，不随意创建新文件。
- 删除文件前确认未被引用。

### 8. 错误处理
- 外部 API 调用、文件 I/O 必须处理异常。
- 错误信息清晰可调试，但不对用户暴露内部实现细节。

### 9. 测试规则
- 新增功能同步编写测试用例。
- 修改核心逻辑后运行已有测试，确保不引入回归。

### 10. 依赖管理
- 添加新依赖前评估是否必要，优先使用已有依赖。
- 锁定依赖版本（lockfile）。

### 11. 性能与可维护性
- 避免不必要的重复渲染和重复计算。
- 注释解释"为什么"而非"是什么"，复杂逻辑必须加注释。

### 12. 兼容性
- 前端代码明确支持的浏览器版本范围。
- API 接口变更考虑向后兼容，避免破坏性变更。
