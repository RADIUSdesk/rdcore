Ext.define('Rd.view.wizard.winWizardPhotoAdd', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winWizardPhotoAdd',
    title       : i18n('sAdd_photo'),
    layout      : 'fit',
    autoShow    : false,
    width       : 500,
    height      : 480,
    glyph       : Rd.config.icnAdd,
    data_view   : undefined,
    new_name    : undefined,
    initComponent: function() {
    
        var me = this;  
        var fits = Ext.create('Ext.data.Store', {
            fields: ['id', 'name'],
            data : [
                {"id":"stretch_to_fit",     "name":"Stretch To Fit"},
                {"id":"horizontal",         "name":"Horizontal Fit"},
                {"id":"vertical",           "name":"Vertical Fit"},
                {"id":"original",           "name":"Original Size"},
                {"id":"dynamic",            "name":"Device Dependent Fit"}
            ]
        });

        // Create the combo box, attached to the states data store
        var cmbFits = Ext.create('Ext.form.ComboBox', {
            fieldLabel  : 'Fit',
            store       : fits,
            queryMode   : 'local',
            displayField: 'name',
            valueField  : 'id',
            name        : 'fit',
            value       : 'stretch_to_fit'
        });
         
        me.items = [
        {
            xtype       :  'form', 
            layout      : 'fit',
            autoScroll  :true,
            frame       : false,
            defaults    : {
                anchor: '100%'
            },
            fieldDefaults: {
                msgTarget       : 'under',
                labelClsExtra   : 'lblRd',
                labelAlign      : 'left',
                labelSeparator  : '',
                margin          : Rd.config.fieldMargin,
                labelWidth      : Rd.config.labelWidth
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
                                'title'     : 'Basic',
                                'layout'    : 'anchor',
                                itemId      : 'tabRequired',
                                defaults    : {
                                    anchor: '100%'
                                },
                                autoScroll:true,
                                items   : [
                                     {
                                        xtype       : 'textfield',
                                        fieldLabel  : i18n('sTitle'),
                                        name        : "title",
                                        labelClsExtra: 'lblRdReq',
                                        allowBlank  : false
                                    },
                                    {
                                        xtype       : 'textareafield',
                                        grow        : true,
                                        name        : 'description',
                                        fieldLabel  : i18n('sDescription'),
                                        anchor      : '100%',
                                        labelClsExtra: 'lblRdReq',
                                        allowBlank  : false
                                    },
                                    {
                                        xtype: 'filefield',
                                        itemId: 'form-file',
                                        emptyText: i18n('sSelect_an_image'),
                                        fieldLabel: i18n('sPhoto'),
                                        allowBlank  : false,
                                        labelClsExtra: 'lblRdReq',
                                        name: 'photo',
                                        buttonText: '',
                                        buttonConfig: {
                                            glyph: Rd.config.icnFolder
                                        }     
                                    },      
                                    {
                                        xtype       : 'checkbox',      
                                        fieldLabel  : "Active",
                                        name        : 'active',
                                        inputValue  : 'active',
                                        checked     : true,
                                        labelClsExtra: 'lblRdReq'
                                    }        
                                ]
                            },
                            {
                                title       : 'Advanced',
                                layout      : 'anchor',
                                itemId      : 'tabAdvanced',
                                defaults    : {
                                    anchor: '100%'
                                },
                                autoScroll:true,
                                items   : [  
                                   
                                    cmbFits,
                                    {
                                        xtype       : 'colorfield',
                                        fieldLabel  : 'Background color',
                                        name        : 'background_color',
                                        beforeBodyEl: [
                                            '<div class="' + Ext.baseCSSPrefix + 'colorpicker-field-swatch custom-color-picker-swatch">' +
                                                '<div id="{id}-swatchEl" data-ref="swatchEl" class="' + Ext.baseCSSPrefix +
                                                        'colorpicker-field-swatch-inner"></div>' +
                                            '</div>'
                                        ],
                                        value       : '#DDDDE5'
                                    },
                                    {
                                        xtype       : 'textfield',
                                        fieldLabel  : 'URL',
                                        name        : 'url',
                                        labelClsExtra: 'lblRd',
                                        vtype       : 'url'
                                    },                                  
                                    {
						                xtype       : 'numberfield',
						                name        : 'slide_duration',
						                fieldLabel  : 'Slide Duration',
						                value       : 10,
						                maxValue    : 300,
						                minValue    : 2
						            },
						            {
                                        xtype       : 'checkbox',      
                                        fieldLabel  : "Include Title",
                                        name        : 'include_title',
                                        inputValue  : 'include_title',
                                        checked     : true,
                                        labelClsExtra: 'lblRd'
                                    },
                                    {
                                        xtype       : 'checkbox',      
                                        fieldLabel  : "Include Description",
                                        name        : 'include_description',
                                        inputValue  : 'include_description',
                                        checked     : true,
                                        labelClsExtra: 'lblRd'
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
                    },
                    {
                        itemId: 'cancel',
                        text: i18n('sCancel'),
                        scale: 'large',
                        iconCls: 'b-close',
                        glyph: Rd.config.icnClose,
                        margin: Rd.config.buttonMargin
                    }
                ]
            }
        ]
    
        me.callParent(arguments);
    }
});
