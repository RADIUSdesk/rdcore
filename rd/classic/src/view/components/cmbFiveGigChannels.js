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
				{"id":"52",         "text": '52 (DFS-1)'},
                {"id":"56",       	"text": '56 (DFS-1)'},
				{"id":"60",         "text": '60 (DFS-1)'},
                {"id":"64",       	"text": '64 (DFS-1)'},
                {"id":"100",       	"text": '100 (DFS-2)'},
                {"id":"104",       	"text": '104 (DFS-2)'},
                {"id":"108",       	"text": '108 (DFS-2)'},
                {"id":"112",       	"text": '112 (DFS-2)'},
                {"id":"116",       	"text": '116 (DFS-2)'},
                {"id":"120",       	"text": '120 (DFS-2)'},
                {"id":"124",       	"text": '124 (DFS-2)'},
                {"id":"124",       	"text": '124 (DFS-2)'},
                {"id":"128",       	"text": '128 (DFS-2)'},
                {"id":"132",       	"text": '132 (DFS-2)'},
                {"id":"136",       	"text": '136 (DFS-2)'},
                {"id":"140",       	"text": '140 (DFS-2)'},
                {"id":"144",       	"text": '144 (DFS-2)'},             
				{"id":"149",        "text": '149 (high power)'},
                {"id":"153",       	"text": '153 (high power)'},
				{"id":"157",        "text": '157 (high power)'},
                {"id":"161",       	"text": '161 (high power)'},
				{"id":"165",       	"text": '165 (high power)'},
				{"id":"169",       	"text": '169 (high power)'},
				{"id":"173",       	"text": '173 (high power)'}				
            ]
        });
        me.store = s;
        this.callParent(arguments);
    }
});
