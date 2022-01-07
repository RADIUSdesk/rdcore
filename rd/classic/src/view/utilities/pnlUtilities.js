Ext.define('Rd.view.utilities.pnlUtilities', {
    extend      : 'Ext.panel.Panel',
    alias       : 'widget.pnlUtilities',
    scrollable  : true,
    border      : false,
    ui          : 'light',
    frame       : false,
    config: {
        urlUtilitiesItems:    '/cake3/rd_cake/dashboard/utilities-items.json'
    },
    initComponent: function() {
        var me      = this;
        
        Ext.Ajax.request({
            url: me.getUrlUtilitiesItems(),
            method: 'GET',
            success: function(response){
                var jsonData = Ext.JSON.decode(response.responseText);
                if(jsonData.success){     
                    me.addDocked({
                        dock: 'left',
                        xtype: 'toolbar',
                        border: false,
                        frame: false,
                        items: jsonData.data
                    });
                }
            }
        });
        me.callParent(arguments);
    }   
});
