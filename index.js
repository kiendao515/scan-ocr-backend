const express = require('express');
const socketio=require('socket.io');
const http=require("http");
const connectionDB= require('./connection');
const app = express();
const server = http.createServer(app)
const userRoute = require('./routes/userRoute')
// end config socket 

var cors = require('cors');
connectionDB();
app.use("/images", express.static("./images"))
app.use(express.json());
app.use(express.urlencoded({extended:false}))

const corsOpts = {
    origin: '*',
    methods: [
        'GET',
        'POST',
        'PUT',
        'DELETE'
    ],

    allowedHeaders: [
        'Content-Type',
        'Authorization'
    ],
};

app.use(cors(corsOpts));
app.use(userRoute,function(req,res,next){
    next()
});

app.all('*',(req,res)=>{
    res.json({status:'fail',msg:'-.-Kiểm tra kĩ lại route api'})
})

server.listen(process.env.PORT || 5000,(req,res)=>{
   console.log("server chay o port 5000")
})