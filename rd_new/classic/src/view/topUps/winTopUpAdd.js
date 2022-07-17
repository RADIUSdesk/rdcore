Ext.define('Rd.view.topUps.winTopUpAdd', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winTopUpAdd',
    closable    : true,
    draggable   : true,
    resizable   : true,
    title       : 'New TopUp',
    width       : 500,
    height      : 450,
    plain       : true,
    border      : false,
    layout      : 'fit',
    glyph       : Rd.config.icnAdd,
    autoShow    : false,
    defaults    : {
            border: false
    },
    requires: [
		'Ext.form.Panel',
		'Ext.form.field.Text',
		'Ext.form.FieldContainer'
    ],
    initComponent: function() {
        var me 			= this;
        var scrnData   	= me.mkScrnData();
        me.items = [
            scrnData
        ];  
        this.callParent(arguments);
    },

    //_______ Data _______
    mkScrnData: function(){
        var me      = this;
        //----
        var types = Ext.create('Ext.data.Store', {
            fields: ['id', 'name'],
            data : [
                {"id":"data",           "name":"Data"},
                {"id":"time",           "name":"Time"},
                {"id":"days_to_use",    "name":"Days to use"}
            ]
        });

        // Create the combo box, attached to the states data store
        var cmbType = Ext.create('Ext.form.ComboBox', {
            fieldLabel      : 'Type',
            store           : types,
            queryMode       : 'local',
            displayField    : 'name',
            valueField      : 'id',
            name            : 'type',
            itemId          : 'cmbType',
            labelClsExtra   : 'lblRdReq',
            allowBlank      : false,
            forceSelection  : true
        });
        cmbType.select(cmbType.getStore().getAt(0));

        var dataUnit = Ext.create('Ext.data.Store', {
            fields: ['id', 'name'],
            data : [
                {"id":"mb",  "name":"MB"},
                {"id":"gb",  "name":"GB"}
            ]
        });

        // Create the combo box, attached to the states data store
        var cmbDataUnit = Ext.create('Ext.form.ComboBox', {
            fieldLabel      : 'Unit',
            store           : dataUnit,
            queryMode       : 'local',
            displayField    : 'name',
            valueField      : 'id',
            name            : 'data_unit',
            itemId          : 'cmbDataUnit',
            labelClsExtra   : 'lblRdReq',
            allowBlank      : false,
            forceSelection  : true
        });
        cmbDataUnit.select(cmbDataUnit.getStore().getAt(0));

        var timeUnit = Ext.create('Ext.data.Store', {
            fields: ['id', 'name'],
            data : [
                {"id":"minutes",  "name":"Minutes"},
                {"id":"hours",    "name":"Hours"},
                {"id":"days",     "name":"Days"}
            ]
        });

        // Create the combo box, attached to the states data store
        var cmbTimeUnit = Ext.create('Ext.form.ComboBox', {
            fieldLabel      : 'Unit',
            store           : timeUnit,
            queryMode       : 'local',
            displayField    : 'name',
            valueField      : 'id',
            name            : 'time_unit',
            itemId          : 'cmbTimeUnit',
            hidden          : true,
            disabled        : true,
            labelClsExtra   : 'lblRdReq',
            allowBlank      : false,
            forceSelection  : true
        });

        cmbTimeUnit.select(cmbTimeUnit.getStore().getAt(0));
        //---
        var frmData = Ext.create('Ext.form.Panel',{
            border: 	false,
            layout:     'anchor',
            itemId:     'scrnData',
            autoScroll: true,
            defaults: {
                anchor: '100%'
            },
            fieldDefaults: {
                msgTarget       : 'under',
                labelClsExtra   : 'lblRd',
                labelAlign      : 'left',
                labelSeparator  : '',
                labelWidth      : Rd.config.labelWidth,
                margin          : Rd.config.fieldMargin
            },
            defaultType: 'textfield',
            items:[
                {
                    itemId      : 'owner',
                    xtype       : 'displayfield',
                    fieldLabel  : 'Cloud',
                    value       : me.cloudName,
                    labelClsExtra: 'lblRdReq'
                },
                {
                    xtype       : 'cmbPermanentUser',
                    allowBlank  : false,
                    labelClsExtra: 'lblRdReq',
                    itemId      : 'permanent_user_id',
                    fieldLabel  : 'Permanent user',
                    name        : 'permanent_user_id'                  
                },
                cmbType,
                {
                    xtype       : 'numberfield',
                    name        : 'value',
                    fieldLabel  : 'Amount',
                    value       : 1,
                    maxValue    : 1000,
                    minValue    : 1,
                    labelClsExtra: 'lblRdReq',
                    allowBlank  : false,
                    itemId      : 'txtAmount'
                },
                cmbDataUnit,
                cmbTimeUnit,
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'Comment',
                    name        : "comment",
                    blankText   : i18n('sSupply_a_value'),
                    labelClsExtra: 'lblRd'
                }
            ],
            buttons: [
		        {
		            itemId  : 'btnSave',
		            text    : i18n('sOK'),
		            scale   : 'large',
		            glyph   : Rd.config.icnYes,
		            formBind: true,
		            margin  : Rd.config.buttonMargin
		        }
		    ]
        });
        return frmData;
    }   
});
