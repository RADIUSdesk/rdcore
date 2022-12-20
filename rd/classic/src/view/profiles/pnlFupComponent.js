Ext.define('Rd.view.profiles.pnlFupComponent', {
    extend      : 'Ext.panel.Panel',
    padding     : 5,
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
        var w_prim  = 450;
        me.width    = 750;
        prefix      = me.action+'_'+me.count+'_';     
        me.items    = [
             
            {
			    xtype       : 'textfield',
			    fieldLabel  : 'Component Name',
			    name        : prefix+'name',
			    allowBlank  : false,
			    blankText   : i18n("sSupply_a_value"),
			    width       : w_prim,
                margin      : Rd.config.fieldMargin
		    },
            {
                xtype       : 'container',
                padding     : '0 6 0 10',
                layout      : { type: 'hbox'},
                items       : [
                    {
                        xtype       : 'combobox',
                        queryMode   : 'local',
                        name        : prefix+'if_condition',
                        displayField: 'name',
                        valueField  : 'id',
                        width       : 156,
                        fieldLabel  : 'If',
                        labelWidth  : 10,
                        value       : 'time_of_day', 
                        store: [
                            { id  : 'day_usage',   name: 'daily usage'   },
                            { id  : 'week_usage',  name: 'weekly usage'  },
                            { id  : 'month_usage', name: 'monthly usage' },
                            { id  : 'time_of_day', name: 'time of day'   },
                        ],
                        margin      : '10 2 0 2',
                        listeners   : {
		                    change  : 'cmbConditionTypeChange'
	                    }
                    },
                    {
                        xtype       : 'timefield',
                        itemId      : 'timeStart',
                        name        : prefix+'time_start',
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
                        margin      : '10 2 0 2',
                    },
                    {
                        xtype       : 'timefield',
                        itemId      : 'timeEnd',
                        name        : prefix+'time_end',
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
                        margin      : '10 2 0 2',
                    },
                    {
                        fieldLabel  : '>',
                        labelWidth  : 15,
                        name        : prefix+'data_amount',
                        itemId      : 'dataAmount',
                        xtype       : 'numberfield',
                        width       : 80,
                        margin      : '10 2 0 2',
                        padding     : 0,
                        value       : 1,
                        hideTrigger : true,
                        hidden      : true,
                        keyNavEnabled: false,
                        mouseWheelEnabled: false
                    },
                    {
                        xtype       : 'combobox',
                        margin      : '10 2 0 2',
                        name        : prefix+'data_unit',
                        itemId      : 'dataUnit',
                        hidden      : true,
                        queryMode   : 'local',
                        displayField: 'name',
                        valueField  : 'id',
                        width       : 80,
                        value       : 'gb', //Default Gb
                         store: [
                             { id  : 'mb', name: 'Mb' },
                             { id  : 'gb', name: 'Gb' },
                         ]
                    },
                    {
                        xtype       : 'combobox',
                        fieldLabel  : ':',
                        margin      : '10 2 0 2',
                        labelWidth  : 5,
                        queryMode   : 'local',
                        displayField: 'name',
                        valueField  : 'id',
                        width       : 170,
                        value       : 'decrease_speed',
                        name        : prefix+'action', 
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
                        margin      : '10 2 0 2',
                        padding     : 0,
                        value       : 1,
                        name        : prefix+'action_amount',
                        hideTrigger : true,
                        keyNavEnabled: false,
                        mouseWheelEnabled: false
                    },
                    {
                        fieldLabel  : '%',
                        xtype       : 'displayfield',
                        margin      : '10 2 0 2'
                    }
                ]
            }
            
        ];       
        this.callParent(arguments);
    }
});
