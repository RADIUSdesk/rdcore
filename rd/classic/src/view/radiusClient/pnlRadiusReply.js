Ext.define('Rd.view.radiusClient.pnlRadiusReply', {
    extend      : 'Ext.form.Panel',
    alias       : 'widget.pnlRadiusReply',
    autoScroll  : true,
    autoCreate  : true,
    frame       : false,
    initComponent: function(){
        var me = this; 
        me.tpl = new Ext.XTemplate(
            '<div class="blue_round_new">',
                '<h1>' + i18n('sRequest_Attributes') + '</h1>',
                '<ul class="attr-list">',
                    '<tpl for="send_exp">',
                        '<li class="attr-item">',
                            '<span class="attr-name">{attribute}</span>',
                            '<span class="attr-value">{value}</span>',
                        '</li>',
                    '</tpl>',
                '</ul>',
            '</div>',

            "<tpl if='failed'>",
                '<div class="red_round_new">',
            '<tpl else>',
                '<div class="green_round_new">',
            '</tpl>',
                '<h1>' + i18n('sReply_Attributes') + '</h1>',
                '<ul class="attr-list">',
                    '<tpl for="re_exp">',
                        '<li class="attr-item">',
                            '<span class="attr-name">{attribute}</span>',
                            '<span class="attr-value">{value}</span>',
                        '</li>',
                    '</tpl>',
                '</ul>',
            '</div>'
        );       
        me.callParent(arguments);
    }
});

