export interface CharacterAnchor {
    id: string;
    name: string;
    faceDnaTags: string[];
    clothingPalette: string[];
    lightingEnvironment: string;
    vocalToneId: string;
    visualReferenceUrls: string[];
}

export interface VideoProviderPromptOptions {
    provider: 'Google Veo' | 'Grok Video' | 'Midjourney/Flux' | 'CapCut';
    sceneDescription: string;
    cameraAngle?: string;
    motionIntensity?: string;
}

export class CharacterConsistencyEngine {
    private vault: Map<string, CharacterAnchor> = new Map();

    public saveCharacter(anchor: CharacterAnchor): void {
        this.vault.set(anchor.id, anchor);
    }

    public getCharacter(id: string): CharacterAnchor | undefined {
        return this.vault.get(id);
    }

    public listCharacters(): CharacterAnchor[] {
        return Array.from(this.vault.values());
    }

    public compileScenePrompt(characterId: string, options: VideoProviderPromptOptions): string {
        const character = this.vault.get(characterId);
        if (!character) {
            throw new Error(`Character with ID ${characterId} not found.`);
        }

        const basePrompt = `${character.name}, face defined by ${character.faceDnaTags.join(', ')}. Wearing ${character.clothingPalette.join(', ')}. Scene lit with ${character.lightingEnvironment}.`;
        const actionPrompt = options.sceneDescription;
        const cameraInfo = options.cameraAngle ? ` Camera angle: ${options.cameraAngle}.` : '';
        const motionInfo = options.motionIntensity ? ` Motion: ${options.motionIntensity}.` : '';

        // Injection rules specific to providers
        switch (options.provider) {
            case 'Google Veo':
                return `[Google Veo Optimized] ${basePrompt} Action: ${actionPrompt}${cameraInfo}${motionInfo} Visually consistent with: ${character.visualReferenceUrls.join(', ')}`;
            case 'Grok Video':
                return `[Grok Video Prompt] Character: ${basePrompt} Context: ${actionPrompt}${cameraInfo}${motionInfo}`;
            case 'Midjourney/Flux':
                return `[Flux Style] ${basePrompt} doing ${actionPrompt}${cameraInfo}${motionInfo} --cref ${character.visualReferenceUrls[0] || 'none'} --cw 100`;
            case 'CapCut':
                return `[CapCut AI] Scene: ${actionPrompt}. Character appearance: ${basePrompt}. Voice Tone: ${character.vocalToneId}${cameraInfo}${motionInfo}`;
            default:
                return `${basePrompt} ${actionPrompt}${cameraInfo}${motionInfo}`;
        }
    }
}
