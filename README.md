# ExpinT ([Expeditionen ins Tierreich](https://www.ndr.de/fernsehen/sendungen/expeditionen_ins_tierreich/index.html)) Twitter Bot

What you see in this repo is a twitter bot, written in JS and hosted on Netlify (with scheduled functions, it's nice, check it out!).

## What does it do?

1. Every Wednesday at 9am it fetches the current episode from:
   https://www.ndr.de/fernsehen/programm/epg104_display-all_date-[YEAR]-[MONTH]-[DAY].html
2. If there's an episode available that day, it tweets this with a link to it, if not it tweets a sad info about it.
3. At 12pm, 3pm and 6pm it retweets the last tweet (only if it's really an ExpinT day).
4. At 11:30pm it searches for the most recent tweets with #expint, compares the posting users with the current followers list and automatically follows new users (also only if it's really an ExpinT day).

** Note: Why don't I care about the rate limiting in my code? **
Just because the community is currently small and therefore it's highly unlikely to hit the limits.
