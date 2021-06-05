process.env.NODE_ENV = "test";
require("dotenv").config();
const request = require("supertest");
const receiver = require("../index");
const app = receiver.app;

// beforeAll(async () => {
// 	await db.query("CREATE TABLE students (id SERIAL PRIMARY KEY, name TEXT)");
// });

// beforeEach(async () => {
// 	// seed with some data
// });

// afterEach(async () => {
// });

// afterAll(async () => {
// });

describe("GET / ", () => {
	test("It should respond with empty object", async () => {
		const response = await request(app).get("/");
		expect(response.body).toEqual({});
		expect(response.statusCode).toBe(200);
	});
});

describe("GET /users", () => {
	test("It should respond with an array of users", async () => {
		const response = await request(app).get("/users");
		console.log(response.body);
		expect(response.body[0]).toHaveProperty("responses");
		expect(response.body[0]).toHaveProperty("user_id");
		expect(response.statusCode).toBe(200);
	});
});

describe("GET /users/user_id/responses", () => {
	test("It should respond with a single user and its response", async () => {
		const response = await request(app).get("/users/U023E1DGD6Z/responses");
		console.log(response.body);
		expect(response.body[0]).toHaveProperty("user");
		expect(response.body[0]).toHaveProperty("question");
        expect(response.body[0]).toHaveProperty("answer");
		expect(response.statusCode).toBe(200);
	});
});

describe("Test 404", () => {
	test("It should respond with a 404 status", async () => {
		const response = await request(app).get("/users/U023E1DGDZ/responses");
		console.log(response.body);
		expect(response.body).toHaveProperty("message");
		expect(response.statusCode).toBe(404);
	});
});