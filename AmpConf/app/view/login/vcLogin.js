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
        Ext.Viewport.setMasked({ xtype: 'loadmask' });

        AmpConf.model.Session.login(values.username, values.password)
            .then(function(session) {
                me.fireEvent('login', session.data);
            })
            .catch(function(obj) {
                form.setErrors(obj.errors);
                Ext.toast(obj.message, 2000);
                //Ext.Msg.alert('Error', obj.message, Ext.emptyFn);
            })
            .then(function(session) {
                Ext.Viewport.setMasked(false);
            });       
    },
    onInfoTap: function() {
        var me      = this;
        me.fireEvent('info');   
    }
});
