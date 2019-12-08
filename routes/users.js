var express = require("express");
var router = express.Router();
var Q_Database = require("../models/question");
var A_Database = require("../models/applicant");
var userService = require("../services/userService");
var userFunctions = require("../services/userFunctions");
var passport = require("passport");
const auth = require("../middleware/authentication");
const request = require("request-promise");
var date = new Date();

router.get("/", (req, res) => {
  res.render("index", { message: req.flash("message") || "" });
});


router.post(
  "/login",
  passport.authenticate("login", {
    successRedirect: "/user-role",
    failureRedirect: "/",
    failureFlash: true
  })
);


router.get("/register", (req, res) => {
  res.render("register", { message: "" });
});

//post questions route
// router.post("/questions", async (req, res, next) => {
//   // var question = JSON.parse(req.body);
//   console.log(req.body);
//   await Q_Database.create(req.body);
//   res.end();
// })

// get question from csv file

// router.get("/postquestions", async (req, res) => {
//   var csvtojson = require("csvtojson");
//   const csvFilePath = require('path').join(__dirname + "../../../book1.csv");
//   let jsonArray = await csvtojson().fromFile(csvFilePath);
//   // console.log(jsonArray);
//   let stuff = jsonArray.map(data => {
//     var options = [];
//     if (data.qType === "Objective") {
//       options.push(data.options1);
//       options.push(data.options2);
//       options.push(data.options3);
//       options.push(data.options4);
//     }
//     return {
//       options: options,
//       question: data.question,
//       qid: data.qid,
//       qDomain: data.qDomain,
//       qType: data.qType,
//       answer: data.answer
//     }
//   })
//   // console.log(stuff);
//   let result = await Q_Database.insertMany(stuff);
//   res.send('OK');
//   res.end();
//   // console.log(require('path').join(__dirname + "../../../"));
// })


// router.post("/register", async (req, res, next) => {
//   const options = {
//     method: "POST",
//     uri: "https://www.google.com/recaptcha/api/siteverify",
//     formData: {
//       secret: process.env.RECAPTCHA_SECRET,
//       response: req.body["g-recaptcha-response"]
//     }
//   };
//   request(options)
//     .then(response => {
//       let cResponse = JSON.parse(response);
//       if (!cResponse.success) {
//         return res.render("register", { message: "Invalid Captcha" });
//       }
//       return userFunctions
//         .addUser(req.body)
//         .then(function (message) {
//           if (message === "ok") return res.redirect("/");
//           return res.render("register", { message: message });
//         })
//         .catch(err => {
//           console.log(err);
//           next(err);
//         });
//     })
//     .catch(err => next(err));
// });

router.post("/register", async (req, res, next) => {
  try {
    let message = await userFunctions.addUser(req.body);
    // console.log(req.body);
    console.log(message)
    if (message === "ok") return res.redirect("/");
    return res.render("register", { message: message });
  } catch (err) {
    next(err);
  }
});

router.get("/user-role", auth.isLoggedIn, (req, res, next) => {
  try {
    console.log("entered user-role");

    if (req.user.role === "admin") {
      return res.redirect("/admin");
    }
    res.redirect("/instructions");
  } catch (error) {
    next(error);
  }
});

//Commented for now

// router.get("/data/:idd", async (req, res, next) => {
//   try {
//     var idd = req.path;
//     idd = idd.split("/");
//     idd = idd[2];
//     var data = await A_Database.find(
//       { regno: idd },
//       "regno response status overSmart"
//     ).populate("response.questionId", "question qDomain answer");
//     res.json(data);
//   } catch (error) {
//     next(error);
//   }
// });

router.get("/logout", auth.isLoggedIn, (req, res) => {
  req.logout();
  res.redirect("/");
});

router.get("/thanks", auth.isUser, (req, res, next) => {
  req.logout();
  res.render("thanks");
});

router.get(
  "/instructions",
  auth.isUser,
  auth.isAttempt,
  async (req, res, next) => {
    res.render("instructions", { user: req.user });
  }
);



//test route for domains

// router.post("/test", (req, res, next) => {
//   var domain = req.body.domain;
//   var compete = false;
//   for (var i = 0; i < domain.length; i++) {
//     if (domain[i] === "competitive") {
//       compete = true;
//       domain[i] = domain[domain.length - 1];
//       domain.pop();
//       break;
//     }
//   }
//   console.log(domain);
//   console.log(compete);
//   res.send("yes");
//   res.end();
// })

router.get("/domain", auth.isUser, auth.isAttempt, async (req, res, next) => {
  try {
    return res.render("domains", { user: req.user })
  } catch (error) {
    return next(error)
  }
})

router.post("/domain", auth.isUser, auth.isAttempt, async (req, res, next) => {
  try {
    var startTime = Date.now();
    var domain = req.body.domain;
    var compete = false;
    for (var i = 0; i < domain.length; i++) {
      if (domain[i] === "competitive") {
        compete = true;
        domain[i] = domain[domain.length - 1];
        domain.pop();
        break;
      }
    }
    var maxTime = domain.length * 600;
    await A_Database.findByIdAndUpdate(req.user.id, {
      compete: compete,
      domain: domain,
      startTime: startTime,
      maxTime: maxTime
    });
    res.json({ success: true });
  } catch (error) {
    return next(error);
  }
});

router.get("/question", auth.isUser, auth.isAttempt, async (req, res, next) => {
  try {
    var stuff = await userService.setQuestions(req.user.id);

    let questions = stuff.map(question => {
      return {
        questionId: question._id,
        userSolution: ""
      };
    });
    await A_Database.findByIdAndUpdate(req.user.id, {
      response: questions,
      attempted: true
    });
    const data = await A_Database.find(
      { _id: req.user.id },
      "response domain maxTime"
    ).populate("response.questionId", "question qDomain qType");
    console.log(data[0]);

    res.render("quiz", { data: data[0] });
  } catch (error) {
    return next(error);
  }
});

router.post("/question", auth.isUser, auth.isSubmit, async (req, res, next) => {
  try {
    const solutions = req.body.solutions;
    console.log(solutions);
    var endTime = Date.now();
    let user = await A_Database.findById(req.user.id);
    console.log(user);
    let responseToUpdate = user.response;
    responseToUpdate.forEach(question => {
      solutions.forEach(solution => {
        if (solution.questionId == question.questionId) {
          question.userSolution = solution.userSolution;
        }
      });
    });
    user.response = responseToUpdate;
    user.submitted = true;
    user.endTime = endTime;
    await user.save();
    await userService.timeStatus(req.user.id);
    res.json({ success: true });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
