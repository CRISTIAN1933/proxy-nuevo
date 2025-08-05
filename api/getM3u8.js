import chromium from "chrome-aws-lambda";

export default async function handler(req, res) {
  let browser = null;
  try {
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();

    let m3u8Url = null;

    // Interceptar requests para capturar URL .m3u8
    page.on("request", (request) => {
      const url = request.url();
      if (!m3u8Url && url.endsWith(".m3u8")) {
        m3u8Url = url;
      }
    });

    await page.goto("https://librefutboltv.su/tyc-sports/", {
      waitUntil: "networkidle2",
    });

    // Esperar unos segundos para que cargue el reproductor y peticiones
    await page.waitForTimeout(10000);

    await browser.close();

    if (m3u8Url) {
      res.status(200).json({ url: m3u8Url });
    } else {
      res.status(404).json({ error: "No se encontró URL .m3u8" });
    }
  } catch (error) {
    if (browser) await browser.close();
    res.status(500).json({ error: error.message });
  }
}
