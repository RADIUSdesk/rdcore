Ext.define('Rd.view.hardwareOwners.winHardwareOwnerDelete', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winHardwareOwnerDelete',
    closable    : true,
    draggable   : true,
    resizable   : true,
    title       : 'Delete Hardware',
    width       : 400,
    height      : 400,
    plain       : true,
    border      : false,
    layout      : 'fit',
    glyph       : Rd.config.icnDelete,
    autoShow    : false,
    record      : '',
    defaults: {
            border: false
    },
    controller  : 'vcGridHardwareOwners',
    requires: [
        'Rd.view.hardwareOwners.vcGridHardwareOwners'
    ],
    initComponent: function() {
        var me 		= this; 
        var pnlData = Ext.create('Ext.panel.Panel',{
            border      : false,
            autoScroll  : true,
            padding     : 10,  
            buttons     : [
                {
                    itemId  : 'hwDelete',
                    text    : i18n('sOK'),
                    scale   : 'large',
                    glyph   : Rd.config.icnYes,
                    margin  : Rd.config.buttonMargin
                }
            ],
            tpl: new Ext.XTemplate(
                '<h2>How it works</h2>',
                '<ul>',
                  '<li>If the current status of the hardware is <span style="color:blue">Checked-In</span></li>',
                  '<li>This action will change it to <span style="color:blue">Awaiting Check-Out</span></li>',
                  '<li>You then need to reboot the hardware <br>(While it is connected to the Internet)</li>',
                  '<li>The status will now change to <span style="color:blue">Checked-Out</span></li>',
                  '<li>Do this delete action one more time remove it from the list</li>',
                '</ul>'	
            ),
            data: {}
        });
        me.items = pnlData;
        me.callParent(arguments);
    }
});
