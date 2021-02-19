const https = require("https");

module.exports = (url, { method = "GET", headers = {}, body = {} } = {}) => {
	body = typeof body === "string" ? body : JSON.stringify(body);
	return new Promise((resolve, reject) => {
		const client = https.request(url, { method, headers }, response => {
			let chunks = [];
			response.on("data", chunk => chunks.push(chunk));
			response.on("end", () => {
				if (chunks.length) resolve(JSON.parse(Buffer.concat(chunks).toString()));
			});
			response.on("error", error => reject(`Error: ${ error.message }`));
		});
		if (method === "POST") client.write(body);
		client.end();
		client.on("error", error => reject(error));
	});
}