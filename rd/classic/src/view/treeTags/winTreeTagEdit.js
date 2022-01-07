Ext.define('Rd.view.treeTags.winTreeTagEdit', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winTreeTagEdit',
    title       : 'Edit Tree Tag',
    closable    : true,
    draggable   : true,
    resizable   : true,
    border      : false,
    layout      : 'fit',
    autoShow    : false,
    width       : 450,
    height      : 450,
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
                        xtype:  'hiddenfield',
                        name:   'id',
                        hidden: true
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
