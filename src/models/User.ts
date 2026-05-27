import mongoose, {Schema} from "mongoose"
import type{UserRole, IUser} from "../types/types.js"


//const userSchema = new Schema<IUser>()
const userSchema = new Schema<IUser>({
    name: {
        type : String,
        required : true
    },
    email :{
        type : String,
         required: true,
         unique: true
    },
    password: {
    type: String,
    required: true
  },
  role : {
    type : String,
    enum : ["user", "admin"],
    default : "user"
  },
  refreshToken :{
    type : String,
    default : null
  
  }
}, {timestamps : true})

export const User = mongoose.model<IUser>("User", userSchema)