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
      const followingsOfMe = await client.v2.following(meId, {
        asPaginator: true,
      });

      while (!followingsOfMe.done) {
        await followingsOfMe.fetchNext();
      }

      const followingsArray = [];

      for (const following of followingsOfMe) {
        followingsArray.push(following.id);
      }

      const expintRequest = await client.v2.search("#expint", {
        expansions: ["author_id"],
      });

      const latestExpintTweets = await expintRequest.fetchLast(1000);
      const latestExpintTweetsUsers = latestExpintTweets.data.data.map(
        (tweet) => {
          return tweet.author_id;
        }
      );

      let latestExpintTweetsUsersUnique = [...new Set(latestExpintTweetsUsers)];

      for (
        let index = 0;
        index < latestExpintTweetsUsersUnique.length;
        index++
      ) {
        const tweetUserId = latestExpintTweetsUsersUnique[index];

        if (!followingsArray.includes(tweetUserId) && tweetUserId !== meId) {
          await client.v2.follow(meId, tweetUserId);
        }
      }
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
