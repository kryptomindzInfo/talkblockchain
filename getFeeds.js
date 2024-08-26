let Parser = require("rss-parser");
module.exports = async function () {
  let parser = new Parser();
  console.log("Getting feeds");
  // Cointelegraph RSS feed -https://cointelegraph.com/rss-feeds)
  let feed = await parser.parseURL(
    "https://cointelegraph.com/rss/tag/blockchain"
  );
  console.log(feed.title);
  console.log(feed.items[0]);
  feed.items.forEach((item) => {
    console.log(item.title + ":" + item.link);
  });
};
