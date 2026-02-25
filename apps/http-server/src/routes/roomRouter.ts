import { Router } from "express";
import {
  createRoomController,
  joinRoomController,
  fetchAllRoomsController,
  fetchRoomByIdController,
} from "../controllers/roomControllers";
import { authenticateUser } from "../middlewares/authenticateUser";

const router = Router();

router.route("/create").post(authenticateUser, createRoomController);
router.route("/join").post(authenticateUser, joinRoomController);
router.route("/all").get(authenticateUser, fetchAllRoomsController);
router.route("/:roomId").get(authenticateUser, fetchRoomByIdController);

export default router;
