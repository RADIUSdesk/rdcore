Ext.define('Rd.view.realms.winRealmVlanEdit', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winRealmVlanEdit',
    closable    : true,
    draggable   : true,
    resizable   : true,
    title       : 'Edit VLAN',
    width       : 500,
    height      : 450,
    plain       : true,
    border      : false,
    layout      : 'fit',
    glyph       : Rd.config.icnEdit,
    autoShow    :   false,
    defaults: {
            border: false
    },
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
                    name        : 'id',
                    xtype       : 'textfield',
                    hidden      : true,
                    value       : me.realm_vlan_id
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
        frmData.loadRecord(me.sr);     
    }
});
