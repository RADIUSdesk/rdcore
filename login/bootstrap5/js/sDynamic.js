var sDynamic = (function () {

    //Immediately returns an anonymous function which builds our modules
    return function (co) {    //co is short for config object
    
    
        //=====Constants======
        cDynUrl         = location.protocol+'//'+document.location.hostname+"/cake3/rd_cake/dynamic-details/info-for.json";
        cAjaxTimeout    = 3000;
        cDynamicData    = undefined; //Will be populated when gettting DynamicDetail from back-end
        cDebug          = true;
        
        //Change the following when using this on the Mobile page
        cMaxWidth       = 600; //300 mobile 600 desktop
        cMinWidth       = 300; //280 mobile 300 desktop
        hideLogin       = true;//false mobile true desktop
        
        //====Functions======
        fDebug          = function(message){  
            if(cDebug){
                console.log(message)  
            }
        };
        
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
                        cDynamicData = j.data;                 
                        buildGuiBasedOnData();
                    }else{
                    
                        //title: i18n("sHuston_we_have_a_problem"),
                        //text: i18n('sGo_to_RADIUSdesk_cm_open_the_b_Dynamic Login Pages_b_applet_fs')+"<br>"+
                        //i18n('sSelect_an_entry_and_b_edit_b_it_fs')+"<br>"+
                        //i18n('sMake_sure_you_added_an_identifier_from_this_URL_s_query_string_under_b_Dynamic_Keys_b_to_ensure_proper_working_of_this_login_page')+"<br>"+

                        var item_string = "<b>- AVAILABLE -</b><br>\n";
                        var stripe =false;
                    
                        Object.keys(j.data).forEach(key => {
                            console.log(key, j.data[key]);
                            if(key == 'client_info'){
                                return;
                            }
                            if(stripe){
                                item_string = item_string + '<div style="background:#d2d4d4;font-size:12px;">'+key+' <span style="color:blue;">'+j.data[key]+"</span></div>\n";
                            }else{
                                item_string = item_string + '<div style="font-size:12px;">'+key+' <span style="color:blue;">'+j.data[key]+"</span></div>\n";
                            }
                            stripe = ! stripe;
                        });
                        $("#myModal .modal-body").html(item_string);
                        $("#myModal").modal('show');
                    
                    }
                })
                .fail(function (error) {                   
                    console.log(error)
                });
        };
               
        var buildGuiBasedOnData = function(){
            fDebug("Building GUI");
                                         
            //We build the photo's
            guiHeader();
            guiGallery();         
            guiConnect();         
            guiTranslate()                            
            eventBindings();
                       
            //FIXME This must actually use the setting specified per login page
            //Timeout for login page pop-up
            if(cDynamicData.settings.show_screen_delay !== undefined){
                setTimeout(showLogin, cDynamicData.settings.show_screen_delay*1000); //multiply with 1000 since its milliseconds 
            }else{
                showLogin();
            }
                   
            //Call the Connect side....
            var chilli_json_unavailable = false;
            var useCHAP = false;
            if(cDynamicData.settings.chilli_json_unavailable !== undefined){
                if(cDynamicData.settings.chilli_json_unavailable == true){
                    chilli_json_unavailable = true;
                }          
            }
            if(cDynamicData.settings.chilli_use_chap !== undefined){
                if(cDynamicData.settings.chilli_use_chap == true){
                    useCHAP = true;
                }          
            }
            if(chilli_json_unavailable == true){
                var c   = sConnectSimple({cDynamicData: cDynamicData, useCHAP: useCHAP});
            }else{            
                var c   = sConnect({cDynamicData: cDynamicData, useCHAP: useCHAP});
            }
            c.init();
        
            if(cDynamicData.settings.social_login.active == true){
                c.checkSocialLoginReturn();
            }	                                           	    
        };
        
        function showLogin() {       
            var myModal = new bootstrap.Modal(document.getElementById('myModal'));
            myModal.show();
        }
        
        var eventBindings = function(){        
           $("#aConnect").on("click", function(){
                showLogin()
            });        
        }
        
        var guiHeader  = function(){ 
        
            if(cDynamicData.settings.show_name){
                $('#aTitle').text(cDynamicData.detail.name);
                $('#aTitle').attr('style',"color:#"+cDynamicData.settings.name_colour+";");
            }
            
            //Set the title also
            $(document).attr("title", cDynamicData.detail.name);
           
            var show_selection = false;
            if($.isArray(cDynamicData.settings.available_languages)){
                $('#liLanguages').removeClass('d-none'); //Make it visible
                var $menu_item = $('#divLangList');
                cDynamicData.settings.available_languages.forEach(function(item){
                    var $di = '<a class="dropdown-item" href="#" data-language-id="'+item.id+'">'+item.value+'</a>';
                    var ci = $($di);
                    ci.on("click",function(e,f,g){
                        //console.log($( e.target ).attr("data-language-id"));
                        Cookies.set('i18n', $( e.target ).attr("data-language-id"));
					    location.reload();
                    });
                    $menu_item.append(ci);                                
                });          
            }        
        }
             
        var guiConnect  = function(){
    
            //Username and or Voucher
            var $voucher_user = '';
            var $pnlLogin  = $('#pnlLogin');         
                   
            if(
                (cDynamicData.settings.voucher_login_check == true)&&
                (cDynamicData.settings.user_login_check == true)){
               
                 var $nav_links = `   
                 <ul class="nav nav-pills">
                  <li class="nav-item">
                    <a class="nav-link active" aria-current="page" data-bs-toggle="tab" data-bs-target="#nav-user" href="#"><i class="bi-person"></i> <span data-translate="sUser">User</span></a>
                  </li>
                  <li class="nav-item">
                    <a class="nav-link" data-bs-toggle="tab" data-bs-target="#nav-voucher" href="#"><i class="bi-ticket"></i> <span data-translate="sVoucher">Voucher</span></a>
                  </li>
                </ul>`;
                
                var $nav_conent = `
                <div class="tab-content p-0" id="nav-tabContent">
                  <div class="tab-pane fade show active" id="nav-user" role="tabpanel" aria-labelledby="nav-user-tab">         
                    <div class="d-grid gap-3">
                      <div class="mb-3">
                      </div>
                      <div class="mb-3">
                        <input type="email" placeholder="`+i18n("sUsername")+`" class="form-control" id="txtUsername">
                      </div>
                      <div class="mb-3">
                        <input type="password" placeholder="`+i18n("sPassword")+`" class="form-control" id="txtPassword">
                      </div>
                    </div>              
                  </div>
                  <div class="tab-pane fade" id="nav-voucher" role="tabpanel" aria-labelledby="nav-voucher-tab">
                    <div class="d-grid gap-3">
                      <div class="mb-3">
                      </div>
                      <div class="mb-3">
                        <input type="email" placeholder="`+i18n("sVoucher")+`" class="form-control" id="txtVoucher">
                      </div>
                    </div>                 
                  </div>
                </div>`;
                            
                var ci = $($nav_links+$nav_conent);
                $pnlLogin.append(ci);
                                          
            }else{
                if(
                    (cDynamicData.settings.voucher_login_check == false)&&
                    (cDynamicData.settings.user_login_check == true)){
                
                    var $user_form = `
                    <div class="d-grid gap-3 p-0">
                      <div class="mb-3">
                        <input type="email" placeholder="`+i18n("sUsername")+`" class="form-control" id="txtUsername">
                      </div>
                      <div class="mb-3">
                        <input type="password" placeholder="`+i18n("sPassword")+`" class="form-control" id="txtPassword">
                      </div>
                    </div>`;
                    var ci = $($user_form);
                    $pnlLogin.append(ci);                   
                }
                            
                if(
                    (cDynamicData.settings.voucher_login_check == true)&&
                    (cDynamicData.settings.user_login_check == false)){
                
                        var $voucher_form = `
                        <div class="d-grid gap-3 p-0">
                          <div class="mb-3">
                            <input type="email" placeholder="`+i18n("sVoucher")+`" class="form-control" id="txtVoucher">
                          </div>
                        </div>`;
                        var ci = $($voucher_form);
                        $pnlLogin.append(ci);
                }
                
                 if(
                    (cDynamicData.settings.voucher_login_check == false)&&
                    (cDynamicData.settings.user_login_check == false)){   
                    //Hide the connect button
                    $('#btnConnect').addClass('d-none');                  
                }  
                
                                
            }
            
            //Terms and conditions
            if(cDynamicData.settings.t_c_check == true){            
                $('#divTerms').removeClass('d-none');
                $("#aTerms").attr('href',cDynamicData.settings.t_c_url);            
            }else{           
                $('#divTerms').addClass('d-none');
            }
            
            //Click To Connect
            if(cDynamicData.settings.click_to_connect.connect_check == true){
                $('#btnClickToConnect').removeClass('d-none');                             
            }else{           
                $('#btnClickToConnect').addClass('d-none');    
            }
            
            //Click To Connect
            if(cDynamicData.settings.click_to_connect.connect_only == true){
                $('#btnConnect').addClass('d-none');
                $('#pnlLogin').removeClass('show');                             
            }
            
            //Social Login
            if(cDynamicData.settings.social_login.active == true){
            
                var $pnl = $("#divSocial");
                $('#divSocial').removeClass('d-none');
                cDynamicData.settings.social_login.items.forEach(function(i){
                
                    var n = i.name;
			        if(n == 'Facebook'){
				        $('#btnFacebook').removeClass('d-none');
			        }
			        if(n == 'Twitter'){
				        $('#btnTwitter').removeClass('d-none');
			        }
			        if(n == 'Google'){
				        $('#btnTwitter').removeClass('d-none');
			        }
                
                });
            }else{
                $('#divSocial').addClass('d-none');
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
            
            //$('#divSocial').addClass('d-none'); 
                                                 
        };
         
        var guiGallery = function(){
            var photos = [];  
            //Create an array from the list of photos
            var $indicator  = $('.carousel-indicators');
            var $inner      = $('.carousel-inner');
            cDynamicData.photos.forEach(function(i,j,k){
            
                if(i.active == false){
                    return;
                }
                
                var t_and_d = '';
                var img     = '';
                
                var logo_included = false;
                
                if((i.include_title)&&(!i.include_description)){
                    if(cDynamicData.settings.show_logo){
                        t_and_d = '<div class="carousel-caption"><img src="'+cDynamicData.detail.icon_file_name+'"/><h5>'+i.title+'</h5></div>';
                        logo_included = true;
                    }else{
                        t_and_d = '<div class="carousel-caption"><h5>'+i.title+'</h5></div>';
                    }                 
                } 
                if((!i.include_title)&&(i.include_description)){
                    if(cDynamicData.settings.show_logo){
                        t_and_d = '<div class="carousel-caption"><img src="'+cDynamicData.detail.icon_file_name+'"/><p>'+i.description+'</p></div>';
                        logo_included = true;
                    }else{
                        t_and_d = '<div class="carousel-caption"><p>'+i.description+'</p></div>';
                    }                 
                }           
                if((i.include_title)&&(i.include_description)){
                    if(cDynamicData.settings.show_logo){
                        t_and_d = '<div class="carousel-caption"><img src="'+cDynamicData.detail.icon_file_name+'"/><h5>'+i.title+'</h5><p>'+i.description+'</p></div>';
                        logo_included = true;
                    }else{
                        t_and_d = '<div class="carousel-caption"><h5>'+i.title+'</h5><p>'+i.description+'</p></div>';
                    }     
                }
                
                if((cDynamicData.settings.show_logo)&&(!logo_included)){
                    t_and_d = '<div class="carousel-caption"><img src="'+cDynamicData.detail.icon_file_name+'"/></div>';
                }
                
                var scrn = 'landscape';
                if(window.innerWidth == window.innerHeight){
                    scrn = 'block';
                }
                if(window.innerWidth < window.innerHeight){
                    scrn = 'portrait';
                }
                                     
                var imgFit = 'imgXY';
                
                //Image div                                
                if(i.fit == 'horizontal'){
                    imgFit = 'imgX';
                }
                
                if(i.fit == 'vertical'){
                    imgFit = 'imgY';
                }
                
                if(i.fit == 'original'){
                    imgFit = 'imgOrig';
                }

                if(i.fit == 'dynamic'){ 
                         
                    if((scrn == 'portrait')&&(i.layout == 'landscape')){
                        imgFit = 'imgX';
                    } 
                    if((scrn == 'landscape')&&(i.layout == 'portrait')){
                        imgFit = 'imgY';
                    } 
                    
                    if((scrn == 'landscape')&&(i.layout == 'landscape')){  
                    
                        if(window.innerWidth < i.width){ //Small Graphic
                            imgFit = 'imgX';
                        }
                      
                        if((window.innerWidth < i.width)&&(i.width > 2000)){ //Big graphic
                            imgFit = 'imgY';
                        }
                        
                        if(window.innerWidth > i.width){ //Small Graphic
                            imgFit = 'imgY';
                        }       
                    } 
                }
                              
                var $src    = i.file_name;
                var $color  = '#'+i.background_color;
                var $css    = {
                    'background-color' : $color
                }   
                if(i.fit == 'stretch_to_fit'){
                    $css['background-image'] = 'url(' + $src + ')'
                }else{
                    img = '<div class="itemImage '+imgFit+'"><img src="'+$src+'" alt="'+i.title+'"></div>';
                }
                         
                if(j ==0){
                    $indicator.append('<button type="button" data-bs-target="#crslMain" data-bs-slide-to="'+j+'" class="active" aria-current="true" aria-label="Slide '+j+'"></button>');
                }else{
                    $indicator.append('<button type="button" data-bs-target="#crslMain" data-bs-slide-to="'+j+'" aria-label="Slide '+j+'"></button>');                   
                }
                var ci = $('<div class="carousel-item">'+img+t_and_d+'</div>');
                $inner.append(ci);
                ci.css($css);
                ci.attr("data-bs-interval",i.slide_duration*1000);
                
                $(window).on('resize', function (){
                  $wHeight = $(window).height();
                  ci.height($wHeight);
                });               
                
                //console.log(i);              
            });
            
            var $item = $('.carousel-item'); 
            var $wHeight = $(window).height();
            $item.eq(0).addClass('active');
            $item.height($wHeight); 
            $item.addClass('full-screen');
            
            //Hide controlls if there are only one item
            if(cDynamicData.photos.length <=1){
                $('#carIndicator').addClass('d-none');
                $('#carCtlPrev').addClass('d-none');
                $('#carCtlNext').addClass('d-none');
            }              
        };
        
        var guiTranslate = function(){      
            $( "[data-translate]" ).each(function( index ) {
                //console.log( index + ": " + $( this ).text() );
                //console.log(i18n($( this ).attr("data-translate")));
                $( this ).text(i18n($( this ).attr("data-translate")));
            });   
        }
                    
        //Expose those public items...
        return {         
            init            : init
        }   
    }
})();
