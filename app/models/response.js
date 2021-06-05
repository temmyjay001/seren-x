const mongoose = require("mongoose");
const ResponseSchema = new mongoose.Schema(
	{
		question: {
			type: String,
			required: "{PATH} is required!",
		},
		answer: {
			type: String,
		},
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model("Response", ResponseSchema);
