Ext.define('Rd.view.profiles.winComponentManage', {
    extend  : 'Ext.window.Window',
    alias   : 'widget.winComponentManage',
    title   : i18n('sEdit_profile'),
    layout  : 'fit',
    autoShow: false,
    width   : 450,
    height  : 400,
    glyph   : Rd.config.icnEdit,
    initComponent: function() {
        var me = this;
        
        var dd      = Ext.getApplication().getDashboardData();
        var root    = false;
        if(dd.isRootUser){
            root = true   
        }
        
        var hide_system = true;
        if(root){
            hide_system = false;
        }  
             
        this.items = [
            {
                xtype: 'form',
                border:     false,
                layout:     'anchor',
                autoScroll: true,
                defaults: {
                    anchor: '100%'
                },
                fieldDefaults: {
                    msgTarget   : 'under',
                    labelClsExtra: 'lblRd',
                    labelAlign  : 'left',
                    labelSeparator: '',
                    labelWidth  : Rd.config.labelWidth,
                    maxWidth    : Rd.config.maxWidth, 
                    margin      : Rd.config.fieldMargin   
                },
                defaultType: 'textfield',
                items: [
                	{
                        xtype       : 'checkbox',      
                        fieldLabel  : 'System Wide',
                        name        : 'for_system',
                        hidden      : hide_system,
                        disabled    : hide_system
                    },
                    {
                        xtype       : 'radiogroup',
                        columns     : 2,
                        vertical    : false,
                        items: [
                            { boxLabel: i18n('sAdd_component'),                     name: 'rb',     inputValue: 'add', checked: true },
                            { boxLabel: i18n('sRemove_component'),                  name: 'rb',     inputValue: 'remove'}
                        ]
                    },
                    {
                        xtype: 'combo',
                        fieldLabel: i18n('sProfile_component'),
                        store: 'sProfileComponents',
                        queryMode: 'local',
                        editable: false,
                        allowBlank: false,
                        disabled: false,
                        name: 'component_id',
                        displayField: 'name',
                        valueField: 'id'
                    },
                    {
                        xtype: 'numberfield',
                        anchor: '100%',
                        name: 'priority',
                        fieldLabel: 'Priority <br><small><i>(Higher takes priority)</i></small>',
                        value: 5,
                        maxValue: 5,
                        minValue: 1,
                        itemId: 'priority'
                    }
                ],
                buttons: [
                    {
                        itemId: 'save',
                        text: i18n('sOK'),
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
