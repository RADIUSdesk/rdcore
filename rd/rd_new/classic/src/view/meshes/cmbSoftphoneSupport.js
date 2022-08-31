Ext.define('Rd.view.meshes.cmbSoftphoneSupport', {
    extend			: 'Ext.form.ComboBox',
    alias 			: 'widget.cmbSoftphoneSupport',
    fieldLabel		: 'Softphone Support',
    labelSeparator	: '',
    forceSelection	: true,
    queryMode     	: 'local',
    displayField  	: 'text',
    valueField    	: 'id',
    typeAhead		: true,
    allowBlank		: false,
    mode			: 'local',
    name			: 'softph',
    labelClsExtra	: 'lblRd',
	value			: "OFF",
    initComponent: function() {
        var me= this;
        var s = Ext.create('Ext.data.Store', {
            fields: ['id', 'text'],
            data : [
                {"id":"OFF",       	"text": "Off"},
                {"id":"CLIENT", 	"text": "Client"},
				{"id":"MASTER",   	"text": "Master"}
            ]
        });
        me.store = s;
        this.callParent(arguments);
    }
});
