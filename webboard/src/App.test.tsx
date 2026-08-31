import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ToolsExplorer } from './components/ToolsExplorer';
import { ZeroDefectLinter } from './components/ZeroDefectLinter';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockTools = {
  tools: [
    {
      name: "ecommerce_test_tool",
      description: "Test description for shopee",
      inputSchema: { type: "object", properties: { a: { type: "string" } }, required: ["a"] }
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
  // mock clipboard
  Object.assign(navigator, {
    clipboard: { writeText: vi.fn() },
  });
});

describe('ToolsExplorer', () => {
  it('renders and filters tools, then selects and copies inputSchema', async () => {
    render(<ToolsExplorer />);

    // Wait for fetch to complete
    await waitFor(() => {
      expect(screen.getByText('ecommerce_test_tool')).toBeInTheDocument();
    });

    // Select Tool
    fireEvent.click(screen.getByText('ecommerce_test_tool'));
    expect(screen.getByText('Copy inputSchema')).toBeInTheDocument();

    // Verify inputSchema is rendered
    expect(screen.getByText(/"a": \{/)).toBeInTheDocument();

    // Click Copy
    fireEvent.click(screen.getByText('Copy inputSchema'));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(JSON.stringify(mockTools.tools[0].inputSchema, null, 2));
  });

  it('handles platform filter', async () => {
    render(<ToolsExplorer />);
    await waitFor(() => {
      expect(screen.getByText('ecommerce_test_tool')).toBeInTheDocument();
    });

    const select = screen.getByRole('combobox');

    // Select shopee (should match)
    fireEvent.change(select, { target: { value: 'shopee' } });
    expect(screen.getByText('ecommerce_test_tool')).toBeInTheDocument();

    // Select lazada (should hide)
    fireEvent.change(select, { target: { value: 'lazada' } });
    expect(screen.queryByText('ecommerce_test_tool')).not.toBeInTheDocument();
  });
});

describe('ZeroDefectLinter', () => {
  it('fails on missing items in array', () => {
    render(<ZeroDefectLinter />);

    const input = screen.getByPlaceholderText('วาง JSON Schema ที่นี่...');
    const button = screen.getByText('Lint Schema');

    fireEvent.change(input, { target: { value: '{"type": "object", "properties": {"a": {"type": "array"}}, "required": []}' } });
    fireEvent.click(button);

    expect(screen.getByText(/missing "items"/)).toBeInTheDocument();
  });

  it('fails on missing required', () => {
    render(<ZeroDefectLinter />);
    const input = screen.getByPlaceholderText('วาง JSON Schema ที่นี่...');
    fireEvent.change(input, { target: { value: '{"type": "object", "properties": {"a": {"type": "string"}}}' } });
    fireEvent.click(screen.getByText('Lint Schema'));
    expect(screen.getByText(/missing "required" array/)).toBeInTheDocument();
  });

  it('fails on $ref', () => {
    render(<ZeroDefectLinter />);
    const input = screen.getByPlaceholderText('วาง JSON Schema ที่นี่...');
    fireEvent.change(input, { target: { value: '{"type": "object", "properties": {"a": {"$ref": "#/def"}}, "required": []}' } });
    fireEvent.click(screen.getByText('Lint Schema'));
    expect(screen.getByText(/contains prohibited "\$ref"/)).toBeInTheDocument();
  });

  it('passes strict valid schema', () => {
    render(<ZeroDefectLinter />);
    const input = screen.getByPlaceholderText('วาง JSON Schema ที่นี่...');
    fireEvent.change(input, { target: { value: '{"type": "object", "properties": {"a": {"type": "string"}}, "required": ["a"]}' } });
    fireEvent.click(screen.getByText('Lint Schema'));
    expect(screen.getByText(/ผ่านเกณฑ์ Zero-Defect Protocol 100%/)).toBeInTheDocument();
  });
});
