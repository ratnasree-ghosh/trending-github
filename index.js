const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://github.com/trending');

  // get the HTML content of the page
  const html = await page.content();

  // close the browser since we no longer need it
  await browser.close();
  //  browser = await puppeteer.launch({
  //   headless: true,
  //   timeout: 0 // set timeout to 0 to disable it
  // });

  // use cheerio to parse the HTML content
  const $ = cheerio.load(html);

  // extract information for the trending repositories
  const trendingRepos = $('article.Box-row');

  const trendingRepositories = trendingRepos
    .map((_, repo) => {
      const title = $(repo).find('h1 a').text().trim();
      const url = $(repo).find('h1 a').attr('href');
      const description = $(repo).find('p.color-text-secondary').text().trim();
      const language = $(repo).find('[itemprop="programmingLanguage"]').text().trim();
      const stars = $(repo).find('[aria-label="star"]').parent().text().trim().replace(',', '');
      const forks = $(repo).find('[aria-label="fork"]').parent().text().trim().replace(',', '');
      return { title, url, description, language, stars, forks };
    })
    .get();

  // navigate to the developers section and filter by language
  await page.goto('https://github.com/trending/developers/javascript');
  const devHtml = await page.content();
  const $dev = cheerio.load(devHtml);

  // extract information for the trending developers
  const devList = $dev('.explore-content .explore-content-item');

  const trendingDevelopers = devList
    .map((_, dev) => {
      const name = $(dev).find('.f3 a').text().trim();
      const username = $(dev).find('.link-gray').text().trim();
      const repoName = $(dev).find('.h4 a').text().trim();
      const repoDescription = $(dev).find('.explore-content-item-description').text().trim();
      return { name, username, repo: { name: repoName, description: repoDescription } };
    })
    // .get();

  // create the JSON object and log it to the console
  const json = { trending_repositories: trendingRepositories, javascript_developers: trendingDevelopers };
  console.log(JSON.stringify(json, null, 2));

})();