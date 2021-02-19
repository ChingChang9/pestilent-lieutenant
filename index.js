const https = require("https");
const { discordWebhook, redditAuth } = require("./config.json");

function getLastSaved(token) {
	return new Promise((resolve, reject) => {
		const client = https.request(`https://oauth.reddit.com/user/${ redditAuth.username }/saved?limit=1`, {
			method: "GET",
			headers: {
				"User-Agent": "Pestilent Lieutenant",
				Authorization: `bearer ${ token }`
			}
		}, response => {
			let chunks = [];
			response.on("data", chunk => chunks.push(chunk));
			response.on("end", () => {
				const data = JSON.parse(Buffer.concat(chunks).toString());
				resolve(data.data.children[0].data);
			});
			response.on("error", error => reject(`Error: ${ error.message }`));
		});
		client.end();
	});
}

function getAccessToken() {
	return new Promise((resolve, reject) => {
		const client = https.request(`https://www.reddit.com/api/v1/access_token`, {
			method: "POST",
			headers: {
				"User-Agent": "Pestilent Lieutenant",
				Authorization: `Basic ${ Buffer.from(`${ redditAuth.clientId }:${ redditAuth.clientSecret }`).toString("base64") }`
			}
		}, response => {
			let chunks = [];
			response.on("data", chunk => chunks.push(chunk));
			response.on("end", () => {
				const data = JSON.parse(Buffer.concat(chunks).toString());
				resolve(data.access_token);
			});
			response.on("error", error => reject(`Error: ${ error.message }`));
		});
		client.write(`grant_type=password&username=${ redditAuth.username }&password=${ redditAuth.password }`);
		client.end();
	});
}


(async () => {
	const token = await getAccessToken();
	const lastSaved = await getLastSaved(token);
	let lastUrl = lastSaved.url;

	setInterval(async () => {
		const newSaved = await getLastSaved(token);
		if (lastUrl !== newSaved.url) {
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

			lastUrl = newSaved.url;
		}
	}, 30 * 1000);
})();