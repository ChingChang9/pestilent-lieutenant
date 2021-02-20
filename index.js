const request = require("./request.js");
const { discordWebhook, redditAuth } = require("./config.json");

(async () => {
	const token = await getAccessToken();
	let lastSaved = await getLastSaved(token);
	let lastUrl = lastSaved.url;
	lastSaved = null;

	setInterval(async () => {
		const newSaved = await getLastSaved(token);
		if (lastUrl !== newSaved.url) {
			request(`https://discord.com/api/webhooks/${ discordWebhook.id }/${ discordWebhook.token }`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: {
					embeds: [{
						color: 16711422,
						author: {
							name: newSaved.title.slice(0, 256),
							url: `https://www.reddit.com${ newSaved.permalink }`
						},
						image: { url: newSaved.url }
					}]
				}
			});
			lastUrl = newSaved.url;
		}
	}, 30 * 1000);
})();

async function getAccessToken() {
	const data = await request("https://www.reddit.com/api/v1/access_token", {
		method: "POST",
		headers: {
			"User-Agent": `node:pestilent-lieutenant${ process.pid }:1.2.2 (by /u/${ redditAuth.username })`,
			Authorization: `Basic ${ Buffer.from(`${ redditAuth.clientId }:${ redditAuth.clientSecret }`).toString("base64") }`
		},
		body: `grant_type=password&username=${ redditAuth.username }&password=${ redditAuth.password }&duration=permanent`
	});
	return data.access_token;
}
async function getLastSaved(token) {
	const data = await request(`https://oauth.reddit.com/user/${ redditAuth.username }/saved?limit=1`, {
		headers: {
			"User-Agent": `node:pestilent-lieutenant${ process.pid }:1.2.2 (by /u/${ redditAuth.username })`,
			Authorization: `bearer ${ token }`
		}
	});
	return data.data.children[0].data;
}