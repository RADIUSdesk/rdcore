Ext.define('Rd.view.i18n.vWinKeyAdd', {
    extend:     'Ext.window.Window',
    alias :     'widget.addKeyW',
    closable:   true,
    draggable:  false,
    resizable:  false,
    title:      i18n('sAdd_Key'),
    width:      380,
    height:     380,
    plain:      true,
    border:     false,
    layout:     'card',
    iconCls:    'add',
    glyph: Rd.config.icnAdd,
    defaults: {
            border: false
    },
    requires: [
        'Ext.layout.container.Card',
        'Ext.form.Panel',
        'Ext.form.field.Text',
        'Ext.form.FieldContainer',
        'Ext.form.field.Radio'
    ],
     initComponent: function() {
        var me = this;
        var scrnNewKey  = me.mkScrnNewKey();
        this.items = [
            scrnNewKey
        ];
        this.callParent(arguments);
    },

    //____
    mkScrnNewKey: function(){
        //itemId's of interest
        //scrnNewKey        -> The panel displaying the screen
        //btnNewKeyNext     -> We neet to determine which radio item was selected when this one is clicked

        //First a panel which we'll add the instructions to 
        var pnlMsg = Ext.create('Ext.container.Container',{
            border: false,
            baseCls: 'regMsg',
            html: i18n("sSupply_the_following_detail_please"),
            width: '100%'
        });

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
                    msgTarget: 'under',
                    labelClsExtra: 'lblRd',
                    labelAlign: 'top',
                    labelSeparator: '',
                    margin: 15
            },
            defaultType: 'textfield',
            items: [
                {
                    name: 'name',
                    fieldLabel: i18n('sKey_name'),
                    itemId: 'inpNewKey',
                    allowBlank: false,
                    emptyText: i18n('sKey_name'),
                    blankText: i18n('sSpecify_a_valid_name_for_the_key'),
                    textValid: true, 
                    validator: function(){
                        return this.textValid;  
                    }
                },
                {
                    xtype     : 'textareafield',
                    grow      : true,
                    name      : 'comment',
                    fieldLabel: i18n('sComment'),
                    anchor    : '100%'
                }
            ],
            buttons: [
                    {
                        itemId: 'btnNewKeyNext',
                        text:   i18n('sNext'),
                        scale:  'large',
                        formBind:true,
                        iconCls:'b-next',
                        glyph: Rd.config.icnNext,
                        margin: '0 20 40 0'
                    }
                ]
        });

        //We pack the two and add a next button
        var pnl =  Ext.create('Ext.panel.Panel',{
            layout: 'vbox',
            border: false,
            itemId: 'scrnNewKey',
            items: [
                pnlMsg,
                pnlFrm
            ] 
        });
        return pnl;
    }
});
