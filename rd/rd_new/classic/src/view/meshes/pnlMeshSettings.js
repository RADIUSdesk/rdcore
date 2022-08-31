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
