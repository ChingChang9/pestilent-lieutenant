let Snoowrap = require("snoowrap");
const https = require("https");
const { discordWebhook } = require("./config.json");
let { redditAuth } = require("./config.json");

const user = new Snoowrap(redditAuth).getMe();
redditAuth = null;
Snoowrap = null;
delete require.cache[require.resolve("snoowrap")];

let lastUrl;

setInterval(async () => {
	const newSaved = await user.getSavedContent({limit: 1})[0];
	if (lastUrl && lastUrl !== newSaved.url) {
    const client = https.request(`https://discord.com/api/webhooks/${ discordWebhook.id }/${ discordWebhook.token }`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    });

    client.write(JSON.stringify({
      embeds: [{
        color: 16711422,
        author: {
          name: newSaved.title.slice(0, 256),
          url: `https://www.reddit.com${ newSaved.permalink }`
        },
        image: {
          url: newSaved.url
        }
      }]
    }));
    client.end();
    client.on("error", error => reject(error));
	}
	lastUrl = newSaved.url;
}, 30 * 1000);