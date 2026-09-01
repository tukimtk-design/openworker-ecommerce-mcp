export async function handleEcommerceSafetyGuard(args: any) {
  const current = Number(args?.currentPrice || 0);
  const proposed = Number(args?.proposedPrice || 0);
  const maxDrop = Number(args?.maxPriceDropPercent || 50);

  const minPriceFloor = Number(args?.minPriceFloor || 50); // Minimum hardcoded threshold

  const dropPercent = ((current - proposed) / current) * 100;
  const isSafeDrop = dropPercent <= maxDrop;
  const isAboveFloor = proposed >= minPriceFloor;
  
  const isSafe = isSafeDrop && isAboveFloor;
  let warning = null;
  if (!isSafeDrop) warning = `เตือน: ราคาสินค้าลดลง ${dropPercent.toFixed(1)}% ซึ่งเกินขีดจำกัดความปลอดภัย (${maxDrop}%)`;
  else if (!isAboveFloor) warning = `CRITICAL BLOCK: ราคาที่เสนอ (${proposed}) ต่ำกว่าขั้นต่ำที่อนุญาต (${minPriceFloor}) ปฏิเสธการอัปเดตเพื่อป้องกันการขาดทุน!`;

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify({
          isSafe,
          dropPercent: Number(dropPercent.toFixed(2)),
          warning
        }),
      },
    ],
  };
}
