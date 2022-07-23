Ext.define('Rd.view.dynamicClients.pnlRealmsForDynamicClientCloud', {
    extend              : 'Ext.panel.Panel',
    alias               : 'widget.pnlRealmsForDynamicClientCloud',
    border              : false,
    dynamic_client_id   : null,
    record              : null,
    layout              : 'fit',
    tbar                : [{xtype: 'checkboxfield',boxLabel  : i18n('sMake_available_to_any_realm'), cls : 'lblRd',itemId: 'chkAvailForAll'}],
    initComponent: function(){
        var me      = this;
        var grid    = Ext.create('Rd.view.dynamicClients.gridRealmsForDynamicClientCloud',{realFlag: true});
        grid.getStore().getProxy().setExtraParam('dynamic_client_id',me.dynamic_client_id);  
        me.items    = grid;
        me.callParent(arguments);
    }
});
