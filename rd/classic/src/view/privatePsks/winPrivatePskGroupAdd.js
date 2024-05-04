Ext.define('Rd.view.privatePsks.winPrivatePskGroupAdd', {
    extend:     'Ext.window.Window',
    alias :     'widget.winPrivatePskGroupAdd',
    closable:   true,
    draggable:  true,
    resizable:  true,
    title:      'New Private PSK Grouping',
    width:      400,
    height:     350,
    plain:      true,
    border:     false,
    layout      : 'fit',
    glyph       : Rd.config.icnAdd,
    autoShow    :   false,
    defaults: {
            border: false
    },
    root	: false,
    initComponent: function() {
        var me          = this;
        var scrnData    = me.mkScrnData();
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
                margin: 10
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
            buttons: [
                {
                    itemId  : 'btnSave',
                    text    : i18n('sNext'),
                    scale   : 'large',
                    glyph   : Rd.config.icnNext,
                    formBind: true,
                    margin  : '0 20 40 0'
                }
            ]
        });
        return frmData;
    }   
});
