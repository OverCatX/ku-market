import express from "express";
import { uploadFiles } from "../middlewares/validators/items.validation";
import ItemController from "../controllers/items.controller";
import { createItem, updateItem} from "../middlewares/validators/items.validation";

const router = express.Router();
const itemcontroller = new ItemController();

router.post("/create",uploadFiles("photos", 5),createItem, itemcontroller.userUpload);

router.patch("/update/:id", uploadFiles("photos", 5),updateItem, itemcontroller.userUpdatePicture);

router.delete("/delete/:id", itemcontroller.userDeletePicture)

router.get("/list", itemcontroller.userGetList)

router.get("/:id", itemcontroller.userGet)

export default router;
