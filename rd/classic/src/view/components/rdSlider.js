Ext.define('Rd.view.components.rdSlider', {
    extend      : 'Ext.container.Container',
    alias       : 'widget.rdSlider', 
    layout      : {
        type        : 'hbox'
    },
    //==VALUES TO SET==
    maxValue    : 1023,
    minValue    : 1,
    value       : 1,
    sliderName  : 'slider_name',
    sliderWidth : 150,
    numberWidth : 205,
    fieldLabel  : 'Placeholder',
    //==END VALUES TO SET==
    requires    : [
        'Rd.view.components.vcSlider'
    ],
    controller  : 'vcSlider',
    initComponent: function() {
        var me      = this;
        me.items    = [
            {
                xtype       : 'numberfield',
                width       : me.numberWidth,
                margin      : '15 0 0 15',
                padding     : 0,
                fieldLabel  : me.fieldLabel,
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
                xtype       : 'sliderfield',
                name        : me.sliderName,
                userCls     : 'sldrDark',
                width       : me.sliderWidth,
                increment   : 1,
                minValue    : me.minValue,
                maxValue    : me.maxValue,
                listeners   : {
	                change  : 'sldrAmountChange'
                }
            }
        ];
        me.callParent(arguments);
    }  
});

