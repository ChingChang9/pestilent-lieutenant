const request = require("./request.js");
const { discordWebhook, redditAuth } = require("./config.json");

(async () => {
	const token = await getAccessToken();
	const lastSaved = await getLastSaved(token);

	sendLastSavedToDiscord(token, lastSaved.url, 5);
})();

async function sendLastSavedToDiscord(token, lastUrl, idleCount) {
	const newSaved = await getLastSaved(token).catch(async () => {
		token = await getAccessToken();
		return await getLastSaved(token);
	});
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
		idleCount = 0;
	} else if (idleCount < 5) {
		idleCount += 1;
	}

	setTimeout(() => {
		sendLastSavedToDiscord(token, newSaved.url, idleCount);
	}, idleCount === 5 ? 30000 : 4000);
}
async function getAccessToken() {
	const data = await request("https://www.reddit.com/api/v1/access_token", {
		method: "POST",
		headers: {
			"User-Agent": `node:pestilent-lieutenant${ process.pid }:1.2.3 (by /u/${ redditAuth.username })`,
			Authorization: `Basic ${ Buffer.from(`${ redditAuth.clientId }:${ redditAuth.clientSecret }`).toString("base64") }`
		},
		body: `grant_type=password&username=${ redditAuth.username }&password=${ redditAuth.password }`
	});
	return data.access_token;
}
async function getLastSaved(token) {
	const data = await request(`https://oauth.reddit.com/user/${ redditAuth.username }/saved?limit=1`, {
		headers: {
			"User-Agent": `node:pestilent-lieutenant${ process.pid }:1.2.3 (by /u/${ redditAuth.username })`,
			Authorization: `bearer ${ token }`
		}
	}).catch(error => { throw error });
	return data?.data.children[0].data;
}