//User Controller:
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/User.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async(userId)=>
    {
        try {
            const user=await User.findById(userId);
            const accessToken=user.generateAccessToken();
            const refreshToken=user.generateRefreshToken();
    
            user.refreshToken = refreshToken;
            await user.save({ validateBeforeSave: false});
    
            return {accessToken, refreshToken};
    
        } catch (error) {
            throw new ApiError(500, "Something went wrong while generating refresh and access token")
        }
    }
    
    
    


// Register a user
const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password, role, interests } = req.body;

    if ([fullName, email, username, password, role, interests].some(field => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });

    if (existingUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    const avatarLocalPath=req.files?.avatar[0]?.path;
    // let coverImageLocalPath;
    // if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
    //     coverImageLocalPath=req.files.coverImage[0].path
    // }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required ")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    // const coverImage =await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400, "Avatar file is required")
    }

    const user = await User.create({ fullName, email, username: username.toLowerCase(), password, role, interests,avatar:avatar.url });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    



    return res.status(201).json(new ApiResponse(201, createdUser, "User registered successfully"));
});


const loginUser = asyncHandler( async (req, res) =>{
    const {email, username, password} =req.body
    // console.log(fullName);


    if(!username && !email){
        throw new ApiError(400," username or email is required");
    }

        //for one email or password
        //User.findOne({email})

    const user = await User.findOne({
        $or:[{username},{email}]
    })

    if(!user){
        throw new ApiError(404,"User does not exist");
    }

    // for mongoose use User with capital u and for user defined functions use user with small u
    const isPasswordValid=await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401,"Invalid user credentials");
    }

    const {accessToken, refreshToken} = 
    await generateAccessAndRefreshTokens(user._id)

    const loggedInUser=await User.findById(user._id).
    select("-password -refreshToken")

    const  options = {
        httpOnly: true,
        secure: true
    }


    return res.
    status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged in Successfully"
        )
    )


})



const logoutUser= asyncHandler( async(req,  res) =>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset:{
                refreshToken: 1,
            }
            // Instead of
            // $set:{
            //     refreshToken: undefined,
            // }
        },
        {
            new: true
        },
    )

    const options={
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"))
})

// Verify a user (for alumni and university verification)
const verifyUser = asyncHandler(async (req, res) => {
    // const { userId } = req.params;

    const user = await User.findByIdAndUpdate(req.user._id, { isVerified: true }, { new: true });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(new ApiResponse(200, user, "User verified successfully"));
});

// Update user’s reputation
const updateReputation = asyncHandler(async (req, res) => {
    const { reputationChange } = req.body;

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $inc: { reputation: reputationChange } },
        { new: true }
    );

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(new ApiResponse(200, user, "User reputation updated successfully"));
});

// Fetch user details
const getUser = asyncHandler(async (req, res) => {
    return res
    .status(200)
    .json(new  ApiResponse(
        200, 
        req.user, 
        "Current User fetched Successfully"
    ))    
});


const refreshAccessToken =asyncHandler(async (req, res)=>{
    const incomingRefreshToken = 
    req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized Request");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if(!user){
            throw new ApiError(401, "Invalid Refresh Token");
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401,"Refresh token is expored or used")
        }
    
        const options={
            httpOnly:true,
            secure:true
        }
    
        const {accessToken,newrefreshToken}=await generateAccessAndRefreshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newrefreshToken,options)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken,
                    refreshToken: newrefreshToken
                },
            
            "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid Refresh Token")
    }

})


// Get recommended users based on similar interests
const getRecommendedUsers = async (req, res) => {
    const currentUser = await User.findById(req.user._id);
    if (!currentUser) {
        throw new ApiError(404, "User not found");
    }

    const recommendedUsers = await User.find({
        interests: { $in: currentUser.interests },
        _id: { $ne: currentUser._id } // Exclude current user
    }).select("fullName username interests avatar");

    return res.status(200).json(new ApiResponse(200, recommendedUsers, "Recommended users fetched"));
};

// Follow a user
const followUser = async (req, res) => {
    const { userId } = req.params;

    if (req.user._id === userId) {
        throw new ApiError(400, "You cannot follow yourself");
    }

    const userToFollow = await User.findById(userId);
    if (!userToFollow) {
        throw new ApiError(404, "User to follow not found");
    }

    const currentUser = await User.findById(req.user._id);

    if (currentUser.following.includes(userId)) {
        throw new ApiError(400, "You are already following this user");
    }

    currentUser.following.push(userId);
    userToFollow.followers.push(req.user._id);

    await currentUser.save();
    await userToFollow.save();

    return res.status(200).json(new ApiResponse(200, userToFollow, "User followed successfully"));
};

// Unfollow a user
const unfollowUser = async (req, res) => {
    const { userId } = req.params;

    const userToUnfollow = await User.findById(userId);
    if (!userToUnfollow) {
        throw new ApiError(404, "User to unfollow not found");
    }

    const currentUser = await User.findById(req.user._id);

    if (!currentUser.following.includes(userId)) {
        throw new ApiError(400, "You are not following this user");
    }

    currentUser.following = currentUser.following.filter(id => id.toString() !== userId);
    userToUnfollow.followers = userToUnfollow.followers.filter(id => id.toString() !== req.user._id);

    await currentUser.save();
    await userToUnfollow.save();

    return res.status(200).json(new ApiResponse(200, userToUnfollow, "User unfollowed successfully"));
};


export { generateAccessAndRefreshTokens,registerUser,loginUser,refreshAccessToken, logoutUser,verifyUser, updateReputation, getUser,getRecommendedUsers,followUser,unfollowUser };
