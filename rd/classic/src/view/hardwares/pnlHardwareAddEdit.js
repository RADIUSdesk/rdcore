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
    root        : false,
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
        var gen_height     = 500; 

        var hide_system = true;
        if(me.root){
            hide_system = false;
        }
        
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
        
        var pnlTop = {
            xtype       : 'panel',
            title       : 'General',
            margin      : 20,
            glyph       : Rd.config.icnGears,
            ui          : 'panel-blue',
            items       : [
                {
                    xtype       : 'component',
                    html        : 'Basic info',
                    cls         : 'heading',
                    margin      : '20 0 0 0',
                    width       : w_prim+20
                }, 
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
                    xtype       : 'component',
                    html        : 'Ethernet',
                    cls         : 'heading',
                    margin      : '20 0 0 0',
                    width       : w_prim+20
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
                    fieldLabel  : 'LAN 1',
                    emptyText   : 'Can list more than one e.g. lan1 lan2 lan3 lan4',                
                    name        : 'lan',
                    labelClsExtra: 'lblRd',
                    width       : w_prim
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'LAN 2',
                    emptyText   : 'Can list more than one e.g. lan1 lan2 lan3 lan4',                   
                    name        : 'lan_2',
                    labelClsExtra: 'lblRd',
                    width       : w_prim
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'LAN 3',
                    emptyText   : 'Can list more than one e.g. lan1 lan2 lan3 lan4',                
                    name        : 'lan_3',
                    labelClsExtra: 'lblRd',
                    width       : w_prim
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'LAN 4',
                    emptyText   : 'Can list more than one e.g. lan1 lan2 lan3 lan4',                 
                    name        : 'lan_4',
                    labelClsExtra: 'lblRd',
                    width       : w_prim
                },
                {
                    xtype       : 'checkbox',      
                    boxLabel    : 'Include swconfig',
                    boxLabelCls : 'boxLabelRd',
                    itemId      : 'chkSwconfig',
                    name        : 'add_swconfig',
                    inputValue  : 'switchconfig'
                },
                {
                    xtype       : 'textareafield',
                    grow        : true,
                    name        : 'swconfig',
                    fieldLabel  : 'Swconfig',
                    itemId      : 'txtaSwconfig',
                    allowBlank  : false,   
                    width       : w_prim,
                    emptyText   : 'Paste the switch config from wan_network',
                    hidden      : true,
                    disabled    : true
                },
                {
                    xtype       : 'component',
                    html        : 'Availabile to',
                    cls         : 'heading',
                    margin      : '20 0 0 0',
                    width       : w_prim+20
                },  
                {
                    xtype       : 'checkbox',      
                    boxLabel    : 'MESHdesk',
                    boxLabelCls : 'boxLabelRd',
                    name        : 'for_mesh',
                    inputValue  : 'for_mesh',
                    checked     : true
                },
                {
                    xtype       : 'checkbox',      
                    boxLabel    : 'APdesk',
                    boxLabelCls : 'boxLabelRd',
                    name        : 'for_ap',
                    inputValue  : 'for_ap'
                },
                {
                    xtype       : 'checkbox',      
                    boxLabel    : 'System wide',
                    boxLabelCls : 'boxLabelRd',
                    name        : 'for_system',
                    inputValue  : 'for_system',
                    hidden      : hide_system,
                    disabled    : hide_system
                }                
            ]
        }
              
        me.items = [
            pnlTop,
            {
                xtype   : 'panel',
                title   : 'WiFi',
                glyph   : Rd.config.icnSsid,
                border  : true,
                ui      : 'panel-green',
                margin  : 20,
                layout  : {
                    type    : 'vbox',
                    pack    : 'start',
                    align   : 'middle'
                },
                bodyPadding : 10,
                items   : [
                    {
				        xtype       : 'container',
                        layout      : 'hbox',
                       // width       : w_prim+15,
                        items       : [
                            {
                                xtype       : 'displayfield',
                                width       : 180,
                                margin      : '15 0 0 15',
                                padding     : 0,
                                fieldLabel  : 'Radio count',
                                labelClsExtra : 'lblRd',
                            },
                            {
				                xtype       : 'sliderfield',
                                name        : 'radio_count',
                                userCls     : 'sldrDark',
                                itemId      : 'sldrRadioCount',
                                width       : 300,
                                increment   : 1,
                                minValue    : 0,
                                maxValue    : 3,
                                listeners   : {
						            change  : 'sldrRadioCountChange'
					            }
                            }
                        ]
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
                                border      : true,
                                flex        : 1
                            },
                            {
                                xtype       : 'pnlRadioDetail',
                                itemId      : 'pnlRadioR1',
                                title       : 'RADIO 1',
                                radio_nr    : 1,
                                hidden      : true,
                                border      : true,
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
                                border      : true,
                                flex        : 1
                            }
                        ]
                    }
                ],
              //  height      : 1500
            }
        ];       
        this.callParent(arguments);
    }
});
