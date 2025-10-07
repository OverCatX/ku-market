import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";

jest.mock("../../../lib/cloudinary", () => ({
    uploadToCloudinary: jest.fn(async () => {
        return "https://mock.cloudinary.com/image.jpg";
    }),
    default: {}
}));


import app from "../../../app";
import { uploadToCloudinary } from "../../../lib/cloudinary";

let token : string;
let mongo: MongoMemoryServer;
let createdItemId: string;

const TestName = {
    "name": "dgsydgsyd", 
    "kuEmail": "test@ku.ac.th", 
    "password": "1234", 
    "faculty": "en", 
    "contact": "0871111111"
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


const TestItem = {
    title : "test",
    description: "testetsetst",
    category: "test2",
    price: 123
}

const fakeFile = {
    buffer: Buffer.from("fake image content"),
    originalname: "fake.jpg"
};
  

describe("Items API", () => {
    beforeEach( async () => {
        
        (uploadToCloudinary as jest.Mock).mockClear();
        (uploadToCloudinary as jest.Mock).mockResolvedValue("https://mock.cloudinary.com/image.jpg");

        const createRes = await request(app)
        .post("/api/items/create")
        .set("Authorization", `Bearer ${token}`)
        .set("Content-Type", "multipart/form-data")
        .field("title", TestItem.title)
        .field("description", TestItem.description)
        .field("category", TestItem.category)
        .field("price", TestItem.price.toString())
        .attach("photos", fakeFile.buffer, fakeFile.originalname);

        createdItemId = createRes.body.item._id;

        (uploadToCloudinary as jest.Mock).mockClear();
        (uploadToCloudinary as jest.Mock).mockResolvedValue("https://mock.cloudinary.com/image.jpg");
    });

    describe("POST /api/items/create", () => {
        it("Should return 400 if no files are uploaded", async() =>{
            const res = await request(app)
                .post("/api/items/create")
                .set("Authorization", `Bearer ${token}`)
                .set("Content-Type", "multipart/form-data")
                .field("title", `${TestItem.title}`)
                .field("description", `${TestItem.description}`)
                .field("category", `${TestItem.category}`)
                .field("price", `${TestItem.price}` )
                

            expect(res.statusCode).toBe(400);
            expect(res.body.error).toBe("No image files uploaded")

        });

        it("Should upload image and create an item", async () =>{

            const res = await request(app)
            .post("/api/items/create")
            .set("Authorization", `Bearer ${token}`)
            .set("Content-Type", "multipart/form-data")
            .field("title", `${TestItem.title}`)
            .field("description", `${TestItem.description}`)
            .field("category", `${TestItem.category}`)
            .field("price", `${TestItem.price}` )
            .attach("photos", fakeFile.buffer, fakeFile.originalname);
            
            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.item.title).toBe(TestItem.title);
            expect(Array.isArray(res.body.item.photo)).toBe(true);
            expect(res.body.item.photo).toHaveLength(1);
            expect(res.body.item.photo[0]).toBe(
            "https://mock.cloudinary.com/image.jpg"
            );
            expect(res.body.uploadedPhotos).toBe(1);
            expect(res.body.message).toContain("Item created successfully with 1 photo(s)");
        });

        it("Should upload 2-5 images and create an item ", async ()=>{
            const res = await request(app)
            .post("/api/items/create")
            .set("Authorization", `Bearer ${token}`)
            .set("Content-Type", "multipart/form-data")
            .field("title", `${TestItem.title}`)
            .field("description", `${TestItem.description}`)
            .field("category", `${TestItem.category}`)
            .field("price", `${TestItem.price}` )
            .attach("photos", fakeFile.buffer, fakeFile.originalname)
            .attach("photos", fakeFile.buffer, fakeFile.originalname)
            .attach("photos", fakeFile.buffer, fakeFile.originalname)
            .attach("photos", fakeFile.buffer, fakeFile.originalname);
            
            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.item.title).toBe(TestItem.title);
            expect(Array.isArray(res.body.item.photo)).toBe(true);
            expect(res.body.item.photo).toHaveLength(4);
            expect(res.body.item.photo[0]).toBe(
            "https://mock.cloudinary.com/image.jpg"
            );
            expect(res.body.item.photo[1]).toBe(
                "https://mock.cloudinary.com/image.jpg"
            );
            expect(res.body.item.photo[2]).toBe(
                "https://mock.cloudinary.com/image.jpg"
            );
            expect(res.body.item.photo[3]).toBe(
                "https://mock.cloudinary.com/image.jpg"
            );
            expect(res.body.uploadedPhotos).toBe(4);
            expect(res.body.message).toContain("Item created successfully with 4 photo(s)");
        });

        it("Should not able to upload if upload more than 5", async() =>{
            const res = await request(app)
            .post("/api/items/create")
            .set("Authorization", `Bearer ${token}`)
            .set("Content-Type", "multipart/form-data")
            .field("title", `${TestItem.title}`)
            .field("description", `${TestItem.description}`)
            .field("category", `${TestItem.category}`)
            .field("price", `${TestItem.price}` )
            .attach("photos", fakeFile.buffer, fakeFile.originalname)
            .attach("photos", fakeFile.buffer, fakeFile.originalname)
            .attach("photos", fakeFile.buffer, fakeFile.originalname)
            .attach("photos", fakeFile.buffer, fakeFile.originalname)
            .attach("photos", fakeFile.buffer, fakeFile.originalname)
            .attach("photos", fakeFile.buffer, fakeFile.originalname);
            
            expect(res.statusCode).toBe(400);
            expect(res.body.error).toBe("Too many files uploaded. Maximum 5 photos allowed.");
        });
    
    })

    describe("PATCH /api/items/update/:id", () => {

        it("Should update item with new field values", async () =>{
            const updatedData = {
                title: "Updated Title",
                price: 200
            };

            const res = await request(app)
                .patch(`/api/items/update/${createdItemId}`)
                .set("Authorization", `Bearer ${token}`)
                .set("Content-Type", "multipart/form-data")
                .field("title", `${updatedData.title}`)
                .field("price", `${updatedData.price}`)

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.item.title).toBe(updatedData.title);
            expect(res.body.item.price).toBe(updatedData.price);
            expect(res.body.message).toBe("Item updated successfully");
            

        });

        it("Should update item with only new photos", async ()=>{
            const newFile = {
                buffer: Buffer.from("new image content"),
                originalname: "new.jpg"
            };

            (uploadToCloudinary as jest.Mock).mockResolvedValue("https://mock.cloudinary.com/new-image.jpg");
            const res = await request(app)
            .patch(`/api/items/update/${createdItemId}`)
            .set("Authorization", `Bearer ${token}`)
            .set("Content-Type", "multipart/form-data")
            .attach("photos", newFile.buffer, newFile.originalname);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.item.photo).toHaveLength(1);
            expect(res.body.item.photo[0]).toBe("https://mock.cloudinary.com/new-image.jpg");
            expect(res.body.message).toBe("Item updated successfully");
            expect(uploadToCloudinary).toHaveBeenCalledTimes(1);
        });

        it("Should update item with both fields and photos", async()=>{
            const updatedData = {
                title: "Updated Title",
                price: 200
            };

            const newFile = {
                buffer: Buffer.from("new image content"),
                originalname: "new.jpg"
            };

            (uploadToCloudinary as jest.Mock).mockResolvedValue("https://mock.cloudinary.com/new-image.jpg");

            const res = await request(app)
            .patch(`/api/items/update/${createdItemId}`)
            .set("Authorization", `Bearer ${token}`)
            .set("Content-Type", "multipart/form-data")
            .field("title", `${updatedData.title}`)
            .field("price", `${updatedData.price}`)
            .attach("photos", newFile.buffer, newFile.originalname);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.item.photo).toHaveLength(1);
            expect(res.body.item.photo[0]).toBe("https://mock.cloudinary.com/new-image.jpg");
            expect(res.body.item.title).toBe(updatedData.title);
            expect(res.body.item.price).toBe(updatedData.price);
            expect(res.body.message).toBe("Item updated successfully");
            expect(uploadToCloudinary).toHaveBeenCalledTimes(1);

        });

        it("Should return error for invalid item id", async () =>{
            const updatedData = {
                title: "Updated Title",
                price: 200
            };

            (uploadToCloudinary as jest.Mock).mockResolvedValue("https://mock.cloudinary.com/new-image.jpg");
            const res = await request(app)
            .patch(`/api/items/update/invalid-id`)
            .set("Authorization", `Bearer ${token}`)
            .set("Content-Type", "multipart/form-data")
            .field("title", `${updatedData.title}`)
            .field("price", `${updatedData.price}`)

            expect(res.statusCode).toBe(400);
            expect(res.body.error).toBe("Invalid item ID")
        });

        it("Should return error for item not found", async ()=>{
            const fakeId = new mongoose.Types.ObjectId().toString();
            const updatedData = {
                title: "Updated Title",
                price: 200
            };

            (uploadToCloudinary as jest.Mock).mockResolvedValue("https://mock.cloudinary.com/new-image.jpg");
            const res = await request(app)
            .patch(`/api/items/update/${fakeId}`)
            .set("Authorization", `Bearer ${token}`)
            .set("Content-Type", "multipart/form-data")
            .field("title", `${updatedData.title}`)
            .field("price", `${updatedData.price}`)

            expect(res.statusCode).toBe(404);
            expect(res.body.error).toBe("Item not found");
        });
    
    })

    describe(" DELETE /api/items/update/", ()=>{

        it("Should delete item", async ()=> {
            const res = await request(app)
            .delete(`/api/items/delete/${createdItemId}`)
            .set("Authorization", `Bearer ${token}`)
            .set("Content-Type", "multipart/form-data")

            expect(res.statusCode).toBe(200)
            expect(res.body.success).toBe(true)
            expect(res.body.message).toBe("Item deleted successfully")

        })

        it("Should return error for invalid id ", async ()=> {
            const res = await request(app)
            .delete(`/api/items/delete/invalid id`)
            .set("Authorization", `Bearer ${token}`)
            .set("Content-Type", "multipart/form-data")

            expect(res.statusCode).toBe(400);
            expect(res.body.error).toBe("Invalid item ID")
        })

        it("Should return error for item not found ", async ()=>{
            const fakeId = new mongoose.Types.ObjectId().toString();

            (uploadToCloudinary as jest.Mock).mockResolvedValue("https://mock.cloudinary.com/new-image.jpg");
            const res = await request(app)
            .delete(`/api/items/delete/${fakeId}`)
            .set("Authorization", `Bearer ${token}`)
            .set("Content-Type", "multipart/form-data")

            expect(res.statusCode).toBe(404);
            expect(res.body.error).toBe("Item not found");
        });
    })

    describe("GET /api/items/list", ()=> {
        beforeEach(async () => {
            await mongoose.connection.collection("items").deleteMany({});
            
            const items = [
                { title: "Laptop", description: "Gaming laptop", category: "Electronics", price: 1000, status: "available" },
                { title: "Phone", description: "iPhone 13", category: "Electronics", price: 800, status: "reserved" },
                { title: "Book", description: "Programming book", category: "Books", price: 50, status: "available" },
                { title: "Chair", description: "Office chair", category: "Furniture", price: 150, status: "sold" },
                { title: "Tablet", description: "iPad Air", category: "Electronics", price: 500, status: "available" }
            ];

            for (const item of items) {
                await request(app)
                    .post("/api/items/create")
                    .set("Authorization", `Bearer ${token}`)
                    .field("title", item.title)
                    .field("description", item.description)
                    .field("category", item.category)
                    .field("price", item.price.toString())
                    .field("status", item.status)
                    .attach("photos", fakeFile.buffer, fakeFile.originalname);
            }
        });

        it("Should return all items with default pagination", async () => {
            const res = await request(app).get("/api/items/list");

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.items).toHaveLength(5);
            expect(res.body.data.pagination.currentPage).toBe(1);
            expect(res.body.data.pagination.totalItems).toBe(5);
        });

        it("Should paginate items correctly", async () => {
            const res = await request(app)
                .get("/api/items/list")
                .query({ page: 1, limit: 2 });

            expect(res.statusCode).toBe(200);
            expect(res.body.data.items).toHaveLength(2);
            expect(res.body.data.pagination.currentPage).toBe(1);
            expect(res.body.data.pagination.itemsPerPage).toBe(2);
            expect(res.body.data.pagination.totalPages).toBe(3);
            expect(res.body.data.pagination.hasNextPage).toBe(true);
            expect(res.body.data.pagination.hasPrevPage).toBe(false);
        });

        it("Should filter by status - available", async () => {
            const res = await request(app)
                .get("/api/items/list")
                .query({ status: "available" });

            expect(res.statusCode).toBe(200);
            expect(res.body.data.items).toHaveLength(3);
            res.body.data.items.forEach((item: { status: string }) => {
                expect(item.status).toBe("available");
            });
        });

    })

    describe("GET /api/items/:id", ()=>{
        it("Should get item by valid ID", async () => {
            const res = await request(app).get(`/api/items/${createdItemId}`);
    
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.item).toBeDefined();
            expect(res.body.item._id).toBe(createdItemId);
            expect(res.body.item.title).toBe(`${TestItem.title}`);
            expect(res.body.item.description).toBe(`${TestItem.description}`);
            expect(res.body.item.category).toBe(`${TestItem.category}`);
            expect(res.body.item.price).toBe(TestItem.price);
        });

        it("Should return error for invalid id ", async ()=> {
            const res = await request(app).get(`/api/items/invalid id`);

            expect(res.statusCode).toBe(400);
            expect(res.body.error).toBe("Invalid item ID")
        })

        it("Should return error for item not found ", async ()=>{
            const fakeId = new mongoose.Types.ObjectId().toString();
            const res = await request(app).get(`/api/items/${fakeId}`);

            expect(res.statusCode).toBe(404);
            expect(res.body.error).toBe("Item not found");
        });




    })
})