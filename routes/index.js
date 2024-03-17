var express = require("express");
var flash = require("connect-flash");
const http = require("http");
var cookieParser = require("cookie-parser");
var session = require("cookie-session");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const multer = require("multer");
const Blob = require("buffer").Blob;
const { Readable } = require("stream");
const { v4 } = require("uuid");
var philippines = require("philippines");

var regions = require("philippines/regions");
var provinces = require("philippines/provinces");
var cities = require("philippines/cities");

// const {Storage} = require('@google-cloud/storage');
// const storage = new Storage({
//   keyFilename: '/keyfile.json',
// });
const fs = require("fs");

// require("firebase/storage");

const bcrypt = require("bcrypt");

var app = express();
app.use(express.static(__dirname + "/public"));
// app.use(multer);

const upload = multer();

app.use(cookieParser());
app.use(
  session({
    secret: "key that will sign cookie",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(flash());

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.urlencoded({ extended: false }));

const port = process.env.PORT || 3000;
app.listen(port);
app.set("view engine", "ejs");

/* This is the code that connects the server to the firebase database. */
var admin = require("firebase-admin");
const { Console } = require("console");
const { query } = require("express");

// var serviceAccount = require("./pet-community.json");
// let serviceAccount;

if (process.env.GOOGLE_CREDENTIALS != null) {
  serviceAccount = JSON.parse(process.env.GOOGLE_CREDENTIALS);
} else {
  serviceAccount = require("./petcom-f839a-firebase-adminsdk-ocy8r-9dc531707d.json");
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });

const storage = admin.storage();

const useraccountcoll = db.collection("user_account");
const petlist = db.collection("pet_account");
const dataadoption = db.collection("adoptapet_data_record");
const adoption = db.collection("adoption_data");
const interviewsched = db.collection("interview_schedule");
const categories = db.collection("account_categories");
const patient = db.collection("pet_patient");
const donors_data = db.collection("pet_patient_donor");

const server = http.createServer((req, res) => {
  // console.log(req.url);

  res.setHeader("Content-Type", "text/html");
  let url1 = "./views/";

  if (req.url == "/") {
    url1 += "pages/index-main-page";
    res.statusCode = 200;
  } else if (req.url == "/index-registration-page") {
    url1 += "/index-registration-page";
    res.statusCode = 200;
  } else if (req.url == "/account-main-page") {
    url1 += "pages/accounts/account-main-page";
    res.statusCode = 200;
  } else if (req.url == "/account-profile-page") {
    url1 += "pages/accounts/account-profile-page";
    res.statusCode = 200;
  } else if (req.url == "/account-messages-page") {
    url1 += "pages/accounts/account-messages-page";
    res.statusCode = 200;
  } else if (req.url == "/account-notification-page") {
    url1 += "pages/accounts/account-notification-page";
    res.statusCode = 200;
  } else if (req.url == "/account-notification-viewform-page") {
    url1 += "pages/accounts/account-notification-viewform-page";
    res.statusCode = 200;
  } else if (req.url == "/account-notification-viewdonation-page") {
    url1 += "pages/accounts/account-notification-viewdonation-page";
    res.statusCode = 200;
  } else if (req.url == "/account-notification-interview-page") {
    url1 += "pages/accounts/account-notification-interview-page";
    res.statusCode = 200;
  } else if (req.url == "/account-edit-page") {
    url1 += "pages/accounts/account-edit-page";
    res.statusCode = 200;
  } else if (req.url == "/account-reports-page") {
    url1 += "pages/accounts/account-reports-page";
    res.statusCode = 200;
  } else if (req.url == "/petslist-filter-page") {
    url1 += "pages/accounts/petslist-filter-page";
    res.statusCode = 200;
  } else if (req.url == "/adoption-main-page") {
    url1 += "pages/adoption/adoption-main-page";
    res.statusCode = 200;
  } else if (req.url == "/adoption-petslist-page") {
    url1 += "pages/adoption/adoption-petslist-page";
    res.statusCode = 200;
  } else if (req.url == "/adoption-form-page") {
    url1 += "pages/adoption/adoption-form-page";
    res.statusCode = 200;
  } else if (req.url == "/adoption-petslist-petprofile-page") {
    url1 += "pages/adoption/adoption-petslist-petprofile-page";
    res.statusCode = 200;
  } else if (req.url == "/donor-main-page") {
    url1 += "pages/accounts/donor-main-page";
    res.statusCode = 200;
  } else if (req.url == "/donor-form-page") {
    url1 += "pages/accounts/donor-form-page";
    res.statusCode = 200;
  } else if (req.url == "/shelter-main-page") {
    url1 += "pages/accounts/shelter-main-page";
    res.statusCode = 200;
  } else if (req.url == "/shelter-profile-page") {
    url1 += "pages/accounts/shelter-profile-page";
    res.statusCode = 200;
  } else if (req.url == "/update-password-page") {
    url1 += "pages/accounts/update-password-page";
    res.statusCode = 200;
  } else if (req.url == "/pets-viewprofile-page") {
    url1 += "pages/pets/pets-viewprofile-page";
    res.statusCode = 200;
  } else if (req.url == "/index-login-page") {
    url1 += "/index-login-page";
    res.statusCode = 200;
    res.end();
  }
  fs.readFile(url1, (err, data) => {
    if (err) {
      console.log(err);
      res.end();
    } else {
      res.end(data);
    }
  });
});
app.get("/", async function (req, res) {
  const storagebucket = storage.bucket("gs://petcom-f839a.appspot.com");
  const listofpetforadoption = await petlist.get();

  let datapetlist = [];

  listofpetforadoption.docs.forEach(async (doc) => {
    const petData = doc.data();

    petData.id = doc.id;
    datapetlist.push(petData);
  });

  const getPetdetalUrls = datapetlist.map((petdetail) => {
    return new Promise((resolve, reject) => {
      //define imong date diri
      var date = new Date();
      date.setDate(date.getDate() + 1);

      const config = {
        action: "read",
        expires: date,
      };
      if (petdetail.pet_image) {
        const bucketfile = storagebucket.file(petdetail.pet_image);
        bucketfile
          .getSignedUrl(config)
          .then((data) => resolve({ ...petdetail, pet_image: data[0] }))
          .catch((err) => resolve(petdetail));
      } else {
        resolve(petdetail);
      }
    });
  });

  datapetlist = await Promise.all(getPetdetalUrls);

  let data = {
    url: req.url,
    pets_id: datapetlist,
  };

  res.render("pages/index-main-page", data);
});
app.get("/logout", (req, res) => {
  req.session = null;
  req.cookies.sessions = null;
  res.redirect("/");
});
app.get("/index-registration-page", async function (req, res) {
  const provinces = philippines.provinces;
  let data = {
    url: req.url,
    listofprovinces: provinces,
  };
  res.render("pages/index-registration-page", data);
});
app.get("/index-login-page", async (req, res) => {
  const registration = req.flash("accountcreated");
  const message = req.flash("loginerror");
  let data = {
    url: req.url,
    message,
    registration,
  };
  res.render("pages/index-login-page", data);
});
app.get("/update-password-page", async (req, res) => {
  let data = {
    url: req.url,
  };
  res.render("pages/accounts/update-password-page", data);
});
app.get("/account-main-page", async (req, res) => {
  console.log(req.flash("loginsuccess"));
  var cookiedata = req.cookies.sessions;
  var users = [];

  // Pending Forms
  const pendingadoption = await dataadoption
    .where("label", "==", "Adoption")
    .where("form_status", "==", "Pending")
    .where("form_id", "==", cookiedata)
    .orderBy("timestamp", "desc")
    .get();
  let adoptionform = [];
  pendingadoption.forEach(async (doc) => {
    var vals = doc.data();
    vals.id = doc.id;
    adoptionform.push(vals);
  });
  // Schedule for Interview Forms
  const scheduledadoption = await dataadoption
    .where("label", "==", "Adoption")
    .where("form_status", "==", "Schedule for Interview")
    .where("form_id", "==", cookiedata)
    .orderBy("timestamp", "desc")
    .get();
  let scheduledform = [];
  scheduledadoption.forEach(async (doc) => {
    var vals = doc.data();
    vals.id = doc.id;
    scheduledform.push(vals);
  });

  // Approved Forms
  const approvedadoption = await dataadoption
    .where("label", "==", "Adoption")
    .where("form_status", "==", "Already Adopted")
    .where("form_id", "==", cookiedata)
    .orderBy("timestamp", "desc")
    .get();
  let approvedform = [];
  approvedadoption.forEach(async (doc) => {
    var vals = doc.data();
    vals.id = doc.id;
    approvedform.push(vals);
  });

  // console.log(approvedform)
  // pet account list
  const listofpets = await petlist.get();
  let petlists = [];
  listofpets.forEach(async (doc) => {
    const vals = doc.data();
    vals.id = doc.id;
    petlists.push(vals);
  });
  // blood
  const blooddonation = await donors_data
    .where("session_id", "==", cookiedata)
    .orderBy("timestamp", "desc")
    .get();

  let pendingdonor = {};
  blooddonation.forEach(async (doc) => {
    const val = doc.data();
    const status = doc.data()["label"];
    if (!pendingdonor[status]) {
      pendingdonor[status] = [];
    }
    pendingdonor[status].push(val);
  });

  const useraccs = await useraccountcoll.get();
  let accounts = {};
  useraccs.forEach(async (doc) => {
    const val = doc.data();
    const id = doc.id;
    if (!accounts[id]) {
      accounts[id] = [];
    }
    accounts[id].push(val);
  });

  
  const donation = await dataadoption
    .where("label", "==", "Donation")
    .where("session_id", "==", cookiedata)
    .get();

  let mydonation = [];

  donation.forEach(async (doc) => {
    const val = doc.data();
    val.id = doc.id;
    mydonation.push(val);
  })

  // console.log(mydonation.length)

  const shelterdonation = await dataadoption
    .where("shelter_id", "==", cookiedata)
    .get();
  let shelter = {};
  shelterdonation.forEach(async (doc) => {
    const val = doc.data();
    val.id = doc.id;
    const status = doc.data()["status"];
    if (!shelter[status]) {
      shelter[status] = [];
    }
    shelter[status].push(val);
  });

  // console.log(shelter['Pending'])

  // for(var index = 0; index < shelter['Pending'].length; index++){

  //   console.log(shelter['Pending'][index]['session_id'])
  // }

  // account list
  const listofaccount = await useraccountcoll.get();
  listofaccount.forEach(async (doc) => {
    const user = doc.data();

    user.id = doc.id;
    users.push(user);
  });
  let data = {
    url: req.url,
    user_id: cookiedata,
    user_account: users,
    petlists,
    accounts,
    adoptionform,
    scheduledform,
    approvedform,
    pendingdonor,
    shelter,

    mydonation,
  };
  res.render("pages/accounts/account-main-page", data);
});
app.get("/account-profile-page", async (req, res) => {
  var cookiedata = req.cookies.sessions;
  const listofaccount = await useraccountcoll.get();
  const listofcategories = await categories.get();

  let accounts = [];
  let category = [];

  listofaccount.forEach(async (doc) => {
    const listofaccounts = doc.data();
    listofaccounts.id = doc.id;
    accounts.push(listofaccounts);
  });

  listofcategories.forEach(async (doc) => {
    const listofcat = doc.data();
    listofcat.id = doc.id;
    category.push(listofcat);
  });

  let data = {
    url: req.url,
    user_id: cookiedata,
    user_account: accounts,
    categories: category,
  };
  res.render("pages/accounts/account-profile-page", data);
});
app.get("/account-messages-page", async (req, res) => {
  var cookiedata = req.cookies.sessions;
  var users = [];
  const listofaccount = await useraccountcoll.get();
  listofaccount.forEach(async (doc) => {
    const user = doc.data();

    user.id = doc.id;
    users.push(user);
  });

  let data = {
    url: req.url,
    user_id: cookiedata,
    user_account: users,
  };
  res.render("pages/accounts/account-messages-page", data);
});
app.get("/account-notification-page", async (req, res) => {
  var cookiedata = req.cookies.sessions;

  const adopt_notification = await dataadoption.get();
  const pet_notification = await petlist.get();
  const account_notification = await useraccountcoll.get();

  let accounts = [];
  let notification = [];
  let pets = [];

  account_notification.forEach(async (doc) => {
    const listofaccounts = doc.data();
    listofaccounts.id = doc.id;
    accounts.push(listofaccounts);
  });

  adopt_notification.forEach(async (doc) => {
    const listofnotif = doc.data();
    listofnotif.id = doc.id;
    notification.push(listofnotif);
  });

  pet_notification.forEach(async (doc) => {
    const listofpet = doc.data();
    listofpet.id = doc.id;
    pets.push(listofpet);
  });

  let data = {
    url: req.url,
    user_account: accounts,
    trans_id: notification,
    pets_id: pets,
    user_id: cookiedata,
  };
  res.render("pages/accounts/account-notification-page", data);
});
app.get("/account-notification-viewform-page", async (req, res) => {
  var cookiedata = req.cookies.sessions;
  const account_notification = await useraccountcoll.get();

  const adopt_notification = await dataadoption
    .where("label", "==", "Adoption")
    .get();

  const interview_sched = await interviewsched.get();
  const pet_account = await petlist.get();

  var cookieform = req.cookies.viewform;
  let notification = [];
  let accounts = [];
  let listinterview = [];
  let pets = [];

  account_notification.forEach(async (doc) => {
    const listofaccounts = doc.data();
    listofaccounts.id = doc.id;
    accounts.push(listofaccounts);
  });

  adopt_notification.forEach(async (doc) => {
    const listofnotif = doc.data();
    listofnotif.id = doc.id;
    notification.push(listofnotif);
  });

  interview_sched.forEach(async (doc) => {
    const interview = doc.data();
    interview.id = doc.id;
    listinterview.push(interview);
  });

  pet_account.forEach(async (doc) => {
    const listofpets = doc.data();
    listofpets.id = doc.id;
    pets.push(listofpets);
  });

  console.log(pets);

  let check = [];

  const record = await interviewsched
    .where("adoptapet_data_record_ID", "==", cookieform)
    .where("shelter_id", "==", cookiedata)
    .limit(1)
    .get();

  record.forEach(async (docs) => {
    const val = docs.data();
    check.push(val);
  });

  // console.log(record.size);

  // const result = check.find(findForm)

  // console.log(findForm['item'])
  // if(!result){
  //   console.log("not");
  // }else{
  //   console.log("yes")
  // }

  // if(record.size == 0){
  //   console.log("not")
  // }else{
  //   console.log("exist")
  // }

  let data = {
    url: req.url,
    trans_id: notification,
    form: cookieform,
    user_id: cookiedata,
    user_account: accounts,
    interview: listinterview,
    pets_id: pets,
    datacheck: record,
  };
  res.render("pages/accounts/account-notification-viewform-page", data);
});
// app.get("/account-notification-interview-page", async (req, res) => {
//   var cookieform = req.cookies.scheduleinterview;
//   const dbInterview = await interviewsched.get();

//   var cookiedata = req.cookies.sessions;
//   var cookieschedule = req.cookies.scheduleinterview;
//   const account_notification = await useraccountcoll.get();
//   const adopt_notification = await dataadoption.get();
//   const pet_account = await petlist.get();

//   let notification = [];
//   let accounts = [];
//   let interview = [];
//   let pets = [];

//   account_notification.forEach(async (doc) => {
//     const listofaccounts = doc.data();
//     listofaccounts.id = doc.id;
//     accounts.push(listofaccounts);
//   });

//   adopt_notification.forEach(async (doc) => {
//     const listofnotif = doc.data();
//     listofnotif.id = doc.id;
//     notification.push(listofnotif);
//   });

//   dbInterview.forEach(async (doc) => {
//     const listofinterview = doc.data();
//     listofinterview.id = doc.id;
//     interview.push(listofinterview);
//   });

//   pet_account.forEach(async (doc) => {
//     const listofpets = doc.data();
//     listofpets.id = doc.id;
//     pets.push(listofpets);
//   });

//   let data = {
//     url: req.url,
//     trans_id: notification,
//     form: cookieform,
//     user_id: cookiedata,
//     user_account: accounts,
//     cookieschedule: cookieschedule,
//     dbinterview : interview,
//     pets_id : pets,
//   };
//   res.render("pages/notification/account-notification-interview-page", data);
// });
app.get("/account-notification-viewdonation-page", async (req, res) => {
  var cookiedata = req.cookies.sessions;
  const data_list = await dataadoption.get();
  const account_list = await useraccountcoll.get();
  var cookieid = req.cookies.viewdonation;

  let notif = [];
  let accounts = [];

  data_list.forEach(async (doc) => {
    const donorlist = doc.data();
    donorlist.id = doc.id;
    notif.push(donorlist);
  });

  account_list.forEach(async (doc) => {
    const acc = doc.data();
    acc.id = doc.id;
    accounts.push(acc);
  });

  let data = {
    url: req.url,
    trans_id: notif,
    user_account: accounts,
    sessionid: cookieid,
    user_id: cookiedata,
  };
  res.render("pages/accounts/account-notification-viewdonation-page", data);
});
app.get("/account-edit-page", async function (req, res) {
  var cookiedata = req.cookies.sessions;
  var users = [];
  const listofaccount = await useraccountcoll.get();
  listofaccount.forEach(async (doc) => {
    const user = doc.data();

    user.id = doc.id;
    users.push(user);
  });

  let data = {
    url: req.url,
    user_id: cookiedata,
    user_account: users,
  };

  res.render("pages/accounts/account-edit-page", data);
});
app.get("/adoption-main-page", async (req, res) => {
  const storagebucket = storage.bucket("gs://petcom-f839a.appspot.com");
  const listofpetforadoption = await petlist.get();

  var cookiedata = req.cookies.sessions;
  var users = [];
  const listofaccount = await useraccountcoll.get();
  listofaccount.forEach(async (doc) => {
    const user = doc.data();

    user.id = doc.id;
    users.push(user);
  });

  let datapetlist = [];

  listofpetforadoption.docs.forEach(async (doc) => {
    const petData = doc.data();

    petData.id = doc.id;
    datapetlist.push(petData);
  });

  const getPetdetalUrls = datapetlist.map((petdetail) => {
    return new Promise((resolve, reject) => {
      //define imong date diri
      var date = new Date();
      date.setDate(date.getDate() + 1);

      const config = {
        action: "read",
        expires: date,
      };
      if (petdetail.pet_image) {
        const bucketfile = storagebucket.file(petdetail.pet_image);
        bucketfile
          .getSignedUrl(config)
          .then((data) => resolve({ ...petdetail, pet_image: data[0] }))
          .catch((err) => resolve(petdetail));
      } else {
        resolve(petdetail);
      }
    });
  });

  datapetlist = await Promise.all(getPetdetalUrls);
  console.log(datapetlist);

  let data = {
    url: req.url,
    pets_id: datapetlist,
    user_id: cookiedata,
    user_account: users,
  };

  res.render("pages/adoption/adoption-main-page", data);
});
app.get("/adoption-petslist-page", async function (req, res) {
  const storagebucket = storage.bucket("gs://petcom-f839a.appspot.com");
  var cookiedata = req.cookies.sessions;

  const listofpetforadoption = await petlist.get();

  const listofaccount = await useraccountcoll.get();

  var users = [];
  let datapetlist = [];

  listofaccount.forEach(async (doc) => {
    const user = doc.data();

    user.id = doc.id;
    users.push(user);
  });

  listofpetforadoption.docs.forEach(async (doc) => {
    const petData = doc.data();

    petData.id = doc.id;
    datapetlist.push(petData);
  });

  const getPetdetalUrls = datapetlist.map((petdetail) => {
    return new Promise((resolve, reject) => {
      //define imong date diri
      var date = new Date();
      date.setDate(date.getDate() + 1);

      const config = {
        action: "read",
        expires: date,
      };
      if (petdetail.pet_image) {
        const bucketfile = storagebucket.file(petdetail.pet_image);
        bucketfile
          .getSignedUrl(config)
          .then((data) => resolve({ ...petdetail, pet_image: data[0] }))
          .catch((err) => resolve(petdetail));
      } else {
        resolve(petdetail);
      }
    });
  });

  datapetlist = await Promise.all(getPetdetalUrls);
  // console.log(datapetlist);

  let data = {
    url: req.url,
    pets_id: datapetlist,
    user_id: cookiedata,
    user_account: users,
  };

  res.render("pages/adoption/adoption-petslist-page", data);
});
app.get("/account-reports-page", async (req, res) => {
  const timeElapsed = Date.now();
  const today = new Date(timeElapsed);
  const date = today.toDateString();

  // console.log(today);

  var datashelterrecords = [];
  var users = [];
  let sort = [];
  let desc = [];
  let ascdonor_type = [];
  let descdonor_type = [];

  let id = [];

  var shelterrecords = await dataadoption.get();
  var useracc = await useraccountcoll.get();

  var cookiedata = req.cookies.sessions;

  useracc.forEach(async (doc) => {
    const user = doc.data();

    user.id = doc.id;
    users.push(user);
  });
  shelterrecords.forEach(async (doc) => {
    const adoptionData = doc.data();

    adoptionData.id = doc.id;
    datashelterrecords.push(adoptionData);
  });

  const ascdonor = await dataadoption
    .where("shelter_id", "==", cookiedata)
    .where("status", "==", "Received")
    .where("label", "==", "Donation")
    .orderBy("donor_type", "asc")
    .get();
  const descdonor = await dataadoption
    .where("shelter_id", "==", cookiedata)
    .where("status", "==", "Received")
    .where("label", "==", "Donation")
    .orderBy("donor_type", "desc")
    .get();

  const idSort = await dataadoption
    .where("shelter_id", "==", cookiedata)
    .where("status", "==", "Received")
    .where("label", "==", "Donation")
    .get();

  const as = await dataadoption
    .where("shelter_id", "==", cookiedata)
    .where("status", "==", "Received")
    .where("label", "==", "Donation")
    .orderBy("timestamp", "asc")
    .get();
  const des = await dataadoption
    .where("shelter_id", "==", cookiedata)
    .where("status", "==", "Received")
    .where("label", "==", "Donation")
    .orderBy("timestamp", "desc")
    .get();

  // Type of Donation
  ascdonor.forEach(async (doc) => {
    const sorting = doc.data();
    if (
      doc.data()["donor_dogbrand"] == "None of the Above" &&
      doc.data()["donor_type"] == "Dog Food"
    ) {
      sorting.itemname = doc.data()["donor_dognewbrand"];
    }
    if (
      doc.data()["donor_catbrand"] == "None of the Above" &&
      doc.data()["donor_type"] == "Cat Food"
    ) {
      sorting.itemname = doc.data()["donor_catnewbrand"];
    }
    sorting.id = doc.id;
    ascdonor_type.push(sorting);
  });
  descdonor.forEach(async (doc) => {
    const sorting = doc.data();
    if (
      doc.data()["donor_dogbrand"] == "None of the Above" &&
      doc.data()["donor_type"] == "Dog Food"
    ) {
      sorting.itemname = doc.data()["donor_dognewbrand"];
    }
    if (
      doc.data()["donor_catbrand"] == "None of the Above" &&
      doc.data()["donor_type"] == "Cat Food"
    ) {
      sorting.itemname = doc.data()["donor_catnewbrand"];
    }
    sorting.id = doc.id;
    descdonor_type.push(sorting);
  });

  // Sessionsort
  idSort.forEach(async (doc) => {
    const sorting = doc.data();
    sorting.id = doc.id;
    id.push(sorting);
  });

  // timestamp
  as.forEach(async (doc) => {
    const sorting = doc.data();
    sorting.id = doc.id;
    sort.push(sorting);
  });

  // console.log(sort)

  des.forEach(async (doc) => {
    const sorting = doc.data();
    sorting.id = doc.id;
    desc.push(sorting);
  });

  // Date now

  //Dashboard Data's
  let dashboarddata = [];

  const dashboard_data = await dataadoption
    .where("shelter_id", "==", cookiedata)
    .where("label", "==", "Donation")
    .where("status", "==", "Received")
    .orderBy("timestamp", "desc")
    .get();

  dashboard_data.forEach(async (doc) => {
    const sorting = doc.data();
    const newtime = new Date(doc.data()["timestamp"]);
    sorting.newtime = newtime.toDateString();

    sorting.id = doc.id;
    dashboarddata.push(sorting);
  });

  


  let dogfoodtype = {};
  let catfoodtype = {};
  let vitaminstype = {};
  let dewormtype = {};
  let leashtype = {};
  let cagetype = {};
  let chewtype = {};
  let cash = [];

  // Dogfood Inventory
  const dftype = await dataadoption
    .where("shelter_id", "==", cookiedata)
    .where("status", "==", "Received")
    .where("label", "==", "Donation")
    .get();

  const otherstype = await dataadoption
    .where("shelter_id", "==", cookiedata)
    .where("status", "==", "Received")
    .where("label", "==", "Donation")
    .where("donor_label", "==", "Other Donation")
    .get();

  dftype.forEach((doc) => {
    const val = doc.data();
    const dtype = doc.data()["donor_dogbrand"];
    if (!dogfoodtype[dtype]) {
      dogfoodtype[dtype] = [];
    }
    dogfoodtype[dtype].push(val);
  });

  let otherlabel = {};

  otherstype.forEach((doc) => {
    const val = doc.data();
    const label = doc.data()["donor_type"];
    if (!otherlabel[label]) {
      otherlabel[label] = [];
    }
    otherlabel[label].push(val);
  });

  // console.log(otherlabel)

  dftype.forEach((doc) => {
    const val = doc.data();
    const ctype = doc.data()["donor_catbrand"];
    if (!catfoodtype[ctype]) {
      catfoodtype[ctype] = [];
    }
    catfoodtype[ctype].push(val);
  });

  dftype.forEach((doc) => {
    const val = doc.data();
    const vtype = doc.data()["donor_typeofvitamin"];
    if (!vitaminstype[vtype]) {
      vitaminstype[vtype] = [];
    }
    vitaminstype[vtype].push(val);
  });

  dftype.forEach((doc) => {
    const val = doc.data();
    const detype = doc.data()["donor_typeofdewormer"];
    if (!dewormtype[detype]) {
      dewormtype[detype] = [];
    }
    dewormtype[detype].push(val);
  });

  dftype.forEach((doc) => {
    const val = doc.data();
    const vtype = doc.data()["donor_leash"];
    if (!leashtype[vtype]) {
      leashtype[vtype] = [];
    }
    leashtype[vtype].push(val);
  });

  dftype.forEach((doc) => {
    const val = doc.data();
    const vtype = doc.data()["donor_chewtoy"];
    if (!chewtype[vtype]) {
      chewtype[vtype] = [];
    }
    chewtype[vtype].push(val);
  });

  dftype.forEach((doc) => {
    const val = doc.data();
    const vtype = doc.data()["donor_cage"];
    if (!cagetype[vtype]) {
      cagetype[vtype] = [];
    }
    cagetype[vtype].push(val);
  });
  const fetchcash = await dataadoption
    .where("shelter_id", "==", cookiedata)
    .where("label", "==", "Donation")
    .where("status", "==", "Received")
    .where("donor_type", "==", "Cash Donation")
    .get();

  fetchcash.forEach(async (doc) => {
    const fetchval = doc.data();
    fetchval.id = doc.id;
    cash.push(fetchval);
  });

  // console.log(sort.length)

  let data = {
    url: req.url,
    trans_id: datashelterrecords,
    user_account: users,
    user_id: cookiedata,
    ascdonor_type,
    descdonor_type,
    sort: sort,
    desc: desc,
    date,
    dashboarddata,
    dogfoodtype,
    catfoodtype,
    vitaminstype,
    dewormtype,
    leashtype,
    cagetype,
    chewtype,
    cash,
    otherlabel,
  };
  res.render("pages/accounts/account-reports-page", data);
});

// Observe
app.get("/listapet-main-page", async (req, res) => {
  const listofaccount = await useraccountcoll.get();
  var sessioncookie = req.cookies.sessions;

  var users = [];
  listofaccount.forEach(async (doc) => {
    const user = doc.data();

    user.id = doc.id;
    users.push(user);
  });

  let data = {
    url: req.url,
    user_account: users,
    user_id: sessioncookie,
  };
  res.render("pages/accounts/listapet-main-page", data);
});

// Observe

app.get("/petslist-filter-page", async (req, res) => {
  var cookiedata = req.cookies.sessions;
  const storagebucket = storage.bucket("gs://petcom-f839a.appspot.com");
  const listofpetfodadoption = await petlist
    .where("session_id", "==", cookiedata)
    .get();

  const provinces = philippines.provinces;

  let datapetlist = [];
  const pending = {};
  var users = [];
  const listofaccount = await useraccountcoll.get();

  // for(var index = 0; index < provinces.length; index++){
  //   console.log(provinces[index]['name']);
  // }

  listofaccount.forEach(async (doc) => {
    const user = doc.data();

    user.id = doc.id;
    users.push(user);
  });

  listofpetfodadoption.forEach(async (doc) => {
    const petData = doc.data();
    const label = doc.data()["pet_status"];
    if (!pending[label]) {
      pending[label] = [];
    }

    pending[label].push(petData);
  });

  //
  const donor = {};
  listofpetfodadoption.forEach(async (doc) => {
    const petData = doc.data();
    const label = doc.data()["pet_label"];
    if (!donor[label]) {
      donor[label] = [];
    }

    donor[label].push(petData);
  });


  listofpetfodadoption.docs.forEach(async (doc) => {
    const petData = doc.data();
    petData.id = doc.id;
    datapetlist.push(petData);
  });

  const getPetdetalUrls = datapetlist.map((petdetail) => {
    return new Promise((resolve, reject) => {
      //define imong date diri
      var date = new Date();
      date.setDate(date.getDate() + 1);

      const config = {
        action: "read",
        expires: date,
      };
      if (petdetail.pet_image) {
        const bucketfile = storagebucket.file(petdetail.pet_image);
        bucketfile
          .getSignedUrl(config)
          .then((data) => resolve({ ...petdetail, pet_image: data[0] }))
          .catch((err) => resolve(petdetail));
      } else {
        resolve(petdetail);
      }
    });
  });

  datapetlist = await Promise.all(getPetdetalUrls);

  // let getdonorPetdetalUrls = donor.map((petdetail) => {
  //   return new Promise((resolve, reject) => {
  //     //define imong date diri
  //     var date = new Date();
  //     date.setDate(date.getDate() + 1);

  //     const config = {
  //       action: "read",
  //       expires: date,
  //     };
  //     if (petdetail.pet_image) {
  //       const bucketfile = storagebucket.file(petdetail.pet_image);
  //       bucketfile
  //         .getSignedUrl(config)
  //         .then((data) => resolve({ ...petdetail, pet_image: data[0] }))
  //         .catch((err) => resolve(petdetail));
  //     } else {
  //       resolve(petdetail);
  //     }
  //   });
  // });
  // console.log(donor['Donor'])
  // donor = await Promise.all(getdonorPetdetalUrls);



  let data = {
    url: req.url,
    pets_id: datapetlist,
    user_id: cookiedata,
    user_account: users,
    listofprovinces: provinces,

    pending,
    donor,
  };
  res.render("pages/accounts/petslist-filter-page", data);
});
app.get("/donor-main-page", async function (req, res) {
  var cookiedata = req.cookies.sessions;
  const listofpetforadoption = await petlist.get();
  // const pet_patient = await patient.get();

  const provinces = philippines.provinces;

  // console.log(provinces.length)

  const storagebucket = storage.bucket("gs://petcom-f839a.appspot.com");
  const listofpets = await petlist.orderBy("timestamp", "desc").get();

  let datapetlist = [];
  var users = [];
  const listofaccount = await useraccountcoll.get();
  listofaccount.forEach(async (doc) => {
    const user = doc.data();

    user.id = doc.id;
    users.push(user);
  });

  const listofdonors = await donors_data
    .where("session_id", "==", cookiedata)
    .orderBy("timestamp", "desc")
    .get();

  let donors = [];
  listofdonors.forEach(async (doc) => {
    const val = doc.data();
    val.id = doc.id;
    donors.push(val);
  });

  // console.log(donors)

  const listofpatient = await patient.orderBy("timestamp", "desc").get();

  //
  // const fetchPatient = [];
  // listofpatient.forEach(async (doc) => {
  //   const patient = doc.data();
  //   const city = patient['vetcity'];
  //   const patientDataIndex = fetchPatient.findIndex((patientData) => patientData.city == city);

  //   if(patientDataIndex < 0){
  //     const patientData = {
  //       city: city,
  //       patientData: [patient],
  //     };
  //     fetchPatient.push(patientData);
  //   }else{
  //     fetchPatient[patientDataIndex].patientData.push(patientData);
  //   }
  // });

  // for(var index = 0; index < fetchPatient.length; index++){

  //   console.log(fetchPatient[index])
  // }

  //

  // console.log(listofpatient)
  let fetchallpatient = [];
  let fetchpatient = {};

  listofpatient.forEach(async (doc) => {
    const patient = doc.data();
    const city = doc.data()["vetcity"];
    if (!fetchpatient[city]) {
      fetchpatient[city] = [];
    }

    fetchpatient[city].push(patient);
  });

  listofpets.forEach(async (doc) => {
    const patient = doc.data();
    patient.id = doc.id;
    fetchallpatient.push(patient);
  });
  // console.log(fetchallpatient)
  const getPetpatientUrls = fetchallpatient.map((petdetail) => {
    return new Promise((resolve, reject) => {
      //define imong date diri
      var date = new Date();
      date.setDate(date.getDate() + 1);

      const config = {
        action: "read",
        expires: date,
      };
      if (petdetail.pet_image) {
        const bucketfile = storagebucket.file(petdetail.pet_image);
        bucketfile
          .getSignedUrl(config)
          .then((data) => resolve({ ...petdetail, pet_image: data[0] }))
          .catch((err) => resolve(petdetail));
      } else {
        resolve(petdetail);
      }
    });
  });
  fetchallpatient = await Promise.all(getPetpatientUrls);

  listofpets.docs.forEach(async (doc) => {
    const petData = doc.data();

    petData.id = doc.id;
    datapetlist.push(petData);
  });

  const getPetdetalUrls = datapetlist.map((petdetail) => {
    return new Promise((resolve, reject) => {
      //define imong date diri
      var date = new Date();
      date.setDate(date.getDate() + 1);

      const config = {
        action: "read",
        expires: date,
      };
      if (petdetail.pet_image) {
        const bucketfile = storagebucket.file(petdetail.pet_image);
        bucketfile
          .getSignedUrl(config)
          .then((data) => resolve({ ...petdetail, pet_image: data[0] }))
          .catch((err) => resolve(petdetail));
      } else {
        resolve(petdetail);
      }
    });
  });
  datapetlist = await Promise.all(getPetdetalUrls);

  // pet_label = session_id
  let fetchpets = [];
  const listofmypets = await petlist
    .where("session_id", "==", cookiedata)
    .where("pet_label", "==", "Donor")
    .orderBy("timestamp", "desc")
    .get();

  listofmypets.forEach(async (doc) => {
    const data = doc.data();
    data.id = doc.id;
    fetchpets.push(data);
  });

  // for(var index =0; index < fetchallpatient.length; index++){
  //   console.log(fetchallpatient[index]['id'])

  // }

  // res.send(fetchPatient);

  let data = {
    url: req.url,
    pet_id: datapetlist,
    user_id: cookiedata,
    user_account: users,
    listofprovinces: provinces,
    fetchallpatient,
    fetchpatient,

    //pets = donors
    fetchpets,

    //
    // fetchPatient,
    donors,
  };
  res.render("pages/accounts/donor-main-page", data);
});
app.get("/donor-form-page", async (req, res) => {
  const storagebucket = storage.bucket("gs://petcom-f839a.appspot.com");
  var cookiedata = req.cookies.sessions;
  var patientid = req.cookies.patient_id;

  let donors = [];

  const listofdonors = await donors_data.orderBy("timestamp", "desc").get();

  listofdonors.forEach(async (doc) => {
    const val = doc.data();
    val.id = doc.id;
    donors.push(val);
  });

  // console.log(donors)

  // for(var index = 0; index < donors.length; index++){
  //   console.log(donors[index]['patient_id'] );
  // }

  var users = [];

  const listofaccount = await useraccountcoll.get();
  listofaccount.forEach(async (doc) => {
    const user = doc.data();

    user.id = doc.id;
    users.push(user);
  });

  let fetchallpatient = [];
  let fetchpet = [];

  const listofpets = await patient
    .where("user_session", "==", cookiedata)
    .get();

  listofpets.forEach(async (doc) => {
    const val = doc.data();
    val.id = doc.id;
    fetchpet.push(val);
  });
  // console.log(fetchpet.length)

  // const fetchpatient = await patient
  //   .where("id","==",patientid)
  //   .orderBy("timestamp", "desc")
  //   .get();

  const listofpatient = await petlist.orderBy("timestamp", "desc").get();

  // let idpatient = [];

  // listofpatient.forEach(async (doc) => {
  //   const val = doc.data();
  //   val.id = doc.id
  //   idpatient.push(val);
  // });

  //   console.log(idpatient)

  // const val = doc.data();
  // const dtype = doc.data()["donor_dogbrand"];
  // if (!dogfoodtype[dtype]) {
  //   dogfoodtype[dtype] = [];
  // }
  // dogfoodtype[dtype].push(val);

  listofpatient.forEach(async (doc) => {
    const patient = doc.data();
    patient.id = doc.id;
    fetchallpatient.push(patient);
  });
  // console.log(fetchallpatient)

  const getPetpatientUrls = fetchallpatient.map((petdetail) => {
    return new Promise((resolve, reject) => {
      //define imong date diri
      var date = new Date();
      date.setDate(date.getDate() + 1);

      const config = {
        action: "read",
        expires: date,
      };
      if (petdetail.pet_image) {
        const bucketfile = storagebucket.file(petdetail.pet_image);
        bucketfile
          .getSignedUrl(config)
          .then((data) => resolve({ ...petdetail, pet_image: data[0] }))
          .catch((err) => resolve(petdetail));
      } else {
        resolve(petdetail);
      }
    });
  });
  fetchallpatient = await Promise.all(getPetpatientUrls);

  // console.log(fetchallpatient)

  // fetch pets
  let fetchpets = [];
  const listofmypets = await petlist
    .where("session_id", "==", cookiedata)
    .where("pet_label", "==", "Donor")
    .orderBy("timestamp", "desc")
    .get();

  listofmypets.forEach(async (doc) => {
    const data = doc.data();
    data.id = doc.id;
    fetchpets.push(data);
  });

  let petaccount = [];

  const pets = await petlist.get();
  pets.forEach(async (doc) => {
    const val = doc.data();
    val.id = doc.id;
    petaccount.push(val);
  });

  let data = {
    url: req.url,
    user_account: users,
    user_id: cookiedata,
    pet_id: petaccount,
    fetchpets,

    fetchallpatient,
    patientid,

    // donors
    donors,
    fetchpet,
  };
  res.render("pages/accounts/donor-form-page", data);
});
app.get("/shelter-main-page", async function (req, res) {
  var cookiedata = req.cookies.sessions;
  var users = [];

  const listofaccount = await useraccountcoll.get();

  listofaccount.forEach(async (doc) => {
    const user = doc.data();

    user.id = doc.id;
    users.push(user);
  });
  let data = {
    url: req.url,
    user_id: cookiedata,
    user_account: users,
  };
  res.render("pages/accounts/shelter-main-page", data);
});
app.get("/shelter-profile-page", async function (req, res) {
  var cookiedata = req.cookies.viewprofile;
  var session = req.cookies.sessions;
  var users = [];

  const listofaccount = await useraccountcoll.get();

  listofaccount.forEach(async (doc) => {
    const user = doc.data();

    user.id = doc.id;
    users.push(user);
  });

  // console.log(cookiedata, session)

  let data = {
    url: req.url,
    view_profile: cookiedata,
    user_account: users,
    user_id: session,
  };
  res.render("pages/accounts/shelter-profile-page", data);
});
app.get("/adoption-petslist-petprofile-page", async (req, res) => {
  const storagebucket = storage.bucket("gs://petcom-f839a.appspot.com");

  var petprofile = req.cookies.petprofile;
  const petaccount = await petlist.get();

  let datapetlist = [];
  var users = [];
  const listofaccount = await useraccountcoll.get();
  listofaccount.forEach(async (doc) => {
    const user = doc.data();

    user.id = doc.id;
    users.push(user);
  });

  petaccount.docs.forEach(async (doc) => {
    const petData = doc.data();

    petData.id = doc.id;
    datapetlist.push(petData);
  });

  const getPetdetalUrls = datapetlist.map((petdetail) => {
    return new Promise((resolve, reject) => {
      //define imong date diri
      var date = new Date();
      date.setDate(date.getDate() + 1);

      const config = {
        action: "read",
        expires: date,
      };
      if (petdetail.pet_image) {
        const bucketfile = storagebucket.file(petdetail.pet_image);
        bucketfile
          .getSignedUrl(config)
          .then((data) => resolve({ ...petdetail, pet_image: data[0] }))
          .catch((err) => resolve(petdetail));
      } else {
        resolve(petdetail);
      }
    });
  });

  datapetlist = await Promise.all(getPetdetalUrls);
  // console.log(datapetlist);

  var cookieuser = req.cookies.sessions;

  let data = {
    url: req.url,
    pets_id: datapetlist,
    petprofile: petprofile,
    user_id: cookieuser,
    user_account: users,
  };
  res.render("pages/adoption/adoption-petslist-petprofile-page", data);
});
app.get("/adoption-form-page", async (req, res) => {
  var accounts = await useraccountcoll.get();

  let listofaccounts = [];
  let listofpets = [];

  accounts.docs.forEach(async (doc) => {
    const accounts = doc.data();

    accounts.id = doc.id;
    listofaccounts.push(accounts);
  });

  var cookiedata = req.cookies.sessions;

  let data = {
    url: req.url,
    user_account: listofaccounts,
    user_id: cookiedata,
  };
  res.render("pages/adoption/adoption-form-page", data);
});
app.get("/pets-viewprofile-page", async function (req, res) {
  const storagebucket = storage.bucket("gs://petcom-f839a.appspot.com");
  var session = req.cookies.sessions;
  var petsession = req.cookies.viewpetprofile;
  var users = [];
  var pets = [];

  const listofaccount = await useraccountcoll.get();
  const listofpets = await petlist.get();

  const donorlist = await donors_data
    .where("donor_id", "==", petsession)
    .where("label", "==", "Approved")
    .get();

  var donor_list = [];
  donorlist.forEach(async (doc) => {
    const val = doc.data();
    val.id = doc.id;
    donor_list.push(val);
  });

  // let otherlabel = {};

  // otherstype.forEach((doc) => {
  //   const val = doc.data();
  //   const label = doc.data()["donor_type"];
  //   if (!otherlabel[label]) {
  //     otherlabel[label] = [];
  //   }
  //   otherlabel[label].push(val);
  // });

  let fetchdonor = {};

  const fetchDonor = await donors_data
    .where("patient_id", "==", petsession)
    .get();

  fetchDonor.forEach((doc) => {
    const val = doc.data();
    const label = doc.data()["label"];
    val.id = doc.id;
    if (!fetchdonor[label]) {
      fetchdonor[label] = [];
    }
    fetchdonor[label].push(val);
  });

  // console.log(fetchdonor)

  listofaccount.forEach(async (doc) => {
    const user = doc.data();

    user.id = doc.id;
    users.push(user);
  });
  listofpets.forEach(async (doc) => {
    const pet = doc.data();

    pet.id = doc.id;
    pets.push(pet);
  });

  const getPetdetalUrls = pets.map((petdetail) => {
    return new Promise((resolve, reject) => {
      //define imong date diri
      var date = new Date();
      date.setDate(date.getDate() + 1);

      const config = {
        action: "read",
        expires: date,
      };
      if (petdetail.pet_image) {
        const bucketfile = storagebucket.file(petdetail.pet_image);
        bucketfile
          .getSignedUrl(config)
          .then((data) => resolve({ ...petdetail, pet_image: data[0] }))
          .catch((err) => resolve(petdetail));
      } else {
        resolve(petdetail);
      }
    });
  });

  pets = await Promise.all(getPetdetalUrls);

  let data = {
    url: req.url,
    user_account: users,
    petlist: pets,
    petprofile: petsession,
    user_id: session,
    donor_list,
    fetchdonor,
  };
  res.render("pages/pets/pets-viewprofile-page", data);
});
// POST

app.post("/loginform", async (req, res) => {
  var dateandtime = new Date();
  var email = req.body.emailinput;
  var password = req.body.passwordinput;

  const useracc = await useraccountcoll
    .where("user_email", "==", email)
    .limit(1)
    .get();

  if (useracc.size == 0) {
    req.flash("loginerror", "Invalid email or password!");

    return res.redirect("/index-login-page");
  }

  const doc_id = useracc.docs[0].id;
  const doc = useracc.docs[0].data();

  const matchPassword = await bcrypt.compare(password, doc["user_password"]);
  if (!matchPassword) {
    req.flash("loginerror", "Invalid email or password!");
    return res.redirect("/index-login-page");
  }

  db.collection("sessions")
    .add({
      timestamp: dateandtime,
      email: email,
      session_id: doc_id,
    })
    .then(() => {
      console.log("Session added successfully");
    })
    .catch((error) => {
      console.error("Error", error);
    });
  res.set("Set-Cookie", `sessions=${doc_id}`);
  req.flash("loginsuccess", "Logging in!");
  res.redirect("/account-main-page");
});
app.post("/updateprofileform", async (req, res) => {
  const listofaccount = await useraccountcoll.get();
  var cookiedata = req.cookies.sessions;

  listofaccount.forEach((doc) => {
    try {
      if (cookiedata == doc.data()["user_email"]) {
        // console.log("hello");
        var firstname = req.body.addfirstname;
        var address = req.body.addaddress;
        var contact = req.body.addcontact;

        // var first_name = doc.data()["user_first_name"];
        var first_name = db.collection("user_account").doc();

        db.collection("user_account")
          .doc(doc.id)
          .update({
            user_first_name: firstname,
            user_address: address,
            user_contact: contact,
          })
          .then(function () {
            console.log("updated");
          });
        res.redirect("/account-profile-page");
      }
    } catch {
      console.log("error update");
      res.redirect("/account-edit-page");
    }
  });
});
app.post("/registrationform", async (req, res) => {
  try {
    // var apassword = req.body.addpass;
    var acctype = req.body.data_selected;
    var apassword = await bcrypt.hash(req.body.addpass, 10);
    var afirstname = req.body.addfirstname;
    var alastname = req.body.addlastname;
    var acontact = req.body.addcontact;
    var aaddress = req.body.addaddress;
    var aemail = req.body.addemail;
    var accCity = req.body.accountcity;

    db.collection("user_account")
      .add({
        user_first_name: afirstname,
        user_last_name: alastname,
        user_contact: acontact,
        user_address: aaddress,
        user_email: aemail,
        user_password: apassword,
        user_type: acctype,
        user_city: accCity,
      })
      .then(() => {
        console.log("Document added successfully");
      })
      .catch((error) => {
        console.error("Error", error);
      });
    // console.log(req.body);
    req.flash("accountcreated", "Account successfully created");
    res.redirect("/index-login-page");
  } catch {
    res.redirect("/Registrationform");
  }
});
app.post("/upload", upload.single("petimage"), async (req, res) => {
  const storagebucket = storage.bucket("gs://petcom-f839a.appspot.com");

  // const storageRef = storage.ref();

  var file = req.file;

  // const bucketfile = storagebucket.file(file.originalname);

  // bucketfile.save(file.buffer); /////
});
app.post("/petlistingform", upload.single("pet_image"), async (req, res) => {
  try {
    const storagebucket = storage.bucket("gs://petcom-f839a.appspot.com");
    var file = req.file;

    var apetname = req.body.petname;
    var apetcontact = req.body.petcontact;
    var apetaddress = req.body.petaddress;
    // console.log(req.file);

    var apetage = req.body.petage;
    var apettemper = req.body.pettemper;
    var immunization = req.body.petimmunization;
    var typeofpet = req.body.pettype_selected;
    var apetdescription = req.body.petstory;
    var label = req.body.data_selected;
    var history = req.body.historyofdonating;
    var numofdonate = req.body.numofdonate;

    var petCity = req.body.petcity;
    // var lwrpetcity = petCity.toLowerCase();

    var cookiedata = req.cookies.sessions;

    var dateandtime = Date.now();

    var newfilename = v4();

    var status = "For Adoption";
    
    console.log(req.file)

    var ext = file.originalname.substr(file.originalname.lastIndexOf(".") + 1);
    // console.log(ext);
    req.file.originalname = newfilename + "." + ext;

    const bucketfile = storagebucket.file(file.originalname);

    bucketfile.save(file.buffer); /////

    const petinfo = {
      pet_name: apetname,
      pet_contact: apetcontact,
      pet_address: apetaddress,
      pet_label: label,
      timestamp: dateandtime,
      pet_age: apetage,
      pet_temper: apettemper,
      pet_immunization: immunization,
      pet_type: typeofpet,
      pet_story: apetdescription,
      session_id: cookiedata,
      pet_image: req.file.originalname,
      pet_city: petCity,
    };

    if (label == "Adoption") {
      db.collection("pet_account")
        .add({
          ...petinfo,
          pet_status: status,
        })
        .then(() => {
          console.log("pet for adoption added successfully");
        })
        .catch((error) => {
          console.error("Error", error);
        });
      res.redirect("/petslist-filter-page");
    } else {
      db.collection("pet_account")
        .add({
          ...petinfo,
          pet_first_time_donor: history, // donation
          pet_donation_count: numofdonate, //donation
        })
        .then(() => {
          console.log("pet donor added successfully");
        })
        .catch((error) => {
          console.error("Error", error);
        });
      res.redirect("/petslist-filter-page");
    }
  } catch (e) {
    console.log(e);
    res.status(404).json({ message: "Failed to post" });
  }
});
//404 - error
//300 - redirect
//200 - success

app.post("/aboutme", async (req, res) => {
  const listofaccount = await useraccountcoll.get();
  var user_about = req.body.aboutme;
  var cookiedata = req.cookies.sessions;

  let accounts = [];

  listofaccount.forEach(async (doc) => {
    const user = doc.data();

    user.id = doc.id;
    accounts.push(user);
  });
  try {
    for (var index = 0; index < accounts.length; index++) {
      if (cookiedata == accounts[index]["id"]) {
        db.collection("user_account")
          .doc(accounts[index]["id"])
          .update({
            user_about: user_about,
          })
          .then(function () {
            console.log("updated");
          });
        res.redirect("/account-profile-page");
      }
    }
  } catch {
    res.redirect("/account-profile-page");
  }
});
app.post("/viewprofile", async (req, res) => {
  var val = req.body.userid;
  res.set("Set-Cookie", `viewprofile=${val}`);
  res.redirect("shelter-profile-page");
});

app.post("/adoptsuccess", async (req, res) => {
  var petid = req.body.petid;
  var form_id = req.body.formid;

  var button2 = req.body.buttonin;
  // console.log(button,button2);

  const listofadoptionrecord = await dataadoption.get();
  const listofpets = await petlist.get();

  var session = req.body.session_id;
  var dateandtime = Date.now();

  // console.log(button2);

  if (button2 == "Approve") {
    // listofpets.forEach((doc) => {
    var statusupdate = "Already Adopted";
    //   // var value = doc.id
    //   // console.log(value , accountid);

    //   if (accountid == doc.id) {
    db.collection("pet_account")
      .doc(petid)
      .update({
        new_session_id: session,
        pet_label: statusupdate,
        pet_status: statusupdate,
      })
      .then(function () {
        console.log("updated");
      });
    db.collection("adoptapet_data_record")
      .doc(form_id)
      .update({
        form_status: statusupdate,
      })
      .then(function () {
        console.log("updated");
      });
    db.collection("adoption_data")
      .add({
        new_session_id: session,
        pet_id: petid,
        timestamp: dateandtime,
      })
      .then(() => {
        console.log("adoption successfully");
      })
      .catch((error) => {
        console.error("Error", error);
      });

    res.redirect("account-notification-page");
    //   }
    // });
  } else {
    var statusupdate = "Declined";

    db.collection("adoptapet_data_record")
      .doc(form_id)
      .update({
        form_status: statusupdate,
      })
      .then(function () {
        console.log("updated");
      });

    res.redirect("account-notification-page");
  }
});
app.post("/donationform", async (req, res) => {
  var userid = req.cookies.sessions;
  var shelterid = req.cookies.viewprofile;

  var typeofdonation = req.body.data_selected; // checked

  var Leash = req.body.Leash; // checked
  var Cage = req.body.Cage; // checked
  var ChewToys = req.body.ChewToys; // checked
  // Dog Food
  var brandofdogfood = req.body.select_Dogfood; // checked
  var newbrandofdogfood = req.body.new_dogfood; // checked
  var dogfoodqty = req.body.dogdata_selected_qty; // checked
  var dogkilo = req.body.add_kiloqty; // checked
  var dogsack = req.body.add_sackqty; // checked

  //Cat Food
  var brandofcatfood = req.body.select_Catfood; // checked
  var newbrandofcatfood = req.body.new_catfood; // checked
  var catfoodqty = req.body.catdata_selected_qty; // checked
  var catkilo = req.body.add_catkiloqty; // checked
  var catsack = req.body.add_catsackqty; // checked

  var val = req.body.add_amount; // checked
  var amount = Number(val); // checked

  // vitamins
  var typeofvitamin = req.body.select_vitamins; //checked
  var newvitamins = req.body.new_vitamins; //checked
  var qtyvitamins = req.body.vitaqty; //checked

  //dewormer
  var typeofdewormer = req.body.select_dewormer; //checked
  var newdewormer = req.body.new_dewormer; //checked
  var dewormerqty = req.body.dewormerqty; //checked

  var desc = req.body.add_desc;

  var dateandtime = Date.now();
  var label = "Donation";
  var otherdonations = "Other Donation";
  // console.log(req.body);
  var status = "Pending";

  if (
    brandofdogfood != "None of the Above Dogfood" &&
    brandofcatfood != "None of the Above Catfood" &&
    typeofvitamin != "None of the Above Vitamins" &&
    typeofdewormer != "None of the Above Dewormer"
  ) {
    db.collection("adoptapet_data_record")
      .add({
        donor_type: typeofdonation,
        shelter_id: shelterid,
        session_id: userid,

        donor_leash: Leash,
        donor_cage: Cage,
        donor_chewtoy: ChewToys,

        donor_dogbrand: brandofdogfood, //
        donor_dogfoodqty: dogfoodqty,
        donor_dogkilo: dogkilo,
        donor_dogsack: dogsack,
        donor_catbrand: brandofcatfood, //
        donor_catfoodqty: catfoodqty,
        donor_catkilo: catkilo,
        donor_catsack: catsack,
        donor_typeofvitamin: typeofvitamin, //
        donor_qtyvitamins: qtyvitamins,
        donor_typeofdewormer: typeofdewormer, //
        donor_dewormerqty: dewormerqty,
        donor_amount: amount,
        donor_desc: desc,
        timestamp: dateandtime,
        label: label,
        status,
      })
      .then(() => {
        console.log("donation successful");
      })
      .catch((error) => {
        console.error("Error", error);
      });

    return res.redirect("shelter-main-page");
  }

  db.collection("adoptapet_data_record")
    .add({
      donor_type: typeofdonation,
      shelter_id: shelterid,
      session_id: userid,

      donor_leash: Leash,
      donor_cage: Cage,
      donor_chewtoy: ChewToys,

      donor_label: otherdonations,
      donor_dogbrand: newbrandofdogfood, //
      donor_dogfoodqty: dogfoodqty,
      donor_dogkilo: dogkilo,
      donor_dogsack: dogsack,
      donor_catbrand: newbrandofcatfood, //
      donor_catfoodqty: catfoodqty,
      donor_catkilo: catkilo,
      donor_catsack: catsack,
      donor_typeofvitamin: newvitamins, //
      donor_qtyvitamins: qtyvitamins,
      donor_typeofdewormer: newdewormer, //
      donor_dewormerqty: dewormerqty,
      donor_amount: amount,
      donor_desc: desc,
      timestamp: dateandtime,
      label: label,
      status,
    })
    .then(() => {
      console.log("donation successful");
    })
    .catch((error) => {
      console.error("Error", error);
    });

  res.redirect("shelter-main-page");
});
app.post("/notificationfilter", async (req, res) => {
  var data_selected = req.body.notif_filter;
  // console.log(data_selected);

  res.set("Set-Cookie", `filter_notification=${data_selected}`);
  res.redirect("/account-notification-page");
});
// app.listen(3000, 'localhost', () => {
//     console.log("server is running");
// })
app.post("/petprofile", async (req, res) => {
  var adoptionsession = req.body.adoption_id;
  var id = req.body.pet_id;
  console.log(id);
  res.set("Set-Cookie", `petprofile=${id}`);
  // res.set("Set-Cookie", `adoptionpetsession=${adoptionsession}`);
  res.redirect("adoption-petslist-petprofile-page");
});
app.post("/adoptionform", async (req, res) => {
  var form_id = req.body.form_id;
  // Occuptaion
  var form_occuptaion = req.body.form_occupation;
  // Monthly Income Range
  var form_income = req.body.form_income;
  // Are you willing to adopt a rescue with special needs?
  var form_rescue_yes = req.body.form_rescue_yes;
  var form_rescue_no = req.body.form_rescue_no;
  //  Are you allowed to keep pets?
  var form_allowed_yes = req.body.form_allowed_yes;
  var form_allowed_no = req.body.form_allowed_no;
  var form_rescue_notapplicable = req.body.form_rescue_notapplicable;
  // How many pets do you have at home? (include Gender and Size)
  var form_pet_count = req.body.form_pet_count;
  //How many people are there in the household? (include Oldest and Youngest Age)
  var form_people_count = req.body.form_people_count;
  // If you have children, have they been taught how to interact and handle pets respectfully?
  var form_children_pet_interaction_yes =
    req.body.form_children_pet_interaction_yes;
  var form_children_pet_interaction_no =
    req.body.form_children_pet_interaction_no;
  // Have you had previous foster experience?
  var form_experience_yes = req.body.form_experience_yes;
  var form_experience_no = req.body.form_experience_no;
  // Level of experience with animals: Check all that apply
  var form_never = req.body.form_never;
  var form_childhood = req.body.form_childhood;
  var form_more = req.body.form_more;
  var form_boardingkennel = req.body.form_boardingkennel;
  var form_behavioral = req.body.form_behavioral;
  var form_veterinary = req.body.form_veterinary;
  var form_trainer = req.body.form_trainer;
  // What types of pets are you interested in fostering? Check all that apply
  var form_elderly = req.body.form_elderly;
  var form_adult = req.body.form_adult;
  var form_nursing = req.body.form_nursing;
  var form_unweaned = req.body.form_unweaned;
  var form_injured = req.body.form_injured;
  var form_behavioral_issues = req.body.form_behavioral_issues;
  var form_sick = req.body.form_sick;
  var form_hospice = req.body.form_hospice;
  // Please indicate how much time you can commit to fostering rescue/s
  var form_2months = req.body.form_2months;
  var form_4months = req.body.form_4months;
  var form_6months = req.body.form_6months;
  var form_regularly = req.body.form_regularly;

  var petid = req.cookies.petprofile;

  var dateandtime = Date.now();

  var statusdata = "Pending";
  var label = "Adoption";

  try {
    db.collection("adoptapet_data_record")
      .add({
        form_id: form_id,
        form_occupation: form_occuptaion,
        form_income: form_income,
        form_rescue_yes: form_rescue_yes,
        form_rescue_no: form_rescue_no,
        form_allowed_yes: form_allowed_yes,
        form_allowed_no: form_allowed_no,
        form_rescue_notapplicable: form_rescue_notapplicable,
        form_pet_count: form_pet_count,
        form_people_count: form_people_count,
        form_children_pet_interaction_yes: form_children_pet_interaction_yes,
        form_children_pet_interaction_no: form_children_pet_interaction_no,
        form_experience_yes: form_experience_yes,
        form_experience_no: form_experience_no,
        form_never: form_never,
        form_childhood: form_childhood,
        form_more: form_more,
        form_boardingkennel: form_boardingkennel,
        form_behavioral: form_behavioral,
        form_veterinary: form_veterinary,
        form_trainer: form_trainer,
        form_elderly: form_elderly,
        form_adult: form_adult,
        form_nursing: form_nursing,
        form_unweaned: form_unweaned,
        form_injured: form_injured,
        form_behavioral_issues: form_behavioral_issues,
        form_sick: form_sick,
        form_hospice: form_hospice,
        form_2months: form_2months,
        form_4months: form_4months,
        form_6months: form_6months,
        form_regularly: form_regularly,
        timestamp: dateandtime,
        form_status: statusdata,
        pet_id: petid,
        label: label,
      })
      .then(() => {
        console.log("Adoption Form added successfully");
      })
      .catch((error) => {
        console.error("Error", error);
      });

    res.redirect("/adoption-petslist-petprofile-page");
  } catch (e) {
    console.log(e);
  }
});
app.post("/viewadoptionforms", async (req, res) => {
  var val = req.body.notifid;
  res.set("Set-Cookie", `viewform=${val}`);
  res.redirect("account-notification-viewform-page");
});
app.post("/viewdonation", async (req, res) => {
  var val = req.body.notifid;
  res.set("Set-Cookie", `viewdonation=${val}`);

  res.redirect("account-notification-viewdonation-page");
});
app.post("/viewpetprofile", async (req, res) => {
  var val = req.body.petid;
  res.set("Set-Cookie", `viewpetprofile=${val}`);

  res.redirect("pets-viewprofile-page");
});

// app.post("/deleteapet", async (req, res) => {
//   var petid = req.body.petid;

//   db.collection("pet_account")
//     .doc(petid)
//     .delete()
//     .then(() => {
//       console.log("pet successfully deleted!");
//     })
//     .catch((error) => {
//       console.error("Error removing document: ", error);
//     });

//   res.redirect("petslist-filter-page");
// });

app.post("/linkinterview", async (req, res) => {
  var link = req.body.meetinglink;
  var month = req.body.select_month;
  var date = req.body.select_date;
  var year = req.body.select_year;
  var time = req.body.time;
  var formid = req.body.form_id;
  var val = req.body.select_day;

  var cookies = req.cookies.sessions;

  // console.log(formid)
  db.collection("interview_schedule")
    .add({
      interview_link: link,
      interview_month: month,
      interview_date: date,
      interview_year: year,
      interview_time: time,
      interview_day: val,
      adoptapet_data_record_ID: formid,
      shelter_id: cookies,
    })
    .then(() => {
      console.log("interview schedule successful");
    })
    .catch((error) => {
      console.error("Error", error);
    });
  var status = "Schedule for Interview";
  db.collection("adoptapet_data_record")
    .doc(formid)
    .update({
      form_status: status,
    })
    .then(function () {
      console.log("form_status updated");
    });
  res.redirect("account-notification-page");
});
// Update Interview
app.post("/updatelink", async (req, res) => {
  var sched_id = req.body.schedule_id;
  var link = req.body.link;
  // console.log(sched_id);

  db.collection("interview_schedule")
    .doc(sched_id)
    .update({
      interview_link: link,
    })
    .then(function () {
      console.log("form_link updated");
    });
  res.redirect("account-notification-viewform-page");
});
app.post("/updatedate", async (req, res) => {
  var sched_id = req.body.schedule_id;
  var month = req.body.month;
  var date = req.body.date;
  var year = req.body.yr;

  db.collection("interview_schedule")
    .doc(sched_id)
    .update({
      interview_month: month,
      interview_date: date,
      interview_year: year,
    })
    .then(function () {
      console.log("form_date updated");
    });
  res.redirect("account-notification-viewform-page");
});
app.post("/updatetime", async (req, res) => {
  var sched_id = req.body.schedule_id;
  var time = req.body.time;
  var day = req.body.select_day;
  // console.log(time,day);

  db.collection("interview_schedule")
    .doc(sched_id)
    .update({
      interview_time: time,
      interview_day: day,
    })
    .then(function () {
      console.log("form_time updated");
    });
  res.redirect("account-notification-viewform-page");
});
// Update Interview

app.post("/scheduleinterview", async (req, res) => {
  var val = req.body.id;
  res.set("Set-Cookie", `scheduleinterview=${val}`);
  // console.log(val)

  res.redirect("account-notification-interview-page");
});

app.post("/addcategory", async (req, res) => {
  var inputcateg = req.body.add_category;
  const listofaccount = await useraccountcoll.get();
  var cookiedata = req.cookies.sessions;

  let accounts = [];

  listofaccount.forEach(async (doc) => {
    const user = doc.data();

    user.id = doc.id;
    accounts.push(user);
  });

  // console.log(inputcateg);
  let cat = [];

  const categ = await categories
    .where("session_id", "==", cookiedata)
    .limit(5)
    .get();

  categ.forEach(async (docs) => {
    const ca = docs.data();
    cat.push(ca);
  });
  const findCateg = (item) => {
    return item.category === inputcateg;
  };

  const result = cat.find(findCateg);

  console.log(!result);

  // if (result) {
  //   req.flash("existingcategory", "Category Already Exist!");
  //   return res.redirect("/account-profile-page");
  // }

  // db.collection("account_categories")
  //   .add({
  //     session_id: cookiedata,
  //     category: inputcateg,
  //   })
  //   .then(() => {
  //     console.log("category added");
  //   })
  //   .catch((error) => {
  //     console.error("Error", error);
  //   });

  // req.flash("addedcategory", "Category Successfully Added!");
  // res.redirect("/account-profile-page");
});

app.post("/removecategory", async (req, res) => {
  var categoryid = req.body.category;
  db.collection("account_categories")
    .doc(categoryid)
    .delete()
    .then(() => {
      console.log("category removed!");
    })
    .catch((error) => {
      console.log("error removing document!");
    });
  res.redirect("account-profile-page");
});

// Profile Update

app.post("/updatefirstname", async (req, res) => {
  var firstname = req.body.firstname;
  const listofaccount = await useraccountcoll.get();
  var cookiedata = req.cookies.sessions;

  let accounts = [];

  listofaccount.forEach(async (doc) => {
    const user = doc.data();

    user.id = doc.id;
    accounts.push(user);
  });

  try {
    for (var index = 0; index < accounts.length; index++) {
      if (cookiedata == accounts[index]["id"]) {
        db.collection("user_account")
          .doc(accounts[index]["id"])
          .update({
            user_first_name: firstname,
          })
          .then(function () {
            console.log("updated");
          });
        res.redirect("/account-edit-page");
      }
    }
  } catch {
    res.redirect("/account-edit-page");
  }
});

app.post("/updatelastname", async (req, res) => {
  var lastname = req.body.lastname;
  const listofaccount = await useraccountcoll.get();
  var cookiedata = req.cookies.sessions;

  let accounts = [];

  listofaccount.forEach(async (doc) => {
    const user = doc.data();

    user.id = doc.id;
    accounts.push(user);
  });

  try {
    for (var index = 0; index < accounts.length; index++) {
      if (cookiedata == accounts[index]["id"]) {
        db.collection("user_account")
          .doc(accounts[index]["id"])
          .update({
            user_last_name: lastname,
          })
          .then(function () {
            console.log("updated");
          });
        res.redirect("/account-edit-page");
      }
    }
  } catch {
    res.redirect("/account-edit-page");
  }
});

app.post("/updateaddress", async (req, res) => {
  var address = req.body.address;
  const listofaccount = await useraccountcoll.get();
  var cookiedata = req.cookies.sessions;

  let accounts = [];

  listofaccount.forEach(async (doc) => {
    const user = doc.data();

    user.id = doc.id;
    accounts.push(user);
  });

  try {
    for (var index = 0; index < accounts.length; index++) {
      if (cookiedata == accounts[index]["id"]) {
        db.collection("user_account")
          .doc(accounts[index]["id"])
          .update({
            user_address: address,
          })
          .then(function () {
            console.log("updated");
          });
        res.redirect("/account-edit-page");
      }
    }
  } catch {
    res.redirect("/account-edit-page");
  }
});

app.post("/updatecontact", async (req, res) => {
  var contact = req.body.contact;
  const listofaccount = await useraccountcoll.get();
  var cookiedata = req.cookies.sessions;

  let accounts = [];

  listofaccount.forEach(async (doc) => {
    const user = doc.data();

    user.id = doc.id;
    accounts.push(user);
  });

  try {
    for (var index = 0; index < accounts.length; index++) {
      if (cookiedata == accounts[index]["id"]) {
        db.collection("user_account")
          .doc(accounts[index]["id"])
          .update({
            user_contact: contact,
          })
          .then(function () {
            console.log("updated");
          });
        res.redirect("/account-edit-page");
      }
    }
  } catch {
    res.redirect("/account-edit-page");
  }
});

//Pet Update

app.post("/updatepetname", async (req, res) => {
  var petId = req.cookies.viewpetprofile;
  // console.log(petId);
  var petname = req.body.petname;

  db.collection("pet_account")
    .doc(petId)
    .update({
      pet_name: petname,
    })
    .then(function () {
      console.log("pet name updated");
    });
  res.redirect("/pets-viewprofile-page");
});

app.post("/updateStory", async (req, res) => {
  var petId = req.cookies.viewpetprofile;
  // console.log(petId);
  var story = req.body.petstory;

  db.collection("pet_account")
    .doc(petId)
    .update({
      pet_story: story,
    })
    .then(function () {
      console.log("pet story updated");
    });
  res.redirect("/pets-viewprofile-page");
});

app.post("/updatepetAddress", async (req, res) => {
  var petId = req.cookies.viewpetprofile;
  var address = req.body.petaddress;

  // console.log(address);

  db.collection("pet_account")
    .doc(petId)
    .update({
      pet_address: address,
    })
    .then(function () {
      console.log("pet address updated");
    });
  res.redirect("/pets-viewprofile-page");
});

app.post("/updateStatus", async (req, res) => {
  var petId = req.cookies.viewpetprofile;
  var pet_status = req.body.status;
  // console.log(pet_status);

  db.collection("pet_account")
    .doc(petId)
    .update({
      pet_status: pet_status,
    })
    .then(function () {
      console.log("pet status updated");
    });
  res.redirect("/pets-viewprofile-page");
});
app.post("/donorstatus", async (req, res) => {
  var petId = req.cookies.viewpetprofile;
  // console.log(req.body)
  var donorid = req.body.donorid;
  var status = req.body.status;
  // console.log(status)

  db.collection("pet_patient_donor")
    .doc(donorid)
    .update({
      label: status,
    })
    .then(function () {
      console.log("pet patient updated");
    });

  //
  var petstatus = "In need of Blood Donation";
  db.collection("pet_account")
    .doc(petId)
    .update({
      pet_status: status,
    })
    .then(function () {
      console.log("pet account updated");
    });
  res.redirect("/pets-viewprofile-page");
});
app.post("/updatepetContact", async (req, res) => {
  var petId = req.cookies.viewpetprofile;

  var pet_contact = req.body.petcontact;
  // console.log(pet_contact);

  db.collection("pet_account")
    .doc(petId)
    .update({
      pet_contact: pet_contact,
    })
    .then(function () {
      console.log("pet contact updated");
    });
  res.redirect("/pets-viewprofile-page");
});

app.post("/updatepetAge", async (req, res) => {
  var petId = req.cookies.viewpetprofile;

  var pet_age = req.body.petage;
  // console.log(pet_contact);

  db.collection("pet_account")
    .doc(petId)
    .update({
      pet_age: pet_age,
    })
    .then(function () {
      console.log("pet pet age updated");
    });
  res.redirect("/pets-viewprofile-page");
});

app.post("/updatepetCity", async (req, res) => {
  var petId = req.cookies.viewpetprofile;

  var pet_city = req.body.petCity;
  // console.log(pet_city);

  db.collection("pet_account")
    .doc(petId)
    .update({
      pet_city: pet_city,
    })
    .then(function () {
      console.log("pet city updated");
    });
  res.redirect("/pets-viewprofile-page");
});

app.post("/updatepetTemp", async (req, res) => {
  var petId = req.cookies.viewpetprofile;

  var pet_temp = req.body.petTemp;
  // console.log(pet_city);

  db.collection("pet_account")
    .doc(petId)
    .update({
      pet_temper: pet_temp,
    })
    .then(function () {
      console.log("pet temperament updated");
    });
  res.redirect("/pets-viewprofile-page");
});

app.post("/updatepetImmuni", async (req, res) => {
  var petId = req.cookies.viewpetprofile;

  var pet_immun = req.body.petImmu;
  // console.log(pet_city);

  db.collection("pet_account")
    .doc(petId)
    .update({
      pet_immunization: pet_immun,
    })
    .then(function () {
      console.log("pet immunization updated");
    });
  res.redirect("/pets-viewprofile-page");
});

app.post("/postpet", upload.single("pet_image"), async (req, res) => {
  try {
    const storagebucket = storage.bucket("gs://petcom-f839a.appspot.com");
    var cookie = req.cookies.sessions;
    var file = req.file;


    var petname = req.body.petname;
    var petage = req.body.petage;
    var petcontact = req.body.petcontact;
    var petbreed = req.body.petbreed;
    var petweight = req.body.petweight;
    var vetname = req.body.vetname;
    var vetaddress = req.body.vaterinaryaddress;
    var vetcity = req.body.petcity;
    var petdiagnosis = req.body.petdiagnosis;
    var crossmatch = req.body.crossmatch;
    var history = req.body.history;

    var dateandtime = Date.now();
    var newfilename = v4();

    var ext = file.originalname.substr(file.originalname.lastIndexOf(".") + 1);
    // console.log(ext);
    req.file.originalname = newfilename + "." + ext;

    const bucketfile = storagebucket.file(file.originalname);

    bucketfile.save(file.buffer); /////
    var petlabel = "dogpatient";
    var status = "pending";

    var pet_status = "In need of Blood Donation";
    const petdata = {
      petname,
      petcontact,
      petage,
      petbreed,
      petweight,
      vetname,
      vetaddress,
      vetcity,
      petdiagnosis,
      crossmatch,
      pet_image: req.file.originalname,
      history,
      petlabel,
    };
    // console.log(vetaddress)
    // db.collection("pet_patient")
    //   .add({
    //     ...petdata,
    //     timestamp : dateandtime,
    //     user_session : cookie,
    //     status
    //   })
    //   .then(() => {
    //     console.log("post successful");
    //   })
    //   .catch((error) => {
    //     console.error("Error", error);
    //   });

    var pet_image = req.file.originalname;

    //   //  pet_account
    db.collection("pet_account")
      .add({
        pet_name: petname,
        pet_age: petage,
        pet_contact: petcontact,
        vet_name: vetname,
        vetaddress,
        vet_city: vetcity,
        pet_diagnosis: petdiagnosis,
        pet_crossmatch: crossmatch,
        pet_image: pet_image,
        pet_label: petlabel,
        timestamp: dateandtime,
        session_id: cookie,
        pet_status,
        status,
        petbreed,
        petweight,
        history,
      })
      .then(() => {
        console.log("post successful");
      })
      .catch((error) => {
        console.error("Error", error);
      });

    res.redirect("donor-main-page");
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: "Failed to post" });
  }
});

app.post("/donorpetid", async (req, res) => {
  var id = req.body.id;
  res.set("Set-Cookie", `patient_id=${id}`);
  // console.log(req.body)
  res.redirect("donor-form-page");
});

app.post("/donorform", async (req, res) => {
  var donor_id = req.body.petname;
  var currentweight = req.body.currentweight;
  var contact = req.body.contact;
  var transportation = req.body.Transportation;
  var dogfood = req.body.DogFood;
  var vitamins = req.body.Vitamins;
  var dateandtime = Date.now();
  var date = req.body.date;
  var time = req.body.time;

  var session = req.cookies.sessions;
  var id = req.cookies.patient_id;

  var label = "pending";

  var con = time + date;
  console.log(con);

  // console.log(id)

  db.collection("pet_patient_donor")
    .add({
      donor_id,
      currentweight,
      contact,
      transportation,
      dogfood,
      vitamins,
      patient_id: id,
      timestamp: dateandtime,
      label,
      session_id: session,
      available_time: con,
    })
    .then(() => {
      console.log("post successful");
    })
    .catch((error) => {
      console.error("Error", error);
    });

  res.redirect("donor-form-page");
});

app.post("/approvedonor", async (req, res) => {
  var cookie = req.cookies.session;
  // console.log(cookie)
  var val = req.body.donorid;
  var patientid = req.body.patientid;

  var petlabel = "Scheduled for Donation";
  var updlabel = "Approved";

  db.collection("pet_patient_donor")
    .doc(val)
    .update({
      label: petlabel,
    })
    .then(function () {
      console.log("updated");
    });

  // petaccount
  db.collection("pet_account")
    .doc(patientid)
    .update({
      pet_status: petlabel,
    })
    .then(function () {
      console.log("updated");
    });

  res.redirect("/donor-main-page");
});

app.post("/receiveddonation", async (req, res) => {
  // console.log(req.body)
  var btn = req.body.btnaction;
  var id = req.body.id;
  // console.log(btn)
  var status = "Received";
  var deletestatus = "No update";
  if ((btn = "Received")) {
    db.collection("adoptapet_data_record")
      .doc(id)
      .update({
        status,
      })
      .then(function () {
        console.log("received donation");
      });
  } else {
    db.collection("adoptapet_data_record")
      .doc(id)
      .update({
        deletestatus,
      })
      .then(function () {
        console.log("delete donation");
      });
  }
  res.redirect("/account-main-page");
});
