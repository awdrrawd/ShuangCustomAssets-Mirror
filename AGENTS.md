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
- 新增「书签加载」安装方式（Bookmarklet）：`bookmarklet.html` 提供可拖到书签栏的 `javascript:` 链接，点击后向当前 BC 页面注入 `dist/assets/main.js`（Cloudflare 失败回退 GitHub Pages 镜像），无需油猴；刷新后需重新点击。README 中英文均已补充步骤。
- 兼容 BC R134 的属性校验重写：R134 的 `ExtendedItemInit` / `ValidationSanitizeProperties` 会调用 `ItemPropertiesValidate`，用已注册的 `PropertyData` 重建 `item.Property`，未注册键被静默丢弃（`Textures`、`Hide*`、`HideOverrides` 全丢，登录/收到道具后贴图消失）。新增 `src/assets/propertyValidationCompat.js` hook `ItemPropertiesValidate`，仅对本插件道具把输入中存在、但无 `PropertyData` 条目的自定义字段放回校验输出；`Hide`/`LockedBy` 等原生字段仍走 BC 校验，调用方 `omit` 的字段不还原。R133 及更早该 hook 行为等价于原样输出。
- 仅使用两个 ExtensionSettings KEY：ShuangCustomAssets 保存原偏好/白名单及 appearanceBackup，ShuangCustomAssetsCraft 保存 Craft，分别同步；不迁移未发布的旧合并备份。登录校验前捕获原始资料，资产就绪后恢复；正常删除同步备份，冲突槽位保留但不覆盖。实现与限制见 docs/architecture.md。
- 槽位采用 Canvas 顺序布局，与其他页面一致；方形放大镜悬停预览，加载失败改为警告图标，支持批量删除模式；取消恢复优先级，导入超限不再部分写入，姿势字段统一校验。
- 隐藏设置新增「贴图异常保护」道具属性 `HideOnlyWhenReady`：开启后只要有贴图未就绪、加载失败、域名不可信或被屏蔽就不写入 `Property.Hide`，保留原服装；就绪后自动重算并完整刷新角色。导出导入携带该字段，老配置缺失按关闭处理。
- 隐藏设置新增「详细调整」：每个分类行右侧独立入口，按分类分页列出全部部位组，逐组设置 `HideOverrides`（true 强制隐藏 / false 强制显示）覆盖分类开关；切换只在本机预览，确认后统一同步一次，返回/退出还原进入前快照。分类存在覆盖时外层按钮显示「部分」；悬停部位组显示当前穿戴物品名（优先本地化描述，空部位灰色显示「无」）；异常保护说明改为可换行的大字号悬浮提示。
- 设置页从 Y=75 加宽，四区锚点导航及 200px 备份容量摘要；独立插件总开关与加载贴图开关，停用插件拒绝他人新增/修改自己的贴图。容量仅显示 ShuangCustomAssetsCraft 估算，外观备份并入原设置 KEY；缓存管理导入/导出外观与 Craft JSON 备份。他人管理页可快捷封锁佩戴者。登入还原前重建 Craft 索引，残缺登入/验证结果不覆盖完整备份。
- 编辑页保留原始 MouseX/MouseY 差值「移动」与缩放「拖移」两个 100×40 按钮，和任意变形互斥；缩放拖移每像素 0.5%，支持等比与独立 XY，旋转保留 BAR。BAR 使用 SCA_slider.png 缩为 35px；容量摘要带底框与线性进度条。
- 实验任意变形：编辑页新增独立按钮，支持中心缩放/旋转与平移，仅当前编辑角色/物件/图层启用；与旧移动/拖移互斥。不可见/未信任或无有效绘图捕获时不画框；最小边长约 32 CSS px，启用工具时恢复旧零/极小尺寸。
- 清理完成：容量只保留纯计算，不再 hook ServerSend 统计历史；拖曳鼠标/触控共用开始/结束处理；移除旧容量词条与重复封锁按钮分派。
- 图片下载有超时/大小限制，动图解码有单图和全局预算；关闭动图跳过完整 JS 解码。超出 64M px 解码预算的 Animated WebP 不再直接失败，改走串流模式：保留压缩数据与 ImageDecoder，LRU 缓存 4 帧（第 0 帧钉住）+ 1 帧「上一次画出的帧」，预取 3 帧、未就绪时保留上一帧并在 16 ms 后快速重绘；帧时长读 ANMF 头。单张 720×1280×84 帧从 295 MiB 降到约 38 MB，代价是每帧约 10 ms 解码。翻译引擎、字库及教程结构集中 src/i18n/，支持 TW/CN/EN/DE/FR/RU/UA；字库按语言拆分于 src/i18n/locales/，messages.js 仅汇出目录；教程保存 key 并在绘制时翻译，旧 L(cn,en) 标签经字库映射沿用七语。npm test 运行回归测试。
- Rollup 输出 dist/assets/main.js + 内容哈希应用模块，SDK 随包，入口在载入相依模块前检查同名 SDK 注册（等待游戏后再次检查）；旧 shuang-assets.js 保留相容入口，构建复制 PNG 资源。部署整个 dist。
- AssetManager 使用 SCA_INFO 安装标记限制自定义资产：未安装插件的目标角色不在道具列表显示贴图资产，操作来源也必须已广播 SCA 标记；标记按 MemberNumber 缓存，避免 BC 替换角色对象后误判，离房时清除。

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
- **R132 noarch 属性丢弃**：R132 的 `CraftingUpdateFromItem` 把 noarch 道具的 `craft.TypeRecord` 强写为 `{}`（R131 只在道具自身有 TypeRecord 时才写，noarch 保持 null），而 `ExtendedItemSetOptionByRecord` 收集允许字段的循环跳过 NoArch 选项 → 传入非空 TypeRecord 时，`Textures` / `Hide*` 等 baselineProperty 字段被判非法丢弃（控制台报 "Ignoring unsanctioned/invalid item properties"），预览刷新与佩戴时配置不生效。解法：app.js hook `InventoryCraft`，把本插件道具的空 TypeRecord 归一为 null（对 noarch 而言 {} 与 null 语义一致）。
- **R134 图像缓存与“模型加载不出来”**：R134 把 BC 的 `DrawImageCache` / `GLDrawImageCache` 改为 `fetch`（`accept: image/*`）+ Content-Type 校验 + Cache API（只缓存 `location.origin`）。若服务器把图片以 `text/html` / `application/octet-stream` 等非 `image/*` 返回，或跨域响应没有 CORS，BC 会打印 `Expected an image, got ...` / `Failed to load image`，基础角色资源可能整片空白。SCA 的用户贴图与动图走自维护的 `new Image()` + canvas 管线（`getCorsImage` / `gifPlayer`），不经过 BC 的 `GLDrawImageCache`，因此不受该缓存故障影响；只有插件 logo / 道具预览图标等静态资源走 BC 的图片管线。SCA 的 CDN 已确认返回 `Content-Type: image/png` 且 Cloudflare 带 `Access-Control-Allow-Origin: *`。
- **R134 自定义属性被校验清空**：R134 起 `ExtendedItemInit` 和（非扩展道具的）`ValidationSanitizeProperties` 都会调用 `ItemPropertiesValidate`，它只把 `PropertyData` 里注册过的键写进返回的 `value`；未注册键既不报错也不保留。任何靠 `BaselineProperty` 存自定义字段的模组都会在 `ItemPropertiesDecompress` → `ExtendedItemInit` 时丢字段，`NoArch.Init` 随后只补默认值。解决方式是 hook `ItemPropertiesValidate`，对本插件资产把原始输入里的未注册字段补回去（见 `src/assets/propertyValidationCompat.js`）；不要把这些字段注册进 `PropertyData`，否则会绕过 BC 原生校验并影响压缩/合并语义。
- **R133 与 bc-asset-manager 的 patchFunction 锚点**：@sugarch/bc-asset-manager(<=1.4.3) 内置的 `GLDrawLoadImage`(crossOrigin) 与 `ItemColorLoad`(ColorGroups.csv 路径) 补丁锚点在 R133 已失效，启动时报 "ModSDK: Patching ...: Patch ... not applied"。`build/assetManagerCompat.cjs` 由 rollup 插件 `asset-manager-r133-compat` 在打包时作两件事：更新 `ItemColorLoad` 的锚点文字（R133 起路径不再带 `AssetFamily`），并给这两处 `patchFunction` 的补丁表包一层**运行时过滤** —— 只把「当前游戏函数源码里仍然存在」的锚点交给 ModSDK，失效的丢弃并留一条 `console.debug` 线索（取源码优先用 ModSDK 记录的 `original`，避免别的 mod 已把全局换成 router）。因此同一份产物在 R132（锚点仍在，crossOrigin 补丁照常生效）与 R133（锚点消失，自动跳过）都正常；函式库自行修好后自动退化为原样传递，转换幂等。本插件图层均 `AllowColorize:false`，ItemColorLoad 那条注入本身对本插件无功能影响。
- **锁机制**：noarch archetype 的 `ChangeWhenLocked` 不自动生效，需手动检查 `item.Property.LockedBy`。
- **Block 拦截**：贴图需 `Block=[]` + `InventoryGroupIsBlockedForCharacter` 豁免，避免被其他道具 Block。
- **拖拽卡顿**：`CharacterRefresh` 节流 200ms，拖拽场景需独立更短的刷新间隔。
- **CDN 双源 fallback**：固定资源（logo、警告图）主源失败自动回退备用源。
- **图层底图 404**：贴图靠 AfterDraw 手绘，图层本身没有服务器 PNG。BC 会为每个 `HasImage` 的图层请求 `<Group>/<AssetName>_LayerN.png` → 全部 404。解法：afterLoad 里给每层设 `HasImage=false`（AfterDraw 与 HasImage 相互独立，仍照常逐层触发），比映射 1x1 透明 PNG 更干净。
- **图层数量**：改 `MAX_TEXTURE_COUNT`（constants.js）即可，LAYER_NAMES / asset.Layer / 分页 / 导入上限全部由它派生；教程数字文案位于 src/i18n/locales/<语言>.js，修改上限时需同步。

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
