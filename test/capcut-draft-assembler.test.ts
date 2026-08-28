import * as fs from 'fs';
import * as path from 'path';
import { buildDraftContent, buildDraftMetaInfo } from '../src/utils/capcut-schema-builder';
import { handleEcommerceCapcutDraftAssembler } from '../src/tools/capcut-draft-assembler';

describe('CapCut Draft Assembler', () => {
    const testDir = path.join(__dirname, 'test_output');

    beforeAll(() => {
        if (!fs.existsSync(testDir)) {
            fs.mkdirSync(testDir, { recursive: true });
        }
    });

    afterAll(() => {
        if (fs.existsSync(testDir)) {
            fs.rmSync(testDir, { recursive: true, force: true });
        }
    });

    it('should generate valid draft content JSON', () => {
        const options = {
            projectName: 'Test Project',
            mediaAssets: [
                { type: 'video' as const, url: 'video1.mp4', durationSec: 3 },
                { type: 'image' as const, url: 'image1.jpg', durationSec: 2 }
            ],
            voiceoverScript: 'Hello world',
            hookStyle: 'problem_solution' as const
        };

        const content = buildDraftContent(options);

        expect(content.canvas_config).toEqual({ width: 1080, height: 1920, ratio: '9:16' });
        expect(content.duration).toBe(5000000); // 5 seconds in microseconds
        expect(content.tracks.length).toBeGreaterThan(0);

        // Verify we have all 5 tracks
        const trackTypes = content.tracks.map((t: any) => t.type);
        expect(trackTypes).toContain('video');
        expect(trackTypes).toContain('audio'); // voiceover
        expect(trackTypes).toContain('text');
        expect(trackTypes).toContain('sticker');
    });

    it('should run MCP tool successfully', async () => {
        const args = {
            projectName: 'tool_test_project',
            mediaAssets: [
                { type: 'video', url: 'video1.mp4', durationSec: 3 }
            ],
            voiceoverScript: 'Viral hook here',
            hookStyle: 'shock_curiosity',
            outputDirectory: testDir
        };

        const result = await handleEcommerceCapcutDraftAssembler(args);

        expect(result.isError).toBeUndefined();
        expect(result.content[0].type).toBe('text');

        const responseJson = JSON.parse(result.content[0].text);
        expect(responseJson.status).toBe('success');

        const projectPath = path.join(testDir, 'tool_test_project');
        expect(fs.existsSync(path.join(projectPath, 'draft_content.json'))).toBe(true);
        expect(fs.existsSync(path.join(projectPath, 'draft_meta_info.json'))).toBe(true);
    });

    it('should return error if missing params', async () => {
        const result = await handleEcommerceCapcutDraftAssembler({ projectName: 'incomplete' });

        expect(result.isError).toBe(true);
        expect(result.content[0].text).toContain('Missing required parameters');
    });
});
