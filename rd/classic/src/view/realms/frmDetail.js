Ext.define('Rd.view.realms.frmDetail', {
    extend: 'Ext.form.Panel',
    alias : 'widget.frmRealmDetail',
    border: false,
    layout: 'anchor',
    autoScroll:true,
    defaults: {
        anchor: '100%'
    },
    fieldDefaults: {
        msgTarget: 'under',
        labelClsExtra: 'lblRd',
        labelAlign: 'left',
        labelSeparator: '',
        margin: 15
    },
    defaultType: 'textfield',
    owner:      '',
    user_id:    '',
    no_tree:    false,
    initComponent: function() {
        var me = this;
        var buttons = [
                {
                    itemId: 'btnDetailPrev',
                    text: i18n('sPrev'),
                    scale: 'large',
                    iconCls: 'b-prev',
                    glyph:      Rd.config.icnBack,
                    margin: '0 20 40 0'
                },
                {
                    itemId: 'save',
                    text: i18n('sOK'),
                    scale: 'large',
                    iconCls: 'b-btn_ok',
                    glyph:      Rd.config.icnYes,
                    formBind: true,
                    margin: '0 20 40 0'
                }
            ];

        if(me.no_tree){
            buttons = [
                {
                    itemId: 'save',
                    text: i18n('sOK'),
                    scale: 'large',
                    iconCls: 'b-btn_ok',
                    glyph:      Rd.config.icnYes,
                    formBind: true,
                    margin: '0 20 40 0'
                }
            ];
        }

        me.buttons = buttons;

        me.items = [
        {
            itemId  : 'user_id',
            xtype   : 'textfield',
            name    : "user_id",
            hidden  : true,
            value   : me.user_id
        },
        {
            xtype   : 'textfield',
            name    : "id",
            hidden  : true
        }, 
        {
            itemId      : 'owner',
            xtype       : 'displayfield',
            fieldLabel  : i18n('sOwner'),
            value       : me.owner,
            labelClsExtra: 'lblRdReq'
        },
        {
            xtype       : 'textfield',
            fieldLabel  : i18n('sName'),
            name        : "name",
            allowBlank  : false,
            blankText   : i18n("sSupply_a_value"),
            labelClsExtra: 'lblRdReq'
        },
        {
            xtype       : 'checkbox',      
            boxLabel    : i18n('sMake_available_to_sub_providers'),
            name        : 'available_to_siblings',
            inputValue  : 'available_to_siblings',
            checked     : false,
            cls         : 'lblRd'
        },
        {
            xtype:'fieldset',
            title: i18n('sOptional_Info'),
            collapsible: true,
            border: false,
            collapsed: true,
            defaults: {
                anchor: '100%'
            },
            items: [
            {
                xtype       : 'displayfield',
                fieldLabel  : i18n('sContact_detail'),
                labelClsExtra: 'lblRdGrouping'
       
            },          
            {
                xtype       : 'textfield',
                fieldLabel  : i18n('sPhone'),
                name        : "phone",
                allowBlank  : true
            },
            {
                xtype       : 'textfield',
                fieldLabel  : i18n('sFax'),
                name        : "fax",
                allowBlank  : true
            },
            {
                xtype       : 'textfield',
                fieldLabel  : i18n('sCell'),
                name        : "cell",
                allowBlank  : true
            },
            {
                xtype       : 'textfield',
                fieldLabel  : i18n('s_email'),
                name        : "email",
                allowBlank  : true
            },
            {
                xtype       : 'textfield',
                fieldLabel  : i18n('sURL'),
                name        : "url",
                allowBlank  : true
            },
            {
                xtype       : 'displayfield',
                fieldLabel  : i18n('sAddress'),
                labelClsExtra: 'lblRdGrouping'
            },
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
                xtype       : 'displayfield',
                fieldLabel  : i18n('sLocation'),
                labelClsExtra: 'lblRdGrouping'
            },
            {
                xtype       : 'textfield',
                fieldLabel  : i18n('sLongitude'),
                name        : "lon",
                allowBlank  : true
            },
            {   
                xtype       : 'textfield',
                fieldLabel  : i18n('sLatitude'),
                name        : "lat",
                allowBlank  : true
            }
        ]}
     
        ];
        this.callParent(arguments);
    }
});
