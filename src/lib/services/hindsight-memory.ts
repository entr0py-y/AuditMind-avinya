const DEFAULT_HINDSIGHT_URL = 'https://api.hindsight.vectorize.io';

interface HindsightRecallResult {
  text?: string;
  type?: string;
}

interface HindsightRecallResponse {
  results?: HindsightRecallResult[];
}

function getHindsightConfig() {
  const apiKey = process.env.HINDSIGHT_API_KEY;
  if (!apiKey) return null;

  return {
    apiKey,
    baseUrl: (process.env.HINDSIGHT_API_URL || DEFAULT_HINDSIGHT_URL).replace(/\/+$/, ''),
    bankPrefix: process.env.HINDSIGHT_BANK_PREFIX || 'auditmind',
  };
}

function getBankId(orgId: string, bankPrefix: string) {
  return `${bankPrefix}-${orgId}`.replace(/[^a-zA-Z0-9._-]/g, '-');
}

async function hindsightRequest<T>(
  path: string,
  apiKey: string,
  baseUrl: string,
  body: Record<string, unknown>,
  method: 'POST' | 'PUT' = 'POST'
): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Hindsight HTTP ${response.status}: ${details}`);
  }

  return response.json() as Promise<T>;
}

export const hindsightMemoryService = {
  isConfigured() {
    return getHindsightConfig() !== null;
  },

  async recall(orgId: string, query: string): Promise<string[]> {
    const config = getHindsightConfig();
    if (!config) return [];

    await ensureBank(orgId, config);
    const result = await hindsightRequest<HindsightRecallResponse>(
      `/v1/default/banks/${encodeURIComponent(getBankId(orgId, config.bankPrefix))}/memories/recall`,
      config.apiKey,
      config.baseUrl,
      { query, budget: 'low', max_tokens: 2000 }
    );

    return (result.results || [])
      .map(memory => memory.text?.trim())
      .filter((text): text is string => Boolean(text))
      .slice(0, 8);
  },

  async retainConversation(orgId: string, userQuery: string, assistantResponse: string) {
    const config = getHindsightConfig();
    if (!config) return;

    await ensureBank(orgId, config);
    await hindsightRequest(
      `/v1/default/banks/${encodeURIComponent(getBankId(orgId, config.bankPrefix))}/memories`,
      config.apiKey,
      config.baseUrl,
      {
        items: [
          {
            content: `User compliance question: ${userQuery}\nAuditMind response: ${assistantResponse}`,
            context: 'AuditMind compliance assistant conversation',
            metadata: { organization_id: orgId, source: 'auditmind-assistant' },
          },
        ],
        async: true,
      }
    );
  },
};

async function ensureBank(
  orgId: string,
  config: { apiKey: string; baseUrl: string; bankPrefix: string }
) {
  await hindsightRequest(
    `/v1/default/banks/${encodeURIComponent(getBankId(orgId, config.bankPrefix))}`,
    config.apiKey,
    config.baseUrl,
    {
      name: `AuditMind - ${orgId}`,
      mission: 'Remember organizational compliance and audit context for the AuditMind assistant.',
    },
    'PUT'
  );
}

export function formatHindsightContext(memories: string[]) {
  if (memories.length === 0) return '';

  return `\nRelevant organizational memories from Hindsight (use only as context and verify current facts with tools):\n${memories
    .map(memory => `- ${memory}`)
    .join('\n')}\n`;
}
