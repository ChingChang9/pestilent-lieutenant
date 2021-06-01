const request = require("./request.js");
const { discordWebhook } = require("../config.json");

module.exports = redditPost => {
	request(`https://discord.com/api/webhooks/${ discordWebhook.id }/${ discordWebhook.token }`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: {
			embeds: [{
				color: 16711422,
				author: {
					name: redditPost.title.slice(0, 256),
					url: `https://www.reddit.com${ redditPost.permalink }`
				},
				image: { url: redditPost.url }
			}]
		}
	});
};
