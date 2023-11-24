Ext.define('Rd.view.aps.cntApEntryOverride', {
    extend  : 'Ext.container.Container',
    alias   : 'widget.cntApEntryOverride',
    requires: [
        'Rd.view.aps.vcApEntryOverride',
    ],
    controller  : 'vcApEntryOverride',
    info        : {}, 
    initComponent: function(){
        var me          = this;
        var w_prim      = 550;
        var ent_id      = me.info.ap_proile_entry_id;
        
        var hidden_dis  = true;
        var hidden_key  = true;
        var hidden_vlan  = true;
        
        if(me.info.check== true){
            hidden_dis = false;
        }
        
        if((me.info.check== true)&&(me.info.show_key == true)){
            hidden_key = false;
        }
        
        if((me.info.check== true)&&(me.info.show_vlan == true)){
            hidden_vlan = false;
        }
        
        me.items = [
            {
                xtype     : 'checkbox',
                itemId    : 'chkOverride',
                width     : 550,
                boxLabel  : 'Override: '+me.info.entry_name,
                boxLabelCls : 'boxLabelRd',
                name      : 'ent_override_'+ent_id+'_check',
                checked   : me.info.check
            },
            {
                xtype       : 'textfield',
                fieldLabel  : i18n("sSSID"),
                name        : 'name',
                allowBlank  : false,
                labelClsExtra: 'lblRdReq',
                width       : w_prim,
                name        : 'ent_override_'+ent_id+'_ssid',
                hidden      : hidden_dis,
                disabled    : hidden_dis,
                itemId      : 'txtSsid',
                value       : me.info.ssid
            },
            {
                xtype       : 'textfield',
                fieldLabel  : i18n("sKey"),
                name        : 'key',
                minLength   : 8,
                allowBlank  : false,
                labelClsExtra: 'lblRdReq',
                width       : w_prim,
                name        : 'ent_override_'+ent_id+'_key',
                hidden      : hidden_key,
                disabled    : hidden_key,
                itemId      : 'txtKey',
                value       : me.info.key
            },
            {
                xtype       : 'numberfield',
                name        : 'vlan',
                fieldLabel  : 'VLAN',
                value       : 1,
                maxValue    : 4094,
                minValue    : 1,
                labelClsExtra: 'lblRdReq',
                hideTrigger : true,
    			keyNavEnabled   	: false,
    			mouseWheelEnabled	: false,
    			width       : w_prim,
    			name        : 'ent_override_'+ent_id+'_vlan',
    			hidden      : hidden_vlan,
                disabled    : hidden_vlan,
                itemId      : 'txtVlan',
                value       : me.info.vlan
            }
        ];       
        me.callParent(arguments);
    }
});
