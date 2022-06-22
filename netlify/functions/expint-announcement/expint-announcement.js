const { schedule } = require("@netlify/functions");
const axios = require("axios");
const cheerio = require("cheerio");
const { TwitterApi } = require("twitter-api-v2");

module.exports.handler = schedule("30 8 * * 3", async (event) => {
  const currentDate = new Date();
  const programUrl = `https://www.ndr.de/fernsehen/programm/epg104_display-all_date-${currentDate
    .toISOString()
    .slice(0, 10)}.html`;

  const client = new TwitterApi({
    appKey: process.env.TWITTER_APP_KEY,
    appSecret: process.env.TWITTER_APP_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_SECRET,
  });

  try {
    const request = await axios.get(programUrl);

    const body = await request.data;

    const $ = cheerio.load(body);

    const programList = $("#program_schedule ul li");
    const currentEpisodes = [];

    programList.each(function () {
      const programTitle = $(this).find(".details h3 a").text();

      if (programTitle.indexOf("Expeditionen ins Tierreich") > -1) {
        currentEpisodes.push({
          name: $(this).find(".subtitle").text(),
          url: `https://www.ndr.de${$(this)
            .find(".details h3 a")
            .attr("href")}`,
        });
      }
    });

    let twitterMessage;

    if (currentEpisodes.length > 0) {
      twitterMessage = `Mittwoch ist #ExpinT-Tag!\n\r${currentEpisodes[0].name} ${currentEpisodes[0].url}`;
    } else {
      twitterMessage = `Diesen Mittwoch gibt es leider keine neue #ExpinT-Folge :(`;
    }

    await client.v2.tweet(twitterMessage, {
      text: twitterMessage,
    });
  } catch (error) {
    console.error(error);

    return {
      statusCode: 500,
    };
  }

  return {
    statusCode: 200,
  };
});
