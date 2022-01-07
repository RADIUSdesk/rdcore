var sConnect = (function () {

    //Immediately returns an anonymous function which builds our modules
    return function (co) {    //co is short for config object
    
        var uamIp,uamPort;  //Variables with 'global' scope
        
        var h               = document.location.hostname;
        var urlUam          = 'uam.php'
        
        var retryCount      = 5;
        var currentRetry    = 0;
        var divFeedBack     = '#cpDivFeedback';
        
        var userName        = undefined;
        var password        = undefined;
        var ajaxTimeout		= 4000;
        
        var sessionData     = undefined; 
        var statusFb		= undefined;
        
        var counter         = undefined; //refresh counter's id
        var timeUntilStatus = 20; //interval to refresh
        var refreshInterval = 20; //ditto
        
        var useCHAP         = false;
        
        
        var cDebug  = true;
        var fDebug  = function(message){  
            if(cDebug){
                console.log(message);
                $(divFeedBack).text(message); 
            }
        };
        
        var init = function(){
        
            $("#btnConnect").on("click", onBtnConnectClick );
            $("#btnDisconnect").on("click", onBtnDisconnectClick );
        
            if(uamIp == undefined){
                fDebug("First time hotspot test");
                if(testForHotspotCoova()){
                    fDebug("It is a hotspot, now check if connected or not...");
                    coovaRefresh(true);
                }else{
                    fDebug("It is NOT a hotspot");
                }  
            }else{
                coovaRefresh(true);  //Already established we are a hotspot, simply refresh
            }
        }
        
        var onBtnConnectClick = function(){  //Get the latest challenge and continue from there onwards....             
            fDebug("Button Connect Clicked");
            
            userName = $("#txtUsername").val(); 
            password = $("#txtPassword").val();
            getLatestChallenge();
        }
        
        var onBtnDisconnectClick = function(){

		    fDebug('Disconnect the user');
		    
		    var urlLogoff = 'http://'+uamIp+':'+uamPort+'/json/logoff';
		    var cb        = "?callback?"; //Coova uses 'callback'
		  
            $.ajax({url: urlLogoff +cb, dataType: "jsonp",timeout: ajaxTimeout ,date: {}})
            .done(function(j){    
               coovaRefresh();
            })
            .fail(function(){
                //We will retry for me.retryCount    
                currentRetry = currentRetry+1;
                if(currentRetry <= retryCount){
                    onBtnDisconnectClick();
                }else{
                    fDebug('Coova Not responding to logoff requests');
                }
            });   
        }
        
        var getLatestChallenge = function(){
		    fDebug('Get latest challenge');
            var urlStatus = 'http://'+uamIp+':'+uamPort+'/json/status';
            $.ajax({url: urlStatus + "?callback=?", dataType: "jsonp",timeout: ajaxTimeout})
            .done(function(j){
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
                    fDebug("Trying to get latest challenge retry #"+currentRetry);
                    getLatestChallenge();
                }else{
                    fDebug('Latest Challenge could not be fetched from_hotspot');
                }
            });
        }
        
        var encPwd = function(challenge){ 
        
            if(useCHAP == true){
                var myMD5 = new ChilliMD5();
                var ident ='00';
		        response = myMD5.chap ( ident , password , challenge );
		        fDebug('Calculating CHAP-Password = ' + response );
		        login(response);
            }else{
        
		        fDebug('Get encrypted values');
                $.ajax({url: urlUam + "?callback=?", dataType: "jsonp",timeout: ajaxTimeout, data: {'challenge': challenge, password: password}})
                .done(function(j){
			        currentRetry = 0;
                    login(j.response);
                })
                .fail(function(){ 
			        //We will retry for me.retryCount
                    currentRetry = currentRetry+1;
                    if(currentRetry <= retryCount){
                        fDebug("Trying to get encrypted value retry #"+currentRetry);
                        encPwd(challenge);
                    }else{
                        fDebug("UAM  service is down");
                    }
                });
                     
            }
        }
      
        var login = function (encPwd) {
        
            var data = {
                 username: userName, password: encPwd
            };
            if(useCHAP == true){
                data = {
                    username: userName, response: encPwd
                }
            }
        
            fDebug('Log '+ userName + ' into Captive Portal');  
            var urlLogin = 'http://' + uamIp + ':' + uamPort + '/json/logon';
            var ajax = { url: urlLogin + "?callback=?", dataType: "jsonp", timeout: ajaxTimeout, data: data };
                    
            $.ajax(ajax)
                .done(function (j) { 

                    fDebug(JSON.stringify(j));
                })
                .fail(function (error) {
                    //We will retry for me.retryCount
                    currentRetry = currentRetry + 1;
                    if (currentRetry <= retryCount) {
                        login(encPwd);
                    } else {
                        
                      fDebug('Coova Not responding to login requests');
                    }
                });
        }
       
        var coovaRefresh    = function(){
            var urlStatus = 'http://'+uamIp+':'+uamPort+'/json/status';  
            $.ajax({url: urlStatus + "?callback=?", dataType: "jsonp",timeout: ajaxTimeout})
                .done(function(j){
				    statusFb = j;		//Store the status feedback
				    fDebug("coovaRefresh...");
				    fDebug(JSON.stringify(j));
                    currentRetry = 0 //Reset the current retry if it was perhaps already some value
                    if(j.clientState == 0){
                        fDebug("Not Connected");                   
                    }

                    if(j.clientState == 1){
                        fDebug("Connected");
                    }
                })
                .fail(function(){
                    //We will retry for retryCount
                    currentRetry = currentRetry+1;
                    if(currentRetry <= retryCount){
                        fDebug("Trying to get status retry #"+currentRetry);
                        coovaRefresh();
                    }else{
                        fDebug("Timed out");
                    }
                });
        }
         
        var testForHotspotCoova = function(){

            var ip      = getParameterByName('uamip');
            var port    = getParameterByName('uamport');

            if(ip != ''){  //Override defaults
                uamIp = ip;
            }else{
                return false;   //Not a hotspot
            }

            if(port != ''){    //Override defaults
                uamPort = port;
            }
            return true;        //Is a hotspot
        }
        
        function getParameterByName(name) {
           name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
           var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
               results = regex.exec(location.search);
           return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
        }


         //Expose those public items...
        return {         
            init  : init  
        }   
    }
    
    
function ChilliMD5() {

	var hexcase = 0;  /* hex output format. 0 - lowercase; 1 - uppercase        */
	var b64pad  = ""; /* base-64 pad character. "=" for strict RFC compliance   */
	var chrsz   = 8;  /* bits per input character. 8 - ASCII; 16 - Unicode      */

	this.hex_md5 = function (s){
		return binl2hex(core_md5(str2binl(s), s.length * chrsz));
	};

	this.chap = function ( hex_ident , str_password , hex_chal ) {

		//  Convert everything to hex encoded strings
		var hex_password =  str2hex ( str_password );

		// concatenate hex encoded strings
		var hex   = hex_ident + hex_password + hex_chal;

		// Convert concatenated hex encoded string to its binary representation
		var bin   = hex2binl ( hex ) ;

		// Calculate MD5 on binary representation
		var md5 = core_md5( bin , hex.length * 4 ) ; 

		return binl2hex( md5 );
	};

	function core_md5(x, len) {
	  x[len >> 5] |= 0x80 << ((len) % 32);
	  x[(((len + 64) >>> 9) << 4) + 14] = len;

	  var a =  1732584193;
	  var b = -271733879;
	  var c = -1732584194;
	  var d =  271733878;

	  for(var i = 0; i < x.length; i += 16) {
		var olda = a;
		var oldb = b;
		var oldc = c;
		var oldd = d;

		a = md5_ff(a, b, c, d, x[i+ 0], 7 , -680876936);
		d = md5_ff(d, a, b, c, x[i+ 1], 12, -389564586);
		c = md5_ff(c, d, a, b, x[i+ 2], 17,  606105819);
		b = md5_ff(b, c, d, a, x[i+ 3], 22, -1044525330);
		a = md5_ff(a, b, c, d, x[i+ 4], 7 , -176418897);
		d = md5_ff(d, a, b, c, x[i+ 5], 12,  1200080426);
		c = md5_ff(c, d, a, b, x[i+ 6], 17, -1473231341);
		b = md5_ff(b, c, d, a, x[i+ 7], 22, -45705983);
		a = md5_ff(a, b, c, d, x[i+ 8], 7 ,  1770035416);
		d = md5_ff(d, a, b, c, x[i+ 9], 12, -1958414417);
		c = md5_ff(c, d, a, b, x[i+10], 17, -42063);
		b = md5_ff(b, c, d, a, x[i+11], 22, -1990404162);
		a = md5_ff(a, b, c, d, x[i+12], 7 ,  1804603682);
		d = md5_ff(d, a, b, c, x[i+13], 12, -40341101);
		c = md5_ff(c, d, a, b, x[i+14], 17, -1502002290);
		b = md5_ff(b, c, d, a, x[i+15], 22,  1236535329);

		a = md5_gg(a, b, c, d, x[i+ 1], 5 , -165796510);
		d = md5_gg(d, a, b, c, x[i+ 6], 9 , -1069501632);
		c = md5_gg(c, d, a, b, x[i+11], 14,  643717713);
		b = md5_gg(b, c, d, a, x[i+ 0], 20, -373897302);
		a = md5_gg(a, b, c, d, x[i+ 5], 5 , -701558691);
		d = md5_gg(d, a, b, c, x[i+10], 9 ,  38016083);
		c = md5_gg(c, d, a, b, x[i+15], 14, -660478335);
		b = md5_gg(b, c, d, a, x[i+ 4], 20, -405537848);
		a = md5_gg(a, b, c, d, x[i+ 9], 5 ,  568446438);
		d = md5_gg(d, a, b, c, x[i+14], 9 , -1019803690);
		c = md5_gg(c, d, a, b, x[i+ 3], 14, -187363961);
		b = md5_gg(b, c, d, a, x[i+ 8], 20,  1163531501);
		a = md5_gg(a, b, c, d, x[i+13], 5 , -1444681467);
		d = md5_gg(d, a, b, c, x[i+ 2], 9 , -51403784);
		c = md5_gg(c, d, a, b, x[i+ 7], 14,  1735328473);
		b = md5_gg(b, c, d, a, x[i+12], 20, -1926607734);

		a = md5_hh(a, b, c, d, x[i+ 5], 4 , -378558);
		d = md5_hh(d, a, b, c, x[i+ 8], 11, -2022574463);
		c = md5_hh(c, d, a, b, x[i+11], 16,  1839030562);
		b = md5_hh(b, c, d, a, x[i+14], 23, -35309556);
		a = md5_hh(a, b, c, d, x[i+ 1], 4 , -1530992060);
		d = md5_hh(d, a, b, c, x[i+ 4], 11,  1272893353);
		c = md5_hh(c, d, a, b, x[i+ 7], 16, -155497632);
		b = md5_hh(b, c, d, a, x[i+10], 23, -1094730640);
		a = md5_hh(a, b, c, d, x[i+13], 4 ,  681279174);
		d = md5_hh(d, a, b, c, x[i+ 0], 11, -358537222);
		c = md5_hh(c, d, a, b, x[i+ 3], 16, -722521979);
		b = md5_hh(b, c, d, a, x[i+ 6], 23,  76029189);
		a = md5_hh(a, b, c, d, x[i+ 9], 4 , -640364487);
		d = md5_hh(d, a, b, c, x[i+12], 11, -421815835);
		c = md5_hh(c, d, a, b, x[i+15], 16,  530742520);
		b = md5_hh(b, c, d, a, x[i+ 2], 23, -995338651);

		a = md5_ii(a, b, c, d, x[i+ 0], 6 , -198630844);
		d = md5_ii(d, a, b, c, x[i+ 7], 10,  1126891415);
		c = md5_ii(c, d, a, b, x[i+14], 15, -1416354905);
		b = md5_ii(b, c, d, a, x[i+ 5], 21, -57434055);
		a = md5_ii(a, b, c, d, x[i+12], 6 ,  1700485571);
		d = md5_ii(d, a, b, c, x[i+ 3], 10, -1894986606);
		c = md5_ii(c, d, a, b, x[i+10], 15, -1051523);
		b = md5_ii(b, c, d, a, x[i+ 1], 21, -2054922799);
		a = md5_ii(a, b, c, d, x[i+ 8], 6 ,  1873313359);
		d = md5_ii(d, a, b, c, x[i+15], 10, -30611744);
		c = md5_ii(c, d, a, b, x[i+ 6], 15, -1560198380);
		b = md5_ii(b, c, d, a, x[i+13], 21,  1309151649);
		a = md5_ii(a, b, c, d, x[i+ 4], 6 , -145523070);
		d = md5_ii(d, a, b, c, x[i+11], 10, -1120210379);
		c = md5_ii(c, d, a, b, x[i+ 2], 15,  718787259);
		b = md5_ii(b, c, d, a, x[i+ 9], 21, -343485551);

		a = safe_add(a, olda);
		b = safe_add(b, oldb);
		c = safe_add(c, oldc);
		d = safe_add(d, oldd);
	  }
	  return [ a, b, c, d ];

	}

	function md5_cmn(q, a, b, x, s, t) {
	  return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s),b);
	}

	function md5_ff(a, b, c, d, x, s, t) {
	  return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
	}

	function md5_gg(a, b, c, d, x, s, t) {
	  return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
	}

	function md5_hh(a, b, c, d, x, s, t) {
	  return md5_cmn(b ^ c ^ d, a, b, x, s, t);
	}

	function md5_ii(a, b, c, d, x, s, t) {
	  return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
	}

	function safe_add(x, y) {
	  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
	  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
	  return (msw << 16) | (lsw & 0xFFFF);
	}
	function bit_rol(num, cnt) {
	  return (num << cnt) | (num >>> (32 - cnt));
	}

	function str2binl(str) {
	  var bin = [] ;
	  var mask = (1 << chrsz) - 1;
	  for (var i = 0; i < str.length * chrsz; i += chrsz) {
		bin[i>>5] |= (str.charCodeAt(i / chrsz) & mask) << (i%32);
	  }
	  return bin;
	}

	function binl2hex(binarray) {
	  var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
	  var str = "";
	  for (var i = 0; i < binarray.length * 4; i++) {
		str += hex_tab.charAt((binarray[i>>2] >> ((i%4)*8+4)) & 0xF) +
			   hex_tab.charAt((binarray[i>>2] >> ((i%4)*8  )) & 0xF);
	  }
	  return str;
	}

	function str2hex ( str ) {
		var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
		var hex = '';
		var val ;
		for ( var i=0 ; i<str.length ; i++) {
			/* TODO: adapt this if chrz=16   */
			val = str.charCodeAt(i);
			hex = hex + hex_tab.charAt( val/16 );
			hex = hex + hex_tab.charAt( val%16 );
		}
		return hex;
	}

	function hex2binl ( hex ) {
		/*  Clean-up hex encoded input string */
		hex = hex.toLowerCase() ;
		hex = hex.replace( / /g , "");

		var bin =[] ;

		/* Transfrom to array of integers (binary representation) */ 
		for ( i=0 ; i < hex.length*4   ; i=i+8 )  {
			octet =  parseInt( hex.substr( i/4 , 2) , 16) ;
			bin[i>>5] |= ( octet & 255 ) << (i%32);
		}
		return bin;
	}
	
} // end of ChilliMD5 constructor
     
    
})();
