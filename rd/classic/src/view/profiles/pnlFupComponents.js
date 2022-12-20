Ext.define('Rd.view.profiles.pnlFupComponents', {
    extend      : 'Ext.panel.Panel',
    alias       : 'widget.pnlFupComponents',
    requires    : [
        'Rd.view.profiles.vcFupComponents',
        'Rd.view.profiles.pnlFupComponent'
    ],
    controller  : 'vcFupComponents',
    layout      : { type: 'vbox'},
    title       : "FUP Components",
    tools: [
    {
        type    :'plus',
        tooltip : 'Add FUP Component',
        callback: 'addComponent'
    }],
    initComponent: function(){
        var me      = this;
        var w_sec   = 350;
        var w_rd    = 68;
        me.width    = 750;
        me.padding  = 0;      
        this.callParent(arguments);
    }
});
