Ext.define('Rd.view.realms.pnlRealmDetail', {
    extend      : 'Ext.form.Panel',
    alias       : 'widget.pnlRealmDetail',
    realm_id    : null,
    autoScroll	: true,
    plain       : true,
    frame       : false,
    layout      : {
        type    : 'vbox',
        pack    : 'start',
        align   : 'stretch'
    },
    margin      : 5,  
    ap_id       : null,
    fieldDefaults: {
        msgTarget       : 'under',
        labelAlign      : 'left',
        labelSeparator  : '',
        labelWidth      : Rd.config.labelWidth+20,
        margin          : Rd.config.fieldMargin,
        labelClsExtra   : 'lblRdReq'
    },
    buttons : [
        {
            itemId  : 'save',
            text    : 'SAVE',
            scale   : 'large',
            formBind: true,
            glyph   : Rd.config.icnYes,
            margin  : Rd.config.buttonMargin,
            ui      : 'button-teal'
        }
    ],
    initComponent: function(){
        var me      = this;
        var w_prim  = 550;
        
        var cntRequired  = {
            xtype       : 'container',
            width       : w_prim,
            layout      : 'anchor',
            defaults    : {
                anchor  : '100%'
            },
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
                            width       : 410
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
        }
        
        var cntContact  = {
            xtype       : 'container',
            width       : w_prim,
            layout      : 'anchor',
            defaults    : {
                anchor  : '100%'
            },
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
        }
        
        var cntAddress  = {
            xtype       : 'container',
            width       : w_prim,
            layout      : 'anchor',
            defaults    : {
                anchor  : '100%'
            },
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
        }
        
        var cntSocial  = {
            xtype       : 'container',
            width       : w_prim,
            layout      : 'anchor',
            defaults    : {
                anchor  : '100%'
            },
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
        }
        
        var cntTerms  = {
            xtype       : 'container',
            width       : w_prim,
            layout      : 'anchor',
            defaults    : {
                anchor  : '100%'
            },
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
        
         me.items = [
            {
                xtype       : 'panel',
                title       : "General",
                glyph       : Rd.config.icnGears, 
                ui          : 'panel-blue',
                layout      : {
                  type  : 'vbox',
                  align : 'start',
                  pack  : 'start'
                },
                bodyPadding : 10,
                items       : cntRequired				
            },
            {
                xtype       : 'panel',
                title       : i18n('sContact_detail'),
                glyph       : Rd.config.icnMobile, 
                ui          : 'panel-green',
                layout      : {
                  type      : 'vbox',
                  align     : 'start',
                  pack      : 'start'
                },
                bodyPadding : 10,
                items       : cntContact				
            },
            {
                xtype       : 'panel',
                title       : i18n('sAddress'),
                glyph       : Rd.config.icnMap, 
                ui          : 'panel-green',
                layout      : {
                  type      : 'vbox',
                  align     : 'start',
                  pack      : 'start'
                },
                bodyPadding : 10,
                items       : cntAddress				
            },
            {
                xtype       : 'panel',
                title       : "Social Media",
                glyph       : Rd.config.icnFacebook, 
                ui          : 'panel-green',
                layout      : {
                  type      : 'vbox',
                  align     : 'start',
                  pack      : 'start'
                },
                bodyPadding : 10,
                items       : cntSocial				
            },
            {
                xtype       : 'panel',
                title       : "Terms & Conditions",
                glyph       : Rd.config.icnGavel, 
                ui          : 'panel-green',
                layout      : {
                  type      : 'vbox',
                  align     : 'start',
                  pack      : 'start'
                },
                bodyPadding : 10,
                items       : cntTerms				
            }
        ];      

        me.callParent(arguments);
    }
});
