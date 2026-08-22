export async function handleEcommerceSafetyGuard(args: any) {
  const current = Number(args?.currentPrice || 0);
  const proposed = Number(args?.proposedPrice || 0);
  const maxDrop = Number(args?.maxPriceDropPercent || 50);

  const dropPercent = ((current - proposed) / current) * 100;
  const isSafe = dropPercent <= maxDrop;

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify({
          isSafe,
          dropPercent: Number(dropPercent.toFixed(2)),
          warning: isSafe
            ? null
            : `เตือน: ราคาสินค้าลดลง ${dropPercent.toFixed(1)}% ซึ่งเกินขีดจำกัดความปลอดภัย (${maxDrop}%)`,
        }),
      },
    ],
  };
}
