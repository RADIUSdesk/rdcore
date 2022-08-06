Ext.define('Rd.view.schedules.winScheduleEntryAdd', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winScheduleEntryAdd',
    closable    : true,
    draggable   : true,
    resizable   : true,
    title       : 'Add Schedule Entry',
    width       : 600,
    height      : 500,
    plain       : true,
    border      : false,
    layout      : 'fit',
    glyph       : Rd.config.icnAdd,
    autoShow    : false,
    schedule_id : '',
    schedule_name : '',
    defaults: {
            border: false
    },
    requires: [
        'Ext.form.Panel',
        'Ext.form.field.Text',
        'Rd.view.schedules.vcScheduleEntry',
        'Rd.view.components.cmbPredefinedCommand'
    ],
    controller  : 'vcScheduleEntry',
    initComponent: function() {
        var me 		= this; 
        me.setTitle('Add Schedule Entry For '+me.schedule_name);
        var frmData = Ext.create('Ext.form.Panel',{
            border:     false,
            layout:     'anchor',
            autoScroll: true,
            defaults: {
                anchor: '100%'
            },
            fieldDefaults: {
                msgTarget       : 'under',
                labelClsExtra   : 'lblRd',
                labelAlign      : 'left',
                labelSeparator  : '',
                labelClsExtra   : 'lblRd',
                labelWidth      : Rd.config.labelWidth,
                margin          : 10
            },
            defaultType: 'textfield',
            buttons : [
                {
                    itemId  :  'save',
                    text    : i18n('sOK'),
                    scale   : 'large',
                    iconCls : 'b-btn_ok',
                    glyph   : Rd.config.icnYes,
                    formBind: true,
                    margin  : Rd.config.buttonMargin
                }
            ],
            items: [
                {
                    xtype   : 'textfield',
                    name    : 'schedule_id',
                    value   : me.schedule_id,
                    hidden  : true
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : i18n('sDescription'),
                    name        : "description",
                    allowBlank  : false,
                    blankText   : i18n('sSupply_a_value'),
                    labelClsExtra: 'lblRdReq'
                },
                {
                    xtype       : 'radiogroup',
                    columns     : 2,
                    vertical    : true,
                    items: [
                        { boxLabel: 'Predefined Command',   name: 'type',    inputValue: 'predefined_command',checked: true },
                        { boxLabel: 'Execute Command',      name: 'type',    inputValue: 'command'},
                    ],
                    listeners   : {
                       change  : 'rgrpChange'
                    }
                },
                {
				    xtype       : 'panel',
                    layout      : 'hbox',
                    itemId      : 'hbPredefinedCommand',
                    bodyStyle   : 'background: #e0ebeb',
                    padding     : '0 10 0 10',
                    items       : [
                        {
                            xtype       : 'cmbPredefinedCommand',
                            width       : 555
                        }
                    ]       
                }, 
                {
				    xtype       : 'panel',
                    layout      : 'hbox',
                    itemId      : 'hbCommand',
                    hidden      : true,
                    disabled    : true,
                    bodyStyle   : 'background: #b5b5b5',
                    padding     : '0 10 0 10',
                    items       : [
                        {
                            xtype       : 'textfield',
                        //    fieldLabel  : i18n('sCommand'),
                            name        : "command",
                            allowBlank  : false,
                            blankText   : i18n('sSupply_a_value'),
                            labelClsExtra: 'lblRdReq',
                            flex        : 1
                        }
                    ]
                },        
                {
                    xtype       : 'checkboxgroup',
                    columns     : 4,
                    vertical    : false,
                    itemId      : 'chkGrpWeekDays',
                    items: [
                        { boxLabel: 'Monday',   name: 'mo', inputValue: '1',   checked: true },
                        { boxLabel: 'Tuesday',  name: 'tu', inputValue: '1',   checked: true },
                        { boxLabel: 'Wednesday',name: 'we', inputValue: '1',   checked: true },
                        { boxLabel: 'Thursday', name: 'th', inputValue: '1',   checked: true },
                        { boxLabel: 'Friday',   name: 'fr', inputValue: '1',   checked: true },
                        { boxLabel: 'Saturday', name: 'sa', inputValue: '1',   checked: true },
                        { boxLabel: 'Sunday',   name: 'su', inputValue: '1',   checked: true }
                    ]
                },                             
                {
                    xtype       : 'slider',
                    width       : 500,
                    itemId      : 'slideTime',
                    value       : 0,
                    increment   : 5,
                    minValue    : 0,
                    maxValue    : 1439,
                    constrainThumbs: true,
                    fieldLabel  : "Time",
                    useTips     : true,
                    html        : '<h1>Place Holder</h1>',
                    name        : 'event_time',
                    listeners   : {
                        change  : 'onTimeSlideChange'
                    },
                    tipText     : 'onTipText'
                },
                {
                    xtype       : 'component',
                    itemId      : 'cmpTimeDisplay',
                    tpl         : '<div class="fieldBlue"><b>Time Of Event :</b> {start_time} <b></div>',
                    data        : {start_time : '00:00'},
                    padding     : '0 10 0 10',
                }		
            ]
        });
        
        me.items = frmData;
        me.callParent(arguments);
    }
});
