const mongoose = require("mongoose");
const { App, ExpressReceiver } = require("@slack/bolt");
const user = require("./app/service/user/user");
const response = require("./app/service/response/response");

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

app.command("/bot", async ({ ack, body, client }) => {
	await ack();
	const { user_name, user_id, trigger_id } = body;

	await user.create({ user_name, user_id });

	try {
		// Call views.open with the built-in client
		const result = await client.views.open({
			// Pass a valid trigger_id within 3 seconds of receiving it
			trigger_id,
			// View payload
			view: {
				type: "modal",
				// View identifier
				callback_id: "q1",
				title: {
					type: "plain_text",
					text: "Bot",
				},
				blocks: [
					{
						block_id: "block_1",
						type: "input",
						element: {
							action_id: "blk_q",
							type: "static_select",
							placeholder: {
								type: "plain_text",
								text: "Select a doing :grin:",
								emoji: true,
							},
							options: [
								{
									text: {
										type: "plain_text",
										emoji: true,
										text: "Doing well",
									},
									value: "doing well",
								},
								{
									text: {
										type: "plain_text",
										emoji: true,
										text: "Neutral",
									},
									value: "neutral",
								},
								{
									text: {
										type: "plain_text",
										emoji: true,
										text: "Feeling lucky",
									},
									value: "feeling lucky",
								},
							],
						},
						label: {
							type: "plain_text",
							text: "Welcome, How are you doing?",
							emoji: true,
						},
					},
				],
				submit: {
					type: "plain_text",
					text: "Submit",
				},
			},
		});
	} catch (error) {
		console.error(error);
	}
});

app.view("q1", async ({ ack, body, client, view }) => {
	// Acknowledge the button request
	await ack();
	const question = view.blocks[0]["label"]["text"];
	const answer = view.state.values["block_1"]["blk_q"].selected_option.value;
	const user_id = body.user.id;

	await response.create({ question, answer, user_id });

	try {
		// Call views.update with the built-in client
		const result = await client.views.open({
			// Pass the view_id
			trigger_id: body.trigger_id,
			// view_id: body.view.id,
			// Pass the current hash to avoid race conditions
			// hash: body.view.hash,
			// View payload with updated blocks
			view: {
				type: "modal",
				callback_id: "q2",
				title: {
					type: "plain_text",
					text: "My App",
					emoji: true,
				},
				submit: {
					type: "plain_text",
					text: "Submit",
					emoji: true,
				},
				close: {
					type: "plain_text",
					text: "Cancel",
					emoji: true,
				},
				blocks: [
					{
						type: "section",
						text: {
							type: "mrkdwn",
							text: `When are you free this week for a walk?\n:thinking_face:\n\n_select two time slot_`,
						},
					},
					{
						type: "input",
						element: {
							type: "static_select",
							placeholder: {
								type: "plain_text",
								text: "Select time slot",
								emoji: true,
							},
							options: TIME,
							action_id: "t1-action",
						},
						label: {
							type: "plain_text",
							text: "Select first time slot",
							emoji: true,
						},
						block_id: "blk_q2_t1",
					},
					{
						type: "input",
						element: {
							type: "static_select",
							placeholder: {
								type: "plain_text",
								text: "Select time slot",
								emoji: true,
							},
							options: TIME,
							action_id: "t2-action",
						},
						label: {
							type: "plain_text",
							text: "Select second time slot",
							emoji: true,
						},
						block_id: "blk_q2_t2",
					},
					{
						type: "input",
						element: {
							type: "multi_static_select",
							placeholder: {
								type: "plain_text",
								text: "Pick Days between Monday - Sunday",
								emoji: true,
							},
							action_id: "days-action",
							options: DAYS_OF_THE_WEEK,
						},
						label: {
							type: "plain_text",
							text: "Select two days",
							emoji: true,
						},
						block_id: "blk_q2_days",
					},
				],
			},
		});
		// console.log("Second View", result);
	} catch (error) {
		console.error(error);
	}
});

app.view("q2", async ({ ack, body, view, client }) => {
	// Acknowledge the view_submission event
	await ack();

	const question = view.blocks[0]["text"]["text"];
	const answer1 =
		view.state.values["blk_q2_t1"]["t1-action"].selected_option.value;
	const answer2 =
		view.state.values["blk_q2_t2"]["t2-action"].selected_option.value;
	let answer3 =
		view.state.values["blk_q2_days"]["days-action"].selected_options;

	answer3 = answer3.reduce((answer, object) => {
		return answer + ", " + object.value;
	});

	const answer = `Time one: ${answer1}, Time two: ${answer2}, Days: [${answer3}]`;

	const user_id = body.user.id;

	await response.create({ question, answer, user_id });

	// Message the user
	try {
		const result = await client.views.open({
			// Pass the view_id
			trigger_id: body.trigger_id,
			view: {
				type: "modal",
				callback_id: "q3",
				title: {
					type: "plain_text",
					text: "My App",
					emoji: true,
				},
				submit: {
					type: "plain_text",
					text: "Submit",
					emoji: true,
				},
				close: {
					type: "plain_text",
					text: "Cancel",
					emoji: true,
				},
				blocks: [
					{
						type: "section",
						text: {
							type: "mrkdwn",
							text: "*What are your favorite hobbies?* :thinking_face:",
						},
					},
					{
						type: "input",
						element: {
							type: "multi_static_select",
							placeholder: {
								type: "plain_text",
								text: "Select an item",
								emoji: true,
							},
							options: [
								{
									text: {
										type: "plain_text",
										text: "Football",
										emoji: true,
									},
									value: "football",
								},
								{
									text: {
										type: "plain_text",
										text: "Music",
										emoji: true,
									},
									value: "music",
								},
								{
									text: {
										type: "plain_text",
										text: "Sleep",
										emoji: true,
									},
									value: "sleep",
								},
								{
									text: {
										type: "plain_text",
										text: "Movies",
										emoji: true,
									},
									value: "movies",
								},
								{
									text: {
										type: "plain_text",
										text: "Basketball",
										emoji: true,
									},
									value: "basketball",
								},
							],
							action_id: "blk_q3_action",
						},
						label: {
							type: "plain_text",
							text: "Pick your favourite hobbies from the dropdown",
							emoji: true,
						},
						block_id: "blk_q3",
					},
				],
			},
		});
	} catch (error) {
		console.error(error);
	}
});

app.view("q3", async ({ ack, body, view, client }) => {
	// Acknowledge the view_submission event
	await ack();
	// console.log(view);

	const question = view.blocks[0]["text"]["text"];

	let answer_parse =
		view.state.values["blk_q3"]["blk_q3_action"].selected_options;

	answer_parse = answer_parse.reduce((answer, object) => {
		return answer + ", " + object.value;
	});

	const answer = `hobbies: [${answer_parse}]`;

	const user_id = body.user.id;

	await response.create({ question, answer, user_id });
	// Message the user
	try {
		// console.log("View Trigger", body.trigger_id);
		const result = await client.views.open({
			// Pass the view_id
			trigger_id: body.trigger_id,
			// View payload with updated blocks
			view: {
				type: "modal",
				callback_id: "done",
				title: {
					type: "plain_text",
					text: "My App",
					emoji: true,
				},
				submit: {
					type: "plain_text",
					text: "Submit",
					emoji: true,
				},
				close: {
					type: "plain_text",
					text: "Cancel",
					emoji: true,
				},
				blocks: [
					{
						type: "section",
						text: {
							type: "mrkdwn",
							text: "*What are the first 3 digits on the number scale?* :thinking_face:",
						},
					},
					{
						type: "input",
						element: {
							type: "plain_text_input",
							multiline: true,
							action_id: "blk_q4_action",
						},
						label: {
							type: "plain_text",
							text: "Your answer",
							emoji: true,
						},
						block_id: "blk_q4",
					},
				],
			},
		});
		// console.log(result);
	} catch (error) {
		console.error(error);
	}
});

app.view("done", async ({ ack, body, view, client }) => {
	// Acknowledge the view_submission event
	await ack();

	const question = view.blocks[0]["text"]["text"];
	let answer = view.state.values["blk_q4"]["blk_q4_action"].value;

	const user_id = body.user.id;

	await response.create({ question, answer, user_id });

	// Message the user
	try {
		console.log("View Trigger", body.trigger_id);
		const result = await client.views.open({
			// Pass the view_id
			trigger_id: body.trigger_id,
			// View payload with updated blocks
			view: {
				type: "modal",
				// callback_id: "done",
				title: {
					type: "plain_text",
					text: "My App",
					emoji: true,
				},
				close: {
					type: "plain_text",
					text: "Close",
					emoji: true,
				},
				blocks: [
					{
						type: "section",
						text: {
							type: "mrkdwn",
							text: "*Thank you* :blush:",
						},
					},
				],
			},
		});
		await client.chat.postMessage({
			channel: user,
			text: "Thank you for your time",
		});
		// console.log(result);
	} catch (error) {
		console.error(error);
	}
});

const TIME = [
	{
		text: {
			type: "plain_text",
			emoji: true,
			text: "12:00 - 12:30",
		},
		value: "12:00 - 12:30",
	},
	{
		text: {
			type: "plain_text",
			emoji: true,
			text: "12:30 - 13:00",
		},
		value: "12:30 - 13:00",
	},
	{
		text: {
			type: "plain_text",
			emoji: true,
			text: "13:00 - 13:30",
		},
		value: "13:00 - 13:30",
	},
	{
		text: {
			type: "plain_text",
			emoji: true,
			text: "13:30 - 14:00",
		},
		value: "13:40 - 14:00",
	},
	{
		text: {
			type: "plain_text",
			emoji: true,
			text: "14:00 - 14:30",
		},
		value: "14:00 - 14:30",
	},
	{
		text: {
			type: "plain_text",
			emoji: true,
			text: "14:30 - 15:00",
		},
		value: "14:30 - 15:00",
	},
	{
		text: {
			type: "plain_text",
			emoji: true,
			text: "15:00 - 15:30",
		},
		value: "15:00 - 15:30",
	},
	{
		text: {
			type: "plain_text",
			emoji: true,
			text: "15:30 - 16:00",
		},
		value: "15:30 - 16:00",
	},
	{
		text: {
			type: "plain_text",
			emoji: true,
			text: "16:00 - 16:30",
		},
		value: "16:00 - 16:30",
	},
	{
		text: {
			type: "plain_text",
			emoji: true,
			text: "16:30 - 17:00",
		},
		value: "16:30 - 17:00",
	},
	{
		text: {
			type: "plain_text",
			emoji: true,
			text: "17:00 - 17:30",
		},
		value: "17:00 - 17:30",
	},
	{
		text: {
			type: "plain_text",
			emoji: true,
			text: "17:30 - 18:00",
		},
		value: "17:30 - 18:30",
	},
];

const DAYS_OF_THE_WEEK = [
	{
		text: {
			type: "plain_text",
			emoji: true,
			text: "Monday",
		},
		value: "monday",
	},
	{
		text: {
			type: "plain_text",
			emoji: true,
			text: "Tuesday",
		},
		value: "tuesday",
	},
	{
		text: {
			type: "plain_text",
			emoji: true,
			text: "Wednesday",
		},
		value: "wednesday",
	},
	{
		text: {
			type: "plain_text",
			emoji: true,
			text: "Thursday",
		},
		value: "thursday",
	},
	{
		text: {
			type: "plain_text",
			emoji: true,
			text: "Friday",
		},
		value: "friday",
	},
	{
		text: {
			type: "plain_text",
			emoji: true,
			text: "Saturday",
		},
		value: "saturday",
	},
	{
		text: {
			type: "plain_text",
			emoji: true,
			text: "Sunday",
		},
		value: "sunday",
	},
];

module.exports = receiver;