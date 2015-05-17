var mongoose = require("mongoose"),
	stockRT = mongoose.model("stock")
	controller = {};

var stocks = [];


var getDetail = require("../models/getDetail");


var getData = function(req,res,next,number,getNext){
  getDetail.getDetail(number,req,res,next,getNext);
}

controller.index = [
	function(req,res,next){
	   	res.render('index');
	   	setInterval(function(){
	    	for(var obj in stocks){
	      	//update stock info
	      	getData(req,res,next,stocks[obj].StockNumber,true);

	    }
	   	stockRT.find({},function(err,stock){
	      	if(err) return console.log(err);
	      	stocks=stock;
	    })
	    // io.sockets.emit('stock',stocks);
	   },1000);
  }
];

controller.postIndex = [
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
	}
]


module.exports = controller;