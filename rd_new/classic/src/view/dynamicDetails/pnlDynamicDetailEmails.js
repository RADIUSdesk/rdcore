Ext.define('Rd.view.dynamicDetails.pnlDynamicDetailEmails', {
    extend  : 'Ext.panel.Panel',   
    alias   : 'widget.pnlDynamicDetailEmails',
    border  : false,
    dynamic_detail_id: null,
    plain   : true,
    layout  : 'fit',
    requires: [
        'Rd.view.dynamicDetails.gridDynamicDetailEmails'
    ],
    initComponent: function(){
        var me = this;
        me.items = [
            {
                xtype   : 'gridDynamicDetailEmails',
                dynamic_detail_id : me.dynamic_detail_id
            }
        ]; 
        me.callParent(arguments);
    }
});
