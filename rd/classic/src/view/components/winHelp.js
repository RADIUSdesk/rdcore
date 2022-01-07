Ext.define('Rd.view.components.winHelp', {
    extend: 'Ext.window.Window',
    alias : 'widget.winHelp',
    title : i18n('sOnline_help'),
    layout: 'fit',
    autoShow: false,
    width:    600,
    height:   400,
    iconCls: 'help',
    glyph   : Rd.config.icnHelp,
    isWindow: true,
    constrainHeader: true,
    minimizable: true,
    maximizable: true,
    stateful: true,
    stateId: 'winHelpWin',
    srcUrl: 'https://sourceforge.net/p/radiusdesk/wiki/',
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
