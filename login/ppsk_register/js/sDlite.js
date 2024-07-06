var sDlite = (function () {

    //Immediately returns an anonymous function which builds our modules
    return function (co) {    //co is short for config object
    
    
        //=====Constants======
        cDynUrl         = location.protocol+'//'+document.location.hostname+"/cake4/rd_cake/dynamic-details/info-for.json";
        cAjaxTimeout    = 3000;
        cDynamicData    = undefined; //Will be populated when gettting DynamicDetail from back-end
        cDebug          = true;
               
        //====Functions======
        fDebug          = function(message){  
            if(cDebug){
                console.log(message)  
            }
        };
        
        var fShowError = function(msg){
            msg = '<div>'+msg+'</div>';
            $('#alertWarnRegister').html(msg);
            $('#alertWarnRegister').addClass('show');
        }     
        
        var init = function(){
            fDebug("Logic Inited");     
            getDynamicDetail();
        };
            
        var getDynamicDetail = function(){
            var h       = document.location.hostname;
            var s       = document.location.search;
            
            fDebug("Fetching DynamicDetail");
            
            var ajax = { url: cDynUrl+s, dataType: "json", timeout: cAjaxTimeout};
                           
            $.ajax(ajax)
                .done(function (j) { 
                    if(j.success == true){
                        fDebug("Got Dynamic Detail");                
                        cDynamicData = j.data
                        var c   = sClite({cDynamicData: cDynamicData});
                        c.init();
                    }else{                    
                       fDebug("No Dynamic Detail - Warn them!");
                       fShowError('No Dynamic Detail Found - Try ddding a query string');                     
                    }
                })
                .fail(function (error) {                   
                    console.log(error)
                });
        };
                          
        //Expose those public items...
        return {         
            init  : init
        }   
    }
})();
