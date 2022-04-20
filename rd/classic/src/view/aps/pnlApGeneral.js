Ext.define('Rd.view.aps.pnlApGeneral', {
    extend  : 'Ext.form.Panel',
    alias   : 'widget.pnlApGeneral',
    autoScroll	: true,
    plain       : true,
    frame       : false,
    layout      : {
        type    : 'vbox',
        pack    : 'start',
        align   : 'stretch'
    },
    margin      : 5,  
    fieldDefaults: {
        msgTarget       : 'under',
        labelAlign      : 'left',
        labelSeparator  : '',
        labelWidth      : Rd.config.labelWidth+20,
        margin          : Rd.config.fieldMargin,
        labelClsExtra   : 'lblRdReq'
    },
    buttons : [
        {
            itemId  : 'save',
            text    : 'SAVE',
            scale   : 'large',
            formBind: true,
            glyph   : Rd.config.icnYes,
            margin  : Rd.config.buttonMargin,
            ui      : 'button-teal'
        }
    ],
    hide_owner  : false,
    requires: [
        'Rd.view.components.winSelectOwner'
    ],
    initComponent: function(){
        var me          = this;
        var w_prim      = 550; 
        
        var cntSystem  = {
            xtype       : 'container',
            width       : w_prim,
            layout      : 'anchor',
            defaults    : {
                anchor  : '100%'
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
                            width       : 410
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
            ]
        }
        
        me.items = [
            {
                xtype       : 'panel',
                title       : 'General Settings',
                glyph       : Rd.config.icnGears,  
                ui          : 'panel-blue',
                layout      : {
                  type  : 'vbox',
                  align : 'start',
                  pack  : 'start'
                },
                bodyPadding : 10,
                items       : cntSystem				
            }
        ];    
        
        me.callParent(arguments);
    }
});
