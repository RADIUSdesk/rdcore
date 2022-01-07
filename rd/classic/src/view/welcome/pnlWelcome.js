Ext.define('Rd.view.welcome.pnlWelcome', {
    extend  : 'Ext.panel.Panel',
    alias   : 'widget.pnlWelcome',
    border  : false,
    layout  : 'vbox',
    items   : [
        {
            xtype   : 'container',
            html    : [ 
                "<h2>Welcome to the Cloud Manager Control Panel</h2>", 
                "<p><big><b>We have detected that this is your first time here.<br>",
                "Let’s define your first network using the <i>Setup Wizard</i>",
                "</b></big><br><br></p>"
            ] 
        },
        {
            xtype   : 'container',
            layout  : 'vbox',
            items   : [
                {
                    dock    : 'left',
                    xtype   : 'toolbar',
                    border  : false,
                    frame   : false,
                    items   : [
                         {
                            "xtype": "button",
                            "text": "Setup Wizard",
                            "glyph": "xf0d0@FontAwesome",
                            "scale": "large",
                            "ui"    : 'button-teal',
                            "itemId": "btnSetupWizard",
                            "textAlign": "left"
                        }
                    ] 
                }
            ] 
        }
    ],
    initComponent: function(){
        var me = this;
        me.callParent(arguments);
    }
});
