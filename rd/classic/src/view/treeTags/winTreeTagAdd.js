Ext.define('Rd.view.treeTags.winTreeTagAdd', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winTreeTagAdd',
    closable    : true,
    draggable   : true,
    resizable   : true,
    border      : false,
    title       : 'Add Tree Tag',
    layout      : 'fit',
    autoShow    : false,
    width       : 450,
    height      : 500,
    glyph       : Rd.config.icnAdd,
    parentId    : undefined,
    parentDisplay: undefined,
    initComponent: function() {

        var me  = this;
        me.items = [
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
                items: [
                    {
                        itemId  : 'parent_id',
                        xtype   : 'textfield',
                        name    : 'parent_id',
                        hidden  : true,
                        value   : me.parentId
                    },
                    {
                        xtype       : 'displayfield',
                        fieldLabel  : i18n('sParent_node'),
                        value       : me.parentDisplay,
                        labelClsExtra: 'lblRdReq'
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
                        name        : 'center_lat',
                        fieldLabel  : 'Center Lat'
                    },
                    {
                        xtype       : 'textfield',
                        grow        : true,
                        name        : 'center_lng',
                        fieldLabel  : 'Center Lng'
                    },
                    {
                        xtype       : 'textfield',
                        grow        : true,
                        name        : 'kml_file',
                        fieldLabel  : 'KML File'
                    },
                    {
                        xtype       : 'textareafield',
                        grow        : true,
                        name        : 'comment',
                        fieldLabel  : 'Optional Comment'
                    }],
                 buttons : [
                    {
                        text        : i18n('sSave'),
                        scale       : 'large',
                        action      : 'save',
                        itemId      : 'save',
                        glyph       : Rd.config.icnNext,
                        formBind    : true,
                        margin      : '0 20 40 0'
                    }
                ]
            }
        ];
        this.callParent(arguments);
    }
});
