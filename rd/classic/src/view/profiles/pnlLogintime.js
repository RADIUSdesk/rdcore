Ext.define('Rd.view.profiles.pnlLogintime', {
    extend      : 'Ext.panel.Panel',
    glyph       : Rd.config.icnHourHalf,
    alias       : 'widget.pnlLogintime',
    requires    : [
        'Rd.view.profiles.vcLogintime',
        'Rd.view.components.rdSlider'
    ],
    controller  : 'vcLogintime',
    layout      : { type: 'vbox'},
    title       : "TIME SLOTS",
    initComponent: function(){
        var me      = this;
        me.width    = 550;
        me.padding  = 5;
        var w_prim  = 540;
               
        var cntOne  = {
            xtype       : 'panel',
            width       : w_prim,
            layout      : 'anchor',
            bodyStyle   : 'background: #e6f7ff',
            defaults    : {
                anchor  : '100%'
            },
            items       : [
                {
                    xtype      : 'radiogroup',
                    fieldLabel : 'Slot 1',
                    itemId     : 'rgrpSlotType',
                    columns: 2,
                    vertical: false,
                    width: me.width,
                    items: [
                        {
                            boxLabel  : 'Disabled',
                            name      : 'logintime_1_span',
                            inputValue: 'disabled',
                            margin    : '0 15 0 0',
                            checked   : true
                        }, 
                        {
                            boxLabel  : 'Every Day',
                            name      : 'logintime_1_span',
                            inputValue: 'Al',
                            margin    : '0 0 0 15'
                        },
                        {
                            boxLabel  : 'Week Days',
                            name      : 'logintime_1_span',
                            inputValue: 'Wk',
                            margin    : '0 15 0 0'
                        },
                        {
                            boxLabel    : 'Specific Days',
                            name        : 'logintime_1_span',
                            inputValue  : 'specific',
                            margin      : '0 0 0 15'   
                        }
                    ]
                },
                {
                    xtype       : 'checkboxgroup',
                    columns     : 7,
                    vertical    : true,
                    itemId      : 'chkGrpDays',
                    disabled    : true,
                    items: [
                        { boxLabel: 'Mo', name: 'logintime_1_days_Mo', inputValue: 'Mo' },
                        { boxLabel: 'Tu', name: 'logintime_1_days_Tu', inputValue: 'Tu' },
                        { boxLabel: 'We', name: 'logintime_1_days_We', inputValue: 'We' },
                        { boxLabel: 'Th', name: 'logintime_1_days_Th', inputValue: 'Th' },
                        { boxLabel: 'Fr', name: 'logintime_1_days_Fr', inputValue: 'Fr' },
                        { boxLabel: 'Sa', name: 'logintime_1_days_Sa', inputValue: 'Sa' },
                        { boxLabel: 'Su', name: 'logintime_1_days_Su', inputValue: 'Su' }
                    ]
                },		    
		        {
                    xtype       : 'timefield',
                    itemId      : 'timeStart',
                    name        : 'logintime_1_start',
                    fieldLabel  : 'Start',
                    minValue    : '0:00 AM',
                    maxValue    : '23:59 PM',
                    increment   : 30,
                    allowBlank  : false,
                    anchor      : '100%',
                    disabled    : true,
                    format      : 'H:i'
                }, {
                    xtype       : 'timefield',
                    itemId      : 'timeEnd',
                    name        : 'logintime_1_end',
                    fieldLabel  : 'End',
                    minValue    : '0:00 AM',
                    maxValue    : '23:59 PM',
                    increment   : 30,
                    allowBlank  : false,
                    anchor      : '100%',
                    disabled    : true,
                    format      : 'H:i'
               }	        
            ]
        };
        
        var cntTwo  = {
            xtype       : 'panel',
            width       : w_prim,
            layout      : 'anchor',
            bodyStyle   : 'background: #ffe6cc',           
            defaults    : {
                anchor  : '100%'
            },
            items       : [
                {
                    xtype       : 'radiogroup',
                    fieldLabel  : 'Slot 2',
                    itemId      : 'rgrpSlotType',
                    columns: 2,
                    vertical: false,
                    width: me.width,
                    items: [
                        {
                            boxLabel  : 'Disabled',
                            name      : 'logintime_2_span',
                            inputValue: 'disabled',
                            margin    : '0 15 0 0',
                            checked   : true
                        }, 
                        {
                            boxLabel  : 'Every Day',
                            name      : 'logintime_2_span',
                            inputValue: 'Al',
                            margin    : '0 0 0 15'
                        },
                        {
                            boxLabel  : 'Week Days',
                            name      : 'logintime_2_span',
                            inputValue: 'Wk',
                            margin    : '0 15 0 0'
                        },
                        {
                            boxLabel    : 'Specific Days',
                            name        : 'logintime_2_span',
                            inputValue  : 'specific',
                            margin      : '0 0 0 15'   
                        }
                    ]
                },
                {
                    xtype       : 'checkboxgroup',
                    columns     : 7,
                    vertical    : true,
                    itemId      : 'chkGrpDays',
                    disabled    : true,
                    items: [
                        { boxLabel: 'Mo', name: 'logintime_2_days_Mo', inputValue: 'Mo' },
                        { boxLabel: 'Tu', name: 'logintime_2_days_Tu', inputValue: 'Tu' },
                        { boxLabel: 'We', name: 'logintime_2_days_We', inputValue: 'We' },
                        { boxLabel: 'Th', name: 'logintime_2_days_Th', inputValue: 'Th' },
                        { boxLabel: 'Fr', name: 'logintime_2_days_Fr', inputValue: 'Fr' },
                        { boxLabel: 'Sa', name: 'logintime_2_days_Sa', inputValue: 'Sa' },
                        { boxLabel: 'Su', name: 'logintime_2_days_Su', inputValue: 'Su' }
                    ]
                },		    
		        {
                    xtype       : 'timefield',
                    itemId      : 'timeStart',
                    name        : 'logintime_2_start',
                    fieldLabel  : 'Start',
                    minValue    : '0:00 AM',
                    maxValue    : '23:59 PM',
                    increment   : 30,
                    allowBlank  : false,
                    anchor      : '100%',
                    disabled    : true,
                    format      : 'H:i'
                }, {
                    xtype       : 'timefield',
                    itemId      : 'timeEnd',
                    name        : 'logintime_2_end',
                    fieldLabel  : 'End',
                    minValue    : '0:00 AM',
                    maxValue    : '23:59 PM',
                    increment   : 30,
                    allowBlank  : false,
                    anchor      : '100%',
                    disabled    : true,
                    format      : 'H:i'
               }	                
            ]
        };
        
         var cntThree  = {
            xtype       : 'panel',
            width       : w_prim,
            layout      : 'anchor',
            bodyStyle   : 'background: #f2e6ff',           
            defaults    : {
                anchor  : '100%'
            },
            items       : [
                {
                    xtype       : 'radiogroup',
                    fieldLabel  : 'Slot 3',
                    itemId      : 'rgrpSlotType',
                    columns     : 2,
                    vertical    : false,
                    width       : me.width,
                    items       : [
                        {
                            boxLabel  : 'Disabled',
                            name      : 'logintime_3_span',
                            inputValue: 'disabled',
                            margin    : '0 15 0 0',
                            checked   : true
                        }, 
                        {
                            boxLabel  : 'Every Day',
                            name      : 'logintime_3_span',
                            inputValue: 'Al',
                            margin    : '0 0 0 15'
                        },
                        {
                            boxLabel  : 'Week Days',
                            name      : 'logintime_3_span',
                            inputValue: 'Wk',
                            margin    : '0 15 0 0'
                        },
                        {
                            boxLabel    : 'Specific Days',
                            name        : 'logintime_3_span',
                            inputValue  : 'specific',
                            margin      : '0 0 0 15'   
                        }
                    ]
                },
                {
                    xtype       : 'checkboxgroup',
                    columns     : 7,
                    vertical    : true,
                    itemId      : 'chkGrpDays',
                    disabled    : true,
                    items: [
                        { boxLabel: 'Mo', name: 'logintime_3_days_Mo', inputValue: 'Mo' },
                        { boxLabel: 'Tu', name: 'logintime_3_days_Tu', inputValue: 'Tu' },
                        { boxLabel: 'We', name: 'logintime_3_days_We', inputValue: 'We' },
                        { boxLabel: 'Th', name: 'logintime_3_days_Th', inputValue: 'Th' },
                        { boxLabel: 'Fr', name: 'logintime_3_days_Fr', inputValue: 'Fr' },
                        { boxLabel: 'Sa', name: 'logintime_3_days_Sa', inputValue: 'Sa' },
                        { boxLabel: 'Su', name: 'logintime_3_days_Su', inputValue: 'Su' }
                    ]
                },		    
		        {
                    xtype       : 'timefield',
                    itemId      : 'timeStart',
                    name        : 'logintime_3_start',
                    fieldLabel  : 'Start',
                    minValue    : '0:00 AM',
                    maxValue    : '23:59 PM',
                    increment   : 30,
                    allowBlank  : false,
                    anchor      : '100%',
                    disabled    : true,
                    format      : 'H:i'
                }, {
                    xtype       : 'timefield',
                    itemId      : 'timeEnd',
                    name        : 'logintime_3_end',
                    fieldLabel  : 'End',
                    minValue    : '0:00 AM',
                    maxValue    : '23:59 PM',
                    increment   : 30,
                    allowBlank  : false,
                    anchor      : '100%',
                    disabled    : true,
                    format      : 'H:i'
               }	        
            ]
        };
        
        me.items    = [
			cntOne,
			cntTwo,
			cntThree
        ];       
        this.callParent(arguments);
    }
});
