var rdConnect = (function () {

    //Immediately returns an anonymous function which builds our modules
    return function (co) {    //co is short for config object

        var uamIp,uamPort,uamProto;  //Variables with 'global' scope

        var h               = document.location.hostname;
        var isMikroTik      = getParameterByName('link_status') != "";
        //!!!!
        var urlUse          = location.protocol+'//'+h+'/cake3/rd_cake/radaccts/get_usage.json'
        //!!!!
        var urlUam          = location.protocol+'//'+h+'/login/services/uam.php';
        
        //Be sure this is the same as specified in FB e.g. IP or DNS!!
	    var urlSocialBase   = location.protocol+'//'+h+'/cake3/rd_cake/third-party-auths/index.json'; 
	    
	    //To pull the username and password associated with this ID + typ
	    var urlSocialInfoFor= location.protocol+'//'+h+'/cake3/rd_cake/third-party-auths/info-for.json';
	    
	    //!!!!  
	    var urlAdd			= location.protocol+'//'+h+'/cake3/rd_cake/register-users/new-permanent-user.json';
		var urlLostPw		= location.protocol+'//'+h+'/cake3/rd_cake/register-users/lost-password.json';
		//!!!!
		
		
        var counter         = undefined; //refresh counter's id
        var timeUntilStatus = 20; //interval to refresh
        var refreshInterval = 20; //ditto

	    var timeUntilUsage  = 20 //Default value
	    var usageInterval	= 20;

        //Sometimes the CoovaChilli JSON interface is stubborn; so we have to try again
        var retryCount      = 5; //Make it high to start with --- sometimes it really takes long! //FIXME (was 5)
        var currentRetry    = 0;

        var userName        = undefined;
        var password        = undefined;
        var remember        = false;

	    var ajaxTimeout		= 4000;

        var sessionData     = undefined;
        var counter         = undefined;
	    var notRequired		= [ 'q', 'res',	'challenge', 'called', 'mac', 'ip', 'sessionid', 'userurl', 'md'];
	    var socialName		= undefined;

	    //We store the status feedback in this variable
	    var statusFb		= undefined;
	    
	    var cDynamicData    = undefined;
        var redirect_check 	= false;
        var redirect_url    = undefined;

        if(co.cDynamicData != undefined){
            cDynamicData = co.cDynamicData;
        }
	    
	    cDebug              = false;
	    
	    cMaxWidth           = 270; //270 mobile 600 desktop
        cMinWidth           = 240; //240 mobile 300 desktop
        scrollHeight        = 1000;
        
        var ctcFormDone     = false;
	    
	    fDebug          = function(message){  
            if(cDebug){
                console.log(message)  
            }
        };

        var index   = function(){
        
            //==== Connect Events ====
            if($$('btnLogin') != undefined){
                $$('btnLogin').attachEvent("onItemClick", function(){
                    onBtnConnectClick()
                });
            }
            
            
            if($$('btnGoInternet') != undefined){
                $$('btnGoInternet').attachEvent("onItemClick", function(){
                    onBtnGoInternetClick()
                });
            }
            
            
            if($$('btnDisconnect') != undefined){
                $$('btnDisconnect').attachEvent("onItemClick", function(){
                    onBtnDisconnectClick()
                });
            }
            
            if($$('btnClickToConnect') != undefined){
                $$('btnClickToConnect').attachEvent("onItemClick", function(b){
                    onBtnClickToConnectClickPre(this.$view)
                });
            }
            
            //Social Login things
            if($$('btnFacebook') != undefined){
                $$('btnFacebook').attachEvent("onItemClick", function(){
                    onBtnClickSocialLogin('Facebook');
                });
            }
            
            if($$('btnGoogle') != undefined){
                $$('btnGoogle').attachEvent("onItemClick", function(){
                    onBtnClickSocialLogin('Google');
                });
            }
            
            if($$('btnTwitter') != undefined){
                $$('btnTwitter').attachEvent("onItemClick", function(){
                    onBtnClickSocialLogin('Twitter');
                });
            }
            
            if($$('btnRegister') != undefined){
                $$('btnRegister').attachEvent("onItemClick", function(){
                    onBtnClickRegister();
                });
            }
            
            if($$('btnPassword') != undefined){
                $$('btnPassword').attachEvent("onItemClick", function(){
                    onBtnClickPassword();
                });
            }
            
            if($$('btnClientInfo') != undefined){
                $$('btnClientInfo').attachEvent("onItemClick", function(){
                    onBtnClickClientInfo();
                });
            }

            
            //==== END Connect Events ====
        
            if(uamIp == undefined){
                if(testForHotspot()){
                    fDebug("It is a hotspot, now check if connected or not...");
                    
				    if(cDynamicData.settings.usage_show_check){
					    timeUntilUsage = cDynamicData.settings.usage_refresh_interval;
					    usageInterval  = timeUntilUsage;
				    }
                    refresh(true);
                }else{
                    fDebug("It is NOT a hotspot");
                    window.rdDynamic.showNotHotspot();
                }  
            }else{
                refresh(true);  //Already established we are a hotspot, simply refresh
            }
            
        }

        var initRedirect    = function () {
            if (redirect_url == undefined) {
                var redir_check = false;
                var redir_url  	= 'http://google.com';
                if(cDynamicData != undefined){ //We had to add this since it is not always populated by the time this is run
                    redir_check = cDynamicData.settings.redirect_check;
                    redir_url   = cDynamicData.settings.redirect_url;
                    if (redir_url == undefined) {
                        redir_url = '';
                    }
                }
                redirect_check  = redir_check;
                redirect_url    = redir_url;
            }
        }

        var execRedirect    = function (redir_url) {
            if (redir_url != '' && redir_url != undefined) {
                window.location = redir_url;
            }else{
                //We redirect to google
                window.location = 'http://google.com';
            }
        }
        
        
        var clearRefresh = function(){
            if(counter != undefined){
                clearInterval(counter);
                counter   = undefined;
                timeUntilStatus = refreshInterval;
			    timeUntilUsage  = usageInterval;
            }
        }
        
        var testForHotspot = function () {
            if (isMikroTik) {
                return testForHotspotMT();
            }
            else {
                return testForHotspotCoova();
            }
        }

        var testForHotspotCoova = function(){

            var ip      = getParameterByName('uamip');
            var port    = getParameterByName('uamport');
            
            //ssl test
            var ssl     = getParameterByName('ssl');

            if(ip != ''){  //Override defaults
                uamIp = ip;
            }else{
                return false;   //Not a hotspot
            }
            
            if(ip=='radiusdesk.pmt.pf'){
                ip = "10.1.0.1";
            }
            

            if(port != ''){    //Override defaults
                uamPort = port;
            }
            
            //Default proto = http
            uamProto  = 'http:';
            
            if(ssl != ''){
                //console.log("The Captive Portal Supports SSL");
                //console.log(ssl);
                //Only if the page itself is served on http (since we got a fair amount of cert issues it seems)
                if(location.protocol == 'https:'){ 
                    uamIp       = ssl.replace(":4990/","");
                    uamIp       = uamIp.replace("https://","");
                    uamProto    = 'https:'; //We set is here since it might be that the page is served through http but SSL support included in Coova
                    uamPort     = 4990;
                }
            }
            
            //Pepwave -OCT 2021
            if(uamPort == '8008'){
                //console.log("Pepwave Coova Version Detected");
                //console.log(ssl);
                //Only if the page itself is served on https
                if(location.protocol == 'https:'){ 
                    uamIp       = 'captive-portal.peplink.com';
                    uamProto    = 'https:'; //We set is here since it might be that the page is served through http but SSL support included in Coova
                    uamPort     = 8000;
                }
            }
            
            return true;        //Is a hotspot
        }
        
        var testForHotspotMT = function () {
            var ls = getParameterByName('link_status');
            if (ls != undefined) {  //Override defaults
                return true
            } else {
                return false;   //Not a hotspot
            }
        }

            
        function getParameterByName(name) {
           name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
           var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
               results = regex.exec(location.search);
           return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
        }
        
        var refresh = function (do_usage_also) {

            if (isMikroTik) {
                mtRefresh(do_usage_also);
            } else {
                coovaRefresh(do_usage_also);
            }
        }
        
        var coovaRefresh    = function(do_usage_also){
		    if (typeof(do_usage_also) === "undefined") { do_usage_also = false; } //By default we give feedback
            var urlStatus = uamProto+'//'+uamIp+':'+uamPort+'/json/status';
             
            $.ajax({url: urlStatus + "?callback=?", dataType: "jsonp",timeout: ajaxTimeout})
                .done(function(j){

				    statusFb = j;		//Store the status feedback

				    fDebug("coovaRefresh...");
				    fDebug(j);

                    currentRetry = 0 //Reset the current retry if it was perhaps already some value
				    hideFeedback(); //Hide the feedback
				    
                    if(j.clientState == 0){
                    
                        window.rdDynamic.showConnect();
                        clearRefresh();
                        clearLoginError();                       
                    }

                    if(j.clientState == 1){
                        hideOverlay();
					    initRedirect();
					    if(!redirect_check){
				        
				            window.rdDynamic.showStatus();
				             
                            //Refresh status window
                            refreshStatusCoova(j);

						    //We also want ot get the latest usage if enabled
						    if(do_usage_also){
							    rdUsageRefresh();
						    }

                            if(counter == undefined){    //If it is the first time so initialise the loop counter
                                sessionData = j;
                                refreshCounter();
                            }
                        }
                    }
                })
                .fail(function(){
                    //console.log("Could not fetch the coova status");	
                    //We will retry for me.retryCount
                    currentRetry = currentRetry+1;
                    if(currentRetry <= retryCount){
                        //console.log("Retry to fetch Coova status "+currentRetry);
                        coovaRefresh(do_usage_also);
                    }else{
                        fDebug("Timed out"); //FIXME
                        webix.alert({
                            title: i18n('sHotspot_not_responding'),
                            text: i18n('sThe_hotspot_is_not_responding_to_status_queries'),
                            type:"confirm-error"
                        }); 
                        showLoginError(i18n('sHotspot_not_responding'));
                    }
                });
        }
         
        var mtRefresh = function (do_usage_also) {

            if (typeof (do_usage_also) === "undefined") { do_usage_also = false; } //By default we give feedback
            var urlStatus = getParameterByName('link_status');

            $.ajax({ url: urlStatus + "?var=?", dataType: "jsonp", timeout: ajaxTimeout })
                .done(function (j) {
                    statusFb = j;		//Store the status feedback

                    fDebug("mtRefresh...");
                    fDebug(j);

                    currentRetry = 0 //Reset the current retry if it was perhaps already some value
                    if (j.logged_in == 'no') {

                        window.rdDynamic.showConnect();
                        clearRefresh();
                        clearLoginError();
                    }

                    if (j.logged_in == 'yes') {
                        hideOverlay();
                        var redirect_check = false;
                        var redirect_url = 'http://google.com';
                        if (cDynamicData != undefined) { //We had to add this sine it is not always populated by the time this is run
                            redirect_check = cDynamicData.settings.redirect_check;
                            redirect_url = cDynamicData.settings.redirect_url;
                        }

                        if (redirect_check) {
                            window.location = redirect_url;
                        } else {

                            window.rdDynamic.showStatus();

                            //Refresh status window
                            refreshStatusMikrotik(j);

                            //We also want ot get the latest usage if enabled
                            if (do_usage_also) {
                                rdUsageRefresh();
                            }

                            if (counter == undefined) {    //If it is the first time so initialise the loop counter
                                sessionData = j;
                                refreshCounter();
                            }
                        }
                    }
                })
                .fail(function () {
                    //console.log("Could not fetch the coova status");	
                    //We will retry for me.retryCount
                    currentRetry = currentRetry + 1;
                    if (currentRetry <= retryCount) {
                        //console.log("Retry to fetch Coova status "+currentRetry);
                        mtRefresh(do_usage_also);
                    } else {
                        fDebug("Timed out"); //FIXME
                        webix.alert({
                            title: i18n('sHotspot_not_responding'),
                            text: i18n('sThe_hotspot_is_not_responding_to_status_queries'),
                            type: "confirm-error"
                        });
                        showLoginError(i18n('sHotspot_not_responding'));
                    }
                });
        }
        
        
        var showLoginError = function(msg){
		    if($$('tplConnectInfo') == undefined){
		        return;
		    }
		    var t= $$('tplConnectInfo').getNode();
		    $(t).removeClass("fbInfo");
		    $(t).addClass("fbError");
		    $$('tplConnectInfo').setHTML(msg);
            $$('tplConnectInfo').show();
            
            hideOverlay();
            	
        }

	    var clearLoginError	= function(){
		    hideFeedback();
	    }
	    
	    var showOverlay = function(){
	        $$("layoutConnect").showOverlay('<div style="background-color: grey; opacity: 0.5; height:100%; width: 100%; margin:0px;padding:0px;"></div>');
	    }
	    
	    var hideOverlay = function(){
	        //Hide the overlay
            $$("layoutConnect").hideOverlay();
	    }
        
        var showFeedback	= function(msg){
		    //console.log("Show feedback "+msg);
		    if($$('tplConnectInfo') == undefined){
		        return;
		    }
		    var t= $$('tplConnectInfo').getNode();
		    $(t).removeClass("fbError");
		    $(t).addClass("fbInfo");
            $$('tplConnectInfo').setHTML(msg);
            $$('tplConnectInfo').show();
	    }

	    var hideFeedback	= function(){
		    fDebug("Hide feedback");
		    if($$('tplConnectInfo') == undefined){
		        return;
		    }
		    
		  //  $$('tplConnectInfo').hide();
		    $$('tplConnectInfo').setHTML("");
		    $$('tplConnectInfo').define("css", "");
		    $$('tplConnectInfo').refresh();
	    }
	    
	    //____ Go Onto Internet _____
	    var onBtnGoInternetClick = function(){
            initRedirect();
            execRedirect(redirect_url);
            /*if(redirect_url != ''){
                window.open(redirect_url, '_blank');
            }      */
	    }
	    
	    
	    //_______Disconnect_______
	    var onBtnDisconnectClick = function(){
	        showOverlay();
		    showFeedback(i18n('sDisconnect_the_user'));
		    
		    var urlLogoff = uamProto+'//'+uamIp+':'+uamPort+'/json/logoff';
		    var cb        = "?callback?"; //Coova uses 'callback'
		    
		    if(isMikroTik) {
                urlLogoff = getParameterByName('link_logout');
                cb = "?var=?"; //MT uses 'var'
            }
           
            $.ajax({url: urlLogoff +cb, dataType: "jsonp",timeout: ajaxTimeout ,date: {}})
            .done(function(j){    
                hideOverlay();
                if(isMikroTik){
                    mtRefresh(); //Refresh
                }else{
                    refresh();
                }
            })
            .fail(function(){
                //We will retry for me.retryCount    
                currentRetry = currentRetry+1;
                if(currentRetry <= retryCount){
                    onBtnDisconnectClick();
                }else{
                    showLoginError(i18n('sCoova_Not_responding_to_logoff_requests'));
                }
            });
	    }
	    
	     var refreshStatusMikrotik = function(j){     
            var dat_i   = bytes(j.bytes_in);
            var dat_o   = bytes(j.bytes_out);
            var t       = parseInt(j.bytes_out) + parseInt(j.bytes_in);
            var dat_t   = bytes(t);      
            $$('propertySession').setValues({acct_un:j.username,acct_up:j.uptime,acct_di:dat_i,acct_do:dat_o,acct_dt:dat_t});
             
        }
	    
	    var refreshStatusCoova = function(j){

            var gw = 4294967296;

            var time_i  = time(j.accounting.idleTime);
            var time_s  = time(j.accounting.sessionTime);
            var d_in    = (j.accounting.inputOctets+(j.accounting.inputGigawords*gw));
            var d_out   = (j.accounting.outputOctets+(j.accounting.outputGigawords*gw));
            var usr     = j.session.userName;

            var dat_i   = bytes(d_in);
            var dat_o   = bytes(d_out);
            var t       = d_in + d_out;
            var dat_t   = bytes(t);
            
            $$('propertySession').setValues({acct_un:usr,acct_up:time_s,acct_di:dat_i,acct_do:dat_o,acct_dt:dat_t});
        }
        
        var refreshCounter = function(){
            var me = this; 

            counter = setInterval (function(){
			    //Status part
                timeUntilStatus = timeUntilStatus-1;
                if(false){    //We remove ourself gracefully FIXME
                    clearInterval(counter);
                    counter   = undefined;
                    timeUntilStatus = refreshInterval;
                }else{
                    $('#status_refresh').text(timeUntilStatus);
                    if(timeUntilStatus == 0){      //Each time we reach null we refresh the screens
                        timeUntilStatus = refreshInterval; //Start anew
                        refresh();
                    }
                }

			    //Usage part
			    timeUntilUsage = timeUntilUsage-1;
                if(false){    //We remove ourself gracefully FIXME
                    clearInterval(counter);
                    counter   = undefined;
                    timeUntilUsage = usageInterval;
                }else{
                    $('#usage_refresh').text(timeUntilUsage);
                    if(timeUntilUsage == 0){      //Each time we reach null we refresh the screens
                        timeUntilUsage = usageInterval; //Start anew
                        rdUsageRefresh();
                    }
                }

            }, 1000 );
        }
        
        var rdUsageRefresh = function(){

		    if(cDynamicData.settings.usage_show_check == false){
			    return;
		    }
		    
		    if(isMikroTik){
		         if(statusFb != undefined){
			        if(statusFb.mac == undefined){
				        return;
			        }else{
                        var mac = statusFb.mac.replace(/:/g, "-");
			        }
			        if(statusFb.username == undefined){
				        return;
			        }else{
				        var un	= statusFb.username;
			        }
		        }
		    }else{
		        if(statusFb != undefined){
			        if(statusFb.redir == undefined){
				        return;
			        }else{
				        var mac	= statusFb.redir.macAddress;
			        }
			        if(statusFb.session == undefined){
				        return;
			        }else{
				        var un	= statusFb.session.userName;
			        }
		        }
		    }

            $.getJSON(urlUse,{'username' : un, 'mac' : mac}, 
                function(j) {

                    fDebug(j);
				    if(j.success == false){
					    return;
				    }

                    //If the time available is 'NA' we must hide the time div
                    if(j.data.time_cap == null){
                        $$('sliderTime').hide();

                    }else{

                        var time_total     = j.data.time_cap;
			            var pers_time_used = (j.data.time_used / j.data.time_cap) * 100;
					    var time_avail	   = j.data.time_cap - j.data.time_used;
                        
                        $$('sliderTime').setValue(pers_time_used);
                        $$('sliderTime').define("title", "<strong>"+i18n('sUsed')+" </strong>"+time(j.data.time_used)+"<strong> "+i18n('sAvailable')+" </strong>"+ time(time_avail));
                        $$('sliderTime').refresh();
                        
                    }

                    //If the data available is 'NA' we must hide the time div
                    if(j.data.data_cap == null){
                        $$('sliderData').hide();
                    }else{

                        var data_total     = j.data.data_cap;
			            var pers_data_used = (j.data.data_used / j.data.data_cap) * 100;  
					    var data_avail	   = j.data.data_cap - j.data.data_used;
					    
                        $$('sliderData').setValue(pers_data_used);
                        $$('sliderData').define("title", "<strong>"+i18n('sUsed')+" </strong>"+bytes(j.data.data_used)+"<strong> "+i18n('sAvailable')+" </strong>"+ bytes(data_avail));
$$('sliderData').refresh();
                        
                        //.html("<strong>Used </strong>"+bytes(j.data.data_used)+"<strong> Available </strong>"+ bytes(data_avail));


                    }
                });
        }
        
        //===========================================================
        //===========================================================
        //===========================================================				
		var showForm = function(winId, node){
		    //console.log(node);
            $$(winId).getBody().clear();
            $$(winId).show(node);
            $$(winId).getBody().focus();
        }
       
       var onBtnClickClientInfo = function(b){
            var form = $$('layoutClientInfo')
            if (form.validate()){ //validate form   
                console.log("Validated :-)");
    
                var values      = form.getValues();              
                var mac_address = getParameterByName('mac');
                values.mac      = mac_address 

                var called      = getParameterByName('called');
                values.cp_mac   = called;
    
                var nasid       = getParameterByName('nasid');
                values.nasid    = nasid;
    
                //This might not always be included
                var ssid        = getParameterByName('ssid');
                if(ssid !== ''){
                    values.ssid = ssid;
                }   
                    
                var add_mac  = location.protocol+'//'+document.location.hostname+"/cake3/rd_cake/data-collectors/add-mac.json";
                webix.ajax().timeout(3000).post(
                    add_mac,
                    values,
                    { 
                    error   : function(text, data, XmlHttpRequest){
                        console.log("ERROR -> Adding MAC");    
                    },
                    success : function(text, data, XmlHttpRequest){
                        if(data.json().success == true){
                          //console.log("ADDED MAC NOW TRY TO CONNECT");
                          webix.message("All is correct");              
                          $$('winClientInfo').hide();
                          $$('winLogin').show();
                          onBtnClickToConnectClick();                      
                        }else{
                            //console.log("OTHER ERROR");
                            webix.message({ type:"error", text:data.json().message });   
                        }
                    }
                });          
                    
            }else{
				    webix.message({ type:"error", text:"Form data is invalid" });                 
            }      
       }
                
        var onBtnClickToConnectClickPre = function(b){
        
            console.log(cDynamicData.settings.click_to_connect.cust_info_check);
            if(cDynamicData.settings.click_to_connect.cust_info_check == false){          
                onBtnClickToConnectClick();       
            }else{
        
                var formData    = new FormData();
                //-- ADD ON --
                var mac_address = getParameterByName('mac');
                formData.append("mac", mac_address);
                
                var nasid       = getParameterByName('nasid');
                formData.append("nasid", nasid);
                     
                var email_check = location.protocol+'//'+document.location.hostname+"/cake3/rd_cake/data-collectors/mac-check.json";
                
                webix.ajax().timeout(3000).post(
                    email_check,formData,{ 
                    error   : function(text, data, XmlHttpRequest){
                        console.log("ERROR -> Getting Info for MAC");    
                    },
                    success : function(text, data, XmlHttpRequest){
                        if(data.json().success == true){
                            if(data.json().data.ci_required == true){
                                //if(ctcFormDone == false){ //If not already done 
                                //    buildClickToConnectForm(data.json().data);
                                //}
                                $$('winLogin').hide();
                                $$('winClientInfo').show();
                                window.rdDynamic.resize();                                 
                                                    
                            }else{
                                onBtnClickToConnectClick();
                            }
                        }else{
                            console.log("OTHER ERROR");   
                        }
                    }
                });             
            }
            //-- END ADD ON --			
        }
        
        var onBtnClickToConnectClick = function(b){
        
            var c_t_c_element	= cDynamicData.settings.click_to_connect.connect_suffix;
			var element_val     = getParameterByName(c_t_c_element);

			var c_t_c_username 	= cDynamicData.settings.click_to_connect.connect_username+"@"+element_val;
			var c_t_c_password	= cDynamicData.settings.click_to_connect.connect_username;
            userName 			= c_t_c_username;
            password 			= c_t_c_password;
            
            if(cDynamicData.settings.t_c_check == true){
		        if($$('checkboxTandC') != undefined){
		            if(!$$('checkboxTandC').getValue()){
		                showLoginError(i18n('sFirst_agree_to_T_amp_C'));
		                return;
		            }
		        }
		    } 
		    showOverlay(); 
		     if (isMikroTik) {
                login();
            } else {
                getLatestChallenge();
            }         
        }
         
        var onBtnConnectClick = function(){  //Get the latest challenge and continue from there onwards....
                   
            //Auto suffix check
		    var auto_suffix_check   = cDynamicData.settings.auto_suffix_check;
		    var auto_suffix			= cDynamicData.settings.auto_suffix;

		    //First we need to determine if the user used a Voucher or Username/Password
		    var voucher_present = false;
		    var user_present	= false;
		    
		    //Clear previous errors
		    clearLoginError();

		    if ($$('voucher') != undefined){ //This means the voucher controll is there	
			    voucher_present = true;
		    }

		    if ($$('Username') != undefined){ //This means the user controll is there	
			    user_present = true;
		    }

		    //User and Voucher present
		    if((voucher_present)&&(user_present)){
			    //console.log("Voucher and user present");
			    var found_flag = false;

			    //Both empty
			    if(	($$('voucher').getValue().length == 0)&&
				    ($$('Username').getValue().length == 0)
			    ){
				    //console.log("voucher and user EMPTY");
				    showLoginError(i18n('sRequired_value_missing_dash_Please_supply'));
                	return;
			    }

			    //Voucher specified
			    if($$('voucher').getValue().length > 0){
				    userName = encodeURI($$('voucher').getValue());
                	password = $$('voucher').getValue();
				    found_flag = true;	   
			    }

			    //Username specified
			    if(($$('Username').getValue().length > 0)&&($$('Password').getValue().length > 0)){
				    userName = encodeURI($$('Username').getValue().toLowerCase()); //Make it lowercase since some browsers make first character UC
            		password = $$('Password').getValue();
				    found_flag = true;
			    }

			    if(!found_flag){
				    showLoginError(i18n('sRequired_value_missing_dash_Please_supply'));
                	return;
			    }
		    }
		
		    if((voucher_present)&&(user_present == false)
		    ){
			    if($$('voucher').getValue().length == 0){
				    showLoginError(i18n('sSupply_value_for_voucher'));
				    return;
			    }
			    userName = encodeURI($$('voucher').getValue());
                password = $$('voucher').getValue();
		    }

		    if((user_present)&&(voucher_present == false)
		    ){
			    if(($$('Username').getValue().length == 0)||($$('Password').getValue().length == 0)){
				    showLoginError(i18n('sSupply_both_username_and_password'));
                	return;
			    }
			    if($$('Username').getValue().length == 0){
				    showLoginError(i18n('sSupply_Username'));
                	return;
			    }
			    if($$('Password').getValue().length == 0){
				    showLoginError(i18n('sSupply_Password'));
                	return;
			    }
			    userName = encodeURI($$('Username').getValue().toLowerCase()); //Make it lowercase since some browsers make first character UC
        		password = $$('Password').getValue();
		    }
		    
		    if(cDynamicData.settings.t_c_check == true){
		        if($$('checkboxTandC') != undefined){
		            if(!$$('checkboxTandC').getValue()){
		                showLoginError(i18n('sFirst_agree_to_T_amp_C'));
		                return;
		            }
		        }
		    }
		    
		    //Auto suffix for permanent users only
		    if($$('Username') != undefined){
			    if(
			        (auto_suffix_check)&&($$('Username').getValue().length != 0)
			    ){
				    //Check if not already in username
				    var re = new RegExp(".+@"+auto_suffix+"$");
				    if(userName.match(re)==null){
				        userName = userName+'@'+auto_suffix;
				    }
			    }
			}
			
			
			showOverlay();
         	if (isMikroTik) {
                login(password);
            } else {
                getLatestChallenge();
            }  
        }
        
        var getLatestChallenge = function(){
		    showFeedback(i18n('sGet_latest_challenge'));
            var urlStatus = uamProto+'//'+uamIp+':'+uamPort+'/json/status';
            $.ajax({url: urlStatus + "?callback=?", dataType: "jsonp",timeout: ajaxTimeout})
            .done(function(j){
			    hideFeedback();
                currentRetry = 0;
                if(j.clientState == 0){
                    encPwd(j.challenge);
                }
                if(j.clientState == 1){
                    //Show status screen since we don't need the challenge
                    coovaRefresh(true);
                }
            })
            .fail(function(){
                //We will retry for me.retryCount
                currentRetry = currentRetry+1;
                if(currentRetry <= retryCount){
                    getLatestChallenge();
                }else{

                    webix.alert({
                        title: i18n('sHotspot_not_responding'),
                        text: i18n('sLatest_Challenge_could_not_be_fetched_from_hotspot'),
                        type:"confirm-error"
                    }); 
                    showLoginError(i18n('sLatest_Challenge_could_not_be_fetched_from_hotspot'));
                }
            });
        }

        var encPwd = function(challenge){ 
		    showFeedback(i18n('sGet_encrypted_values'));
            $.ajax({url: urlUam + "?callback=?", dataType: "jsonp",timeout: ajaxTimeout, data: {'challenge': challenge, password: password}})
            .done(function(j){
			    currentRetry = 0;
                login(j.response);
			    hideFeedback();
            })
            .fail(function(){ 
			    //We will retry for me.retryCount
                currentRetry = currentRetry+1;
                if(currentRetry <= retryCount){
                    encPwd(challenge);
                }else{
                     webix.alert({
                        title: i18n('sUAM_server_is_down'),
                        text: i18n('sUAM_service_is_down'),
                        type:"confirm-error"
                    }); 
                    showLoginError(i18n('sUAM_service_is_down'));
                }
            });
        }

        var login = function (encPwd) {
            showFeedback(i18n('sLog') + " " + userName + " " + i18n('sinto_Captive_Portal'));
            var urlLogin = "";
            var ajax ={};
            if (isMikroTik) {
                urlLogin = getParameterByName('link_login_only');
                ajax = {url: urlLogin + "?var=?", dataType: "jsonp",timeout: ajaxTimeout, data: {username: userName, password: password}};
            } else {
                urlLogin = uamProto+'//' + uamIp + ':' + uamPort + '/json/logon';
                ajax = { url: urlLogin + "?callback=?", dataType: "jsonp", timeout: ajaxTimeout, data: { username: userName, password: encPwd } };
            }         
            $.ajax(ajax)
                .done(function (j) {
                    if(isMikroTik){
                        loginResultsMt(j);
                    }else{
                        loginResultsCoova(j);
                    }
                })
                .fail(function (error) {
                    //We will retry for me.retryCount
                    currentRetry = currentRetry + 1;
                    if (currentRetry <= retryCount) {
                        login(encPwd);
                    } else {
                        if (isMikroTik) {
                            error = i18n('sMT_Not_responding_to_login_requests');
                        } else {
                            error = i18n('sCoova_Not_responding_to_login_requests');
                        }

                        webix.alert({
                            title: error,
                            text: error,
                            type: "confirm-error"
                        });
                        showLoginError(i18n('sCoova_Not_responding_to_login_requests'));
                    }
                });
        }
        
        var loginResultsMt = function(j){

            currentRetry = 0;    //Reset if there were retries
            if(j.logged_in == 'yes'){          
                mtRefresh(true); //Refresh
            }else{
                var msg = i18n('sAuthentication_failure_please_try_again')
                if(j.error_orig != undefined){
                    msg =j.error_orig;
                }
                showLoginError(msg);  
            }
        }
        
        var loginResultsCoova = function(j){
            currentRetry = 0;    //Reset if there were retries
            if(j.clientState == 0){    
                var msg = i18n('sAuthentication_failure_please_try_again')
                if(j.message != undefined){
                    msg =j.message;
                }
                showLoginError(msg);
            }else{      
                initRedirect();
                if(redirect_check) {
                    execRedirect(redirect_url)
                } else {
                    refresh(true); //Refresh
                }
            }
        }
        
        //===================
        //_________ Social Login _________________
	    var onBtnClickSocialLoginMt = function(a){
            var me 				= this;   
            if(cDynamicData.settings.t_c_check == true){
		        if($$('checkboxTandC') != undefined){
		            if(!$$('checkboxTandC').getValue()){
		                showLoginError(i18n('sFirst_agree_to_T_amp_C'));
		                return;
		            }
		        }
		    }
		    
            showOverlay();
            
		    socialName  = a
		    showFeedback(i18n('sStarting_social_login_for')+' '+ socialName)

            userName = cDynamicData.settings.social_login.temp_username; 
            password = cDynamicData.settings.social_login.temp_password;  
            socialTempLoginMt(); 
	    }
                
        var socialTempLoginMt	= function(){
		    showFeedback(i18n('sLog_temp_user_into_Captive_Portal'));

            var urlLogin = getParameterByName('link_login_only');
            $.ajax({url: urlLogin + "?var=?", dataType: "jsonp",timeout: ajaxTimeout, data: {username: userName, password: password}})
            .done(function(j){
                socialTempLoginResultsMt(j);
            })
            .fail(function(){
                //We will retry for retryCount
                currentRetry = currentRetry+1;
                if(currentRetry <= retryCount){
                    socialTempLogin();
                }else{
                    showLoginError(i18n('sMT_Not_responding_to_login_requests'));
                }
            });
	    }
	    
	    
	    var socialTempLoginResultsMt = function(j){

            currentRetry = 0;    //Reset if there were retries
            if(j.logged_in == 'no'){       
                var msg = i18n('sAuthentication_failure_please_try_again')
                if(j.error_orig != undefined){
                    msg =j.error_orig;
                }
                showLoginError(msg);
            }else{            
                //console.log("Temp social login user logged in fine.... time to check if we are authenticated");
			    //We need to add a query string but do not need to add ALL the items

			    var queryString 		= window.location.search;
			    queryString 			= queryString.substring(1);
			    var query_object		= parseQueryString(queryString);
			    var required			= query_object;

			    $.each(notRequired, function( index, value ) { //FIXME adapt the notRequired list for MT
				    //console.log( index + ": " + value );
				    delete required[value];
			    });

			    required.pathname   	= window.location.pathname;
                required.hostname   	= window.location.hostname;
                required.protocol   	= window.location.protocol;
			    required.social_login 	= 1;
			    required.idp_name       = socialName;
			    var q_s 	 			= $.param(required);
			    window.location			= urlSocialBase+"?"+q_s;
            }
	    }
        

        //FIXME this needs to run during startup! 
        var checkSocialLoginReturnMt = function(){

           	if(	(getParameterByName('sl_type') 	!= '')&& //e.g. user or voucher
			    (getParameterByName('sl_name') 	!= '')&& //e.g. Facebook
			    (getParameterByName('sl_value') != '')   //e.g. 3_34564654645694 (Dynamic Pages ID + provider unique ID)
		    ){ 
			    //console.log("Finding transaction details for "+ me.queryObj.tx);
			

			    var t = getParameterByName('sl_type');
			    var n = getParameterByName('sl_name');
			    var v = getParameterByName('sl_value');

			    t = t.replace(/#.?/g, ""); //JQuery Mobile tend to add a #bla which we need to filter out
			    n = n.replace(/#.?/g, "");
			    v = v.replace(/#.?/g, "");

			    var jqxhr = $.getJSON( urlSocialInfoFor, {'sl_type' : t,'sl_name' : n,'sl_value' : v}, function(j) {
				    //console.log( "success getting social login return" );
				    if(j.success){   
					    userName = j.data.username; //Makes this unique
					    password = j.data.password;   
					    socialTempDisconnectMt();
				    }else{
					    //console.log("big problems");
					    showLoginError(i18n('sCould_not_retrieve_Social_Login_Info')); 
				    }
			    })
			    .fail(function() {
				    showLoginError(i18n('sCould_not_retrieve_Social_Login_Info')); 
			    });
            }
	    }
	    
	    var socialTempDisconnectMt 	=  function(){
	    
            showFeedback(i18n('sDisconnect_the_social_temp_user'));
            var urlLogout = getParameterByName('link_logout');
            $.ajax({url: urlLogout + "?var=?", dataType: "jsonp",timeout: ajaxTimeout,date: {}})
            .done(function(j){
                retryCount = 0;
                socialFinalLoginMt();
            })
            .fail(function(){ 
                //We will retry for me.retryCount
                currentRetry = currentRetry+1;
                if(currentRetry <= retryCount){
                    socialTempDisconnectMt();
                }else{
                    showLoginError(i18n('sMT_Not_responding_to_logout_requests'));
                }     
            });
        }

        var socialFinalLoginMt = function(encPwd){
		    showFeedback(i18n('sDoing_final_login'));

            var urlLogin = getParameterByName('link_login_only');
            $.ajax({url: urlLogin + "?var=?", dataType: "jsonp",timeout: ajaxTimeout, data: {username: userName, password: password}})
            .done(function(j){
                socialFinalLoginResultsMt(j);
            })
            .fail(function(){
                //We will retry for retryCount
                currentRetry = currentRetry+1;
                if(currentRetry <= retryCount){
                    socialFinalLoginMt();
                }else{
                    showLoginError(i18n('sMT_Not_responding_to_login_requests'));
                }
            });
        }
          
        var socialFinalLoginResultsMt = function(j){
            hideFeedback();
            currentRetry = 0;    //Reset if there were retries
            if(j.logged_in == 'yes'){          
                var redirect_check 	= false;
			    var redirect_url  	= 'http://google.com';
			    if($("body").data("DynamicDetail") != undefined){ //We had to add this sine it is not always populated by the time this is run
				    redirect_check = cDynamicData.settings.redirect_check;
				    redirect_url   = cDynamicData.settings.redirect_url;
			    }
			    if(redirect_check){
		            window.location= redirect_url;
			    }else{             
                    mtRefresh(true); //Refresh session and usage
                }
            }else{
                var msg = i18n('sAuthentication_failure_please_try_again')
                if(j.error_orig != undefined){
                    msg =j.error_orig;
                }
                showLoginError(msg);  
            }
        } 
        //=====================
        
        var onBtnClickSocialLogin = function(a){
            if (isMikroTik) {
                onBtnClickSocialLoginMt(a);
            }else{
                onBtnClickSocialLoginChilli(a);
            }
        }
            
        //_________ Social Login _________________
	    var onBtnClickSocialLoginChilli = function(a){
	    
	        if(cDynamicData.settings.t_c_check == true){
		        if($$('checkboxTandC') != undefined){
		            if(!$$('checkboxTandC').getValue()){
		                showLoginError(i18n('sFirst_agree_to_T_amp_C'));
		                return;
		            }
		        }
		    }

            showOverlay();
		    //socialName = a.toLowerCase();
		    socialName = a
		    showFeedback(i18n('sStarting_social_login_for')+' '+ socialName)

		    var urlStatus = uamProto+'//'+uamIp+':'+uamPort+'/json/status';
            $.ajax({url: urlStatus + "?callback=?", dataType: "jsonp",timeout: ajaxTimeout})
            .done(function(j){
			    hideFeedback();
                currentRetry = 0;
                if(j.clientState == 0){
				    userName = cDynamicData.settings.social_login.temp_username; //Makes this unique
            		password = cDynamicData.settings.social_login.temp_password;  
                    socialTempEncPwd(j.challenge);
                }
                if(j.clientState == 1){ //FIXME Think we should redirect to Social Login Login...
                    if(userName.startsWith('sl_')) {     // Check if the logged in user is of the special social login type
                           if (redirect_check) {         // Check if the dynamic login page instructs us to redirect to a URL
                                execRedirect(redirect_url);
                           } else {
                                refresh();  
                           }
                    } else {                             // If the user is not of the social login type, simply refresh and show status page
                        refresh();
                    }
                    
                }
            })
            .fail(function(){
                //We will retry for me.retryCount
                currentRetry = currentRetry+1;
                
                if(currentRetry <= retryCount){
                    onBtnClickSocialLogin(a);
                }else{
                    fDebug("Timed out"); //FIXME
                    webix.alert({
                        title: i18n('sHotspot_not_responding'),
                        text: i18n('sThe_hotspot_is_not_responding_to_status_queries'),
                        type:"confirm-error"
                    }); 
                    showLoginError(i18n('sHotspot_not_responding'));
                }  
            });
	    }

	    var socialTempEncPwd = function(challenge){
		    showFeedback(i18n('sGet_encrypted_values_for_temp_login'));
            $.ajax({url: urlUam + "?callback=?", dataType: "jsonp",timeout: ajaxTimeout, data: {'challenge': challenge, password: password}})
            .done(function(j){
                socialTempLogin(j.response);
			    hideFeedback();
            })
            .fail(function(){
                showLoginError(i18n('sUAM_service_is_down')); 
            });
	    }

	    var socialTempLogin	= function(encPwd){
		    showFeedback(i18n('sLog_temp_user_into_Captive_Portal'));
            var urlLogin = uamProto+'//'+uamIp+':'+uamPort+'/json/logon';
            $.ajax({url: urlLogin + "?callback=?", dataType: "jsonp",timeout: ajaxTimeout, data: {username: userName, password: encPwd}})
            .done(function(j){
                socialTempLoginResults(j);
            })
            .fail(function(){
                //We will retry for me.retryCount
                currentRetry = currentRetry+1;
                if(currentRetry <= retryCount){
                    socialTempLogin(encPwd);
                }else{
                    showLoginError(i18n('sCoova_Not_responding_to_login_requests'));
                }
            });
	    }

	    var socialTempLoginResults = function(j){
            currentRetry = 0;    //Reset if there were retries
            if(j.clientState == 0){       
                var msg = i18n('sAuthentication_failure_please_try_again')
                if(j.message != undefined){
                    msg =j.message;
                }
                showLoginError(msg);
            }else{            
                //console.log("Temp social login user logged in fine.... time to check if we are authenticated");
			    //We need to add a query string but do not need to add ALL the items

			    var queryString 		= window.location.search;
			    queryString 			= queryString.substring(1);
			    var query_object		= parseQueryString(queryString);
			    var required			= query_object;

			    $.each(notRequired, function( index, value ) {
				    //console.log( index + ": " + value );
				    delete required[value];
			    });

			    required.pathname   	= window.location.pathname;
                required.hostname   	= window.location.hostname;
                required.protocol   	= window.location.protocol;
			    required.social_login 	= 1;
			    required.idp_name       = socialName;
			    var q_s 	 			= $.param(required);
			    //console.log(q_s);
			    //Dynamically build the redirect URL to which Social Login we will use...
			    window.location			= urlSocialBase+"?"+q_s;
            }
	    }
	    
	    var checkSocialLoginReturn = function(){
	        if(isMikroTik){
                checkSocialLoginReturnMt();
            }else{
                checkSocialLoginReturnChilli()
            }  
	    }

        var checkSocialLoginReturnChilli = function(){

		    //console.log("Check for social login returns...");

           	if(	(getParameterByName('sl_type') 	!= '')&& //e.g. user or voucher
			    (getParameterByName('sl_name') 	!= '')&& //e.g. Facebook
			    (getParameterByName('sl_value') != '')   //e.g. 3_34564654645694 (Dynamic Pages ID + provider unique ID)
		    ){ 
			    //console.log("Finding transaction details for "+ me.queryObj.tx);
			    var t = getParameterByName('sl_type');
			    var n = getParameterByName('sl_name');
			    var v = getParameterByName('sl_value');

			    t = t.replace(/#.?/g, ""); //JQuery Mobile tend to add a #bla which we need to filter out
			    n = n.replace(/#.?/g, "");
			    v = v.replace(/#.?/g, "");

			    var jqxhr = $.getJSON( urlSocialInfoFor, {'sl_type' : t,'sl_name' : n,'sl_value' : v}, function(j) {
				    //console.log( "success getting social login return" );
				    if(j.success){   
					    userName = j.data.username; //Makes this unique
					    password = j.data.password;   
					    //console.log(j.data.username);
					    //console.log(j.data.password);
					    socialTempDisconnect();
				    }else{
					    //console.log("big problems");
					    showLoginError(i18n('sCould_not_retrieve_Social_Login_Info'));
				    }
			    })
			    .fail(function() {
				    showLoginError(i18n('sCould_not_retrieve_Social_Login_Info')); 
			    });
            }
	    }

	    var socialTempDisconnect 	=  function(){

            showFeedback(i18n('sDisconnect_the_social_temp_user'));
            var urlLogoff = uamProto+'//'+uamIp+':'+uamPort+'/json/logoff';

            $.ajax({url: urlLogoff + "?callback=?", dataType: "jsonp",timeout: ajaxTimeout})
            .done(function(j){     
			    socialFinalSatus();
            })
            .fail(function(){
                //We will retry for me.retryCount
                currentRetry = currentRetry+1;
                if(currentRetry <= retryCount){
                    socialTempDisconnect();
                }else{
                    showLoginError(i18n('sCoova_Not_responding_to_logoff_requests'));
                }
            });
        }

	    var socialFinalSatus = function(){
		    showFeedback(i18n('sGet_final_status_for_social_login'));
		    var urlStatus = uamProto+'//'+uamIp+':'+uamPort+'/json/status';
            $.ajax({url: urlStatus + "?callback=?", dataType: "jsonp",timeout: ajaxTimeout})
            .done(function(j){
			    hideFeedback();
                currentRetry = 0;
                if(j.clientState == 0){
				    socialFinalEncPwd(j.challenge);
                }
                if(j.clientState == 1){ 
                    initRedirect();
                    if(redirect_check){
                        execRedirect(redirect_url);
				    }else{             
                        refresh(); //Refresh 
                    }
                }
            })
            .fail(function(){
                //We will retry for me.retryCount
                currentRetry = currentRetry+1;          
                if(currentRetry <= retryCount){
                    socialFinalSatus();
                }else{
                    fDebug("Timed out"); //FIXME
                    webix.alert({
                        title: i18n('sHotspot_not_responding'),
                        text: i18n('sThe_hotspot_is_not_responding_to_status_queries'),
                        type:"confirm-error"
                    }); 
                    showLoginError(i18n('sHotspot_not_responding'));
                }     
            });
        }

	    var socialFinalEncPwd = function(challenge){

		    showFeedback(i18n('sEncrypting_final_password'));
            $.ajax({url: urlUam + "?callback=?", dataType: "jsonp",timeout: ajaxTimeout, data: {'challenge': challenge, password: password}})
            .done(function(j){
                socialFinalLogin(j.response);
			    hideFeedback();
            })
            .fail(function(){
                showLoginError(i18n('sUAM_service_is_down')); 
            });
        }
        
	    var socialFinalLogin = function(encPwd){
		    showFeedback(i18n('sDoing_final_login'));

		    var urlLogin = uamProto+'//'+uamIp+':'+uamPort+'/json/logon';
            $.ajax({url: urlLogin + "?callback=?", dataType: "jsonp",timeout: ajaxTimeout, data: {username: userName, password: encPwd}})
            .done(function(j){
                socialFinalLoginResults(j);
            })
            .fail(function(){
                //We will retry for me.retryCount
                currentRetry = currentRetry+1;
                if(currentRetry <= retryCount){
                    socialTempLogin(encPwd);
                }else{
                    showLoginError(i18n('sCoova_Not_responding_to_login_requests'));
                }
            });
        }

        var socialFinalLoginResults = function(j){
		    hideFeedback();
		    currentRetry = 0;    //Reset if there were retries
            if(j.clientState == 0){    
                var msg = i18n('sSocial_Login_user_failed_authentication')
                if(j.message != undefined){
                    msg =j.message;
                }
                showLoginError(msg);
            }else{
			    
			    if(redirect_check){
		            execRedirect(redirect_url);
			    }else{             
                    refresh(true); //Refresh session and usage
                }
            }
        }
        
        //== User Registration ==
        var onBtnClickRegister = function(){
        
            webix.rules.intNumber = function(val){ return /^(\d{8})|(\d{9})|(\d{10})|(\d{11})|(\d{12})|(\d{13})$/.test(val); }
            
            var mac = getParameterByName('mac');
             
            var mv = {
		        view    : "multiview",
		        id      : 'regMulti',
		        cells   : [
                    {
                        view    : "form",
                        scroll  : true,
                        id      : 'regForm',
                        elements: [ 
                            {
                               css      : 'tmplCenter',
                              view      : "template",
                              borderless:true, 
                              height    : 150,
                              template  : "<h3>"+i18n('sSign_dash_up_for_free_Internet')+"</h3>"+
			                    i18n('sWelcome_to_free_Wi_dash_Fi_by')+" <b>"+cDynamicData.detail.name+"</b>.<br>"+
                                i18n('sSign_dash_up_once_to_get_Internet_access')+"!<br>"
                            },
                            {
                                view        : 'text',
                                name        : 'mac',
                                hidden      : true,
                                value       : mac
                            },
                            {
                                view        : 'text',
                                name        : 'login_page',
                                hidden      : true,
                                value       : cDynamicData.detail.name
                            },
                            {
                                view        : 'text',
                                name        : 'login_page_id',
                                hidden      : true,
                                value       : cDynamicData.detail.id
                            },
	                        {
                                view        : 'text',
                                label       : i18n('sFirst_Name'),
                                name        : 'name',
                                placeholder : i18n('sSupply_a_value'),
                                required    : true
                            },
                            {
                                view        : 'text',
                                label       : i18n('sSurname'),
                                name        : 'surname',
                                placeholder : i18n('sSupply_a_value'),
                                required    : true
                            },
                            {
                                view        : 'text',
                                label       : i18n('sEmail_br_username_br'),
                                name        : 'username',
                                placeholder : i18n('sSupply_a_value'),
                                required    : true
                            },
                            {
                                view        : 'text',
                                label       : i18n('sPassword'),
                                name        : 'password',
                                placeholder : i18n('sSupply_a_value'),
                                bottomLabel : "* "+i18n('sThe_password_must_have_at_least_5_characters'),
                                required    : true
                                
                            },
                            {
                                view        : 'text',
                                label       : i18n('sCell'),
                                name        : 'phone',
                                placeholder : i18n('sSupply_a_value'),
                                bottomLabel : "* "+'The number must have at LEAST 8 digits',
                                required    : true
                            },
	                        { view:"button", value: i18n('sSubmit'), type: 'form', click:function(){
	                            var button = this;
		                        if (this.getParentView().validate()){ //validate form
                                    //webix.message("All is correct");
                                    //with callback
                                    webix.ajax().post(urlAdd, this.getParentView().getValues(), function(text, data, xhr){ 
                                        if(data.json().success == true){
                                            fDebug("Got Dynamic Detail");                
                                            if(data.json().data.username){
                                                $$('Username').setValue(data.json().data.username);
                                            } 
                                            if(data.json().data.username){
                                                $$('Password').setValue(data.json().data.password);
                                            }
                                            //button.getTopParentView().hide(); //hide window
                                            //$$('regMulti').setValue('regEnd');
                                            $$('winRegister').close();
                                            onBtnConnectClick(); //Log the new user in....
                                             
                                        }else{
                                            if(data.json().errors){
                                                var error_string = '';
                                                Object.keys(data.json().errors).forEach(function(key) {
                                                  var val = data.json().errors[key];
                                                  var new_key = key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();
                                                  error_string = error_string+"<b>"+new_key+":</b> "+val+"<br>";
                                                });
                                                webix.alert({
                                                    title   : i18n('sError'),
                                                    text    : error_string,
                                                    type    :"confirm-error"
                                                }); 
                                            }
                                            
                                            webix.message({ type:"error", text: i18n('sCould_not_register_user') });
                                        }
                                    });
                                }
		                        else
			                        webix.message({ type:"error", text: i18n('sForm_data_is_invalid') });
	                        }}
                        ],
                        rules       :{
	                        "username"  : webix.rules.isEmail,
	                        $all        : webix.rules.isNotEmpty,
	                        'phone'     : webix.rules.intNumber,
	                        'password'  : function(value){ 
	                            if(value.length >= 5){
	                                return value;
	                            }
	                        }
                        },
                        elementsConfig:{
	                        labelPosition:"top"
                        }
                    }/*,
                    {
                        view    : "form",
                        scroll  : true,
                        id      : 'regEnd',
                        cols    : [ 
                            {
                               view         : "template",
                               borderless   : true,
                               css          : 'tmplCenter',
                               template     : "<h3>"+i18n('sThank_you')+"!</h3>"+
			                    i18n('sThank_you_for_registering_with_us')+"<br>"+
			                    i18n('sYour_username_and_password_are_already_populated_cm_simply_click_the_b_Login_b_button_to_start_using_the_Internet_fs')
                            }
                         ]
                    }*/
                ]
		    };
        
            webix.ui({   
                view        : 'window',
                id          : 'winRegister',
                fullscreen  : true,
                position    : 'center',
                modal       : true,
                head        : {
			        view    : "toolbar", 
			        cols    : [
						{view:"label", label: i18n('sSign_Up'), align: 'center'},
						{ view:"icon", icon: "wxi-close", hotkey: "escape", click:"$$('winRegister').close();"}
				    ]
				},
                body        : mv
            });    
            $$("winRegister").show();
        }
        
        var onBtnClickPassword = function(){
          
		    var mv = {
		        view    : "multiview",
		        id      : 'pwdMulti',
		        cells   : [
                    {
                        view    :"form",
                        scroll  : true,
                        id      : 'pwdIntro',
                        cols    :[   
                            {
                               css          : 'tmplCenter', 
                               borderless   : true,
                               view: "template", template: "<h3>"+i18n('sSupply_your_email_address')+"</h3>"+
			                    i18n('sIf_you_are_registered_with_us')+"<br>"+
			                    i18n('swe_will_send_you_your_credentials_fs')
                            }
                         ]
                    },
                    {
                        view    :"form",
                        id      : 'pwdForm',
                        scroll  : true,
                        cols    :[ 
                            {},
                            {
                                view        :"form",
                                minWidth    : cMinWidth,
                                maxWidth    : cMaxWidth,
                                borderless  :true,
                                elements    : [                       
                                    {
                                        view        : 'text',
                                        label       : i18n('sEmail'),
                                        name        : 'email',
                                        placeholder : i18n('sSupply_a_value')
                                    },
                                    { view:"button", value: i18n('sSubmit'), type: 'form', click:function(){
                                        if (this.getParentView().validate()){ //validate form
                                            //webix.message("All is correct");
                                            //with callback
                                            
                                            var auto_suffix_check   = cDynamicData.settings.auto_suffix_check;
		                                    var auto_suffix			= cDynamicData.settings.auto_suffix;
		                                     
                                            this.getParentView().setValues({auto_suffix_check:auto_suffix_check,auto_suffix:auto_suffix}, true);
                                            
                                            webix.ajax().post(urlLostPw, this.getParentView().getValues(), function(text, data, xhr){ 
                                                if(data.json().success == true){
                                                    fDebug("Got Dynamic Detail");                
                                                    $$('pwdMulti').setValue('pwdEnd'); 
                                                }else{
                                                    webix.message({ type:"error", text: i18n('sCould_not_email_password') });
                                                }
                                            });
                                            //this.getTopParentView().hide(); //hide window
                                            //$$('regMulti').setValue('regEnd');
                                        }
                                        else
                                            webix.message({ type:"error", text:i18n('sForm_data_is_invalid') });
                                    }}
                                ],
                                rules       :{
                                    'email'  : webix.rules.isEmail,
                                    $all     : webix.rules.isNotEmpty     
                                },
                                elementsConfig:{
                                    labelPosition:"top",
                                }
                            },
                            {}
                         ]
                    },
                    {
                        view    : "form",
                        id      : 'pwdEnd',
                        scroll  : true, 
                        cols    :[
                              {
                               css          : 'tmplCenter',
                               borderless   : true,
                               view         : "template", 
                               template     : "<h3>"+i18n('sAction_complete')+"!</h3>"+
			                    i18n('sPlease_check_your_email')+"<br>"
                            }
                         ]
                    }
                ]
		    };
		    
		    
            webix.ui({
                view        : "window",
                id          : "winPassword",
                fullscreen  : true,
                position    : "center",
                modal       : true,
                head        : {
			        view    : "toolbar", 
			        //margin  : -4, 
			        cols    : [
			            {view:"label", label: i18n('sLost_Password'), align: 'center'},
						{ view:"button", id: 'pwdNext', label:"Next", width:70, click:("$$('pwdMulti').setValue('pwdForm'); $$('pwdNext').hide();")},
						{ view:"icon", icon: "wxi-close", hotkey: "escape", click:"$$('winPassword').close();" }
				    ]
				},
               // body        : webix.copy(form)
                body        : webix.copy(mv)
            }); 
               
            $$("winPassword").show();
        }
        
      
        var parseQueryString = function( queryString ) {
        	var params = {}, queries, temp, i, l;
     
        	// Split into key/value pairs
        	queries = queryString.split("&");
     
        	// Convert the array of strings into an object
        	for ( i = 0, l = queries.length; i < l; i++ ) {
            	temp = queries[i].split('=');
            	params[temp[0]] = temp[1];
        	}
        	return params;
	    }

        var time =   function ( t , zeroReturn ) {

            if(t == 'NA'){
		        return t;
	        }

            if ( typeof(t) == 'undefined' ) {
                return i18n('sNot_available');
            }

            t = parseInt ( t , 10 ) ;
            if ( (typeof (zeroReturn) !='undefined') && ( t === 0 ) ) {
                return zeroReturn;
            }

            var d = Math.floor( t/86400);
            //var h = Math.floor( (t/3600 ) ;
            var h = Math.floor( (t -86400*d)/3600 ) ;
            var m = Math.floor( (t -(86400*d)-(3600*h))/60 ) ;
            var s = t % 60  ;

            var s_str = s.toString();
            if (s < 10 ) { s_str = '0' + s_str;   }

            var m_str = m.toString();
            if (m < 10 ) { m_str= '0' + m_str;    }

            var h_str = h.toString();
            if (h < 10 ) { h_str= '0' + h_str;    }

            var d_str = d.toString();
            if (d < 10 ) { d_str= '0' + d_str;    } 

            if      ( t < 60 )   { return s_str + 's' ; }
            else if ( t < 3600 ) { return m_str + 'm' + s_str + 's' ; }
            else if ( t < 86400 ){ return h_str + 'h' + m_str + 'm' + s_str + 's'; }
            else                 { return d_str + 'd' + h_str + 'h' + m_str + 'm' + s_str + 's'; }
        }

        var bytes   = function ( b , zeroReturn ) {

	        if(b == 'NA'){
		        return b;
	        }

            if ( typeof(b) == 'undefined' ) {
                b = 0;
            } else {
                b = parseInt ( b , 10 ) ;
            }

            if ( (typeof (zeroReturn) !='undefined') && ( b === 0 ) ) {
                return zeroReturn;
            }
            var kb = Math.round(b/1024);
            if (kb < 1) return b  + ' '+i18n('sBytes');

            var mb = Math.round(kb/1024);
            if (mb < 1)  return kb + ' '+i18n('sKilobytes');

            var gb = Math.round(mb/1024);
            if (gb < 1)  return mb + ' '+i18n('sMegabytes');

            return gb + ' '+i18n('sGigabytes');
        }
    

        //Expose those public items...
        return {         
            index               		: index,
            clearRefresh        		: clearRefresh,
            onBtnConnectClick   		: onBtnConnectClick,
		    onBtnClickToConnectClickPre : onBtnClickToConnectClickPre,
		    onBtnClickSocialLogin		: onBtnClickSocialLogin,
		    onBtnDisconnectClick		: onBtnDisconnectClick,
		    checkSocialLoginReturn		: checkSocialLoginReturn,
		    onBtnGoInternetClick        : onBtnGoInternetClick
        }   
  }
})();

