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
      const followersOfMe = await client.v2.followers(meId);
      const followersArray = followersOfMe.data?.map((follower) => {
        return follower.id;
      });

      const expintRequest = await client.v2.search("#expint", {
        expansions: ["author_id"],
      });

      const latestExpintTweets = await expintRequest.fetchLast(1000);
      
      console.log("followersArray", followersArray);

      Array.from(latestExpintTweets.data.data).forEach(async (tweet) => {
        console.log("Expint Tweet: ", tweet);
        if (!followersArray.includes(tweet.author_id)) {
          console.log("Potential follower: ", tweet.author_id);
          await client.v2.follow(meId, tweet.author_id);
        }
      });
    } else {
      console.log("No new episode, no new followers.");
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
