Ext.define('Rd.view.profileComponents.winProfileComponentAdd', {
    extend:     'Ext.window.Window',
    alias :     'widget.winProfileComponentAdd',
    closable:   true,
    draggable:  false,
    resizable:  false,
    title:      'New Profile Component',
    width:      400,
    height:     320,
    plain:      true,
    border:     false,
    layout:     'fit',
    iconCls:    'add',
    glyph: Rd.config.icnAdd,
    autoShow:   false,
    defaults: {
            border: false
    },
    requires: [
        'Rd.view.components.btnDataNext'
    ],
    root	: false,
    initComponent: function() {
        var me = this;
        var scrnData        = me.mkScrnData();
        me.items = [
            scrnData
        ];  
        me.callParent(arguments);
    },

    //_______ Data for component  _______
    mkScrnData: function(){
        var me      	= this;
        var hide_system = true;
        if(me.root){
            hide_system = false;
        }
        var frmData = Ext.create('Ext.form.Panel',{
            border:     false,
            layout:     'anchor',
            itemId:     'scrnData',
            autoScroll: true,
            defaults: {
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
                    blankText   : i18n('sSupply_a_value'),
                    labelClsExtra: 'lblRdReq'
                },
                {
                    xtype       : 'checkbox',      
                    boxLabel    : 'System Wide',
                    name        : 'for_system',
                    inputValue  : 'for_system',
                    boxLabelCls	: 'boxLabelRd', 
                    hidden      : hide_system,
                    disabled    : hide_system
                }
            ],
            buttons:  [
                { xtype : 'btnDataNext' }
            ]
        });
        return frmData;
    }
    
});
