import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const DOCS_CONTENT_DIR = path.join(process.cwd(), 'content', 'docs');
const BLOG_CONTENT_DIR = path.join(process.cwd(), 'content', 'blog');
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'skills');

// 清理 MDX 内容的辅助函数
function cleanMdx(content: string): string {
  let text = content;

  // 1. 移除 import 语句
  text = text.replace(/^import\s+[\s\S]*?from\s+['"].*?['"];?\r?\n/gm, '');
  text = text.replace(/^import\s+.*?;\r?\n/gm, '');

  // 2. 处理 Callout 块
  let lastText;
  do {
    lastText = text;
    text = text.replace(/<Callout\s+(?:type="([^"]*)")?\s*(?:title="([^"]*)")?\s*>([\s\S]*?)<\/Callout>/g, (match, type, title, body) => {
      const alertType = (type || 'info').toUpperCase();
      const alertTitle = title ? ` ${title}` : '';
      const bodyLines = body.trim().split('\n').map((line: string) => `> ${line}`).join('\n');
      return `> [!${alertType}]${alertTitle}\n${bodyLines}\n`;
    });
  } while (text !== lastText);

  // 3. 移除 <style>、<script>、<svg> 及其内部的所有内容
  text = text.replace(/<(style|script|svg)[^>]*?>[\s\S]*?<\/\1>/gi, '');

  // 4. 移除所有其他 HTML/JSX 标签（支持匹配带大括号等复杂属性的标签）
  text = text.replace(/<\/?[a-zA-Z][a-zA-Z0-9:-]*(?:\s+[\s\S]*?)?\/?>/g, '');

  // 5. 移除图片
  text = text.replace(/!\[(.*?)\]\((.*?)\)/g, '[图片: $1]');

  // 6. 逐行处理，过滤 HTML 嵌套留下的冗余缩进，并保留 markdown 列表层级
  text = text.split('\n').map(line => {
    let cleaned = line;
    
    // 移除 MDX/HTML 注释
    cleaned = cleaned.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
    cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '');

    // 匹配 Markdown 列表 (如 "- item" 或 "1. item")
    const listMatch = cleaned.match(/^(\s*)([-*+]|\d+\.)\s+(.*)$/);
    if (listMatch) {
      return `${listMatch[1]}${listMatch[2]} ${listMatch[3].trim()}`;
    }
    
    return cleaned.trim();
  }).join('\n');

  // 7. 替换常见 HTML 实体
  text = text.replace(/&nbsp;/g, ' ')
             .replace(/&lt;/g, '<')
             .replace(/&gt;/g, '>')
             .replace(/&amp;/g, '&')
             .replace(/&quot;/g, '"');

  // 8. 合并多余的空行
  text = text.replace(/\n{3,}/g, '\n\n');

  return text.trim();
}

// 从组件源码中提取结构化的小镇和奇观数据的辅助函数
function getTownsAndWondersMarkdown(): string {
  let markdown = '';
  
  // 1. 读取并解析小镇数据 (town.tsx)
  const townPath = path.join(process.cwd(), 'components', 'custom', 'town.tsx');
  if (fs.existsSync(townPath)) {
    const townFileContent = fs.readFileSync(townPath, 'utf-8');
    const townBlocks = townFileContent.match(/\{\s*name:[\s\S]*?\}/g) || [];
    const towns = townBlocks.map(block => {
      const name = block.match(/name:\s*['"](.*?)['"]/)?.[1] || '';
      const mayor = block.match(/mayor:\s*['"](.*?)['"]/)?.[1] || '';
      const zone = block.match(/zone:\s*['"](.*?)['"]/)?.[1] || '';
      const population = block.match(/population:\s*['"](.*?)['"]/)?.[1] || '';
      const treeLevel = block.match(/treeLevel:\s*['"](.*?)['"]/)?.[1] || '';
      const townLevel = block.match(/townLevel:\s*(\d+)/)?.[1] || '';
      const createDate = block.match(/createDate:\s*['"](.*?)['"]/)?.[1] || '';
      const status = block.match(/status:\s*['"](.*?)['"]/)?.[1] || '';
      const tpCommand = block.match(/tpCommand:\s*['"](.*?)['"]/)?.[1] || '';
      const desc = block.match(/desc:\s*['"]([\s\S]*?)['"]/)?.[1] || '';
      return { name, mayor, zone, population, treeLevel, townLevel, createDate, status, tpCommand, desc };
    }).filter(t => t.name !== '');

    if (towns.length > 0) {
      markdown += `\n\n# 玩家小镇详细登记数据\n\n`;
      markdown += `| 小镇名称 | 镇长 (Mayor) | 所在分区 | 居民总人数 | 神树等级 | 小镇等级 | 创镇时间 | 招新状态 | 传送指令 | 介绍与描述 |\n`;
      markdown += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;
      for (const t of towns) {
        const cleanDesc = t.desc.replace(/\r?\n/g, ' ');
        markdown += `| ${t.name} | ${t.mayor} | ${t.zone} | ${t.population} | ${t.treeLevel} | ${t.townLevel}级 | ${t.createDate} | ${t.status} | \`${t.tpCommand}\` | ${cleanDesc} |\n`;
      }
    }
  }

  // 2. 读取并解析奇观数据 (wonder.tsx)
  const wonderPath = path.join(process.cwd(), 'components', 'custom', 'wonder.tsx');
  if (fs.existsSync(wonderPath)) {
    const wonderFileContent = fs.readFileSync(wonderPath, 'utf-8');
    const wonderBlocks = wonderFileContent.match(/\{\s*name:[\s\S]*?\}/g) || [];
    const wonders = wonderBlocks.map(block => {
      const name = block.match(/name:\s*['"](.*?)['"]/)?.[1] || '';
      const belong = block.match(/belong:\s*['"](.*?)['"]/)?.[1] || '';
      const mayor = block.match(/mayor:\s*['"](.*?)['"]/)?.[1] || '';
      const desc = block.match(/desc:\s*['"]([\s\S]*?)['"]/)?.[1] || '';
      return { name, belong, mayor, desc };
    }).filter(w => w.name !== '');

    if (wonders.length > 0) {
      markdown += `\n\n# 官方奇观建筑详细登记数据\n\n`;
      for (const w of wonders) {
        markdown += `### 奇观 - ${w.name}\n`;
        markdown += `- **奇观归属**：${w.belong}\n`;
        markdown += `- **奇观领主**：${w.mayor}\n`;
        markdown += `- **奇观介绍**：\n${w.desc.split('\n').map(line => `  ${line}`).join('\n')}\n\n`;
      }
    }
  }

  return markdown;
}

// 从组件源码中静态解析 sponsors 页面人物数据的辅助函数
function getSponsorsTeamMarkdown(): string {
  let markdown = '';
  const dataPath = path.join(process.cwd(), 'app', '(home)', 'sponsors', 'data.tsx');
  if (fs.existsSync(dataPath)) {
    const fileContent = fs.readFileSync(dataPath, 'utf-8');
    // 使用非贪婪匹配获取每一个成员的数据对象
    const blocks = fileContent.match(/\{\s*name:[\s\S]*?\}\s*(?:,|\])/g) || [];
    const members = blocks.map(block => {
      const name = block.match(/name:\s*['"](.*?)['"]/)?.[1] || '';
      const role = block.match(/role:\s*['"](.*?)['"]/)?.[1] || '';
      const badge = block.match(/badge:\s*['"](.*?)['"]/)?.[1] || '';
      const description = block.match(/description:\s*['"]([\s\S]*?)['"]/)?.[1] || '';
      return { name, role, badge, description };
    }).filter(m => m.name !== '');

    if (members.length > 0) {
      markdown += `\n\n# 闲云制作组与内容贡献者荣誉殿堂（Sponsors）\n\n`;
      markdown += `| 成员姓名 | 角色职位 (Role) | 勋章称号 | 贡献与职责描述 |\n`;
      markdown += `| :--- | :--- | :--- | :--- |\n`;
      for (const m of members) {
        const cleanDesc = m.description.replace(/\r?\n/g, ' ');
        markdown += `| ${m.name} | ${m.role} | ${m.badge} | ${cleanDesc} |\n`;
      }
    }
  }
  return markdown;
}

async function generateSkills() {
  console.log('Starting skill files generation...');

  // 确保输出目录存在
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // 1. 处理文档大分类
  const docsMetaPath = path.join(DOCS_CONTENT_DIR, 'meta.json');
  if (fs.existsSync(docsMetaPath)) {
    const docsMeta = JSON.parse(fs.readFileSync(docsMetaPath, 'utf-8'));
    const categories = docsMeta.pages || [];

    for (const cat of categories) {
      if (cat.startsWith('(') && cat.endsWith(')')) {
        // 忽略虚拟分类如 (framework)
        continue;
      }

      const catDirPath = path.join(DOCS_CONTENT_DIR, cat);
      const catMetaPath = path.join(catDirPath, 'meta.json');

      if (fs.existsSync(catDirPath) && fs.existsSync(catMetaPath)) {
        const catMeta = JSON.parse(fs.readFileSync(catMetaPath, 'utf-8'));
        const catTitle = catMeta.title || cat;
        const catDesc = catMeta.description || '';
        
        console.log(`Processing category: ${catTitle} (${cat})...`);

        let pages: string[] = [];
        if (catMeta.pages && catMeta.pages.length > 0 && catMeta.pages[0] !== '...') {
          pages = catMeta.pages;
        } else {
          // 读取目录下所有的 .mdx 文件，排除 meta.json 并按字母排序
          pages = fs.readdirSync(catDirPath)
            .filter(file => file.endsWith('.mdx') && file !== 'meta.json')
            .map(file => path.basename(file, '.mdx'));
        }

        let skillContent = `# 闲云服务器知识库 - ${catTitle}\n\n`;
        if (catDesc) {
          skillContent += `> 类别描述：${catDesc}\n\n`;
        }
        skillContent += `本技能文件包含了闲云服务器“${catTitle}”板块的详细规则与玩法说明。\n\n`;

        let hasContent = false;

        for (const page of pages) {
          // 如果是 Other 分类下的 About.mdx，单独生成，不合并到 Other.skill 中
          if (cat === 'Other' && page === 'About') {
            continue;
          }

          const pagePath = path.join(catDirPath, `${page}.mdx`);
          if (fs.existsSync(pagePath)) {
            const rawContent = fs.readFileSync(pagePath, 'utf-8');
            const parsed = matter(rawContent);
            const title = parsed.data.title || page;
            const desc = parsed.data.description || '';
            const cleaned = cleanMdx(parsed.content);

            if (cleaned) {
              skillContent += `## ${title}\n`;
              if (desc) {
                skillContent += `> 页面描述：${desc}\n\n`;
              }
              skillContent += `${cleaned}\n\n---\n\n`;
              hasContent = true;
            }
          }
        }

        if (hasContent) {
          if (cat === 'PlayerCommunity') {
            skillContent += getTownsAndWondersMarkdown();
          }
          const outputPath = path.join(OUTPUT_DIR, `${cat}.skill`);
          fs.writeFileSync(outputPath, skillContent.trim(), 'utf-8');
          console.log(`Saved skill file: ${cat}.skill`);
        }
      }
    }
  }

  // 2. 单独处理关于页面 (Other/About.mdx)
  const aboutPath = path.join(DOCS_CONTENT_DIR, 'Other', 'About.mdx');
  if (fs.existsSync(aboutPath)) {
    console.log('Processing About page...');
    const rawContent = fs.readFileSync(aboutPath, 'utf-8');
    const parsed = matter(rawContent);
    const title = parsed.data.title || '关于';
    const desc = parsed.data.description || '';
    const cleaned = cleanMdx(parsed.content);

    let aboutSkillContent = `# 闲云服务器知识库 - ${title}\n\n`;
    if (desc) {
      aboutSkillContent += `> 描述：${desc}\n\n`;
    }
    aboutSkillContent += `${cleaned}`;
    aboutSkillContent += getSponsorsTeamMarkdown();

    const outputPath = path.join(OUTPUT_DIR, 'About.skill');
    fs.writeFileSync(outputPath, aboutSkillContent.trim(), 'utf-8');
    console.log('Saved skill file: About.skill');
  }

  // 3. 处理日志分类 (blog)
  if (fs.existsSync(BLOG_CONTENT_DIR)) {
    console.log('Processing Blog/Logs...');
    const blogFiles = fs.readdirSync(BLOG_CONTENT_DIR)
      .filter(file => file.endsWith('.mdx') && file !== 'placeholder.mdx');

    const wikiBlogs: any[] = [];
    const serverBlogs: any[] = [];

    for (const file of blogFiles) {
      const filePath = path.join(BLOG_CONTENT_DIR, file);
      const rawContent = fs.readFileSync(filePath, 'utf-8');
      const parsed = matter(rawContent);
      const type = parsed.data.type;
      
      const blogData = {
        title: parsed.data.title || path.basename(file, '.mdx'),
        date: parsed.data.date ? new Date(parsed.data.date).toISOString().split('T')[0] : '',
        author: parsed.data.author || '管理员',
        description: parsed.data.description || '',
        content: cleanMdx(parsed.content)
      };

      if (type === 'wiki') {
        wikiBlogs.push(blogData);
      } else if (type === 'server') {
        serverBlogs.push(blogData);
      }
    }

    // 按日期从新到旧排序
    const sortByDateDesc = (a: any, b: any) => {
      return b.date.localeCompare(a.date);
    };

    wikiBlogs.sort(sortByDateDesc);
    serverBlogs.sort(sortByDateDesc);

    // 生成 Wiki 更新日志技能文件
    if (wikiBlogs.length > 0) {
      let wikiContent = `# 闲云服务器知识库 - Wiki 更新日志\n\n本技能文件记录了闲云社区百科（Wiki）的所有历史更新、架构调整及新功能发布情况。\n\n`;
      for (const blog of wikiBlogs) {
        wikiContent += `## ${blog.date} - ${blog.title}\n`;
        wikiContent += `**编辑作者**: ${blog.author}\n`;
        if (blog.description) {
          wikiContent += `**更新描述**: ${blog.description}\n`;
        }
        wikiContent += `\n${blog.content}\n\n---\n\n`;
      }
      const outputPath = path.join(OUTPUT_DIR, 'WikiBlog.skill');
      fs.writeFileSync(outputPath, wikiContent.trim(), 'utf-8');
      console.log('Saved skill file: WikiBlog.skill');
    }

    // 生成 服务器更新日志技能文件
    if (serverBlogs.length > 0) {
      let serverContent = `# 闲云服务器知识库 - 服务器更新日志\n\n本技能文件记录了闲云 Minecraft 服务器的游戏内容更新、系统优化、玩法拓展及 bug 修复历史记录。\n\n`;
      for (const blog of serverBlogs) {
        serverContent += `## ${blog.date} - ${blog.title}\n`;
        serverContent += `**发布作者**: ${blog.author}\n`;
        if (blog.description) {
          serverContent += `**更新描述**: ${blog.description}\n`;
        }
        serverContent += `\n${blog.content}\n\n---\n\n`;
      }
      const outputPath = path.join(OUTPUT_DIR, 'ServerBlog.skill');
      fs.writeFileSync(outputPath, serverContent.trim(), 'utf-8');
      console.log('Saved skill file: ServerBlog.skill');
    }
  }

  console.log('Successfully completed skill files generation!');
}

export { generateSkills };

if (import.meta.url.endsWith(process.argv[1]) || (process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('scripts/generate-skills.ts'))) {
  generateSkills().catch((err) => {
    console.error('Error generating skill files:', err);
    process.exit(1);
  });
}
