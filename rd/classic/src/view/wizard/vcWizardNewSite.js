Ext.define('Rd.view.wizard.vcWizardNewSite', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcWizardNewSite',
    config : {
        urlOneSubmit                : '/cake3/rd_cake/wizards/new-site-step-one.json',
        urlTwoSubmit                : '/cake3/rd_cake/wizards/new-site-step-two.json',
        urlViewDynamicDetail        : '/cake3/rd_cake/wizards/view-logo.json',
        urlLogoBase                 : '/cake3/rd_cake/img/dynamic_details/',
        urlUploadLogo               : '/cake3/rd_cake/wizards/upload-logo/',
        UrlPnlTwo                   : '/cake3/rd_cake/wizards/view-country-and-timezone.json',
        UrlChangeTheme              : '/cake3/rd_cake/wizards/change-theme.json',
        UrlPreviewMobile            : '/cake3/rd_cake/dynamic-details/preview-chilli-mobile',
        UrlPreviewDesktop           : '/cake3/rd_cake/dynamic-details/preview-chilli-desktop',
        infoOne :'\
            <h2>What does the Setup Wizard do?</h2>\
            <p>\
            <b>Step 1</b> contains the basic information needed to create an account.\
            When the wizard is complete you can simply add Access Points to your networks and you are good to go!\
            </p>\
            <p>\
            <font color="green"><big><b>Signing up a new business or property should take no longer than 5 minutes!</b></big>!</font>\
            </p>\
            <p>\
            <b>The wizard creates the following items automatically so you don’t have to.</b><br>\
            The default values work out of the box but if you require something different you can always edit these items later.<br><br>\
            Let’s assume you sign up a hotel called <big><b>Royal Hotel</b></big>. Then the following items will be created.\
            </p>\
            <p>\
            <big>Operator</big><br>\
              Called <b>royal_hotel</b> with password as <b>designated</b>\
            </p>\
            <p>\
            <big>Realm</big><br>\
              Called <b>Royal Hotel</b>\
            </p>\
            <p>\
            <big>Dynamic RADIUS Client</big><br>\
              Called <b>Royal Hotel</b>\
            </p>\
            <p>\
            <big>Dynamic Login Page</big><br>\
              Called <b>Royal Hotel</b>\
            </p>\
            <p>\
            <big>Access Point Profile</big><br>\
              Called <b>Royal Hotel</b> (APdesk).<br>\
                <small>Open SSID callled <b>Royal Hotel Guest</b> that has a login page (Captive Portal).</small><br>\
                <small>Secure SSID called <b>Royal Hotel Wireless</b> that is bridged to the LAN.</small><br>\
            </p>\
            <p>\
            <big>Mesh Network</big><br>\
             Called <b>Royal Hotel</b> (MESHdesk).<br>\
                <small>Open SSID callled <b>Royal Hotel Guest</b> that has a login page (Captive Portal).</small><br>\
                <small>Secure SSID called <b>Royal Hotel Wireless</b> that is bridged to the LAN.</small><br>\
            </p>\
            <p>\
            <big>Permanent User</big><br>\
              Called <b>royal_hotel</b> with password as <b>designated</b>\
            </p>\
            <p>\
            <big>Permanent User</big><br>\
              Called <b>click_to_connect@royal_hotel</b> with password as <b>click_to_connect</b>\
            </p>\
        ',
        infoTwo : '\
            <h2>Location and Customer Options</h2>\
            <big><font color="green"><b>Here specify the location and decide how the customers access your Hotspot.</big></b></font><br>\
            Select one or more\
            <p>\
            <big><b>Vouchers</big></b><br>\
            Select this option if your require your customers to use an easy to remember voucher.\
            This option is for situations where customers are not likely to be regulars.\
            </p>\
            <p>\
            <big><b>Permanent Users</big></b><br>\
            Permanent users will use a username and password combination. Emails can be used as a username.\
            Permanent users are normally allowed where a customer will regularly use your hotspot.\
            Permanent user can self register if this option is configured on the login page.\
            </p>\
            <p>\
            <big><b>Click-To-Connect</big></b><br>\
            Allows customers to connect by just accepting terms and conditions.\
            </p>\
        ',
        infoThree : '\
            <h2>Branding</h2>\
            <p>\
            Here you can upload a Logo to brand your account.<br>\
            A .png or .jpg file with a height of 100px is recommended.<br>\
            The width can vary from 100px to 200px.\
            </p>\
        ',
        infoFour : '\
            <h2>Login Page Customisation</h2>\
            <p>\
            Here you can upload images that will appear on your login page.\
            We recommend .png or .jpeg format with file sizes of 400Kb or less each.\
            </p>\
            <p>\
            The first image will be the background image on your login page.\
            </p>\
            <p>\
            The first image and subsequent images will also appear in the gallery application which is built into the login page.\
            </p>\
            <p>\
            <big><b><font color="green">When you press Finish the wizard will be complete.\
            We recommend you follow the simple setup checklist available here to complete your account setup.</font></b></big>\
            </p>\
        ',
        infoFive: '\
            <h2>Select a Theme</h2>\
            <p>\
            Here you can upload images that will appear on your login page.\
            We recommend .png or .jpeg format with file sizes of 400Kb or less each.\
            </p>\
            <p>\
            The first image will be the background image on your login page.\
            </p>\
            <p>\
            The first image and subsequent images will also appear in the gallery application which is built into the login page.\
            </p>\
            <p>\
            <big><b><font color="green">When you press Finish the wizard will be complete.\
            We recommend you follow the simple setup checklist available here to complete your account setup.</font></b></big>\
            </p>\
        ',
        //These are placeholders that will be filled as the person goes through the wizard.
        //If they click the cancel button or close the window, we need to undo what has been done
        realmId: undefined,
        dynamicDetailId: undefined
    },
    init: function() {
        var me = this;
    },
    onTxtNameChange : function(t){
        var me  = this;
        var f   = t.up('form');
        var g   = f.down('#ssid_guest');
        var w   = f.down('#ssid_wireless');
        var v   = t.getValue().trim();
        if(v == ''){
            g.setValue("Guest");
            w.setValue("Wireless");
        }else{
            g.setValue(v+" Guest");
            w.setValue(v+" Wireless");
        }
    },
    onTxtNameBlur : function(component){   //We added this to prevent spaces leading and trailing spaces to kreep in and cause havoc
        component.setValue(component.getValue().trim());
    },
    onPnlInfoAfterrender: function(p){
        var me  = this;
        p.setHtml(me.getInfoOne());
    },
    onBtnOneNextClick: function(b){
        var me  = this;
        var cnt = b.up('#pnlCardNewSite');
        var w   = b.up('window');
        var i   = w.down('#pnlInfo');
        var f   = b.up('form');
        i.setHtml(me.getInfoTwo());
       // cnt.setActiveItem(cnt.getLayout().getNext()); //Zero based
        //console.log("One Next Clicked"); 
        f.setLoading(true);
        f.submit({
            clientValidation    : true,
            url                 : me.getUrlOneSubmit(),
            success: function(form, action) {
                f.setLoading(false);
                w.step_one_done = true;
                
                Ext.ux.Toaster.msg(
                    i18n('sNew_item_created'),
                    i18n('sItem_created_fine'),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
                cnt.setActiveItem(cnt.getLayout().getNext()); //Zero based
            },
            failure: function(form,action){ 
                f.setLoading(false);
                Ext.ux.formFail(form,action)
            }     
        });  
    },
    onBtnCancelClick: function(b){
        var me  = this;
        var w   = b.up('window');
        w.close();
    },
    onBtnTwoNextClick: function(b){
    
        var me  = this;
        var cnt = b.up('#pnlCardNewSite');
        var w   = b.up('window');
        var i   = w.down('#pnlInfo');
        var f   = b.up('form');
        
        var n   = w.down('#txtName');
        var name= n.getValue();
        
        var p   = w.down('#txtPassword');
        var pwd = p.getValue();
        
        i.setHtml(me.getInfoThree());
       // cnt.setActiveItem(cnt.getLayout().getNext()); //Zero based
        //console.log("Two Next Clicked"); 
        f.setLoading(true);
        f.submit({
            clientValidation    : true,
            url                 : me.getUrlTwoSubmit(),
            params              : {name:name,password:pwd},
            success: function(form, action) {
                f.setLoading(false);                
                Ext.ux.Toaster.msg(
                    'User type adjustments made',
                    'User type adjustments completed',
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
                cnt.setActiveItem(cnt.getLayout().getNext()); //Zero based
            },
            failure: function(){ 
                f.setLoading(false);
                Ext.ux.formFail
            } 
        });
    },
    pnlTwoActivate: function(pnl){
        var me      = this;
        pnl.load({url: me.getUrlPnlTwo(),method:'GET'}); 
    },
    onBtnThreeNextClick: function(b){
        var me  = this;
        var cnt = b.up('#pnlCardNewSite');
        var w   = b.up('window');
        var i   = w.down('#pnlInfo');
        var f   = b.up('form');
        
        i.setHtml(me.getInfoFour());    
        cnt.setActiveItem(cnt.getLayout().getNext()); //Zero based
        //console.log("Three Next Clicked");
    }, 
    pnlThreeActivate: function(pnl){
        var me  = this;  
        var w   = pnl.up('window');
        var n   = w.down('#txtName');
        var name= n.getValue();

        var p_img   = pnl.down('#pnlImg');
        Ext.Ajax.request({
            url     : me.getUrlViewDynamicDetail(),
            method  : 'GET',
            params  : {name:name},
            success : function(response){
                var jsonData    = Ext.JSON.decode(response.responseText);
                if(jsonData.success){
                    var img_url = me.getUrlLogoBase()+jsonData.data.icon_file_name;
                    p_img.update({image:img_url});
                }   
            },
            scope: me
        });
    },
    onBtnLogoSaveClick: function(button){
        var me      = this;
        var form    = button.up('form');
        var pnl_r   = form.up('pnlDynamicDetail');
        var p_form  = form.up('panel');
        var p_img   = p_form.down('#pnlImg');
        
        var w       = button.up('window');
        var n       = w.down('#txtName');
        var name    = n.getValue();
        
        form.submit({
            clientValidation    : true,
            waitMsg             : 'Uploading your photo...',
            url                 : me.getUrlUploadLogo(),
            params              : {name:name},
            success: function(form, action) {              
                if(action.result.success){ 
                    var new_img = action.result.icon_file_name;    
                    var img_url = me.getUrlLogoBase()+new_img;
                    p_img.update({image:img_url});
                } 
                Ext.ux.Toaster.msg(
                    i18n('sItem_updated'),
                    i18n('sItem_updated_fine'),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
            },
            failure: Ext.ux.formFail
        });
    },
    pnlFourActivate:  function(pnl){
        var me = this;
        var w   = pnl.up('window');
        var n   = w.down('#txtName');
        var name= n.getValue();
        //Get the name and set that as an extra param value to the proxy
        pnl.up('window').down('#dvPhotos').getStore().getProxy().setExtraParam('name',name);
        pnl.up('window').down('#dvPhotos').getStore().load();
    },
    onBtnPhotoReloadClick:  function(b){
        var me = this;
        var w   = b.up('window');
        var n   = w.down('#txtName');
        var name= n.getValue();
        //Get the name and set that as an extra param value to the proxy
        b.up('window').down('#dvPhotos').getStore().getProxy().setExtraParam('name',name);
        b.up('window').down('#dvPhotos').getStore().load();
    },
    onBtnPhotoAddClick: function(b){ 
        var me  = this;
        var w   = b.up('window');
        var n   = w.down('#txtName');
        var name= n.getValue();
        var d_v = b.up('window').down('#dvPhotos');
        
        if(!Ext.WindowManager.get('winWizardPhotoAddId')){
            var w   = Ext.widget('winWizardPhotoAdd',
            {
                id          : 'winWizardPhotoAddId',
                 new_name   : name,
                data_view   : d_v  
            });
            w.show();      
        }
    },
    
    onBtnPhotoDeleteClick: function(b){
        console.log("Delete Click");
    },
    onBtnFourNextClick: function(b){
        var me  = this;
        var cnt = b.up('#pnlCardNewSite');
        var w   = b.up('window');
        var i   = w.down('#pnlInfo');
        var f   = b.up('form');
        
        i.setHtml(me.getInfoFive());    
        cnt.setActiveItem(cnt.getLayout().getNext()); //Zero based
        //console.log("Four Next Clicked");
    },
    onCmbThemesChange: function(cmb){
        var me = this;
        var new_value = cmb.getValue();
        //console.log("The Theme changed to "+new_value);    
        var w   = cmb.up('window');
        var n   = w.down('#txtName');
        var name= n.getValue(); 
        Ext.Ajax.request({
            url     : me.getUrlChangeTheme(),
            method  : 'POST',
            params  : {name:name,theme:new_value},
            success : function(response){
                var jsonData    = Ext.JSON.decode(response.responseText);
                if(jsonData.success){
                    Ext.ux.Toaster.msg(
                        "Theme changed",
                        "Theme changed fine - Try the Preview",
                        Ext.ux.Constants.clsInfo,
                        Ext.ux.Constants.msgInfo
                    );
                }   
            },
            scope: me
        });
    },
    previewMobile: function(b){
        var me  = this;
        var w   = b.up('window');
        var n   = w.down('#txtName');
        var name= n.getValue(); 
        window.open(me.getUrlPreviewMobile()+"?wizard_name="+name)
    },
    previewDesktop: function(b){
        var me  = this;
        var w   = b.up('window');
        var n   = w.down('#txtName');
        var name= n.getValue();
        window.open(me.getUrlPreviewDesktop()+"?wizard_name="+name)
    },
    onBtnFiveNextClick: function(b){
        var cnt         = b.up('#pnlCardNewSite');
        var w           = b.up('window');     
        w.step_one_done = false;
        w.close();
    }
    
});
