Ext.define('Rd.view.hardwares.winHardwareAdd', {
    extend:     'Ext.window.Window',
    alias :     'widget.winHardwareAdd',
    closable:   true,
    draggable:  true,
    resizable:  true,
    title:      'New Hardware',
    width:      500,
    height:     450,
    plain:      true,
    border:     false,
    layout:     'fit',
    glyph: Rd.config.icnAdd,
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
                    xtype       : 'displayfield',
                    fieldLabel  : 'Cloud',
                    value       : me.cloudName,
                    labelClsExtra: 'lblRdReq'
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
                    fieldLabel  : 'Vendor',
                    name        : "vendor",
                    allowBlank  : false,
                    labelClsExtra: 'lblRdReq'
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'Model',
                    name        : "model",
                    allowBlank  : false,
                    labelClsExtra: 'lblRdReq'
                }, 
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'Firmware ID',
                    name        : "fw_id",
                    allowBlank  : false,
                    labelClsExtra: 'lblRdReq'
                }, 
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'WAN Port',
                    name        : "wan",
                    allowBlank  : false,
                    labelClsExtra: 'lblRdReq'
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'LAN Port',
                    name        : "lan",
                    labelClsExtra: 'lblRd'
                },  
                {
                    xtype       : 'checkbox',      
                    boxLabel    : 'For Mesh',
                    name        : 'for_mesh',
                    inputValue  : 'for_mesh',
                    checked     : true,
                    cls         : 'lblRd'
                },
                {
                    xtype       : 'checkbox',      
                    boxLabel    : 'For AP',
                    name        : 'for_ap',
                    inputValue  : 'for_ap',
                    checked     : true,
                    cls         : 'lblRd'
                },
                {
                    xtype       : 'checkbox',      
                    boxLabel    : 'System Wide',
                    name        : 'for_system',
                    inputValue  : 'for_system',
                    cls         : 'lblRd',
                    hidden      : hide_system,
                    disabled    : hide_system
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
