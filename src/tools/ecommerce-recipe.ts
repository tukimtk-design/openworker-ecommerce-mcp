import { RecipeRunner, Recipe } from "../services/recipe-runner.js";

const runner = new RecipeRunner();

export async function handleEcommerceRunRecipe(args: any) {
    const recipeId = args?.recipeId;
    const params = args?.params || {};

    if (!recipeId) {
        return { isError: true, content: [{ type: "text", text: "Missing recipeId" }] };
    }

    try {
        const result = await runner.runRecipe(recipeId, params);
        return { content: [{ type: "text", text: JSON.stringify(result) }] };
    } catch (error: any) {
        return { isError: true, content: [{ type: "text", text: error.message }] };
    }
}

export async function handleEcommerceListRecipes(args: any) {
    const recipes = runner.listRecipes();
    return {
        content: [{ type: "text", text: JSON.stringify({ status: "success", recipes }) }]
    };
}

export async function handleEcommerceSaveCustomRecipe(args: any) {
    const recipe = args?.recipe as Recipe;
    if (!recipe || !recipe.id || !recipe.steps) {
        return { isError: true, content: [{ type: "text", text: "Invalid recipe format" }] };
    }

    runner.addRecipe(recipe);
    return {
        content: [{ type: "text", text: JSON.stringify({ status: "success", message: `Recipe '${recipe.id}' saved successfully.` }) }]
    };
}
