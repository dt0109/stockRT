var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var StockSchema = new Schema({
	StockName:String,
	StockNumber:Number,
	CurrentPrice:Number,
	PosOrNeg:String,
	StockChange:Number,
	StockVolumn: String
});

mongoose.model('stock',StockSchema);