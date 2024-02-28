Ext.define('Rd.view.homeServerPools.winHomeServerPoolAdd', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winHomeServerPoolAdd',
    closable    : true,
    draggable   : true,
    resizable   : true,
    title       : 'New RADIUS Proxy',
    width       : 500,
    height      : 470,
    plain       : true,
    border      : false,
    layout      : 'fit',
    glyph       : Rd.config.icnAdd,
    autoShow    : false,
    defaults    : {
            border  : false
    },
    requires: [
        'Rd.view.components.btnDataNext'
    ],
    requires: [
        'Ext.form.Panel',
        'Ext.form.field.Text',
        'Ext.form.FieldContainer'
    ],
    initComponent: function() {
        var me          = this;
        var scrnData    = me.mkScrnData();
        me.items = [
            scrnData
        ];  
        me.callParent(arguments);
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
                margin      : Rd.config.fieldMargin,
                labelWidth  : Rd.config.labelWidth
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
                    xtype       	: 'textfield',
                    fieldLabel  	: 'IP Address',
                    name        	: 'ipaddr',
                    allowBlank  	: false,
                    blankText   	: i18n('sSupply_a_value'),
                    labelClsExtra	: 'lblRdReq',
					vtype			: 'IPAddress'
                },
                {
                    xtype       	: 'textfield',
                    fieldLabel  	: 'Port',
                    name        	: 'port',
                    value           : 1812,
                    allowBlank  	: false,
                    blankText   	: i18n('sSupply_a_value'),
                    labelClsExtra	: 'lblRdReq',
					vtype			: 'Numeric'
                },
                {
                    xtype       	: 'textfield',
                    fieldLabel  	: 'Secret',
                    name        	: 'secret',
                    allowBlank  	: false,
                    blankText   	: i18n('sSupply_a_value'),
                    labelClsExtra	: 'lblRdReq'
                },
                {
                    xtype       : 'checkbox',      
                    fieldLabel  : 'System Wide',
                    name        : 'for_system',
                    inputValue  : 'for_system',
                    hidden      : hide_system,
                    disabled    : hide_system
                }               
            ],
            buttons: [{ xtype : 'btnDataNext' }]
        });
        return frmData;
    }   
});
