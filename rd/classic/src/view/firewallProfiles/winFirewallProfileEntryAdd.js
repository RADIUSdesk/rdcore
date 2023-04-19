Ext.define('Rd.view.firewallProfiles.winFirewallProfileEntryAdd', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winFirewallProfileEntryAdd',
    closable    : true,
    draggable   : true,
    resizable   : true,
    title       : 'Add Firewall Profile Entry',
    width       : 600,
    height      : 500,
    plain       : true,
    border      : false,
    layout      : 'fit',
    glyph       : Rd.config.icnAdd,
    autoShow    : false,
    firewall_profile_id : '',
    firewall_profile_name : '',
    defaults: {
            border: false
    },
    requires: [
        'Ext.form.Panel',
        'Ext.form.field.Text',
        'Rd.view.firewallProfiles.vcFirewallProfileEntry',
        'Rd.view.firewallProfiles.cmbFwCategories'
    ],
    controller  : 'vcFirewallProfileEntry',
    initComponent: function() {
        var me 		= this; 
        me.setTitle('Add Firewall Profile Entry For '+me.firewall_profile_name);
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
                    name    : 'firewall_profile_id',
                    value   : me.firewall_profile_id,
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
                    fieldLabel  : 'Action',
                    labelClsExtra: 'lblRd',
                    layout: {
						type	: 'hbox',
						align	: 'middle',
						pack	: 'stretchmax',
						padding	: 0,
						margin	: 0
					},
                    defaultType: 'button',
    				defaults: {
						enableToggle: true,
						toggleGroup: 'action',
						allowDepress: false,					
					},             
                    items: [
						{ text: 'Block', 		glyph: Rd.config.icnBan,   flex:1, ui : 'default-toolbar', 'margin' : '0 5 0 0' },
						{ text: 'Allow', 		glyph: Rd.config.icnStart, flex:1, ui : 'default-toolbar', 'margin' : '0 5 0 5' },
						{ text: 'Speed Limit', 	glyph: Rd.config.icnMeter, flex:1, ui : 'default-toolbar', 'margin' : '0 0 0 5' }
					],
                    listeners   : {
                       change  : 'rgrpChange'
                    }
                },
                {
                	xtype	: 'cmbFwCategories'
                },
                
                {
                    xtype       : 'radiogroup',
                    fieldLabel  : 'Schedule',
                    labelClsExtra: 'lblRd',
                    layout: {
						type	: 'hbox',
						align	: 'middle',
						pack	: 'stretchmax',
						padding	: 0,
						margin	: 0
					},
                    defaultType: 'button',
    				defaults: {
						enableToggle: true,
						toggleGroup: 'schedule',
						allowDepress: false,					
					},             
                    items: [
						{ text: 'Always', 	flex:1, ui : 'default-toolbar', 'margin' : '0 5 0 0' },
						{ text: 'Specify',  flex:1, ui : 'default-toolbar', 'margin' : '0 0 0 5' }
					],
                    listeners   : {
                       change  : 'rgrpChange'
                    }
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
                    xtype       : 'multislider',
                    width       : 500,
                    itemId      : 'slideTime',
                    values		: [25, 50],
                    increment   : 5,
                    minValue    : 0,
                    maxValue    : 1439,
                    constrainThumbs: true,
                    fieldLabel  : "Start & End",
                    useTips     : true,
                    html        : '<h1>Place Holder</h1>',
                    name        : 'event_time',
                    listeners   : {
                       // change  : 'onTimeSlideChange'
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
