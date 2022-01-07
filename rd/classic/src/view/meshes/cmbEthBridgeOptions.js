Ext.define('Rd.view.meshes.cmbEthBridgeOptions', {
    extend          : 'Ext.form.ComboBox',
    alias           : 'widget.cmbEthBridgeOptions',
    fieldLabel      : 'Bridge With',
    labelSeparator  : '',
    queryMode       : 'local',
    valueField      : 'id',
    //displayField    : 'name',
    allowBlank      : false,
    editable        : false,
    mode            : 'local',
    itemId          : 'eth_br_with',
    name            : 'eth_br_with',
    labelClsExtra   : 'lblRd',    
    tpl	            : Ext.create('Ext.XTemplate',
        '<tpl for=".">',
            '<div  class="x-boundlist-item">',
                '<div>',
                    "<tpl if='type == \"bridge\"'><span style=\"font-weight:bold;font-size:16px;\"><i class=\"fa fa-bars\"></i> {type}</span></tpl>",
                    "<tpl if='type == \"captive_portal\"'><span style=\"font-weight:bold;font-size:16px;\"><i class=\"fa fa-key\"></i> {type}</span></tpl>",
                    "<tpl if='type == \"nat\"'><span style=\"font-weight:bold;font-size:16px;\"><i class=\"fa fa-arrows-alt\"></i> {type}</span></tpl>",
                '</div>',
                '<tpl if="Ext.isEmpty(entries)"><div style=\"color:grey;font-size:12px;\">No SSID Connected</div></tpl>', 
                '<tpl for="entries">',     // interrogate the kids property within the data
                    '<div style=\"color:#006622;font-size:12px;\"><i class=\"fa fa-wifi\"></i> SSID {name}</div>',
                '</tpl>',
            '</div>',
        '</tpl>'
    ),
    displayTpl      : Ext.create('Ext.XTemplate',
        '<tpl for=".">',
            '{name}',
        '</tpl>'
    ),   
    initComponent	: function(){
        var me      = this;
        var s       = Ext.create('Ext.data.Store', {
            fields: [
                {name: 'id',    type: 'int'},
                {name: 'name',  type: 'string'},
                {name: 'type',  type: 'string'}
            ],
            proxy: {
                    type    	: 'ajax',
                    format  	: 'json',
                    batchActions: true, 
					extraParams	: { 'mesh_id' : me.meshId}, 
                    url     	: '/cake3/rd_cake/meshes/mesh_exit_view_eth_br.json',
                    reader: {
                        type	: 'json',
                        rootProperty	: 'items',
                        messageProperty: 'message'
                    }
            },
            autoLoad: true
        });
        me.store = s;
        me.callParent(arguments);
    }
});
