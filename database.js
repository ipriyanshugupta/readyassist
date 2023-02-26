const mysql = require("mysql")

const con = mysql.createConnection({
    host: 'localhost',
    user: "root",  
    password: "Qazw@12345" ,
    database: "ReadyAssist" 
})

con.connect(function (err) {
    if (err) throw err;
    console.log("MySQL Connected!");
});


module.exports = con;