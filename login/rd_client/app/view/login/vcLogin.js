Ext.define('AmpConf.view.login.vcLogin', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcLogin',
    init    : function() {
        this.callParent(arguments);
    },
    listen  : {
         component: {
             'cntLogin textfield': {
                 change: 'testForm'
             }
         }
    },
        
    testForm: function(field,newValue, oldValue, eOpts){
        var me      = this;
        var form    = me.lookup('form');
        var button  = me.lookup('button');
        
        if(form.isValid()){
            button.setDisabled(false);    
        }else{
            button.setDisabled(true); 
        }
    },

    onLoginTap: function() {
        var me      = this;
        var form    = me.lookup('form');
        var values  = form.getValues();    
        form.clearErrors();
        
        if(
            (Ext.isEmpty(values.username))&&
            (Ext.isEmpty(values.voucher))){
            
             Ext.Msg.alert('Error', "Specify a value");
             return; 
        }
        var type = 'user';
        
        if(!Ext.isEmpty(values.voucher)){
            values.username = values.voucher;
            type = 'voucher';
        }
        
        Ext.Viewport.setMasked({ xtype: 'loadmask' });
        
        AmpConf.model.Session.login(values.username,type)
            .then(function(session) {
                me.fireEvent('login', session.data);
            })
            .catch(function(obj) {
                if(obj.errors){
                    form.setErrors(obj.errors);
                }
                Ext.Viewport.setMasked(false);
                Ext.Msg.alert('Error', obj.message);
            })
            .then(function(session) {
                Ext.Viewport.setMasked(false);
            });       
    },
    onInfoTap: function() {
        var me      = this;
        me.fireEvent('scrnInfo');   
    }
});
