import mongoose , {Schema} from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    subscriber : {
        type : Schema.Types.ObjectId,  //One who is subscribing
        ref : "User"
    },
    channel : {
        type : Schema.Types.ObjectId,  //One to whom subscriber is scbscribing
        ref : "User"
    }
},{timestamps : true})

const Subscription = mongoose.model("Subscription",subscriptionSchema)

export {Subscription}