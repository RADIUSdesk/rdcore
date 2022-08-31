Ext.define('Rd.view.dynamicDetails.winDynamicDetailTransKeyDel', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winDynamicDetailTransKeyDel',
    closable    : true,
    title       : 'Delete Key',
    width       : 450,
    height      : 400,
    plain       : true,
    border      : false,
    layout      : 'card',
    glyph       : Rd.config.icnDelete,
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
        var me = this;
        //A form which allows the user to select
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
                }                
            ],
            buttons: [
                {
                    itemId      : 'save',
                    formBind    : true,
                    text        : 'DELETE',
                    scale       : 'large',
                    glyph       : Rd.config.icnDelete,
                    margin      : Rd.config.buttonMargin,
                    ui          : 'button-teal'
                }
            ]
        });
        return pnlFrm;
    }
});
