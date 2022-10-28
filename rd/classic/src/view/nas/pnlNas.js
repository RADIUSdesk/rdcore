Ext.define('Rd.view.nas.pnlNas', {
    extend  : 'Ext.tab.Panel',
    alias   : 'widget.pnlNas',
    border  : false,
    nas_id  : null,
    url     : null,
    plain   : true,
    cls     : 'subTab',
    root    : false,
    initComponent: function(){
        var me      = this;
        me.items    = [
            {
                title   : 'NAS',
                itemId  : 'tabNasNas',
                xtype   : 'pnlNasNas',
                nas_id  : me.nas_id,
                root    : me.root
            },
            {
                title   : 'Realms',
                itemId  : 'tabRealmsNas',
                layout  : "fit",
                xtype   : 'pnlRealmsForNasCloud',
                record  : me.record,
                nas_id  : me.nas_id,
                padding : Rd.config.gridSlim
            }
        ];
        me.callParent(arguments);
    }
});
