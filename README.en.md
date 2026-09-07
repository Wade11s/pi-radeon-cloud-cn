# pi-radeon-cloud-cn

English | [简体中文](./README.md)

An **AMD Radeon Cloud CN** provider for [pi](https://github.com/earendil-works/pi). Radeon Cloud's shared model endpoint is compatible with the OpenAI Chat Completions API.

## Quickstart

1. Install the extension:

```bash
pi install git:github.com/Wade11s/pi-radeon-cloud-cn
```

2. Start pi and sign in:

```text
/login radeon-cloud-cn
```

3. Pick a model:

```text
/model
```

You can then start chatting immediately. You can also select a model from the command line:

```bash
pi --provider radeon-cloud-cn --model DeepSeek-V4-Flash-0731
```

## Model catalog

The extension does not hard-code the shared model catalog. After an API key is configured, pi requests the official endpoint whenever it refreshes dynamic model catalogs:

```text
GET https://developer.amd.com.cn/radeon/api/v1/models
Authorization: Bearer <API_KEY>
```

Every returned `id` is registered as `radeon-cloud-cn/<model-id>`. The extension also maps the following official metadata:

- Text or image input support
- Reasoning support
- Context-window size
- Input, output, and cache-read pricing

The official documentation states that models can be added or retired at any time and that `GET /models` is the source of truth for the shared catalog. pi persists the most recently fetched catalog. If neither a cached catalog nor a valid API key is available, no models from this provider will be shown.

At the time this README was reviewed, the Token Factory page displayed these four **Public Free Model APIs** cards:

- `DeepSeek-V4-Flash-Vision-Exp`
- `DeepSeek-V4-Flash-0731`
- `Qwen3.8-Flash-Next`
- `MiniCPM5-1B`

That page can be updated at a different time from other documentation pages, so the extension does not treat this list as its runtime catalog.

Token Factory's **Dedicated Model APIs** use deployment-specific endpoints and credentials. They are not part of the shared API above and are therefore not registered by this provider.

## Installation

Install it from GitHub:

```bash
pi install git:github.com/Wade11s/pi-radeon-cloud-cn
```

Load the extension temporarily from a local checkout:

```bash
pi -e /path/to/pi-radeon-cloud-cn
```

Install a local checkout:

```bash
pi install /path/to/pi-radeon-cloud-cn
```

## API-key configuration

The recommended option is pi's secret-input login flow:

```text
/login radeon-cloud-cn
```

Alternatively, set an environment variable before starting pi:

```bash
export RADEON_CLOUD_CN_API_KEY='rc-...'
pi
```

The extension does not save or hard-code the API key. Credentials entered through `/login` are stored by pi, by default in `~/.pi/agent/auth.json`. This file is not equivalent to an operating-system keychain; protect its file permissions appropriately.

## Usage

Run `/model` in the interactive UI to view and select models from the live Radeon Cloud catalog.

You can also list models from the command line:

```bash
pi -e . --list-models
```

Example with an explicitly selected model:

```bash
pi --provider radeon-cloud-cn --model DeepSeek-V4-Flash-0731
```

Refresh pi's dynamic model catalogs manually with:

```bash
pi update --models
```

## Endpoints used

```text
GET  https://developer.amd.com.cn/radeon/api/v1/models
POST https://developer.amd.com.cn/radeon/api/v1/chat/completions
Authorization: Bearer <API_KEY>
Content-Type: application/json
```

## Development

```bash
npm install
npm run check
export RADEON_CLOUD_CN_API_KEY='rc-...'
pi -e . --list-models
```

## Security

Never place a real API key in source code, README files, commit history, or shell history. Revoke and regenerate any key that has been exposed publicly.

## Official references

- [Radeon Cloud Token Factory](https://developer.amd.com.cn/radeon/tokenfactory)
- [Radeon Cloud Docs: List models](https://amd-aim.github.io/radeon-cloud-docs/api/models/)
- [Radeon Cloud Docs: Chat completions](https://amd-aim.github.io/radeon-cloud-docs/api/chat-completions/)
- [Radeon Cloud Docs: Models overview](https://amd-aim.github.io/radeon-cloud-docs/models/overview/)
