var cheerio = require("cheerio");
var server = require("./curl");
var mongoose = require("mongoose");
var stockRT = mongoose.model('stock');
 


function getDetail(number,req,res,next,sendNext){
	// var url = "http://www.aastocks.com/tc/ltp/rtquote.aspx?symbol="+number;
	var url = "http://www.aastocks.com/tc/stock/DetailQuote.aspx?&symbol="+number;
	server.download(url, function(data) {
	  if (data) {
	    //console.log(data);
	    var $ = cheerio.load(data,{decodeEntities: false});
	    var posNeg = '';
	    var price = 0;
	    //get stock name
        var name = $("font.font15_white").html().replace('                                ','').split('&nbsp;').join(' ').replace(/(\r\n|\n|\r)/gm,"");
        var change = null;
        var volumn = null;

        //get stock info of positive or negative change.
        if($("li.LI1_1.font20.C.bold.W1 span.neg.bold").html()===null){
        	change = ($("li.LI1_1.font20.C.bold.W1 span.pos.bold").html());
       	}else{
        	change = ($("li.LI1_1.font20.C.bold.W1 span.neg.bold").html());
        }

	    //get current price data
	    if($("li.LI2.font28.C.bold.W1 span.pos.bold").html()!=null){
	          posNeg = 'pos';
	          price = ($("li.LI2.font28.C.bold.W1 span.pos.bold").html());
	    }else{
	       	  posNeg = 'neg';
	          price = ($("li.LI2.font28.C.bold.W1 span.neg.bold").html());
	    }
	    //get 
	    volumn = $("li.LI1.font15.C.bold.W3").html();


	    stockRT.update({StockNumber: number},{
		    StockName: name, 
		    PosOrNeg: posNeg,
		    CurrentPrice: price,
			StockChange: change,
			StockVolumn: volumn
		}, { upsert: true },function(err, stock) {
		   if(err) return console.log(err);
		})


	    if(sendNext){
	      	next();
	      }

	  } else {
	      console.log("error");
	      if(sendNext){
          	next('err');
          }
	  } 
	});
}

module.exports.getDetail = getDetail;