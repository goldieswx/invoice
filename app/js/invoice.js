 angular.module('invoice',['ui.bootstrap'])

 .directive('datepicker', function() {
   return {
    restrict: 'A',
    scope: { model : '=ngModel' },
    link: function(scope, element, attrs) {
    	 var ng = $;
         scope.$watch('model',function() { 
          	ng(element).val(scope.model).datepicker("update"); 
         })
         ng(element).datepicker({format:'dd/mm/yyyy'})
			       .change(function(){
			         	scope.model = ng(element).val();
			         	scope.$apply();
		 });
      } 
  }
})


.filter('currency', function() {
    return function(input) {

      if ((typeof input==='string') && (input.length)) { input = parseFloat(input); }
      if (_.isNaN(input) || !_.isNumber(input)) { return '-'; }

      input = Math.round(input*100)/100;
      input = input.toString();
      if (input.indexOf('.') == -1) { input += '.00'; }

      str = input.split('.');
      if (str[0].length >= 3) {
          str[0] = str[0].replace(/(\d)(?=(\d{3})+$)/g, '$1.');
      }
      if (str[1] && str[1].length >= 3) {
          str[1] = str[1].replace(/(\d{3})/g, '$1 ');
      }
      return str.join(',');

    }
})

.filter('percent', function() {
    return function(input) {
      return (Math.round(input*10000)/100)  +  ' %';
    }
})

.directive('numberFormatted', function() {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
		
		  scope.editing = false;
		  scope.ngModel = scope.$eval(attrs.ngModel);
		  if (_.isUndefined(scope.ngModel) || _.isNaN(scope.ngModel) || _.isNull(scope.ngModel)) { 
		  	scope.ngModel = ''; 
			scope.$eval(attrs.ngModel + ' = ngModel;');
		  }

		  var displayNumber = function(scope) {
 		  	return scope.$eval(attrs.ngModel + " | currency");
		  };
		  
		  var getNumberFromInput= function(element) {
		  	 var input =  parseFloat($(element).val().toString().replace(',','.'));
			 if (_.isNaN(input) || _.isNull(input)) { input = ''; }
			 return input;
		  }
		  
          $(element).bind('mouseup',function(e){
		  	 // do not trigger when entering the element.
             if ((typeof e.button !== 'undefined') && (e.button != 2)) { return false; }
			 scope.$apply(function() {		  	
				 scope.editing = false;
    	         scope.ngModel = getNumberFromInput(element);
				 scope.$eval(attrs.ngModel + ' = ngModel;');
				 $(element).val(displayNumber(scope));
			 });			 
          });
          $(element).bind('blur',function(e){
			 scope.$apply(function() {		  	
				 scope.editing = false;
				 $(element).val(displayNumber(scope));
			 });			 
          });
		  
          $(element).bind('focus',function(e){
			 scope.$apply(function() {	
			  	 scope.editing = true;
				 var value = scope.$eval(attrs.ngModel);
				 var displayFocused = value.toString().replace('.',',');
			  	 $(element).val(displayFocused);
			 });
          });
          $(element).bind('keyup',function(e){
			 scope.$apply(function() {
			  	 scope.editing = true;
      	         scope.ngModel = getNumberFromInput(element);
			 });
			 return false;
          });
          scope.$watch(attrs.ngModel,function(e){
             if (scope.editing) { return; }
             $(element).val(displayNumber(scope));
          });
      }
    };
})



.filter('pages',function(){
    return function(a,pager) {
      if (typeof a ==='undefined') return []; 
      if (typeof pager === 'undefined') return  [];
     
      if (typeof pager.currentPage === 'undefined') pager.currentPage = 1;
      if (typeof pager.pageSize === 'undefined') pager.pageSize = 8;
      
      pager.makeIdVisible = function(id) {
              if ((id >= 0) && (id < a.length)) {
                  pager.currentPage = 1+Math.floor(id/pager.pageSize);
                  return pager.currentPage;
              }
      };

      pager.numPages = Math.max(1,Math.ceil(a.length / pager.pageSize));
      pager.from = 1+(pager.currentPage-1)*pager.pageSize;
      pager.to = Math.min(a.length,pager.currentPage*pager.pageSize);
      pager.numItems = a.length;

      return a.slice((pager.currentPage-1)*(pager.pageSize),(pager.currentPage)*(pager.pageSize));
    };
 });
