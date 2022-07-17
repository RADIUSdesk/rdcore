Ext.define('Rd.view.topUps.winTopUpEdit', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winTopUpEdit',
    closable    : true,
    draggable   : true,
    resizable   : true,
    title       : 'Edit TopUp',
    width       : 500,
    height      : 400,
    plain       : true,
    border      : false,
    layout      : 'card',
    glyph       : Rd.config.icnEdit,
    autoShow    : false,
    defaults    : {
            border: false
    },
    comment     : '',
    requires: [
        'Ext.layout.container.Card',
        'Ext.form.Panel',
        'Ext.form.field.Text',
        'Ext.form.FieldContainer',
        'Rd.view.components.cmbPermanentUser'
    ],
    initComponent: function() {
        var me          = this;
        var scrnData    = me.mkScrnData();
        me.items = [
            scrnData
        ];  
        this.callParent(arguments);
        me.getLayout().setActiveItem(scrnData);
    },
    //_______ Data for profile  _______
    mkScrnData: function(){
        var me      = this;
        var value   = 0;
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
            hidden          : true,
            disabled        : true,
            allowBlank      : false,
            forceSelection  : true
        });
        
        
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
        

        if(me.data > 0){
            cmbType.select(cmbType.getStore().getAt(0));
            var i           = -1;
            fileSizeInBytes = me.data;
            do {
                fileSizeInBytes = fileSizeInBytes / 1024;
                i++;
            } while (fileSizeInBytes >= 1024);
            var index = i-1;
            cmbDataUnit.select(cmbDataUnit.getStore().getAt(index));
            value = fileSizeInBytes;
            cmbDataUnit.setVisible(true);
            cmbDataUnit.setDisabled(false);
        }

        if(me.time > 0){
            cmbType.select(cmbType.getStore().getAt(1));
            if(me.time > 86400){
                value = me.time / 86400;
                cmbTimeUnit.select(cmbTimeUnit.getStore().getAt(2));
            }else{
                if(me.time > 3600){
                    value = me.time / 3600;
                    cmbTimeUnit.select(cmbTimeUnit.getStore().getAt(1));
                }else{
                    value = me.time / 60;
                    cmbTimeUnit.select(cmbTimeUnit.getStore().getAt(0));
                }
            }
            cmbTimeUnit.setVisible(true);
            cmbTimeUnit.setDisabled(false);
        }

        if(me.days_to_use > 0){
            cmbType.select(cmbType.getStore().getAt(2));
            value = me.days_to_use;
        }
     
        //---


        var buttons = [
            {
                itemId  : 'save',
                text    : i18n('sOK'),
                scale   : 'large',
                glyph   : Rd.config.icnYes,
                formBind: true,
                margin  : Rd.config.buttonMargin
            }
        ];

        var frmData = Ext.create('Ext.form.Panel',{
            border:     false,
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
                    xtype       : 'textfield',
                    name        : "id",
                    itemId      : 'topUpId',
                    hidden      : true
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'Type',
                    name        : 'type',
                    itemId      : 'dispType',
                    editable    : false
                },
                {
                    xtype       : 'displayfield',
                    fieldLabel  : 'Permanet User',
                    name        : 'permanent_user'
                },
                {
                    xtype       : 'numberfield',
                    name        : 'value',
                    fieldLabel  : 'Amount',
                    value       : value,
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
                    labelClsExtra: 'lblRd',
                    value       : me.comment
                }
            ],
            buttons: buttons
        });
        return frmData;
    }   
});
