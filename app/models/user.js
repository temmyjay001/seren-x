const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema(
	{
		user_name: {
			type: String,
			required: true,
		},
		user_id: {
			type: String,
		},
		responses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Response" }],
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model("User", UserSchema);
