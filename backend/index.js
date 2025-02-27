<<<<<<< HEAD
import dotenv from "dotenv";

=======
//dotenv has to be imported at beginning of the program
import dotenv from "dotenv"
// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";
import connectDB from "./src/db/index.js";
>>>>>>> 045a98e (block chain and database integration)
import { app } from "./app.js";

dotenv.config({
    path:'./.env'
})

<<<<<<< HEAD
app.listen(process.env.Port || 8000, () => {
  console.log(`Server is running at port: ${process.env.PORT}`);
});
=======
connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000, () =>{
        console.log(`Server is running at port: 
        ${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.log("MONGO db connection failed !!!",err);
})


>>>>>>> 045a98e (block chain and database integration)
