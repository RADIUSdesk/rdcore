Ext.define('Rd.view.firewallProfiles.cmbFwSchedule', {
    extend          : 'Ext.form.ComboBox',
    alias           : 'widget.cmbFwSchedule',
    fieldLabel      : 'Schedule',
    labelSeparator  : '',
    forceSelection  : true,
    queryMode       : 'local',
    displayField    : 'text',
    valueField      : 'id',
    typeAhead       : true,
    allowBlank      : false,
    mode            : 'local',
    name            : 'schedule',
    value           : 'always',
    initComponent   : function() {
        var me= this;
        var s = Ext.create('Ext.data.Store', {
            fields: ['id', 'text'],
            data : [
                {'id':"always",      	"text": 'Always'},
                {"id":"every_day",		"text": 'Every Day'},
                {"id":"every_week",     "text": 'Every Week'},
                {"id":"one_time", 		"text": 'One Time Only'},
                {"id":"custom", 		"text": 'Custom'}         
            ]
        });
        me.store = s;
        this.callParent(arguments);
    }
});
