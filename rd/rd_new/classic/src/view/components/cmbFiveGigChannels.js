Ext.define('Rd.view.components.cmbFiveGigChannels', {
    extend			: 'Ext.form.ComboBox',
    alias 			: 'widget.cmbFiveGigChannels',
    fieldLabel		: '5GHz Channel',
    labelSeparator	: '',
    forceSelection	: true,
    queryMode     	: 'local',
    displayField  	: 'text',
    valueField    	: 'id',
    typeAhead		: true,
    value           : 44,
    allowBlank		: false,
    mode			: 'local',
    name			: 'five_chan',
    labelClsExtra	: 'lblRd',
    initComponent: function() {
        var me= this;
        var s = Ext.create('Ext.data.Store', {
            fields: ['id', 'text'],
            data : [
                {"id":"36",         "text": '36 (low power)'},
                {"id":"40",       	"text": '40 (low power)'},
				{"id":"44",         "text": '44 (low power)'},
                {"id":"48",       	"text": '48 (low power)'},
				{"id":"52",         "text": '52 (DFS)'},
                {"id":"56",       	"text": '56 (DFS)'},
				{"id":"60",         "text": '60 (DFS)'},
                {"id":"64",       	"text": '64 (DFS)'},
				{"id":"149",        "text": '149 (high power)'},
                {"id":"153",       	"text": '153 (high power)'},
				{"id":"157",        "text": '157 (high power)'},
                {"id":"161",       	"text": '161 (high power)'},
				{"id":"165",       	"text": '165 (high power)'}
            ]
        });
        me.store = s;
        this.callParent(arguments);
    }
});
