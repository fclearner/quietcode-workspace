# Workspace · 本地算法练习台

一个低干扰、无需账号的本地算法练习服务。题库、代码执行、隐藏判题、学习计划和本地学习教练均可离线运行；**不需要 Codex、OpenAI API Key、数据库或第三方 npm 依赖**。

## 功能概览

- 3,257 条公司题目索引，覆盖 470 家公司，支持搜索、筛选、排序、收藏和随机选择。
- JavaScript、Python 3、C++17 的标准输入/输出运行环境。
- 5 道完整本地练习：Two Sum、Valid Parentheses、Best Time to Buy and Sell Stock、LRU Cache、Design HashSet。
- 完整题包含中文题面、三语言 TODO 模板、公开样例和服务端隐藏用例，通过后才解锁参考实现。
- 自适应学习计划会根据完成情况、失败次数、通过率、连续练习天数和薄弱标签调整队列。
- 本地学习教练不依赖模型，可给出数据结构、边界条件和失败用例方向的逐级提示。
- 检测到已登录的 Codex CLI 时，可自动启用更细致的教练增强；调用失败会无感降级到本地提示。
- 草稿自动保存、解题笔记、自定义测试、提交历史、活动热力图、深色模式和进度导入/导出。

## 快速开始

要求 Node.js 20 或更高版本。项目没有 npm 运行时依赖，克隆后直接启动：

```bash
cd leetcode-local-app
npm start
```

打开 <http://127.0.0.1:3210>。

不同语言的额外要求：

- JavaScript：随 Node.js 提供，无需额外安装。
- Python：运行 Python 答案时需要 `python3`。
- C++：运行 C++17 答案时需要 `g++`。

更换端口：

```bash
PORT=8080 npm start
```

服务默认只监听 `127.0.0.1`，不会暴露给局域网或公网。

## 无 Codex 模式

Codex 是可选增强，不是安装条件。没有安装 Codex CLI 时：

- 题库、代码运行、判题、学习计划和所有进度功能照常工作。
- “问教练”使用内置的本地规则，根据题目标签、当前代码和运行结果给出提示。
- 代码和测试结果不会因本地教练而离开电脑。

如需明确禁用 Codex 自动检测：

```bash
DISABLE_CODEX_COACH=1 npm start
```

如果本机已经安装并登录 Codex CLI，教练会使用临时、只读的 `codex exec` 调用生成建议。只有主动提问时才会发送当前题目、代码、测试结果和最近对话；失败时自动回退到本地模式。

## 题库内容边界

上游公司题库只提供标题、难度、标签、频率和原题链接，不包含可重新分发的完整题面、函数签名或官方测试。因此本项目明确区分：

- **本地可练**：内容审计通过，可直接运行并接受隐藏判题。
- **外部题目索引**：保留公司和频率信息，详情页提供来源链接及通用标准输入/输出编辑器，不会伪装成完整本地题。

学习计划只推荐“本地可练”内容，避免打开推荐项后发现题面为空。可以运行以下命令检查内容完整性：

```bash
npm run audit
```

当前审计结果为 5 道完整本地题、3,252 条外部索引、0 个异常。

## 学习计划如何调整

- 尝试过但尚未完成的内容优先回到队列。
- 连续失败会提高同主题巩固权重，并在正确率较低时降低目标难度。
- 稳定通过后逐步增加中等难度与方法迁移训练。
- 完成超过七天的内容进入间隔复盘候选。
- 旧版学习记录与隐藏判题验证状态分开保存，升级判题不会重置学习进度。

## 数据与隐私

- 练习进度、草稿、笔记和教练对话保存在浏览器 `localStorage`，不写入 Git 仓库。
- “进度”页面可手动导出 JSON 备份；备份文件名和常见本地数据目录已加入 `.gitignore`。
- 本地教练不上传代码。Codex 增强模式的发送范围会在教练窗口底部明确提示。
- 项目没有用户系统、Cookie、统计脚本或远程数据库。

清除浏览器站点数据会删除本地记录，请定期导出备份。

## 常用命令

```bash
npm start       # 启动服务
npm run dev     # 监听服务端文件变化并重启
npm test        # 运行全部自动化测试
npm run audit   # 审计完整题面、模板、答案和隐藏用例
npm run import  # 从相邻的上游题库仓库重新生成 data/problems.json
```

`npm run import` 仅用于维护题库，要求目录结构如下；普通使用者不需要执行：

```text
parent/
├── leetcode-company-wise-problems/
└── leetcode-local-app/
```

## 项目结构

```text
public/                  浏览器页面、样式和交互
data/                    已生成的公司题库与补充来源
scripts/import-data.js   上游 CSV 导入与完整题维护
scripts/audit-content.js 本地题内容审计
guide-engine.js          自适应推荐逻辑
hidden-tests.js          仅服务端使用的隐藏用例
server.js                HTTP 服务、运行器、判题与教练接口
tests/                   Node.js 自动化测试
```

## 数据来源

- 公司题目元数据：[liquidslr/leetcode-company-wise-problems](https://github.com/liquidslr/leetcode-company-wise-problems)
- 补充题单及快照日期记录在 [`data/supplemental-company-lists.json`](data/supplemental-company-lists.json)。

本项目不声称拥有第三方平台的题目内容、商标或链接页面。新增本地题面时应使用自行编写的描述和测试，并运行 `npm run audit`。

## 安全说明

Python 和 C++ 在临时目录的子进程中运行，JavaScript 在限制模块访问的 Worker 中运行，并设置了时间和输出上限；这仍然不是容器或操作系统级沙箱。

- 不要运行来源不明的代码。
- 不要直接把服务暴露到公网。
- 多用户部署应额外增加认证、容器隔离、资源配额和持久化数据库。

## License

项目代码使用 [MIT License](LICENSE)。第三方题库元数据及外部链接仍受各自来源条款约束。
