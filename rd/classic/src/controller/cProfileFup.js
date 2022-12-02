Ext.define('Rd.controller.cProfileFup', {
    extend: 'Ext.app.Controller',
    views:  [
        'profiles.pnlEditProfileFup' 
    ],
    config      : {  
        urlViewProfile     : '/cake4/rd_cake/profiles/fup_view.json',
        urlEditProfile     : '/cake4/rd_cake/profiles/fup_edit.json'
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
       /*     'pnlAddEditProfile #addsave' : {
                click:  me.btnAddProfileSave
            },
            'pnlAddEditProfile #editsave': {
                click: me.btnEditProfileSave
            } */
        });
    },
    actionIndex: function(profile_id,params){
		var me      	= this;
        var id			= 'tabEditProfileFup'+ profile_id;
        var tp          = params.tp;
		var name 		= params.name;
		var store		= params.store;	
        var newTab      = tp.items.findBy(
        function (tab){
            return tab.getItemId() === id;
        });
         
        if (!newTab){
            newTab = tp.add({
                glyph   		: Rd.config.icnHandshakeO, 
                title   		: "FUP Edit "+name,
                closable		: true,
                layout  		: 'auto',
                xtype   		: 'pnlEditProfileFup',
                itemId  		: id,
                profileId       : profile_id,
				store			: store
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
    }
});
