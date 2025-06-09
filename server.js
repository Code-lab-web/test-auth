import bcrypt from "bcrypt"
import cors from "cors"
import crypto from "crypto"
import express from "express"
import mongoose from "mongoose"
import bcrypt from 'bcrypt-nodejs'

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/test-auth"
mongoose.connect(mongoUrl)
mongoose.Promise = Promise

const User = mongoose.model('User', {})
const { Schema, model } = mongoose

const userSchema = new Schema({
  name: {
    type: String,
    unique: true
  },
  email: {
    type: String,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  accessToken: {
    type: String,
    default: () => crypto.randomBytes(128).toString("hex")
  }
})

const User = model("User", userSchema)

const authenticateUser = async (req, res, next) => {
  const user = await User.findOne({
    accessToken: req.header("Authorization")
  })

  if (user) {
    req.user = user
    next()
  } else {
    res.status(401).json({
      loggedOut: true
    })
  }
}

const port = process.env.PORT || 8080
const app = express()

// Add middlewares to enable cors and json body parsing
app.use(cors())
app.use(express.json())

// Start defining your routes here
app.get("/", (req, res) => {
  res.send("Hello Technigo!")

})



app.get('/secrets', req, res) => {
  res.json({secret: 'This is a super secret message'})

}

app.post("/users", async (req, res) => {
  try {

  }catch(err){}
    const { name, email, password } = req.body;
    const salt = bcrypt.genSaltSync()
    const user = new User({ name, email, password: bcrypt.hashSync(password, salt) })
    user.save()
    res.status(201).json({id:user.id, accessToken:user.acessToken});
} catch (err) {

}
      success: true,
      message: "User created",
      id: user._id,
      accessToken: user.accessToken,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Could not create user",
      errors: error
    })
  }
})

app.get("/secrets", authenticateUser)
app.get("/secrets", (req, res) => {
  res.json({
    secret: "This is secret"
  })
})

app.post("/sessions", async (req, res) => {
  const user = await User.findOne({
    email: req.body.email
  })

  if (user && bcrypt.compareSync(req.body.password, user.password)) {
    res.json({ userId: user._id })
  } else {
    res.json({ notFound: true })
  }
})

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
