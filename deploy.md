# GitHub Pages 部署指南

本文档介绍如何将 XCloudWiki 项目部署到 GitHub Pages。

## 前置条件

- 一个 GitHub 仓库（本仓库）
- Node.js >= 18
- pnpm 包管理器

## 部署架构

```
本地开发 (localhost:3000)
    ↓ push main 分支
GitHub Actions 自动构建
    ↓ next build (output: export)
生成静态文件到 apps/docs/out
    ↓
GitHub Pages 托管
    ↓
https://<你的用户名>.github.io/XCloudWiki
```

## 核心配置说明

### 1. Next.js 配置 (`apps/docs/next.config.mts`)

项目采用**环境分离策略**：开发环境与生产环境使用不同配置。

| 配置项 | 开发环境 | 生产环境 (GitHub Pages) |
|--------|---------|----------------------|
| `output` | 不设置（开发服务器） | `'export'`（静态导出） |
| `basePath` | `''`（根路径） | `'/XCloudWiki'` |
| `images.unoptimized` | `true` | `true` |

关键代码：

```typescript
const isProduction = process.env.NODE_ENV === 'production';

const config: NextConfig = {
  ...(isProduction ? { output: 'export' as const } : {}),
  basePath: isProduction ? '/XCloudWiki' : '',
  images: { unoptimized: true },
};
```

### 2. Base URL 配置 (`apps/docs/lib/metadata.ts`)

通过环境变量控制站点 URL，支持本地开发和线上部署：

```typescript
export const baseUrl = new URL(
  process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000',
);
```

- **本地开发**：默认使用 `http://localhost:3000`
- **生产部署**：在 GitHub Actions 中设置 `NEXT_PUBLIC_BASE_URL=https://<用户名>.github.io/XCloudWiki`

### 3. GitHub Actions 工作流 (`.github/workflows/deploy.yml`)

自动化构建和部署流程，触发条件：
- 推送到 `main` 分支
- 手动触发 (`workflow_dispatch`)

工作流步骤：
1. 检出代码 → 2. 安装 pnpm → 3. 安装 Node.js 24 → 4. 配置 Pages
5. 安装依赖 → 6. 构建包 → 7. 构建文档站点 → 8. 上传静态文件 → 9. 部署

## 首次部署步骤

### Step 1: 启用 GitHub Pages

1. 进入仓库 **Settings** → **Pages**
2. 在 **Source** 中选择 **GitHub Actions**
   > 不要选择 "Deploy from a branch"，必须选择 GitHub Actions 方式

### Step 2: 设置环境变量（可选）

如果需要自定义域名或调整 baseUrl，进入仓库 **Settings** → **Environments** → **github-pages**：

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `NEXT_PUBLIC_BASE_URL` | 站点基础 URL | `https://你的用户名.github.io/XCloudWiki` |

> 如果不设置，将使用 metadata.ts 中的默认值。

### Step 3: 推送代码触发部署

```bash
git add .
git commit -m "初始化 GitHub Pages 部署配置"
git push origin main
```

推送后，进入仓库 **Actions** 页面查看构建进度。

### Step 4: 访问站点

部署成功后，访问：

```
https://<你的用户名>.github.io/XCloudWiki
```

## 本地开发

### 启动开发服务器

```bash
cd apps/docs
pnpm dev
```

访问 http://localhost:3000

### 本地测试静态构建

```bash
cd apps/docs
NODE_ENV=production pnpm build
```

构建产物位于 `apps/docs/out/` 目录。可使用以下命令预览：

```bash
npx serve apps/docs/out -l 4173
```

然后访问 http://localhost:4173/XCloudWiki

## 已做的适配修改

为兼容 GitHub Pages 静态托管，对原项目做了以下修改：

### 移除的服务端功能

| 功能 | 文件 | 原因 |
|------|------|------|
| API 路由 | `app/api/*` | GitHub Pages 不支持服务端 API |
| Server Actions | `lib/github.ts` | 静态导出不支持 `'use server'` |
| Feedback 组件 | `app/docs/[...slug]/page.tsx` | 依赖 Server Actions |
| OG 图片生成 | `app/api/og/*` | 依赖原生模块 @takumi-rs/image-response |
| 中间件 | `plugin.ts.disabled` | 重写规则不适用于静态托管 |

### 新增的适配文件

| 文件 | 用途 |
|------|------|
| `lib/github-constants.ts` | 提取 owner/repo 常量，避免引入 Server Actions |
| `.github/workflows/deploy.yml` | GitHub Actions 自动化部署工作流 |

### 修改的现有文件

| 文件 | 修改内容 |
|------|----------|
| `next.config.mts` | 条件性启用 output/export 和 basePath |
| `lib/metadata.ts` | baseUrl 改为读取环境变量 |
| `components/preview/index.tsx` | 导入来源改为 github-constants |
| `app/(home)/page.tsx` | 导入来源改为 github-constants |
| `app/(home)/sponsors/page.tsx` | 导入来源改为 github-constants |

## 自定义域名（可选）

如需使用自定义域名：

1. 在仓库 **Settings** → **Pages** → **Custom domain** 中输入域名
2. 在 DNS 服务商处添加 CNAME 记录指向 `<你的用户名>.github.io`
3. 等待 DNS 生效（通常几分钟到几小时）
4. 更新 `NEXT_PUBLIC_BASE_URL` 为你的自定义域名

## 故障排查

### 构建失败

**问题**：`Route with dynamic = "error" couldn't be rendered statically`
- **原因**：页面使用了动态渲染功能（如 searchParams）
- **解决**：确保所有页面可在构建时预渲染

**问题**：Module not found errors
- **原因**：引用了不存在的模块或被删除的 API 路由
- **解决**：检查导入路径是否正确

### 部署后 404

**问题**：访问首页返回 404
- **原因**：basePath 与实际路径不匹配
- **解决**：确认访问地址包含 `/XCloudWiki` 路径前缀

**问题**：子页面 404
- **原因**：静态导出时未生成对应路由
- **解决**：检查页面是否有 `generateStaticParams()` 或是否为纯静态页面

### 样式异常

**问题**：CSS 加载失败
- **原因**：资源路径错误
- **解决**：确认 `basePath` 配置正确，所有静态资源使用相对路径

## 相关链接

- [Next.js 静态导出文档](https://nextjs.org/docs/pages/building-your-application/deploying/static-exports)
- [GitHub Pages 官方文档](https://docs.github.com/en/pages)
- [GitHub Actions 部署文档](https://docs.github.com/en/actions/deployment/deploying-github-actions-to-github-pages)
