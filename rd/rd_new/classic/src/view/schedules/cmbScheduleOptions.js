Ext.define('Rd.view.schedules.cmbScheduleOptions', {
    extend          : 'Ext.form.ComboBox',
    alias           : 'widget.cmbScheduleOptions',
    queryMode       : 'local',
    valueField      : 'id',
    displayField    : 'name',
    editable        : false,
    mode            : 'local',
    name            : 'schedule_option',
    multiSelect     : false,
    labelClsExtra   : 'lblRd',
    allowBlank      : false,
    excludeCustom   : false,
    value           : "schedule",
    isRoot          : false,
    initComponent   : function(){
        var me       = this;
        var data     = [
            {'id':'schedule',       'name':'Schedule'       },
            {'id':'schedule_entry', 'name':'Schedule Entry' }   
        ];         
        var reSupply = Ext.create('Ext.data.Store', {
            fields: ['id', 'name'],
            data : data
        });
        me.store = reSupply;
        me.callParent(arguments);
    }
});
