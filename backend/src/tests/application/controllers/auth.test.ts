import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import app from "../../../app";

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
    "name": "dgsydgsyd", 
    "kuEmail": "test@ku.ac.th", 
    "password": "1234", 
    "confirm_password": "1234",
    "faculty": "en", 
    "contact": "0871111111"
}

const TestName2 = {
    "name": "dgsydgsyd", 
    "kuEmail": "gg@ku.ac.th", 
    "password": "1234", 
    "confirm_password": "1234",
    "faculty": "en", 
    "contact": "0871111111"
}

describe("Auth api", ()=>{
    
    describe("POST /api/auth/signup", () => {
        it ("Should not able to signup because password and confirm password do not match", async()=>{
            const res = await request(app).post("/api/auth/signup").send({...TestName, confirm_password: "wrongconfirm"});

            expect(res.statusCode).toBe(406);
            expect(res.body).toHaveProperty("error", "Passwords must match")
        });

        it("Should signup a new user", async()=>{
            const res = await request(app).post("/api/auth/signup").send(TestName);

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty("message", "User created successfully")
        });

        it("Should not able to signup because existed email", async() =>{
            const res = await request(app).post("/api/auth/signup").send(TestName);;

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty("message", "Email is already registered")
        });

        it("Should not able to signup because existed phone number", async() =>{
            const res = await request(app).post("/api/auth/signup").send(TestName2);;

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty("message", "Phone number is already existed")
        });
    })

    describe("POST /api/auth/login", () => {

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
            expect(res.body).toHaveProperty("error", "Email is not found")
        });
    })



})