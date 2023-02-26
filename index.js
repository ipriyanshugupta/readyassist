const express = require("express")
const cron = require("node-cron")
require('dotenv').config()
const routes = require('./routes')
const request = require('request');
const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.use("/api", routes)

cron.schedule('*/5 * * * * *', () => {
    request({
        url: `http://127.0.0.1:${process.env.PORT}/api/runCron`,
        method: 'POST'
    }, function (error, response, body) {
        console.log("running cron every minute")
    });
});


app.listen(process.env.PORT, () => {
    console.log("Listening on port", process.env.PORT)
})
