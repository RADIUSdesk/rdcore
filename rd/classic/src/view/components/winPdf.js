Ext.define('Rd.view.components.winPdf', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winPdf',
    title       : i18n('sOnline_help'),
    layout      : 'fit',
    autoShow    : false,
    width       : 600,
    height      : 400,
    iconCls     : 'pdf',
    glyph       : Rd.config.icnPdf,
    isWindow    : true,
    constrainHeader: true,
    minimizable : true,
    maximizable : true,
    stateful    : true,
    stateId     : 'winPdfState',
    srcUrl      : 'https://sourceforge.net/p/radiusdesk/wiki/',
    initComponent: function() {
        var me      = this;
        me.items = [{
                xtype : "component",
                itemId: 'ifrm',
                autoEl : {
                    tag : "iframe",
                   // src : "https://sourceforge.net/p/radiusdesk/wiki/ui_webtop/"
                    src: me.srcUrl
                }
            }]
        this.callParent(arguments);
    },
    setSrc: function(url){
        console.log("change");
        me = this;
        var ifrm = me.down('#ifrm');
        console.log(ifrm);
        ifrm.getEl().dom.src = url;
    }
});
