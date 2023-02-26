require('dotenv').config()
const con = require('./database')
const client = require("@mailchimp/mailchimp_marketing");
const express = require('express')
const https = require('https')
const app = express();
app.use(express.urlencoded({ extended: true }));

const router = express.Router();

router.post('/post', (req, res) => {
    var sql = `insert into Mobile(id , brand, name , costprice , sellingprice , rating ) values(${req.body.id},"${req.body.brand}","${req.body.name}",${req.body.costprice},${req.body.sellingprice},${req.body.rating})`;
    con.query(sql, function (err, result) {
        if (err) throw err;
        res.json({ status: 200, response: "Data Inserted" })
    });
});

router.get('/getAll/:brand?', (req, res) => {

    var sql = `select * from Mobile`;
    if (req.query.brand)
        sql = sql + ` where brand = "${req.query.brand}"`;

    con.query(sql, function (err, result) {
        if (err) throw err;
        res.send(result)
    });
});

router.post('/optForEmail', (req, res) => {
    var sql = `update customer set optSub = "y" where email = "${req.body.email}"`;
    con.query(sql, function (err, result) {
        if (err) res.status(500).send({ status: 500, response: "Customer with this email is not available" });
    });
    const data = {
        members: [{
            email_address: req.body.email,
            status: "subscribed"
        }]
    }
    const JSONdata = JSON.stringify(data);
    const url = `https://us1.api.mailchimp.com/3.0/lists/${process.env.list_id}`;
    const options = {
        method: "post",
        auth: `priyanshu:${process.env.mailchimpKey}`
    }
    const request = https.request(url, options, function (response) {
        if (response.statusCode === 200) {
            res.send({ status: 200, response: "Customer Subscribed for Email" })
        }
        else {
            res.status(500).send({ status: 500, response: "Error while adding Customer" })
        }
        // response.on("data", function (data) {
        //     console.log(JSON.parse(data));
        // })
    })
    request.write(JSONdata);
    request.end();
});

router.post('/sendEmail', (req, res) => {
    client.setConfig({
        apiKey: process.env.mailchimpKey,
        server: "us1",
    });
    // const campaignId = req.query.campaignId;
    const run = async () => {
        const settings = {
            subject_line: "Email from Mailchimp",
            title: "Test campaign",
            preview_text: "Preview text",
            from_name: "Priyanshu Gupta",
            reply_to: "Priyanshugpt486@gmail.com",
            auto_footer: true,
            inline_css: true,
            template_id: 13620915
        };
        const recipients = { list_id: process.env.list_id }
        const response = await client.campaigns.create({ type: "plaintext", settings, recipients });
        const response2 = await client.campaigns.send(response.id);
        console.log(response2)
        res.json({ status: 200, response: "Email sent to Customers" })
    };
    run();
});

router.get('/listCampaigns', (req, res) => {
    client.setConfig({
        apiKey: process.env.mailchimpKey,
        server: "us1",
    });
    const run = async () => {
        const response = await client.campaigns.list()
        res.send(response)
    };
    run();
});


router.post('/addToCart', (req, res) => {
    var sql = `insert into cart values(${req.body.custId},"${req.body.price}", ${req.body.productId}, now())`;
    var sql2 = `CREATE EVENT IF NOT EXISTS event_01
    ON SCHEDULE AT now() + 10 second
    DO
    delete from cart where custId = ${req.body.custId} `
    con.query(sql, function (err, result) {
        if (err) res.status(500).send({ status: 500, response: "Query did not run properly", error: err })
        else {
            res.send({ status: 200, response: "Cart updated", result: result })
        }
    });
})


router.get('/comparePhone/:phone1?/:phone2?/:phone3?', (req, res) => {
    var sql = `select * from mobile where id in (${req.query.phone1},${req.query.phone2},${req.query.phone3})`
    con.query(sql, function (err, result) {
        if (err)
            res.status(500).send({ status: 500, response: "Query did not run properly", error: err })
        else res.send({ status: 200, response: "Succesful.", result: result })
    });
})


router.post('/runSQL', (req, res) => {
    //var sql = `create table caffrt (custId int, products rchar(100),total int )`;
    // var sql = 'alter table cart add column DateAndTime Timestamp'
    //var sql = "drop table customer"
    //var sql = "delete from cart WHERE DateAndTime < now() - interval 1 hour"
    //var sql = "CREATE EVENT event_03 ON SCHEDULE EVERY 1 MINUTE STARTS CURRENT_TIMESTAMP ENDS CURRENT_TIMESTAMP + INTERVAL 1 HOUR DO INSERT INTO cart VALUES(22,33,44,NOW())"
    var sql = "select * from cart"
    con.query(sql, function (err, result) {
        if (err)
            res.status(500).send({ status: 500, response: "Query did not run properly", error: err })
        else res.send({ status: 200, response: "Successful", result: result })
    });
})

router.post('/runCron', (req, res) => {
    var sql = "delete from cart WHERE DateAndTime < now() - interval 1 hour"
    con.query(sql, function (err, result) {
        if (err)
            res.status(500).send({ status: 500, response: "Query did not run properly", error: err })
        else res.send({ status: 200, response: "Successful", result: result })
    });
})

module.exports = router;