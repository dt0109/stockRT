var express = require("express"),
    app = express(),
    server = require('http').createServer(app),
    io = require("socket.io").listen(server),
    bodyParser = require('body-parser'),
    port = pprocess.env.OPENSHIFT_NODEJS_PORT || 3000,
    mongoose = require("mongoose"),
    server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

var stocks = [];
var mongodb_connection_string;

require("./models/stockRT");
var stockRT = mongoose.model('stock');



//provide a sensible default for local development
mongodb_connection_string = 'mongodb://localhost/stockRT';
//take advantage of openshift env vars when available:
if(process.env.OPENSHIFT_MONGODB_DB_URL){
  mongodb_connection_string = process.env.OPENSHIFT_MONGODB_DB_URL + stockRT;
}

mongoose.connect(mongodb_connection_string,function(err){
  if(err) return console.log(err);
  console.log("connected to db");
})


app.set("view engine","ejs");
app.use(bodyParser.urlencoded({ extended: false }));


var getDetail = require("./models/getDetail");

var getData = function(req,res,next,number,getNext){
  getDetail.getDetail(number,req,res,next,getNext);
}


app.get('/',function(req,res,next){
    res.render('index');
   setInterval(function(){
    console.log("fetching stock info "+Date.now());
    //console.log(stocks);
    for(var obj in stocks){
      //update stock info
      getData(req,res,next,stocks[obj].StockNumber,true);
    }
    stockRT.find({},function(err,stock){
      if(err) return console.log(err);
      stocks=stock;
    })
    io.sockets.emit('stock',stocks);
   },2000);
  }
);

app.post('/',
  [
  function(req,res,next){
    getData(req,res,next,req.body.number,true);
  }
  ,
  function(req,res){
  stockRT.find({},function(err,stock){
    if(err) return console.log(err);
    stocks=stock;
  })
  return res.redirect('/');
}]);

app.post('/delStock',[
  function(req,res,next){
    stockRT.remove({StockNumber: req.body.delStock},function(err,doc){
      if(err) return console.log(err);
      console.log("deleted");
      next();
    });
  },
  function(req,res){
    stockRT.find({},function(err,stock){
      if(err) return console.log(err);
      stocks=stock;
      console.log(stock);
    })
    setTimeout(function(){return res.redirect('/');},2000);
    
  }
]);

server.listen(port,server_ip_address,function(){
  console.log("server is now listen on port:"+port);
})
