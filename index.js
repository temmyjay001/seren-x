const mongoose = require("mongoose");
const { App, ExpressReceiver } = require("@slack/bolt");

mongoose.connect(process.env.MONGO_URL, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

const receiver = new ExpressReceiver({
	signingSecret: process.env.SLACK_SIGNING_SECRET,
});

const app = new App({
	token: process.env.SLACK_BOT_TOKEN,
	receiver,
});

receiver.app.use(require("./app/routes"));

(async () => {
	// Start your app
	await app.start(process.env.PORT || 3000);

	console.log("⚡️ Bolt app is running!");
})();
