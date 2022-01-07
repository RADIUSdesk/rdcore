Ext.define('Rd.view.nas.pnlRealmsForNasOwner', {
    extend  : 'Ext.panel.Panel',
    alias   : 'widget.pnlRealmsForNasOwner',
    border  : false,
    nas_id  : null,
    url     : null,
    layout  : 'fit',
    tbar    : [{xtype: 'checkboxfield',boxLabel  : i18n('sMake_available_to_any_realm'), cls : 'lblRd',itemId: 'chkAvailForAll'}],
    initComponent: function(){
        var me      = this;
        var grid    = Ext.create('Rd.view.nas.gridRealmsForNasOwner',{realFlag: true});
        me.items    = grid;
        me.callParent(arguments);
    }
});
