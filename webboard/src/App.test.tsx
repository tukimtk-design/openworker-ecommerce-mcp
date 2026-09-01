import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {
  ToolsExplorer,
  validatePayloadAgainstSchema,
  ToolSchema,
} from './components/ToolsExplorer';
import { ZeroDefectLinter } from './components/ZeroDefectLinter';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const canonical32Tools: ToolSchema[] = [
  {
    name: 'browser_attach_existing',
    description: 'ตรวจสอบการเชื่อมต่อ Chrome/Edge บนพอร์ต 9222 และแสดงรายการ Tab ร้านค้า Shopee/TikTok/Lazada',
    inputSchema: { type: 'object', properties: { port: { type: 'number', default: 9222 } } },
  },
  {
    name: 'ecommerce_extract_session',
    description: 'ดึง Cookies, CSRF Tokens และ Authorization Headers จาก Tab ร้านค้า shopee tiktok lazada lnwshop',
    inputSchema: {
      type: 'object',
      properties: { platform: { type: 'string', enum: ['shopee', 'tiktok', 'lazada', 'lnwshop'] } },
      required: ['platform'],
    },
  },
  {
    name: 'ecommerce_product_search',
    description: 'ค้นหารายการสินค้าและ SKU จากระบบหลังบ้านร้านค้า shopee tiktok lazada lnwshop',
    inputSchema: {
      type: 'object',
      properties: {
        platform: { type: 'string', enum: ['shopee', 'tiktok', 'lazada', 'lnwshop'] },
        query: { type: 'string' },
      },
      required: ['platform', 'query'],
    },
  },
  {
    name: 'ecommerce_update_price_stock',
    description: 'ปรับเปลี่ยนราคาสินค้าและจำนวนสต็อก shopee tiktok lazada lnwshop',
    inputSchema: {
      type: 'object',
      properties: {
        platform: { type: 'string', enum: ['shopee', 'tiktok', 'lazada', 'lnwshop'] },
        productId: { type: 'string' },
        skuId: { type: 'string' },
        newPrice: { type: 'number' },
        newStock: { type: 'number' },
      },
      required: ['platform', 'productId'],
    },
  },
  {
    name: 'ecommerce_safety_guard',
    description: 'ตรวจสอบความปลอดภัยและส่วนต่างของราคาสินค้าก่อนทำการอัปเดตบันทึกจริง',
    inputSchema: {
      type: 'object',
      properties: {
        currentPrice: { type: 'number' },
        proposedPrice: { type: 'number' },
        maxPriceDropPercent: { type: 'number', default: 50 },
      },
      required: ['currentPrice', 'proposedPrice'],
    },
  },
  {
    name: 'browser_detect_challenge',
    description: 'สแกนหา Captcha/OTP บน Tab ที่เปิดอยู่ shopee tiktok lazada lnwshop',
    inputSchema: {
      type: 'object',
      properties: { platform: { type: 'string', enum: ['shopee', 'tiktok', 'lazada', 'lnwshop'] } },
      required: ['platform'],
    },
  },
  {
    name: 'ecommerce_get_store_metrics',
    description: 'ดึงข้อมูลสรุปออเดอร์ค้างจัดส่งและรายการ SKU ที่สต็อกกำลังหมด shopee tiktok lazada lnwshop',
    inputSchema: {
      type: 'object',
      properties: { platform: { type: 'string', enum: ['shopee', 'tiktok', 'lazada', 'lnwshop'] } },
      required: ['platform'],
    },
  },
  {
    name: 'ecommerce_batch_update_price_stock',
    description: 'อัปเดตราคาและสต็อกแบบหลายรายการ shopee tiktok lazada lnwshop',
    inputSchema: {
      type: 'object',
      properties: {
        platform: { type: 'string', enum: ['shopee', 'tiktok', 'lazada', 'lnwshop'] },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              productId: { type: 'string' },
              skuId: { type: 'string' },
              newPrice: { type: 'number' },
              newStock: { type: 'number' },
            },
            required: ['productId'],
          },
        },
      },
      required: ['platform', 'items'],
    },
  },
  {
    name: 'ecommerce_audit_log',
    description: 'บันทึกและเรียกดูประวัติการเปลี่ยนแปลงราคาสินค้าและสต็อกย้อนหลัง',
    inputSchema: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['record', 'get_history'] },
        productId: { type: 'string' },
        limit: { type: 'number', default: 20 },
      },
      required: ['action'],
    },
  },
  {
    name: 'ecommerce_run_recipe',
    description: 'Run a predefined workflow recipe',
    inputSchema: {
      type: 'object',
      properties: {
        recipeId: { type: 'string' },
        params: {
          type: 'object',
          properties: { _dummy: { type: 'string' } },
          additionalProperties: { type: 'string' },
        },
      },
      required: ['recipeId'],
    },
  },
  {
    name: 'ecommerce_list_recipes',
    description: 'List all available workflow recipes',
    inputSchema: {
      type: 'object',
      properties: { _dummy: { type: 'string', description: 'Dummy parameter' } },
    },
  },
  {
    name: 'ecommerce_save_custom_recipe',
    description: 'Save a custom macro recipe',
    inputSchema: {
      type: 'object',
      properties: {
        recipe: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            steps: {
              type: 'array',
              items: {
                type: 'object',
                properties: { action: { type: 'string' } },
                required: ['action'],
              },
            },
          },
          required: ['id', 'name', 'steps'],
        },
      },
      required: ['recipe'],
    },
  },
  {
    name: 'ecommerce_cached_selector_map',
    description: 'Manage cached DOM selectors',
    inputSchema: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['get', 'set', 'list'] },
        key: { type: 'string' },
        selectors: { type: 'array', items: { type: 'string' } },
      },
      required: ['action'],
    },
  },
  {
    name: 'ecommerce_context_compressor',
    description: 'Compress DOM to micro-JSON',
    inputSchema: {
      type: 'object',
      properties: { domString: { type: 'string' } },
      required: ['domString'],
    },
  },
  {
    name: 'ecommerce_local_sqlite_cache',
    description: 'Local SQLite caching',
    inputSchema: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['get', 'set'] },
        key: { type: 'string' },
        value: { type: 'string' },
      },
      required: ['action', 'key'],
    },
  },
  {
    name: 'ecommerce_smart_diff_update',
    description: 'Calculate deltas between states',
    inputSchema: {
      type: 'object',
      properties: {
        currentState: {
          type: 'object',
          properties: { _dummy: { type: 'string' } },
          additionalProperties: true,
        },
        targetState: {
          type: 'object',
          properties: { _dummy: { type: 'string' } },
          additionalProperties: true,
        },
      },
      required: ['currentState', 'targetState'],
    },
  },
  {
    name: 'ecommerce_hybrid_executor',
    description: 'Hybrid API/CDP/Human execution',
    inputSchema: {
      type: 'object',
      properties: {
        taskDetails: {
          type: 'object',
          properties: { _dummy: { type: 'string' } },
          additionalProperties: true,
        },
      },
      required: ['taskDetails'],
    },
  },
  {
    name: 'ecommerce_token_telemetry',
    description: 'Record token telemetry',
    inputSchema: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['record', 'get'] },
        inputTokens: { type: 'number' },
        outputTokens: { type: 'number' },
        savedTokens: { type: 'number' },
      },
      required: ['action'],
    },
  },
  {
    name: 'ecommerce_match_variants',
    description: 'Fuzzy match product variants across platforms',
    inputSchema: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['match', 'force_map'] },
        sourceName: { type: 'string' },
      },
      required: ['action', 'sourceName'],
    },
  },
  {
    name: 'ecommerce_sync_multiplatform_stock',
    description: 'Sync stock and prices across multiple platforms',
    inputSchema: {
      type: 'object',
      properties: {
        sourcePlatform: { type: 'string' },
        sourceProductName: { type: 'string' },
        targets: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              platform: { type: 'string' },
              productId: { type: 'string' },
            },
            required: ['platform', 'productId'],
          },
        },
      },
      required: ['sourcePlatform', 'sourceProductName', 'targets'],
    },
  },
  {
    name: 'ecommerce_visual_dom_analysis',
    description: 'Capture viewport screenshots and bounding boxes for self-correction',
    inputSchema: {
      type: 'object',
      properties: { simulate: { type: 'boolean' } },
    },
  },
  {
    name: 'ecommerce_autonomous_store_manager',
    description: 'Background agent loop for autonomous store management',
    inputSchema: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['start', 'stop', 'status', 'trigger_now'] },
        intervalMs: { type: 'number' },
      },
      required: ['action'],
    },
  },
  {
    name: 'ecommerce_clone_product',
    description: 'Clone a product from a source URL to multiple target platforms',
    inputSchema: {
      type: 'object',
      properties: {
        sourceUrl: { type: 'string' },
        targetPlatforms: { type: 'array', items: { type: 'string' } },
      },
      required: ['sourceUrl', 'targetPlatforms'],
    },
  },
  {
    name: 'ecommerce_auto_reply_chat',
    description: 'Fetch unread messages and auto-reply shopee tiktok lazada lnwshop',
    inputSchema: {
      type: 'object',
      properties: {
        platform: { type: 'string' },
        action: { type: 'string', enum: ['fetch_unread', 'reply'] },
      },
      required: ['platform', 'action'],
    },
  },
  {
    name: 'ecommerce_get_pending_orders',
    description: 'Query unfulfilled orders shopee tiktok lazada lnwshop',
    inputSchema: {
      type: 'object',
      properties: { platform: { type: 'string' } },
      required: ['platform'],
    },
  },
  {
    name: 'ecommerce_fulfill_order',
    description: 'Trigger shipment arrangement shopee tiktok lazada lnwshop',
    inputSchema: {
      type: 'object',
      properties: {
        platform: { type: 'string' },
        orderId: { type: 'string' },
      },
      required: ['platform', 'orderId'],
    },
  },
  {
    name: 'ecommerce_manage_promotions',
    description: 'Query and update store Flash Sales and voucher campaigns shopee tiktok lazada lnwshop',
    inputSchema: {
      type: 'object',
      properties: {
        platform: { type: 'string' },
        action: { type: 'string', enum: ['list', 'create', 'update'] },
        promoDetails: {
          type: 'object',
          properties: { _dummy: { type: 'string' } },
          additionalProperties: true,
        },
      },
      required: ['platform', 'action'],
    },
  },
  {
    name: 'ecommerce_sync_product_images',
    description: 'Extract, re-format, and upload product gallery images across platforms',
    inputSchema: {
      type: 'object',
      properties: {
        sourcePlatform: { type: 'string' },
        targetPlatforms: { type: 'array', items: { type: 'string' } },
        productId: { type: 'string' },
      },
      required: ['sourcePlatform', 'targetPlatforms', 'productId'],
    },
  },
  {
    name: 'ecommerce_m365_copilot_bridge',
    description: 'Bridge to Microsoft 365 Copilot Chat interface',
    inputSchema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['attach_m365_tab', 'send_prompt', 'read_latest_response', 'get_chat_history'],
        },
        prompt: { type: 'string' },
      },
      required: ['action'],
    },
  },
  {
    name: 'ecommerce_seo_optimizer',
    description: 'Fast HTML DOM parsing and rewriting for SEO',
    inputSchema: {
      type: 'object',
      properties: {
        htmlString: { type: 'string' },
        title: { type: 'string' },
      },
      required: ['htmlString'],
    },
  },
  {
    name: 'ecommerce_ow_lnwshop_safe_seo_updater',
    description: 'Safe update for meta titles and keywords on lnwshop',
    inputSchema: {
      type: 'object',
      properties: {
        platform: { type: 'string', enum: ['lnwshop'] },
        productId: { type: 'string' },
      },
      required: ['platform', 'productId'],
    },
  },
  {
    name: 'ecommerce_google_ads_integration',
    description: 'Integrate Google Ads Campaign Payload dispatcher lnwshop',
    inputSchema: {
      type: 'object',
      properties: {
        platform: { type: 'string', enum: ['shopee', 'tiktok', 'lazada', 'lnwshop'] },
        action: { type: 'string', enum: ['dispatch_campaign', 'track_offline_conversion'] },
        campaignPayload: {
          type: 'object',
          properties: {
            campaignId: { type: 'string' },
            budget: { type: 'number' },
          },
          required: ['campaignId'],
        },
      },
      required: ['platform', 'action'],
    },
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  globalThis.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ tools: canonical32Tools }),
    })
  ) as any;

  Object.assign(navigator, {
    clipboard: { writeText: vi.fn() },
  });
});

describe('ToolsExplorer Component', () => {
  it('renders all 32 canonical tools and allows selecting and copying inputSchema', async () => {
    render(<ToolsExplorer />);

    await waitFor(() => {
      expect(screen.getByText('browser_attach_existing')).toBeInTheDocument();
      expect(screen.getByText('ecommerce_google_ads_integration')).toBeInTheDocument();
    });

    // Verify 32 tools header count
    expect(
      screen.getByText(/ค้นหาและตรวจสอบ Schema ของเครื่องมือทั้งหมด 32 รายการ/)
    ).toBeInTheDocument();

    // Select ecommerce_extract_session
    fireEvent.click(screen.getByText('ecommerce_extract_session'));

    expect(screen.getByText('Copy inputSchema')).toBeInTheDocument();
    expect(screen.getByText(/"platform": \{/)).toBeInTheDocument();

    // Copy inputSchema to clipboard
    fireEvent.click(screen.getByText('Copy inputSchema'));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      JSON.stringify(canonical32Tools[1].inputSchema, null, 2)
    );
  });

  it('filters tools by platform dropdown and independent search box', async () => {
    render(<ToolsExplorer />);

    await waitFor(() => {
      expect(screen.getByText('browser_attach_existing')).toBeInTheDocument();
    });

    const select = screen.getByRole('combobox');
    const searchInput = screen.getByPlaceholderText('ค้นหาชื่อ Tool...');

    // Filter by Shopee platform
    fireEvent.change(select, { target: { value: 'shopee' } });
    expect(screen.getByText('ecommerce_extract_session')).toBeInTheDocument();
    expect(screen.queryByText('ecommerce_m365_copilot_bridge')).not.toBeInTheDocument();

    // Filter by TikTok platform
    fireEvent.change(select, { target: { value: 'tiktok' } });
    expect(screen.getByText('ecommerce_extract_session')).toBeInTheDocument();

    // Filter by Lazada platform
    fireEvent.change(select, { target: { value: 'lazada' } });
    expect(screen.getByText('ecommerce_extract_session')).toBeInTheDocument();

    // Filter by LnwShop platform
    fireEvent.change(select, { target: { value: 'lnwshop' } });
    expect(screen.getByText('ecommerce_ow_lnwshop_safe_seo_updater')).toBeInTheDocument();

    // Reset platform filter and search by keyword
    fireEvent.change(select, { target: { value: '' } });
    fireEvent.change(searchInput, { target: { value: 'token_telemetry' } });
    expect(screen.getByText('ecommerce_token_telemetry')).toBeInTheDocument();
    expect(screen.queryByText('browser_attach_existing')).not.toBeInTheDocument();

    // Search with non-matching term
    fireEvent.change(searchInput, { target: { value: 'non_existent_tool_xyz' } });
    expect(screen.getByText('ไม่พบ Tool ที่ค้นหา')).toBeInTheDocument();
  });

  it('displays error banner when tools endpoint fails to fetch', async () => {
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.reject(new Error('Server Error')),
      })
    ) as any;

    render(<ToolsExplorer />);

    await waitFor(() => {
      expect(
        screen.getByText('Failed to load tools-schema.json endpoint.')
      ).toBeInTheDocument();
    });
  });

  it('executes payload validation interactively in UI with feedback', async () => {
    render(<ToolsExplorer />);

    await waitFor(() => {
      expect(screen.getByText('ecommerce_extract_session')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('ecommerce_extract_session'));

    const textarea = screen.getByPlaceholderText('วาง Test Payload JSON ที่นี่...');
    const validateBtn = screen.getByText('Validate Payload');

    // Missing required field
    fireEvent.change(textarea, { target: { value: '{}' } });
    fireEvent.click(validateBtn);
    expect(screen.getByText("Field 'platform' is required")).toBeInTheDocument();

    // Valid payload
    fireEvent.change(textarea, { target: { value: '{"platform": "shopee"}' } });
    fireEvent.click(validateBtn);
    expect(
      screen.getByText('Payload is valid according to tool inputSchema (Local Validation).')
    ).toBeInTheDocument();
  });
});

describe('Local Payload Validator Matrix (validatePayloadAgainstSchema)', () => {
  const testSchema = {
    type: 'object',
    properties: {
      platform: { type: 'string', enum: ['shopee', 'tiktok', 'lazada', 'lnwshop'] },
      productId: { type: 'string' },
      quantity: { type: 'number' },
      isAvailable: { type: 'boolean' },
      tags: { type: 'array', items: { type: 'string' } },
      metadata: {
        type: 'object',
        properties: {
          author: { type: 'string' },
          version: { type: 'number' },
        },
        required: ['author'],
      },
    },
    required: ['platform', 'productId'],
  };

  it('validates a complete valid payload', () => {
    const payload = JSON.stringify({
      platform: 'shopee',
      productId: 'prod_123',
      quantity: 50,
      isAvailable: true,
      tags: ['sale', 'popular'],
      metadata: { author: 'jules', version: 1 },
    });
    const result = validatePayloadAgainstSchema(payload, testSchema);
    expect(result.valid).toBe(true);
    expect(result.msg).toContain('Payload is valid');
  });

  it('fails on missing required field', () => {
    const payload = JSON.stringify({ platform: 'shopee' });
    const result = validatePayloadAgainstSchema(payload, testSchema);
    expect(result.valid).toBe(false);
    expect(result.msg).toBe("Field 'productId' is required");
  });

  it('fails on type mismatch (string expected, got number)', () => {
    const payload = JSON.stringify({ platform: 'shopee', productId: 12345 });
    const result = validatePayloadAgainstSchema(payload, testSchema);
    expect(result.valid).toBe(false);
    expect(result.msg).toBe("Field 'productId' must be of type 'string', got 'number'");
  });

  it('fails on type mismatch (number expected, got string)', () => {
    const payload = JSON.stringify({ platform: 'shopee', productId: 'p1', quantity: 'fifty' });
    const result = validatePayloadAgainstSchema(payload, testSchema);
    expect(result.valid).toBe(false);
    expect(result.msg).toBe("Field 'quantity' must be of type 'number', got 'string'");
  });

  it('fails on invalid enum value', () => {
    const payload = JSON.stringify({ platform: 'amazon', productId: 'p1' });
    const result = validatePayloadAgainstSchema(payload, testSchema);
    expect(result.valid).toBe(false);
    expect(result.msg).toBe("Field 'platform' must be one of [shopee, tiktok, lazada, lnwshop]");
  });

  it('fails on array item type mismatch', () => {
    const payload = JSON.stringify({ platform: 'shopee', productId: 'p1', tags: [123, 456] });
    const result = validatePayloadAgainstSchema(payload, testSchema);
    expect(result.valid).toBe(false);
    expect(result.msg).toBe("Field 'tags[0]' must be of type 'string', got 'number'");
  });

  it('fails on nested object missing required field', () => {
    const payload = JSON.stringify({
      platform: 'shopee',
      productId: 'p1',
      metadata: { version: 1 },
    });
    const result = validatePayloadAgainstSchema(payload, testSchema);
    expect(result.valid).toBe(false);
    expect(result.msg).toBe("Field 'metadata.author' is required");
  });

  it('fails on malformed JSON syntax', () => {
    const result = validatePayloadAgainstSchema('{ invalid: json }', testSchema);
    expect(result.valid).toBe(false);
    expect(result.msg).toContain('Invalid JSON syntax:');
  });

  it('fails on empty payload', () => {
    const result = validatePayloadAgainstSchema('   ', testSchema);
    expect(result.valid).toBe(false);
    expect(result.msg).toBe('Payload cannot be empty.');
  });

  it('fails on non-object payload (e.g. array or primitive)', () => {
    const result = validatePayloadAgainstSchema('["item1", "item2"]', testSchema);
    expect(result.valid).toBe(false);
    expect(result.msg).toBe('Payload must be a JSON object.');
  });
});

describe('ZeroDefectLinter Component Matrix', () => {
  it('handles empty input gracefully', () => {
    render(<ZeroDefectLinter />);
    fireEvent.click(screen.getByText('Lint Schema'));
    expect(screen.getByText('กรุณาใส่ JSON Schema')).toBeInTheDocument();
  });

  it('handles malformed JSON syntax', () => {
    render(<ZeroDefectLinter />);
    const input = screen.getByPlaceholderText('วาง JSON Schema ที่นี่...');
    fireEvent.change(input, { target: { value: '{ invalid: json' } });
    fireEvent.click(screen.getByText('Lint Schema'));
    expect(screen.getByText(/Invalid JSON:/)).toBeInTheDocument();
  });

  it('fails on missing items in array', () => {
    render(<ZeroDefectLinter />);
    const input = screen.getByPlaceholderText('วาง JSON Schema ที่นี่...');
    fireEvent.change(input, {
      target: {
        value: '{"type": "object", "properties": {"list": {"type": "array"}}, "required": []}',
      },
    });
    fireEvent.click(screen.getByText('Lint Schema'));
    expect(screen.getByText(/Array at "root.list" is missing "items" property/)).toBeInTheDocument();
  });

  it('fails on missing properties in object', () => {
    render(<ZeroDefectLinter />);
    const input = screen.getByPlaceholderText('วาง JSON Schema ที่นี่...');
    fireEvent.change(input, { target: { value: '{"type": "object", "required": []}' } });
    fireEvent.click(screen.getByText('Lint Schema'));
    expect(screen.getByText(/Object at "root" is missing "properties"/)).toBeInTheDocument();
  });

  it('fails on missing required in object', () => {
    render(<ZeroDefectLinter />);
    const input = screen.getByPlaceholderText('วาง JSON Schema ที่นี่...');
    fireEvent.change(input, {
      target: { value: '{"type": "object", "properties": {"a": {"type": "string"}}}' },
    });
    fireEvent.click(screen.getByText('Lint Schema'));
    expect(screen.getByText(/Object at "root" is missing "required" array/)).toBeInTheDocument();
  });

  it('fails on prohibited $schema keyword', () => {
    render(<ZeroDefectLinter />);
    const input = screen.getByPlaceholderText('วาง JSON Schema ที่นี่...');
    fireEvent.change(input, {
      target: {
        value:
          '{"$schema": "http://json-schema.org/draft-07/schema#", "type": "object", "properties": {"a": {"type": "string"}}, "required": []}',
      },
    });
    fireEvent.click(screen.getByText('Lint Schema'));
    expect(screen.getByText(/Node at "root" contains prohibited "\$schema"/)).toBeInTheDocument();
  });

  it('fails on prohibited $ref keyword', () => {
    render(<ZeroDefectLinter />);
    const input = screen.getByPlaceholderText('วาง JSON Schema ที่นี่...');
    fireEvent.change(input, {
      target: {
        value: '{"type": "object", "properties": {"a": {"$ref": "#/def"}}, "required": []}',
      },
    });
    fireEvent.click(screen.getByText('Lint Schema'));
    expect(screen.getByText(/Node at "root.a" contains prohibited "\$ref"/)).toBeInTheDocument();
  });

  it('fails on prohibited patternProperties keyword', () => {
    render(<ZeroDefectLinter />);
    const input = screen.getByPlaceholderText('วาง JSON Schema ที่นี่...');
    fireEvent.change(input, {
      target: {
        value:
          '{"type": "object", "patternProperties": {"^a": {"type": "string"}}, "properties": {}, "required": []}',
      },
    });
    fireEvent.click(screen.getByText('Lint Schema'));
    expect(screen.getByText(/contains prohibited "patternProperties"/)).toBeInTheDocument();
  });

  it('fails on prohibited complex anyOf/allOf/oneOf keyword', () => {
    render(<ZeroDefectLinter />);
    const input = screen.getByPlaceholderText('วาง JSON Schema ที่นี่...');
    fireEvent.change(input, {
      target: {
        value:
          '{"type": "object", "properties": {"a": {"anyOf": [{"type": "string"}, {"type": "number"}]}}, "required": []}',
      },
    });
    fireEvent.click(screen.getByText('Lint Schema'));
    expect(
      screen.getByText(/contains prohibited complex nested anyOf\/allOf\/oneOf/)
    ).toBeInTheDocument();
  });

  it('fails on dynamic object missing _dummy property', () => {
    render(<ZeroDefectLinter />);
    const input = screen.getByPlaceholderText('วาง JSON Schema ที่นี่...');
    fireEvent.change(input, {
      target: {
        value: '{"type": "object", "properties": {}, "additionalProperties": true, "required": []}',
      },
    });
    fireEvent.click(screen.getByText('Lint Schema'));
    expect(
      screen.getByText(/Dynamic object at "root" is missing "_dummy" property/)
    ).toBeInTheDocument();
  });

  it('passes strict valid schema with dummy and required', () => {
    render(<ZeroDefectLinter />);
    const input = screen.getByPlaceholderText('วาง JSON Schema ที่นี่...');
    fireEvent.change(input, {
      target: {
        value:
          '{"type": "object", "properties": {"_dummy": {"type": "string"}}, "additionalProperties": true, "required": []}',
      },
    });
    fireEvent.click(screen.getByText('Lint Schema'));
    expect(screen.getByText(/Schema ผ่านเกณฑ์ Zero-Defect Protocol 100%/)).toBeInTheDocument();
  });

  it('passes regular strict valid schema with properties and required', () => {
    render(<ZeroDefectLinter />);
    const input = screen.getByPlaceholderText('วาง JSON Schema ที่นี่...');
    fireEvent.change(input, {
      target: {
        value:
          '{"type": "object", "properties": {"productId": {"type": "string"}}, "required": ["productId"]}',
      },
    });
    fireEvent.click(screen.getByText('Lint Schema'));
    expect(screen.getByText(/Schema ผ่านเกณฑ์ Zero-Defect Protocol 100%/)).toBeInTheDocument();
  });
});
