Ext.define('Rd.view.settings.winSettingsSmsTest', {
    id          : 'radiusClientWin',
    title       : 'Test SMS Settings',
    renderTo    : document.body,
    width       : 700,
    height      : 450,
    border      :true,
    layout      : 'border',
    extend      : 'Ext.window.Window',
    alias       : 'widget.winSettingsSmsTest',
    closable    : true,
    draggable   : true,
    resizable   : true,
    glyph       : Rd.config.icnMobile,
    autoShow    : false,
    defaults    : {
            border: false
    },
    requires: [
        'Ext.form.field.Text'
    ],
    initComponent: function() {
        var me = this;  
        me.items = [
            {
                region  : 'center',
                layout  : {
                    type    : 'hbox',
                    align   : 'stretch'
                },
                margins : '0 0 0 0',
                border  : true,              
                items   : [ 
                    {
                        title       : i18n('sRequest'),
                        flex        : 1,
                        xtype       : 'form',
                        ui          : 'panel-green',
                        glyph       : Rd.config.icnQuestion,
                        margin      : 5,
                        items       : [
                            { 
                                name        : 'nr',
                                value       : me.nr,
                                hidden      : true
                            },
                            {
                                xtype       : 'textfield',
                                fieldLabel  : 'SMS To',
                                name        : "phone",
                                maskRe      : /[0-9]/,
                                validator: function(v) {
                                    return /^-?[0-9]*?$/.test(v)? true : 'Only numbers allowed!';
                                },
                                allowBlank  : false,
                                blankText   : i18n('sSupply_a_value'),
                                labelClsExtra: 'lblRdReq'
                            },
                            {
                                xtype       : 'textareafield',
                                grow        : true,
                                allowBlank  : false,
                                name        : 'message',
                                fieldLabel  : 'Message',
                                labelClsExtra: 'lblRdReq'
                            }                        
                        ],
                        border:     true,
                        layout:     'anchor',
                        defaults: {
                            anchor: '100%'
                        },
                        autoScroll: true,
                        fieldDefaults: {
                            msgTarget       : 'under',
                            labelClsExtra   : 'lblRd',
                            labelAlign      : 'left',
                            labelSeparator  : '',
                            labelClsExtra   : 'lblRd',
                            labelWidth      : Rd.config.labelWidth,
                            margin          : Rd.config.fieldMargin
                        },
                        defaultType: 'textfield',
                        buttons: [
                            {
                                xtype       : 'btnCommon',
                                itemId      : 'btnSmsTestOK',
                                listeners   : {
                                    click     : 'onSmsTestOkClick'
                                }   
                            }        
                        ]
                    },
                    {
                        title       : i18n('sReply'),
                        flex        : 1,
                        xtype       : 'panel',
                        ui          : 'panel-blue',
                        itemId      : 'pnlSmsTestReply',
                        border      : true,
                        autoScroll  : true,
                        glyph       : Rd.config.icnBullhorn,
                        margin      : 5,
                        tpl         : new Ext.XTemplate(
                            '<div class=\'blue_round\'>',
                                '<h1>URL</h1>',
                                '<div>',   
                                '{url}',
                                '</div>',
                            '</div>',
                            '<div class=\'green_round\'>',
                                '<h1>Query</h1>',
                                '<div>',   
                                '{query}',
                                '</div>',
                            '</div>',
                            '<div class=\'blue_round\'>',
                                '<h1>Reply</h1>',
                                '<div>',   
                                '{reply}',
                                '</div>',
                            '</div>',
                        )
                    }
                ]
            }
        ];

        me.callParent(arguments);
    }
});
