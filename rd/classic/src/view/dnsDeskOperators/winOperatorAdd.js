Ext.define('Rd.view.dnsDeskOperators.winOperatorAdd', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winOperatorAdd',
    closable    : true,
    draggable   : true,
    resizable   : false,
    title       : 'New Operator',
    width       : 600,
    height      : 500,
    plain       : true,
    border      : false,
    layout      : 'card',
    glyph       : Rd.config.icnAdd,
    autoShow    : false,
    defaults: {
            border: false
    },
    startScreen: 'scrnData', //Default start screen
    requires: [
        'Ext.layout.container.Card',
        'Ext.form.Panel',
        'Ext.form.field.Text',
        'Ext.form.FieldContainer',
        'Rd.view.dnsDeskOperators.vcOperator'
    ],
    controller  : 'vcOperator', 
    initComponent: function() {
        var me = this;
        var scrnData        = me.mkScrnData();
        me.items = [
            scrnData
        ];  
        this.callParent(arguments);
        me.getLayout().setActiveItem(me.startScreen);
    },

    //_______ Data for ssids  _______
    mkScrnData: function(){
    
        Ext.Ajax.request({
            url: '/cake3/rd_cake/dns-desk-policies/categories-list.json',
            method: 'GET',
            success: function(response){
                var jsonData    = Ext.JSON.decode(response.responseText);
                if(jsonData.success){
                    Ext.Array.forEach(jsonData.items,function(item){
                        var id      = item.id;
                        var name    = item.name;
                        var desc    = item.description;
                        var c       = item.checkFlag;
                        frmData.down('#chkgrpCategories').add({
                            boxLabel    : name, 
                            name        : 'cat_'+id,
                            inputValue  : 'cat_'+id,
                            checked     : c,
                            autoEl: {
                                tag: 'div',
                                'data-qtip': desc
                            }
                        });
                    });   
                }   
            },
            scope: me
        });

        var buttons = [
            {
                itemId: 'btnDataNext',
                text: i18n('sNext'),
                scale: 'large',
                iconCls: 'b-next',
                glyph: Rd.config.icnNext,
                formBind: true,
                margin: '0 20 40 0'
            }
        ];

        var frmData = Ext.create('Ext.form.Panel',{  
            border      : false,
            layout      : 'fit',
            itemId      : 'scrnData',
            autoScroll  : false,
            defaults: {
                anchor: '100%'
            },
            fieldDefaults: {
                msgTarget       : 'under',
                labelClsExtra   : 'lblRd',
                labelAlign      : 'left',
                labelSeparator  : '',
                labelWidth      : Rd.config.labelWidth, 
                margin          : Rd.config.fieldMargin
            },
            defaultType: 'textfield',   
            items:[         
                {
                    xtype   : 'tabpanel',
                    layout  : 'fit',
                    xtype   : 'tabpanel',
                    margins : '0 0 0 0',
                    plain   : false,
                    tabPosition: 'bottom',
                    border  : false,
                    items   : [
                        { 
                            'title'     : 'Basic',
                            'layout'    : 'anchor',
                            itemId      : 'tabBasic',
                            defaults    : {
                                anchor: '100%'
                            },
                            autoScroll:true,
                            items       : [
                    
                                {
                                    xtype       : 'textfield',
                                    fieldLabel  : i18n('sName'),
                                    name        : "name",
                                    allowBlank  : false,
                                    blankText   : i18n('sSupply_a_value'),
                                    labelClsExtra: 'lblRdReq'
                                },
				                {
                                    xtype       : 'textfield',
                                    fieldLabel  : 'Description',
                                    name        : "description",
                                    allowBlank  : true,
                                    labelClsExtra: 'lblRd'
                                }
                            ]
                        }
                    ]
                }
            ],
            buttons: buttons
        });
        return frmData;
    }   
});
