Ext.define('Rd.view.meshes.pnlMeshGeneral', {
    extend  : 'Ext.panel.Panel',
    alias   : 'widget.pnlMeshGeneral',
    border  : false,
    layout  : 'hbox',
    bodyStyle: {backgroundColor : Rd.config.panelGrey },
    hide_owner  : false,
    requires: [
        'Rd.view.components.winSelectOwner'
    ],
    initComponent: function(){
        var me = this;
        me.items =  { 
                xtype   :  'form',
                height  : '100%', 
                width   :  500,
                layout  : 'anchor',
                autoScroll:true,
                frame   : true,
                defaults    : {
                    anchor: '100%'
                },
                fieldDefaults: {
                    msgTarget       : 'under',
                    labelClsExtra   : 'lblRdReq',
                    labelAlign      : 'left',
                    labelSeparator  : '',
                    margin          : Rd.config.fieldMargin,
                   // labelWidth      : Rd.config.labelWidth,
                    labelWidth      : 100
                },
                items       : [
                    {
                        xtype       : 'fieldcontainer',
                        itemId      : 'fcPickOwner',
                        hidden      : true,  
                        layout      : {
                            type    : 'hbox',
                            align   : 'begin',
                            pack    : 'start'
                        },
                        items:[
                            {
                                itemId      : 'owner',
                                xtype       : 'displayfield',
                                fieldLabel  : i18n('sOwner'),
                                name        : 'username',
                                itemId      : 'displUser',
                                margin      : 0,
                                padding     : 0,
                                width       : 360
                            },
                            {
                                xtype       : 'button',
                                text        : 'Pick Owner',
                                margin      : 5,
                                padding     : 5,
                                ui          : 'button-green',
                                itemId      : 'btnPickOwner',
                                width       : 100
                            },
                            {
                                xtype       : 'textfield',
                                name        : "user_id",
                                itemId      : 'hiddenUser',
                                hidden      : true
                            }
                        ]
                    },
                    {
                        xtype       : 'fieldcontainer',
                        itemId      : 'fcPickGroup',
                        hidden      : true,
                        layout      : {
                            type    : 'hbox',
                            align   : 'begin',
                            pack    : 'start'
                        },
                        items:[
                            {
                                itemId      : 'displTag',
                                xtype       : 'displayfield',
                                fieldLabel  : 'Grouping',
                                name        : 'tag_path',
                                margin      : 0,
                                padding     : 0,
                                width       : 360
                            },
                            {
                                xtype       : 'button',
                                text        : 'Change Group',
                                margin      : 5,
                                padding     : 5,
                                ui          : 'button-green',
                                itemId      : 'btnPickGroup',
                                width       : 100
                            },
                            {
                                xtype       : 'textfield',
                                //name        : 'tree_tag_id',
                                name        : 'network_id',
                                itemId      : 'hiddenTag',
                                hidden      : true
                            }
                        ]
                    },
                    {
                        xtype       : 'textfield',
                        fieldLabel  : i18n('sName'),
                        name        : "name",
                        allowBlank  : false,
                        blankText   : i18n("sSupply_a_value"),
                    },
                    {
                        xtype       : 'checkbox',
                        boxLabel    : 'Enable Alerts',
                        name        : 'enable_alerts',
                        margin      : '0 0 0 15'   
                    },
                    {
                        xtype       : 'checkbox',
                        boxLabel    : 'Include In Overviews',
                        name        : 'enable_overviews',
                        margin      : '0 0 0 15'   
                    },
                    {
                        xtype       : 'checkbox',
                        boxLabel    : 'Available To Sub-Providers',
                        name        : 'available_to_siblings',
                        margin      : '0 0 0 15'   
                    }
                ],    
                buttons: [
                    {
                        itemId      : 'save',
                        formBind    : true,
                        text        : i18n('sSave'),
                        scale       : 'large',
                        glyph       : Rd.config.icnYes,
                        margin      : Rd.config.buttonMargin
                    }
                ]
            };
        me.callParent(arguments);
    }
});
