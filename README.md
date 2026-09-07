# pi-radeon-cloud-cn

[English](./README.en.md) | 简体中文

为 [pi](https://github.com/earendil-works/pi) 添加 **AMD Radeon Cloud CN** Provider。Radeon Cloud 的共享模型接口兼容 OpenAI Chat Completions API。

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

撰写本文时，Token Factory 页面展示了以下 4 个 **Public Free Model APIs** 卡片：

- `DeepSeek-V4-Flash-Vision-Exp`
- `DeepSeek-V4-Flash-0731`
- `Qwen3.8-Flash-Next`
- `MiniCPM5-1B`

该网页展示可能与其他文档页面存在更新时差，因此插件不会将这份列表作为运行时目录。

Token Factory 中的 **Dedicated Model APIs** 使用部署实例自己的地址和凭据，不属于上述共享 API，因而不会由这个 Provider 注册。

## 安装

从本地目录临时加载：

```bash
pi -e /path/to/pi-radeon-cloud-cn
```

安装为全局 pi package：

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
pi --provider radeon-cloud-cn --model DeepSeek-V4-Flash-0731
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
