const getAccessToken = require("./getAccessToken.js");
const getLastSaved = require("./getLastSaved.js");
const sendToDiscord = require("./sendToDiscord.js");

module.exports = virtueToPitch;

async function virtueToPitch(token, lastUrl, idleCount) {
	const newSaved = await getLastSaved(token).catch(async () => {
		token = await getAccessToken();
		return await getLastSaved(token);
	});
	if (lastUrl && lastUrl !== newSaved.url) {
		sendToDiscord(newSaved);
		idleCount = 0;
	} else if (idleCount < 5) {
		idleCount += 1;
	}

	setTimeout(() => {
		virtueToPitch(token, newSaved.url, idleCount);
	}, idleCount === 5 ? 30000 : 6000);
}
