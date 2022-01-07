Ext.define('Rd.view.aps.cmbApExits', {
    extend          : 'Ext.form.ComboBox',
    alias           : 'widget.cmbApExits',
    fieldLabel      : 'Exit Points',
    labelSeparator  : '',
    queryMode       : 'local',
    valueField      : 'id',
    displayField    : 'type',
    allowBlank      : false,
    editable        : false,
    mode            : 'local',
    labelClsExtra   : 'lblRd',
    tpl	        : Ext.create('Ext.XTemplate',
        '<tpl for=".">',
            '<div  class="x-boundlist-item">',
                '<div>',
                    "<tpl if='type == \"no_bridge\"'><span style=\"font-weight:bold;font-size:16px;\"><i class=\"fa  fa-minus-circle\"></i> Leave As Is</span></tpl>",
                    "<tpl if='type == \"bridge\"'><span style=\"font-weight:bold;font-size:16px;\"><i class=\"fa fa-bars\"></i> {type}</span></tpl>",
                    "<tpl if='type == \"captive_portal\"'><span style=\"font-weight:bold;font-size:16px;\"><i class=\"fa fa-key\"></i> {type}</span></tpl>",
                    "<tpl if='type == \"nat\"'><span style=\"font-weight:bold;font-size:16px;\"><i class=\"fa fa-arrows-alt\"></i> {type}</span></tpl>",
                '</div>',
                '<tpl if="Ext.isEmpty(connects_with)"><div style=\"color:grey;font-size:12px;\">No SSID Connected</div></tpl>', 
                '<tpl for="connects_with">',     // interrogate the kids property within the data
                    '<div style=\"color:#006622;font-size:12px;\"><i class=\"fa fa-wifi\"></i> SSID {name}</div>',
                '</tpl>',
            '</div>',
        '</tpl>'
    ),
    displayTpl      : Ext.create('Ext.XTemplate',
        '<tpl for=".">',
            '{type}',
        '</tpl>'
    ),   
    initComponent: function(){
        var me      = this;
        var s       = Ext.create('Ext.data.Store', {
            fields: ['id', 'type'],
            proxy: {
                    type    : 'ajax',
                    format  : 'json',
                    batchActions: true,
                    url     : '/cake3/rd_cake/ap-profiles/ap_profile_exits_index.json',
                    reader: {
                        type            : 'json',
                        rootProperty    : 'items',
                        messageProperty : 'message'
                    }
            },
            autoLoad: true
        });
        me.store = s;
        me.callParent(arguments);
    }
});
