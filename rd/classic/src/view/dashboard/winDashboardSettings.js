Ext.define('Rd.view.dashboard.winDashboardSettings', {
    extend  : 'Ext.window.Window',
    alias   : 'widget.winDashboardSettings',
    title   : i18n('sSettings'),
    layout  : 'fit',
    autoShow: false,
    width   : 550,
    height  : 500,
    closable: true,
    draggable: true,
    resizable: true,
    glyph   : Rd.config.icnSpanner,
    plain   : true,
    border  : false,
    layout  : 'fit',
    requires: [
        'Rd.view.components.cmbRealm',
        'Rd.view.components.cmbTimezones',
        'Rd.view.dashboard.vcWinDashboardSettings',
        'Ext.tab.Panel',
        'Ext.form.Panel',
        'Ext.form.field.Text',
    ],
    controller  : 'vcWinDashboardSettings',
    initComponent: function() {
        var me      = this;
        me.items    = [
            {
                xtype       : 'form',
                border      : false,
                layout      : 'fit', 
                autoScroll  : true,
                fieldDefaults   : {
                    msgTarget       : 'under',
                    labelClsExtra   : 'lblRd',
                    labelAlign      : 'left',
                    labelSeparator  : '',
                    labelWidth      : Rd.config.labelWidth,
                    margin          : Rd.config.fieldMargin
                },
                defaultType     : 'textfield',
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
                                'title'     : 'Overviews',
                                'layout'    : 'anchor',
                                itemId      : 'tabOverviews',
                                defaults    : {
                                    anchor: '100%'
                                },
                                autoScroll:true,
                                items       : [
                                    {
                                        xtype           : 'tagfield',
                                        fieldLabel      : 'Include Overviews',
                                        queryMode       : 'local',
                                       // emptyText       : 'Select Overviews To Include',
                                        name            : 'overviews_to_include[]',
                                        displayField    : 'name',
                                        valueField      : 'id',
                                        listeners   : {
				                            select  : 'onOverviewsToIncludeSelect',
				                            change  : 'onOverviewsToIncludeSelect'
				                        },
                                        store: {
                                            autoLoad    : true,
                                            storeId     : "Overviews",
                                            fields      :[
                                                {name   :'id',      type:'string'},
                                                {name   :'name',    type:'string'}
                                            ],
                                            data: [
                                                {
                                                    id  : 'radius_overview',
                                                    name: "RADIUS"
                                                },
                                                {
                                                    id  : 'meshdesk_overview',
                                                    name: "MESH Networks"
                                                }
                                            ]
                                        }    
                                    },
                                    {
                                        xtype       : 'cmbRealm',
                                        fieldLabel  : 'Default Realm',
                                        hidden      : true,
                                        disabled    : true
                                    },
                                    {
                                        xtype       : 'cmbTimezones',
                                        name        : 'timezone_id'
                                    },
                                    {
                                        xtype       : 'checkbox',      
                                        boxLabel    : 'Compact View',
                                        name        : 'compact_view',
                                        inputValue  : 'compact_view',
                                        checked     : true,
                                        cls         : 'lblRdReq'
                                    },
                                    {
                                        xtype           : 'combobox',
                                        fieldLabel      : 'Default Overview',
                                        queryMode       : 'local',
                                        name            : 'default_overview',
                                        displayField    : 'name',
                                        valueField      : 'id',
                                        value           : 'radius_overview',
                                        hidden          : true,
                                        disabled        : true,
                                        store           : {
                                            autoLoad    : true,
                                            storeId     : "Overviews",
                                            fields      :[
                                                {name   :'id',      type:'string'},
                                                {name   :'name',    type:'string'}
                                            ],
                                            data: [
                                                {
                                                    id  : 'radius_overview',
                                                    name: "RADIUS"
                                                },
                                                {
                                                    id  : 'meshdesk_overview',
                                                    name: "MESH Networks"
                                                }
                                            ]
                                        }    
                                    }              
                                ]
                            },
                            { 
                                'title'     : 'White Labeling',
                                'layout'    : 'anchor',
                                itemId      : 'tabWhiteLabel',
                                defaults    : {
                                    anchor: '100%'
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
                                        emptyText   : 'Select an image ±48px in height',
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
                                        itemId      : 'imgWlLogo',
                                        margin      : Rd.config.buttonMargin
                                    }
                                ]
                            },
                            { 
                                title       : 'Alerts',
                                layout      : 'anchor',
                                itemId      : 'tabAlerts',
                                defaults    : {
                                    anchor: '100%'
                                },
                                autoScroll  :true,
                                items: [       
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
									}
                                ]
                            },
                            { 
                                title       : 'API',
                                layout      : 'anchor',
                                itemId      : 'tabAPI',
                                defaults    : {
                                    anchor: '100%'
                                },
                                autoScroll  :true,
                                items: [       
                                    {
                                        xtype       : 'displayfield',
                                        fieldLabel  : 'API Key',
                                        name        : 'api_key',
                                        value       : me.api_key
                                    }
                                ]
                            }                              
                        ]
                    }
                ],
                buttons: [
                    {
                        itemId      : 'save',
                        text        : i18n('sOK'),
                        scale       : 'large',
                        glyph       : Rd.config.icnYes,
                        formBind    : true,
                        margin      : Rd.config.buttonMargin
                    }
                ]
            }
        ];
        me.callParent(arguments);
    }
});
