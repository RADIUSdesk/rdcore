Ext.define('Rd.view.tags.winTagEdit', {
    extend: 'Ext.window.Window',
    alias : 'widget.winTagEdit',
    title : i18n('sEdit_tag_for_NAS_device'),
    layout: 'fit',
    autoShow: false,
    width:    400,
    height:   400,
    iconCls: 'edit',
    glyph   :   Rd.config.icnEdit,
    initComponent: function() {
        var me = this;
        this.items = [
            {
                xtype: 'form',
                border:     false,
                layout:     'anchor',
                itemId:     'scrnDirect',
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
                items: [
                    {
                        xtype:  'hiddenfield',
                        name:   'id',
                        hidden: true
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
                        boxLabel    : i18n('sMake_available_to_sub_providers'),
                        name        : 'available_to_siblings',
                        inputValue  : 'available_to_siblings',
                        itemId      : 'a_to_s',
                        checked     : false,
                        cls         : 'lblRd'
                    }],
                buttons: [
                    {
                        itemId: 'save',
                        text: i18n('sNext'),
                        scale: 'large',
                        iconCls: 'b-next',
                        glyph   :   Rd.config.icnNext,
                        margin: '0 20 40 0'
                    }
                ]
            }
        ];
        this.callParent(arguments);
    }
});
