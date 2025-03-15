const express = require("express")
const dotenv = require("dotenv")
const cors = require("cors")
const cookieParser  = require("cookie-parser")
const connectDB = require("./lib/db.js")

const authRoutes = require("./routes/auth.route.js")
const productRoutes = require("./routes/product.route.js")
const cartRoutes = require("./routes/cart.route.js")
const shopRoutes = require("./routes/shop.route.js")
const subscriptionRoutes = require("./routes/subscription.route.js")
const orderRoutes = require("./routes/order.route.js")

dotenv.config()


const app = express()

app.use(cors({
    origin: "http://localhost:5175",
    credentials: true,
  }))
app.use(express.json())
app.use(cookieParser())

const PORT = process.env.PORT || 5001

app.listen(PORT,()=>{
    console.log("Server is running on port",PORT)
    connectDB()
})

app.get("/",(req,res)=>{
    res.send("Hello World")
})

app.use("/api/auth",authRoutes)
app.use("/api/product",productRoutes)
app.use("/api/cart",cartRoutes)
app.use("/api/shop",shopRoutes)
app.use("/api/subscription",subscriptionRoutes)
app.use("/api/order",orderRoutes)