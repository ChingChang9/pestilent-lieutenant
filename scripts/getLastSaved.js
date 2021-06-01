const request = require("./request.js");
const { redditAuth } = require("../config.json");

module.exports = async token => {
	const data = await request(`https://oauth.reddit.com/user/${ redditAuth.username }/saved?limit=1`, {
		headers: {
			"User-Agent": `node:pestilent-lieutenant${ process.pid }:1.2.3 (by /u/${ redditAuth.username })`,
			Authorization: `bearer ${ token }`
		}
	}).catch(error => { throw error; });
	return data?.data.children[0].data;
};
