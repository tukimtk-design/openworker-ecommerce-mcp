import { executeCharacterVaultManager } from '../src/tools/character-vault-manager.js';

describe('Character Vault Manager', () => {
    it('should create and get character', async () => {
        const createResult = await executeCharacterVaultManager({
            action: 'create_character',
            character: {
                id: 'char_001',
                name: 'Sarah Conner',
                faceDnaTags: ['sharp jawline', 'blue eyes', 'short hair'],
                clothingPalette: ['black leather jacket', 'dark jeans'],
                lightingEnvironment: 'dim dramatic lighting',
                vocalToneId: 'vocal_001',
                visualReferenceUrls: ['http://example.com/sarah.jpg']
            }
        });

        expect(createResult.success).toBe(true);
        expect(createResult.character.id).toBe('char_001');

        const getResult = await executeCharacterVaultManager({
            action: 'get_character',
            characterId: 'char_001'
        });

        expect(getResult.success).toBe(true);
        expect(getResult.character.name).toBe('Sarah Conner');
    });

    it('should list characters', async () => {
        await executeCharacterVaultManager({
            action: 'create_character',
            character: {
                id: 'char_002',
                name: 'John Doe',
                faceDnaTags: ['round face'],
                clothingPalette: ['white shirt'],
                lightingEnvironment: 'bright daylight',
                vocalToneId: 'vocal_002',
                visualReferenceUrls: []
            }
        });

        const listResult = await executeCharacterVaultManager({
            action: 'list_characters'
        });

        expect(listResult.success).toBe(true);
        expect(listResult.characters.length).toBeGreaterThanOrEqual(2);
    });

    it('should compile scene prompt', async () => {
        const compileResult = await executeCharacterVaultManager({
            action: 'compile_scene_prompt',
            characterId: 'char_001',
            promptOptions: {
                provider: 'Google Veo',
                sceneDescription: 'running away from a robot',
                cameraAngle: 'low angle',
                motionIntensity: 'high'
            }
        });

        expect(compileResult.success).toBe(true);
        expect(compileResult.prompt).toContain('[Google Veo Optimized]');
        expect(compileResult.prompt).toContain('Sarah Conner');
        expect(compileResult.prompt).toContain('running away from a robot');
        expect(compileResult.prompt).toContain('low angle');
        expect(compileResult.prompt).toContain('http://example.com/sarah.jpg');
    });
});
