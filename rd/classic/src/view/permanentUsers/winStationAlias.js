Ext.define('Rd.view.permanentUsers.winStationAlias', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winStationAlias',
    closable    : true,
    draggable   : true,
    resizable   : true,
    title       : 'Alias for Callingstationid (MAC)',
    width       : 500,
    height      : 350,
    plain       : true,
    border      : false,
    layout      : 'fit',
    glyph       : Rd.config.icnEdit,
    autoShow    : false,
    defaults: {
            border: false
    },
    requires: [
    ],
    initComponent: function() {
        var me      = this;
        var frmData = Ext.create('Ext.form.Panel',{
            border:     false,
            layout:     'anchor',
            autoScroll: true,
            defaults: {
                anchor: '100%'
            },
            fieldDefaults: {
                msgTarget       : 'under',
                labelClsExtra   : 'lblRd',
                labelAlign      : 'left',
                labelSeparator  : '',
                labelClsExtra   : 'lblRd',
                margin          : Rd.config.fieldMargin
            },
            defaultType: 'textfield',
            buttons: [
                {
                    itemId      : 'save',
                    formBind    : true,
                    text        : 'SAVE',
                    scale       : 'large',
                    glyph       : Rd.config.icnYes,
                    margin      : Rd.config.buttonMargin,
                    ui          : 'button-teal'
                }
            ],
            items: [
				{
                    xtype       : 'displayfield',
                    value       : me.callingstationid,
                    fieldCls    : 'blue_round'
                },
                {
                    name        : 'callingstationid',
                    hidden      : true,
                    value       : me.callingstationid
                },
                {
                    name        : 'username',
                    hidden      : true,
                    value       : me.username
                },
                {
                    name        : 'alias',
                    fieldLabel  : 'Alias',
                    allowBlank  : false,
                    value       : me.station_alias,
                    blankText   : 'Specify An Unique Alias',
                    itemId      : 'txtAlias',
                    margin      : Rd.config.fieldMargin +5
                },
                {
                    xtype       : 'checkbox',
                    boxLabel    : 'Prefix With Username ('+me.username+')',
                    name        : 'prefix_with_username',
                    checked     : false,
                    margin      : '0 0 0 15',
                    boxLabelCls : 'boxLabelRd'   
                },
                {
                    xtype       : 'checkbox',
                    boxLabel    : 'Remove Alias',
                    name        : 'remove_alias',
                    itemId      : 'chkRemoveAlias',
                    checked     : false,
                    margin      : '0 0 0 15',
                    boxLabelCls : 'boxLabelRd'   
                }
            ]
        });
        me.items = frmData; 
        me.callParent(arguments);
    }
});
