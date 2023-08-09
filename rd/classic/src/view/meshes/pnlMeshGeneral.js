Ext.define('Rd.view.meshes.pnlMeshGeneral', {
    extend      : 'Ext.form.Panel',
    alias       : 'widget.pnlMeshGeneral',
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
    initComponent: function(){
        var me = this;
        var w_prim      = 550;   
        var cntGeneral  = {
            xtype       : 'container',
            width       : w_prim,
            layout      : 'anchor',
            defaults    : {
                anchor  : '100%'
            },
            items       : [
                {
                    xtype       : 'fieldcontainer',
                    itemId      : 'fcPickGroup',
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
                            margin      : 0,
                            padding     : 0,
                            width       : 410
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
                }         
            ]
        };
        
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
                items       : cntGeneral				
            }
        ];    
      
        me.callParent(arguments);
    }
});
