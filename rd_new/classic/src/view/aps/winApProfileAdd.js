Ext.define('Rd.view.aps.winApProfileAdd', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winApProfileAdd',
    closable    : true,
    draggable   : false,
    resizable   : false,
    title       : 'New Access Point Profile',
    width       : 400,
    height      : 300,
    plain       : true,
    border      : false,
    layout      : 'fit',
    glyph       : Rd.config.icnAdd,
    autoShow    : false,
    defaults    : {
        border: false
    },
    requires    : [
        'Rd.view.components.btnDataNext'
    ],
    initComponent: function() {
        var me          = this;
        var scrnData    = me.mkScrnData();
        me.items = [
            scrnData
        ];  
        this.callParent(arguments);
    },
    mkScrnData: function(){
        var me      = this;
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
                maxWidth        : Rd.config.maxWidth, 
                margin          : Rd.config.fieldMargin
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
                    fieldLabel  : i18n("sName"),
                    name        : "name",
                    allowBlank  : false,
                    blankText   : i18n("sSupply_a_value"),
                    labelClsExtra: 'lblRdReq'
                }
            ],
            buttons: [
                { xtype : 'btnDataNext' }
            ]
        });
        return frmData;
    }   
});
