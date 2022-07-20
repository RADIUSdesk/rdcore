Ext.define('Rd.view.components.rdPasswordfield', {
    extend      : 'Ext.form.FieldContainer',
    alias       : 'widget.rdPasswordfield', 
    layout      : {
        type        : 'hbox'
    },
    rdName   : 'password',
    rdLabel  : 'Password',
    rdLabelWidth : false,
    initComponent: function() {
        var me      = this;
        var tf = {
            xtype       : 'textfield',
            name        : me.rdName,
            msgTarget   : 'under',
            allowBlank  : false,
            fieldLabel  : me.rdLabel,
            inputType   : 'password',
            margin      :0,
            padding     :0,
            flex        :1,
            labelClsExtra: 'lblRdReq'
        };
        
        if(me.rdLabelWidth){
            tf = {
                xtype       : 'textfield',
                name        : me.rdName,
                msgTarget   : 'under',
                allowBlank  : false,
                fieldLabel  : me.rdLabel,
                inputType   : 'password',
                margin      :0,
                padding     :0,
                flex        :1,
                labelClsExtra: 'lblRdReq',
                labelWidth  : me.rdLabelWidth
            }
        }
        me.items    = [tf, 
        {
            xtype       : 'button',
            iconCls     : 'fa fa-eye',
            tooltip     : 'Show password',
            scale       : 'small',
            handler: function (button) {
                var isShowPassword = this.iconCls==='fa fa-eye';
                this.setTooltip(isShowPassword?'Hide password':'Show password');
                this.setIconCls(isShowPassword?'fa fa-eye-slash':'fa fa-eye');
                this.prev().getEl().query('input', false)[0].set({'type':isShowPassword?'text':'password'})
            }
        }];
        me.callParent(arguments);
    }  
});

