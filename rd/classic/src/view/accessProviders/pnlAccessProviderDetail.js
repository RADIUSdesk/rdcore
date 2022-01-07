Ext.define('Rd.view.accessProviders.pnlAccessProviderDetail', {
    extend  : 'Ext.panel.Panel',
    alias   : 'widget.pnlAccessProviderDetail',
    border  : false,
    ap_id  : null,
    layout: 'hbox',
    bodyStyle: {backgroundColor : Rd.config.panelGrey },
    requires    : [
        'Rd.view.accessProviders.vcAccessProviderDetails'
    ],
    controller  : 'vcAccessProviderDetails',
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
                    labelClsExtra   : 'lblRd',
                    labelAlign      : 'left',
                    labelSeparator  : '',
                    margin          : Rd.config.fieldMargin,
                    //labelWidth      : Rd.config.labelWidth,
                    labelWidth      : 100
                  //  maxWidth        : Rd.config.maxWidth  
                },
                items       : [
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
                                'title'     : i18n('sRequired_info'),
                                'layout'    : 'anchor',
                                defaults    : {
                                    anchor  : '100%'
                                },
                                autoScroll:true,
                                items: [
                                    {
                                        itemId      : 'owner',
                                        xtype       : 'displayfield',
                                        fieldLabel  : i18n('sOwner'),
                                        value       : me.owner,
                                        name        : 'owner',
                                        labelClsExtra: 'lblRdReq'
                                    },
                                    {
                                        xtype       : 'displayfield',
                                        fieldLabel  : 'API Key',
                                        name        : 'api_key',
                                        value       : me.api_key,
                                        labelClsExtra: 'lblRdReq'
                                    },
                                    {
                                        xtype   : 'textfield',
                                        name    : "id",
                                        hidden  : true,
                                        value   : me.ap_id,
                                        itemId  : 'ap_id'
                                    },
                                    {
                                        xtype       : 'textfield',
                                        fieldLabel  : i18n('sUsername'),
                                        name        : "username",
                                        allowBlank  :false,
                                        blankText   : i18n("sEnter_a_value"),
                                        labelClsExtra: 'lblRdReq'
                                    },
                                    { 
                                        xtype       : 'cmbLanguages', 
                                        width       : 350, 
                                        fieldLabel  : i18n('sLanguage'),  
                                        name        : 'language', 
                                        allowBlank  : false,
                                        labelClsExtra: 'lblRdReq' 
                                    },
                                    { 
                                        xtype       : 'cmbTimezones',
                                        labelClsExtra: 'lblRdReq',
                                        name        : 'timezone_id' 
                                    },
                                    {
                                        xtype       : 'fieldcontainer',
                                        itemId      : 'fcPickGroup',
                                        hidden      : true,
                                        layout      : {
                                            type    : 'hbox',
                                            align   : 'begin',
                                            pack    : 'start'
                                        },
                                        items:[
                                            {
                                                itemId      : 'displTag',
                                                xtype       : 'displayfield',
                                                fieldLabel  : 'Group Branch',
                                                name        : 'tag_path',
                                                margin      : 0,
                                                padding     : 0,
                                                width       : 360
                                            },
                                            {
                                                xtype       : 'button',
                                                text        : 'Change Group',
                                                margin      : 5,
                                                padding     : 5,
                                                ui          : 'button-green',
                                                itemId      : 'btnPickGroup',
                                                width       : 100
                                            },
                                            {
                                                xtype       : 'textfield',
                                                name        : 'tree_tag_id',
                                                itemId      : 'hiddenTag',
                                                hidden      : true
                                            }
                                        ]
                                    }, 
                                    {
                                        xtype       : 'checkbox',      
                                        fieldLabel  : i18n('sActivate'),
                                        name        : 'active',
                                        inputValue  : 'active',
                                        checked     : true,
                                        labelClsExtra: 'lblRdReq'
                                    }
                                ]
                            },
                            { 
                                'title'     : i18n('sOptional_info'),
                                'layout'    : 'anchor',
                                defaults    : {
                                    anchor  : '100%'
                                },
                                autoScroll:true,
                                items: [
                                    {
                                        xtype       : 'textfield',
                                        fieldLabel  : i18n('sName'),
                                        name        : "name"
                                    },
                                    {
                                        xtype       : 'textfield',
                                        fieldLabel  : i18n('sSurname'),
                                        name        : "surname"
                                    },
                                    {
                                        xtype       : 'textfield',
                                        fieldLabel  : i18n('sPhone'),
                                        name        : "phone",
                                        vtype       : 'Numeric'
                                    },
                                    {
                                        xtype       : 'textfield',
										itemId		: 'txEmail',
                                        fieldLabel  : i18n('s_email'),
                                        name        : "email",
                                        vtype       : 'email',
                                        listeners   : {
                                            change : 'onTxEmailChange'
                                        } 
                                    },
                                    {
                                        xtype       : 'checkbox',
                                        itemId      : 'chkGetAlerts',      
                                        fieldLabel  : 'Get Email Alerts',
                                        name        : 'alert_activate',
                                        inputValue  : 'alert_activate',
                                        checked     : false,
                                        disabled    : true,
                                        listeners   : {
                                            change : 'onChkGetAlertsChange'
                                        } 
                                    },
									{
									  xtype       : 'numberfield',
									  fieldLabel  : 'Frequency (every N hours)',
									  name        : 'alert_frequency',
									  itemId      : 'fldFrequency',
									  allowBlank  : false,
									  minValue    : 1,
									  maxValue    : 12,
									  step        : 1,
									  keyNavEnabled : true,
                                      disabled    : true,
                                      value       : 1
									},
                                    {
                                        xtype     : 'textareafield',
                                        grow      : true,
                                        name      : 'address',
                                        fieldLabel: i18n('sAddress'),
                                        anchor    : '100%'
                                    }
                                ]
                            },
                            { 
                                title       : 'White Label',
                                'layout'    : 'anchor',
                                defaults    : {
                                    anchor  : '100%'
                                },
                                autoScroll:true,
                                items: [
                                     {
                                        xtype       : 'checkbox',
                                        itemId      : 'chkWlActive',      
                                        fieldLabel  : i18n('sActivate'),
                                        name        : 'wl_active',
                                        inputValue  : 'wl_active',
                                        checked     : false,
                                        listeners   : {
                                            change : 'onChkWlActiveChange'
                                        } 
                                    },
                                    {
                                        xtype       : 'textfield',
                                        fieldLabel  : 'Header Text',
                                        name        : "wl_header",
                                        itemId      : 'txtWlHeader',
                                        disabled    : true
                                    },
                                    {
                                        xtype       : 'colorfield',
                                        fieldLabel  : 'Header Background',
                                        name        : 'wl_h_bg',
                                        beforeBodyEl: [
                                            '<div class="' + Ext.baseCSSPrefix + 'colorpicker-field-swatch custom-color-picker-swatch">' +
                                                '<div id="{id}-swatchEl" data-ref="swatchEl" class="' + Ext.baseCSSPrefix +
                                                        'colorpicker-field-swatch-inner"></div>' +
                                            '</div>'
                                        ],
                                        value       : '#FFFFFF',
                                        itemId      : 'clrWlHeaderBg',
                                        disabled    : true
                                    },
                                    {
                                        xtype       : 'colorfield',
                                        fieldLabel  : 'Header Foreground',
                                        name        : 'wl_h_fg',
                                        beforeBodyEl: [
                                            '<div class="' + Ext.baseCSSPrefix + 'colorpicker-field-swatch custom-color-picker-swatch">' +
                                                '<div id="{id}-swatchEl" data-ref="swatchEl" class="' + Ext.baseCSSPrefix +
                                                        'colorpicker-field-swatch-inner"></div>' +
                                            '</div>'
                                        ],
                                        value       : '#4b4c4c',
                                        itemId      : 'clrWlHeaderFg',
                                        disabled    : true
                                        
                                    },
                                    {
                                        xtype       : 'textfield',
                                        fieldLabel  : 'Footer Text',
                                        name        : "wl_footer",
                                        itemId      : 'txtWlFooter',
                                        disabled    : true
                                    },
                                    {
                                        xtype       : 'checkbox',
                                        itemId      : 'chkWlImgActive',      
                                        fieldLabel  : 'Include Logo',
                                        name        : 'wl_img_active',
                                        inputValue  : 'wl_img_active',
                                        checked     : false,
                                        disabled    : true,
                                        listeners   : {
                                            change : 'onChkWlImgActiveChange'
                                        } 
                                    },
                                    {
                                        xtype       : 'filefield',
                                        itemId      : 'flWlImgFileUpload',
                                        emptyText   : i18n('sSelect_an_image'),
                                        fieldLabel  : 'New Logo File',
                                        allowBlank  : true,
                                        name        : 'wl_img_file_upload',
                                        buttonText  : '',
                                      //  disabled    : true,
                                        buttonConfig: {
                                            iconCls: 'upload-icon',
                                            glyph: Rd.config.icnFolder
                                        }  
                                    },
                                    {
                                        xtype       : 'textfield',
                                        name        : "wl_img_file",
                                        hidden      : true
                                    },
                                    {
                                        xtype       : 'image',
                                      //  src         : '/cake3/rd_cake/img/access_providers/logo.png', //Souces it when form loads
                                        autoEl      : 'div',
                                        title       : 'Current Logo',
                                        itemId      : 'imgWlLogo'
                                    }
                                ]
                            },
                            { 
                                title       : 'Selected Components',
                                layout      : 'anchor',
                                defaults    : {
                                    anchor  : '100%'
                                },
                                autoScroll:true,
                                items: [
                                    {
                                        xtype       : 'checkboxgroup',
                                   //     fieldLabel  : 'Two Columns',
                                        vertical    : false,
                                        // Arrange checkboxes into two columns, distributed vertically
                                        columns     : 2,
                                        vertical    : false,
                                        items: [
                                            { boxLabel: '<i class="fa fa-graduation-cap"></i> Admins',  name: 'cmp_admins', itemId: 'cmp_admins'},
                                            { boxLabel: '<i class="fa fa-globe"></i> Realms',           name: 'cmp_realms', itemId: 'cmp_realms'},
                                            { boxLabel: '<i class="fa fa-user"></i> Permanent Users',   name: 'cmp_permanent_users', itemId: 'cmp_permanent_users'},
                                            { boxLabel: '<i class="fa fa-ticket-alt"></i> Vouchers',    name: 'cmp_vouchers', itemId: 'cmp_vouchers'},
                                            { boxLabel: '<i class="fa fa-cubes"></i> Profiles',         name: 'cmp_profiles', itemId: 'cmp_profiles'},
                                            { boxLabel: '<i class="fa fa-bullseye"></i> RADIUS',        name: 'cmp_radius', itemId: 'cmp_radius'},
                                            { boxLabel: '<i class="fa fa-question"></i> Unknown RADIUS',name: 'cmp_unknown_dynamic_clients', itemId: 'cmp_unknown_dynamic_clients'},
                                            { boxLabel: '<i class="fa fa-code-branch"></i> MESHdesk',   name: 'cmp_mesh_desk', itemId: 'cmp_mesh_desk'},
                                            { boxLabel: '<i class="fa fa-cloud"></i> APdesk',           name: 'cmp_ap_desk', itemId: 'cmp_ap_desk'},
                                            //FIXME ADD ALERTS LATER
                                        //    { boxLabel: 'Alerts',           name: 'cmp_alerts'},
                                            { boxLabel: '<i class="fa fa-sign-in-alt"></i> Login Pages', name: 'cmp_login_pages', itemId: 'cmp_login_pages'},
                                            { boxLabel: '<i class="fa fa-magic"></i> Setup Wizard',name: 'cmp_wizards',      itemId: 'cmp_wizards'},
                                            { boxLabel: '<i class="fa fa-quote-right"></i> OpenVPN Servers',   name: 'cmp_openvpn_servers', itemId: 'cmp_openvpn_servers'},
                                            { boxLabel: '<i class="fa fa-question"></i> Unknown Nodes', name: 'cmp_unknown_nodes', itemId: 'cmp_unknown_nodes'},
                                         //   { boxLabel: '<span style="font-family:FontAwesome;font-size:larger;">&#xf082</span> Facebook XWF',  name: 'cmp_traffic_classes', itemId: 'cmp_traffic_classes'},
                                            
                                        ]
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
                        glyph: Rd.config.icnYes,  
                        margin: Rd.config.buttonMargin
                    }
                ]
            };
        me.callParent(arguments);
    }
});
