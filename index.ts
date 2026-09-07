// Import from the /compat entrypoint: pi's extension loader aliases exactly this
// specifier to its bundled pi-ai copy, and the package's real exports map also
// exposes it, so resolution works both at runtime (installed packages without
// node_modules) and under tsc in this repo.
import {
	createProvider,
	envApiKeyAuth,
	openAICompletionsApi,
	type Model,
} from "@earendil-works/pi-ai/compat";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const PROVIDER_ID = "radeon-cloud-cn";
const BASE_URL = "https://developer.amd.com.cn/radeon/api/v1";
const DEFAULT_CONTEXT_WINDOW = 128_000;
const DEFAULT_MAX_TOKENS = 16_384;

type RadeonModel = Model<"openai-completions">;

interface RadeonCatalogEntry {
	id: string;
	name?: string;
	family?: string;
	architecture?: {
		input_modalities?: string[];
	};
	providers?: Array<{
		reasoning?: boolean;
		vision?: boolean;
	}>;
	pricing?: {
		prompt?: string;
		completion?: string;
		input_cache_read?: string;
	};
	context_length?: number;
}

interface RadeonCatalogResponse {
	data?: RadeonCatalogEntry[];
}

function pricePerMillion(value?: string): number {
	const perToken = Number(value ?? 0);
	return Number.isFinite(perToken) ? perToken * 1_000_000 : 0;
}

function thinkingLevels(id: string, reasoning: boolean): RadeonModel["thinkingLevelMap"] {
	if (!reasoning) return undefined;

	if (id.toLowerCase().includes("deepseek-v4-flash")) {
		return {
			minimal: "minimal",
			low: "low",
			medium: "medium",
			high: "high",
			xhigh: "xhigh",
			max: "max",
		};
	}

	// Radeon Cloud documents low and medium as the portable reasoning tiers.
	return {
		minimal: null,
		low: "low",
		medium: "medium",
		high: null,
		xhigh: null,
		max: null,
	};
}

function toModel(entry: RadeonCatalogEntry): RadeonModel {
	const providerCapabilities = entry.providers ?? [];
	const reasoning = providerCapabilities.some((provider) => provider.reasoning === true);
	const supportsImages =
		entry.architecture?.input_modalities?.includes("image") === true ||
		providerCapabilities.some((provider) => provider.vision === true);

	return {
		id: entry.id,
		name: entry.name ?? entry.id,
		api: "openai-completions",
		provider: PROVIDER_ID,
		baseUrl: BASE_URL,
		reasoning,
		thinkingLevelMap: thinkingLevels(entry.id, reasoning),
		input: supportsImages ? ["text", "image"] : ["text"],
		cost: {
			input: pricePerMillion(entry.pricing?.prompt),
			output: pricePerMillion(entry.pricing?.completion),
			cacheRead: pricePerMillion(entry.pricing?.input_cache_read),
			cacheWrite: 0,
		},
		contextWindow: entry.context_length ?? DEFAULT_CONTEXT_WINDOW,
		maxTokens: Math.min(entry.context_length ?? DEFAULT_CONTEXT_WINDOW, DEFAULT_MAX_TOKENS),
		compat: {
			// A leading system message is accepted by every model in the shared catalog.
			supportsDeveloperRole: false,
			supportsReasoningEffort: reasoning,
			supportsUsageInStreaming: false,
			supportsStrictMode: false,
			maxTokensField: "max_tokens",
		},
	};
}

export default function registerRadeonCloudCn(pi: ExtensionAPI): void {
	pi.registerProvider(
		createProvider({
			id: PROVIDER_ID,
			name: "AMD Radeon Cloud CN",
			baseUrl: BASE_URL,
			auth: {
				apiKey: envApiKeyAuth("AMD Radeon Cloud CN API key", [
					"RADEON_CLOUD_CN_API_KEY",
				]),
			},
			// The shared catalog changes over time; GET /models is the source of truth.
			models: [],
			async fetchModels({ credential, signal }) {
				const apiKey = credential?.type === "api_key" ? credential.key : undefined;
				if (!apiKey) throw new Error("AMD Radeon Cloud CN API key is not configured");

				const response = await fetch(`${BASE_URL}/models`, {
					headers: { Authorization: `Bearer ${apiKey}` },
					signal,
				});
				if (!response.ok) {
					throw new Error(`Failed to fetch Radeon Cloud models: HTTP ${response.status}`);
				}

				const payload = (await response.json()) as RadeonCatalogResponse;
				if (!Array.isArray(payload.data)) {
					throw new Error("Radeon Cloud models response does not contain a data array");
				}

				return payload.data.filter((entry) => typeof entry.id === "string" && entry.id.length > 0).map(toModel);
			},
			api: openAICompletionsApi(),
		}),
	);
}
