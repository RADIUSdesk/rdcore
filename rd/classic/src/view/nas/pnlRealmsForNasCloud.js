Ext.define('Rd.view.nas.pnlRealmsForNasCloud', {
    extend  : 'Ext.panel.Panel',
    alias   : 'widget.pnlRealmsForNasCloud',
    border  : false,
    nas_id  : null,
    url     : null,
    layout  : 'fit',
    tbar    : [{xtype: 'checkboxfield',boxLabel  : i18n('sMake_available_to_any_realm'), cls : 'lblRd',itemId: 'chkAvailForAll'}],
    initComponent: function(){
        var me      = this;
        var grid    = Ext.create('Rd.view.nas.gridRealmsForNas',{realFlag: true});
        grid.getStore().getProxy().setExtraParam('na_id',me.nas_id);
        me.items    = grid;
        me.callParent(arguments);
    }
});
