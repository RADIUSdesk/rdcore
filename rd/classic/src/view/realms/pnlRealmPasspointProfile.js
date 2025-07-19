Ext.define('Rd.view.realms.pnlRealmPasspointProfile', {
    extend      : 'Ext.form.Panel',
    alias       : 'widget.pnlRealmPasspointProfile',
    autoScroll	: true,
    plain       : true,
    frame       : false,
    layout      : {
        type    : 'vbox',
        pack    : 'start',
        align   : 'stretch'
    },
    margin      : 5, 
    root	    : false,
    realm_id    : null, 
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
    requires    : [
        'Rd.view.realms.cntRealmNaiRealms',
        'Rd.view.realms.cntRealmRcois',
        'Rd.view.realms.vcRealmPasspointProfile',
    ],
    controller  : 'vcRealmPasspointProfile',
    initComponent: function(){
        var me          = this;
        var w_prim      = 550;
        var l_style     = 'color: #9d9d9d;font-stretch: expanded;font-weight:100;font-size:16px;';
        var plus_style  = 'text-align: left; display: block; margin:10px;margin-bottom:20px;';
       
        var cnt     = {
            xtype       : 'container',
            width       : w_prim,
            layout      : 'anchor',
            defaults    : {
                anchor  : '100%'
            },
            items       : [ 
                {
                    xtype       : 'textfield',
                    name        : 'realm_id',
                    hidden      : true,
                    value	    : me.realm_id
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'Name',
                    name        : 'name',
                    allowBlank  : false
                },
                {
                    xtype   : 'label',
                    itemId  : 'lblWarn',
                    hidden  : true,
                    style   : 'color:#de9516;font-stretch: expanded;font-weight:100;font-size:12px;padding:20px;',
                    html    : '<br><i class="fa fa-sticky-note"></i> Specify a RCOI or a NAI Realm or both<br><br>',
                },               
                {
                    xtype       : 'component',
                    html        : 'NAI REALMS (also called FQDN)',
                    cls         : 'heading'
                },               
                {
                    xtype   : 'container',
                    layout  : 'vbox',
                    itemId  : 'cntRealmNaiRealms'   
                },
                {
                    xtype   : 'component',
                    html    : '<a href="#" class="form-link"><i class="fa fa-plus"></i>   Add</a>',
                    style   : plus_style,  // Right-aligns the link
                    listeners: {
                        afterrender: function (cmp) {
                            cmp.getEl().on('click', function (e) {
                                e.preventDefault(); // Prevent default link behavior
                                me.fireEvent('addRealmNaiRealm');
                            });
                        }
                    }
                },
                {
                    xtype       : 'component',
                    html        : 'RCOI LIST',
                    cls         : 'heading'
                }, 
                {
                    xtype   : 'container',
                    layout  : 'vbox',
                    itemId  : 'cntRealmRcois'   
                },
                {
                    xtype   : 'component',
                    html    : '<a href="#" class="form-link"><i class="fa fa-plus"></i>   Add</a>',
                    style   : plus_style,  // Right-aligns the link
                    listeners: {
                        afterrender: function (cmp) {
                            cmp.getEl().on('click', function (e) {
                                e.preventDefault(); // Prevent default link behavior
                                me.fireEvent('addRealmRcoi');
                            });
                        }
                    }
                },               			
                {
                    xtype       : 'component',
                    html        : 'Authentication Settings',
                    cls         : 'heading'
                },            
                {
                    xtype       : 'combo',
                    fieldLabel  : 'EAP Method',
                    itemId      : 'cmbEapMethod',
                    name        : 'eap_method',
                    value       : 'ttls_mschap',
                    store       : [
                        ['ttls_pap', 'EAP-TTLS with PAP'],
                        ['ttls_mschap', 'EAP-TTLS with MSCHAPv2 (Recommended)']
                    ],
                    editable    : false,
                    forceSelection: true,
                    allowBlank  : false
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'Outer-Id Realm',
                    name        : 'anonymous_realm',
                    emptyText  : 'e.g. rd.com will result in anonymous@rd.com',
                    allowBlank  : false
                },
                {
                    xtype      : 'textareafield',
                    fieldLabel : 'CA Cert (PEM)',
                    name       : 'ca_cert',
                    itemId     : 'txtCaCert',
                    grow       : true,
                    height     : 150,
                    emptyText  : 'Paste the full CA certificate here (-----BEGIN CERTIFICATE-----)',
                    allowBlank : false
                },                              
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'Domain Suffix Match',
                    name        : 'domain_suffix_match',
                    emptyText  : 'Seperate multiple entries by ","',
                    labelClsExtra   : 'lblRd'
                }
            ]
        };
        
        var cntRegister = {
            xtype       : 'container',
            width       : w_prim,
            layout      : 'anchor',
            itemId      : 'cntRegister',
            defaults    : {
                anchor  : '100%'
            },
            items       : [
                 {
                    xtype       : 'component',
                    html        : 'User Registration',
                    cls         : 'heading'
                }, 
                {
                    xtype       : 'cmbProfile',
                    allowBlank  : false,
                    labelClsExtra: 'lblRdReq',
                    itemId      : 'profile'
                },
	            {
                    xtype       : 'checkbox',      
                    boxLabel    : 'Require Private PSK (PPSK)',
                    itemId      : 'chkRegPpsk',
                    name        : 'reg_ppsk',
                    inputValue  : 'reg_ppsk',
                    checked     : false,
                    cls         : 'lblRd'
                },
                {
                    xtype       : 'radiogroup',
                    itemId      : 'rgrpVlan',
                    columns     : 3,
                    listeners   : {
                        change : 'rgrpVlanChange'
                    },	
                    items       : [
                        { 
                            boxLabel    : 'No VLAN',
                            name        : 'reg_rb_vlan',
                            inputValue  : 'no_vlan',
                            margin      : '0 0 0 0',
                            checked     : true
                        },
                        { 
                            boxLabel    : 'Preselect',
                            name        : 'reg_rb_vlan',
                            inputValue  : 'pre_select',
                            margin      : '0 0 0 0'
                        },
                        { 
                            boxLabel    : 'Next Available',
                            name        : 'reg_rb_vlan',
                            inputValue  : 'next_available',
                            margin      : '0 0 0 0'
                        }
                    ]
                },
                {
                    xtype       : 'cmbRealmVlans',
                    itemId      : 'cmbRealmVlans',
                    labelClsExtra: 'lblRd'
                }  
            ]     
        }
        
                                                
        me.items = [
            {
                xtype   : 'panel',
                layout  : {
                  type  : 'vbox',
                  align : 'start',
                  pack  : 'start'
                },
                bodyPadding : 10,
                items       : [
                    cnt,
                  //  cntRegister             
                ]			
            }      
        ]   
      
        me.callParent(arguments);
    }
});
