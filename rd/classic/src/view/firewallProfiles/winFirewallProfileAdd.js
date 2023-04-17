Ext.define('Rd.view.firewallProfiles.winFirewallProfileAdd', {
    extend:     'Ext.window.Window',
    alias :     'widget.winFirewallProfileAdd',
    closable:   true,
    draggable:  true,
    resizable:  true,
    title:      'New Firewall Profile',
    width:      400,
    height:     300,
    plain:      true,
    border:     false,
    layout:     'fit',
    glyph: Rd.config.icnAdd,
    autoShow:   false,
    defaults: {
            border: false
    },
    requires: [
       
    ],
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
                }
            ],
            buttons: [
                {
                    itemId: 'btnDataNext',
                    text: i18n('sNext'),
                    scale: 'large',
                    iconCls: 'b-next',
                    glyph: Rd.config.icnNext,
                    formBind: true,
                    margin: '0 20 40 0'
                }
            ]
        });
        return frmData;
    }   
});
