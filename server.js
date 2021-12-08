const HTTP_PORT = process.env.PORT || 3000;
const url = require('url'); 
const express = require("express");											//	require express as web application framework
const hbs = require('hbs');								//	require handlebars as templating engine 
var fs = require("fs");
var bodyParser = require('body-parser');  
// Create application/x-www-form-urlencoded parser  
var urlencodedParser = bodyParser.urlencoded({ extended: false })  
const { setUncaughtExceptionCaptureCallback } = require("process");
const e = require("express");
const cookieParser = require('cookie-parser');
const {MongoClient} = require('mongodb');
var session = require('express-session');
const mongoose = require("mongoose");
const { getSystemErrorMap } = require('util');
var router = express.Router();

const app = express();
app.set('view engine', 'hbs')
app.use(cookieParser());
var UserAccounts;
var rawdata = fs.readFileSync('user.json');
var Users = JSON.parse(rawdata);
var currentEmail;
var UserAccountsGlobal;

var accData = fs.readFileSync('accounts.json');
var accounts = JSON.parse(accData);


app.get("/", function(req,res){
    res.render('login')
});

app.get("/deposit", function(req,res){
    res.render('depositPage',{account_num : req.query.account_num})
});

app.post("/deposit", urlencodedParser, function(req,res){
    var amt = Number(req.body.amount);
    var account_num = req.body.account_num;
    var balance = Number(accounts[account_num]["accountBalance"])
    balance = balance + amt;
    accounts[account_num]["accountBalance"] = balance
    var json = JSON.stringify(accounts);
    fs.writeFile('accounts.json', json, 'utf8', (err) => {
        if (err)
          console.log(err);
        else {
          console.log("File written successfully\n");
          console.log("The written has the following contents:");
          res.redirect('/home')
          //console.log(fs.readFileSync("books.txt", "utf8"));
        }
      });
})

app.get("/withdraw", function(req,res){
    res.render('withdrawalPage',{account_num : req.query.account_num})
});

app.post("/withdraw", urlencodedParser, function(req,res){
    var amt = Number(req.body.amount);
    var account_num = req.body.account_num;
    var balance = Number(accounts[account_num]["accountBalance"])
    if (balance < amt) {
    res.redirect(url.format({
        pathname:"/home",
        query: {
            "account_num": account_num,
            "errors": "Insufficient balance"
         }
      }));
    } else {
        balance = balance - amt;
        accounts[account_num]["accountBalance"] = balance
        var json = JSON.stringify(accounts);
        fs.writeFile('accounts.json', json, 'utf8', (err) => {
            if (err)
              console.log(err);
            else {
              console.log("File written successfully\n");
              console.log("The written has the following contents:");
              res.redirect('/home')
              //console.log(fs.readFileSync("books.txt", "utf8"));
            }
          });
    }
    
})

app.get("/newAcc", function(req,res){
    console.log("ehehehheh");
    res.render('newAccountPage');
});

app.post("/newAcc", urlencodedParser, function(req,res){
    var atype = req.body.acc_type;
    var last_account = Number(accounts["lastID"]);
    last_account = last_account + 1;
    new_account = last_account.toString();
    accounts[new_account] = { accountType: atype, accountBalance:0};
    accounts["lastID"] = new_account;
    var json = JSON.stringify(accounts);
    fs.writeFile('accounts.json', json, 'utf8', (err) => {
        if (err)
            console.log(err);
        else {
            console.log("File written successfully\n");
            console.log("The written has the following contents:");
            res.redirect(url.format({
                pathname:"/home",
                query: {
                    "account_num": new_account,
                    "info": "New Account #" + new_account + " Created Succcessfully"
                 }
              }));
            //console.log(fs.readFileSync("books.txt", "utf8"));
        }
        });
});

app.get("/home", async(req,res) => { 
    var errors = req.query.errors
    var info = req.query.info
    /*const ClientCollection = await ClientCollection.find({});*/
    const uri = "mongodb+srv://sid:admin@web322server.uvzzz.mongodb.net/WebBank?retryWrites=true&w=majority"
    var allUser
    MongoClient.connect(uri, {
        useNewUrlParser: true
    }, (error, client) => {
        if (error) {
            console.log('Error occurred while connecting to MongoDB Atlas... instance due to:\n', error);
            
        } else {
            //declare database instance
            const db = client.db('WebBank');
    
            //show database connection
            console.log("Database connection established!");
            console.log("Connected");
    
            const collection = db.collection('Client Collection');
            
            collection.find().toArray((err, cursor) => {
                if (err) {
                    console.log(err);
                    
                }

                console.log(cursor);
                //json response message           
                //return res.status(200).json({
                  //  balance: cursor
                //});
            
            
                var UserAccounts = JSON.stringify(cursor);
                console.log("UserAccounts",UserAccounts);
                var allUser = JSON.parse(UserAccounts);
                //console.log(typeof allUser);
                console.log("allUser",allUser);
                
                res.render('mainPage',{whatever : currentEmail, errors: errors, info:info, UserAccounts : allUser, asdf : "asdf"})
                
            });
        
        }
    });

});

app.post("/",urlencodedParser, function(req,res){
    var email = req.body.txtEmail;
    currentEmail = req.body.txtEmail;
    var password = req.body.txtPassword;
    if(Users.hasOwnProperty(email)){
       console.log("Trigger Check");
       var cPassword = Users[email];
       if(cPassword===password){
           console.log("cPass Check");
           //res.cookie('email', email).send('cookie set');
           res.redirect(url.format({
            pathname:"/home",
            query: {
                "whatever": email
             }
          }));
       }
       else{
           res.render('login', {errors: "Invalid Password!"});
       }
    }
    else{
           res.render('login', {errors: "Invalid Username!"})
    }
});

app.post("/home",urlencodedParser, function(req,res){
    var banking=req.body.banking;
    var acc = req.body.txtid;
    console.log(banking);
    console.log(acc);
    console.log(accounts);
    if (banking == "newAcc"){
        console.log("a;sdshfasofh");
        res.redirect("newAcc");
    }
    if(accounts.hasOwnProperty(acc)){
        console.log('hahahaha');
        if(banking=="balance"){
            console.log('balaala');
            var balance = accounts[acc]["accountBalance"];
            var acc_type = accounts[acc]["accountType"];
            console.log(balance);
            res.render('balancePage',{balance_amt: balance, atype:acc_type})
        } else if (banking == "deposit"){
            res.redirect(url.format({
                pathname:"/deposit",
                query: {
                    "account_num": acc
                 }
              }));
        } else if (banking == "withdrawal"){
            res.redirect(url.format({
                pathname:"/withdraw",
                query: {
                    "account_num": acc
                 }
              }));
        }
    }
});

/*const uri = "mongodb+srv://sid:admin@web322server.uvzzz.mongodb.net/WebBank?retryWrites=true&w=majority";
mongoose.connect(uri, {
    useNewUrlParser: true
});

mongoose.connection.on('connected', () => {
    console.log('Connected');
});
var Schema = mongoose.Schema;
var User = mongoose.model('User', new Schema({ username: String, chequing: Number, savings: Number}, { collection : 'Client Collection' }));   // collection name;
User.find({}, function(err, data) { console.log(err, data, data.length);});
*/

    /**
     * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
     * See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
     */

const server = app.listen(HTTP_PORT, function() {
console.log(`Listening on port ${HTTP_PORT}`);
});