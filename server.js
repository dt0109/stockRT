var express = require("express"),
    app = express(),
    server = require('http').createServer(app),
    io = require("socket.io").listen(server),
    bodyParser = require('body-parser'),
    port = process.env.PORT || 3000,
    mongoose = require("mongoose");

var stocks = [];


require("./models/stockRT");
var stockRT = mongoose.model('stock');


mongoose.connect('mongodb://localhost/stockRT',function(err){
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

server.listen(port,function(){
  console.log("server is now listen on port:"+port);
})
