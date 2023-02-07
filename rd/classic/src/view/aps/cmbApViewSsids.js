Ext.define('Rd.view.aps.cmbApViewSsids', {
    extend          : 'Ext.form.ComboBox',
    alias           : 'widget.cmbApViewSsids',
    fieldLabel      : 'SSID',
    labelSeparator  : '',
    queryMode       : 'local',
    valueField      : 'id',
    displayField    : 'name',
    editable        : false,
    mode            : 'local',
    name            : 'ap_entry_id',
    multiSelect     : false,
    allowBlank      : false,
    value           : -1,
    apId            : null,  //We sent it the apId (not the AP Profile ID)
    tpl	            : Ext.create('Ext.XTemplate',
        '<tpl for=".">',
            '<div  class="x-boundlist-item">',
                '<tpl if="chk_schedule">',
        			'<div>{name} <i class="fa  fa-calendar" style="color:#1272c7"></i></div>',
        		'<tpl else>',
        			'<div>{name}</div>',
        		'</tpl>',
        	'</div>',
        '</tpl>'
    ),
    initComponent: function(){
        var me      = this;
        var s       = Ext.create('Ext.data.Store', {
            fields: [
                {name: 'id',    		type: 'string'},
                {name: 'name',  		type: 'string'},
                {name: 'chk_schedule',  type: 'bool'}
            ],
            proxy: {
                    type            : 'ajax',
                    format          : 'json',
                    batchActions    : true,
                    extraParams     : { 'ap_id' : me.apId }, //With this one we sent the ap_id instead of the ApProfile ID
                    url     : '/cake4/rd_cake/ap-profiles/ap-profile-ssids-view.json',
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
