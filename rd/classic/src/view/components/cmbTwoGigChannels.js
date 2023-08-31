Ext.define('Rd.view.components.cmbTwoGigChannels', {
    extend			: 'Ext.form.ComboBox',
    alias 			: 'widget.cmbTwoGigChannels',
    fieldLabel		: '2.4GHz Channel',
    labelSeparator	: '',
    forceSelection	: true,
    queryMode     	: 'local',
    displayField  	: 'text',
    valueField    	: 'id',
    typeAhead		: true,
    allowBlank		: false,
    mode			: 'local',
    labelClsExtra	: 'lblRd',
    inclAuto        : false,
    initComponent: function() {
        var me= this;
        me.value = 1; //Rather make it channel 1 by default
        
        //FIXME In future add an option to include Auto or not
        var data = [
                {"id":"auto",   "text": 'Auto','non_overlap': false},
                {"id":"1",      "text": '1 (Non-Overlapping)','non_overlap': true},
				{"id":"2",      "text": '2','non_overlap': false},
                {"id":"3",      "text": '3','non_overlap': false},
				{"id":"4",      "text": '4','non_overlap': false},
                {"id":"5",      "text": '5','non_overlap': false},
				{"id":"6",      "text": '6 (Non-Overlapping)','non_overlap': true},
                {"id":"7",      "text": '7','non_overlap': false},
				{"id":"8",      "text": '8','non_overlap': false},
                {"id":"9",      "text": '9','non_overlap': false},
				{"id":"10",     "text": '10','non_overlap': false},
                {"id":"11",     "text": '11 (Non-Overlapping)','non_overlap': true}
        ];
        
        if(me.inclAuto == false){
            Ext.Array.removeAt(data,0); //Remove first item
            me.value = 1;
        }
        
        var s = Ext.create('Ext.data.Store', {
            fields: ['id', 'text'],
            data : data
        });
          
        me.store = s;  
        me.callParent(arguments);
    }
});
