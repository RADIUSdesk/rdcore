Ext.define('Rd.view.meshes.cmbCodec', {
    extend			: 'Ext.form.ComboBox',
    alias 			: 'widget.cmbCodec',
    fieldLabel		: 'Codec1',
    labelSeparator	: '',
    forceSelection	: true,
    queryMode     	: 'local',
    displayField  	: 'text',
    valueField    	: 'id',
    typeAhead		: true,
    allowBlank		: false,
    mode			: 'local',
    name			: 'codec1',
    labelClsExtra	: 'lblRd',
	value			: "gsm",
    initComponent: function() {
        var me= this;
        var s = Ext.create('Ext.data.Store', {
            fields: ['id', 'text'],
            data : [
                {"id":"gsm",       	"text": "gsm"},
                {"id":"ulaw", 		"text": "ulaw"},
				{"id":"alaw",   	"text": "alaw"}
            ]
        });
        me.store = s;
        this.callParent(arguments);
    }
});
