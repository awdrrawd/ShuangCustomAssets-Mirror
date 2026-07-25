# ShuangCustomAssets - AI Agent 规则

## 核心规则

### 1. 每次对话必须读取本文件
- 每次新对话开始时，**必须先读取** `AGENT.MD` 文件以获取最新规则。
- 如果文件不存在，则自动创建并写入默认规则。

### 2. 修改记录规则
- 每次对项目代码进行修改后，**必须将修改内容摘要追加到本文件末尾**。
- 摘要格式：`[YYYY-MM-DD HH:MM] <修改描述> - <涉及文件>`
- 保持修改记录简洁，一行一条。

### 3. 项目上下文规则
- 始终先理解项目整体结构再动手修改。
- 修改前先阅读相关文件，不盲目编辑。
- 优先使用项目已有的工具函数、组件和样式，避免重复造轮子。

---

## 行业通用规则

### 4. 代码质量
- 保持代码简洁，不过度设计（YAGNI 原则）。
- 遵循项目现有的代码风格和命名规范，不引入不一致的格式。
- 单个函数/方法不超过 50 行，超过则考虑拆分。
- 避免魔法数字，使用有意义的常量。

### 5. Git 操作规范
- **禁止**未经用户确认执行 `git push --force`、`git reset --hard`、`git clean -f` 等破坏性操作。
- **禁止**直接 push 到 `main` / `master` 分支。
- 提交前进行 `git diff` 检查，确认变更内容。
- Commit message 遵循约定式提交（Conventional Commits）。

### 6. 安全规则
- **绝不**在代码中硬编码密钥、Token、密码等敏感信息。
- 对用户输入和外部 API 返回数据做校验和转义。
- 不引入已知有漏洞的依赖版本。

### 7. 文件操作规则
- 优先编辑已有文件，**不随意创建新文件**。
- 删除文件前务必确认文件未被引用。

### 8. 错误处理
- 外部 API 调用、文件 I/O 必须处理异常。
- 错误信息要清晰可调试，但不要向用户暴露内部实现细节。

### 9. 测试规则
- 新增功能需同步编写测试用例。
- 修改核心逻辑后运行已有测试，确保不引入回归。

### 10. 依赖管理
- 添加新依赖前评估是否必要，优先使用已有依赖。
- 锁定依赖版本（使用 lockfile）。

### 11. 性能与可维护性
- 避免不必要的重复渲染和重复计算。
- 代码注释解释"为什么"而非"是什么"，复杂逻辑必须加注释。

### 12. 兼容性
- 前端代码需明确支持的浏览器版本范围。
- API 接口变更需考虑向后兼容，避免破坏性变更。

---
## 修改记录
[2026-07-20] 初始化 AGENTS.md - AGENTS.md
[2026-07-20 02:30] 自定义贴图：新增 HideBody/HideOtherItems 两个开关，通过 Property.Hide 数组实现隐藏玩家身体模型和其他道具模型；开关持久化到 BaselineProperty 支持 Crafting 保存；Load 钩子、保存、导入导出均同步刷新 Hide 数组；UI 主界面在副标题下方新增两个开关按钮 - src/assets/customTexture.js
[2026-07-20 02:50] 自定义贴图：新增 HideEchoExt 开关，兼容 echo 服装扩展新增部位（ECHO_EXT_GROUPS: BodyMarkings2_Luzi/新前发_Luzi/新后发_Luzi/动物身体_Luzi/额外头发_Luzi/长袖子_Luzi）；配置版本升级到 v3；BaselineProperty/Load/UI/Click/导入导出均同步更新 - src/assets/customTexture.js
[2026-07-20 03:00] 自定义贴图：完善 ECHO_EXT_GROUPS 列表，从 AssetManager.addGroup 源码提取完整 12 个新增组（左眼_Luzi/右眼_Luzi/新前发_Luzi/新后发_Luzi/额外头发_Luzi/Liquid2_Luzi/身体痕迹_Luzi/动物身体_Luzi/额外身高_Luzi/长袖子_Luzi/外观工具/BodyMarkings2_Luzi）- src/assets/customTexture.js
[2026-07-20 03:10] 自定义贴图：通过游戏内 AssetGroup.map(g => g.Name) 获取完整 35 个 echo 扩展新增组，包含 _Luzi / _笨笨蛋Luzi / _笨笨笨蛋Luzi2 / Luzi_ 前缀等各类命名规则，覆盖衣服/下装/胸罩/内裤/套装/饰品/帽子/鞋子/手套/面具/翅膀/发型等所有扩展槽位 - src/assets/customTexture.js
[2026-07-20 03:20] 自定义贴图：修复编辑面板实时预览问题 - 编辑时只刷新本地画布不同步服务器；URL 变化时预加载图片并在加载完成后再次刷新；确认按钮点击时才同步到服务器；移除防抖同步逻辑 - src/assets/customTexture.js
[2026-07-20 03:40] 自定义贴图：完善 BODY_GROUPS 列表，新增遗漏的 ArmsLeft/ArmsRight（手臂）、HairAccessory2/HairAccessory3（发饰2/3）、Height/BodyStyle/Pronouns（身高/样式/代词）、ItemEars（耳朵道具），按类别分组整理注释 - src/assets/customTexture.js
[2026-07-20 03:50] 自定义贴图：入口文件添加详细诊断日志 - 脚本加载立即输出确认、once 执行开始、SDK 加载进度、模组注册、HookManager 初始化、AssetManager.init 调用等各阶段日志，方便通过 Toolbox 加载时排查问题 - src/main.js
[2026-07-20 04:00] 修复构建报错"Identifier 'be' has already been declared" - 禁用 terser 压缩和 compact 输出，避免 rollup 压缩时变量名冲突 - rollup.config.js
[2026-07-20 04:10] 修复 Toolbox 加载报错"Identifier 'i' has already been declared" - 输出格式从 esm 改为 iife（立即执行函数），每次加载创建独立作用域，避免与 Toolbox 或其他插件变量冲突 - rollup.config.js
[2026-07-24 15:30] 自定义贴图：将旧3开关隐藏系统(HideBody/HideOtherItems/HideEchoExt)替换为5分类隐藏系统(HideCosplay/HideFacial/HideBody/HideClothing/HideItems)，新增独立隐藏设置页面(currentView状态)，配置版本升级到v4，兼容旧数据导入 - src/assets/customTexture.js
[2026-07-25 23:50] 安全设置：域名白名单管理页面添加翻页功能(每页8条，支持上下翻页)；添加导入导出功能(导出JSON到剪贴板，导入JSON格式配置) - src/assets/settings.js
