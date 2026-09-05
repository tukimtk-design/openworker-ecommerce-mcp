import { CdpConnection } from "../services/cdp-connection.js";
import { ArticleClusterWeaver, Article, PublishSelectors } from "../services/seo/article-cluster-weaver.js";

export interface WeaveArticleClusterArgs {
  articles: Article[];
  categoryUrls?: string[];
  publishUrl?: string;
  selectors?: PublishSelectors;
  publish?: boolean;
}

export async function handleEcommerceWeaveArticleCluster(args: WeaveArticleClusterArgs) {
  const articles = args?.articles;
  const categoryUrls = args?.categoryUrls || [];
  const publishUrl = args?.publishUrl;
  const selectors = args?.selectors;
  const publish = args?.publish === true;

  if (!articles || !Array.isArray(articles)) {
    return {
      isError: true,
      content: [{ type: "text", text: "กรุณาระบุ articles เป็น array" }],
    };
  }

  for (const article of articles) {
    if (!article.id || !article.title || !article.content || !article.targetKeyword) {
      return {
        isError: true,
        content: [{ type: "text", text: "ข้อมูล article ไม่ครบถ้วน (ต้องการ id, title, content, targetKeyword)" }],
      };
    }
  }

  if (categoryUrls && !Array.isArray(categoryUrls)) {
     return {
        isError: true,
        content: [{ type: "text", text: "categoryUrls ต้องเป็น array" }],
     };
  }

  let cdp: CdpConnection | undefined;
  if (publish) {
    if (!publishUrl || typeof publishUrl !== 'string') {
        return {
            isError: true,
            content: [{ type: "text", text: "กรุณาระบุ publishUrl สำหรับการ publish" }],
        };
    }
    if (!selectors || typeof selectors !== 'object') {
        return {
            isError: true,
            content: [{ type: "text", text: "กรุณาระบุ selectors สำหรับการ publish" }],
        };
    }
    cdp = new CdpConnection();
  }

  const weaver = new ArticleClusterWeaver(cdp);

  try {
    const weaveResult = weaver.weaveCluster(articles, categoryUrls);

    if (publish && cdp && publishUrl && selectors) {
       await weaver.publishCluster(weaveResult.weavedArticles, publishUrl, selectors);
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            status: "success",
            message: publish ? "สร้างและ Publish บทความสำเร็จ" : "สร้างและ Weave บทความสำเร็จ",
            data: weaveResult
          })
        }
      ]
    };
  } catch (error: any) {
    return {
      isError: true,
      content: [{ type: "text", text: JSON.stringify({ status: "error", message: error.message }) }]
    };
  } finally {
    if (cdp) {
      await cdp.disconnect();
    }
  }
}
