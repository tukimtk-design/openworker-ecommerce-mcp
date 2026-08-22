export interface Recipe {
    id: string;
    name: string;
    description: string;
    steps: RecipeStep[];
}

export interface RecipeStep {
    action: string;
    selectorKey?: string;
    selector?: string;
    value?: string;
    delayMs?: number;
    usedSelector?: string; // Add this property
}

export class RecipeRunner {
    private recipes: Map<string, Recipe> = new Map();

    constructor() {
        this.addRecipe({
            id: "quick_update_price",
            name: "Quick Price Update",
            description: "Updates a product's price quickly.",
            steps: [
                { action: "wait_for_selector", selectorKey: "shopee_price_input", delayMs: 500 },
                { action: "fill_input", selectorKey: "shopee_price_input", value: "${price}" },
                { action: "click", selectorKey: "shopee_save_button" }
            ]
        });
    }

    addRecipe(recipe: Recipe) {
        this.recipes.set(recipe.id, recipe);
    }

    getRecipe(id: string): Recipe | undefined {
        return this.recipes.get(id);
    }

    listRecipes(): Recipe[] {
        return Array.from(this.recipes.values());
    }

    async runRecipe(id: string, params: Record<string, string>, page?: any, cacheData?: Record<string, string[]>): Promise<any> {
        const recipe = this.getRecipe(id);
        if (!recipe) {
            throw new Error(`Recipe with id '${id}' not found.`);
        }

        const executedSteps = [];
        for (const step of recipe.steps) {
            let executedStep = { ...step };
            if (step.value) {
                executedStep.value = step.value.replace(/\${(.*?)}/g, (match, p1) => params[p1] || match);
            }

            let resolvedSelector = step.selector;

            if (step.selectorKey && cacheData && cacheData[step.selectorKey]) {
                const candidates = cacheData[step.selectorKey];
                for (const candidate of candidates) {
                    if (page) {
                        try {
                            await page.locator(candidate).waitFor({ timeout: 500 });
                            resolvedSelector = candidate;
                            break;
                        } catch (err) {
                            // try next
                        }
                    } else {
                        if (!resolvedSelector) resolvedSelector = candidate;
                    }
                }
            }

            if (resolvedSelector) {
                 executedStep.usedSelector = resolvedSelector;
            }

            executedSteps.push(executedStep);
        }

        return {
            status: "success",
            message: `Successfully executed recipe: ${recipe.name}`,
            executedSteps
        };
    }
}
