Ext.define('Rd.view.multiWanProfiles.vcMultiWanProfileInterface', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcMultiWanProfileInterface',
    init    : function() {
    
    },
    config: {
        urlSave          : '/cake4/rd_cake/multi-wan-profiles/interface-add-edit.json'
    },
    control: {
        '#btnEthernet': {
        	click	: 'onBtnEthernetClick'
        },
        //Type
        '#btnEthernet': {
        	click	: 'onBtnEthernetClick'
        },
        '#btnLte': {
        	click	: 'onBtnLteClick'
        },
        '#btnWifi': {
        	click	: 'onBtnWifiClick'
        },
        //Protocol
        '#btnIpv4' : {
            click	: 'onBtnIpv4Click'
        },
        '#btnIpv6' : {
            click	: 'onBtnIpv6Click'
        },
        //Methods
        '#btnDhcp': {
        	click	: 'onBtnDhcpClick'
        },
        '#btnStatic': {
        	click	: 'onBtnStaticClick'
        },
        '#btnPppoe': {
        	click	: 'onBtnPppoeClick'
        },
        '#save': {
            click   : 'btnSave'
        }        
    },
    //Type
    onBtnEthernetClick: function(btn){
    	var me = this;
    	me.getView().down('#txtType').setValue('ethernet');
    	me.getView().down('#pnlQmi').hide();
    	me.getView().down('#pnlQmi').disable();
    	me.getView().down('#pnlWifi').hide();
    	me.getView().down('#pnlWifi').disable();
    	
    	me.getView().down('#nrVlan').enable();
    	me.getView().down('#nrVlan').show();
    	me.getView().down('#txtHardwarePort').enable();
    	me.getView().down('#txtHardwarePort').show();
    	me.getView().down('#rgrpMethod').show();
    	me.getView().down('#rgrpMethod').enable(); 
    	
    },
    onBtnLteClick: function(btn){
    	var me = this;
    	me.getView().down('#txtType').setValue('lte');
    	me.getView().down('#pnlQmi').show();
    	me.getView().down('#pnlQmi').enable();
    	me.getView().down('#pnlWifi').hide();
    	me.getView().down('#pnlWifi').disable();
    	
    	me.getView().down('#nrVlan').disable();
    	me.getView().down('#nrVlan').hide();
    	me.getView().down('#txtHardwarePort').disable();
    	me.getView().down('#txtHardwarePort').hide();
    	me.getView().down('#rgrpMethod').disable();
    	me.getView().down('#rgrpMethod').hide();

    },
    onBtnWifiClick: function(btn){
    	var me = this;
    	me.getView().down('#txtType').setValue('wifi');
    	me.getView().down('#pnlWifi').show();
    	me.getView().down('#pnlWifi').enable();
    	me.getView().down('#pnlQmi').hide();
    	me.getView().down('#pnlQmi').disable();
    	
    	me.getView().down('#nrVlan').disable();
    	me.getView().down('#nrVlan').hide();
    	me.getView().down('#txtHardwarePort').disable();
    	me.getView().down('#txtHardwarePort').hide(); 
    	me.getView().down('#rgrpMethod').show();
    	me.getView().down('#rgrpMethod').enable();  	
    },
    //Protocol
    onBtnIpv4Click: function(btn){
    	var me = this;
    	me.getView().down('#txtProtocol').setValue('ipv4');
    },
    onBtnIpv6Click: function(btn){
    	var me = this;
    	me.getView().down('#txtProtocol').setValue('ipv6');
    },
    //Methods
    onBtnDhcpClick: function(btn){
    	var me = this;
    	me.getView().down('#pnlStatic').hide();
    	me.getView().down('#pnlStatic').disable();
    	me.getView().down('#pnlPppoe').disable();
    	me.getView().down('#pnlPppoe').hide();
    	me.getView().down('#txtMethod').setValue('dhcp');
    },
    onBtnStaticClick: function(btn){
    	var me = this;
    	me.getView().down('#pnlStatic').show();
    	me.getView().down('#pnlStatic').enable();
    	me.getView().down('#pnlPppoe').disable();
    	me.getView().down('#pnlPppoe').hide();
    	me.getView().down('#txtMethod').setValue('static');
    },
    onBtnPppoeClick: function(btn){
    	var me = this;
    	me.getView().down('#pnlPppoe').show();
    	me.getView().down('#pnlPppoe').enable();
    	me.getView().down('#pnlStatic').hide();
    	me.getView().down('#pnlStatic').disable();
    	me.getView().down('#txtMethod').setValue('pppoe');
    },
    btnSave:function(button){
        var me          = this;
        var formPanel   = this.getView();
        //Checks passed fine...      
        formPanel.submit({
            clientValidation    : true,
            url                 : me.getUrlSave(),
            success             : function(form, action) {
                me.getView().store.reload();
                if (formPanel.closable) {
                    formPanel.close();
                }
                Ext.ux.Toaster.msg(
                    i18n('sItems_modified'),
                    i18n('sItems_modified_fine'),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
            },
            failure             : Ext.ux.formFail
        });
    },  
});
