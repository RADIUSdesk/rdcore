var rdDynamic = (function () {

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
               
            //Take care of resizing      
            window.onresize = resize; //Bind the resize event  
            resize();
              
            getDynamicDetail();
        };
        
        var  resize = function(){
        
            if($$("tbMain") == undefined){
                return
            }
        
            var h = $$("tbMain").$height;
            
            
            //webix.message("All is correct");
      
            $$('scrnPhoto').define("height", window.innerHeight-h);
            $$("scrnPhoto").resize();
            
            //Very important to see if there might be windows shown that we also need to resize
            if($$('winLogin') !== undefined){   
                if($$('winLogin').isVisible()){
                    $$('winLogin').define("height", window.innerHeight-h);
                    $$('winLogin').resize();
                }
            }
            
            if($$('winRegister') !== undefined){
                 if($$('winRegister').isVisible()){
                    $$('winRegister').define("height", window.innerHeight-h);
                    $$('winRegister').resize();
                }
            }
            
            if($$('winPassword') !== undefined){
             if($$('winPassword').isVisible()){
                    $$('winPassword').define("height", window.innerHeight-h);
                    $$('winPassword').resize();
                }
            } 
            
            if($$('winClientInfo') !== undefined){
             if($$('winClientInfo').isVisible()){
                    $$('winClientInfo').define("height", window.innerHeight-h);
                    $$('winClientInfo').resize();
                }
            }                 
        };
         
        var getDynamicDetail = function(){
            var h       = document.location.hostname;
            var s       = document.location.search;
            
            fDebug("Fetching DynamicDetail");
           
            webix.ajax().timeout(cAjaxTimeout).get(
                cDynUrl+s,{ 
                error   : function(text, data, XmlHttpRequest){
                    fDebug("Problems fetching Dynamic Detail");    
                },
                success : function(text, data, XmlHttpRequest){
                    if(data.json().success == true){
                        fDebug("Got Dynamic Detail");                
                        cDynamicData = data.json().data;
                        fDebug(cDynamicData);
                        buildGuiBasedOnData();
                    }else{
                    
                        var item_string = "<b>- AVAILABLE -</b><br>\n";
                        var stripe =false;
                        Object.keys(data.json().data).forEach(key => {
                            console.log(key, data.json().data[key]);
                            if(stripe){
                                item_string = item_string + '<div style="background:#d2d4d4;font-size:12px;">'+key+' <span style="color:blue;">'+data.json().data[key]+"</span></div>\n";
                            }else{
                                item_string = item_string + '<div style="font-size:12px;">'+key+' <span style="color:blue;">'+data.json().data[key]+"</span></div>\n";
                            }
                            stripe = ! stripe;
                        });
                                           
                        webix.alert({
                            title: i18n("sHuston_we_have_a_problem"),
                            text: i18n('sGo_to_RADIUSdesk_cm_open_the_b_Dynamic Login Pages_b_applet_fs')+"<br>"+
                            i18n('sSelect_an_entry_and_b_edit_b_it_fs')+"<br>"+
                            i18n('sMake_sure_you_added_an_identifier_from_this_URL_s_query_string_under_b_Dynamic_Keys_b_to_ensure_proper_working_of_this_login_page')+"<br>"+
                            item_string,
                            type:"confirm-error"
                        });
                    }
                }
            });
        };
               
        var buildGuiBasedOnData = function(){
            fDebug("Building GUI");
                              
            //We build the photo's
            guiGallery();
            
            guiConnect();
            
            //The Help Window
            guiHelp();
            
            //About Window
            guiAbout();
            
            //Client Info For Click To Connect
            if(cDynamicData.settings.click_to_connect.cust_info_check){
                guiCi();
            }
            
            eventBindings();
            
            slideShowCheck(); 
            
            //FIXME This must actually use the setting specified per login page
            //Timeout for login page pop-up
            if(cDynamicData.settings.show_screen_delay !== undefined){
                setTimeout(showLogin, cDynamicData.settings.show_screen_delay*1000); //multiply with 1000 since its milliseconds 
            }else{
                setTimeout(showLogin, 10);
            }
            
            if(cDynamicData.settings.show_logo !== undefined){
                var s_branding = '';
                if(cDynamicData.settings.show_logo == true){
                    s_branding = '<div class="logo"><img src="'+cDynamicData.detail.icon_file_name+'"/></div>';  
                }
                if(cDynamicData.settings.show_name == true){
                    s_branding = s_branding+ '<div class="content" style="color: #'+cDynamicData.settings.name_colour+'"><h1>'+cDynamicData.detail.name+'</h1></div>';  
                }
                
                if(s_branding !== ''){
                    webix.ui({
                        id      : "winBranding",
                        view    : "window",
                        css     : "branding",
                        modal   : false,
                        position: "top",
                        head    : false,
                        borderless: true,
                        body: {
                            template: s_branding                 
                        }
                    });
                    $$('winBranding').show();
                }                    
           }
                        
            //Fill it         
            //Call the Connect side....
            var c       = rdConnect({cDynamicData: cDynamicData});
            c.index(); 
            //Check if this page was a social login return
		    c.checkSocialLoginReturn();		    
		    
        };
        
        function showLogin() {
        
            var h = $$("tbMain").$height;
            $$('winLogin').define("height", window.innerHeight - h);
            $$("winLogin").resize();

            if ($$("winHelp").isVisible()) {
                $$("winHelp").hide();
            }

            if ($$("winAbout").isVisible()) {
                $$("winAbout").hide();
            }

            if (!$$("winLogin").isVisible()) {
                $$("winLogin").show();    
            }
        }
        
        var eventBindings = function(){
        
            //Show the main connection window
            $$("btnMainConnect").attachEvent("onItemClick",function(){
                console.log("Click event");
                showLogin();
            });
            
            //Show tha side menu
            $$("btnMainMenu").attachEvent("onItemClick",function(){
               
                if( $$("mnuMainMenu").config.hidden){
                    $$("mnuMainMenu").show();
                }else{
                    $$("mnuMainMenu").hide();
                }
            });
            
            var menu_items_plain = [
                {id: 'mnuHelp', value: i18n('sHelp'),   icon: 'help-circle'},
                {id: 'mnuAbout', value: i18n('sAbout'), icon: 'information'}
            ]
            
            if(cDynamicData.settings.available_languages !== ''){
                var menu_i18n = [{ $template:"Spacer" }];
                cDynamicData.settings.available_languages.forEach(function(i){
                    menu_i18n.push({id: i.id, value: i18n('s'+i.value),icon:i.id,css:"rdFlag"});
                });
                var menu_items = $.merge(menu_items_plain, menu_i18n);    
            }else{
                var menu_items = menu_items_plain;
            }
         
            webix.ui({
                view    : "sidemenu",
                id      : "mnuMainMenu",
                width   : 200,       
                position: "left",
                state   :function(state){
	                var toolbarHeight = $$("tbMain").$height;
	                state.top = toolbarHeight;
	                state.height -= toolbarHeight;
                },
                css     : "my_menu",
                body    : {
	                template    : "<span class='webix_icon mdi mdi-#icon#'></span><span class='#css#'> #value#</span>",
	                view:"menu",
                    id:"my_menu",
                    subMenuPos:"right",
                    layout:"y",
                        
	                data        : menu_items,
	                select      : true,
	                on:{
						onAfterSelect: function(id){
							//webix.message("Selected: "+this.getItem(id).value)
							var h = $$("tbMain").$height;
                            
							if(id == 'mnuHelp'){
							    $$('winHelp').define("height", window.innerHeight-h);
                                $$("winHelp").resize();
                                if($$("winLogin").isVisible()){
                                    $$("winLogin").hide();
                                }
                                
                                if($$("winAbout").isVisible()){
                                    $$("winAbout").hide();
                                }
                                
                                if(!$$("winHelp").isVisible()){
                                    $$("winHelp").show();
                                }
							}
							
							if(id == 'mnuAbout'){
							    $$('winAbout').define("height", window.innerHeight-h);
                                $$("winAbout").resize();
                                if($$("winLogin").isVisible()){
                                    $$("winLogin").hide();
                                }
                                if($$("winHelp").isVisible()){
                                    $$("winHelp").hide();
                                }
                                
                                if(!$$("winAbout").isVisible()){
                                    $$("winAbout").show();
                                }   
							}
							//Flags will have a rdFlag
							if(this.getItem(id).css == 'rdFlag'){
							    Cookies.set('i18n', id);
							    location.reload();
							}		
						}
					},
	                type        : {
		                height  : 40
	                }
                }
            });     
        }
        
        var slideShowCheck = function(){
        
            var firstTime = true;
            var slideTime;
            
            var enforce     = false;
            var enforce_time;
 
            if(cDynamicData.settings.slideshow_check == true){
                //console.log("Start Slideshow Timer");
                //-- Not working ;-)---
                /*
                if(cDynamicData.settings.slideshow_enforce_watching == true){
                    enforce         = true;
                    enforce_time    = cDynamicData.settings.slideshow_enforce_seconds;
                    //Disable the connect button
                    $$('btnMainConnect').disable();
                    $$('btnMainMenu').disable();
                    
                    
                    var node    = $$("btnMainConnect").$view;
                    var btnTop  = node.offsetTop;
                    var btnLeft = node.offsetLeft; 
                    
                    webix.ui({
				        view:"window",
				        id: 'winAdFeedback',
				        height: 50,
			            width:200,
			           // left:50, top:50,
			            left: (btnLeft- 100),
			            top : (btnTop - 100),
			            head:false,
				        body:{
					         template: "Count Down #seconds# seconds",
					         id: 'tplAdFeedback',
					         data: { seconds: ""} 
				        }
			        }).show();
			        $$("tplAdFeedback").setValues({seconds:enforce_time});
			        
			        var node = $$("btnMainConnect").$view;
			        //console.log(node);
                    
                }
                //--- END Not working ;-) ---
                */
                var slideTimer = setInterval(slideChanger, 1000);      
            }
            
            function slideChanger() {
            
                var activeNow = $$('crslMain').getActiveIndex();
                var slideDurationNow = cDynamicData.photos[activeNow].slide_duration;
                if(enforce == true){
                    enforce_time = enforce_time -1;
                    $$("tplAdFeedback").setValues({seconds:enforce_time});
                    if(enforce_time == 0){
                        $$('btnMainConnect').enable();
                        $$('btnMainMenu').enable();
                        $$('winAdFeedback').hide();
                    }
                }
                
                //console.log(cDynamicData.photos[activeNow]);
                if(firstTime){
                    firstTime = false;
                    slideTime = slideDurationNow;
                }
                slideTime = slideTime - 1;
                if(slideTime == 0){
                     if(($$('crslMain').getActiveIndex()+1)== cDynamicData.photos.length){
                        $$('crslMain').setActiveIndex(0);
                     }else{
                        $$('crslMain').showNext();
                     }
                     //New slide's settings
                     var activeNow = $$('crslMain').getActiveIndex();
                     var slideDurationNow = cDynamicData.photos[activeNow].slide_duration;
                     slideTime = slideDurationNow;     
                }          
            }    
        }     
        
        var guiConnect  = function(){
    
            //Username and or Voucher
            var voucher_user = []; //Default is to have the voucher;       
            if(
                (cDynamicData.settings.voucher_login_check == true)&&
                (cDynamicData.settings.user_login_check == true)){
               
                    voucher_user = [
                        {
                            view    :"tabbar", 
                            id      :'tabbar', 
                            multiview:true,
                            value   :'userView',
                            css     :"tabSmaller",
                            options : [
                                { value: "<span class='webix_icon mdi mdi-account'></span>  "+i18n("sUser"), id: 'userView' },
                                { value: "<span class='webix_icon mdi mdi-ticket-account'></span>  "+i18n("sVoucher"), id: 'voucherView'}
                            ]
                        },
                        {
                            cells   :[
                                {
                                    id:"userView",
                                    animate :false,
                                    rows:[
                                        { view:"text", label:i18n("sUsername"), name: "username",id:'Username'},
                                        { view:"text", type:"password", name: "password",label:i18n("sPassword"),id:"Password"}
                                    ]
                                },
                                {
                                    id  :"voucherView",
                                    animate :false,
                                    rows:[
                                        { view:"text", label:i18n("sVoucher"), name: "voucher",id:'voucher'}
                                    ]
                                }

                            ]
                        }
                    ];
                         
            }else{
                if(
                    (cDynamicData.settings.voucher_login_check == false)&&
                    (cDynamicData.settings.user_login_check == true)){
                
                    voucher_user = [
                        { view:"text", label:i18n("sUsername"), name: "username",id:'Username'},
                        { view:"text", type:"password", name: "password",label:i18n("sPassword"),id:"Password"}
                    ];
                }
                
                
                if(
                    (cDynamicData.settings.voucher_login_check == true)&&
                    (cDynamicData.settings.user_login_check == false)){
                
                        voucher_user = [{ view:"text", label:i18n("sVoucher"), name: "voucher",id:'voucher'}]; //Default is to have the voucher;
                }
                
            }
            
            //Buttons
            var b = [];
            
            if(cDynamicData.settings.click_to_connect.connect_only == true){
                 if(cDynamicData.settings.t_c_check == true){
                    b.push({ 
                        view    : "checkbox",
                        id      : 'checkboxTandC',
                        labelRight: "<a href='"+cDynamicData.settings.t_c_url+"'>"+i18n("sTerms_and_Conditions")+"</a>"
                        // labelRight:i18n("sTerms_and_Conditions")
                    });
                    
                     b.push({
                        view        : 'template',
                        borderless  : true,
                        height      : 40,
                        css         : 'tcText',
                        template    : "* "+i18n('sBy_continuing_cm_you_agree_to_the_terms_and_conditions_fs')
                    });
                    
                }
                
                b.push({view:"template",borderless:true,id:'tplConnectInfo',height: 50});
                
                b.push({ 
                    view    : "button", 
                    value   : i18n('sFree_Access') , 
                    id      : 'btnClickToConnect',
                    css     : 'btnDashed'
                });  
                
                var con_insides  = b;
            }else{
            
                if(cDynamicData.settings.t_c_check == true){
                    b.push({ 
                        view    : "checkbox", 
                        id      : 'checkboxTandC',
                        css     : 'checkboxTandC',
                        labelRight: "<a href='"+cDynamicData.settings.t_c_url+"'>"+i18n("sTerms_and_Conditions")+"</a>"
                        //labelRight:i18n("sTerms_and_Conditions")
                    });
                    
                     b.push({
                        view        : 'template',
                        borderless  : true,
                        height      : 40,
                        css         : 'tcText',
                        template    : "* "+i18n('sBy_continuing_cm_you_agree_to_the_terms_and_conditions_fs')
                    });
                    
                }
                
                b.push({view:"template",borderless:true,id:'tplConnectInfo',height: 50});
                
                if(
                    (cDynamicData.settings.voucher_login_check == true)||
                    (cDynamicData.settings.user_login_check == true)){
                
                        b.push({
                            view    : "button", 
                            value   : i18n('sLogin'), 
                            type    : "form",
                            id      : 'btnLogin'
                        });
                }
                
                
                if(cDynamicData.settings.click_to_connect.connect_check == true){
                    b.push({ 
                        view    : "button", 
                        value   : i18n('sFree_Access') , 
                        id      : 'btnClickToConnect',
                        css     : 'btnDashed'
                    });
                }
                
                if(cDynamicData.settings.social_login.active == true){
                    cDynamicData.settings.social_login.items.forEach(function(i){
                        var n = i.name;
				        var icn = "star"
				        if(n == 'Facebook'){
					        icn = "facebook";
				        }
				        if(n == 'Twitter'){
					        icn = "twitter";
				        }
				        if(n == 'Google'){
					        icn = "google-plus";
				        }
				               
                        b.push({ 
                            view    : 'button',
                            type    : "htmlbutton", 
                            label   : '<span class="webix_icon mdi mdi-'+icn+'"></span><span class="text"> '+i18n('sConnect_with')+' '+i18n('s'+i.name)+'</span>',
                            id      : 'btn'+n,
                            css     : 'btnDashed btn'+n
                        });
                    });
                }
                
                if(cDynamicData.settings.register_users == true){
                    b.push({ 
                        view    : 'button',
                        type    : "htmlbutton", 
                        label   : '<span class="webix_icon wxi-pencil"></span><span class="text"> '+i18n('sSign_Up')+'</span>',
                        id      : 'btnRegister',
                        css     : 'btnDashed btnRegister'
                    });
                }
                
                if(cDynamicData.settings.lost_password == true){
                    b.push({ 
                        view    : 'button',
                        type    : "htmlbutton", 
                        label   : '<span class="webix_icon mdi mdi-key"></span><span class="text"> '+i18n('sLost_Password')+'</span>',
                        id      : 'btnPassword',
                        css     : 'btnDashed btnPassword'
                    });
                }
                
                var con_insides  = voucher_user.concat(b);
            };
            
            //Check if we need to short circuit it
            if(cDynamicData.mobile_app !== null){                   
                if(cDynamicData.mobile_app.mobile_only == true){
                    var m_template = cDynamicData.mobile_app.content;
                    if(cDynamicData.client_info.isMobile == true){
                        console.log("Moblie Client");
                        if((cDynamicData.mobile_app.android_enable == true)&&(cDynamicData.client_info.isAndroid !== false)){
                            m_template = cDynamicData.mobile_app.android_content;
                            m_template = m_template+'<br><a href="'+cDynamicData.mobile_app.android_href+'">'+cDynamicData.mobile_app.android_text+'</a><br>';
                        }
                        if((cDynamicData.mobile_app.apple_enable == true)&&(cDynamicData.client_info.isApple !== false)){
                            m_template = cDynamicData.mobile_app.apple_content;
                            m_template = m_template+'<br><a href="'+cDynamicData.mobile_app.apple_href+'">'+cDynamicData.mobile_app.apple_text+'</a><br>';
                        }
                    }
                    con_insides = [{
                        view        : 'template',
                        borderless  : true, 
                        template    : m_template,
                        type        : 'clean',
                        autoheight  : true, 
                        batch       : 'scrnMobileAppOnly'
                    }];              

                }
            }               
            //-----
            
            var sTabBarOptions  = [{ value: "<span class='webix_icon mdi mdi-heart-pulse'></span>"+i18n('sSession'), id: 'sessionView' }];
            var sTabBarCells    = [
                {
                    id:"sessionView",
                    rows:[
                        { 
                            view    :"property",
                            id      :'propertySession',
                            height  : 160,
                            editable:false,
                            elements:[
                                { label :i18n('sUsername'),       type :"text", id:"acct_un"},
                                { label :i18n('sConnected'),      type :"text", id:"acct_up"},
                                { label :i18n('sData_in'),        type :"text", id:"acct_di"},
                                { label :i18n('sData_out'),       type :"text", id:"acct_do"},
                                { label :i18n('sData_total'),      type :"text", id:"acct_dt"}
                            ]
                        },
                        {
                            view: 'template',
                            borderless:true,
                            height: 25,
                            id  : 'templateSessionRefesh',
                            template: "<strong>"+i18n('sRefreshing_in')+" </strong><span id='status_refresh' class='info'> </span><strong> "+i18n('sseconds_fs')+"</strong>"
                        }
                    ]
                }
            ];
            
            
            if(cDynamicData.settings.usage_show_check == true){
                sTabBarOptions.push({ value: "<span class='webix_icon mdi mdi-settings'></span>"+i18n('sUsage'), id: 'usageView'});
                
                sTabBarCells.push(
                    {
                        id  :"usageView",   
                        rows:[
                            { view:"slider", label:i18n('sData'), value:"20", name:"data",       
                                height: 100,
                                id: 'sliderData'
                            },
                            { view:"slider", label:i18n('sTime'), value:"20", name:"time",
                                height: 100,
                                id: 'sliderTime'
                            },
                            {
                                view: 'template',
                                borderless:true,
                                height: 25,
                                id  : 'templateUsagerRefesh',
                                template: "<strong>"+i18n('sRefreshing_in')+" </strong><span id='usage_refresh' class='info'> </span><strong> "+i18n('sseconds_fs')+"</strong>"
                            }
                        ]
                    }
                );
            }
                
            var tabBarStatus = {
                view    :"tabbar", 
                id      :'tabStatus',
                batch   : 'scrnStatus', 
                multiview:true, 
                css     :"tabSmaller",
                options : sTabBarOptions
            };
            
            var tabStatusContent = {
                batch   : 'scrnStatus',
                cells   : sTabBarCells       
            };      
                    
           //----- 
           webix.ui({
                view:"window",
                id:"winLogin",
                autofit:true,
                resize: true,  
                move: true,
                //fullscreen: true,
                position:"top", //or "top"
                head:{
					view:"toolbar", cols:[
					    { view: "label",  label: i18n('sConnect'), align: 'center'},
						{ view: "icon",   icon: "wxi-close", hotkey: "escape",click:"$$('winLogin').hide();"}
						]
				},
				body : {
		                minWidth    : cMinWidth,
                        maxWidth    : cMaxWidth,
                        id          : 'layoutConnect',
                        visibleBatch: 'scrnConnect',
                        borderless  : true,
                        type        : 'space',
                        hidden      : hideLogin,
		                rows: [{
		                        //scrnConnect
		                        view    :"form",
		                        scroll  :true,
		                        batch   : 'scrnConnect',
                                rows:[
                                    {
                                        view        :"form",
                                        borderless  :true,
                                        id          :"formConnect", 
                                        css         : 'formConnect',                       
                                        elementsConfig:{
                                            labelPosition:"top"
                                        },
                                        rows: con_insides
                                    }
                                 ]
                             },
                            //scrnStatus
                            {
                                view    :"form",
                                scroll  :true,
                                batch   : 'scrnStatus',
                                rows:[
                                    {
                                        view        : 'form',
                                        elementsConfig:{
                                            labelPosition:"top"
                                        },
                                        rows        : [
                                            tabBarStatus,
                                            tabStatusContent,
                                            { 
                                                view    :"button", 
                                                value   :i18n('sGo_Onto_Internet') , 
                                                type    :"form",
                                                id      : 'btnGoInternet'
                                            },
                                            { 
                                                view    :"button", 
                                                value   :i18n('sDisconnect') , 
                                                type    :"danger",
                                                id      : 'btnDisconnect'
                                            },
                                            {}
                                        ]
                                    }
                                ]
                            },
                            //scrnNotHotspot
                            {view:"template",borderless:true, template: i18n('sNot_a_hotspot'), type: "header" , batch   : 'scrnNotHotspot'}, 
                            {view:"template",borderless:true, template: "<br><b>"+i18n('sConnect_through_a_hotspot_please')+"</b>", batch   : 'scrnNotHotspot'}   
                            
                        ]
                    }
            }); 
            
            //We need this to show an overlay when connecting
            webix.extend($$("layoutConnect"), webix.OverlayBox);
                   
        };
        
        var guiHelp     = function(){ 

            var pages = [];
            
            //Create an array from the list of pages
            cDynamicData.pages.forEach(function(i){
                var item = {view:"template",borderless:true,template:"<h1>"+i.name+"</h1>"+i.content,autoheight:true}
                pages.push(item)
            });
             
            webix.ui({
                view:"window",
                id:"winHelp",
                position:"top", //or "top"
                head:{
					view:"toolbar", cols:[
					    { view: "label",  label: i18n('sHelp'), align: 'center'},
						{ view:"icon",    icon: "wxi-close", hotkey: "escape", click:"$$('winHelp').hide();"}
						]
				},
				body : { 
                    view        : "form",
                    scroll      : true,
                    minWidth    : cMinWidth,
                    maxWidth    : cMaxWidth,  
                    rows        : pages  
                }
            }); 
            
        };
    
        var guiGallery = function(){ 
            var photos = [];  
            //Create an array from the list of photos
            cDynamicData.photos.forEach(function(i){
                var file = i.file_name;
              //  var item = { css: "imgCarousel", template:img, data:{src:file} }
                var item = { css: "imgCarousel", template: img, data: i }
                photos.push(item)
            });
        
            var c = {
                view    :"carousel",
			    id      :"crslMain",
			    cols    :photos,
			    navigation:{
                    type: "side",
                    items:true,
                    buttons:true
                }
            }
                
            function img(obj){
            
                /*A Typical object will look like this:
                {
                    "id": 107,
                    "dynamic_detail_id": 3,
                    "title": "Rocks rocks rocks",
                    "description": "Nature\u0027s own obstacle course",
                    "url": "",
                    "file_name": "\/cake3\/rd_cake\/img\/dynamic_photos\/1369746199.jpg",
                    "created": "2013-05-28T15:03:19+00:00",
                    "modified": "2017-01-16T10:00:46+00:00",
                    "active": true,
                    "fit": "stretch_to_fit",
                    "background_color": "ffffff",
                    "slide_duration": 10,
                    "include_title": true,
                    "include_description": true
                }
                We will use this data with logic to return the item.*/
                
                var file = obj.file_name;
                
                
                var return_string = "<div style='background-color: #"+obj.background_color+";' class='divCarousel'>\n"; //Wrapper
                
                //var return_string = '';
                //Title Check
                if(obj.include_title){
                   // 
                   if(obj.url !== ''){
                        return_string = return_string+ "<div class='itemTitle'><a href='"+obj.url+"'>"+obj.title+"</a></div>\n";
                   }else{
                        return_string = return_string+ "<div class='itemTitle'>"+obj.title+"</div>\n";
                   }
                }
                
                //Title Check
                if(obj.include_description){
                    return_string = return_string+ "<div class='itemDescription'>"+obj.description+"</div>\n";
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
                if(obj.fit == 'horizontal'){
                    imgFit = 'imgX';
                }
                
                if(obj.fit == 'vertical'){
                    imgFit = 'imgY';
                }
                
                if(obj.fit == 'original'){
                    imgFit = 'imgOrig';
                }

                if(obj.fit == 'dynamic'){ 
                         
                    if((scrn == 'portrait')&&(obj.layout == 'landscape')){
                        imgFit = 'imgX';
                    } 
                    if((scrn == 'landscape')&&(obj.layout == 'portrait')){
                        imgFit = 'imgY';
                    } 
                    
                    if((scrn == 'landscape')&&(obj.layout == 'landscape')){  
                    
                        if(window.innerWidth < obj.width){ //Small Graphic
                            imgFit = 'imgX';
                        }
                      
                        if((window.innerWidth < obj.width)&&(obj.width > 2000)){ //Big graphic
                            imgFit = 'imgY';
                        }
                        
                        if(window.innerWidth > obj.width){ //Small Graphic
                            imgFit = 'imgY';
                        }       
                    } 
                }
                    
                return_string = return_string + "<div class='itemImage "+imgFit+"'><img src='"+obj.file_name+"' ondragstart='return false'/></div>\n"; 
                
                return_string = return_string+"</div>";
                
                //console.log(return_string);
                return return_string;
                
		       // return '<div style="height: 100%; width: 100%;"><img src="'+file+'" class="content" ondragstart="return false"/></div>'
	        }        
           webix.ui([c], $$('scrnPhoto')); 
        };
        
        var guiAbout    = function(){
        
            var c = { 
                view        :"property",
                id          :'propertyAbout',
                editable    :false,
                css         :'layoutAbout', 
                height      : 400,
                elements:[
                    { label:i18n('sContact_Detail'), type:"label"},
                    { label :i18n('sCell'),              type :"text", id:"abt_cell"},
                    { label :i18n('sPhone'),             type :"text", id:"abt_phone"},
                    { label :i18n('sFax'),              type :"text", id:"abt_fax"},
                    { label :i18n('semail'),            type :"text", id:"abt_email"},
                    { label :i18n('sURL'),              type :"text", id:"abt_url"},
                    {},
                    { label :i18n('sOther_Info'), type:"label"},
                    { label :i18n('sStreet'),           type :"text", id:"abt_street"},
                    { label :i18n('Town_fs_Suburb'),    type :"text", id:"abt_town_suburb"},
                    { label :i18n('sCity'),             type :"text", id:"abt_city"},
                    { label :i18n('sCountry'),          type :"text", id:"abt_country"},
                    { label :i18n('sLat_fs_Lon'),       type :"text", id:"abt_lat_lon"}
                ]
            } 
                
            webix.ui({
                view    : "window",
                id      : "winAbout",
                position: "top", //or "top"
                head    : {
					view:"toolbar", cols:[
					    { view: "label", label: i18n("sAbout"), align: 'center'},
						{ view: "icon", icon: "wxi-close", hotkey: "escape", click:"$$('winAbout').hide();"}
						]
				},
				body : { 
                    view    :"form",
                    scroll  :true,
                    rows    :[ 
                        {
                            borderless  : true,
                            type        : 'space',
                            minWidth    : cMinWidth,
                            maxWidth    : cMaxWidth,  
                            id          : 'layoutAbout',
                            rows        : [
                                { 
                                    view        : "template", 
                                    template    : "<img src='"+cDynamicData.detail.icon_file_name+"' alt='logo'>", 
                                    height      : 150, 
                                    css         : 'aboutHead' 
                                },
                                c
                            ]
                        }
                    ]     
                }
            }); 
                       
            //Fill the About gui
            fillAbout();       
        };
        
        var fillAbout = function(){
        
            var name    = cDynamicData.detail.name;
            var cell    = cDynamicData.detail.cell;
            var phone   = cDynamicData.detail.phone;
            var fax     = cDynamicData.detail.fax;
            var email   = cDynamicData.detail.email;
            var url     = cDynamicData.detail.url;
            
            var street_no = cDynamicData.detail.street_no;
            var street    = cDynamicData.detail.street;
            var city      = cDynamicData.detail.city;
            var country   = cDynamicData.detail.country;
            
            var lat       = cDynamicData.detail.lat;
            var lon       = cDynamicData.detail.lon;
            
            $$('propertyAbout').setValues({
                abt_name : name,  
                abt_cell : cell,
                abt_phone: phone,
                abt_fax  : fax,
                abt_email: "<a href='mailto:"+email+"'>"+email+"</a>",
                abt_url  : "<a href='"+url+"'>"+url+"</a>",
                abt_street: street_no+" "+street,
                abt_city : city,
                abt_country : country,
                abt_lat_lon : lat + ' ' + lon
            });
            
            //Set the title
            document.title = name;
        
        }
        
        var guiCi = function(){
                    
            var elements = [];
            var req_css  = {"background":"#ccc !important"};
            var req      = true;
            var rules    = {};
            
            elements.push({
              view      : "template",
              height     : 30,
              template  : "Please supply to get <b>Guest Access</b>"
            });
            
            if(cDynamicData.settings.click_to_connect.ci_first_name){
                var first_name_css = {};
                var first_name_req = false;
                if(cDynamicData.settings.click_to_connect.ci_first_name_required){
                    first_name_css = req_css;
                    first_name_req = req;
                } 
                elements.push({ view:"text", label:'First Name', name:"first_name",css:first_name_css,required:first_name_req});
            }
            if(cDynamicData.settings.click_to_connect.ci_last_name){
                var last_name_css = {};
                var last_name_req = false;
                if(cDynamicData.settings.click_to_connect.ci_last_name_required){
                    last_name_css = req_css;
                    last_name_req = req;
                } 
                elements.push({ view:"text", label:'Last Name', name:"last_name",css:first_name_css,required:last_name_req});
            }
            
            if(cDynamicData.settings.click_to_connect.ci_email){
                var email_css = {};
                var email_req = false;
                if(cDynamicData.settings.click_to_connect.ci_email_required){
                    email_css = req_css;
                    email_req = req;
                    rules.email = webix.rules.isEmail;
                } 
                elements.push({ view:"text", label:'Email', name:"email",css:email_css,required:email_req});
                if(cDynamicData.settings.click_to_connect.ci_email_opt_in == true){
                    elements.push({ view:'checkbox', label: cDynamicData.settings.click_to_connect.ci_email_opt_in_txt, name:'email_opt_in'});
                }
            }
            
            if(cDynamicData.settings.click_to_connect.ci_gender){
                elements.push({
                    view:"radio", 
                    label:"Gender",
                    name: 'gender',
                    value:'male', options:[
                        {"id":'male',   "value":"Male"  },
                        {"id":'female', "value":"Female"}
                    ]
                });
            }
            
            if(cDynamicData.settings.click_to_connect.ci_birthday){
                var birthday_css = {};
                var birthday_req = false;
                if(cDynamicData.settings.click_to_connect.ci_email_required){
                    birthday_css = req_css;
                    birthday_req = req;
                } 
            
                elements.push({
                    view:"datepicker", 
                   // value: new Date(2012, 6, 8),
                    name: 'birthday',
                    label: "Birthday", 
                    timepicker: false,
                    css:birthday_css,
                    required:birthday_req
                });
            }
            
            if(cDynamicData.settings.click_to_connect.ci_company){
                var company_css = {};
                var company_req = false;
                if(cDynamicData.settings.click_to_connect.ci_company_required){
                    company_css = req_css;
                    company_req = req;
                } 
                elements.push({ view:"text", label:'Company', name:"company",css:company_css,required:company_req});
            } 
            
            if(cDynamicData.settings.click_to_connect.ci_address){
                var address_css = {};
                var address_req = false;
                if(cDynamicData.settings.click_to_connect.ci_address_required){
                    address_css = req_css;
                    address_req = req;
                } 
                elements.push({ 
                   view:"textarea", 
                   label:"Address",
                   name: 'address', 
                   height:100,
                   css:address_css,
                   required:address_req 
                });
            }
            
            if(cDynamicData.settings.click_to_connect.ci_city){
                var city_css = {};
                var city_req = false;
                if(cDynamicData.settings.click_to_connect.ci_city_required){
                    city_css = req_css;
                    city_req = req;
                } 
                elements.push({ view:"text", label:'City', name:"company",css:city_css,required:city_req});
            }
            
            if(cDynamicData.settings.click_to_connect.ci_country){
                var country_css = {};
                var country_req = false;
                if(cDynamicData.settings.click_to_connect.ci_country_required){
                    country_css = req_css;
                    country_req = req;
                } 
                elements.push({ view:"text", label:'Country', name:"country",css:country_css,required:country_req});
            }
            
            if(cDynamicData.settings.click_to_connect.ci_phone){
                var phone_css = {};
                var phone_req = false;
                if(cDynamicData.settings.click_to_connect.ci_phone_required){
                    phone_css = req_css;
                    phone_req = req;
                    rules.phone = webix.rules.intNumber;
                } 
                elements.push({ view:"text", label:'Phone', name:"phone",css:phone_css,required:phone_req});
                if(cDynamicData.settings.click_to_connect.ci_phone_opt_in == true){
                    elements.push({ view:'checkbox', label: cDynamicData.settings.click_to_connect.ci_phone_opt_in_txt, name:'phone_opt_in'});
                }
            }
            
            if(cDynamicData.settings.click_to_connect.ci_room){
                var room_css = {};
                var room_req = false;
                if(cDynamicData.settings.click_to_connect.ci_room_required){
                    room_css = req_css;
                    room_req = req;
                } 
                elements.push({ view:"text", label:'Room', name:"room",css:room_css,required:room_req});
            } 
            
            if(cDynamicData.settings.click_to_connect.ci_custom1){
                var custom1_css = {};
                var custom1_req = false;
                if(cDynamicData.settings.click_to_connect.ci_custom1_required){
                    custom1_css = req_css;
                    custom1_req = req;
                } 
                elements.push({ view:"text", label:cDynamicData.settings.click_to_connect.ci_custom1_txt, name:"custom1",css:custom1_css,required:custom1_req});
            }
            
            if(cDynamicData.settings.click_to_connect.ci_custom2){
                var custom2_css = {};
                var custom2_req = false;
                if(cDynamicData.settings.click_to_connect.ci_custom2_required){
                    custom2_css = req_css;
                    custom2_req = req;
                } 
                elements.push({ view:"text", label:cDynamicData.settings.click_to_connect.ci_custom2_txt, name:"custom2",css:custom2_css,required:custom2_req});
            }
            
            if(cDynamicData.settings.click_to_connect.ci_custom3){
                var custom3_css = {};
                var custom2_req = false;
                if(cDynamicData.settings.click_to_connect.ci_custom3_required){
                    custom3_css = req_css;
                    custom3_req = req;
                } 
                elements.push({ view:"text", label:cDynamicData.settings.click_to_connect.ci_custom3_txt, name:"custom3",css:custom3_css,required:custom3_req});
            } 
            
            elements.push({ view:"button", value: "Submit",id : 'btnClientInfo',});         
              
                   
             webix.ui({
                view    : "window",
                autofit :true,
                resize  : true,  
                move    : true,
                id      : "winClientInfo",
                position:"top",
                head    : {
					view:"toolbar", cols:[
					    { view: "label", label: 'Customer Info', align: 'center'},
						{ view: "icon", icon: "wxi-close", hotkey: "escape", click:"$$('winClientInfo').hide();"}
						]
				},
				body : {
				    minWidth    : cMinWidth,
                    maxWidth    : cMaxWidth,
                    id          : 'layoutClientInfo',
                    borderless  : true,
                    type        : 'space', 
                    view        : "form",
                    elementsConfig:{
				        labelPosition:"top"
			        },
			        rules       : rules,
                    scroll      : true,
                    rows        : elements
                }
            });
        }
         
        
       var showNotHotspot = function(){ 
            $$('layoutConnect').showBatch('scrnNotHotspot');
        };
           
        var showStatus = function(){
            $$('layoutConnect').showBatch('scrnStatus');
        };
        
        var showConnect = function(){
            $$('layoutConnect').showBatch('scrnConnect');
        };
           
              
        //Expose those public items...
        return {         
            init            : init,
            showStatus      : showStatus,
            showNotHotspot  : showNotHotspot,
            showConnect     : showConnect,
            resize          : resize
        }   
    }
})();
