import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ToolsExplorer } from './components/ToolsExplorer';
import { ZeroDefectLinter } from './components/ZeroDefectLinter';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockTools = {
  tools: [
    {
      name: "ecommerce_test_tool",
      description: "Test description for shopee",
      inputSchema: {
         type: "object",
         properties: {
           a: { type: "string", enum: ["yes", "no"] },
           b: { type: "number" },
           c: { type: "boolean" },
           d: { type: "array", items: { type: "string" } },
           e: { type: "object", properties: { f: { type: "string"} }, required: ["f"] }
         },
         required: ["a"]
      }
    }
  ]
};

globalThis.fetch = vi.fn((_url) => {
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve(mockTools),
  });
}) as any;

beforeEach(() => {
  vi.clearAllMocks();
  Object.assign(navigator, {
    clipboard: { writeText: vi.fn() },
  });
});

describe('ToolsExplorer - UI & Filters', () => {
  it('renders and filters tools, then selects and copies inputSchema', async () => {
    render(<ToolsExplorer />);

    await waitFor(() => {
      expect(screen.getByText('ecommerce_test_tool')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('ecommerce_test_tool'));
    expect(screen.getByText('Copy inputSchema')).toBeInTheDocument();
    expect(screen.getByText(/"a": \{/)).toBeInTheDocument();

    fireEvent.click(screen.getByText('Copy inputSchema'));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(JSON.stringify(mockTools.tools[0].inputSchema, null, 2));
  });

  it('handles platform filter combining search', async () => {
    render(<ToolsExplorer />);
    await waitFor(() => {
      expect(screen.getByText('ecommerce_test_tool')).toBeInTheDocument();
    });

    const select = screen.getByRole('combobox');

    fireEvent.change(select, { target: { value: 'shopee' } });
    expect(screen.getByText('ecommerce_test_tool')).toBeInTheDocument();

    fireEvent.change(select, { target: { value: 'lazada' } });
    expect(screen.queryByText('ecommerce_test_tool')).not.toBeInTheDocument();
  });
});

describe('ToolsExplorer - Payload Validation', () => {
  it('validates correct payload', async () => {
    render(<ToolsExplorer />);
    await waitFor(() => { fireEvent.click(screen.getByText('ecommerce_test_tool')); });

    const textarea = document.querySelector('textarea.bg-slate-900') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: '{"a": "yes", "b": 1, "c": true, "d": ["x"], "e": {"f": "ok"}}' } });

    fireEvent.click(screen.getByText('Validate Payload'));
    expect(screen.getByText(/Payload schema validation passed/)).toBeInTheDocument();
  });

  it('detects missing required property', async () => {
    render(<ToolsExplorer />);
    await waitFor(() => { fireEvent.click(screen.getByText('ecommerce_test_tool')); });

    const textarea = document.querySelector('textarea.bg-slate-900') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: '{"b": 1}' } });

    fireEvent.click(screen.getByText('Validate Payload'));
    expect(screen.getByText(/Missing required property "a" at root/)).toBeInTheDocument();
  });

  it('detects invalid enum', async () => {
    render(<ToolsExplorer />);
    await waitFor(() => { fireEvent.click(screen.getByText('ecommerce_test_tool')); });

    const textarea = document.querySelector('textarea.bg-slate-900') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: '{"a": "maybe"}' } });

    fireEvent.click(screen.getByText('Validate Payload'));
    expect(screen.getByText(/Invalid enum value "maybe" at root\.a/)).toBeInTheDocument();
  });

  it('detects wrong types and unknown properties', async () => {
    render(<ToolsExplorer />);
    await waitFor(() => { fireEvent.click(screen.getByText('ecommerce_test_tool')); });

    const textarea = document.querySelector('textarea.bg-slate-900') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: '{"a": "yes", "b": "not a number", "c": "not bool", "z": 99}' } });

    fireEvent.click(screen.getByText('Validate Payload'));
    expect(screen.getByText(/Expected number at root\.b/)).toBeInTheDocument();
    expect(screen.getByText(/Expected boolean at root\.c/)).toBeInTheDocument();
    expect(screen.getByText(/Unknown property "z" at root/)).toBeInTheDocument();
  });

  it('detects malformed JSON', async () => {
    render(<ToolsExplorer />);
    await waitFor(() => { fireEvent.click(screen.getByText('ecommerce_test_tool')); });

    const textarea = document.querySelector('textarea.bg-slate-900') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: '{ bad json' } });

    fireEvent.click(screen.getByText('Validate Payload'));
    expect(screen.getByText(/Malformed JSON:/)).toBeInTheDocument();
  });
});

describe('ZeroDefectLinter', () => {
  it('fails on missing items in array', () => {
    render(<ZeroDefectLinter />);
    const input = screen.getByPlaceholderText('วาง JSON Schema ที่นี่...');
    fireEvent.change(input, { target: { value: '{"type": "object", "properties": {"a": {"type": "array"}}, "required": []}' } });
    fireEvent.click(screen.getByText('Lint Schema'));
    expect(screen.getByText(/missing "items"/)).toBeInTheDocument();
  });

  it('fails on missing required', () => {
    render(<ZeroDefectLinter />);
    const input = screen.getByPlaceholderText('วาง JSON Schema ที่นี่...');
    fireEvent.change(input, { target: { value: '{"type": "object", "properties": {"a": {"type": "string"}}}' } });
    fireEvent.click(screen.getByText('Lint Schema'));
    expect(screen.getByText(/missing "required" array/)).toBeInTheDocument();
  });

  it('fails on missing properties', () => {
    render(<ZeroDefectLinter />);
    const input = screen.getByPlaceholderText('วาง JSON Schema ที่นี่...');
    fireEvent.change(input, { target: { value: '{"type": "object", "required": []}' } });
    fireEvent.click(screen.getByText('Lint Schema'));
    expect(screen.getByText(/missing "properties"/)).toBeInTheDocument();
  });

  it('fails on $ref', () => {
    render(<ZeroDefectLinter />);
    const input = screen.getByPlaceholderText('วาง JSON Schema ที่นี่...');
    fireEvent.change(input, { target: { value: '{"type": "object", "properties": {"a": {"$ref": "#/def"}}, "required": []}' } });
    fireEvent.click(screen.getByText('Lint Schema'));
    expect(screen.getByText(/contains prohibited "\$ref"/)).toBeInTheDocument();
  });

  it('fails on anyOf', () => {
    render(<ZeroDefectLinter />);
    const input = screen.getByPlaceholderText('วาง JSON Schema ที่นี่...');
    fireEvent.change(input, { target: { value: '{"type": "object", "properties": {"a": {"anyOf": []}}, "required": []}' } });
    fireEvent.click(screen.getByText('Lint Schema'));
    expect(screen.getByText(/contains prohibited complex logic/)).toBeInTheDocument();
  });

  it('fails dynamic object missing _dummy', () => {
    render(<ZeroDefectLinter />);
    const input = screen.getByPlaceholderText('วาง JSON Schema ที่นี่...');
    fireEvent.change(input, { target: { value: '{"type": "object", "properties": {"b": {"type": "string"}}, "required": [], "additionalProperties": true}' } });
    fireEvent.click(screen.getByText('Lint Schema'));
    expect(screen.getByText(/is missing "_dummy" property/)).toBeInTheDocument();
  });

  it('fails ordinary object misclassified as dynamic', () => {
    render(<ZeroDefectLinter />);
    const input = screen.getByPlaceholderText('วาง JSON Schema ที่นี่...');
    fireEvent.change(input, { target: { value: '{"type": "object", "properties": {"_dummy": {"type": "string"}}, "required": []}' } });
    fireEvent.click(screen.getByText('Lint Schema'));
    expect(screen.getByText(/contains "_dummy" but is not dynamic/)).toBeInTheDocument();
  });

  it('passes strict valid schema', () => {
    render(<ZeroDefectLinter />);
    const input = screen.getByPlaceholderText('วาง JSON Schema ที่นี่...');
    fireEvent.change(input, { target: { value: '{"type": "object", "properties": {"a": {"type": "string"}}, "required": ["a"]}' } });
    fireEvent.click(screen.getByText('Lint Schema'));
    expect(screen.getByText(/ผ่านเกณฑ์ Zero-Defect Protocol 100%/)).toBeInTheDocument();
  });
});
