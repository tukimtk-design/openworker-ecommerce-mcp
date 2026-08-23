import { describe, it } from "node:test";
import assert from "node:assert";
import { handleEcommerceVideoScriptGenerator } from "../tools/video-script-generator.js";
import { handleEcommerceVideoEditorWorkflow } from "../tools/video-editor-workflow.js";
import { handleEcommerceAffiliateBasketTagger } from "../tools/affiliate-basket-tagger.js";
import { handleEcommerceSocialVideoPublisher } from "../tools/social-video-publisher.js";

describe("Phase 13: Video & Affiliate Suite", () => {
    it("should generate a video script", async () => {
        const result = await handleEcommerceVideoScriptGenerator({
            productId: "PROD1",
            platform: "tiktok",
            scriptStyle: "problem_solution"
        });
        const parsed = JSON.parse((result as any).content[0].text);
        assert.strictEqual(parsed.status, "success");
        assert.ok(parsed.storyboard.length === 3);
    });

    it("should assemble video workflow", async () => {
        const result = await handleEcommerceVideoEditorWorkflow({
            mediaAssets: [
                { type: "image", url: "img1.jpg", durationSec: 3 },
                { type: "video", url: "vid1.mp4", durationSec: 5 }
            ],
            exportFormat: "capcut_draft"
        });
        const parsed = JSON.parse((result as any).content[0].text);
        assert.strictEqual(parsed.status, "success");
        assert.strictEqual(parsed.details.totalAssetsProcessed, 2);
    });

    it("should generate affiliate basket tags", async () => {
        const result = await handleEcommerceAffiliateBasketTagger({
            platform: "tiktok",
            productId: "PROD1",
            affiliateCode: "AFF123"
        });
        const parsed = JSON.parse((result as any).content[0].text);
        assert.strictEqual(parsed.status, "success");
        assert.ok(parsed.basketConfig.affiliateLink.includes("AFF123"));
    });

    it("should publish social video", async () => {
        const result = await handleEcommerceSocialVideoPublisher({
            platform: "tiktok",
            videoFilePath: "local://videos/rendered_output.mp4",
            basketProductTag: {
                 productId: "PROD1",
                 affiliateLink: "link"
            }
        });
        const parsed = JSON.parse((result as any).content[0].text);
        assert.strictEqual(parsed.status, "success");
        assert.strictEqual(parsed.basketTagged, true);
    });
});
