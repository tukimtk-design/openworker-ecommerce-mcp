export interface Recipe {
    id: string;
    name: string;
    description: string;
    steps: RecipeStep[];
}

export interface RecipeStep {
    action: string;
    selector?: string;
    value?: string;
    delayMs?: number;
}

export class RecipeRunner {
    private recipes: Map<string, Recipe> = new Map();

    constructor() {
        this.addRecipe({
            id: "quick_update_price",
            name: "Quick Price Update",
            description: "Updates a product's price quickly.",
            steps: [
                { action: "wait_for_selector", selector: "#price-input", delayMs: 500 },
                { action: "fill_input", selector: "#price-input", value: "${price}" },
                { action: "click", selector: "#save-button" }
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

    async runRecipe(id: string, params: Record<string, string>): Promise<any> {
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
            executedSteps.push(executedStep);
        }

        return {
            status: "success",
            message: `Successfully executed recipe: ${recipe.name}`,
            executedSteps
        };
    }
}
