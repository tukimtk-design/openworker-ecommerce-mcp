export interface MediaAsset {
    type: 'image' | 'video' | 'audio';
    url: string;
    durationSec: number;
}

export interface CapCutDraftOptions {
    projectName: string;
    mediaAssets: MediaAsset[];
    voiceoverScript: string;
    hookStyle: 'problem_solution' | 'shock_curiosity' | 'before_after' | 'flash_sale_urgency';
}

function generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function buildDraftContent(options: CapCutDraftOptions): any {
    const { mediaAssets, voiceoverScript, hookStyle } = options;

    const materials: any = {
        video: [],
        audio: [],
        texts: [],
        stickers: []
    };

    const tracks: any[] = [];

    // Convert seconds to microseconds
    const secToUs = (sec: number) => Math.floor(sec * 1000000);

    // Track 1: Video/Image
    const visualTrack = {
        id: generateId(),
        type: 'video',
        segments: [] as any[]
    };

    let currentUs = 0;

    mediaAssets.filter(m => m.type === 'video' || m.type === 'image').forEach((asset, index) => {
        const materialId = generateId();
        const durationUs = secToUs(asset.durationSec);

        materials.video.push({
            id: materialId,
            type: asset.type,
            path: asset.url,
            duration: durationUs
        });

        visualTrack.segments.push({
            id: generateId(),
            material_id: materialId,
            target_timerange: {
                start: currentUs,
                duration: durationUs
            }
        });

        currentUs += durationUs;
    });

    if (visualTrack.segments.length > 0) {
        tracks.push(visualTrack);
    }

    const totalDurationUs = currentUs;

    // Track 2: Voiceover
    const voiceoverTrack = {
        id: generateId(),
        type: 'audio',
        segments: [] as any[]
    };

    const voiceoverMaterialId = generateId();
    materials.audio.push({
        id: voiceoverMaterialId,
        type: 'voiceover',
        text: voiceoverScript,
        path: 'generated_voiceover.mp3', // Mock path
        duration: totalDurationUs
    });

    voiceoverTrack.segments.push({
        id: generateId(),
        material_id: voiceoverMaterialId,
        target_timerange: {
            start: 0,
            duration: totalDurationUs
        }
    });
    tracks.push(voiceoverTrack);

    // Track 3: BGM with Auto-Ducking
    const bgmTrack = {
        id: generateId(),
        type: 'audio',
        segments: [] as any[]
    };

    const bgmMaterialId = generateId();
    materials.audio.push({
        id: bgmMaterialId,
        type: 'bgm',
        path: 'bgm.mp3', // Mock path
        duration: totalDurationUs,
        ducking: {
            enabled: true,
            amount: 0.5
        }
    });

    bgmTrack.segments.push({
        id: generateId(),
        material_id: bgmMaterialId,
        target_timerange: {
            start: 0,
            duration: totalDurationUs
        }
    });
    tracks.push(bgmTrack);

    // Track 4: Subtitle Text (Yellow stroke)
    const textTrack = {
        id: generateId(),
        type: 'text',
        segments: [] as any[]
    };

    const textMaterialId = generateId();
    materials.texts.push({
        id: textMaterialId,
        content: voiceoverScript,
        style: {
            fill_color: '#FFFFFF',
            stroke: {
                color: '#FFFF00', // Yellow stroke
                width: 0.05
            }
        }
    });

    textTrack.segments.push({
        id: generateId(),
        material_id: textMaterialId,
        target_timerange: {
            start: 0,
            duration: totalDurationUs
        }
    });
    tracks.push(textTrack);

    // Track 5: CTA Sticker Overlay
    const stickerTrack = {
        id: generateId(),
        type: 'sticker',
        segments: [] as any[]
    };

    const stickerMaterialId = generateId();
    materials.stickers.push({
        id: stickerMaterialId,
        path: 'cta_sticker.png'
    });

    // Sticker appears in the last 2 seconds
    const stickerStartUs = Math.max(0, totalDurationUs - secToUs(2));
    const stickerDurationUs = totalDurationUs - stickerStartUs;

    if (stickerDurationUs > 0) {
        stickerTrack.segments.push({
            id: generateId(),
            material_id: stickerMaterialId,
            target_timerange: {
                start: stickerStartUs,
                duration: stickerDurationUs
            }
        });
        tracks.push(stickerTrack);
    }

    return {
        id: generateId(),
        materials,
        tracks,
        canvas_config: {
            width: 1080,
            height: 1920,
            ratio: "9:16"
        },
        duration: totalDurationUs
    };
}

export function buildDraftMetaInfo(options: CapCutDraftOptions): any {
    return {
        id: generateId(),
        draft_name: options.projectName,
        draft_type: 1,
        tm_draft_create: Date.now(),
        tm_draft_modified: Date.now(),
        draft_fold_path: '',
        draft_timeline_materials_size: 0
    };
}
