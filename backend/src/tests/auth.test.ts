import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import app from "../app";

let mongo: MongoMemoryServer;

beforeAll(async () =>{
    mongo = await MongoMemoryServer.create();
    const url = mongo.getUri();
    await mongoose.connect(url);
});

afterAll(async() =>{
    await mongoose.connection.close();
    await mongo.stop();
});

const TestName = {
    name: "TEST",
    kuEmail : "test@ku.ac.th",
    password: "password123"
};

describe("Auth api", ()=>{
    it("Should signup a new user", async()=>{
        const res = await request(app).post("/api/auth/signup").send(TestName);

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty("message", "User created successfully")
    });

    it("Should able to login with correct password",async()=>{
        const res = await request(app).post("/api/auth/login").send({kuEmail: TestName.kuEmail, password : TestName.password});

        expect(res.body).toHaveProperty("token");
    });

    it("Should not able to login because invalid password", async ()=>{
        const res = await request(app).post("/api/auth/login").send({kuEmail: TestName.kuEmail, password :"wrongpassword"});

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty("error", "Invalid credentials")
    });

    it("Should not able to login because invalid user", async()=> {
        const res = await request(app).post("/api/auth/login").send({kuEmail: "yy@ku.ac.th", password : TestName.password});
    
        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty("error", "User not found")
    });



})