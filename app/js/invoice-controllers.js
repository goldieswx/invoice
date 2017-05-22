 var InvoiceCtrl = function($scope,$http) {
 		$scope.entry = {
 			type:'in'
 		}

 		$scope.incomingInvoices = [];
 		$scope.incomingPager = {
 			pageSize: 10
 		}
 		$scope.incoming = { filter: { expenseTypes: {}, trimester: ''} };

 		
 		$scope.outgoingInvoices = [];
 		$scope.outgoingPager =  {
 			pageSize: 10
 		};

 		$scope.outgoing = { total: 0, totalVat: 0, filter: { trimester: '' } };


 		$scope.vatReport = { filter : { trimester: ''} };


        $scope.$watch('entry.vatPercentage',function(){
        	if ($scope.entry.vatPercentage && $scope.entry.vatPercentage.length) {
       	 		var vat = parseFloat($scope.entry.vatPercentage);
				$scope.entry.vatAmount = Math.round((vat/100)*100*$scope.entry.totalAmount/(1+(vat/100)))/100;
			}
        });

 		$scope.interface = {
 			expenseTypes : [
 				 { id:"fuel", value:"Carburant"},
 				 { id:"public-transportation", value:"Transport Commun"},
	 			 { id:"communication", value:"Communication"}, 				 
 				 { id:"dine-in", value:"Dine In"},
 				 { id:"dine-out", value:"Dine Out"},
 				 { id:"divers", value:"Divers"} 
 			],
 			trimesters : [
 				{ id:"201301", value:"2013 - 1e", match:"/0?[1-3]/2013", previous:"201204"},
 				{ id:"201302", value:"2013 - 2e", match:"/0?[4-6]/2013", previous:"201301"},
 				{ id:"201303", value:"2013 - 3e", match:"/0?[7-9]/2013", previous:"201302"},
 				{ id:"201304", value:"2013 - 4e", match:"/1[0-2]/2013",  previous:"201303"},
 	                        { id:"201401", value:"2014 - 1e", match:"/0?[1-3]/2014", previous:"201304"},
                                { id:"201402", value:"2014 - 2e", match:"/0?[4-6]/2014", previous:"201401"},
                                { id:"201403", value:"2014 - 3e", match:"/0?[7-9]/2014", previous:"201402"},
                                { id:"201404", value:"2014 - 4e", match:"/1[0-2]/2014",  previous:"201403"},
	                        { id:"201501", value:"2015 - 1e", match:"/0?[1-3]/2015", previous:"201404"},
                                { id:"201502", value:"2015 - 2e", match:"/0?[4-6]/2015", previous:"201501"},
                                { id:"201503", value:"2015 - 3e", match:"/0?[7-9]/2015", previous:"201502"},
                                { id:"201504", value:"2015 - 4e", match:"/1[0-2]/2015",  previous:"201503"},
                                { id:"201601", value:"2016 - 1e", match:"/0?[1-3]/2016", previous:"201504"},
                                { id:"201602", value:"2016 - 2e", match:"/0?[4-6]/2016", previous:"201601"},
                                { id:"201603", value:"2016 - 3e", match:"/0?[7-9]/2016", previous:"201602"},
                                { id:"201604", value:"2016 - 4e", match:"/1[0-2]/2016",  previous:"201603"},
 				{ id:"201701", value:"2017 - 1e", match:"/0?[1-3]/2017", previous:"201604"},
                                { id:"201702", value:"2017 - 2e", match:"/0?[4-6]/2017", previous:"201701"},
                                { id:"201703", value:"2017 - 3e", match:"/0?[7-9]/2017", previous:"201702"},
                                { id:"201704", value:"2017 - 4e", match:"/1[0-2]/2017",  previous:"201703"}

			]
 		};

 		$scope.addInvoice = function(entry){
 			if (typeof entry._id === 'undefined') {
	 			$http.post('/db/invoices',entry);
	 		}  else {
	 			$http.put('/db/invoices/'+entry._id,entry);
	 		}
 		};

 		$scope.loadIncomingInvoices = function() {
 			$http.get('/db/invoices/_design/lists/_view/incoming').success(function(d){

 				for (var i=0;i<d.rows.length;i++) {
 					d.rows[i].processed = { vatAmount : $scope.getProcessedVat(d.rows[i]) };
 				}

 				$scope.incomingInvoices = d.rows;
 			});
 		}

 		$scope.loadOutgoingInvoices = function() {
 			$http.get('/db/invoices/_design/lists/_view/outgoing').success(function(d){
 				$scope.outgoingInvoices = d.rows;
 			});
 		}


 		$scope.deleteRecord = function(item){

 			$http.delete('/db/invoices/'+item.value._id+'?rev='+item.value._rev).success(function(d){
 				item.deleted = true;
 			});
 		}

 		$scope.duplicate = function(item){
 			item._id = undefined;
 			item._rev = undefined;
 		}

 		$scope.incomingFilter = function(item) {

 			var candidate = false;
 			for(var i in $scope.incoming.filter.expenseTypes) {
				if (( $scope.incoming.filter.expenseTypes[i]) && (item.value.expenseType == i)) { candidate = true };
 			} 

 			if(!candidate) return false;

			if($scope.incoming.filter.trimester) {
 				var trimester = _.find($scope.interface.trimesters, { id: $scope.incoming.filter.trimester });
 				if (trimester) {
	 				var pattern = new RegExp(trimester.match);	
	 				return pattern.test(item.value.date);
 				}
 			}
 			return false;
 		}

 		$scope.outgoingFilter = function(item) {

 			if($scope.outgoing.filter.trimester) {
 				var trimester = _.find($scope.interface.trimesters, { id: $scope.outgoing.filter.trimester });
 				if (trimester) {
	 				var pattern = new RegExp(trimester.match);	
	 				return pattern.test(item.value.date);
 				}
 			}
 			return true;
		}


 		var val = function(stringValue) {
 			var tmp = parseFloat(stringValue);
 			if (isNaN(tmp)) return 0;
 			return tmp; 
 		};


		var processIncoming = function(a,retval){
 			
 			var items = (typeof a) === 'object' ? a : JSON.parse(a);
 			if (!items.length) { $scope.compute([],true,retval); }

 			for (var i = 0;i<items.length;i++) {
 				$scope.compute(items[i],i==0,retval);
 			}
 		};

 		var processOutgoing = function(a,retval){
 			
 			var items = (typeof a) === 'object' ? a : JSON.parse(a);
			retval.total = 0;
			retval.totalVat = 0;

 			if (!items.length) { return; }

 			for (var i = 0;i<items.length;i++) {
 				 retval.total += val(items[i].value.totalAmount);
 				 retval.totalVat += val(items[i].value.vatAmount);
 			}
 			retval.totalNet = retval.total - retval.totalVat;
 		};

 		var processTrimester = function(a,retval,recurse) {
          

 			var trimester = getTrimester(a);
 			var incoming = getItemsByTrimester(trimester,$scope.incomingInvoices);
 			var outgoing = getItemsByTrimester(trimester,$scope.outgoingInvoices);

 			retval.incoming = {};
 			retval.outgoing = {};

			processIncoming(incoming,retval.incoming);
			processOutgoing(outgoing,retval.outgoing);

 		 	retval.goodsAndServices = retval.incoming.totals.totalAmount - retval.incoming.totals.vatDeductibility;
            retval.dueVATToState = retval.outgoing.totalVat - retval.incoming.totals.vatDeductibility;
            retval.nextTrimesterAccount = retval.dueVATToState / 3;

            if (recurse != 'n') {
            		var prevTrimester = {};
					processTrimester(trimester.previous,prevTrimester,'n');
					retval.lastAccount = retval.dueVATToState - (prevTrimester.nextTrimesterAccount * 2);
			}

 		};

 		var getTrimester = function(trimesterKey) {
 			if(trimesterKey) { return _.find($scope.interface.trimesters, { id: trimesterKey}); } else { return null; }
 		}

 		var getItemsByTrimester = function(trimester,items) {
			
			if(!trimester) { return []; }

			var pattern = new RegExp(trimester.match);	
			var retval = [];

 			_.each(items,function(item){
 				if (pattern.test(item.value.date)) {
 					retval.push(item);
 				}
 			});
 			return retval;
 		}


 		$scope.compute = function(item,isFirst,retval){

 			if (isFirst) {
 				retval.totals = {
 					totalAmount:0,
 					vatAmount:0,
 					vatDeductibility:0
 				};
 			}

 			var totalAmount = val(item.value.totalAmount);
 			var vatAmount = val(item.value.vatAmount);
 			var vatDeductibility = parseFloat(item.value.vatDeductibility);
 			if (isNaN(vatDeductibility)) { vatDeductibility=0; } else { vatDeductibility*=(0.01*vatAmount); }

			retval.totals.totalAmount += totalAmount;
			retval.totals.vatAmount += vatAmount;
			retval.totals.vatDeductibility += vatDeductibility;
 		};

 		$scope.getProcessedVat = function (item){

 			var totalAmount = val(item.value.totalAmount);
 			var vatPercentage = val(item.value.vatPercentage);
 			return  Math.round(100*vatPercentage*(totalAmount/(100+vatPercentage)))/100;

 		};

 		$scope.$watch('incomingInvoices | filter:incomingFilter | json',function(a,b){
 			processIncoming(a,$scope.incoming);
 		});
 		$scope.$watch('outgoingInvoices | filter:outgoingFilter | json',function(a,b){
 			processOutgoing(a,$scope.outgoing);
 		});

 		$scope.$watch('vatReport.filter.trimester', function(a,b) {
 			processTrimester(a,$scope.vatReport,'y');
 		});

 };

var TabsCtrl = function($scope) {

	$scope.editEntry = function(item) {
 			$scope.entry = item.value;
 			$scope.panes[0].selected = true;
 			$scope.$apply();
	}
	
}
