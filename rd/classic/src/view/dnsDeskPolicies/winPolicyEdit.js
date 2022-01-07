Ext.define('Rd.view.dnsDeskPolicies.winPolicyEdit', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winPolicyEdit',
    closable    : true,
    draggable   : true,
    resizable   : false,
    title       : 'Edit Policy',
    width       : 600,
    height      : 500,
    plain       : true,
    border      : false,
    layout      : 'fit',
    glyph       : Rd.config.icnEdit,
    autoShow    : false,
    record      : '',
    defaults: {
            border: false
    },
    requires: [
        'Ext.form.Panel',
        'Ext.form.field.Text',
        'Rd.view.dnsDeskPolicies.vcPolicy'
    ],
    controller  : 'vcPolicy',
    initComponent: function() {
        var me 		= this; 
        
        var list        = [];
        //console.log(me.record); 
        Ext.Array.forEach(me.record.get('blockCategoryList'),function(item){
            var id      = item.id;
            var name    = item.name;
            var desc    = item.description;
            var c       = item.checkFlag;
            Ext.Array.push(list,{
                boxLabel: name, 
                name: 'cat_'+id, 
                inputValue: 'cat_'+id,
                checked     : c,
                autoEl: {
                    tag: 'div',
                    'data-qtip': desc
                }
            });
        });   
                     
        var frmData = Ext.create('Ext.form.Panel',{
            border:     false,
            layout:     'fit',
            autoScroll: false,
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
            buttons : [
                {
                    itemId  : 'save',
                    text    : i18n('sOK'),
                    scale   : 'large',
                    glyph   : Rd.config.icnYes,
                    formBind: true,
                    margin  : Rd.config.buttonMargin
                }
            ],
            items: [
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
                                    itemId  : 'id',
                                    xtype   : 'textfield',
                                    name    : "id",
                                    hidden  : true
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
                                            id        : 'radio4'
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
                            autoScroll  : true,
     
                            autoScroll:true,
                            items       : [
                                {
                                    xtype   : 'checkboxgroup',
                                    columns : 3,
                                    vertical: false,
                                    itemId  : 'chkgrpCategories',
                                    items   : list
                                }    
                            ]
                        }
                    ]
                }
            ]
        });
        me.items = frmData;
		frmData.loadRecord(me.record);		
        me.callParent(arguments);
    }
});
