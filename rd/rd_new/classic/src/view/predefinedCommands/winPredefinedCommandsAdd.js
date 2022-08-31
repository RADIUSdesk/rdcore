Ext.define('Rd.view.predefinedCommands.winPredefinedCommandsAdd', {
    extend:     'Ext.window.Window',
    alias :     'widget.winPredefinedCommandsAdd',
    closable:   true,
    draggable:  true,
    resizable:  true,
    title:      'New Predefined Command',
    width:      500,
    height:     450,
    plain:      true,
    border:     false,
    layout:     'card',
    iconCls:    'fit',
    glyph: Rd.config.icnAdd,
    autoShow:   false,
    defaults: {
            border: false
    },
    requires: [
    ],
    initComponent: function() {
        var me = this;

        var scrnData  = me.mkScrnData();
        me.items = [
            scrnData
        ];  
        this.callParent(arguments);
    },
    mkScrnData: function(){
        var me      = this;
        var frmData = Ext.create('Ext.form.Panel',{
            border:     false,
            layout:     'anchor',
            itemId:     'scrnData',
            autoScroll: true,
            defaults: {
                anchor: '100%'
            },
            fieldDefaults: {
                msgTarget: 'under',
                labelClsExtra: 'lblRd',
                labelAlign: 'left',
                labelSeparator: '',
                margin: 15
            },
            defaultType: 'textfield',
            items:[
                {
                    xtype       : 'displayfield',
                    fieldLabel  : 'Cloud',
                    value       : me.cloudName,
                    labelClsExtra: 'lblRdReq'
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : i18n('sName'),
                    name        : "name",
                    allowBlank  : false,
                    blankText   : i18n('sSupply_a_value'),
                    labelClsExtra: 'lblRdReq'
                },
                {
                    xtype       : 'radiogroup',
                    fieldLabel  : 'Action',
                    columns     : 2,
                    vertical    : false,
                    labelClsExtra: 'lblRdReq',
                    items       : [
                        {
                            boxLabel  : 'Execute',
                            name      : 'action',
                            inputValue: 'execute',
                            margin    : '0 15 0 0',
                            checked   : true,
                        }, 
                        {
                            boxLabel  : 'Execute & Reply',
                            name      : 'action',
                            inputValue: 'execute_and_reply',
                            margin    : '0 0 0 15'
                        }
                    ]
                }, 
                {
				    xtype       : 'panel',
                    layout      : 'hbox',
                    bodyStyle   : 'background: #b5b5b5',
                    padding     : '0 0 0 0',
                    margin      : 0,
                    items       : [
                        {
                            xtype       : 'textfield',
                            margin      : 15,
                            fieldLabel  : i18n('sCommand'),
                            name        : 'command',
                            allowBlank  : false,
                            blankText   : i18n('sSupply_a_value'),
                            labelClsExtra: 'lblRdReq',
                            flex        : 1
                        }
                    ]
                }
            ],
            buttons: [
                {
                    itemId: 'btnDataNext',
                    text: i18n('sNext'),
                    scale: 'large',
                    iconCls: 'b-next',
                    glyph: Rd.config.icnNext,
                    formBind: true,
                    margin: '0 20 40 0'
                }
            ]
        });
        return frmData;
    }   
});
