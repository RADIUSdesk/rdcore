Ext.define('Rd.view.realms.pnlRealmDetail', {
    extend  : 'Ext.panel.Panel',
    alias   : 'widget.pnlRealmDetail',
    border  : false,
    realm_id: null,
    layout: 'hbox',
    bodyStyle: {backgroundColor : Rd.config.panelGrey },
    initComponent: function(){
        var me = this;

        me.items =  { 
                xtype   :  'form',
                height  : '100%', 
                width   :  500,
                layout  : 'fit',
                autoScroll:true,
                frame   : true,
                fieldDefaults: {
                    msgTarget       : 'under',
                    labelClsExtra   : 'lblRdReq',
                    labelAlign      : 'left',
                    labelSeparator  : '',
                    margin          : Rd.config.fieldMargin,
                    labelWidth      : 100  
                },
                items       : [
                    {
                        xtype   : 'tabpanel',
                        layout  : 'fit',
                        xtype   : 'tabpanel',
                        margins : '0 0 0 0',
                        plain   : true,
                        tabPosition: 'bottom',
                        border  : false,
                        cls     : 'subTab',
                        items   : [
                            { 
                                'title'     : i18n('sRequired_info'),
                                'layout'    : 'anchor',
                                itemId      : 'tabRequired',
                                defaults    : {
                                    anchor: '100%'
                                },
                                autoScroll:true,
                                items       : [
                                    {
                                        xtype       : 'fieldcontainer',
                                        itemId      : 'fcPickOwner',
                                        hidden      : true,  
                                        layout      : {
                                            type    : 'hbox',
                                            align   : 'begin',
                                            pack    : 'start'
                                        },
                                        items:[
                                            {
                                                itemId      : 'owner',
                                                xtype       : 'displayfield',
                                                fieldLabel  : i18n('sOwner'),
                                                name        : 'username',
                                                itemId      : 'displUser',
                                                margin      : 0,
                                                padding     : 0,
                                                width       : 360
                                            },
                                            {
                                                xtype       : 'button',
                                                text        : 'Pick Owner',
                                                margin      : 5,
                                                padding     : 5,
                                                ui          : 'button-green',
                                                itemId      : 'btnPickOwner',
                                                width       : 100
                                            },
                                            {
                                                xtype       : 'textfield',
                                                name        : "user_id",
                                                itemId      : 'hiddenUser',
                                                hidden      : true
                                            }
                                        ]
                                    },
                                    {
                                        xtype: 'textfield',
                                        name : "id",
                                        hidden: true
                                    },
                                    {
                                        xtype       : 'textfield',
                                        fieldLabel  : i18n('sName'),
                                        name        : "name",
                                        allowBlank  : false,
                                        blankText   : i18n("sSupply_a_value")
                                    },
                                    {
                                        xtype       : 'checkbox',      
                                        boxLabel    : 'Available To Sub-Providers',
                                        name        : 'available_to_siblings',
                                        inputValue  : 'available_to_siblings',
                                        checked     : false,
                                        cls         : 'lblRd'
                                    },
                                    {
                                        xtype       : 'textfield',
                                        fieldLabel  : i18n('sSuffix'),
                                        name        : "suffix",
                                        allowBlank  : true,
                                        blankText   : i18n("sSupply_a_value"),
                                        labelClsExtra: 'lblRd',
                                        regex       : /^[\w\-_\.]+$/,
                                        regexText   : "Only words, underscores, dashes and full stops allowed"
                                    },
                                    {
                                        xtype       : 'checkbox',      
                                        boxLabel    : i18n('sAdd_suffix_when_creating_Permanent_Users'),
                                        name        : 'suffix_permanent_users',
                                        inputValue  : 'suffix_permanent_users',
                                        checked     : false,
                                        cls         : 'lblRd'
                                    },
                                    {
                                        xtype       : 'checkbox',      
                                        boxLabel    : i18n('sAdd_suffix_when_creating_Vouchers'),
                                        name        : 'suffix_vouchers',
                                        inputValue  : 'suffix_vouchers',
                                        checked     : false,
                                        cls         : 'lblRd'
                                    },
                                    {
                                        xtype       : 'checkbox',      
                                        boxLabel    : 'Add suffix when creating BYOD',
                                        name        : 'suffix_devices',
                                        inputValue  : 'suffix_devices',
                                        checked     : false,
                                        cls         : 'lblRd'
                                    }
                                ]
                            },
                            { 
                                'title'     : i18n('sContact_detail'),
                                'layout'    : 'anchor',
                                itemId      : 'tabContact',
                                defaults    : {
                                    anchor: '100%'
                                },
                                autoScroll:true,
                                items       : [         
                                    {
                                        xtype       : 'textfield',
                                        fieldLabel  : i18n('sPhone'),
                                        name        : "phone",
                                        allowBlank  : true,
                                        vtype       : 'Numeric'
                                    },
                                    {
                                        xtype       : 'textfield',
                                        fieldLabel  : i18n('sFax'),
                                        name        : "fax",
                                        allowBlank  : true,
                                        vtype       : 'Numeric'
                                    },
                                    {
                                        xtype       : 'textfield',
                                        fieldLabel  : i18n('sCell'),
                                        name        : "cell",
                                        allowBlank  : true,
                                        vtype       : 'Numeric'
                                    },
                                    {
                                        xtype       : 'textfield',
                                        fieldLabel  : i18n('s_email'),
                                        name        : "email",
                                        allowBlank  : true,
                                        vtype       : 'email'
                                    },
                                    {
                                        xtype       : 'textfield',
                                        fieldLabel  : i18n('sURL'),
                                        name        : "url",
                                        allowBlank  : true,
                                        vtype       : 'url'
                                    }
                                ]
                            },
                            { 
                                'title'     : i18n('sAddress'),
                                'layout'    : 'anchor',
                                itemId      : 'tabAddress',
                                defaults    : {
                                    anchor: '100%'
                                },
                                autoScroll:true,
                                items       : [         
                                    {
                                        xtype       : 'textfield',
                                        fieldLabel  : i18n('sStreet_Number'),
                                        name        : "street_no",
                                        allowBlank  : true
                                    },
                                    {
                                        xtype       : 'textfield',
                                        fieldLabel  : i18n('sStreet'),
                                        name        : "street",
                                        allowBlank  : true,
                                        margin: 15
                                    },
                                    {
                                        xtype       : 'textfield',
                                        fieldLabel  : i18n('sTown_fs_Suburb'),
                                        name        : "town_suburb",
                                        allowBlank  : true,
                                        margin: 15
                                    },
                                    {
                                        xtype       : 'textfield',
                                        fieldLabel  : i18n('sCity'),
                                        name        : "city",
                                        allowBlank  : true
                                    },
                                    {
                                        xtype       : 'textfield',
                                        fieldLabel  : i18n('sCountry'),
                                        name        : "country",
                                        allowBlank  : true
                                    },
                                    {
                                        xtype       : 'numberfield',
                                        name        : 'lon',  
                                        fieldLabel  : i18n('sLongitude'),
                                        value       : 0,
                                        maxValue    : 180,
                                        minValue    : -180,
                                        decimalPrecision: 14,
                                        labelClsExtra: 'lblRd'
                                    },
                                    {
                                        xtype       : 'numberfield',
                                        name        : 'lat',  
                                        fieldLabel  : i18n('sLatitude'),
                                        value       : 0,
                                        maxValue    : 90,
                                        minValue    : -90,
                                        decimalPrecision: 14,
                                        labelClsExtra: 'lblRd'
                                    }
                                ]
                            },
							{ 
                                'title'     : 'Social media',
                                'layout'    : 'anchor',
                                itemId      : 'tabSocial',
                                defaults    : {
                                    anchor: '100%'
                                },
                                autoScroll:true,
                                items       : [         
                                    {
                                        xtype       : 'textfield',
                                        fieldLabel  : 'Twitter',
                                        name        : 'twitter',
                                        allowBlank  : true,
                                        vtype       : 'url'
                                    },
									{
                                        xtype       : 'textfield',
                                        fieldLabel  : 'Facebook',
                                        name        : 'facebook',
                                        allowBlank  : true,
                                        vtype       : 'url'
                                    },
									{
                                        xtype       : 'textfield',
                                        fieldLabel  : 'Youtube',
                                        name        : 'youtube',
                                        allowBlank  : true,
                                        vtype       : 'url'
                                    },
									{
                                        xtype       : 'textfield',
                                        fieldLabel  : 'Google+',
                                        name        : 'google_plus',
                                        allowBlank  : true,
                                        vtype       : 'url'
                                    },
									{
                                        xtype       : 'textfield',
                                        fieldLabel  : 'LinkedIn',
                                        name        : 'linkedin',
                                        allowBlank  : true,
                                        vtype       : 'url'
                                    }
                                ]
                            },
							{ 
                                'title'     : 'T&C',
                                'layout'    : 'anchor',
                                itemId      : 'tabTandC',
                                defaults    : {
                                    anchor: '100%'
                                },
                                autoScroll:true,
                                items       : [         
                                    {
                                        xtype       : 'textfield',
                                        fieldLabel  : 'Title',
                                        name        : 't_c_title',
                                        allowBlank  : true
                                    },
									{
										xtype     	: 'textareafield',
										grow      	: true,
										name      	: 't_c_content',
										allowBlank 	: true,
										fieldLabel	: 'Content',
										anchor    	: '100%'
									}
                                ]
                            }
                        ]
                    }
                ],
                buttons: [
                    {
                        itemId: 'save',
                        formBind: true,
                        text: i18n('sSave'),
                        scale: 'large',
                        iconCls: 'b-save',
                        glyph:      Rd.config.icnYes,
                        margin: Rd.config.buttonMargin
                    }
                ]
            };
        me.callParent(arguments);
    }
});
