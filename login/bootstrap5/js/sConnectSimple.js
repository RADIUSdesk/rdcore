var sConnectSimple = (function () {

    //Immediately returns an anonymous function which builds our modules
    return function (co) {    //co is short for config object
    
        var uamIp,uamPort;  //Variables with 'global' scope
        
        var h               = document.location.hostname;
        var isMikroTik      = getParameterByName('link_status') != "";
        var urlUam          = 'uam.php'
        
        var retryCount      = 4;
        var currentRetry    = 0;
        var connectedTime   = 0;
        var divFeedBack     = '#cpDivFeedback';
        
        var userName        = undefined;
        var password        = undefined;
        var ajaxTimeout		= 4000;
        var notRequired		= [ 'q', 'res',	'challenge', 'called', 'mac', 'ip', 'sessionid', 'userurl', 'md'];
	    var socialName		= undefined;
        
        var sessionData     = undefined; 
        var statusFb		= undefined;
        
        var counter         = undefined; //refresh counter's id
        var timeUntilStatus = 20; //interval to refresh
        var refreshInterval = 20; //ditto
        
        var counter         = undefined; //refresh counter's id
        var timeUntilStatus = 20; //interval to refresh
        var refreshInterval = 20; //ditto

	    var timeUntilUsage  = 20 //Default value
	    var usageInterval	= 20; 
        var useCHAP         = false; // Set to true if uamsecret is *NOT* specified (else set to false and use UAM service)
        
        var cDynamicData    = undefined;
        var redirect_check 	= false;
        var redirect_url    = undefined;

        if(co.cDynamicData != undefined){
            cDynamicData = co.cDynamicData;
        }
        
        if(co.useCHAP != undefined){
            useCHAP = co.useCHAP;
        }
         
        var cDebug          = false;      
        var redirect_url    = undefined;
        
        //Be sure this is the same as specified in FB e.g. IP or DNS!!
	    var urlSocialBase   = location.protocol+'//'+h+'/cake3/rd_cake/third-party-auths/index.json'; 
	    
	    //To pull the username and password associated with this ID + typ
	    var urlSocialInfoFor= location.protocol+'//'+h+'/cake3/rd_cake/third-party-auths/info-for.json';
        
        //!!!!  
	    var urlAdd			= location.protocol+'//'+h+'/cake3/rd_cake/register-users/new-permanent-user.json';
		var urlLostPw		= location.protocol+'//'+h+'/cake3/rd_cake/register-users/lost-password.json';
		//!!!!
        
        var req_class       = 'p-1 bg-secondary border';
        var req_attr        = 'required';
               
        var init = function(){
        
            //--Plugin for button--
            (function($) {
                $.fn.button = function(action) {
                    if (this.length > 0) {
                        this.each(function(){
                            if (action === 'loading' && $(this).data('loading-text')) {
                                $(this).data('original-text', $(this).html()).html("<span class='spinner-border spinner-border-sm'></span> "+i18n($(this).data('loading-text'))+" ...").prop('disabled', true);
                            } else if (action === 'reset' && $(this).data('original-text')) {
                                $(this).html($(this).data('original-text')).prop('disabled', false);
                            }
                        });
                    }
                };
            }(jQuery));
            //--END Plugin for button--
                
            $('#frmLogin').on('keyup',onFrmLoginKeydown);           
            $("#btnConnect").on("click", onBtnConnectClick );
            $("#btnDisconnect").on("click", onBtnDisconnectClick );
            $("#btnClickToConnect").on("click", onBtnClickToConnectClickPre );
            
            $("#aRegister").on("click", onRegisterClick);
            $('#btnRegister').on('click',onBtnRegisterClick);   
            $("#aLostPassword").on("click", onLostPasswordClick);
            $('#btnLostPwd').on('click',onBtnLostPwdClick);
            $('#btnLostPwdSms').on('click',onBtnLostPwdClickSms);   
            $('#btnCustInfo').on('click',onBtnCustInfoClick);
                                 
            if(uamIp == undefined){
                fDebug("First time hotspot test");
                if(testForHotspot()){
                    fDebug("It is a hotspot, now check if connected or not...");                 
                    //refresh(true);
                    prelogin();
                }else{
                    fShowError(i18n('sPlease_connect_through_a_valid_Hotspot'));
                    fDebug("It is NOT a hotspot");
                }  
            }else{
                //refresh(true);  //Already established we are a hotspot, simply refresh
                prelogin();
            }
            
        }
        
        var fDebug  = function(message){  
            if(cDebug){
                console.log(message);
                $(divFeedBack).text(message); 
            }
        };
        
        var fShowError = function(msg){
            msg = '<div>'+msg+'</div>';
            $('#alertWarn').html(msg);
            $('#alertWarn').addClass('show');
        }      
               
        var onFrmLoginKeydown = function(event){
            var itemName = event.target.id;
            //We use this to test and endable / disable the connect button
            var pass = false;                     
            if($("#"+itemName).val()==''){    
                $( "#"+itemName ).addClass( "is-invalid" );
                $( "#"+itemName ).removeClass( "is-valid" );
                $("#btnConnect").attr('disabled',true);                           
            }else{
                $( "#"+itemName ).addClass( "is-valid" );
                $( "#"+itemName ).removeClass( "is-invalid" );
                if((itemName == 'txtUsername')||(itemName == 'txtPassword')){
                    $("#btnConnect").attr('disabled',false)
                    if($("#txtUsername").val()==''){
                        $("#btnConnect").attr('disabled',true);
                    }
                    if($("#txtPassword").val()==''){
                        $("#btnConnect").attr('disabled',true);
                    }
                }else{
                    $("#btnConnect").attr('disabled',false)
                }               
            }               
        }
        
        var onBtnClickToConnectClickPre = function(event){
            event.preventDefault();        
            if(cDynamicData.settings.click_to_connect.cust_info_check == false){          
                onBtnClickToConnectClick(event);       
            }else{
                var email_check = location.protocol+'//'+document.location.hostname+"/cake3/rd_cake/data-collectors/mac-check.json";
                var mac_address = decodeURIComponent(getParameterByName('mac'));
                mac_address     = mac_address.replace(/:/g, '-');
                console.log("MAC IS "+mac_address);
                var nasid       = getParameterByName('nasid');
                $.ajax({url: email_check, method: "POST", dataType: "json",timeout: 3000,data: {'mac': mac_address, 'nasid': nasid}})
                .done(function(j){
                    if(j.success == true){
                        if(j.data.ci_required == true){
                            console.log("Gooi hom");
                            showCustInfo();
                        }else{
                            onBtnClickToConnectClick(event);
                        }
                    }else{
                        console.log("OTHER ERROR");   
                    }         
                })
                .fail(function(){
                    console.log("ERROR -> Getting Info for MAC"); 
                });
            }
            //-- END ADD ON --		    
        }
        
        var showCustInfo = function(){       
            $("#myModal").modal('hide');      
            if(!$("#pnlCustInfo").data('populate')){
                populateCustInfo();
            }
            $("#modalCustInfo").modal('show');         
        }
        
        var populateCustInfo = function(){
            $("#pnlCustInfo").data('populate',true);
            var $pnl = $("#pnlCustInfo");    
            if(cDynamicData.settings.click_to_connect.ci_first_name){
                var $first_name_req_class = ''
                var $first_name_req_attr  = '';
                if(cDynamicData.settings.click_to_connect.ci_first_name_required){
                    $first_name_req_class = req_class
                    $first_name_req_attr  = req_attr
                }
                var $first_name = `
                    <div class="mb-3 `+$first_name_req_class+`">
                        <input type="text" placeholder="`+i18n("sFirstName")+`" class="form-control" id="ciFirstName" name="first_name" `+$first_name_req_attr+`>
                        <div class="invalid-feedback">
                            `+i18n("sPlease_supply_a_valid")+' '+i18n("sFirstName")+`
                        </div>
                    </div>`     
                var first_name = $($first_name);
                $pnl.append(first_name);  
            }
            
            if(cDynamicData.settings.click_to_connect.ci_last_name){
                var $last_name_req_class = ''
                var $last_name_req_attr  = '';
                if(cDynamicData.settings.click_to_connect.ci_last_name_required){
                    $last_name_req_class = req_class
                    $last_name_req_attr  = req_attr
                }
                var $last_name = `
                    <div class="mb-3 `+$last_name_req_class+`">
                        <input type="text" placeholder="`+i18n("sSurname")+`" class="form-control" id="ciSurname" name="last_name" `+$last_name_req_attr+`>
                        <div class="invalid-feedback">
                             `+i18n("sPlease_supply_a_valid")+' '+i18n("sSurname")+`
                        </div>
                    </div>`     
                var last_name = $($last_name);
                $pnl.append(last_name);  
            }
            
            if(cDynamicData.settings.click_to_connect.ci_email){
                var $email_req_class = ''
                var $email_req_attr  = ''
                if(cDynamicData.settings.click_to_connect.ci_email_required){
                    $email_req_class = req_class
                    $email_req_attr  = req_attr
                }
                var $email = `
                    <div class="mb-3 `+$email_req_class+`">
                        <input type="email" placeholder="`+i18n("sEmail")+`" class="form-control" id="ciEmail" name="email" `+$email_req_attr+`>
                        <div class="invalid-feedback">
                            `+i18n("sPlease_supply_a_valid")+' '+i18n("sEmail")+`
                        </div>
                    </div>`     
                var email = $($email);
                $pnl.append(email);
                //Check for Opt In
                if(cDynamicData.settings.click_to_connect.ci_email_opt_in){
                    var $email_opt_in = `
                        <div class="mb-3">
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" name="email_opt_in">
                                <label class="form-check-label" for="flexSwitchCheckChecked">`+cDynamicData.settings.click_to_connect.ci_email_opt_in_txt+`</label>
                            </div>     
                        </div>`
                    var email_opt_in = $($email_opt_in);
                    $pnl.append(email_opt_in); 
                }  
            }
            
            if(cDynamicData.settings.click_to_connect.ci_gender){
                var $gender_req_class = ''
                if(cDynamicData.settings.click_to_connect.ci_gender_required){
                    $gender_req_class = req_class
                }
                var $gender = `
                    <div class="mb-3 `+$gender_req_class+`">
                        <label>`+i18n("sGender")+`</label>
                        <div class="form-check form-check-inline">
                        <input class="form-check-input" type="radio" id='genderMale' name="gender"  value="male" checked>
                          <label class="form-check-label" for="genderMale">`+i18n("sMale")+`</label>
                        </div>
                        <div class="form-check form-check-inline">
                          <input class="form-check-input" type="radio" id='genderFemale' name="gender" value="female">
                          <label class="form-check-label" for="genderFemale">`+i18n("sFemale")+`</label>
                        </div>     
                    </div>`     
                var gender = $($gender);
                $pnl.append(gender);  
            }
                       
            if(cDynamicData.settings.click_to_connect.ci_birthday){
                var $birthday_req_class = ''
                var $birthday_req_attr  = ''
                if(cDynamicData.settings.click_to_connect.ci_birthday_required){
                    $birthday_req_class = req_class
                    $birthday_req_attr  = req_attr
                }
                var $birthday = `
                    <div class="mb-3 `+$birthday_req_class+`">
                        <label for="ciBirthday">`+i18n("sBirthday")+`</label>
                        <input id="ciBirthday" class="form-control" type="date" name="birthday"  `+$birthday_req_attr+ `/>
                        <div class="invalid-feedback">
                            `+i18n("sPlease_supply_a_valid")+' '+i18n("sBirthday")+`
                        </div>
                    </div>`     
                var birthday = $($birthday);
                $pnl.append(birthday);  
            }
            
            if(cDynamicData.settings.click_to_connect.ci_company){
                var $company_req_class = ''
                var $company_req_attr  = ''
                if(cDynamicData.settings.click_to_connect.ci_company_required){
                    $company_req_class = req_class
                    $company_req_attr  = req_attr
                }
                var $company = `
                    <div class="mb-3 `+$company_req_class+`">
                        <input type="text" placeholder="`+i18n("sCompany")+`" class="form-control" id="ciCompany" name="company" `+$company_req_attr+`>
                        <div class="invalid-feedback">
                            `+i18n("sPlease_supply_a_valid")+' '+i18n("sCompany")+`
                        </div>
                    </div>`   
                var company = $($company);
                $pnl.append(company);  
            }
            
            if(cDynamicData.settings.click_to_connect.ci_address){
                var $address_req_class = ''
                var $address_req_attr  = ''
                if(cDynamicData.settings.click_to_connect.ci_address_required){
                    $address_req_class = req_class
                    $address_req_attr  = req_attr
                }
                var $address = `
                    <div class="mb-3 `+$address_req_class+`">
                        <textarea placeholder="`+i18n("sAddress")+`" class="form-control" id="ciAddress" rows="3" name="address" `+$address_req_attr+`></textarea>
                        <div class="invalid-feedback">
                            `+i18n("sPlease_supply_a_valid")+' '+i18n("sAddress")+`
                        </div>
                    </div>`   
                var address = $($address);
                $pnl.append(address);  
            }
            
            if(cDynamicData.settings.click_to_connect.ci_city){
                var $city_req_class = ''
                var $city_req_attr  = ''
                if(cDynamicData.settings.click_to_connect.ci_city_required){
                    $city_req_class = req_class
                    $city_req_attr  = req_attr
                }
                var $city = `
                    <div class="mb-3 `+$company_req_class+`">
                        <input type="text" placeholder="`+i18n("sCity")+`" class="form-control" id="ciCity" name="city" `+$city_req_attr+`>
                        <div class="invalid-feedback">
                            `+i18n("sPlease_supply_a_valid")+' '+i18n("sCity")+`
                        </div>
                    </div>`   
                var city = $($city);
                $pnl.append(city);  
            }
            
            if(cDynamicData.settings.click_to_connect.ci_country){
                var $country_req_class = ''
                var $country_req_attr  = ''
                if(cDynamicData.settings.click_to_connect.ci_country_required){
                    $country_req_class = req_class
                    $country_req_attr  = req_attr
                }
                var $country = `
                    <div class="mb-3 `+$country_req_class+`">
                        <input type="text" placeholder="`+i18n("sCountry")+`" class="form-control" id="ciCountry" name="country" `+$country_req_attr+`>
                        <div class="invalid-feedback">
                             `+i18n("sPlease_supply_a_valid")+' '+i18n("sCountry")+`
                        </div>
                    </div>`   
                var country = $($country);
                $pnl.append(country);  
            }
            
            if(cDynamicData.settings.click_to_connect.ci_phone){
                var $phone_req_class = ''
                var $phone_req_attr  = ''
                if(cDynamicData.settings.click_to_connect.ci_phone_required){
                    $phone_req_class = req_class
                    $phone_req_attr  = req_attr
                }
                var $phone = `
                    <div class="mb-3 `+$phone_req_class+`">
                        <input type="text" placeholder="`+i18n("sPhone")+`" class="form-control" id="ciPhone" minlength="8" pattern="^[0-9]*$" name="phone" `+$phone_req_attr+`>
                        <div class="invalid-feedback">
                            `+i18n("sThe_number_must_have_at_least_8_digits")+`
                        </div>
                    </div>`     
                var phone = $($phone);
                $pnl.append(phone);
                //Check for Opt In
                if(cDynamicData.settings.click_to_connect.ci_phone_opt_in){
                    var $phone_opt_in = `
                        <div class="mb-3">
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" name="phone_opt_in">
                                <label class="form-check-label" for="flexSwitchCheckChecked">`+cDynamicData.settings.click_to_connect.ci_phone_opt_in_txt+`</label>
                            </div>     
                        </div>`
                    var phone_opt_in = $($phone_opt_in);
                    $pnl.append(phone_opt_in); 
                }  
            }
            
            if(cDynamicData.settings.click_to_connect.ci_room){
                var $room_req_class = ''
                var $room_req_attr  = ''
                if(cDynamicData.settings.click_to_connect.ci_room_required){
                    $room_req_class = req_class
                    $room_req_attr  = req_attr
                }
                var $room = `
                    <div class="mb-3 `+$room_req_class+`">
                        <input type="text" placeholder="`+i18n("sRoom")+`" class="form-control" id="ciRoom" name="room" `+$room_req_attr+`>
                        <div class="invalid-feedback">
                            `+i18n("sPlease_supply_a_valid")+' '+i18n("sRoom")+`
                        </div>
                    </div>`   
                var room = $($room);
                $pnl.append(room);  
            }
               
            if(cDynamicData.settings.click_to_connect.ci_custom1){
                var $custom1_req_class = ''
                var $custom1_req_attr  = ''
                if(cDynamicData.settings.click_to_connect.ci_custom1_required){
                    $custom1_req_class = req_class
                    $custom1_req_attr  = req_attr
                }
                var $custom1 = `
                    <div class="mb-3 `+$custom1_req_class+`">
                        <input type="text" placeholder="`+cDynamicData.settings.click_to_connect.ci_custom1_txt+`" class="form-control" id="ciCustom1" name="custom1" `+$custom1_req_attr+`>
                        <div class="invalid-feedback">
                            `+i18n("sPlease_supply_a_valid")+' '+cDynamicData.settings.click_to_connect.ci_custom1_txt+`
                        </div>
                    </div>`     
                var custom1 = $($custom1);
                $pnl.append(custom1);  
            }
            
            if(cDynamicData.settings.click_to_connect.ci_custom2){
                var $custom2_req_class = ''
                var $custom2_req_attr  = ''
                if(cDynamicData.settings.click_to_connect.ci_custom2_required){
                    $custom2_req_class = req_class
                    $custom2_req_attr  = req_attr
                }
                var $custom2 = `
                    <div class="mb-3 `+$custom2_req_class+`">
                        <input type="text" placeholder="`+cDynamicData.settings.click_to_connect.ci_custom2_txt+`" class="form-control" id="ciCustom2" name="custom2" `+$custom2_req_attr+`>
                        <div class="invalid-feedback">
                            `+i18n("sPlease_supply_a_valid")+' '+cDynamicData.settings.click_to_connect.ci_custom2_txt+`
                        </div>
                    </div>`     
                var custom2 = $($custom2);
                $pnl.append(custom2);  
            }
            
            if(cDynamicData.settings.click_to_connect.ci_custom3){
                var $custom3_req_class = ''
                var $custom3_req_attr  = ''
                if(cDynamicData.settings.click_to_connect.ci_custom3_required){
                    $custom3_req_class = req_class
                    $custom3_req_attr  = req_attr
                }
                var $custom3 = `
                    <div class="mb-3 `+$custom3_req_class+`">
                        <input type="text" placeholder="`+cDynamicData.settings.click_to_connect.ci_custom3_txt+`" class="form-control" id="ciCustom3" name="custom3" `+$custom3_req_attr+`>
                        <div class="invalid-feedback">
                            `+i18n("sPlease_supply_a_valid")+' '+cDynamicData.settings.click_to_connect.ci_custom3_txt+`
                        </div>
                    </div>`     
                var custom3 = $($custom3);
                $pnl.append(custom3);  
            }                             
        }
        
        var onBtnCustInfoClick = function(event){
            event.preventDefault();
            var form        = document.querySelector('#frmCustInfo');
            if (!form.checkValidity()) {
                event.preventDefault()
                event.stopPropagation()
            }else{
            
                var add_mac     = location.protocol+'//'+document.location.hostname+"/cake3/rd_cake/data-collectors/add-mac.json";       
                var formData    = new FormData(document.querySelector('#frmCustInfo'))
                       
                //===SPECIAL CHECK FOR CUSTOM FIELDS=====
                var numbers_only = new RegExp('^[0-9]*$');
                var $custom1 = $("#ciCustom1");
                //Special check to enforce the custom item of "DN" to be digits only 7 or more digits
                if($custom1){
                    $custom1_placeholder = $( $custom1 ).attr( "placeholder" );
                    if($custom1_placeholder == 'DN'){
                        if ((numbers_only.test($($custom1).val())==false)||($($custom1).val().length <  7)) {
                            $($custom1).addClass( "is-invalid" );
                            $($custom1).removeClass( "is-valid" );
                            return;
                        }else{
                            $($custom1).addClass( "is-valid" );
                            $($custom1).removeClass( "is-invalid" );
                        }       
                    }           
                }
                
                var $custom2 = $("#ciCustom2");
                //Special check to enforce the custom item of "DN" to be digits only 7 or more digits
                if($custom2){
                    $custom2_placeholder = $( $custom2 ).attr( "placeholder" );
                    if($custom2_placeholder == 'DN'){
                        if ((numbers_only.test($($custom2).val())==false)||($($custom2).val().length <  7)) {
                            $($custom2).addClass( "is-invalid" );
                            $($custom2).removeClass( "is-valid" );
                            return;
                        }else{
                            $($custom2).addClass( "is-valid" );
                            $($custom2).removeClass( "is-invalid" );
                        }       
                    }           
                }
                
                var $custom3 = $("#ciCustom3");
                //Special check to enforce the custom item of "DN" to be digits only 7 or more digits
                if($custom3){
                    $custom3_placeholder = $( $custom3 ).attr( "placeholder" );
                    if($custom3_placeholder == 'DN'){
                        if ((numbers_only.test($($custom3).val())==false)||($($custom3).val().length <  7)) {
                            $($custom3).addClass( "is-invalid" );
                            $($custom3).removeClass( "is-valid" );
                            return;
                        }else{
                            $($custom3).addClass( "is-valid" );
                            $($custom3).removeClass( "is-invalid" );
                        }       
                    }           
                }
                               
                //===END SPECIAL CHECK FOR CUSTOM FIELDS====

            
                var mac_address = getParameterByName('mac');
                formData.append('mac',mac_address);
                
                var nasid       = getParameterByName('nasid');
                formData.append('nasid',nasid);
                
                var called      = getParameterByName('called');
                formData.append('cp_mac',called);

                //This might not always be included
                var ssid        = getParameterByName('ssid');
                if(ssid !== ''){
                    formData.append('ssid',ssid);
                }
            
                $.ajax({url: add_mac, method: "POST", dataType: "json",timeout: 3000,data: formData,processData: false,contentType: false})
                .done(function(j){
                    if(j.success == true){ 
                        $("#modalCustInfo").modal('hide');           
                        $("#myModal").modal('show');
                        onBtnClickToConnectClick(event); 
                    }else{
                        console.log("PROBLEMS POSTING INFO FOR MAC");
                          
                    }         
                })
                .fail(function(){
                    console.log("ERROR -> Posting Info for MAC"); 
                });    
            
            }
            form.classList.add('was-validated')          
        }
           

        var onBtnClickToConnectClick = function(event){
            event.preventDefault();
            $('#alertWarn').removeClass('show');
            currentRetry = 0;
            var c_t_c_element	= cDynamicData.settings.click_to_connect.connect_suffix;
			var element_val     = getParameterByName(c_t_c_element);
			var c_t_c_username 	= cDynamicData.settings.click_to_connect.connect_username+"@"+element_val;
			var c_t_c_password	= cDynamicData.settings.click_to_connect.connect_username;
            userName 			= c_t_c_username;
            password 			= c_t_c_password;
                   
            if(cDynamicData.settings.t_c_check == true){
		        if($('#chkTerms').prop( "checked" ) == false){
	                fShowError(i18n('sFirst_agree_to_T_amp_C'));
	                return;
		        }
		    }
		    $('#btnClickToConnect').button('loading');
		    var challenge = getParameterByName('challenge');
		    encPwd(challenge);
                           
        }
                 
        var onBtnConnectClick = function(event){  //Get the latest challenge and continue from there onwards....
            event.preventDefault();             
            fDebug("Button Connect Clicked");
            $('#alertWarn').removeClass('show');
            currentRetry = 0;
                 
            $('#btnConnect').button('loading');
            if($("#txtVoucher").length){ //It might not be there depending on the settings
                if($("#txtVoucher").val() !== ''){
                     userName = $("#txtVoucher").val().toLowerCase();
                     password = userName;
                }
            }
            if($("#txtUsername").length){ //It might not be there depending on the settings
                if($("#txtUsername").val() !== ''){
                     userName = $("#txtUsername").val().toLowerCase();
                     password = $("#txtPassword").val();
                }           
            }
            var challenge = getParameterByName('challenge'); 
            encPwd(challenge);
        }
                
        var onBtnDisconnectClick = function(){
	        $('#btnDisconnect').button('loading');
		    fDebug('Disconnect the user');		    
		    window.location = 'http://'+uamIp+':'+uamPort+'/logoff'		    
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
                $.ajax({url: urlUam + "?callback=?", dataType: "jsonp",timeout: ajaxTimeout, data: {'challenge': challenge, 'password': password}})
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
                        fShowError(i18n('sUAM_service_is_down'));
                        loadingReset();
                    }
                });
                     
            }
        }
      
        var login = function (encPwd) {       
            var data = 'username='+userName+'&password='+encPwd;
            if(useCHAP == true){
                data = 'username='+userName+'&response='+encPwd;
            }
            fShowError("Login User<br>Please Wait.....");
            window.location = 'http://'+uamIp+':'+uamPort+'/logon?'+data;                               
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
            if (kb < 1) return b  + ' '+'Bytes';

            var mb = Math.round(kb/1024);
            if (mb < 1)  return kb + ' '+'Kilobytes';

            var gb = Math.round(mb/1024);
            if (gb < 1)  return mb + ' '+'Megabytes';

            return gb + ' '+'Gigabytes';
        }
        
        
        var prelogin = function(){
            var res    = getParameterByName('res'); //res can be 'notyet', 'success', 'already'           
            if(res == 'failed'){
                var reason    = getParameterByName('reason');
                fShowError(reason);
                showConnect();
            }
                      
            if(res == 'notyet'){
                showConnect();
            }
            if((res == 'success')||(res == 'already')){
                showConnected();
                paintConnected()
                counter = setInterval (function(){
			        //Status part
                    timeUntilStatus = timeUntilStatus-1;
                    connectedTime   = connectedTime+1;
                    $('#status_refresh').text(timeUntilStatus);                   
                    if(timeUntilStatus == 0){      //Each time we reach null we refresh the screens
                        timeUntilStatus = refreshInterval; //Start anew
                        paintConnected()                                        
                    }
                }, 1000 );               
            }        
        }
        
        var showConnect     = function(){
            $('#alertInfo').addClass('show');
            $('#pnlSession').removeClass('show');
            $('#divSocial').removeClass('d-none'); 
            if(!cDynamicData.settings.click_to_connect.connect_only){
                $('#pnlLogin').addClass('show');
            }
            $('#btnDisconnect').addClass('d-none');
            loadingReset();
            
            if(
                ((cDynamicData.settings.voucher_login_check == false)&&
                (cDynamicData.settings.user_login_check == false))||
                (cDynamicData.settings.click_to_connect.connect_only)
                ){   
                //Hide the connect button
                $('#btnConnect').addClass('d-none');
                                
            }else{
                $('#btnConnect').removeClass('d-none'); 
            }
            
            if(cDynamicData.settings.click_to_connect.connect_check == true){
                $('#btnClickToConnect').removeClass('d-none');                             
            }else{           
                $('#btnClickToConnect').addClass('d-none');    
            }
            
            if(cDynamicData.settings.t_c_check == true){            
                $('#divTerms').removeClass('d-none');         
            }else{           
                $('#divTerms').addClass('d-none');
            }
            
            //User Registration
            if((cDynamicData.settings.register_users == true)&&(cDynamicData.settings.user_login_check == true)){
                $('#divRegister').removeClass('d-none');                             
            }else{           
                $('#divRegister').addClass('d-none');    
            }
            
            //Lost Password
            if((cDynamicData.settings.lost_password == true)&&(cDynamicData.settings.user_login_check == true)){
                $('#divLostPassword').removeClass('d-none');                             
            }else{           
                $('#divLostPassword').addClass('d-none');    
            }          
            $('#hLogin').html('<i class="bi-plug"></i>'+i18n('sConnect'))        
        }
        
        var showConnected   = function(){
            if(cDynamicData.settings.redirect_check){          
                window.location = cDynamicData.settings.redirect_url;               
            }else{
                $('#alertInfo').removeClass('show');
                $('#pnlSession').addClass('show');
                $('#pnlLogin').removeClass('show');
                $('#btnDisconnect').removeClass('d-none');
                loadingReset();
                $('#btnConnect').addClass('d-none');
                $('#btnClickToConnect').addClass('d-none');
                $('#divRegister').addClass('d-none');
                $('#divLostPassword').addClass('d-none');
                $('#divTerms').addClass('d-none');
                $('#divSocial').addClass('d-none');               
                $('#hLogin').html('<i class="bi-star"></i> '+i18n('sConnected'))  
                if(counter == undefined){    //If it is the first time so initialise the loop counter
                    //sessionData = j;
                    //refreshCounter();
                }                           
            }         
        }
        
        var paintConnected = function(){
            var time_s  = time(connectedTime);
            $('#acct_un').text('N/A');
            $('#acct_up').text(time_s);
            $('#acct_di').text('N/A');
            $('#acct_do').text('N/A');
            $('#acct_dt').text('N/A');           
        }
                                        
        var loadingReset = function(){
            $('#btnClickToConnect').button('reset');
            $('#btnDisconnect').button('reset');
            $('#btnConnect').button('reset');
            $('#btnFacebook').button('reset');
            $('#btnGoogle').button('reset');
            $('#btnTwitter').button('reset');
        }
        
        var onRegisterClick = function(){
            $("#myModal").modal('hide');
            $("#modalRegister").modal('show');
            if(!$("#divRegister").data('populate')){
                populateRegister();
            }   
        }
        
        var populateRegister = function(){

            $("#divRegister").data('populate',true);
            var $pnl = $("#pnlRegister");
            
            var $form = `
             <div class="mb-3">
                <input type="text" placeholder="`+i18n("sFirstName")+`" class="form-control" id="txtrFirstName" name="name">
              </div>
              <div class="mb-3">
                <input type="text" placeholder="`+i18n("sSurname")+`" class="form-control" id="txtrSurname" name="surname">
              </div>
              <div class="mb-3 p-1 bg-secondary border">
                <input type="email" placeholder="`+i18n("sEmail_br_username_br")+`" class="form-control" id="txtrEmail" name="username" required>
                <div class="invalid-feedback">
                     `+i18n("sPlease_supply_a_valid")+' '+i18n("sEmail")+`
                </div>
              </div>
              <div class="mb-3 p-1 bg-secondary border">
                <input type="text" placeholder="`+i18n("sPassword")+`" class="form-control" id="txtrPassword" name="password" minlength="5" required>
                <div class="invalid-feedback">
                    `+i18n("sThe_password_must_have_at_least_5_characters")+`
                </div>
              </div>
              <div class="mb-3 p-1 bg-secondary border">
                <input type="text" placeholder="`+i18n("sCell")+`" class="form-control" id="txtrCell" name="phone" pattern="^[0-9]*$" minlength="8" required>
                <div class="invalid-feedback">
                    `+i18n("sThe_number_must_have_at_least_8_digits")+`
                </div>
              </div>`;
            var ci = $($form);
            $pnl.append(ci);  
        }
        
        var onBtnRegisterClick = function(event){
        
            var form    = document.querySelector('#frmRegister');
            if (!form.checkValidity()) {
                event.preventDefault()
                event.stopPropagation()
            }else{ 
        
        
                $('#alertWarnRegister').removeClass('show');
                var mac = getParameterByName('mac');
                var formData = {
                    login_page    : cDynamicData.detail.name,
                    login_page_id : cDynamicData.detail.id,
                    mac           : mac,
                    name          : $("#txtrFirstName").val(),
                    surname       : $("#txtrSurname").val(),
                    username      : $("#txtrEmail").val(),
                    password      : $("#txtrPassword").val(),
                    phone         : $("#txtrCell").val()
                };
                  
                $.ajax({
                    type      : "POST",
                    url       : urlAdd,
                    data      : formData,
                    dataType  : "json",
                    encode    : true,
                })
                .done(function (data) {
                    if(data.success){
                        //populate the fields
                        var r_username = data.data.username;
                        var r_password = data.data.password;
                        $("#txtUsername").val(r_username);
                        $("#txtPassword").val(r_password);
                        //Hide reg / show login
                        $("#modalRegister").modal('hide');
                        $("#myModal").modal('show');               
                    }else{
                        if(data.errors !== undefined){
                            msg = '';
                            Object.keys(data.errors).forEach(key => {
                                //console.log(key, data.errors[key]);
                                msg = msg+'<b>'+key+'</b>  '+data.errors[key]+"<br>\n";
                            });                       
                            $('#alertWarnRegister').html(msg);
                            $('#alertWarnRegister').addClass('show');                                                
                        }                
                    }
                });
            }
            form.classList.add('was-validated');
        }
               
        var onLostPasswordClick = function(){          
            $("#myModal").modal('hide');
            if(cDynamicData.settings.lost_password_method == 'sms'){
                $("#modalLostPwdSms").modal('show');
                if(!$("#pnlLostPwdSms").data('populate')){
                    populateLostPwdSms();
                }      
            }          
            if(cDynamicData.settings.lost_password_method == 'email'){
                $("#modalLostPwd").modal('show');
                if(!$("#pnlLostPwd").data('populate')){
                    populateLostPwd();
                }  
            }                 
        }
        
        var populateLostPwd = function(){
            $("#pnlLostPwd").data('populate',true);
            var $pnl = $("#pnlLostPwd");        
            var $form = `       
              <div class="mb-3 p-1 bg-secondary border">
                <input type="email" placeholder="`+i18n("sEmail")+`" class="form-control" id="txtlEmail" name="email" required>
                <div class="invalid-feedback">
                    `+i18n("sPlease_supply_a_valid")+' '+i18n("sEmail")+`
                </div>
              </div>
             `;
            var ci = $($form);
            $pnl.append(ci);  
        }
        
        var populateLostPwdSms = function(){
            $("#pnlLostPwdSms").data('populate',true);
            var $pnl = $("#pnlLostPwdSms");        
            var $form = `       
              <div class="mb-3 p-1 bg-secondary border">
                <input type="text" placeholder="`+i18n("sCell")+`" class="form-control" id="txtlPhone" name="phone" minlength="8" pattern="^[0-9]*$" required>
                <div class="invalid-feedback">
                    `+i18n("sThe_number_must_have_at_least_8_digits")+`
                </div>
              </div>
             `;
            var ci = $($form);
            $pnl.append(ci);  
        }
                 
        var onBtnLostPwdClick = function(event){       
            var form    = document.querySelector('#frmLostPwd');
            $('#alertWarnLostPwd').addClass('hide');
            if (!form.checkValidity()) {
                event.preventDefault()
                event.stopPropagation()
            }else{ 
                $('#btnLostPwd').button('loading');     
                var auto_suffix_check   = cDynamicData.settings.auto_suffix_check;
		        var auto_suffix			= cDynamicData.settings.auto_suffix;
            
                var formData = {
                    auto_suffix_check   : auto_suffix_check,
                    auto_suffix         : auto_suffix,
                    email               : $("#txtlEmail").val()
                };
                             
                $.ajax({
                    type      : "POST",
                    url       : urlLostPw,
                    data      : formData,
                    dataType  : "json",
                    encode    : true,
                })
                .done(function (data) {
                    $('#btnLostPwd').button('reset');
                    if(data.success){
                        //Hide reg / show login
                        $("#modalLostPwd").modal('hide');
                        $("#myModal").modal('show');             
                    }else{
                        $('#alertWarnLostPwd').html(data.message);
                        $('#alertWarnLostPwd').addClass('show');
                    }
                });
            }
            form.classList.add('was-validated');
        }
        
        var onBtnLostPwdClickSms = function(event){          
            var form    = document.querySelector('#frmLostPwdSms');
            $('#alertWarnLostPwdSms').addClass('hide');
            if (!form.checkValidity()) {
                event.preventDefault()
                event.stopPropagation()
            }else{ 
                $('#btnLostPwdSms').button('loading');                               
                var auto_suffix_check   = cDynamicData.settings.auto_suffix_check;
                var auto_suffix			= cDynamicData.settings.auto_suffix;
                var formData = {
                    auto_suffix_check   : auto_suffix_check,
                    auto_suffix         : auto_suffix,
                    phone               : $("#txtlPhone").val()
                };
                             
                $.ajax({
                        type      : "POST",
                        url       : urlLostPw,
                        data      : formData,
                        dataType  : "json",
                        encode    : true,
                    })
                    .done(function (data) {
                        $('#btnLostPwdSms').button('reset'); 
                        if(data.success){
                            //Hide reg / show login
                            $("#modalLostPwdSms").modal('hide');
                            $("#myModal").modal('show');             
                        }else{
                            $('#alertWarnLostPwdSms').html(data.message);
                            $('#alertWarnLostPwdSms').addClass('show');
                        }
                });              
            }
            form.classList.add('was-validated');
        }
            
        var testForHotspot = function () {
            return testForHotspotCoova();
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
            init                    : init  
        }   
    }
    
    
function ChilliMD5() {

	var hexcase = 0;  /* hex output format. 0 - lowercase; 1 - uppercase        */
	var b64pad  = ""; /* base-64 pad character. "=" for strict RFC compliance   */
	var chrsz   = 8;  /* bits per input character. 8 - ASCII; 16 - Unicode      */

	this.hex_md5 = function (s){
		return binl2hex(core_md5(str2binl(s), s.length * chrsz));
	};
	
	this.str2hex = function(s){
	    return str2hex(s);	
	}
	this.md5 = function(s){
	    return core_md5(s, s.length * chrsz);
	}

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
