import { TopicClusterScheduler, ScheduledArticle } from "../services/seo/topic-cluster-scheduler.js";

export async function handleEcommerceTopicClusterScheduler(args: any) {
  const { articles } = args || {};

  if (!articles || !Array.isArray(articles)) {
    return {
      isError: true,
      content: [{ type: "text", text: "Error: 'articles' must be provided as an array." }]
    };
  }

  const scheduler = new TopicClusterScheduler();

  try {
    const result = scheduler.scheduleCluster(articles as ScheduledArticle[]);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  } catch (error: any) {
    return {
      isError: true,
      content: [{ type: "text", text: `Error during scheduling: ${error.message}` }]
    };
  }
}
