Ext.define('Rd.view.components.pnlBanner', {
    extend:'Ext.panel.Panel',
    alias :'widget.pnlBanner',
    margins: '0 0 0 0',
    height: 52,
    layout: 'fit',
    border: false,
    heading: '',
    image: '',
    initComponent: function(){
        var me  = this;
        me.html = "<div class='banner'><img style='float:left; margin-left:4px;' src='"+me.image+"'><h1>"+me.heading+"</h1></div>";
        me.callParent(arguments);
    }
});

