Ext.define('AmpConf.view.main.vcMain', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcMain',
    init    : function() {
        this.callParent(arguments);
    },
    listen  : {
         component: {
             'cntMain textfield': {
                 change: 'testForm'
             },
             
         }
    },  
    testForm: function(field,newValue, oldValue, eOpts){
        var me          = this;
        console.log("Test Form");
        var frmSubmit   = me.lookup('frmSubmit');
        var btnSubmit   = me.lookup('btnSubmit');
        
        console.log(frmSubmit.down('#wbw_ssid').isHidden());
        
        if(frmSubmit.isValid()){
            btnSubmit.setDisabled(false);    
        }else{
            btnSubmit.setDisabled(true); 
        }
    },

    onSubmitTap: function() {
        var me      = this;
        var frmSubmit   = me.lookup('frmSubmit');
        frmSubmit.submit({
             url: '/cake3/rd_cake/meshes/mesh-node-add.json',
             success: function () {
                // Ext.Msg.alert('Action Completed', 'Please Power Cycle Your Hardware.');
                 me.fireEvent('mainSubmitOk');
             },
             failure: function(response,a,b){
                frmSubmit.setErrors(a.errors);
                Ext.Msg.alert('Could No Attach', a.message);
            }
         });       
    },
    
    onLogoutTap: function() {
        var me      = this;
        me.fireEvent('logout');   
    },
    
    onCmbMeshChange: function(cmb){
        var me = this;
        var record  = cmb.getSelection();
        var txtName = me.lookup('txtName');
        n_count = 0;
        if(record != null){
            n_count =record.get('node_count');
        }
        n_count = n_count + 1;
        txtName.setValue('Node '+n_count)
    },   
    onCmbInternetConnectChange : function(cmb){
        var me = this;
        var int_con_val = cmb.getValue();
        var cntWbW = me.lookup('cntWbW');
        
        if(int_con_val == 'wifi'){
            cntWbW.setHidden(false);
            cntWbW.down('#wbw_ssid').setHidden(false);
            cntWbW.setDisabled(false);
            cntWbW.down('#wbw_ssid').setDisabled(false);
        }
        
        if(int_con_val == 'auto_detect'){
            cntWbW.setHidden(true);
            cntWbW.down('#wbw_ssid').setHidden(true);
            cntWbW.down('#wbw_passphrase').setHidden(true);
            cntWbW.setDisabled(true);
            cntWbW.down('#wbw_ssid').setDisabled(true);
            cntWbW.down('#wbw_passphrase').setDisabled(true);
            cntWbW.down('#wbw_encryption').setValue('none');                      
        }
        me.testForm();
    },
    onCmbEncryptionOptionsChange: function(cmb){
        var me      = this;
        var form    = cmb.up('formpanel');
        if(cmb.getValue() == 'none'){
            form.down('#wbw_passphrase').setHidden(true);
            form.down('#wbw_passphrase').setDisabled(true);  
        }else{
            form.down('#wbw_passphrase').setHidden(false);
            form.down('#wbw_passphrase').setDisabled(false);  
        }
    }
});
