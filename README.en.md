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
pi --provider radeon-cloud-cn --model DeepSeek-V4-Flash
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

As of this README's review (2026-10), the official documentation lists nine **Public Free Model APIs**:

- `DeepSeek-V4-Flash` (weights: DeepSeek-V4-Flash-0731)
- `DeepSeek-V4-Flash-Vision-Exp`
- `DeepSeek-V4.1-Flash`
- `Qwen3.8-Flash-Next`
- `Qwen3.8-27B`
- `GLM-5.3-Flash`
- `MiMo-V2.6-Flash`
- `MiniCPM5-2B`
- `MinerU2.5-Pro` (document parsing over `POST /v1/ocr` only, not chat completions; skipped by this extension)

That list can change at any time, so the extension does not treat it as its runtime catalog.

### Thinking tiers

Radeon Cloud controls thinking length with `reasoning_effort`, but each model accepts only a subset of the tiers (`none`, `minimal`, `low`, `medium`, `high`, `xhigh`, `max`), and only `low` and `medium` are documented as working everywhere. The extension maps pi's thinking levels to the values each model actually accepts, to avoid 400s:

| Model | Tiers |
| --- | --- |
| `DeepSeek-V4-Flash`, `DeepSeek-V4-Flash-Vision-Exp`, `DeepSeek-V4.1-Flash` | All, including `none` (explicitly off) |
| `Qwen3.8-Flash-Next` | `none`, `low`, `medium`, `xhigh` |
| `Qwen3.8-27B` | `low`, `medium`, `xhigh` (thinks by default; cannot be turned off) |
| `GLM-5.3-Flash` | `low`, `medium`, `high` (thinks by default; cannot be turned off) |
| `MiMo-V2.6-Flash` | `none`, `low`, `medium` |
| `MiniCPM5-2B` | No thinking |
| Any other model | `low`, `medium` |

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
pi --provider radeon-cloud-cn --model DeepSeek-V4-Flash
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

## Limits

Typical values for the shared Model APIs: 30 requests per minute per API key, 120 per minute per IP, 8 concurrent requests per key, plus a per-account daily spend cap (day boundary `Asia/Shanghai`). Exceeding them returns 429 with `Retry-After`. Fenced-instance requests, instance launches, and sign-in have their own separate limits — see the official [Rate limits](https://amd-aim.github.io/radeon-cloud-docs/api/rate-limits/) page.

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
