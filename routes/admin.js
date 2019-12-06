var express = require("express");
var router = express.Router();
const auth = require("../middleware/authentication");
var adminService = require("../services/adminService");
var A_Database = require("../models/applicant");
var stringify = require("csv-stringify");
var fs = require("fs");
var userFunctions = require("../services/userFunctions");
const path = require("path");
const eventCsvPath = path.join(__dirname,"event.csv")
/* GET home page. */

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

router.get("/", async (req, res, next) => {
  try {
    var data = await A_Database.find(
      { $and: [{ role: "public" }, { submitted: true }] },
      "regno status name domain phone overSmart check startTime endTime"
    );
    res.render("userList", { data: data });
  } catch (error) {
    return next(error);
  }
});

router.get("/getcompusers", async(req,res,next) => {
  try{
    // var event = [];
    var compUser = await A_Database.find({compete: true});
    //console.log(compUser);
    let columns = {
      name: "name",
      email: "email",
      regno: "regno",
      phone: "phone",
      compete: "compete",
      gender: "gender"
    }
    let stuff = compUser.map(currentUser => {
      return{
        name: currentUser.name,
        email: currentUser.email,
        regno: currentUser.regno,
        phone: currentUser.phone,
        compete: currentUser.compete,
        gender: currentUser.gender
      };
    });
    console.log(stuff);
    stringify(stuff, { header: true, columns: columns }, (err, output) => {
      if (err) throw err;
      fs.writeFile("event.csv", output, err => {
        if (err) throw err;
        console.log("event.csv saved.");
      });
    });
    return res.download("event.csv");
  } catch(error) {
    return next(error);
  }
})

// //test route for getcompusers
// router.post("/createcompusers", async(req,res,next) => {
//   try{
//     let message = await userFunctions.addUser(req.body)
//       if(message == "ok")
//         return res.redirect("/");
//   } catch(err) {
//     if(err)
//       throw(err);
//   }
// })

router.get("/userdata/:idd", async (req, res, next) => {
  try {
    var idd = req.path;
    idd = idd.split("/");
    idd = idd[2];
    console.log(idd);
    var data = await A_Database.find(
      { regno: idd },
      "regno response status overSmart"
    ).populate("response.questionId", "question qDomain answer");
    console.log(data);
    // res.json(data);
    res.render("userAns", { data: data });
    // res.json(data);
  } catch (error) {
    return next(error);
  }
});

router.post("/userdata/:idd", async (req, res, next) => {
  try {
    var idd = req.path;
    idd = idd.split("/");
    idd = idd[2];
    await adminService.updateStatus(idd, req.user.name, req.body.status);
    res.send("Admin test complete");
    res.redirect("/admin");
  } catch (error) {
    return next(error);
  }
});
module.exports = router;
