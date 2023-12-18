const express = require("express")
const userRouter = express.Router()

const isAuthenticated = require("../midleware/jwt"); // Adjust the path accordingly

userRouter.get("/user", isAuthenticated, async (req, res) => {
    const useremail = req.user.email;   // Replace 'email' with the actual property in your JWT payload
    const findpkg = await PackageModle.findOne({ email: useremail })
    try{

        const balance = findpkg.balance
        res.render("user.hbs", { balance });
    }catch(e){

        res.render("user.hbs");
    }

});
userRouter.get("/packages-details", isAuthenticated, (req, res) => {
    res.render("packages-details.hbs")
})
const PackageModle = require("../modle/Packagemodle")

userRouter.post("/buypackage", isAuthenticated, async (req, res) => {

    try {
        const { hprofit, hpackage, hinvest, buyerphone } = req.body;

        const userId = req.user.userId; // Replace 'userId' with the actual property in your JWT payload
        const useremail = req.user.email;   // Replace 'email' with the actual property in your JWT payload
        const date = new Date()
        currentdate = date.getDate();
        const buypkg = new PackageModle({
            email: useremail,
            profit: hprofit,
            investment: hinvest,
            package: hpackage,
            buyerphone: buyerphone,
            date: currentdate
        })

        await buypkg.save()
        const findpkg = await PackageModle.findOne({ email: useremail })
        const balance = findpkg.balance
        res.render("user.hbs", { Message: "Sucesfully buy package see your asssigment now", balance })
    }
    catch (e) {
        res.render("user.hbs", { gMessage: "cant buy package try again" })
    }

})

const Assigment=require("../modle/topicModle")
userRouter.get("/task", isAuthenticated, async (req, res) => {
    try {

        const useremail = req.user.email;
        const findUser = await PackageModle.findOne({ email: useremail })
        if(findUser){
            const balance = findUser.balance
            if (findUser.status == true) {
                const assigmenttopic=await Assigment.findOne()
                        const topic=assigmenttopic.topic
                res.render("task.hbs", { balance,topic })
            }else{
                res.render("user.hbs", { gMessage: "buy packeage first" })

            }
        }else{
            res.render("user.hbs", { gMessage: "buy packeage first" })

        }
        
        
    } catch (e) {
        console.log(e);
    }


})

userRouter.get("/uploadassigment", isAuthenticated, async (req, res) => {

    const useremail = req.user.email
    try {
        const finduser = await PackageModle.findOne({ email: useremail })
        const userbalance = finduser.balance
        const profit = finduser.profit
        const balance = Number(userbalance) + Number(profit);
        const updateResult = await PackageModle.updateOne(
            { email: useremail },
            { $set: { balance: balance } }
        );


        res.render("user.hbs", { balance })
    } catch (e) {
        res.redirect("/")
    }

})

userRouter.get("/withdraw", isAuthenticated, async (req, res) => {

    try{

        const useremail = req.user.email;
        const findUser = await PackageModle.findOne({ email: useremail })
        const balance = findUser.balance
        res.render("withdraw.hbs",{ balance })
    }catch(e){
        res.render("withdraw.hbs")
    }
})

const reqpaymentModel=require('../modle/payrequestModel')
userRouter.post("/getwithdraw",isAuthenticated,async(req,res)=>{
    const useremail = req.user.email;
    const{number}=req.body

    try{
        const finduser=await PackageModle.findOne({email:useremail})
     
        const date=new Date()
        if(finduser){

            const payreq=new reqpaymentModel({
                email:useremail,
                accnumber:number,
                date:date
            })
            await payreq.save()
            res.redirect("/user")
        }else{
            res.render("withdraw.hbs",{Message:"buy package first"})
        }
        
    }catch(e){
        console.log(e);
    }

})

const UsersModle=require("../modle/RegisterModle")

userRouter.get("/profile",isAuthenticated,async(req,res)=>{
    try{

        const useremail=req.user.email 
        const finduser=await PackageModle.findOne({email:useremail})
        const balance=finduser.balance
        if(finduser){
            res.render("profile.hbs",{finduser,balance})

        }else{
            const User=await UsersModle.findOne({email:useremail})
            res.render("profile.hbs",{User})
        }
        
    }catch(w){
        res.redirect("/")
    }
})
const History=require("../modle/RegisterModle")

userRouter.get("/history",isAuthenticated,async(req,res)=>{
    try{

        const useremail=req.user.email 
        const findhistory=await History.findOne({email:useremail})
        const finduser=await PackageModle.findOne({email:useremail})
        const balance=finduser.balance
        if(finduser){
            res.render("history.hbs",{findhistory,balance})

        }else{
            res.render("history.hbs",{findhistory})
        }
        
    }catch(w){
        res.redirect("/")
    }
})


module.exports = userRouter