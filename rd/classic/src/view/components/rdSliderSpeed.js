Ext.define('Rd.view.components.rdSliderSpeed', {
    extend      : 'Ext.container.Container',
    alias       : 'widget.rdSliderSpeed', 
    layout      : {
        type        : 'hbox'
    },
    //==VALUES TO SET==
    maxValue    : 1023,
    minValue    : 1,
    value       : 1,
    sliderName  : 'slider_name',
    sliderWidth : 300,
    numberWidth : 60,
    fieldLabel  : 'Placeholder',
    labelWidth  : 80,
    //==END VALUES TO SET==
    requires    : [
        'Rd.view.components.vcSlider'
    ],
    controller  : 'vcSlider',
    initComponent: function() {
        var me      = this;

        //We have a convention of name of amount = me.sliderName+'_amount'
        //And name of unit is me.sliderName+'_unit';

        me.items    = [
            
            {
                xtype       : 'sliderfield',
                fieldLabel  : me.fieldLabel,
                name        : me.sliderName+'_amount',
                userCls     : 'sldrDark',
                width       : me.sliderWidth,
                labelWidth  : me.labelWidth,
                increment   : 1,
                minValue    : me.minValue,
                maxValue    : me.maxValue,
                listeners   : {
	                change  : 'sldrAmountChange'
                }
            },
            {
                xtype       : 'numberfield',
                width       : me.numberWidth,
                margin      : '15 0 0 15',
                padding     : 0,
                value       : 1,
                maxValue    : me.maxValue,
                minValue    : me.minValue,
                hideTrigger : true,
                keyNavEnabled: false,
                mouseWheelEnabled: false,
                listeners   : {
	                change  : 'nrAmountChange'
                }
            },
            {
                xtype       : 'combobox',
                queryMode   : 'local',
                displayField: 'name',
                valueField  : 'id',
                width       : 100,
                name        : me.sliderName+'_unit',
                value       : 'mbps', //Default Mbps
                 store: [
                     { id  : 'kbps', name: 'Kb/s' },
                     { id  : 'mbps', name: 'Mb/s' },
                 ]
             }
        ];
        me.callParent(arguments);
    }  
});

