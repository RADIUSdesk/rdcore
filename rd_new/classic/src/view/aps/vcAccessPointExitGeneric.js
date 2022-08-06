Ext.define('Rd.view.aps.vcAccessPointExitGeneric', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcAccessPointExitGeneric',
    config : {
        urlAdvancedSettingsForModel : '/cake4/rd_cake/ap-profiles/advanced_settings_for_model.json',
        urlViewAp                   : '/cake4/rd_cake/ap-profiles/ap_profile_ap_view.json'
    },
    init: function() {
        var me = this;
    },
    control: {
        'window': {
            // beforeshow : 'loadExit'
        }
    },
    stores      : [	
		'sClouds'
    ],    
    loadExit: function(window){
    
        var me = this;
        console.log("Before Window Show");   
    
    }
});
