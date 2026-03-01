import {v2 as cloudinary} from "cloudinary";
import fs from "fs";

    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET 
    });

         const uploadOnCloudinary = async(localFilePath) => {
             try {
                 if (!localFilePath) return null;
                 const response = await cloudinary.uploader.upload(localFilePath, {    ///Upload the file on cloudinary
                     resource_type: "auto",
                 });
                 console.log("Upload Result:", response);
                 //File has been uploaded successfully, now we can remove the file from local storage
                 if (fs.existsSync(localFilePath)) {
  fs.unlinkSync(localFilePath);
}
                 return response;
             } catch (error) {
                 fs.unlinkSync(localFilePath);   // remove the locally saved temp file in case of an error as well
                 console.log("Error uploading to Cloudinary:", error);
                 return null;
             }
         };     


         export {uploadOnCloudinary};