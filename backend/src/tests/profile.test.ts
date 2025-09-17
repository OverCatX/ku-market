import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";
import app from "../app";

let token : string;
let mongo: MongoMemoryServer;

const TestName = {
    name: "TEST",
    kuEmail : "test@ku.ac.th",
    password: "password123"
};

beforeAll(async () =>{
    mongo = await MongoMemoryServer.create();
    const url = mongo.getUri();
    await mongoose.connect(url);
    

    await request(app).post("/api/auth/signup").send(TestName);
    const login = await request(app).post("/api/auth/login").send({kuEmail: TestName.kuEmail, password: TestName.password});

    token = login.body.token;

});

afterAll(async() =>{
    await mongoose.connection.close();
    await mongo.stop();
});

describe("Profile api", ()=>{
    it("Should not able to login because token is invalid", async () =>{
        const res = await request(app).get("/api/profile/view").set("Authorization", `Bearer abc`);

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty("error", "Invalid token");
    });

    it("Should able to view profile", async()=>{
        const res = await request(app).get("/api/profile/view").set("Authorization", `Bearer ${token}`);

        expect(res.body).toHaveProperty("kuEmail", "test@ku.ac.th");
    });

    it("Should able to update profile", async ()=>{
        const res = await request(app).put("/api/profile/update").set("Authorization", `Bearer ${token}`).send({name: "Jaden"});

        expect(res.body).toHaveProperty("name", "Jaden");
    })


})