Ext.define('Rd.view.auditLogs.pnlAuditLogs', {
    extend	: 'Ext.tab.Panel',
    alias	: 'widget.pnlAuditLogs',
    border	: false,
    plain	: true,
    cls     : 'subSubTab',
    padding : 0,
    margin  : 0,
    tabBar: {
        items: [
            { 
                xtype   : 'btnOtherBack'
            }              
       ]
    },
    requires: [
         'Rd.view.auditLogs.gridAuditLogs'
    ],
    initComponent: function(){
        var me      = this;
        me.items = [
        {   
            title   : 'Audit Logs',
            xtype   : 'gridAuditLogs'
        }    
    ]; 
        me.callParent(arguments);
    }
});
