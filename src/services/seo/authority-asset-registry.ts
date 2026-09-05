import { SeoPolicyGuard } from "./seo-policy-guard.js";

export interface AuthorityAssetMetadata {
  description?: string;
  keywords?: string[];
  [key: string]: any;
}

export interface AuthorityAsset {
  id: string;
  type: "checklist" | "table" | "diagram" | "other";
  title: string;
  content: string; // url or text content
  metadata: AuthorityAssetMetadata;
}

export class AuthorityAssetRegistry {
  private assets: Map<string, AuthorityAsset> = new Map();

  public registerAsset(asset: AuthorityAsset): void {
    // 1. Validate content and title with SeoPolicyGuard for negative keywords
    // We combine title, content (if it's text) and keywords for validation
    let textToValidate = asset.title;
    if (asset.metadata?.description) {
      textToValidate += " " + asset.metadata.description;
    }
    if (asset.metadata?.keywords && asset.metadata.keywords.length > 0) {
      textToValidate += " " + asset.metadata.keywords.join(" ");
    }
    if (asset.content) {
      textToValidate += " " + asset.content;
    }

    const guardResult = SeoPolicyGuard.checkPolicy({ text: textToValidate });
    if (!guardResult.isSafe) {
      throw new Error(`SeoPolicyGuard violation: Rejected keywords found in asset [${asset.id}]: ${guardResult.rejectedKeywords.join(", ")}`);
    }

    // 2. Store asset
    this.assets.set(asset.id, asset);
  }

  public getAsset(id: string): AuthorityAsset | undefined {
    return this.assets.get(id);
  }

  public listAssets(): AuthorityAsset[] {
    return Array.from(this.assets.values());
  }

  public clear(): void {
    this.assets.clear();
  }
}
