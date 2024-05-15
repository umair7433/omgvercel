const express = require("express");
const AdminRoute = express.Router();

const Admin = require("../modle/AdminModle"); // Adjust the path accordingly
const jwt = require("jsonwebtoken");
const isAuthenticated = require("../midleware/jwt"); // Adjust the path accordingly
const Secret_key="tisisthesecreatkashfkjndskjfn"
const packagesModel=require("../modle/Packagemodle")
const RegisterModle=require("../modle/RegisterModle")
const payrequestModel=require("../modle/payrequestModel")



AdminRoute.get("/admin", (req, res) => {

    res.render("admin/adminlogin.hbs");
});



AdminRoute.post("/adminlogin", async (req, res) => {
    try {
        const { email, password } = req.body;
        const finduser = await Admin.findOne({ email: email });

        if (finduser) {
            const compass = finduser.password;

            if (password !== compass) {
                res.render("admin/adminlogin.hbs", { Message: "Invalid Login" });
            } else {
                // Successful login
                const token = jwt.sign({ userId: finduser._id, email: finduser.email }, Secret_key, { expiresIn: "1h" });
                res.cookie("token", token, { httpOnly: true });
                // res.render("admin/admindash.hbs");
                res.redirect("/admindash")

            }
        } else {
            res.render("admin/adminlogin.hbs", { Message: "Invalid Login" });
        }
    } catch (e) {
        // Handle any errors
        res.render("admin/adminlogin.hbs", { Message: "Invalid Login" });
    }
});




AdminRoute.get("/admindash", isAuthenticated, async (req, res) => {   
  try {
    const Find = await packagesModel.find({ status: true });

    // Calculate total income from packages with status: true
    const formattedIncome = Find.reduce((sum, package) => sum + parseFloat(package.investment), 0).toFixed(2);
    const income = Number(formattedIncome).toFixed(2);

    res.render("admin/admindash.hbs", { income });
  } catch (error) {
    console.error("Error fetching packages:", error);
    res.status(500).send("Internal Server Error");
  }
});



AdminRoute.get("/accounts", isAuthenticated, async (req, res) => { 
    const users = await packagesModel.find({ status: false });
    res.render("admin/accounts.hbs",{users});
});

AdminRoute.post("/change-status", async (req, res) => {
    const userId = req.body.userId;
  
    try {
      // Find the user by ID and update the status to true
      const updatedUser = await packagesModel.findByIdAndUpdate(userId, { status: true }, { new: true });
  
      if (!updatedUser) {
        return res.status(404).send("User not found");
      }
  
      console.log(`Status updated for user ${updatedUser.name}`);
      res.redirect("/accounts");
    } catch (error) {
      console.error("Error updating user status:", error);
      res.redirect("/");
    }
  });
  




AdminRoute.get("/payments", isAuthenticated, async (req, res) => {  
    const payment=await payrequestModel.find({status:false})  
    res.render("admin/payments.hbs",{payment});
});
AdminRoute.post("/change-payment", async (req, res) => {
    const userId = req.body.userId;
  
    try {
      // Find the user by ID and update the status to true
      const currentDate = new Date();

      // Find the user by ID and update the status and set the current date
      const updatedUser = await payrequestModel.findByIdAndUpdate(
        userId,
        { $set: { status: true, date: currentDate } },
        { new: true }
      );  
      if (!updatedUser) {
        return res.status(404).send("User not found");
      }
  
      console.log(`Status updated for user ${updatedUser.name}`);
      res.redirect("/payments");
    } catch (error) {
      console.error("Error updating user status:", error);
      res.redirect("/");
    }
  });
  






AdminRoute.get("/donepayments", isAuthenticated, async (req, res) => {   
    const payment=await payrequestModel.find({status:true})  
    res.render("admin/donepayments.hbs",{payment});
});


AdminRoute.get("/logout", (req, res) => {
  // Perform logout actions here, such as clearing session, removing tokens, etc.

  // For example, if you are using JWT and cookies:
  res.clearCookie("token");

  // Redirect to the login page or any other desired page after logout
  res.redirect("/");

  // Alternatively, you can render a logout success page:
  // res.render("logout-success.hbs");
});

const AssignModel = require("../modle/topicModle");

AdminRoute.post("/assigntopic", isAuthenticated, async (req, res) => {
  try {
    // Assuming you have some parameters in the request body to update the assignment
    const { topic } = req.body;
    const date = new Date();

    // Check if the topic already exists
    let existingAssignment = await AssignModel.findOne({ topic });

    if (!existingAssignment) {
      // If the topic doesn't exist, create a new assignment with the topic and date
      const newAssignment = new AssignModel({ topic, date });
      existingAssignment = await newAssignment.save();
    } else {
      // If the topic exists, update the assignment in the database
      existingAssignment = await AssignModel.findOneAndUpdate(
        { topic },
        { $set: { date } },
        { new: true }
      );
    }

    if (!existingAssignment) {
      return res.status(404).send("Assignment not found");
    }

    // Send the updated or newly created assignment as a response or do any other necessary actions
    res.redirect("/admindash");
  } catch (error) {
    console.error("Error updating assignment:", error);
    res.status(500).send("Internal Server Error");
  }
});




module.exports = AdminRoute;
