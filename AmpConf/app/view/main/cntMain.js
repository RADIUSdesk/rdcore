Ext.define('AmpConf.view.main.cntMain', {
    extend  : 'Ext.Container',
    xtype   : 'cntMain',
    controller  : 'vcMain',
    layout  : {
        type    : 'vbox',
        align   : 'center',
        pack    : 'center'
    },
    initialize : function(){
             
        this.callParent(arguments);
        
        var mac = "UNKNOWN";
        var hw  = false;
        
        var q_obj   = Ext.Object.fromQueryString(location.search);
        var keys    = Ext.Object.getKeys(q_obj);
        if(Ext.Array.contains(keys,'ssid')){
            mac = q_obj.ssid;
        }
        
        if(Ext.Array.contains(keys,'vlan')){
            hw = q_obj.vlan;
        }
        
        Ext.create('Ext.data.Store', {
            model   : 'AmpConf.model.mMesh',
            pageSize : 100,
            autoLoad : true,
            remoteFilter: true,
            storeId: 'sMeshes',
            proxy: {
                type    : 'ajax',
                format  : 'json',
                url     : '/cake3/rd_cake/meshes/index.json',
                reader: {
                    type            : 'json',
                    rootProperty    : 'items',
                    messageProperty : 'message',
                    totalProperty   : 'totalCount' //Required for dynamic paging
                }
            }
        });
        
        var store = Ext.data.StoreManager.lookup('sMeshes');
        
        store.on({
            load: 'onMeshesStoreLoaded',
            scope: this,
            single: true
        });
        
        this.setItems([
            {
                xtype       : 'formpanel',
                standardSubmit : false,
                title       : 'ADD DEVICE',
                reference   : 'frmSubmit',
                border      : true,
                fullscreen  : true,
                scrollable  : true,
               // width       : 600,
                layout      : 'vbox',
                defaults: {
                    errorTarget : 'under',
                    margin      : 5
                },

                items   : [
                    {
                        xtype   : 'hiddenfield',
                        name    : 'auto_cp',
                        value   : true
                    },
                    {
                        xtype   : 'hiddenfield',
                        name    : 'hardware',
                        value   : hw
                    },
                    {
                        xtype   : 'displayfield',
                        label   : 'MAC Address',
                        name    : 'mac',
                        readOnly: true,
                        value   : mac
                    },
                    {
                    xtype   : 'combobox',
                    autoSelect: true,
                    name    : 'mesh_id',
                    value   : null,
                    label   : 'Choose Network',
                    store   : store,
                    displayField    : 'name',
                    valueField      : 'id',
                    queryMode       : 'remote',
                    itemTpl         : '<div>{name} <b>({node_count} Nodes)</b></div>',
                    clearable       : false,
                    typeAhead       : true,
                    listeners       : {
                        change      : 'onCmbMeshChange'
                    }  
                },
                {
                    xtype       : 'textfield',
                    label       : 'Name',
                    reference   : 'txtName',
                    name        : 'name',
                    placeholder : 'Supply A Name',
                    required    : true
                },
                {
                    xtype           : 'combobox',
                    label           : 'Internet Connection',
                    queryMode       : 'local',
                    displayField    : 'text',
                    valueField      : 'id',
                    name            : 'internet_connection',
                    value           : 'auto_detect',
                    store           : {
                        fields  : ['id', 'text'],
                        data    : [
                            {"id":"auto_detect", "text": 'Auto Detect'},
                            {"id":"wifi",        "text": 'WIFI Client'}
                        ]
                    },
                    listeners       : {
                        change      : 'onCmbInternetConnectChange'
                    }  
                 },
                 {
                    xtype       : 'container',
                    style       : 'background-color: #e0ebeb',
                    itemId      : 'cntWbW',
                    reference   : 'cntWbW',
                    hidden      : true,
                    disabled    : true,
                    defaults: {
                        errorTarget : 'under',
                        margin      : 5
                    },
                    items       : [
                        {
                            xtype       : 'textfield',
                            label       : 'SSID',
                            name        : 'wbw_ssid',
                            itemId      : 'wbw_ssid',
                            required    : true,
                            maxLength   : 31,
                            placeholder : 'Specify a value to continue'
                        },
                        { 
                            xtype       : 'combobox',
                            label       : 'Encryption',
                            allowBlank  : false,
                            name        : 'wbw_encryption',
                            itemId      : 'wbw_encryption',
                            displayField: 'text',
                            valueField  : 'id',
                            value       : 'none',
                            store       :  {
                                fields: ['id', 'text'],
                                data : [
                                    {"id":"none",      "text": 'None'},
                                    {"id":"wep",       "text": 'WEP'},
                                    {"id":"psk",       "text": 'WPA Personal'},
                                    {"id":"psk2",      "text": 'WPA2 Personal'}           
                                ]
                            },
                            listeners   : {
						            change : 'onCmbEncryptionOptionsChange'
				            }  
                        },
                        {
                            xtype       : 'textfield',
                            label       : 'Passphrase',
                            name        : 'wbw_key',
                            itemId      : 'wbw_passphrase',
                            required    : true,
                            minLength   : 8,
                            hidden      : true,
                            disabled    : true
                        },
                        {
                            xtype   : 'radiogroup',
                            label   : 'Frequency',
                            vertical: false,
                            items   : [
                                { label: '2.4GHz',    name: 'wbw_freq', value: '2.4', checked: true },
                                { label: '5GHz',      name: 'wbw_freq', value: '5'},                               
                            ]
                        }
                    ]
                }       
            ],
            buttons : [
                {
                    xtype       : 'button',
                    reference   : 'btnLogout',
                    text        : 'Logout',
                    iconAlign   : 'right',
                    iconCls     : 'x-fa fa-power-off',
                    handler     : 'onLogoutTap',
                    ui          : 'normal'
                },
                '->',
                {
                    xtype       : 'button',
                    reference   : 'btnSubmit',
                    text        : 'Submit',
                    iconAlign   : 'right',
                    iconCls     : 'x-fa fa-check',
                    handler     : 'onSubmitTap',
                    ui          : 'action',
                    disabled    : true
                }     
            ]
        }]);
    },
    onMeshesStoreLoaded: function(store, records, success, options) {
        var me = this;
        me.down('combobox').setSelection(store.getAt(0));
    }
});
