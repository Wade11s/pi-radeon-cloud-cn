# pi-radeon-cloud-cn

[English](./README.en.md) | 简体中文

为 [pi](https://github.com/earendil-works/pi) 添加 **AMD Radeon Cloud CN** Provider。Radeon Cloud 的共享模型接口兼容 OpenAI Chat Completions API。

## 快速上手

1. 安装插件：

```bash
pi install git:github.com/Wade11s/pi-radeon-cloud-cn
```

2. 启动 pi 并登录：

```text
/login radeon-cloud-cn
```

3. 选择模型：

```text
/model
```

完成后即可直接对话。也可以用命令行指定模型：

```bash
pi --provider radeon-cloud-cn --model DeepSeek-V4-Flash
```

## 模型目录

插件不硬编码共享模型目录。配置 API Key 后，pi 会在刷新模型目录时请求官方接口：

```text
GET https://developer.amd.com.cn/radeon/api/v1/models
Authorization: Bearer <API_KEY>
```

返回的每个 `id` 都会注册为 `radeon-cloud-cn/<model-id>`。插件同时映射以下官方元数据：

- 文本或图片输入能力
- Reasoning 支持
- 上下文窗口
- 输入、输出及缓存读取价格

官方文档明确说明模型可能随时新增或下架，`GET /models` 是共享模型目录的唯一事实来源。pi 会持久化最近一次成功获取的目录；如果既没有缓存，也没有可用的 API Key，则不会显示该 Provider 的模型。

撰写本文时（2026-10），官方文档的 Public Free Model APIs 共列出 9 个模型：

- `DeepSeek-V4-Flash`（权重为 DeepSeek-V4-Flash-0731）
- `DeepSeek-V4-Flash-Vision-Exp`
- `DeepSeek-V4.1-Flash`
- `Qwen3.8-Flash-Next`
- `Qwen3.8-27B`
- `GLM-5.3-Flash`
- `MiMo-V2.6-Flash`
- `MiniCPM5-2B`
- `MinerU2.5-Pro`（仅 `POST /v1/ocr` 文档解析接口，不走 chat completions，插件会跳过）

该列表可能随时变动，因此插件不会将其作为运行时目录。

### 思考分级

Radeon Cloud 用 `reasoning_effort` 控制思考长度，但每个模型接受的档位不同（`none`、`minimal`、`low`、`medium`、`high`、`xhigh`、`max` 的子集），官方只保证 `low` 和 `medium` 在所有模型上通用。插件按模型族把 pi 的思考档位映射到该模型确实接受的取值，避免 400：

| 模型 | 可用档位 |
| --- | --- |
| `DeepSeek-V4-Flash`、`DeepSeek-V4-Flash-Vision-Exp`、`DeepSeek-V4.1-Flash` | 全部，含 `none`（显式关闭） |
| `Qwen3.8-Flash-Next` | `none`、`low`、`medium`、`xhigh` |
| `Qwen3.8-27B` | `low`、`medium`、`xhigh`（默认即思考，无法显式关闭） |
| `GLM-5.3-Flash` | `low`、`medium`、`high`（默认即思考，无法显式关闭） |
| `MiMo-V2.6-Flash` | `none`、`low`、`medium` |
| `MiniCPM5-2B` | 不支持思考 |
| 其他未列出的模型 | `low`、`medium` |

Token Factory 中的 **Dedicated Model APIs** 使用部署实例自己的地址和凭据，不属于上述共享 API，因而不会由这个 Provider 注册。

## 安装

从 GitHub 安装：

```bash
pi install git:github.com/Wade11s/pi-radeon-cloud-cn
```

从本地目录临时加载：

```bash
pi -e /path/to/pi-radeon-cloud-cn
```

安装本地检出目录：

```bash
pi install /path/to/pi-radeon-cloud-cn
```

## 配置 API Key

推荐使用 pi 的隐藏输入登录流程：

```text
/login radeon-cloud-cn
```

也可以在启动 pi 前设置环境变量：

```bash
export RADEON_CLOUD_CN_API_KEY='rc-...'
pi
```

插件源码不会保存或硬编码 API Key。通过 `/login` 输入的凭据由 pi 保存，默认位置为 `~/.pi/agent/auth.json`。该文件并不等同于系统钥匙串，请自行保护其文件权限。

## 使用

在交互界面执行 `/model`，查看并选择实时目录中的 Radeon Cloud 模型。

也可以从命令行列出模型：

```bash
pi -e . --list-models
```

指定模型示例：

```bash
pi --provider radeon-cloud-cn --model DeepSeek-V4-Flash
```

手动刷新 pi 的动态模型目录：

```bash
pi update --models
```

## 使用的接口

```text
GET  https://developer.amd.com.cn/radeon/api/v1/models
POST https://developer.amd.com.cn/radeon/api/v1/chat/completions
Authorization: Bearer <API_KEY>
Content-Type: application/json
```

## 限额

共享 Model API 的官方典型值：每 API Key 30 次/分钟、每 IP 120 次/分钟、每 Key 8 个并发请求，另有按账号的每日花费上限（日界为 `Asia/Shanghai`）。超限返回 429 并带 `Retry-After`。围栏内请求、实例启动与登录另有独立限流，详见[官方 Rate limits 文档](https://amd-aim.github.io/radeon-cloud-docs/api/rate-limits/)。

## 开发

```bash
npm install
npm run check
export RADEON_CLOUD_CN_API_KEY='rc-...'
pi -e . --list-models
```

## 安全提示

不要把真实 API Key 写入源码、README、提交历史或 shell history。如果 Key 曾在公开位置出现，请立即在 Radeon Cloud 控制台撤销并重新生成。

## 官方资料

- [Radeon Cloud Token Factory](https://developer.amd.com.cn/radeon/tokenfactory)
- [Radeon Cloud Docs：List models](https://amd-aim.github.io/radeon-cloud-docs/api/models/)
- [Radeon Cloud Docs：Chat completions](https://amd-aim.github.io/radeon-cloud-docs/api/chat-completions/)
- [Radeon Cloud Docs：Models overview](https://amd-aim.github.io/radeon-cloud-docs/models/overview/)
