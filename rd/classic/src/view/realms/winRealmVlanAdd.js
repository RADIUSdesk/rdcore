Ext.define('Rd.view.realm.winRealmVlanAdd', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winRealmVlanAdd',
    closable    : true,
    draggable   : true,
    resizable   : true,
    title       : 'Add VLAN(s)',
    width       : 500,
    height      : 450,
    plain       : true,
    border      : false,
    layout      : 'fit',
    glyph       : Rd.config.icnAdd,
    autoShow    :   false,
    defaults: {
            border: false
    },
    requires: [
    ],
    initComponent: function() {
        var me      = this;
                    
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
                margin          : Rd.config.fieldMargin,
                labelWidth		: 150
            },
            defaultType: 'textfield',
            buttons: [
                {
                    itemId      : 'save',
                    formBind    : true,
                    text        : 'SAVE',
                    scale       : 'large',
                    glyph       : Rd.config.icnYes,
                    margin      : Rd.config.buttonMargin,
                    ui          : 'button-teal'
                }
            ],
            items: [
                 {
                    name        : 'realm_id',
                    xtype       : 'textfield',
                    hidden      : true,
                    value       : me.realm_id
                },    
                {
                    xtype   : 'radiogroup',
                    columns : 2,
                    items: [
                        { boxLabel: 'Range', name: 'action', inputValue: 'range', checked: true },
                        { boxLabel: 'Single',name: 'action', inputValue: 'single'}
                    ]
                },
                {
                    xtype           : 'numberfield',
                    fieldLabel      : 'Start',
                    name            : 'vlan_start',
                    itemId          : 'nrRangeStart',
                    value           : 1,
                    maxValue        : 4095,
                    step            : 1,
                    minValue        : 1,
                    labelClsExtra   : 'lblRdReq',
                    allowBlank      : false,
                    hideTrigger     : true,
                    keyNavEnabled   : false,
                    mouseWheelEnabled: false              
                },
                {
                    xtype           : 'numberfield',
                    fieldLabel      : 'End',
                    name            : 'vlan_end',
                    itemId          : 'nrRangeEnd',
                    value           : 2,
                    maxValue        : 4096,
                    step            : 1,
                    minValue        : 2,
                    labelClsExtra   : 'lblRdReq',
                    allowBlank      : false,
                    hideTrigger     : true,
                    keyNavEnabled   : false,
                    mouseWheelEnabled: false              
                },
                {
                    xtype           : 'numberfield',
                    fieldLabel      : 'VLAN',
                    name            : 'vlan',
                    itemId          : 'nrVlan',
                    value           : 1,
                    maxValue        : 4096,
                    step            : 1,
                    minValue        : 1,
                    labelClsExtra   : 'lblRdReq',
                    allowBlank      : false,
                    hideTrigger     : true,
                    keyNavEnabled   : false,
                    mouseWheelEnabled: false              
                },
                {
                    name        : 'name',
                    xtype       : 'textfield',
                    fieldLabel  : 'Name',
                    itemId      : 'txtName',
                    allowBlank  : true,
                    labelClsExtra   : 'lblRd'
                },
                {
                    name        : 'comment',
                    xtype       : 'textfield',
                    fieldLabel  : 'Comment',
                    itemId      : 'txtComment',
                    allowBlank  : true,
                    labelClsExtra   : 'lblRd'
                }       
            ]
        });
        me.items = frmData; 
        me.callParent(arguments);     
    }
});
