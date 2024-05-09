const puppeteer = require("puppeteer");

const main = async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  const page = await browser.newPage();

  const keywords = "Ayam Geprek Karawang";

  await page.goto(`https://www.google.com/maps/search/${keywords}`, {
    waitUntil: "networkidle0",
  });

  let refetch = true;

  while (refetch) {
    await page.evaluate(() => {
      return new Promise((res) => {
        setTimeout(() => {
          const selector = document.querySelector("div[role='feed']");

          selector.scrollTop = selector.scrollHeight;

          res();
        }, 750);
      });
    });
    await page.waitForNetworkIdle();
    const empty = await page.evaluate(() => {
      const emptyContainer = document.querySelector(".HlvSq");

      return Boolean(emptyContainer);
    });

    if (empty) {
      refetch = false;
    }
  }

  const results = await page.evaluate(async () => {
    const items = [];

    const elements = document.querySelectorAll(".Nv2PK");

    elements.forEach((elem) => {
      const ratingContainer = elem.querySelector("span[role='img']");
      const ratingChildren = ratingContainer?.children ?? [];

      if (ratingChildren.length) {
        const title = elem.querySelector("div.fontHeadlineSmall")?.innerHTML;
        const rating = ratingChildren[0].innerHTML;
        const review = ratingChildren[ratingChildren.length - 1].innerHTML;
        const addressContainer = elem.querySelector("div.W4Efsd:nth-child(1)");
        const address = addressContainer.querySelector(
          "span:nth-child(2) > span:nth-child(2)"
        )?.innerHTML;
        const link = elem.querySelector("a.hfpxzc").getAttribute("href");

        items.push({
          title,
          rating,
          review,
          address,
          link,
        });
      }
    });

    return items;
  });

  await browser.close();
};

main();
