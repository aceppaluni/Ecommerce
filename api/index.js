//mongod --dbpath=data
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const express = require("express");
const mongoose = require("mongoose");
const nodeMailer = require("nodemailer");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const User = require("./models/User");
const Order = require('./models/Order')

const url = "mongodb://localhost:27017/amazondb";

mongoose
  .connect(url, {
    // no longer need prior lines
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.log(error);
});

app.listen(PORT , () => {
  console.log(`Server running on ${PORT}`);
});

// ENDPOINTS FOR APP Below

const sendVerificationEmail = async (email, verificationToken) => {
  const transporter = nodeMailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: "darrel96@ethereal.email",
      pass: "V6EhZ9xyF6py2hSUs9",
    },
  });

  const mailOptions = {
    from: "amazon.com",
    to: email,
    subject: "Verification Email",
    text: `Please use the link provided to verify your email : http://10.0.0.11:5000/verify/${verificationToken}`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log(error);
  }
};

const generateSecretKey = () => {
  const secretkey = crypto.randomBytes(32).toString("hex");

  return secretkey;
};

const secretkey = generateSecretKey();


app.post("/register", async (req, res) => {
  //const { name, email, password } = req.body;
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });

    console.log(existingUser);

    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const newUser = await User({
      name: name,
      email: email,
      password: password,
    });

    newUser.verificationToken = crypto.randomBytes(20).toString('hex')
    await newUser.save();

    sendVerificationEmail(newUser.email, newUser.verificationToken);

    res
      .status(200)
      .json({
        message: "Registration Successful, please check email to verify",
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Registration failed" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.password !== password) {
      return res.status(200).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ userId: user._id }, secretkey);
    res.status(200).json({ token });
  } catch (error) {
    res.status(404).json({ message: "Error signing in" });
  }
});

app.get("/verify/:token", async (req, res) => {
  try {
    const token = req.params.token;
    //console.log(token)
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(404).json({ message: "Email already in use" });
    }

    user.verified = true;
    user.verificationToken = undefined;

    await user.save();

    return res.status(200).json({ message: "Email verfied successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Email verification failed" });
  }
});

// endpoint for storing orders
app.post("/orders", async (req, res) => {
  try {
    const { userId, cartItems, totalPrice, shippingAddress, paymentMethod } =
      req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    //create an array of product objects from the cart Items
    const products = cartItems.map((item) => ({
      name: item?.title,
      quantity: item.quantity,
      price: item.price,
      image: item?.image,
    }));

    //create a new Order
    const order = new Order({
      user: userId,
      products: products,
      totalPrice: totalPrice,
      shippingAddress: shippingAddress,
      paymentMethod: paymentMethod,
    });

    await order.save();

    res.status(200).json({ message: "Order created successfully!" });
  } catch (error) {
    console.log("error creating orders", error);
    res.status(500).json({ message: "Error creating orders" });
  }
});


// getting user profile
app.get("/profile/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log('user',userId)
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving the user profile" });
  }
});

//getting orders from the user
app.get('/orders/:userId', async(req, res) => {
  try {
    const userId = req.params.userId;
    const orders = await Order.find({user:userId}).populate('user')
    if(!orders || orders.length === 0) {
      return res.status(404).json({message: 'No orders found'})
    }
    res.status(200).json({orders})
  } catch (error) {
    res.status(404).json({message: 'Unable to fetch orders'})
  }
});

app.post("/addresses", async (req, res) => {
  try {
    const { userId, address } = req.body;

    //find the user by the Userid
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    //add the new address to the user's addresses array
    user.addresses.push(address);

    //save the updated user in te backend
    await user.save();

    res.status(200).json({ message: "Address created Successfully" });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Error addding address" });
  }
});

app.get('/addresses/:userId', async(req, res) => {
  try{
    const userId = req.params.userId;
    const user = await User.findById(userId)
    if(!user) {
      return res.status(404).json({message: 'User not found'})
    }
    const addresses = user.addresses;
    res.status(200).json({addresses});

  } catch (error) {
    res.status(404).json({message: 'Unable to fetch addresses'})
  }
});

