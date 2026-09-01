export type ActuatorChannel = 'OFFICIAL_OPEN_API' | 'INTERNAL_XHR_SESSION' | 'HEADLESS_CDP_FALLBACK';

export interface ActuatorRouteOptions {
  platform: 'SHOPEE' | 'TIKTOK_SHOP' | 'LAZADA' | 'LNWSHOP';
  action: 'UPDATE_PRICE' | 'UPDATE_STOCK' | 'PUBLISH_PRODUCT' | 'FETCH_ORDERS';
  payload: Record<string, unknown>;
  availableChannels?: ActuatorChannel[];
  dryRun?: boolean;
}

export interface ActuatorRouteResult {
  selectedChannel: ActuatorChannel;
  executedStatus: 'SUCCESS' | 'FAILED' | 'DRY_RUN_ROUTED';
  attempts: Array<{
    channel: ActuatorChannel;
    status: 'SUCCESS' | 'FAILED' | 'SKIPPED';
    latencyMs: number;
    error?: string;
  }>;
  executionPayloadSummary: string;
  timestamp: string;
}

export class ActuatorRouter {
  public routeAndExecute(options: ActuatorRouteOptions): ActuatorRouteResult {
    const { platform, action, payload, dryRun = false } = options;
    const channels: ActuatorChannel[] = options.availableChannels || [
      'OFFICIAL_OPEN_API',
      'INTERNAL_XHR_SESSION',
      'HEADLESS_CDP_FALLBACK',
    ];

    const attempts: ActuatorRouteResult['attempts'] = [];
    let selectedChannel: ActuatorChannel = channels[0];
    let executedStatus: ActuatorRouteResult['executedStatus'] = 'SUCCESS';

    if (dryRun) {
      return {
        selectedChannel: channels[0],
        executedStatus: 'DRY_RUN_ROUTED',
        attempts: [
          {
            channel: channels[0],
            status: 'SUCCESS',
            latencyMs: 15,
          },
        ],
        executionPayloadSummary: `[DRY_RUN] Simulated ${action} on ${platform} via ${channels[0]}`,
        timestamp: new Date().toISOString(),
      };
    }

    for (const channel of channels) {
      selectedChannel = channel;
      // Simulate execution attempt
      if (channel === 'OFFICIAL_OPEN_API' && !payload.hasApiKey) {
        attempts.push({
          channel,
          status: 'FAILED',
          latencyMs: 45,
          error: 'MISSING_OFFICIAL_API_CREDENTIALS',
        });
        continue;
      }

      attempts.push({
        channel,
        status: 'SUCCESS',
        latencyMs: channel === 'INTERNAL_XHR_SESSION' ? 80 : 350,
      });
      executedStatus = 'SUCCESS';
      break;
    }

    if (attempts.every((a) => a.status === 'FAILED')) {
      executedStatus = 'FAILED';
    }

    return {
      selectedChannel,
      executedStatus,
      attempts,
      executionPayloadSummary: `Executed ${action} on ${platform} using ${selectedChannel} (${Object.keys(payload).length} params)`,
      timestamp: new Date().toISOString(),
    };
  }
}
