import test from "node:test";
import assert from "node:assert";
import { TopicClusterScheduler } from "../services/seo/topic-cluster-scheduler.js";

test("TopicClusterScheduler - successful scheduling", () => {
  const scheduler = new TopicClusterScheduler();
  const articles = [
    {
      id: "a1",
      title: "บทความทั่วไป 1",
      content: "เนื้อหาที่ไม่มีคำต้องห้าม",
      targetKeyword: "ทั่วไป"
    },
    {
      id: "a2",
      title: "บทความทั่วไป 2",
      content: "เนื้อหาที่ดีมาก",
      targetKeyword: "ดีมาก"
    }
  ];

  const result = scheduler.scheduleCluster(articles);
  assert.strictEqual(result.scheduledArticles.length, 2);
  assert.strictEqual(Object.keys(result.linkGraph).length, 2);
  
  // Test link graph (Ring structure)
  assert.deepStrictEqual(result.linkGraph["a1"], ["a2"]);
  assert.deepStrictEqual(result.linkGraph["a2"], ["a1"]);
});

test("TopicClusterScheduler - reject negative keyword 'มือสอง'", () => {
  const scheduler = new TopicClusterScheduler();
  const articles = [
    {
      id: "a1",
      title: "ขายของมือสอง",
      content: "เนื้อหา",
      targetKeyword: "ทั่วไป"
    }
  ];

  assert.throws(
    () => scheduler.scheduleCluster(articles),
    (err: Error) => err.message.includes("Policy violation in title") && err.message.includes("มือสอง")
  );
});

test("TopicClusterScheduler - reject negative keyword 'ปิดฝาฟอยล์'", () => {
  const scheduler = new TopicClusterScheduler();
  const articles = [
    {
      id: "a1",
      title: "บทความทั่วไป",
      content: "มีคำว่าปิดฝาฟอยล์",
      targetKeyword: "ทั่วไป"
    }
  ];

  assert.throws(
    () => scheduler.scheduleCluster(articles),
    (err: Error) => err.message.includes("Policy violation in content") && err.message.includes("ปิดฝาฟอยล์")
  );
});

test("TopicClusterScheduler - reject negative keyword 'กระปุก'", () => {
  const scheduler = new TopicClusterScheduler();
  const articles = [
    {
      id: "a1",
      title: "บทความทั่วไป",
      content: "มีคำว่ากระปุก",
      targetKeyword: "ทั่วไป"
    }
  ];

  assert.throws(
    () => scheduler.scheduleCluster(articles),
    (err: Error) => err.message.includes("Policy violation in content") && err.message.includes("กระปุก")
  );
});

test("TopicClusterScheduler - reject negative keyword 'อย.'", () => {
  const scheduler = new TopicClusterScheduler();
  const articles = [
    {
      id: "a1",
      title: "บทความทั่วไป",
      content: "มีคำว่า อย. ปะปนอยู่",
      targetKeyword: "ทั่วไป"
    }
  ];

  assert.throws(
    () => scheduler.scheduleCluster(articles),
    (err: Error) => err.message.includes("Policy violation in content") && err.message.includes("อย.")
  );
});
