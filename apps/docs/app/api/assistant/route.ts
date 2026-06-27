import fs from 'node:fs';
import path from 'node:path';
import { NextRequest } from 'next/server';

// 意图路由分类 Prompt
const ROUTE_SYSTEM_PROMPT = `你是一个路由分类器。你的唯一任务是根据用户关于“我的世界闲云服务器”的提问，选择与其最相关的知识库分类。
知识库分类及描述如下：
- About: 闲云服务器的介绍、团队成员列表、分工及网站所用技术栈。如果问题中提到了开发与维护团队成员或内容贡献者如【CCCC4444、星(xing)、laccket、Sa1nt_Hal0、Love_Story、abnormalclarke、Yep、XiaoLiYu777、xuan562、sickle、84531、satori1024】，请务必选择本类！
- BasicInfo: 服务器的基础信息，包括客户端版本（1.21.11）、下载地址、服主安全警示、服务器使用须知、基本行为规范、聊天规范、小镇群聊规范、账号管理规定、违规处罚标准与举报奖励。
- BeginnersGuide: 新手起步教程，包含加入方法、QQ群操作、账号绑定与验证、主城NPC坐标及坐标提供者、闲云地图一键传送、阶段一启航和阶段二进阶发展的各项新手任务指引、各个世界（闲云镇、生存世界、冒险世界）的介绍与进入菜单传送方式。
- Expandedgameplay: 服务器的拓展特色玩法，包括铁匠系统、职业系统、拓展附魔书系统、钓鱼系统、小镇系统、星露谷作物系统、世界Boss玩法。
- PlayerCommunity: 玩家社区与小镇奇观展示。如果你看到提问中提到了以下具体的小镇名称：【圣诞小镇、云朵小镇、金鸢尾兰、尤克特拉希尔、噶拿给木小镇】，或者提到了以下奇观建筑名称：【晨渊港、寂静庄园、爱莉希雅】，或者提到了镇长与领主名称如【StyleYM、YunDuo_BB、M1Ne1Ga、kakaxi、xiaoapiao、CccMeow】，请务必选择本类！
- Tools: 工具专题，包括一键换肤工具（MineSkin API）、圈地/领地价格计算器、附魔抽奖模拟器、投影转换/投影三视图/像素画工具、服务状态监控。
- Other: 其他杂项文档，如封神榜榜单、天梯排行榜、维护时间轴等。
- WikiBlog: 百科Wiki网站本身的更新日志、底座重构、新展示页面发布日志。
- ServerBlog: 游戏服务器本身的玩法更新、bug修复、新世界boss上线、日常优化与活动发布等服务器更新日志。
- none: 如果问题与闲云服务器完全无关，或者纯粹是普通的日常打招呼或闲聊（如“你好”、“你是谁”等），或者要求写代码/翻译等。

【核心分类规则】：
1. 默认用户所有的提问都是关于本“我的世界闲云服务器”的，即使问题中没有出现“闲云”或“服务器”字眼（例如“版本是多少”指的就是闲云服务器的客户端版本；“如何绑定账号”指的就是在闲云服务器中如何绑定账号；“CCCC4444是谁”或“xuan562是谁”指的就是本服务器核心团队成员）。你应当智能推断提问对应的分类。
2. 只有当提问纯粹是日常打招呼、无意义闲聊、或者要求写通用代码、翻译等与本服务器玩法及文档信息毫无关联的问题时，才返回 "none"。

你必须且只能返回上述分类名称之一（如 "BasicInfo" 或 "none"），严禁输出任何其他字符、括号、标点符号或解释！`;

// 最终问答 System Prompt
const FINAL_SYSTEM_PROMPT = `你是一个专业的“我的世界闲云服务器”助手，名叫“闲云助手”。
你的职责是根据提供的背景知识（Context）来回答玩家的问题。

【核心限制规则 - 必须严格遵守】：
1. 你只能基于提供的背景知识（Context）进行回答。回答必须完全忠实于 Context 中的事实，不得凭空捏造。
2. 如果背景知识（Context）中没有提到相关内容，或者无法从中得出答案，你必须且只能回答：“我无法回答此问题！”，严禁说任何其他多余废话，严禁透露你无法回答的原因，严禁利用你自身的预训练知识进行回答或补充。
3. 你的回答必须专业、友好、简洁，且只包含与 Context 相关的确凿信息。`;

// 模拟 SSE 返回“我无法回答此问题！”
function makeInterceptResponse(reason = 'none'): Response {
  const text = "我无法回答此问题！";
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const payload = {
        choices: [
          {
            delta: { content: text },
            finish_reason: "stop"
          }
        ]
      };
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
      controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
      controller.close();
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Debug-Class': 'none',
      'X-Debug-Reason': reason
    }
  });
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Messages are required' }), { status: 400 });
    }

    // 获取最新提问
    const userQuestion = messages[messages.length - 1].content || '';
    if (!userQuestion.trim()) {
      return makeInterceptResponse('empty_question');
    }

    const apiKey = process.env.ZHIPU_API_KEY;
    if (!apiKey) {
      console.error('ZHIPU_API_KEY is not configured in .env');
      return new Response(JSON.stringify({ error: 'AI Service Key not configured' }), { status: 500 });
    }

    // 1. 进行快速意图路由分类
    console.log(`Routing question: "${userQuestion}"`);
    const routeResponse = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'glm-4-flash',
        messages: [
          { role: 'system', content: ROUTE_SYSTEM_PROMPT },
          { role: 'user', content: userQuestion }
        ],
        max_tokens: 15,
        temperature: 0.1
      })
    });

    if (!routeResponse.ok) {
      const errText = await routeResponse.text();
      console.error('Zhipu route request failed:', errText);
      return new Response(JSON.stringify({ error: 'Route request failed' }), { status: 502 });
    }

    const routeData = await routeResponse.json();
    const classification = routeData.choices[0]?.message?.content?.trim() || 'none';
    console.log(`Route result raw output: "${classification}"`);

    // 2. 解析分类名称（支持中文、英文及常用关键词智能匹配）
    const classificationMap: { [key: string]: string[] } = {
      'About': ['about', '关于', '团队', '介绍', 'cccc4444', 'love_story', 'sa1nt_hal0', 'laccket', 'abnormalclarke', 'xiaoliyu777', 'xuan562', 'sickle', 'yep', '84531', '星', 'xing', 'satori1024'],
      'BasicInfo': ['basicinfo', '基础信息', '规则', '守则', '须知', '规定'],
      'BeginnersGuide': ['beginnersguide', '新手教程', '新手指南', '起步', '入门', '加入'],
      'Expandedgameplay': ['expandedgameplay', '拓展玩法', '职业', '铁匠', '附魔书', '鱼', '钓鱼', '小镇'],
      'PlayerCommunity': ['playercommunity', '玩家社区', '展示', '作品', 'styleym', 'yunduo_bb', 'm1ne1ga', 'kakaxi', 'xiaoapiao', 'cccmeow'],
      'Tools': ['tools', '工具', '计算器', '模拟器', '监控', '皮肤'],
      'Other': ['other', '其他'],
      'WikiBlog': ['wikiblog', 'wiki更新', 'wiki日志', '百科更新'],
      'ServerBlog': ['serverblog', '服务器更新', '服务器日志', '更新日志']
    };

    let targetClass = 'none';
    const lowerClassification = classification.toLowerCase();

    for (const [clsName, keywords] of Object.entries(classificationMap)) {
      const match = keywords.some(keyword => lowerClassification.includes(keyword.toLowerCase()));
      if (match) {
        targetClass = clsName;
        break;
      }
    }
    console.log(`Matched target classification: "${targetClass}"`);

    // 3. 拦截无关提问
    if (targetClass === 'none') {
      console.log(`Question classified as "none" or unrelated (Raw: "${classification}"). Intercepting.`);
      return makeInterceptResponse(`classification_none_raw_${classification}`);
    }

    // 4. 读取对应技能文件作为背景知识
    const skillPath = path.join(process.cwd(), 'public', 'skills', `${targetClass}.skill`);
    if (!fs.existsSync(skillPath)) {
      console.warn(`Skill file not found at: ${skillPath}. Intercepting.`);
      return makeInterceptResponse('skill_file_not_found');
    }

    console.log(`Loading context from: ${targetClass}.skill`);
    const context = fs.readFileSync(skillPath, 'utf-8');

    // 5. 调用智谱流式最终问答接口
    const finalResponse = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'glm-4.5-air',
        messages: [
          { role: 'system', content: FINAL_SYSTEM_PROMPT },
          { role: 'user', content: `Context 内容如下：\n\n${context}\n\n当前用户的问题 is：${userQuestion}` }
        ],
        temperature: 0.2,
        stream: true
      })
    });

    if (!finalResponse.ok) {
      const errText = await finalResponse.text();
      console.error('Zhipu chat request failed:', errText);
      return new Response(JSON.stringify({ error: 'Chat request failed' }), { status: 502 });
    }

    // 6. 返回流式 Response 转发给前端
    return new Response(finalResponse.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Debug-Class': targetClass
      }
    });

  } catch (err) {
    console.error('API assistant error:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
