Ext.define('Rd.controller.cProfileSimple', {
    extend: 'Ext.app.Controller',
    views:  [
        'profiles.pnlAddEditProfile' 
    ],
    config      : {  
        urlAddProfile      : '/cake3/rd_cake/profiles/simple_add.json',
        urlViewProfile     : '/cake3/rd_cake/profiles/simple_view.json',
        urlEditProfile     : '/cake3/rd_cake/profiles/simple_edit.json'
    },
    refs: [
        {  ref: 'tabProfiles',  selector: '#tabProfiles' } 
    ],
    init: function() {
        var me = this;
        
        if (me.inited) {
            return;
        }
        me.inited = true;
            
        me.control({
            'pnlAddEditProfile #addsave' : {
                click:  me.btnAddProfileSave
            },
            'pnlAddEditProfile #editsave': {
                click: me.btnEditProfileSave
            } 
        });
    },
    actionIndex: function(profile_id,params){
		var me      	= this;
        var id			= 'tabAddEditProfile'+ profile_id;
        var tp          = params.tp;
		var name 		= params.name;
		var store		= params.store;	
        var newTab      = tp.items.findBy(
        function (tab){
            return tab.getItemId() === id;
        });
         
        if (!newTab){
            newTab = tp.add({
                glyph   		: Rd.config.icnEdit, 
                title   		: name,
                closable		: true,
                layout  		: 'auto',
                xtype   		: 'pnlAddEditProfile',
                itemId  		: id,
                profileId       : profile_id,
				store			: store,
				user_id         : params.user_id,
				username        : params.username,
				hide_owner      : params.hide_owner
            });
        }    
        tp.setActiveTab(newTab);    
    },
   btnEditProfileSave:  function(button){
        var me      = this;
        var form    = button.up("form");
        var pnl     = button.up('pnlAddEditProfile');
              
        form.submit({
            clientValidation: true,
            url: me.getUrlEditProfile(),
            success: function(form, action) {
                pnl.close();
                Ext.ux.Toaster.msg(
                        i18n("sItem_updated_fine"),
                        i18n("sItem_updated_fine"),
                        Ext.ux.Constants.clsInfo,
                        Ext.ux.Constants.msgInfo
                );
                
            },
            scope       : me,
            failure     : Ext.ux.formFail
        });
        
    },
    btnAddProfileSave: function(button){
    
        var me      = this;
        var form    = button.up("form");
        var pnl     = button.up('pnlAddEditProfile');
        var multi   = pnl.down('#chkMultiple');
        
        //Get the value of the user_id 
        var user_id = form.down('#hiddenUser').getValue();
        if(user_id == -1){
            Ext.ux.Toaster.msg(
                        i18n('sSelect_an_owner'),
                        i18n('sFirst_select_an_Access_Provider_who_will_be_the_owner'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
            return;
        }
              
        form.submit({
            clientValidation: true,
            url: me.getUrlAddProfile(),
            success: function(form, action) {
                if(multi.getValue() == false){ //Only if the person did not choose to add multiple
                    pnl.close();
                }
                Ext.ux.Toaster.msg(
                        i18n("sItem_added_fine"),
                        i18n("sItem_added_fine"),
                        Ext.ux.Constants.clsInfo,
                        Ext.ux.Constants.msgInfo
                );
            },
            scope       : me,
            failure     : Ext.ux.formFail
        });    
    }
});
