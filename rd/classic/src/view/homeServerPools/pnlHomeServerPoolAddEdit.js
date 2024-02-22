Ext.define('Rd.view.homeServerPools.pnlHomeServerPoolAddEdit', {
    extend      : 'Ext.form.Panel',
    alias       : 'widget.pnlHomeServerPoolAddEdit',
    autoScroll	: true,
    plain       : true,
	itemId		: 'pnlHomeServerPoolAddEditAddEdit',
    layout: {
        type: 'vbox',
        pack: 'start',
        align: 'stretch'
    },
    hsp_id      : null,
    hsp_name    : null,
    record      : null, //We will supply each instance with a reference to the selected record.
    defaults    : {
            border: false
    },
    fieldDefaults: {
        msgTarget       : 'under',
        labelAlign      : 'left',
        labelSeparator  : '',
        labelWidth      : Rd.config.labelWidth,
        margin          : Rd.config.fieldMargin,
        labelClsExtra   : 'lblRdReq'
    },
    requires: [
        'Ext.form.field.Text',
        'Rd.view.components.sldrToggle',
        'Rd.view.homeServerPools.vcHomeServerPoolGeneric',
        'Rd.view.homeServerPools.pnlHomeServer'
    ],
    controller  : 'vcHomeServerPoolGeneric',
    listeners       : {
        show        : 'loadSettings', //Trigger a load of the settings
        afterrender : 'loadSettings' 
    },
    initComponent: function(){
    
        var me 	           = this;  
        var w_prim         = 550;
        var w_sec          = 350;
        var hide_multiple  = true;
        var gen_height     = 250; 
        
        var store_hsp_type = Ext.create('Ext.data.Store', {
            fields: ['id', 'Name'],
            data : [
                {"id":"fail-over",      "name":"FAIL-OVER (Default)"},
                {"id":"load-balance",   "name":"LOAD-BALANCE"},
                {"id":"client-balance",         "name":"CLIENT-BALANCE"},
                {"id":"client-port-balance",    "name":"CLIENT-PORT-BALANCE"},
                {"id":"keyed-balance",    "name":"KEYED-BALANCE"}
            ]
        });        
        
        me.buttons = [
            {
                itemId  : 'save',
                text    : 'SAVE',
                scale   : 'large',
                formBind: true,
                glyph   : Rd.config.icnYes,
                margin  : Rd.config.buttonMargin,
                ui      : 'button-teal'
            }
        ]; 
        me.items = [
            {
                xtype       : 'panel',
                bodyStyle   : 'background: #f0f0f5',
                bodyPadding : 10,
                items       : [
                    {
                        itemId      : 'id',
                        xtype       : 'textfield',
                        name        : "id",
                        hidden      : true
                    },
                    {
                        xtype       : 'textfield',
                        fieldLabel  : 'Home Server Pool',
                        name        : "name",
                        allowBlank  : false,
                        width       : w_prim
                    },
                    {
                        xtype       : 'combobox',
                        fieldLabel  : 'Type',
                        store       : store_hsp_type,
                        queryMode   : 'local',
                        name        : 'type',
                        displayField: 'name',
                        valueField  : 'id',
                        value       : 'fail-over',//Default
                        width       : w_prim
                    },
                    {
                        xtype       : 'checkbox',      
                        fieldLabel  : 'Site Wide',
                        name        : 'for_system',
                        inputValue  : 'for_system'
                    },
                    {
					    xtype       : 'container',
                        layout      : 'hbox',
                        width       : w_sec+15,
                        items       : [
                            {
                                xtype       : 'displayfield',
                                width       : 180,
                                margin      : '15 0 0 15',
                                padding     : 0,
                                fieldLabel  : 'Home Servers'
                            },
                            {
					            xtype       : 'sliderfield',
                                name        : 'home_server_count',
                                userCls     : 'sldrDark',
                                itemId      : 'sldrHomeServerCount',
                                width       : 150,
                                increment   : 1,
                                minValue    : 1,
                                maxValue    : 3,
                                listeners   : {
							        change  : 'sldrHomeServerCountChange'
						        }
                            }
                        ]
                    } 
                ],
                height      : gen_height
            },
            {
                xtype       : 'panel',
                bodyStyle   : 'background:#f6f6ee',
                layout      : 'vbox',
                bodyPadding : 10,
                items       : [
                     {
                        xtype       : 'container',
                        html        : '<h1><span style="color:grey;font-weight:700; font-size: smaller;">HOME SERVERS</span><h1>'
                    },
                    {
                        xtype       : 'container',
                        layout      : 'hbox',
                        items       : [
                            {
                                xtype       : 'pnlHomeServer',
                                itemId      : 'pnlHomeServerH1',
                                title       : 'HOME SERVER 1',
                                home_server_nr    : 1,
                                hidden      : true,
                                flex        : 1
                            },
                            {
                                xtype       : 'pnlHomeServer',
                                itemId      : 'pnlHomeServerH2',
                                title       : 'HOME SERVER 2',
                                home_server_nr    : 2,
                                hidden      : true,
                                flex        : 1
                            }
                        ]
                    },
                    {
                        xtype       : 'container',
                        layout      : 'hbox',
                        items       : [
                            {
                                xtype       : 'pnlHomeServer',
                                itemId      : 'pnlHomeServerH3',
                                title       : 'HOME SERVER 3',
                                home_server_nr    : 1,
                                hidden      : true,
                                flex        : 1
                            }
                        ]
                    }
                ],
                height      : 1000
            }
        ];       
        this.callParent(arguments);
    }
});
