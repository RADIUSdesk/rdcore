Ext.define('Rd.view.nas.winNasAdd', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winNasAdd',
    closable    : true,
    draggable   : true,
    resizable   : true,
    title       : i18n('sAdd_NAS_device'),
    width       : 500,
    height      : 450,
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
    initComponent: function() {
        var me          = this;
        var scrnData    = me.mkScrnData();
        me.items = [
            scrnData
        ];  
        me.callParent(arguments);
    },

    mkScrnData: function(){
    
        var me      = this;
        var frmData = Ext.create('Ext.form.Panel',{
            border:     false,
            layout:     'fit',
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
                margin      : Rd.config.fieldMargin,
                labelWidth  : Rd.config.labelWidth
            },
            defaultType: 'textfield',
            items:[
                {
                    xtype   : 'tabpanel',
                    layout  : 'fit',
                    xtype   : 'tabpanel',
                    margins : '0 0 0 0',
                    plain   : true,
                    tabPosition: 'bottom',
                    border  : false,
                    cls     : 'subTab',
                    items   : [
                        { 
                            title   : 'Basic',
                            layout  : 'anchor',
                            itemId  : 'tabBasic',
                            autoScroll: true,
                            defaults: {
                                anchor  : '100%'
                            },
                            items:[
                                 {
                                    xtype       : 'displayfield',
                                    fieldLabel  : 'Cloud',
                                    value       : me.cloudName,
                                    labelClsExtra: 'lblRdReq'
                                },
                                {
                                    itemId      : 'nasname',
                                    xtype       : 'textfield',
                                    fieldLabel  : i18n('sIP_Address'),
                                    name        : 'nasname',
                                    allowBlank  : false,
                                    labelClsExtra: 'lblRdReq'
                                },
                                {
                                    xtype       : 'textfield',
                                    fieldLabel  : i18n('sName'),
                                    name        : 'shortname',
                                    allowBlank  : false,
                                    blankText   : i18n("sSupply_a_value"),
                                    labelClsExtra: 'lblRdReq'
                                },
                                {
                                    xtype       : 'textfield',
                                    fieldLabel  : i18n('sSecret'),
                                    name        : 'secret',
                                    allowBlank  : false,
                                    blankText   : i18n("sSupply_a_value"),
                                    labelClsExtra: 'lblRdReq'
                                }
                            ]
                        },
                        { 
                            title   : i18n('sRealms'),
                            itemId  : 'tabRealms',
                            tbar: [{
                                xtype       : 'checkboxfield',
                                boxLabel    : i18n('sMake_available_to_any_realm'), 
                                cls         : 'lblRd',
                                itemId      : 'chkAvailForAll',
                                name        : 'available_to_all',
                                inputValue  : true
                            }],
                            layout: 'fit',
                            items: { xtype: 'gridRealmsForNas'}
                        }
                    ]
                }    
            ],
            buttons: [{ xtype : 'btnDataNext' }]
        });
        return frmData;
    }   
});
