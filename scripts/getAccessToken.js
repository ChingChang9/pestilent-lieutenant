const request = require("./request.js");
const { redditAuth } = require("../config.json");

module.exports = async () => {
	const data = await request("https://www.reddit.com/api/v1/access_token", {
		method: "POST",
		headers: {
			"User-Agent": `node:pestilent-lieutenant${ process.pid }:1.2.3 (by /u/${ redditAuth.username })`,
			Authorization: `Basic ${ Buffer.from(`${ redditAuth.clientId }:${ redditAuth.clientSecret }`).toString("base64") }`
		},
		body: `grant_type=password&username=${ redditAuth.username }&password=${ redditAuth.password }`
	});
	return data.access_token;
};
