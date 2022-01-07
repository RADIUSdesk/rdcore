Ext.define('Rd.view.components.ajaxCheckbox', {
    extend:'Ext.form.field.Checkbox',
    alias :'widget.ajaxCheckbox',
    url: null,
    initComponent: function(){
        var me = this;
        Ext.Ajax.request({
            url: me.url,
            method: 'GET',
            success: me.configureCheckbox,
            scope: me
        });
        me.callParent(arguments);
    },
    configureCheckbox: function(response){
        var me          = this;
        var jsonData    = Ext.JSON.decode(response.responseText);
        if(jsonData.success){

            if(jsonData.items.disabled ==true){
                me.setDisabled(true);
            }else{
                me.setDisabled(false);
            }

            if(jsonData.items.checked ==true){
               // me.setChecked(true);
                me.setValue(true);
            }else{
              //  me.setChecked(false);
                me.setValue(false);
            }
            
        }
    }
});

