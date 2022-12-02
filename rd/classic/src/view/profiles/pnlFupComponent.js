Ext.define('Rd.view.profiles.pnlFupComponent', {
    extend      : 'Ext.panel.Panel',
    padding     : 10,
    alias       : 'widget.pnlFupComponent',
    requires    : [
    ],
    layout      : { type: 'vbox'},
    bodyStyle   : 'background: #e6f7ff',
    tools: [
    {
        type    :'minus',
        tooltip : 'Delete FUP Component',
        callback: 'delComponent'
    }],
    initComponent: function(){
        var me      = this;
        var w_sec   = 350;
        var w_rd    = 68;
        me.width    = 750;
        me.items    = [
            {
                xtype       : 'container',
                layout      : { type: 'hbox'},
                items       : [
                    {
                        xtype       : 'combobox',
                        queryMode   : 'local',
                        displayField: 'name',
                        valueField  : 'id',
                        width       : 150,
                        fieldLabel  : 'If',
                        labelWidth  : 20,
                        value       : 'day_usage', //Default Gb
                         store: [
                            { id  : 'day_usage',   name: 'daily usage'   },
                            { id  : 'week_usage',  name: 'weekly usage'  },
                            { id  : 'month_usage', name: 'monthly usage' },
                            { id  : 'time_of_day', name: 'time of day'   },
                         ]
                    },
                    {
                        fieldLabel  : '>',
                        labelWidth  : 15,
                        xtype       : 'numberfield',
                        width       : 80,
                        margin      : '15 0 0 0',
                        padding     : 0,
                        value       : 1,
                        hideTrigger : true,
                        keyNavEnabled: false,
                        mouseWheelEnabled: false
                    },
                    {
                        xtype       : 'combobox',
                        queryMode   : 'local',
                        displayField: 'name',
                        valueField  : 'id',
                        width       : 80,
                        name        : 'unit',
                        value       : 'gb', //Default Gb
                         store: [
                             { id  : 'mb', name: 'Mb' },
                             { id  : 'gb', name: 'Gb' },
                         ]
                    },
                    {
                        xtype       : 'combobox',
                        fieldLabel  : ':',
                        labelWidth  : 5,
                        queryMode   : 'local',
                        displayField: 'name',
                        valueField  : 'id',
                        width       : 170,
                        value       : 'decrease_speed', 
                        store: [
                            { id  : 'increase_speed',   name: 'increase speed' },
                            { id  : 'decrease_speed',   name: 'decrease speed' },
                            { id  : 'block',            name: 'block traffic' }
                         ]
                    },
                    {
                        fieldLabel  : 'by',
                        labelWidth  : 20,
                        xtype       : 'numberfield',
                        width       : 80,
                        margin      : '15 0 0 0',
                        padding     : 0,
                        value       : 1,
                        hideTrigger : true,
                        keyNavEnabled: false,
                        mouseWheelEnabled: false
                    },
                    {
                        fieldLabel  : '%',
                        xtype       : 'displayfield'
                    }
                ]
            }
            
        ];       
        this.callParent(arguments);
    }
});
