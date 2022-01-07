Ext.define('Rd.view.meshes.pnlMeshSettings', {
    extend  : 'Ext.panel.Panel',
    alias   : 'widget.pnlMeshSettings',
    border  : false,
    layout  : 'hbox',
    bodyStyle: {backgroundColor : Rd.config.panelGrey },
    initComponent: function(){
        var me = this;

        me.items =  { 
                xtype   :  'form',
                height  : '100%', 
                width   :  550,
                layout  : 'anchor',
                autoScroll:true,
                frame   : true,
                bodyPadding: 10,
                fieldDefaults: {
                    msgTarget       : 'under',
                    labelClsExtra   : 'lblRd',
                    labelAlign      : 'left',
                    labelSeparator  : '',
                    margin          : Rd.config.fieldMargin,
                    labelWidth      : Rd.config.labelWidth
                },
                items       : [
                    {
                        xtype       : 'panel',
                        title       : 'Connectivity',
                        glyph       : Rd.config.icnConnect, 
                        ui          : 'panel-blue',
                        border      : true,
                        bodyPadding : 10,
                        defaultType : 'textfield',
                        defaults    : {
                            anchor  : '100%'
                        },
                        items   : [       
                            {
		                        xtype       : 'radio',
		                        fieldLabel  : 'Ad-hoc',
		                        name      	: 'connectivity',
		                        inputValue	: 'IBSS',
		                        itemId      : 'con_ibss',
		                        labelClsExtra: 'lblRdReq'
	                        }, 
	                        {
		                        xtype       : 'radio',
		                        fieldLabel  : '802.11s',
		                        name      	: 'connectivity',
		                        inputValue	: 'mesh_point',
		                        itemId      : 'con_mesh_point',
		                        labelClsExtra: 'lblRdReq',
		                        checked		: true,
		                        afterRender: function (ct, position) {
                                    new Ext.ToolTip({
                                        target : this.id,
                                        trackMouse : false,
                                        maxWidth : 250,
                                        minWidth : 100,
                                        html : "<label class=\'lblTipItem\'>Recommended</label>"
                                    });
                                }
	                        },
	                        {
                                xtype       : 'checkbox',      
                                fieldLabel  : 'Encryption',
                                name        : 'encryption',
                                inputValue  : 'encryption',
                                itemId      : 'encryption',
                                checked     : false,
                                labelClsExtra: 'lblRdReq',
                                afterRender: function (ct, position) {
                                    new Ext.ToolTip({
                                        target : this.id,
                                        trackMouse : false,
                                        maxWidth : 250,
                                        minWidth : 100,
                                        html : "<label class=\'lblTipItem\'>Does not work on devices with 4M Flash (entry level)</label>"
                                    });
                                }
                            },
                            {
					            xtype       : 'textfield',
					            fieldLabel  : 'Key',
					            name        : 'encryption_key',
					            itemId      : 'encryption_key',
					            allowBlank  : false,
					            minLength   : 8,
					            hidden      : true,
					            disabled    : true,
					            blankText   : i18n('sSupply_a_value'),
					            labelClsExtra: 'lblRdReq'
					        }
	                    ]
                    },
                    {
                        xtype       : 'panel',
                        title       : 'Batman-adv Settings',
                        glyph       : Rd.config.icnGears, 
                        ui          : 'panel-green',
                        border      : true,
                        margin      :  '10 0 0 0',
                        bodyPadding : 10,
                        defaultType : 'textfield',
                        defaults    : {
                            anchor  : '100%'
                        },
                        items   : [
                            {
                                xtype       : 'checkbox',      
                                fieldLabel  : i18n('sAP_isolation'),
                                name        : 'ap_isolation',
                                inputValue  : 'ap_isolation',
                                checked     : true,
                                labelClsExtra: 'lblRdReq'
                            },
                            {
                                xtype       : 'checkbox',      
                                fieldLabel  : i18n('sBridge_Loop_Avoidance'),
                                name        : 'bridge_loop_avoidance',
                                inputValue  : 'bridge_loop_avoidance',
                                checked     : true,
                                labelClsExtra: 'lblRdReq'
                            },
                            {
                                xtype       : 'checkbox',      
                                fieldLabel  : i18n('sAggregation'),
                                name        : 'aggregated_ogms',
                                inputValue  : 'aggregated_ogms',
                                checked     : true,
                                labelClsExtra: 'lblRdReq'
                            },
                            {
                                xtype       : 'checkbox',      
                                fieldLabel  : i18n('sBonding'),
                                name        : 'bonding',
                                inputValue  : 'bonding',
                                checked     : true,
                                labelClsExtra: 'lblRdReq'
                            },
                            {
                                xtype       : 'checkbox',      
                                fieldLabel  : i18n('sFragmentation'),
                                name        : 'fragmentation',
                                inputValue  : 'fragmentation',
                                checked     : true,
                                labelClsExtra: 'lblRdReq'
                            },
					        {
                                xtype       : 'checkbox',      
                                fieldLabel  : 'Distributed ARP table',
                                name        : 'distributed_arp_table',
                                inputValue  : 'distributed_arp_table',
                                checked     : true,
                                labelClsExtra: 'lblRdReq'
                            },
                            {
                                xtype       : 'numberfield',
                                name        : 'orig_interval',
                                fieldLabel  : i18n('sOGM_interval_br_ms_br'),
                                value       : 1000,
                                maxValue    : 20000,
                                step        : 100,
                                minValue    : 1,
                                labelClsExtra: 'lblRdReq',
                                allowBlank  : false,
                                blankText   : i18n("sSupply_a_value")
                            },
                            {
                                xtype       : 'numberfield',
                                name        : 'gw_sel_class',
                                fieldLabel  : i18n('sGateway_switching'),
                                value       : 20,
                                maxValue    : 255,
                                step        : 1,
                                minValue    : 1,
                                labelClsExtra: 'lblRdReq',
                                allowBlank  : false,
                                blankText   : i18n("sSupply_a_value")
                            }
                        ]
                    }  
                ],    
                buttons: [
                    {
                        itemId: 'save',
                        formBind: true,
                        text: i18n('sSave'),
                        scale: 'large',
                        iconCls: 'b-save',
                        glyph   : Rd.config.icnYes,
                        margin: Rd.config.buttonMargin
                    }
                ]
            };
        me.callParent(arguments);
    }
});
