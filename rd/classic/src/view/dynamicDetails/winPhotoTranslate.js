Ext.define('Rd.view.dynamicDetails.winPhotoTranslate', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winPhotoTranslate',
    title       : 'Manage Translations',
    layout      : 'fit',
    autoShow    : false,
    width       : 600,
    height      : 500,
    glyph       : Rd.config.icnEdit,
    dynamic_photo_id  : undefined,
    dynamic_detail_id : undefined,
    data_view   :  undefined,
    requires: [
        'Rd.view.dynamicDetails.vcPhotoTranslate'
    ],
    controller  : 'vcPhotoTranslate',
    initComponent: function() {
        var me      = this;    
        var store   = Ext.create(Ext.data.Store,{
            model: 'Rd.model.mDynamicPhoto',
            proxy: {
                type        :'ajax',
                url         : '/cake3/rd_cake/dynamic-details/index-photo.json',
                extraParams : { 'dynamic_detail_id' : me.dynamic_detail_id,'remove_whitespace' : true},
                batchActions: true,
                format      : 'json',
                reader      : {
                    keepRawData : true,
                    type        : 'json',
                    rootProperty: 'items'
                }
            },
            autoLoad: true
        });
        
        var cmbImages = Ext.create('Ext.form.ComboBox', {
            fieldLabel  : 'Photo',
            store       : store,
            queryMode   : 'local',
            itemId      : 'cmbImages',
            name        : 'dynamic_photo_id',
            valueField  : 'id',
            value       : me.dynamic_photo_id,
            tpl	            : Ext.create('Ext.XTemplate',
                '<tpl for=".">',
                    '<div  class="x-boundlist-item">',
                        '<img src="{img}" alt="Photo Here" style="float:right;width:42px;height:42px;">',
                        '<div style="font-weight:bold;font-size:16px;text-align: left;">',
                            '<tpl if="!Ext.isEmpty(title)">',
		                        '{title}',
		                    '<tpl else>',
		                        '*No Title*',
		                    '</tpl>',
                        '</div>',
                        '<div style="color:#4286f4;font-size:12px;text-align: left;">',
                            '<tpl if="!Ext.isEmpty(description)">',
		                        '{description}',
		                    '<tpl else>',
		                        '*No Description*',
		                    '</tpl>',
                        '</div>',                     
                    '</div>',
                '</tpl>'
            ),
            displayTpl		: Ext.create('Ext.XTemplate',
                '<tpl for=".">',
                    '<tpl if="!Ext.isEmpty(title)">',
                        '{title} - {description}',
                    '<tpl else>',
                        'PhotoID {id} *No Title*',
                    '</tpl>',
                '</tpl>'
            )
        });   
          
        me.items    = [{
            xtype       : 'form', 
            layout      : 'anchor',
            autoScroll  : true,
            frame       : false,
            defaults    : {
                anchor: '100%'
            },
            fieldDefaults: {
                msgTarget       : 'under',
                labelClsExtra   : 'lblRdReq',
                labelAlign      : 'left',
                labelSeparator  : '',
                margin          : Rd.config.fieldMargin,
                labelWidth      : Rd.config.labelWidth
            },
            items   : [
                {
                    xtype       : 'textfield',
                    name        : "id",
                    hidden      : true
                },
                cmbImages,
                {
                    xtype       : 'cmbDynamicLanguages'
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : i18n('sTitle'),
                    name        : 'title',
                    allowBlank  : false,
                    itemId      : 'txtTitle'
                },
                {
                    xtype       : 'textareafield',
                    grow        : true,
                    name        : 'description',
                    fieldLabel  : i18n('sDescription'),
                    anchor      : '100%',
                    allowBlank  : false,
                    itemId      : 'txtDescription'
                },
                {
                    xtype       : 'checkbox',   
                    boxLabel    : "<i class='fa fa-trash'></i> Delete Translation",
                    name        : 'delete_translation',
                    inputValue  : 'delete_translation',
                    itemId      : 'chkDelete',
                    checked     : false
                },
                {
                    xtype       : 'checkbox',      
                    boxLabel    : "Do Not Close Window",
                    itemId      : 'chkMultiple',
                    checked     : true
                }
            ],
            buttons: [
                {
                    itemId: 'saveT',
                    formBind: true,
                    text: i18n('sSave'),
                    scale: 'large',
                    iconCls: 'b-save',
                    glyph: Rd.config.icnYes,
                    margin: Rd.config.buttonMargin
                }
            ]
        } ];       
        me.callParent(arguments);
    }
});
