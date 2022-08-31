Ext.define('Rd.view.vouchers.winVoucherPdf', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winVoucherPdf',
    title       : i18n('sGenerate_pdf'),
    layout      : 'fit',
    autoShow    : false,
    width       : 530,
    height      : 400,
    glyph       : Rd.config.icnPdf,
    requires: [
        'Rd.view.vouchers.cmbPdfFormats',
        'Rd.view.components.vLanguagesCmb',
        'Rd.store.sPdfFormats',
        'Rd.model.mPdfFormat',
        'Rd.view.components.btnCommon'
    ],
    initComponent: function() {
        var me 			= this;
		var orientation = Ext.create('Ext.data.Store', {
			fields: ['id', 'name'],
			data : [
				{"id":"P", "name":"Portrait"},
				{"id":"L", "name":"Landscape"}
			]
		});
		
		var basic_controlls = [
				{ 
					xtype           : 'cmbPdfFormats', 
					name            : 'format',
					labelClsExtra   : 'lblRdReq',
					allowBlank      : false 
				},
				{ 
					xtype           : 'cmbLanguages', 
					fieldLabel      : i18n('sLanguage'),  
					name            : 'language',
					allowBlank      : false,
					labelClsExtra   : 'lblRdReq',
					allowBlank      : false
				}  
		    ];

		 if(me.selecteds == true){
            Ext.Array.push(basic_controlls, {
                xtype           : 'checkbox',      
                fieldLabel      : i18n('sOnly_selected'),
                name            : 'selected_only',
                inputValue      : 'selected_only',
				itemId			: 'selected_only',
                checked         : true,
                labelClsExtra   : 'lblRd'
            });
        }

		var controlls = [{
                    xtype   : 'tabpanel',
                    layout  : 'fit',
                    xtype   : 'tabpanel',
                    margins : '0 0 0 0',
                    plain   : false,
                    tabPosition: 'bottom',
                    border  : false,
                    items   : [
                        { 
                            title     	: 'Basic',
                            itemId      : 'tabBasic',
							layout		: 'anchor',
							defaults: {
						        anchor: '100%'
						    },
                            autoScroll	: true,
                            items       : basic_controlls
                        },
						{
							title       : 'Advanced',
                            itemId      : 'tabAdvanced',
							layout		: 'anchor',
							defaults: {
						        anchor: '100%'
						    },
                            autoScroll	:true,
                            items       : [
								{
									xtype			: 'combobox',
									fieldLabel		: 'Orientation',
									store			: orientation,
									queryMode		: 'local',
									displayField	: 'name',
									valueField		: 'id',
									name			: 'orientation',
									labelClsExtra   : 'lblRdReq'
								},
								{
                                    xtype       : 'radiogroup',
                                    fieldLabel  : 'Dispaly',
                                    labelClsExtra: 'lblRdReq',
                                    columns     : 3,
                                    vertical    : false,
                                    items       : [
                                        {    
									        boxLabel    : 'QR code',
									        width       : 120,
									        name        : 'logo_or_qr',
									        inputValue  : 'qr',
									        width       : 90,
									        margin      : '0 15 0 0'
								        },
								        {    
									        boxLabel    : 'Logo',
									        width       : 120,
									        name        : 'logo_or_qr',
									        checked     : true,
									        inputValue  : 'logo',
									        width       : 90,
									        margin      : '0 0 0 15'
								        },
								        {    
									        boxLabel    : 'Nothing',
									        width       : 80,
									        name        : 'logo_or_qr',
									        inputValue  : 'nothing',
									        width       : 90,
									        margin      : '0 15 0 0'
								        }      
                                    ]
                                },
								{
                                    xtype       : 'checkboxgroup',
                                    itemId      : 'check_defaults',
                                    fieldLabel  : 'Include',
                                    labelClsExtra: 'lblRdReq',
                                    columns     : 2,
                                    vertical    : false,
                                    items       : [
								        {     
									        boxLabel    : 'Date',
									        name        : 'date',
									        checked     : true,
									        width       : 120,
									        margin      : '0 15 0 0'
								        },
                                        {
                                            boxLabel    : 'T&C',
									        name        : 't_and_c',
                                            checked     : true,
									        width       : 120,
                                            margin      : '0 0 0 15'
                                        },
                                        {    
									        boxLabel    : 'Social Media',
									        width       : 120,
									        name        : 'social_media',
									        checked     : true,
									        margin      : '0 15 0 0'
								        },
								        {
                                            boxLabel    : 'Realm Detail',
									        name        : 'realm_detail',
                                            checked     : true,
									        width       : 120,
                                            margin      : '0 0 0 15'
                                        },
                                        {    
									        boxLabel    : 'Profile Detail',
									        width       : 120,
									        name        : 'profile_detail',
									        checked     : true,
									        margin      : '0 15 0 0'
								        },
								        {
                                            boxLabel    : 'Extra Field',
									        name        : 'extra_fields',
                                            checked     : true,
									        width       : 120,
                                            margin      : '0 0 0 15'
                                        }
                                    ]
                                }
                            ]
                        }
					]
			}];

        me.items = [
            {
                xtype		: 'form',
                border		: false,
                layout		: 'fit',
                autoScroll	: true,
                fieldDefaults: {
                    msgTarget		: 'under',
                    labelClsExtra	: 'lblRd',
                    labelAlign		: 'left',
                    labelSeparator	: '',
                    margin          : 15,
                    labelWidth      : 170
                },
                defaultType: 'textfield',
                items: controlls,
                buttons: [{xtype: 'btnCommon'}]
                /*buttons: [
                    {
                        itemId		: 'save',
                        text		: i18n('sOK'),
                        formBind	: true,
                        scale		: 'large',
                        glyph   	: Rd.config.icnYes,
                        formBind	: true,
                        margin		: '0 10 10 0'
                    }
                ]*/
            }
        ];
        this.callParent(arguments);
    }
});
