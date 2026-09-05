import { AuthorityAssetRegistry, AuthorityAsset } from "../services/seo/authority-asset-registry.js";
import { PublisherRelevanceFilter } from "../services/seo/publisher-relevance-filter.js";
import { MentionObservationLedger, BrandMention, EarnedBacklink, DriftData } from "../services/seo/mention-observation-ledger.js";

const assetRegistry = new AuthorityAssetRegistry();
const relevanceFilter = new PublisherRelevanceFilter();
const observationLedger = new MentionObservationLedger();

export async function handleEcommerceAuthorityAssetRegistry(args: any): Promise<any> {
  const { action, asset, assetId } = args;

  try {
    if (action === 'register') {
      if (!asset) {
        return { isError: true, content: [{ type: "text", text: "Missing 'asset' for registration." }] };
      }
      assetRegistry.registerAsset(asset as AuthorityAsset);
      return {
        content: [{ type: "text", text: JSON.stringify({ status: "success", message: `Asset ${asset.id} registered successfully.` }) }]
      };
    } else if (action === 'get') {
      if (!assetId) {
        return { isError: true, content: [{ type: "text", text: "Missing 'assetId' to get asset." }] };
      }
      const retrievedAsset = assetRegistry.getAsset(assetId);
      if (!retrievedAsset) {
        return { isError: true, content: [{ type: "text", text: `Asset ${assetId} not found.` }] };
      }
      return {
        content: [{ type: "text", text: JSON.stringify({ status: "success", asset: retrievedAsset }) }]
      };
    } else if (action === 'list') {
      const assets = assetRegistry.listAssets();
      return {
        content: [{ type: "text", text: JSON.stringify({ status: "success", assets }) }]
      };
    } else {
      return { isError: true, content: [{ type: "text", text: `Unknown action: ${action}` }] };
    }
  } catch (error: any) {
    return { isError: true, content: [{ type: "text", text: error.message }] };
  }
}

export async function handleEcommercePublisherRelevanceFilter(args: any): Promise<any> {
  const { publisherUrl, content } = args;

  if (!publisherUrl || !content) {
    return { isError: true, content: [{ type: "text", text: "Missing 'publisherUrl' or 'content' for evaluation." }] };
  }

  try {
    const result = relevanceFilter.evaluateRelevance(publisherUrl, content);
    return {
      content: [{ type: "text", text: JSON.stringify({ status: "success", result }) }]
    };
  } catch (error: any) {
    return { isError: true, content: [{ type: "text", text: error.message }] };
  }
}

export async function handleEcommerceMentionObservationLedger(args: any): Promise<any> {
  const { action, mention, backlink, driftData } = args;

  try {
    if (action === 'record_mention') {
      if (!mention) {
        return { isError: true, content: [{ type: "text", text: "Missing 'mention' data." }] };
      }
      observationLedger.recordMention(mention as BrandMention);
      return {
        content: [{ type: "text", text: JSON.stringify({ status: "success", message: `Mention ${mention.id} recorded.` }) }]
      };
    } else if (action === 'record_backlink') {
      if (!backlink) {
        return { isError: true, content: [{ type: "text", text: "Missing 'backlink' data." }] };
      }
      observationLedger.recordBacklink(backlink as EarnedBacklink);
      return {
        content: [{ type: "text", text: JSON.stringify({ status: "success", message: `Backlink ${backlink.id} recorded.` }) }]
      };
    } else if (action === 'correlate_drift') {
      if (!driftData) {
        return { isError: true, content: [{ type: "text", text: "Missing 'driftData' for correlation." }] };
      }
      const correlation = observationLedger.correlateDrift(driftData as DriftData);
      return {
        content: [{ type: "text", text: JSON.stringify({ status: "success", correlation }) }]
      };
    } else if (action === 'get_all') {
      return {
        content: [{ type: "text", text: JSON.stringify({
            status: "success",
            mentions: observationLedger.getMentions(),
            backlinks: observationLedger.getBacklinks()
        }) }]
      };
    } else {
      return { isError: true, content: [{ type: "text", text: `Unknown action: ${action}` }] };
    }
  } catch (error: any) {
    return { isError: true, content: [{ type: "text", text: error.message }] };
  }
}
