Ext.define('Rd.view.multiWanProfiles.winMultiWanProfileAdd', {
    extend:     'Ext.window.Window',
    alias :     'widget.winMultiWanProfileAdd',
    closable:   true,
    draggable:  true,
    resizable:  true,
    title:      'New MultiWan Profile',
    width       : 550,
    height      : 550,
    plain:      true,
    border:     false,
    layout:     'fit',
    glyph: Rd.config.icnAdd,
    autoShow:   false,
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
                labelWidth		: 160
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
            ],
            buttons: [
                {
                    itemId  : 'btnAddSave',
                    text    : i18n('sSave'),
                    scale   : 'large',
                    glyph   : Rd.config.icnYes,
                    formBind: true,
                    margin  : '0 20 40 0'
                }
            ]
        });
        return frmData;
    }   
});
