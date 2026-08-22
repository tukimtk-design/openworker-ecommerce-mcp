import { Page } from 'playwright';

export async function setupSellerMocks(page: Page) {
    await page.route('**/api/v1/shopee/update_price', async (route) => {
        const postData = route.request().postDataJSON();
        if (postData?.simulateError === '500') {
             await route.fulfill({ status: 500, body: JSON.stringify({ error: 'Internal Server Error' }) });
        } else if (postData?.simulateError === '429') {
             await route.fulfill({ status: 429, body: JSON.stringify({ error: 'Too Many Requests' }) });
        } else {
             await route.fulfill({ status: 200, body: JSON.stringify({ success: true, message: "Mocked Update Success" }) });
        }
    });

    // We can add more mocks for TikTok and Lazada here
}
