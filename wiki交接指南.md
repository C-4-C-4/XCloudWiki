# 闲云维基（XCloudWiki）编辑交接指南

本文档为闲云维基（XCloudWiki）编辑工作交接手册。详细说明了从仓库拉取源码、本地开发环境搭建、推荐编辑器配置、服务启动预览、文件夹目录职责明细、新建与编写文档指南、高级组件与排版规范、维护日志 SOP、SEO 搜索优化、社区 PR 审核以及编译部署的全流程。

---

## 目录

1. 环境准备
2. 编辑器与推荐插件
3. 仓库拉取与依赖安装
4. 启动本地开发服务器
5. 目录结构与每个页面的职责明细
6. 撰写与新建内容操作指南
7. Fumadocs 基础组件与 MDX 排版规范
8. 维护日志更新标准流程 (SOP)
9. Fumadocs 高级 UI 组件库指南
10. SEO 优化与 Orama 全文搜索机制
11. Git 提交规范与社区 PR 审核流程
12. 编译服务器与打包测试
13. 提交代码与自动部署流程
14. 常见问题排查

---

## 1. 环境准备

在本地电脑上管理和编写维基文档前，需要安装以下基础运行环境：

### 1.1 Git (版本控制工具)
- **用途**：从 GitHub 拉取仓库代码及提交更新。
- **下载地址**：[https://git-scm.com/downloads](https://git-scm.com/downloads)
- **安装验证**：打开终端（Terminal 或 PowerShell），运行以下命令验证：
  ```bash
  git --version
  ```

### 1.2 Node.js (JavaScript 运行环境)
- **要求**：Node.js 版本必须符合 `>= 24.14.0`。
- **下载地址**：[https://nodejs.org/](https://nodejs.org/)
- **安装验证**：
  ```bash
  node -v
  ```
  如果显示的输出版本低于 `24.14.0`，请升级 Node.js。

### 1.3 pnpm (包管理器)
- **要求**：pnpm 版本为 `11.1.0` 或更高。
- **安装命令**：
  若已安装 Node.js，可在命令行中通过以下命令安装 pnpm：
  ```bash
  npm install -g pnpm@11.1.0
  ```
- **安装验证**：
  ```bash
  pnpm -v
  ```

---

## 2. 编辑器与推荐插件

推荐使用 **Visual Studio Code (VS Code)** 作为主要文档编辑器。

### 2.1 编辑器下载
- **下载地址**：[https://code.visualstudio.com/](https://code.visualstudio.com/)

### 2.2 推荐插件安装
在 VS Code 侧边栏的“扩展 (Extensions)”视图中搜索并安装以下插件：

1. **MDX** (`unifiedjs.vscode-mdx`)
   - 提供 `.mdx` 文件的语法高亮、代码补全与错误检查。
2. **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`)
   - 提供样式类名自动补全与提示。
3. **OXC** (`oxc.oxc-vscode`)
   - 本项目配置的代码格式化与语法检查工具。
4. **Prettier - Code Formatter** (可选)
   - 辅助 Markdown 格式化。

### 2.3 工作区设置
项目根目录下已配置 `.vscode/settings.json`。用 VS Code 打开项目文件夹时，系统会自动应用保存时格式化等工作区设置。

---

## 3. 仓库拉取与依赖安装

### 3.1 克隆仓库到本地
打开终端，选择你希望保存项目的目录，执行以下命令：

```bash
git clone https://github.com/c-4-c-4/XCloudWiki.git
```

进入项目根目录：

```bash
cd XCloudWiki
```

### 3.2 安装项目依赖
在项目根目录运行以下命令安装项目所需的节点依赖包：

```bash
pnpm install
```

*提示：该项目采用了 Turborepo 多包管理架构（Monorepo），请确保在根目录下运行 `pnpm install`。*

---

## 4. 启动本地开发服务器

### 4.1 启动命令
在项目根目录运行以下命令以启动本地开发服务器：

```bash
pnpm dev
```

或者，也可以切换到文档应用目录单独启动：

```bash
cd apps/docs
pnpm dev
```

### 4.2 本地预览
启动成功后，终端将提示本地端口信息。打开浏览器访问以下地址：

```
http://localhost:3000
```

在本地服务运行期间，修改任何 MDX 文档或页面文件，浏览器均会自动实时刷新预览修改效果。

---

## 5. 目录结构与每个页面的职责明细

所有维基文档均保存在以下核心路径下：

```
apps/docs/content/docs/
```

该目录下的根配置文件 `meta.json` 规定了顶层分类的展示顺序：
`["BasicInfo", "BeginnersGuide", "Expandedgameplay", "PlayerCommunity", "Tools", "Other"]`

各个分类文件夹及其包含的具体页面说明如下：

### 5.1 基础信息 (`BasicInfo/`)
存放服务器的核心制度、安全规范与基础说明。

- **`ServerRules.mdx`（首页与使用须知）**
  - **职责**：维基首页入口。展示服务器版本（如 1.21.11）、客户端整合包下载链接、服主防骗提示、目录导航提示及入服守则。
  - **更新频次**：当服务器客户端版本更新、整合包下载地址变动时更新。
- **`PenaltyRules.mdx`（惩罚规则）**
  - **职责**：详细记录针对作弊、破坏、言论违规等行为的处理机制与惩罚措施（警告、禁言、封禁等）。
  - **更新频次**：当服务器管理层调整违规处理标准时更新。
- **`Title.mdx`（头衔称号系统）**
  - **职责**：记录服务器内称号等级体系（如 PLAYER、VIP、MVP、PRO、HERO）及对应的专属特权、获取条件。
  - **更新频次**：新增称号或修改称号特权时更新。
- **`ServerActivity.mdx`（服务器活动）**
  - **职责**：展示服务器定期举办的节日活动、建筑大赛或限时玩法活动及奖励发放说明。
  - **更新频次**：每次新活动上线或活动规则发布时更新。
- **`Mascot.mdx`（吉祥物与 IP 形象）**
  - **职责**：介绍闲云服务器的官方吉祥物背景故事、形象设定与社区周边文化。
  - **更新频次**：偶发维护。

### 5.2 新手教程 (`BeginnersGuide/`)
面向新玩家的入门指导与基础玩法教学。

- **`BeginnersGuide.mdx`（新手入门指南）**
  - **职责**：新玩家进服后的第一步指导、生存基础、资源获取及新手常见问题 FAQ。
  - **更新频次**：新手机制或初始流程调整时更新。
- **`CommandFunction.mdx`（命令功能）**
  - **职责**：列出玩家可用的常用命令列表（如传送 `/tpa`、家设置 `/sethome`、领地 `/res`、金币 `/bal` 等）。
  - **更新频次**：新增插件命令或调整命令权限时更新。
- **`NPC.mdx`（NPC 交互）**
  - **职责**：介绍主城及各个据点功能性 NPC 的位置、功能与交互流程。
  - **更新频次**：主城新增 NPC 或修改 NPC 功能时更新。
- **`TerritoriesandLandmarks.mdx`（领地与地标）**
  - **职责**：讲解领地圈地步骤、领地权限设置、公共地标（Landmark）传送与使用规范。
  - **更新频次**：领地插件规则或圈地价格调整时更新。
- **`TravelTips.mdx`（旅行提示）**
  - **职责**：提供地图传送、世界跨越（资源界、生存界、下界、末地）的交通与安全建议。
  - **更新频次**：世界开放状态或跨界规则变更时更新。

### 5.3 扩展游戏玩法 (`Expandedgameplay/`)
介绍服务器特色的自定义插件与玩法系统。

- **`BlacksmithSystem.mdx`（铁匠系统）**：强化装备、宝石镶嵌、装备拆解与打孔打造流程。
- **`Careersystem.mdx`（职业系统）**：介绍多职业选择（如矿工、猎人、农夫等）、升级方式、技能与职业收入。
- **`ExpandtheEnchantedBookSystem.mdx`（扩展附魔书）**：自定义附魔效果、高级附魔书合成与使用限制。
- **`FishingSystem.mdx`（钓鱼系统）**：特殊钓鱼玩法、稀有水产图鉴、钓鱼比赛与奖励。
- **`SmallTownSystem.mdx`（小镇系统）**：创建小镇、招募居民、城镇升级与小镇专属科技。
- **`StardewValleyCropSystem.mdx`（星露谷作物）**：自定义农作物种植、季节作物、温室与作物加工。
- **`WorldBoss.mdx`（世界 Boss）**：Boss 刷新时间、技能机制、副本组队与稀有战利品掉落。

### 5.4 玩家社区 (`PlayerCommunity/`)
展示社区建设成果与玩家创作作品。

- **`Town.mdx`（小镇展示）**：精选玩家小镇的照片、简介、小镇坐标及镇长信息。
- **`Wonder.mdx`（奇迹建筑）**：服务器内大型建筑工程、红石机械与奇迹作品展。

### 5.5 辅助工具 (`Tools/`)
帮助玩家更好地进行游戏辅助的工具说明。

- **`Calculator.mdx`（计算器）**：游戏内经济、建筑材料或产出效率计算工具使用说明。
- **`Changeskin.mdx`（换肤教程）**：正版/离线玩家在服务器内更换个性皮肤的操作步骤。
- **`Projectortool.mdx`（投影工具）**：投影模组（Litematica）在服务器内的使用教程与限制。

### 5.6 其他页面 (`Other/`)
- **`About.mdx`（关于我们）**：管理团队介绍、服务器历史与联系沟通渠道。
- **`InvestitureoftheGods.mdx`（封神榜）**：记录服务器贡献突出的玩家或荣誉殿堂。
- **`Leaderboard.mdx`（排行榜）**：各类榜单（财富榜、在线时长榜等）查看方式与规则。
- **`Maintainthetimeline.mdx`（时间线维护）**：记录服务器历次版本更新、维基维护与大事件日志。

---

## 6. 撰写与新建内容操作指南

若需要撰写一份全新的维基页面或修改现有内容，请遵循以下标准流程：

### 6.1 第一步：创建 MDX 文件
在目标分类目录下创建同名的 `.mdx` 文件（建议文件名使用驼峰命名法或清晰的英文名称，不要包含空格）。

*例如：要在“扩展游戏玩法”中新增“宠物系统”，可在 `apps/docs/content/docs/Expandedgameplay/` 目录下创建 `PetSystem.mdx`。*

### 6.2 第二步：编写 Frontmatter 元数据
每个 `.mdx` 文件的顶部必须包含 YAML 规范的 Frontmatter，定义页面标题与描述：

```markdown
---
title: 宠物系统
description: 闲云服务器宠物捕捉、培养与技能指南
publishedAt: 2026-07-22
authors: "你的名字"
---

这里是正文开始...
```

常用字段说明：
- `title`（必需）：页面显示的标题名称，亦会同步至导航栏与搜索结果中。
- `description`（必需）：页面的摘要描述，用于 SEO 和导航预览。
- `publishedAt`（可选）：发布日期（格式 YYYY-MM-DD）。
- `authors`（可选）：文档作者姓名或玩家 ID。

### 6.3 第三步：在 `meta.json` 中注册新页面
新建文件后，**必须**将其注册到所在文件夹的 `meta.json` 中，否则左侧导航栏将不会显示该页面。

找到对应目录下的 `meta.json`（例如 `apps/docs/content/docs/Expandedgameplay/meta.json`），在 `pages` 数组中追加新文件名（注意**不需要加 `.mdx` 后缀**）：

```json
{
  "title": "拓展玩法",
  "pages": [
    "BlacksmithSystem",
    "Careersystem",
    "FishingSystem",
    "PetSystem"
  ]
}
```

如果想要调整侧边栏中页面的上下排列顺序，直接在 `pages` 数组中调整文件名的顺序即可。

### 6.4 第四步：管理静态资源与图片引用
如果新文档包含截图或示意图：

1. **图片存放规则**：
   将图片保存至 `apps/docs/public/wiki-img/<分类名>/<文件名>/` 目录下。
   *例如：`apps/docs/public/wiki-img/Expandedgameplay/PetSystem/pet_ui.png`*

2. **在 MDX 中引用图片**：
   在 MDX 中使用以 `/` 开头的绝对路径（映射至 `public` 根目录）引用：

   ```markdown
   ![宠物系统界面](/wiki-img/Expandedgameplay/PetSystem/pet_ui.png)
   ```

   或者使用带有 Tailwind 类名的原生 HTML `<img>` 标签控制样式：

   ```html
   <img src="/wiki-img/Expandedgameplay/PetSystem/pet_ui.png" alt="宠物界面" width="600" className="mx-auto my-4 rounded-lg shadow-md" />
   ```

---

## 7. Fumadocs 基础组件与 MDX 排版规范

闲云维基基于 Fumadocs 框架，支持在 MDX 文件中灵活使用 React UI 组件修饰文档内容。

### 7.1 Callout 提示框组件
用于高亮重要提示、警示或安全事项。

- **信息提示 (`type="info"`)**：
  ```markdown
  <Callout type="info" title="温馨提示">
    在服务器内输入 /pet help 可随时查看宠物帮助菜单。
  </Callout>
  ```

- **警告提示 (`type="warn"`)**：
  ```markdown
  <Callout type="warn" title="注意事项">
    宠物死亡后需要消耗宠物复活药水，请注意保护你的宠物。
  </Callout>
  ```

- **危险/错误提示 (`type="error"`)**：
  ```markdown
  <Callout type="error" title="严正警告">
    严禁使用任何形式的自动挂机刷新宠物副本，违者将直接封禁。
  </Callout>
  ```

### 7.2 标题与段落层级规范
1. **禁止在正文中再次使用 `#` (H1)**：因为 Frontmatter 中的 `title` 会自动渲染为页面唯一的大标题 H1。
2. **正文大章节使用 `##` (H2)**：每个主要板块使用二级标题。
3. **子章节使用 `###` (H3)**：大章节下的细节内容使用三级标题。
4. **禁止跨越标题层级**：不要直接从 `##` 跳到 `####`。

### 7.3 代码块与命令标记
- **多行代码/命令**：必须使用三反引号并指定语言标记：
  ````markdown
  ```bash
  /res create [领地名称]
  ```
  ````
- **单行内联命令/短短句**：使用单反引号包裹，例如：在聊天栏中输入 `/tpa` 发送传送请求。

### 7.4 文本格式与风格要求
- **表达清晰**：语句应当规范专业，直接点明玩家关心的要点。
- **高亮关键文本**：对于游戏内关键术语、变量或数值，使用加粗或带有 Tailwind 样式的 `<span>` 标签突出显示。
- **无 Emoji 规范**：按照项目维护要求，维基文档中严禁使用任何 emoji 表情字符。

---

## 8. 维护日志更新标准流程 (SOP)

位于 `apps/docs/content/docs/Other/Maintainthetimeline.mdx` 的页面记录了 Wiki 网站维护历史与服务器游戏更新日志。编辑在每次更新网站或游戏版本时，需按以下格式追加条目。

### 8.1 Wiki 网站日志追加模板
在 `## Wiki 网站维护日志` 下的最新月份标签中插入新的时间轴条目：

```html
<div className="timeline-item wiki">
  <div className="timeline-dot"></div>
  <div className="timeline-date">7月22日</div>
  <div className="timeline-content">
    <div className="update-entry">
      <span className="badge new">新功能上线</span>
      <p>详细说明新增的功能或页面内容...</p>
    </div>
    <div className="update-entry">
      <span className="badge fix">问题修复</span>
      <p>详细说明修复的 Bug 或样式优化...</p>
    </div>
  </div>
</div>
```

徽章类型（`span className`）：
- `badge new`：新功能 / 新页面
- `badge docs`：文档修改与补充
- `badge ui`：界面 UI 或交互升级
- `badge fix`：缺陷修复与路径调整
- `badge special`：重大里程碑与重大宣布

### 8.2 游戏服务器日志追加模板
在 `## 游戏服务器更新日志` 中按组添加服务器更新：

```html
<div className="timeline-item game">
  <div className="timeline-dot"></div>
  <div className="timeline-date">7月22日</div>
  <div className="timeline-content">
    <div className="update-group">
      <h5>新增内容</h5>
      <ul>
        <li><strong>称号更新</strong>：新增季度活动专属称号。</li>
      </ul>
    </div>
    <div className="update-group">
      <h5>修复内容</h5>
      <ul>
        <li><strong>领地权限</strong>：修复特殊情况下容器权限失效的问题。</li>
      </ul>
    </div>
  </div>
</div>
```

---

## 9. Fumadocs 高级 UI 组件库指南

除了基础的 `<Callout>`，可使用 Fumadocs 提供的富组件增强页面可读性。

### 9.1 卡片导航组件 (`Cards` 与 `Card`)
常用于页面顶部的多路径导航或功能入口：

```markdown
<Cards>
  <Card href="/docs/BeginnersGuide/CommandFunction" title="常用命令列表">
    快速查阅传送、领地及经济管理常用指令
  </Card>
  <Card href="/docs/Expandedgameplay/BlacksmithSystem" title="铁匠强化指南">
    了解宝石镶嵌与装备打孔强化全流程
  </Card>
</Cards>
```

### 9.2 步骤流程组件 (`Steps` 与 `Step`)
用于圈地流程、任务步骤或安装教程等分步说明：

```markdown
<Steps>
  <Step>
    ### 第一步：选择领地范围
    手持木锄左键点击领地对角线的第一点，右键点击对角线的第二点。
  </Step>
  <Step>
    ### 第二步：输入圈地指令
    在聊天栏中输入 `/res create [领地名称]` 即可成功创建领地。
  </Step>
</Steps>
```

### 9.3 选项卡组件 (`Tabs` 与 `Tab`)
用于区分多操作系统环境或不同账号类型的操作步骤：

```markdown
<Tabs items={["正版登录", "离线登录"]}>
  <Tab value="正版登录">
    正版玩家直接输入微软账号凭据登录即可进入闲云服务器。
  </Tab>
  <Tab value="离线登录">
    离线玩家需先在主城输入 `/register [密码] [确认密码]` 进行注册。
  </Tab>
</Tabs>
```

### 9.4 折叠面板组件 (`Accordion` 与 `Accordions`)
用于收纳常见问题解答 (FAQ) 或长列表：

```markdown
<Accordions>
  <Accordion title="为什么进入服务器提示版本不兼容？">
    请确认客户端版本是否为 1.21.11。推荐下载使用官方提供的 1.21.11 整合包。
  </Accordion>
  <Accordion title="领地金币如何退还？">
    删除领地 `/res remove [领地名称]` 时，系统会自动按一定比例返还圈地金币。
  </Accordion>
</Accordions>
```

---

## 10. SEO 优化与 Orama 全文搜索机制

闲云维基使用基于 Orama 的轻量级全文搜索系统。在编写文档时需注意以下规则以确保玩家检索准确：

### 10.1 标题与关键词优化
1. ** Frontmatter 标题唯一且明确**：`title` 必须直接包含玩家常搜的关键词（如“常用命令”而非“指令”、“领地圈地”而非“圈地”）。
2. **填写简明扼要的 `description`**：该描述会在搜索框匹配结果下方展示，长度建议在 15-40 字之间。

### 10.2 页面内容可索引性
- 所有正文段落及加粗文本均会被搜索索引覆盖。
- 重要的指令或名称（如 `/res`、`星露谷`）请使用代码标记或加粗包裹，避免错别字或俚语。

---

## 11. Git 提交规范与社区 PR 审核流程

### 11.1 Commit 提交规范
提交 Git 变更时，提交信息应采用规范的前缀，格式为：`<类型>: <简要描述>`

推荐类型：
- `docs`：文档新增、修改或纠错（如 `docs: 更新新手指南命令说明`）
- `fix`：修复代码、图片路径错误或页面样式缺陷
- `feat`：上线全新组件或交互功能
- `style`：代码格式化或排版调整，不涉及逻辑与内容改变

### 11.2 社区玩家 PR 审核 SOP
当社区玩家对维基提交 Pull Request (PR) 时，编辑应执行以下检查：

1. **格式检查**：确认新增 `.mdx` 文件包含了标准的 Frontmatter 头部（`title`, `description`）。
2. **导航注册**：检查是否同步更新了所在目录的 `meta.json`。
3. **资源校验**：若包含图片，确认图片存放在 `public/wiki-img/` 目录下且没有链接失效。
4. **字符合规**：确认提交内容中没有违规、广告或不符合要求的 emoji/特殊字符。
5. **打包验证**：在本地运行 `pnpm build` 确认编译无错误后方可批准合并（Approve & Merge）。

---

## 12. 编译服务器与打包测试

在提交更新前，建议在本地进行完整的编译检查，确保没有语法错误或类型断言失败。

### 12.1 检查类型与代码格式
在项目根目录运行：

```bash
# 代码格式与规范检查
pnpm lint

# TypeScript 类型检查
pnpm types:check
```

### 12.2 根目录打包编译
执行 Turborepo 全局构建：

```bash
pnpm build
```

### 12.3 本地测试静态导出产物
本项目部署至 GitHub Pages，需要导出静态 HTML 文件。本地测试静态导出流程如下：

```bash
cd apps/docs
NODE_ENV=production pnpm build
```

构建完成后，编译产物将生成在 `apps/docs/out/` 目录中。可使用以下命令本地启动静态服务测试：

```bash
npx serve apps/docs/out -l 4173
```

在浏览器访问：

```
http://localhost:4173/XCloudWiki
```

检查是否有页面 404 或资源加载失败的情况。

---

## 13. 提交代码与自动部署流程

闲云维基已配置 GitHub Actions 自动化部署工作流。当你向 `main` 分支推送代码时，系统会自动完成构建并发布至 GitHub Pages。

### 13.1 提交步骤
在本地完成修改并测试无误后，执行标准 Git 操作：

```bash
# 1. 查看改动的文件
git status

# 2. 将修改添加到暂存区
git add .

# 3. 提交本地变更（说明修改内容）
git commit -m "docs: 新增宠物系统玩法文档"

# 4. 推送到远程主分支
git push origin main
```

### 13.2 查看部署进度
推送成功后：
1. 打开 GitHub 仓库页面：`https://github.com/c-4-c-4/XCloudWiki`
2. 点击顶部导航栏的 **Actions** 选项卡。
3. 查看最新的 `Deploy Next.js site to Pages` 工作流运行状态。
4. 部署完成后，在线站点将自动更新：`https://c-4-c-4.github.io/XCloudWiki`

---

## 14. 常见问题排查

### 14.1 新新建的页面在侧边栏找不到
- **原因**：没有将新的文件名添加到对应目录下的 `meta.json` 的 `pages` 数组中。
- **解决**：检查并编辑该目录下的 `meta.json` 文件，添加不带 `.mdx` 后缀的文件名。

### 14.2 安装依赖失败 (`pnpm install` 报错)
- **原因**：Node.js 版本低于 `24.14.0` 或 pnpm 版本不对。
- **解决**：检查 `node -v`，升级 Node.js 至最新 LTS 版本后再试。

### 14.3 启动服务器报错 (`pnpm dev` 端口占用)
- **原因**：3000 端口已被其他程序占用。
- **解决**：关闭占用 3000 端口的服务，或直接进入 `apps/docs` 目录运行 `pnpm dev --port 3001` 指定新端口。

### 14.4 编译时提示 `Route couldn't be rendered statically`
- **原因**：页面中引入了只能在服务端运行的动态路由或动态 API。
- **解决**：由于 GitHub Pages 仅支持静态托管，请确保页面不使用动态服务端搜索参数或 Server Actions。

---

感谢你对闲云维基的贡献！如有任何疑问，请联系闲云服务器开发运维团队。
