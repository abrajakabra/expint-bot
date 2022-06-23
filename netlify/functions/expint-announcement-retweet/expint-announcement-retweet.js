const { schedule } = require("@netlify/functions");
const { TwitterApi } = require("twitter-api-v2");

module.exports.handler = async (event) => {
  const client = new TwitterApi({
    appKey: process.env.TWITTER_APP_KEY,
    appSecret: process.env.TWITTER_APP_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_SECRET,
  });

  try {
    const meUser = await client.v2.me();
    const meId = meUser.data.id;

    const tweetsOfMe = await client.v2.userTimeline(meId, {
      exclude: "replies",
    });
    const lastTweet = tweetsOfMe.data.data[0];

    if (lastTweet.text.indexOf("Mittwoch ist #ExpinT-Tag!") > -1) {
      await client.v2.unretweet(meId, lastTweet.id);
      await client.v2.retweet(meId, lastTweet.id);
    } else {
      console.log("No new episode, no retweet.");
      return {
        statusCode: 200,
      };
    }
  } catch (error) {
    console.error(error);

    return {
      statusCode: 500,
    };
  }

  return {
    statusCode: 200,
  };
};
