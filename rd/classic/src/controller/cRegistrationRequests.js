Ext.define('Rd.controller.cRegistrationRequests', {
    extend: 'Ext.app.Controller',
    actionIndex: function(pnl){

        var me = this;
        
        if (me.populated) {
            return; 
        }     
        pnl.add({
            xtype   : 'gridRegistrationRequests',
            border  : true,
            itemId  : 'tabRegistrationRequests',
            plain   : true
        });
        me.populated = true;
    },

    views:  [
        'registrationRequests.gridRegistrationRequests',           
        'registrationRequests.winRegistrationRequestEdit', 		'registrationRequests.winRegistrationRequestAddWizard'
    ],
    stores: ['sRegistrationRequests'],
    models: ['mRegistrationRequest'],
    selectedRecord: null,
    config: {
        urlAdd          : '/cake3/rd_cake/registration-requests/add.json',
        urlEdit         : '/cake3/rd_cake/registration-requests/edit.json',
        urlDelete       : '/cake3/rd_cake/registration-requests/delete.json',
		urlGiveCode     : '/cake3/rd_cake/registration-requests/give-code.json',
		urlSendCode     : '/cake3/rd_cake/registration-requests/send-code.json'
    },
    refs: [
        {  ref: 'grid',  selector: 'gridRegistrationRequests'}       
    ],
    init: function() {
        var me = this;
        if (me.inited) {
            return;
        }
        me.inited = true;
        me.control({
            '#tabRegistrationRequests' : {
                destroy   :      me.appClose   
            },
            'gridRegistrationRequests'   		: {
                select:      me.select
            },
            'winRegistrationRequestAddWizard #btnDataNext' : {
                click:  me.btnDataNext
            },
			'winRegistrationRequestEdit #save': {
                click: me.btnEditSave
            }
        });
    },
    appClose:   function(){
        var me          = this;
        me.populated    = false;
    },
    btnDataNext:  function(button){
        var me      = this;
        var win     = button.up('window');
        var form    = win.down('form');
        form.submit({
            clientValidation: true,
            url: me.getUrlAdd(),
            success: function(form, action) {
                win.close();
                me.getStore('sRegistrationRequests').load();
                Ext.ux.Toaster.msg(
                    i18n('sNew_item_created'),
                    i18n('sItem_created_fine'),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
            },
            failure: Ext.ux.formFail
        });
    },
    select: function(grid,record){
        var me = this;
        //Adjust the Edit and Delete buttons accordingly...

        //Dynamically update the top toolbar
        tb = me.getGrid().down('toolbar[dock=top]');

        var state = record.get('state');
        if(state == 'not_allocated'){
            if(tb.down('#code') != null){
                tb.down('#code').setDisabled(false);
            }
        }else{
            if(tb.down('#code') != null){
                tb.down('#code').setDisabled(true);
            }
        }

        if((state == 'allocated')||(state == 'email_sent')||(state == 'verified')){
            if(tb.down('#email') != null){
                tb.down('#email').setDisabled(false);
            }
        }else{
            if(tb.down('#email') != null){
                tb.down('#email').setDisabled(true);
            }
        }
    },
	btnEditSave:  function(button){
        var me      = this;
        var win     = button.up("winRegistrationRequestEdit");
        var form    = win.down('form');
        form.submit({
            clientValidation: true,
            url: me.getUrlEdit(),
            success: function(form, action) {
                win.close();
                me.getStore('sRegistrationRequests').load();
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
    onStoreRegistrationRequestsLoaded: function() {
        var me      = this;
        var count   = me.getStore('sRegistrationRequests').getTotalCount();
        me.getGrid().down('#count').update({count: count});
    }
});
