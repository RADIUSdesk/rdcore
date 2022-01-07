Ext.define('Rd.controller.cAccessPointAp', {
    extend: 'Ext.app.Controller',
    views:  [
        'aps.pnlAccessPointAddEditAp' 
    ],
    config      : {  
        urlAddAp        : '/cake3/rd_cake/ap-profiles/ap_profile_ap_add.json',
        urlViewAp       : '/cake3/rd_cake/ap-profiles/ap_profile_ap_view.json',
        urlEditAp       : '/cake3/rd_cake/ap-profiles/ap_profile_ap_edit.json',
        urlAdvancedSettingsForModel : '/cake3/rd_cake/ap-profiles/advanced_settings_for_model.json',
        urlNoteAdd      : '/cake3/rd_cake/ap-profiles/note_add.json',
        urlApProfileAddApAction :  '/cake3/rd_cake/ap-actions/add.json',
        urlRestartAps   : '/cake3/rd_cake/ap-actions/restart_aps.json',
        urlRedirectAp   : '/cake3/rd_cake/aps/redirect_unknown.json'
    },
    refs: [
        {  ref: 'tabAccessPoints',  selector: '#tabAccessPoints' } 
    ],
    init: function() {
        var me = this;
        
        if (me.inited) {
            return;
        }
        me.inited = true;
            
        me.control({
            'pnlAccessPointAddEditAp #addsave' : {
                click:  me.btnAddApSave
            },
            'pnlAccessPointAddEditAp #editsave': {
                click: me.btnEditApSave
            } 
        });
    },
    actionIndex: function(ap_id,params){
		var me      	= this;
        var id			= 'tabAccessPointAddEdit'+ ap_id;
        var tabAps  	= me.getTabAccessPoints();
		var apProfileId = params.apProfileId;
		var apProfile 	= params.apProfile;
		var name 		= params.name;
		var store		= params.store;
		var mac         = params.mac;
		
        var newTab  = tabAps.items.findBy(
            function (tab){
                return tab.getItemId() === id;
            });
         
        if (!newTab){
            newTab = tabAps.add({
                glyph   		: Rd.config.icnEdit, 
                title   		: name,
                closable		: true,
                layout  		: 'auto',
                xtype   		: 'pnlAccessPointAddEditAp',
                itemId  		: id,
                apId            : ap_id,
                apProfileId     : apProfileId,
                apProfileName	: apProfile,
				store			: store,
				mac             : mac
            });
        }    
        tabAps.setActiveTab(newTab);    
    },
    btnEditApSave:  function(button){
        var me      = this;
        var form    = button.up("form");
        var pnl     = button.up('pnlAccessPointAddEditAp');
        form.submit({
            clientValidation: true,
            url: me.getUrlEditAp(),
            success: function(form, action) {
                pnl.close();
                pnl.store.load();
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
    btnAddApSave: function(button){
        var me      = this;
        var form    = button.up("form");
        var pnl     = button.up('pnlAccessPointAddEditAp');
        var multi   = pnl.down('#chkMultiple')
        form.submit({
            clientValidation: true,
            url: me.getUrlAddAp(),
            success: function(form, action) {
                if(multi.getValue() == false){ //Only if the person did not choose to add multiple
                    pnl.close();
                }
                pnl.store.load();
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
