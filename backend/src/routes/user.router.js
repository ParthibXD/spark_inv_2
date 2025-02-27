//User router:
import { Router } from "express";
import { generateAccessAndRefreshTokens, registerUser, loginUser, logoutUser,refreshAccessToken,verifyUser, getUser, updateReputation, getRecommendedUsers, followUser, unfollowUser} from "../controllers/user.controllers.js"
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1

        },
        {
            name:"coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)

router.route("/login").post(loginUser)

//secured routes
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/current-user").get(verifyJWT,getUser)
router.route("/verify-user").get(verifyJWT,verifyUser)
router.route("/update-reputation").post(verifyJWT, updateReputation)

// Get recommended users based on similar interests
router.get("/recommendations", verifyJWT, getRecommendedUsers);

// Follow a user
router.post("/follow/:userId", verifyJWT, followUser);

// Unfollow a user
router.post("/unfollow/:userId", verifyJWT, unfollowUser);



export default router