Ext.define('Rd.view.homeServerPools.vcHomeServer', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcHomeServer',
    config : {
        urlAdvancedSettingsForModel : '/cake3/rd_cake/ap-profiles/advanced_settings_for_model.json',
        urlViewAp                   : '/cake3/rd_cake/ap-profiles/ap_profile_ap_view.json'
    },
    init: function() {
        var me = this;
    }
    
});
