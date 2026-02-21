import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async(req,res,next)=>{
// Get user details from frontend
// Validation - Not empty
// Check if user already exists :  Check with username and email
// Chech for images and check for avatar
// upload them to cloudinary , avatar checking
// Create user object - create entry in DB
// remove password and refresh token field from response
// Check for user creation 
// return response

const {fullName,email,username,password} = req.body
console.log("email : ",email);

if([fullName,email,username,password].some((field) => field?.trim() === "")){
    throw new ApiError(400,"All fields are required")
}

const existedUser = User.findOne({
    $or : [{username},{email}]
})

if(existedUser){
    throw new ApiError(409,"User with username or email already exists")
}

const avatarLocalPath = req.files?.avatar[0]?.path;
const coverImageLocalPath = req.files?.coverImage[0]?.path;

if(!avatarLocalPath){
    throw new ApiError(400,"Avatar is required")
}

const avatar = await uploadOnCloudinary(avatarLocalPath)
const coverImage = await uploadOnCloudinary(coverImageLocalPath)

if(!avatar){
     throw new ApiError(400,"Uploading avatar failed")
}

const user = await User.create({
    fullName,
    email,
    username : username.toLowerCase(),
    password,
    avatar : avatar.url,
    coverImage : coverImage?.url || ""
})

const createdUser = await User.findById(user._id).select("-password -refreshToken")

if(!createdUser){
    throw new ApiError(500,"Sometyhing went wrong when creating user")
}

return res.status(201).json(new ApiResponse(200,createdUser,"User created successfully"))

    })

export {registerUser}