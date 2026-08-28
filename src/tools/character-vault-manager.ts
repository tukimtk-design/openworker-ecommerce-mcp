import { CharacterConsistencyEngine, CharacterAnchor, VideoProviderPromptOptions } from '../utils/character-consistency-engine.js';

const engine = new CharacterConsistencyEngine();

export const characterVaultManagerSchema = {
    name: "ow_character_vault_manager",
    description: "Manage AI Video Character Vault (Character Consistency Vault). Create, retrieve, list characters, and compile prompts for various video AI providers.",
    inputSchema: {
        type: "object",
        properties: {
            action: {
                type: "string",
                description: "Action to perform: 'create_character', 'get_character', 'list_characters', 'compile_scene_prompt'"
            },
            character: {
                type: "object",
                description: "Character data for 'create_character' action",
                properties: {
                    id: { type: "string" },
                    name: { type: "string" },
                    faceDnaTags: {
                        type: "array",
                        items: { type: "string" }
                    },
                    clothingPalette: {
                        type: "array",
                        items: { type: "string" }
                    },
                    lightingEnvironment: { type: "string" },
                    vocalToneId: { type: "string" },
                    visualReferenceUrls: {
                        type: "array",
                        items: { type: "string" }
                    }
                }
            },
            characterId: {
                type: "string",
                description: "Character ID for 'get_character' or 'compile_scene_prompt' action"
            },
            promptOptions: {
                type: "object",
                description: "Options for 'compile_scene_prompt' action",
                properties: {
                    provider: {
                        type: "string",
                        description: "One of: 'Google Veo', 'Grok Video', 'Midjourney/Flux', 'CapCut'"
                    },
                    sceneDescription: { type: "string" },
                    cameraAngle: { type: "string" },
                    motionIntensity: { type: "string" }
                }
            }
        },
        required: ["action"]
    }
};

export async function executeCharacterVaultManager(args: any): Promise<any> {
    const { action } = args;

    try {
        switch (action) {
            case 'create_character': {
                if (!args.character) {
                    throw new Error("Missing 'character' parameter for 'create_character' action.");
                }
                const character: CharacterAnchor = args.character;
                engine.saveCharacter(character);
                return {
                    success: true,
                    message: `Character ${character.name} (ID: ${character.id}) saved successfully.`,
                    character
                };
            }
            case 'get_character': {
                if (!args.characterId) {
                    throw new Error("Missing 'characterId' parameter for 'get_character' action.");
                }
                const char = engine.getCharacter(args.characterId);
                if (!char) {
                    return { success: false, error: `Character ${args.characterId} not found.` };
                }
                return { success: true, character: char };
            }
            case 'list_characters': {
                const chars = engine.listCharacters();
                return { success: true, characters: chars };
            }
            case 'compile_scene_prompt': {
                if (!args.characterId || !args.promptOptions) {
                    throw new Error("Missing 'characterId' or 'promptOptions' parameter for 'compile_scene_prompt' action.");
                }
                const options: VideoProviderPromptOptions = args.promptOptions;
                const prompt = engine.compileScenePrompt(args.characterId, options);
                return {
                    success: true,
                    prompt
                };
            }
            default:
                throw new Error(`Unknown action: ${action}`);
        }
    } catch (error: any) {
        return {
            success: false,
            error: error.message || String(error)
        };
    }
}
