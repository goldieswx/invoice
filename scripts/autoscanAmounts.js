
var _ = require('lodash');

var fs =require("fs");

var f = function(filename) {

var x =  fs.readFileSync(filename);
var x = x.toString();

var matches = x.match(/\-?[0-9]+([,.]?[0-9]{0,3})/g);
var invDate = x.match(/(0?[1-9]|[12][0-9]|3[01])[- /.](0[1-9]|1[012])[- /.](19|20)\d\d/);

var filteredMatches = _.reduce(matches,function(sum,n) {

	var tmp = n.replace(',','.');
	tmp = parseFloat(tmp);
	
	if (tmp < 15000)  {
		sum.push(tmp);
	}

	return sum;
	
},[]);

var foundHTamounts = [];

_.each(filteredMatches,function(amount){

	var vatToHT = amount / 1.21;
	var vatToTC = vatToHT *1.21;

	var vatToHTR = Math.round(vatToHT*100)/100;
	var vatToTCR = Math.round(vatToTC*100)/100;
	
	var vatFindOneOf = [vatToHTR,vatToHTR-0.01,vatToHTR+0.01,vatToHTR-0.02,vatToHTR+0.02];

	var intersect = _.intersection(vatFindOneOf,filteredMatches);
	
	if (intersect.length) {
		foundHTamounts.push(vatToHT);
	}
	
});

var htAmnt = _.max(foundHTamounts) || 0;
var ttcAmnt = htAmnt *1.21;
var vatAmnt = ttcAmnt - htAmnt;

var rn = function(i) { 

  return Math.round((i||0)*100)*0.01;
}

invDate = _.isArray(invDate)?invDate[0]:'';

console.log(filename,' HT:',rn(htAmnt),' TTC: ',rn(ttcAmnt),' VAT:',rn(vatAmnt), " date :",invDate );

}

var glob = require("glob")

// options is optional

glob("**/*.txt",  function (er, files) {

   _.each(files,function(filename){
       f(filename);  
 });

  // files is an array of filenames.

})

