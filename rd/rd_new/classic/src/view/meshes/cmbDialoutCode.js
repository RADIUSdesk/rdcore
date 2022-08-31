Ext.define('Rd.view.meshes.cmbDialoutCode', {
    extend			: 'Ext.form.ComboBox',
    alias 			: 'widget.cmbDialoutCode',
    fieldLabel		: 'Dialout code',
    labelSeparator	: '',
    forceSelection	: true,
    queryMode     	: 'local',
    displayField  	: 'text',
    valueField    	: 'id',
    typeAhead		: true,
    allowBlank		: false,
    mode			: 'local',
    name			: 'dialout',
    labelClsExtra	: 'lblRd',
	value			: "#",
    initComponent: function() {
        var me= this;
        var s = Ext.create('Ext.data.Store', {
            fields: ['id', 'text'],
            data : [
                {"id":"#",       "text": "#"},
                {"id":"9",       "text": "9"},
				{"id":"0",       "text": "0"}
            ]
        });
        me.store = s;
        this.callParent(arguments);
    }
});
