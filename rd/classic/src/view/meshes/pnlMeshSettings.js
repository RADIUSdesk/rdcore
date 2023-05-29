Ext.define('Rd.view.meshes.pnlMeshSettings', {
    extend  : 'Ext.form.Panel',
    alias   : 'widget.pnlMeshSettings',
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
        labelWidth      : Rd.config.labelWidth-40,
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
        var me          = this;
        var w_prim      = 550;   
        var cntConnect  = {
            xtype       : 'container',
            width       : w_prim,
            layout      : 'anchor',
            defaults    : {
                anchor  : '100%'
            },
            items       : [
            	{	
            		xtype		: 'container',
            		layout		: 'hbox',
            		items		: [
				      	{
				            xtype       : 'radio',
				            fieldLabel  : 'Ad-hoc',
				            name      	: 'connectivity',
				            inputValue	: 'IBSS',
				            itemId      : 'con_ibss',
				            labelClsExtra: 'lblRd'
				        }, 
				        {
				            xtype       : 'radio',
				            fieldLabel  : '802.11s',
				            name      	: 'connectivity',
				            inputValue	: 'mesh_point',
				            itemId      : 'con_mesh_point',
				            labelClsExtra: 'lblRd',
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
				        }
		          	]
		       	},
                {
                    xtype       : 'checkbox',      
                    boxLabel  	: 'Encryption',
                    boxLabelCls	: 'boxLabelRd',
                    name        : 'encryption',
                    inputValue  : 'encryption',
                    itemId      : 'encryption',
                    checked     : false,
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
        }
        
        var cntBatman  = {
            xtype       : 'container',
            width       : w_prim,
            layout      : 'anchor',
            defaults    : {
                anchor  : '100%'
            },
            items       : [
            	{	
            		xtype		: 'container',
            		layout		: 'hbox',
            		margin		: 0,
            		items		: [
				      	{
				            xtype       : 'radio',
				            fieldLabel  : 'BATMAN IV',
				            name      	: 'routing_algo',
				            inputValue	: 'BATMAN_IV',
				            labelClsExtra: 'lblRd'
				        }, 
				        {
				            xtype       : 'radio',
				            fieldLabel  : 'BATMAN V',
				            name      	: 'routing_algo',
				            inputValue	: 'BATMAN_V',
				            labelClsExtra: 'lblRd',
				            checked		: true
				        }
		          	]
		       	},            
                {
                    xtype       : 'checkbox',      
                    boxLabel    : i18n('sAP_isolation'),
                    boxLabelCls	: 'boxLabelRd',
                    name        : 'ap_isolation',
                    inputValue  : 'ap_isolation',
                    checked     : true
                },
                {
                    xtype       : 'checkbox',      
                    boxLabel  : i18n('sBridge_Loop_Avoidance'),
                    boxLabelCls	: 'boxLabelRd',
                    name        : 'bridge_loop_avoidance',
                    inputValue  : 'bridge_loop_avoidance',
                    checked     : true
                },
                {
                    xtype       : 'checkbox',      
                    boxLabel  : i18n('sAggregation'),
                    boxLabelCls	: 'boxLabelRd',
                    name        : 'aggregated_ogms',
                    inputValue  : 'aggregated_ogms',
                    checked     : true
                },
                {
                    xtype       : 'checkbox',      
                    boxLabel  	: i18n('sBonding'),
                    boxLabelCls	: 'boxLabelRd',
                    name        : 'bonding',
                    inputValue  : 'bonding',
                    checked     : true,
                    labelClsExtra: 'lblRdReq'
                },
                {
                    xtype       : 'checkbox',      
                    boxLabel  	: i18n('sFragmentation'),
                    boxLabelCls	: 'boxLabelRd',
                    name        : 'fragmentation',
                    inputValue  : 'fragmentation',
                    checked     : true
                },
		        {
                    xtype       : 'checkbox',      
                    boxLabel  	: 'Distributed ARP table',
                    boxLabelCls	: 'boxLabelRd',
                    name        : 'distributed_arp_table',
                    inputValue  : 'distributed_arp_table',
                    checked     : true
                },
                {
                    xtype       : 'numberfield',
                    name        : 'orig_interval',
                    fieldLabel  : i18n('sOGM_interval_br_ms_br'),
                    value       : 1000,
                    maxValue    : 20000,
                    step        : 100,
                    minValue    : 1,
                    labelClsExtra: 'lblRd',
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
                    labelClsExtra: 'lblRd',
                    allowBlank  : false,
                    blankText   : i18n("sSupply_a_value")
                }      
            ]
        };
        
        me.items = [
            {
                xtype       : 'panel',
                title       : 'Connectivity',
                glyph       : Rd.config.icnConnect, 
                ui          : 'panel-blue',
                layout      : {
                  type  : 'vbox',
                  align : 'start',
                  pack  : 'start'
                },
                bodyPadding : 10,
                items       : cntConnect				
            },
            {
                xtype       : 'panel',
                title       : 'Batman-adv Settings',
                glyph       : Rd.config.icnGears,  
                ui          : 'panel-green',
                layout      : {
                  type  : 'vbox',
                  align : 'start',
                  pack  : 'start'
                },
                bodyPadding : 10,
                items       : cntBatman				
            }
        ];    

        me.callParent(arguments);
    }
});
