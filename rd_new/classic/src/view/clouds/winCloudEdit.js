Ext.define('Rd.view.clouds.winCloudEdit', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winCloudEdit',
    title       : 'Edit Cloud',
    closable    : true,
    draggable   : true,
    resizable   : true,
    border      : false,
    layout      : 'fit',
    autoShow    : false,
    width       : 450,
    height      : 350,
    glyph       : Rd.config.icnEdit,
    initComponent: function() {
        var me = this;
        this.items = [
            {
                xtype: 'form',
                fieldDefaults: {
                    msgTarget: 'under',
                    labelClsExtra: 'lblRd',
                    labelAlign: 'left',
                    labelSeparator: '',
                    margin: 15
                },
                defaults: {
                    anchor: '100%'
                },
                defaultType: 'textfield',
                items: [
                     {
                        xtype:  'hiddenfield',
                        name:   'parent_id',
                        hidden: true
                    },
                    {
                        xtype       :  'hiddenfield',
                        name        :   'id',
                        hidden      : true
                    },
                    {
                        xtype       : 'textfield',
                        fieldLabel  : 'Name',
                        name        : 'name',
                        allowBlank  :false,
                        blankText   : i18n('sEnter_a_value'),
                        labelClsExtra: 'lblRdReq'
                    },
                    {
                        xtype       : 'textfield',
                        grow        : true,
                        name        : 'lat',
                        fieldLabel  : 'Lat'
                    },
                    {
                        xtype       : 'textfield',
                        grow        : true,
                        name        : 'lng',
                        fieldLabel  : 'Lng'
                    },
                    {
                        xtype       : 'checkbox',      
                        boxLabel    : i18n('sAlso_show_to_sub_providers'),
                        name        : 'available_to_siblings',
                        inputValue  : 'available_to_siblings',
                        itemId      : 'a_to_s',
                        checked     : false,
                        cls         : 'lblRd',
                        hidden      : me.hide_a_to_s
                    }
                   ],
                buttons: [
                    {
                        itemId: 'save',
                        text    : i18n('sSave'),
                        scale: 'large',
                        iconCls: 'b-next',
                        glyph: Rd.config.icnNext,
                        margin: '0 20 40 0'
                    }
                ]
            }
        ];
        this.callParent(arguments);
    }
});
