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

        var val_name    = '';
        var val_if      = 'time_of_day';
        var t_start     = '';
        var t_end       = '';
        var d_amount    = 1;
        var d_unit      = 'gb';
        var action      = 'block';
        var a_amount    = 1;
        var time_hidden = true;
        var data_hidden = true;
        var block_hidden= true;

        if(me.d){
            val_name = me.d.name;
            val_if   = me.d.if_condition;

            if(val_if == 'time_of_day'){
                time_hidden = false;
            }else{
                data_hidden = false;
            }

            action = me.d.action;
            if(action != 'block'){
                block_hidden = false;
            }

            if(me.d.time_start){
                t_start = me.d.time_start;              
            }
            if(me.d.time_end){
                t_end = me.d.time_end;
            }
            if(me.d.data_amount){
                d_amount = me.d.data_amount;               
            }
            if(me.d.data_unit){
                d_unit = me.d.data_unit;
            }
            
            if(me.d.action_amount){
                a_amount = me.d.action_amount;
            }
        }else{
            time_hidden = false;//New one = default show time
        }
     
        me.items    = [
             
            {
			    xtype       : 'textfield',
			    fieldLabel  : 'Component Name',
			    name        : prefix+'name',
			    allowBlank  : false,
			    blankText   : i18n("sSupply_a_value"),
			    width       : w_prim,
                margin      : Rd.config.fieldMargin,
                value       : val_name
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
                        value       : val_if, 
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
                        value       : t_start,
                        hidden      : time_hidden,
                        disabled    : time_hidden
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
                        value       : t_end,
                        hidden      : time_hidden,
                        disabled    : time_hidden
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
                        value       : d_amount,
                        hideTrigger : true,
                        keyNavEnabled: false,
                        mouseWheelEnabled: false,
                        hidden      : data_hidden,
                        disabled    : data_hidden
                    },
                    {
                        xtype       : 'combobox',
                        margin      : '10 2 0 2',
                        name        : prefix+'data_unit',
                        itemId      : 'dataUnit',
                        hidden      : data_hidden,
                        disabled    : data_hidden,
                        queryMode   : 'local',
                        displayField: 'name',
                        valueField  : 'id',
                        width       : 80,
                        value       : d_unit, //Default Gb
                         store: [
                             { id  : 'mb', name: 'Mb' },
                             { id  : 'gb', name: 'Gb' },
                         ]
                    },
                    {
                        xtype       : 'combobox',
                        fieldLabel  : ':',
                        margin      : '10 2 10 2',//Make bottom 10 here else it 'falls flat' on 'block'
                        labelWidth  : 5,
                        queryMode   : 'local',
                        displayField: 'name',
                        valueField  : 'id',
                        width       : 170,
                        value       : action,
                        name        : prefix+'action', 
                        store: [
                            { id  : 'increase_speed',   name: 'increase speed' },
                            { id  : 'decrease_speed',   name: 'decrease speed' },
                            { id  : 'block',            name: 'block traffic' }
                         ],
                         listeners   : {
		                    change  : 'cmbActionChange'
	                    }
                    },
                    {
                        fieldLabel  : 'by',
                        labelWidth  : 20,
                        xtype       : 'numberfield',
                        width       : 80,
                        margin      : '10 2 0 2',
                        padding     : 0,
                        value       : a_amount,
                        name        : prefix+'action_amount',
                        hideTrigger : true,
                        keyNavEnabled: false,
                        mouseWheelEnabled: false,
                        itemId      : 'nrActionAmount',
                        hidden      : block_hidden,
                        disabled    : block_hidden
                    },
                    {
                        fieldLabel  : '%',
                        xtype       : 'displayfield',
                        margin      : '10 2 0 2',
                        itemId      : 'lblPercent',
                        hidden      : block_hidden
                    }
                ]
            }
            
        ];       
        this.callParent(arguments);
    }
});
