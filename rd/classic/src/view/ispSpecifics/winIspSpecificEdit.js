Ext.define('Rd.view.ispSpecifics.winIspSpecificEdit', {
    extend:     'Ext.window.Window',
    alias :     'widget.winIspSpecificEdit',
    closable:   true,
    draggable:  true,
    resizable:  true,
    title:      'Edit ISP Specific',
    width:      500,
    height:     500,
    plain:      true,
    border:     false,
    layout:     'fit',
    glyph: Rd.config.icnEdit,
    autoShow:   false,
    root : false,
    defaults: {
            border: false
    },
    requires: [
        'Ext.form.Panel',
        'Ext.form.field.Text',
        'Ext.form.FieldContainer'
    ],
    initComponent: function() {
        var me = this;
        var scrnData        = me.mkScrnData();
        me.items = [
            scrnData
        ];  
        this.callParent(arguments);
    },
    //_______ Data for ssids  _______
    mkScrnData: function(){        
        var me      = this;

        var hide_system = true;
        if(me.root){
            hide_system = false;
        }

        var frmData = Ext.create('Ext.form.Panel',{
            border      : false,
            layout      : 'anchor',
            itemId      : 'scrnData',
            autoScroll  : true,
            defaults    : {
                anchor: '100%'
            },
            fieldDefaults: {
                msgTarget: 'under',
                labelClsExtra: 'lblRd',
                labelAlign: 'left',
                labelSeparator: '',
                margin: 15
            },
            defaultType: 'textfield',
            items:[
            	 {
                    xtype       : 'textfield',
                    name        : 'id',
                    hidden		: true
                },             
                {
                    xtype       : 'textfield',
                    fieldLabel  : i18n('sName'),
                    name        : "name",
                    allowBlank  : false,
                    labelClsExtra: 'lblRdReq'
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'Region',
                    name        : "region",
                    allowBlank  : false,
                    labelClsExtra: 'lblRdReq'
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'Field1',
                    name        : "field1",
                    allowBlank  : false,
                    labelClsExtra: 'lblRdReq'
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'Field2',
                    name        : "field2",
                    allowBlank  : false,
                    labelClsExtra: 'lblRdReq'
                },  
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'Field3',
                    name        : "field3",
                    allowBlank  : false,
                    labelClsExtra: 'lblRdReq'
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'Field4',
                    name        : "field4",
                    allowBlank  : false,
                    labelClsExtra: 'lblRdReq'
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
