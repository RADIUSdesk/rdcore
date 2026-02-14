Ext.define('Rd.view.topUps.winTopUpAdd', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winTopUpAdd',
    closable    : true,
    draggable   : true,
    resizable   : true,
    title       : 'New TopUp',
    width       : 550,
    height      : 450,
    plain       : true,
    border      : false,
    layout      : 'fit',
    glyph       : Rd.config.icnAdd,
    autoShow    : false,
    defaults    : {
            border: false,
            labelClsExtra   : 'lblRd',
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
                    labelClsExtra: 'lblRd'
                },
                {
                    xtype       : 'cmbPermanentUser',
                    allowBlank  : false,
                    labelClsExtra: 'lblRdReq',
                    itemId      : 'permanent_user_id',
                    fieldLabel  : 'Permanent user',
                    name        : 'permanent_user_id'                  
                },
                {
                    xtype       : 'radiogroup',
                    columns     : 3,             
                    vertical    : false,
                    allowBlank  : false,
                    itemId      : 'rdgType',
                    fieldLabel  : 'Type',
                    items       : [
                        {
                            boxLabel   : 'Days to use',
                            name       : 'type',
                            margin     : '0 15 0 0',
                            inputValue : 'days_to_use',
                            checked    : true 
                        },
                        {
                            boxLabel   : 'Data',
                            name       : 'type',
                            inputValue : 'data',
                            margin    : '0 15 0 15',
                            checked    : true   
                        },
                        {
                            boxLabel   : 'Time',
                            name       : 'type',
                            margin    : '0 15 0 0',
                            inputValue : 'time'
                        }                      
                    ]
                },
                {
                    xtype       : 'numberfield',
                    name        : 'value',
                    value       : 1,
                    maxValue    : 1000,
                    minValue    : 1,
                    allowBlank  : false,
                    itemId      : 'txtAmount',
                    fieldLabel  : 'Days',
                    hideTrigger : true,
                    keyNavEnabled  : false,
                    mouseWheelEnabled	: false
                },
                {
                    xtype       : 'radiogroup',
                    columns     : 3,
                    vertical    : false,
                    itemId      : 'rdgDataUnit',
                    hidden      : true,
                    disabled    : true,
                    fieldLabel  : 'Unit',
                    items       : [
                        {
                            boxLabel   : 'MB',
                            name       : 'data_unit',
                            inputValue : 'mb',
                            margin     : '0 15 0 0',
                            checked    : true   
                        },
                        {
                            boxLabel   : 'GB',
                            name       : 'data_unit',
                            margin     : '0 0 0 15',
                            inputValue : 'gb'
                        }
                    ]
                },
                {
                    xtype       : 'radiogroup',
                    columns     : 3,
                    vertical    : false,
                    itemId      : 'rdgTimeUnit',
                    hidden      : true,
                    disabled    : true,
                    fieldLabel  : 'Unit',
                    items       : [
                        {
                            boxLabel   : 'Minutes',
                            name       : 'time_unit',
                            inputValue : 'minutes',
                            margin     : '0 15 0 0',
                            checked    : true   
                        },
                        {
                            boxLabel   : 'Hours',
                            name       : 'time_unit',
                            margin     : '0 0 0 15',
                            inputValue : 'hours'
                        },
                        {
                            boxLabel   : 'Days',
                            name       : 'time_unit',
                            margin     : '0 15 0 0',
                            inputValue : 'days'
                        }
                    ]
                },
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
