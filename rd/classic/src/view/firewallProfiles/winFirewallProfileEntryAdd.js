Ext.define('Rd.view.firewallProfiles.winFirewallProfileEntryAdd', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winFirewallProfileEntryAdd',
    closable    : true,
    draggable   : true,
    resizable   : true,
    title       : 'Add Rule',
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
        'Rd.view.firewallProfiles.cmbFwCategories',
        'Rd.view.firewallProfiles.cmbFwSchedule',
        'Rd.view.firewallProfiles.tagFwApps'
    ],
    controller  : 'vcFirewallProfileEntry',
    initComponent: function() {
        var me 		= this; 
        me.setTitle('Add Rule For '+me.firewall_profile_name);
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
						{ text: 'Block', 		glyph: Rd.config.icnBan,   flex:1, ui : 'default-toolbar', 'margin' : '0 5 0 0', pressed: true },
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
                	xtype	: 'tagFwApps'
                },
                {
                	xtype	: 'cmbFwSchedule'
                },              
                {
                    xtype       : 'checkboxgroup',
                    columns     : 7,
                    vertical    : false,
                    hidden		: true,
                    itemId      : 'chkGrpWeekDays',
                    items: [
                        { boxLabel: 'Mo',   name: 'mo', inputValue: '1',   checked: true },
                        { boxLabel: 'Tu',  	name: 'tu', inputValue: '1',   checked: true },
                        { boxLabel: 'We',	name: 'we', inputValue: '1',   checked: true },
                        { boxLabel: 'Th', 	name: 'th', inputValue: '1',   checked: true },
                        { boxLabel: 'Fr',   name: 'fr', inputValue: '1',   checked: true },
                        { boxLabel: 'Sa', 	name: 'sa', inputValue: '1',   checked: true },
                        { boxLabel: 'Su',   name: 'su', inputValue: '1',   checked: true }
                    ]
                },
                {
                    xtype       : 'slider',
                    hidden		: true,
                    width       : 500,
                    itemId      : 'sldrStart',
                    value		: 0,
                    increment   : 5,
                    minValue    : 0,
                    maxValue    : 1439,
                    constrainThumbs: true,
                    fieldLabel  : "Start Time",
                    useTips     : true,
                    html        : '<h1>Place Holder</h1>',
                    name        : 'start_time',
                    listeners   : {
                       // change  : 'onTimeSlideChange'
                    },
                    tipText     : 'onTipText'
                },
                {
                    xtype       : 'slider',
                    hidden		: true,
                    width       : 500,
                    itemId      : 'sldrEnd',
                    value		: 0,
                    increment   : 5,
                    minValue    : 0,
                    maxValue    : 1439,
                    constrainThumbs: true,
                    fieldLabel  : "End Time",
                    useTips     : true,
                    html        : '<h1>Place Holder</h1>',
                    name        : 'end_time',
                    listeners   : {
                       // change  : 'onTimeSlideChange'
                    },
                    tipText     : 'onTipText'
                },
                {
                    xtype       : 'container',
                    hidden		: true,
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