Ext.define('Rd.view.dynamicDetails.winDynamicDetailTransKeyEdit', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winDynamicDetailTransKeyEdit',
    closable    : true,
    title       : i18n('sEdit_Key'),
    width       : 450,
    height      : 400,
    plain       : true,
    border      : false,
    layout      : 'card',
    glyph       : Rd.config.icnEdit,
    dynamic_detail_id : null,  
    defaults    : {
            border: false
    },
    requires: [
        'Ext.layout.container.Card',
        'Ext.form.Panel',
        'Ext.form.field.Text',
        'Ext.form.FieldContainer',
        'Ext.form.field.Radio',
        'Rd.view.dynamicDetails.cmbDynamicDetailTransPages'
    ],
    initComponent: function() {
        var me = this;
        var scrnNewKey  = me.mkScrnNewKey();
        this.items = [
            scrnNewKey
        ];
        this.callParent(arguments);
    },
    mkScrnNewKey: function(){
        //A form which allows the user to select
        var me = this;
        var pnlFrm = Ext.create('Ext.form.Panel',{
            border: false,
            layout: 'anchor',
            width: '100%',
            flex: 1,
            defaults: {
                    anchor: '100%'
            },
            fieldDefaults: {
                msgTarget       : 'under',
                labelClsExtra   : 'lblRd',
                labelAlign      : 'top',
                labelSeparator  : '',
                margin          : 15
            },
            defaultType: 'textfield',
            items: [
                {
                    xtype       : 'textfield',
                    name        : "id",
                    hidden      : true
                },
                {
                    xtype       : 'cmbDynamicDetailTransPages',
                    value       : me.dynamic_detail_id,
                    listeners   : {
				        change      : 'onCmbDynamicDetailChangeK',
				        beforerender: 'onCmbDynamicDetailBeforeShowK'
				    }
                },
                {
                    xtype       : 'cmbDynamicTransKeys',
                    listeners   : {
				        change : 'onCmbDynamicTransKeysChangeK'
				    }
                },
                {
                    name        : 'name',
                    fieldLabel  : 'New Name For Key',
                    allowBlank  : false,
                    itemId      : 'txtName',
                    emptyText   : 'Select A Key To Edit',
                    blankText   : i18n('sSpecify_a_valid_name_for_the_key')
                }
                
            ],
            buttons: [
                {
                    itemId      : 'save',
                    formBind    : true,
                    text        : 'SAVE',
                    scale       : 'large',
                    glyph       : Rd.config.icnYes,
                    margin      : Rd.config.buttonMargin,
                    ui          : 'button-teal'
                }
            ]
        });
        return pnlFrm;
    }
});
