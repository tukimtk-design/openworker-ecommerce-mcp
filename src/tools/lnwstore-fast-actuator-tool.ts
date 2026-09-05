import { LnwStoreFastActuator } from "../services/seo/lnwstore-fast-actuator.js";

export async function handleEcommerceLnwstoreUpdateCategory(args: any): Promise<any> {
  if (!args || typeof args.catId !== "number" || !args.seoTitle || !args.seoDesc || !Array.isArray(args.seoKeywords)) {
    return {
      isError: true,
      content: [{ type: "text", text: "Invalid arguments: catId, seoTitle, seoDesc, and seoKeywords (array) are required" }]
    };
  }

  const actuator = new LnwStoreFastActuator();
  const result = await actuator.updateCategory(args);
  return {
    content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
  };
}

export async function handleEcommerceLnwstorePublishBlog(args: any): Promise<any> {
  if (!args || !args.title || !args.contentHtml || !args.seoTitle || !args.seoDesc || !Array.isArray(args.seoKeywords) || !args.slug || !Array.isArray(args.tags)) {
    return {
      isError: true,
      content: [{ type: "text", text: "Invalid arguments: title, contentHtml, seoTitle, seoDesc, seoKeywords (array), slug, and tags (array) are required" }]
    };
  }

  const actuator = new LnwStoreFastActuator();
  const result = await actuator.publishBlog(args);
  return {
    content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
  };
}

export async function handleEcommerceLnwstoreInjectSchema(args: any): Promise<any> {
  if (!args || !args.jsonLdScript) {
    return {
      isError: true,
      content: [{ type: "text", text: "Invalid arguments: jsonLdScript is required" }]
    };
  }

  const actuator = new LnwStoreFastActuator();
  const result = await actuator.injectSchema(args);
  return {
    content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
  };
}
