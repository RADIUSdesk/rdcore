Ext.define('Rd.view.accel.vcAccelProfileAddEdit', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcAccelProfileAddEdit',
    init    : function() {
    
    },
    config: {
        urlAdd          : '/cake4/rd_cake/accel-profiles/add.json',
        urlEdit         : '/cake4/rd_cake/accel-profiles/edit.json',
        urlViewConfig   : '/cake4/rd_cake/accel-profiles/view-config.json',
    },
    control: {
        'pnlAccelProfileAddEdit #save' : {
            click   : 'addEditSave'
        },
        'pnlAccelProfileAddEdit cmbAccelBaseConfig' : {
            change   : 'cmbConfigChange'
        }
    },
    addEditSave :  function(button){
        var me      = this;
        var tab     = me.getView();
        var url     = me.getUrlAdd();
        if(tab.mode == 'edit'){
            url = me.getUrlEdit()
        }
        tab.submit({
            clientValidation: true,
            url: url,
            success: function(form, action) {
                tab.close();
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
    cmbConfigChange : function(){
        var me  = this;
        var cmb = me.getView().down('cmbAccelBaseConfig');        
        var val = cmb.getValue();
        console.log(val);
        me.getView().load({
            url         : me.getUrlViewConfig(), 
            method      : 'GET',
            params      : {
                base_config     : val,
                mode            : me.getView().mode,
                accel_profile_id: me.getView().accel_profile_id 
            },
            success     : function(a,b,c){
                console.log(b.result.data)                        
            }
        });  
    }
});
