import * as fs from 'fs';
import * as path from 'path';
import { buildDraftContent, buildDraftMetaInfo, MediaAsset, CapCutDraftOptions } from '../utils/capcut-schema-builder.js';

export async function handleEcommerceCapcutDraftAssembler(args: any) {
    try {
        const { projectName, mediaAssets, voiceoverScript, hookStyle, outputDirectory } = args;

        if (!projectName || !mediaAssets || !voiceoverScript || !hookStyle || !outputDirectory) {
            return {
                isError: true,
                content: [{ type: "text", text: "Missing required parameters: projectName, mediaAssets, voiceoverScript, hookStyle, or outputDirectory" }]
            };
        }

        const options: CapCutDraftOptions = {
            projectName,
            mediaAssets: mediaAssets as MediaAsset[],
            voiceoverScript,
            hookStyle
        };

        const draftContent = buildDraftContent(options);
        const draftMetaInfo = buildDraftMetaInfo(options);

        // Ensure output directory exists
        const projectDir = path.join(outputDirectory, projectName);
        if (!fs.existsSync(projectDir)) {
            fs.mkdirSync(projectDir, { recursive: true });
        }

        const draftContentPath = path.join(projectDir, 'draft_content.json');
        const draftMetaInfoPath = path.join(projectDir, 'draft_meta_info.json');

        fs.writeFileSync(draftContentPath, JSON.stringify(draftContent, null, 2), 'utf-8');
        fs.writeFileSync(draftMetaInfoPath, JSON.stringify(draftMetaInfo, null, 2), 'utf-8');

        return {
            content: [{
                type: "text",
                text: JSON.stringify({
                    status: "success",
                    message: `Successfully assembled CapCut draft project: ${projectName}`,
                    outputDirectory: projectDir,
                    filesCreated: ['draft_content.json', 'draft_meta_info.json'],
                    draftDurationUs: draftContent.duration
                })
            }]
        };

    } catch (error: any) {
        return {
            isError: true,
            content: [{ type: "text", text: `Error assembling CapCut draft: ${error.message}` }]
        };
    }
}
