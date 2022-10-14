Ext.define('Rd.view.nas.pnlNasDynamic', {
    extend  : 'Ext.panel.Panel',
    alias   : 'widget.pnlNasDynamic',
    border  : false,
    nas_id  : null,
    url     : null,
    layout: 'hbox',
    bodyStyle: {backgroundColor : Rd.config.panelGrey },
    items   :  {
        xtype   : 'panel',
        frame   : true,
        height  : '100%', 
        width   :  400,
        layout  : 'fit',
        items   : { 
            xtype   :  'form', 
            layout  : 'anchor',
            autoScroll:true,
            frame   : false,
            defaults    : {
                anchor: '100%'
            },
            fieldDefaults: {
                msgTarget: 'under',
                labelClsExtra: 'lblRd',
                labelAlign: 'left',
                labelSeparator: '',
                margin: Rd.config.fieldMargin,
                labelWidth: Rd.config.labelWidth
            },
            tbar: [
                { xtype: 'tbtext', text: i18n('sUnique_AVP_combination'), cls: 'lblWizard' }
            ],
            items:[
                {
                    xtype: 'combo',
                    fieldLabel: i18n('sAttribute'),
                    labelSeparator: '',
                    store: 'sDynamicAttributes',
                    queryMode: 'local',
                    valueField: 'id',
                    displayField: 'name',
                    allowBlank: false,
                    editable: false,
                    mode: 'local',
                    itemId: 'dynamic_attribute',
                    name: 'dynamic_attribute'
                },
                {
                    itemId      : 'dynamic_value',
                    xtype       : 'textfield',
                    fieldLabel  : i18n('sValue'),
                    name        : 'dynamic_value',
                    allowBlank  : false,
                    blankText   : i18n('sValue_to_identify_the_NAS_with'),
                    labelClsExtra: 'lblRdReq'
                } 
            ],
            buttons: [
                {
                    itemId: 'save',
                    formBind: true,
                    text: i18n('sSave'),
                    scale: 'large',
                    iconCls: 'b-save',
                    glyph: Rd.config.icnYes,
                    margin: Rd.config.buttonMargin
                }
            ]
        }
    },
    initComponent: function(){
        var me = this;
        me.callParent(arguments);
    }
});
