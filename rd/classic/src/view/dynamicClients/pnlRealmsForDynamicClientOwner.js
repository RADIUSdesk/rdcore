Ext.define('Rd.view.dynamicClients.pnlRealmsForDynamicClientOwner', {
    extend              : 'Ext.panel.Panel',
    alias               : 'widget.pnlRealmsForDynamicClientOwner',
    border              : false,
    dynamic_client_id   : null,
    record              : null,
    layout              : 'fit',
    tbar                : [{xtype: 'checkboxfield',boxLabel  : i18n('sMake_available_to_any_realm'), cls : 'lblRd',itemId: 'chkAvailForAll'}],
    initComponent: function(){
        var me      = this;
        var grid    = Ext.create('Rd.view.dynamicClients.gridRealmsForDynamicClientOwner',{realFlag: true});    
        //Set the grid up to display the correct things
        //Configure the settings for the realms
        grid.getStore().getProxy().setExtraParam('dynamic_client_id',me.dynamic_client_id);
        grid.getStore().getProxy().setExtraParam('owner_id',me.record.get('user_id'));
        grid.getStore().getProxy().setExtraParam('available_to_siblings',me.record.get('available_to_siblings'));
         
        me.items    = grid;
        me.callParent(arguments);
    }
});
