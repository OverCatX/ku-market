import express from "express";
import { uploadFiles } from "../middlewares/validators/items.validation";
import ItemController from "../controllers/items.controller";
import { createItem, updateItem} from "../middlewares/validators/items.validation";
import { authenticate } from "../middlewares/authentication";

const router = express.Router();
const itemcontroller = new ItemController();

router.post("/create",authenticate ,uploadFiles("photos", 5, true),createItem, itemcontroller.userUpload);

router.patch("/update/:id",authenticate,  uploadFiles("photos", 5, false),updateItem, itemcontroller.userUpdatePicture);

router.delete("/delete/:id",authenticate, itemcontroller.userDeletePicture)

router.get("/list", itemcontroller.userGetList)

router.get("/:id", itemcontroller.userGet)

export default router;
