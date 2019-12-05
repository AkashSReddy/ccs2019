const Q_Database = require("../models/question");
const A_Database = require("../models/applicant");
module.exports.setQuestions = async id => {
  // console.log(id);
  try {
    var domain = await A_Database.findById(id, "domain");
    domain = domain.domain;
    var fArray = [];
    for (var ii = 0; ii < domain.length; ii++) {
      var newDomain = domain[ii];
      Sque = await Q_Database.find({ qDomain: newDomain, qType: "Subjective" }, { "_id": 1 }).lean();
      Oque = await Q_Database.find({ qDomain: newDomain, qType: "Objective" }, { "_id": 1 }).lean();
      // console.log(questions);
      // console.log(Sque.length);
      // console.log(Oque.length);
      var resultque = []
      if (newDomain !== "documentation") {
        for (var i = Sque.length - 1; i > 0; i--) {
          var index = Math.floor(Math.random() * (i + 1))
          var temp = Sque[i];
          Sque[i] = Sque[index];
          Sque[index] = temp;
        }
        Sque = Sque.splice(5);
        resultque.push.apply(resultque, Sque);
        for (var i = Oque.length - 1; i > 0; i--) {
          var index = Math.floor(Math.random() * (i + 1))
          var temp = Oque[i];
          Oque[i] = Oque[index];
          Oque[index] = temp;
        }
        Oque = Oque.splice(5);
        resultque.push.apply(resultque, Oque);
      }
      else {
        for (var i = Sque.length - 1; i > 0; i--) {
          var index = Math.floor(Math.random() * (i + 1))
          var temp = Sque[i];
          Sque[i] = Sque[index];
          Sque[index] = temp;
        }
        Sque = Sque.splice(5); // No of question is 5 for documentation
        resultque.push.apply(resultque, Sque);
      }
      fArray.push.apply(fArray, resultque);
    }
    return fArray;
  } catch (error) {
    throw error;
  }
};

module.exports.timeStatus = async id => {
  try {
    const data = await A_Database.findById(id, {});
    var startTime = data.startTime;
    var endTime = data.endTime;
    var maxTime = data.maxTime;

    var duration = endTime - startTime;
    var actDuration = duration - maxTime * 1000;
    actDuration = actDuration / 60000;
    var overSmart = "no";
    if (actDuration > 5) {
      overSmart = "yes";
    }
    await A_Database.findByIdAndUpdate(id, { overSmart: overSmart });
  } catch (error) {
    throw error;
  }
};

module.exports.validate = userDetails => {
  try {
    var regno = userDetails.regno;
    var phone = userDetails.phone;
    var name = userDetails.name;
    phone = phone.length;
    var password = userDetails.password;
    password = password.length;
    var message = "ok";
    console.log("inside validate");

    // 18938173831
    // 18[A-Z]{3}[0-9]{3}[0-9]$
    if (!/18[A-Z]{3}[0-9]{3}[0-9]$/.test(regno)) {
      message = "Reg. No format invalid";
      console.log("reg");
      return message;

      // res.render("register", { message: message });
    }
    if (!/^[a-zA-Z][a-zA-Z ]+[a-zA-Z]$/.test(name)) {
      message = "Name should only have alphabets!";
      return message;
      //  res.render("register",{ message: message });
    }
    if (phone != 10) {
      message = "Phone number format invalid";
      return message;
      //  res.render("register", { message: message });
    }
    if (password < 8) {
      message = "Password length must be greater than 8 letters ";
      return message;
      //  res.render("register", { message: message });
    }
    return message;
  } catch (error) {
    throw error;
  }
};
