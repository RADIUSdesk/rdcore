Ext.define('Rd.view.hardwares.pnlHardwareAddEdit', {
    extend      : 'Ext.form.Panel',
    alias       : 'widget.pnlHardwareAddEdit',
    autoScroll	: true,
    plain       : true,
	itemId		: 'pnlHardwareAddEdit',
    layout: {
        type: 'vbox',
        pack: 'start',
        align: 'stretch'
    },
    hw_id       : null,
    hw_name     : null,
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
        'Rd.view.hardwares.vcHardwareGeneric',
        'Rd.view.hardwares.pnlRadioDetail'
    ],
    controller  : 'vcHardwareGeneric',
    listeners       : {
        show : 'loadSettings', //Trigger a load of the settings
        afterrender:'loadSettings' 
    },
    initComponent: function(){
    
        var me 	           = this;  
        var w_prim         = 550;
        var w_sec          = 350;
        var hide_multiple  = true;
        var gen_height     = 550; 
        
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
                        fieldLabel  : i18n('sName'),
                        name        : "name",
                        allowBlank  : false,
                        width       : w_prim
                    },
                    {
                        xtype       : 'textfield',
                        fieldLabel  : 'Vendor',
                        name        : "vendor",
                        allowBlank  : false,
                        width       : w_prim
                    },
                    {
                        xtype       : 'textfield',
                        fieldLabel  : 'Model',
                        name        : "model",
                        allowBlank  : false,
                        width       : w_prim
                    }, 
                    {
                        xtype       : 'textfield',
                        fieldLabel  : 'Firmware ID',
                        name        : "fw_id",
                        allowBlank  : false,
                        width       : w_prim
                    }, 
                    {
                        xtype       : 'textfield',
                        fieldLabel  : 'WAN Port',
                        name        : "wan",
                        allowBlank  : false,
                        width       : w_prim
                    },
                    {
                        xtype       : 'textfield',
                        fieldLabel  : 'LAN Port',
                        name        : "lan",
                        labelClsExtra: 'lblRd',
                        width       : w_prim
                    },  
                    {
                        xtype       : 'checkbox',      
                        fieldLabel  : 'For Mesh',
                        name        : 'for_mesh',
                        inputValue  : 'for_mesh',
                        checked     : true
                    },
                    {
                        xtype       : 'checkbox',      
                        fieldLabel  : 'For AP',
                        name        : 'for_ap',
                        inputValue  : 'for_ap'
                    },
                    {
                        xtype       : 'checkbox',      
                        fieldLabel  : 'For Sub-Providers',
                        name        : 'available_to_siblings',
                        inputValue  : 'available_to_siblings',
                        itemId      : 'a_to_s'
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
                                fieldLabel  : 'Radio Count'
                            },
                            {
					            xtype       : 'sliderfield',
                                name        : 'radio_count',
                                userCls     : 'sldrDark',
                                itemId      : 'sldrRadioCount',
                                width       : 150,
                                increment   : 1,
                                minValue    : 0,
                                maxValue    : 3,
                                listeners   : {
							        change  : 'sldrRadioCountChange'
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
                        html        : '<h1><span style="color:grey;font-weight:700; font-size: smaller;">RADIOS</span><h1>'
                    },
                    {
                        xtype       : 'container',
                        layout      : 'hbox',
                        items       : [
                            {
                                xtype       : 'pnlRadioDetail',
                                itemId      : 'pnlRadioR0',
                                title       : 'RADIO 0',
                                radio_nr    : 0,
                                hidden      : true,
                                flex        : 1
                            },
                            {
                                xtype       : 'pnlRadioDetail',
                                itemId      : 'pnlRadioR1',
                                title       : 'RADIO 1',
                                radio_nr    : 1,
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
                                xtype       : 'pnlRadioDetail',
                                itemId      : 'pnlRadioR2',
                                title       : 'RADIO 2',
                                radio_nr    : 2,
                                hidden      : true,
                                flex        : 1
                            }
                        ]
                    }
                ],
                height      : 1500
            }
        ];       
        this.callParent(arguments);
    }
});
