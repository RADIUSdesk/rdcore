Ext.define('Rd.view.dnsDeskPolicies.winPolicyAdd', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winPolicyAdd',
    closable    : true,
    draggable   : true,
    resizable   : false,
    title       : 'New Policy',
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
        'Rd.view.dnsDeskPolicies.vcPolicy'
    ],
    controller  : 'vcPolicy', 
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
                        },
                        { 
                            title       : 'Settings',
                            layout      : 'anchor',
                            itemId      : 'tabSettings',
                            autoScroll  : true,
                            defaults    : {
                                anchor: '100%'
                            },
                            autoScroll:true,
                            items       : [
                                {
                                    xtype       : 'checkbox',      
                                    fieldLabel  : 'Enable Filter',
                                    name        : 'enableFilter',
                                    inputValue  : 'enableFilter',
                                    checked     : true,
                                    cls         : 'lblRd'
                                },
                                {
                                    xtype       : 'checkbox',      
                                    fieldLabel  : 'Block All',
                                    name        : 'blockAll',
                                    inputValue  : 'blockAll',
                                    checked     : false,
                                    cls         : 'lblRd'
                                },
                                {
                                    xtype       : 'checkbox',      
                                    fieldLabel  : 'Block Unclassified',
                                    name        : 'blockUnclass',
                                    inputValue  : 'blockUnclass',
                                    checked     : false,
                                    cls         : 'lblRd'
                                },
                                {
                                    xtype       : 'checkbox',      
                                    fieldLabel  : 'Ad-remove',
                                    boxLabel    : 'Block Adware With Blank Page.',
                                    name        : 'adRemove',
                                    inputValue  : 'adRemove',
                                    checked     : false,
                                    cls         : 'lblRd'
                                },
                                {
                                    xtype       : 'checkbox',      
                                    fieldLabel  : 'Block Covert Channel',
                                    boxLabel    : 'Detecting Hidden Communication.',
                                    name        : 'blockCovertChan',
                                    inputValue  : 'blockCovertChan',
                                    checked     : false,
                                    cls         : 'lblRd'
                                },
                                {
                                    xtype       : 'checkbox',      
                                    fieldLabel  : 'Block Mailer Worm',
                                    boxLabel    : 'MX Type Query Will Be Blocked.',
                                    name        : 'blockMailerWorm',
                                    inputValue  : 'blockMailerWorm',
                                    checked     : false,
                                    cls         : 'lblRd'
                                },
                                {
                                    xtype       : 'checkbox',      
                                    fieldLabel  : "Allow 'A' Record Only",
                                    boxLabel    : 'Block All except A, AAAA, PTR Type Queries.',
                                    name        : 'aRecordOnly',
                                    inputValue  : 'aRecordOnly',
                                    checked     : false,
                                    cls         : 'lblRd'
                                },
                                {
                                    xtype      : 'fieldcontainer',
                                    fieldLabel : 'Safe-Search',
                                    defaultType: 'radiofield',
                                    defaults   : {
                                        flex: 1
                                    },
                                    layout      : 'hbox',
                                    items: [
                                        {
                                            boxLabel  : 'Off',
                                            name      : 'safeMode',
                                            inputValue: '0',
                                            id        : 'radio4',
                                            checked   : true
                                        }, {
                                            boxLabel  : 'Moderate',
                                            name      : 'safeMode',
                                            inputValue: '1',
                                            id        : 'radio5'
                                        }, {
                                            boxLabel  : 'Strict',
                                            name      : 'safeMode',
                                            inputValue: '2',
                                            id        : 'radio6'
                                        }
                                    ]
                                },
                                {
                                    xtype       : 'checkbox',      
                                    fieldLabel  : 'Safe Search Without Youtube',
                                    name        : 'safeModeWithoutYoutube',
                                    inputValue  : 'safeModeWithoutYoutube',
                                    checked     : false,
                                    cls         : 'lblRd',
                                    hidden      : true
                                },
                                {
                                    xtype       : 'checkbox',      
                                    fieldLabel  : 'Logging Only',
                                    name        : 'logOnly',
                                    inputValue  : 'logOnly',
                                    checked     : false,
                                    cls         : 'lblRd'
                                }
                                
                            ]
                        },
                        { 
                            title       : 'Categories',
                            layout      : 'anchor',
                            itemId      : 'tabCategories',
                            autoScroll  :true,
                            items       : [
                                {
                                    xtype   : 'checkboxgroup',
                                    columns : 3,
                                    vertical: false,
                                    itemId  : 'chkgrpCategories'
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
