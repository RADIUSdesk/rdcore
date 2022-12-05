Ext.define('Rd.view.profiles.pnlFupComponent', {
    extend      : 'Ext.panel.Panel',
    padding     : 10,
    alias       : 'widget.pnlFupComponent',
    requires    : [
        'Rd.view.profiles.vcFupComponent'
    ],
    controller  : 'vcFupComponent',
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
                        labelWidth  : 10,
                        value       : 'day_usage', //Default Gb
                        store: [
                            { id  : 'day_usage',   name: 'daily usage'   },
                            { id  : 'week_usage',  name: 'weekly usage'  },
                            { id  : 'month_usage', name: 'monthly usage' },
                            { id  : 'time_of_day', name: 'time of day'   },
                        ],
                        margin      : '15 0 0 2',
                        listeners   : {
		                    change  : 'cmbConditionTypeChange'
	                    }
                    },
                    {
                        xtype       : 'timefield',
                        itemId      : 'timeStart',
                        name        : 'logintime_1_start',
                        fieldLabel  : 'Start',
                        labelWidth  : 40,
                        minValue    : '0:00 AM',
                        maxValue    : '23:59 PM',
                        increment   : 30,
                        allowBlank  : false,
                        anchor      : '100%',
                        disabled    : false,
                        format      : 'H:i',
                        width       : 135,
                        margin      : '15 0 0 2',
                    },
                    {
                        xtype       : 'timefield',
                        itemId      : 'timeEnd',
                        name        : 'logintime_1_start',
                        fieldLabel  : 'End',
                        labelWidth  : 34,
                        minValue    : '0:00 AM',
                        maxValue    : '23:59 PM',
                        increment   : 30,
                        allowBlank  : false,
                        anchor      : '100%',
                        disabled    : false,
                        format      : 'H:i',
                        width       : 135,
                        margin      : '15 0 0 2',
                    },
                    {
                        fieldLabel  : '>',
                        labelWidth  : 15,
                        itemId      : 'amount',
                        xtype       : 'numberfield',
                        width       : 80,
                        margin      : '15 0 0 0',
                        padding     : 0,
                        value       : 1,
                        hideTrigger : true,
                        hidden      : true,
                        keyNavEnabled: false,
                        mouseWheelEnabled: false
                    },
                    {
                        xtype       : 'combobox',
                        itemId      : 'unit',
                        hidden      : true,
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
                        margin      : '15 0 0 2',
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
                        margin      : '15 0 0 2',
                        padding     : 0,
                        value       : 1,
                        hideTrigger : true,
                        keyNavEnabled: false,
                        mouseWheelEnabled: false
                    },
                    {
                        fieldLabel  : '%',
                        xtype       : 'displayfield',
                        margin      : '15 0 0 2'
                    }
                ]
            }
            
        ];       
        this.callParent(arguments);
    }
});
