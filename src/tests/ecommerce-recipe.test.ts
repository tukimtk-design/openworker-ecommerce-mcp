import { describe, it } from "node:test";
import assert from "node:assert";
import { handleEcommerceListRecipes, handleEcommerceRunRecipe, handleEcommerceSaveCustomRecipe } from "../tools/ecommerce-recipe.js";

describe("Ecommerce Recipe Tools", () => {
  it("should list recipes", async () => {
    const result = await handleEcommerceListRecipes({});
    const parsed = JSON.parse((result as any).content[0].text);
    assert.strictEqual(parsed.status, "success");
    assert.ok(Array.isArray(parsed.recipes));
    assert.ok(parsed.recipes.length > 0);
  });

  it("should run a recipe", async () => {
    const result = await handleEcommerceRunRecipe({ recipeId: "quick_update_price", params: { price: "999" } });
    const parsed = JSON.parse((result as any).content[0].text);
    assert.strictEqual(parsed.status, "success");
    assert.ok(parsed.executedSteps[1].value === "999");
  });

  it("should save a custom recipe", async () => {
    const newRecipe = {
        id: "test_recipe",
        name: "Test Recipe",
        description: "Test description",
        steps: []
    };
    const result = await handleEcommerceSaveCustomRecipe({ recipe: newRecipe });
    const parsed = JSON.parse((result as any).content[0].text);
    assert.strictEqual(parsed.status, "success");
  });
});
