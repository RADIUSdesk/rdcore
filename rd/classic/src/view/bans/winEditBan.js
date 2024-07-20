Ext.define('Rd.view.bans.winEditBan', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winEditBan',
    closable    : true,
    draggable   : true,
    resizable   : true,
    title       : 'Edit Block Or Speed Limit',
    width       : 550,
    height      : 500,
    plain       : true,
    border      : false,
    layout      : 'fit',
    glyph       : Rd.config.icnEdit,
    autoShow    :   false,
    defaults: {
            border: false
    },
    requires: [
    ],
    initComponent: function() {
        var me      = this;
        
        var cmbApProfile = Ext.create('Rd.view.components.cmbApProfile',{
		    itemId      : 'ap_profile_id',
		    hidden		: true,
		    disabled	: true
	    });
	    
	    var cmbMesh = Ext.create('Rd.view.components.cmbMesh',{
		    itemId      : 'mesh_id',
		    hidden		: true,
		    disabled	: true
	    });
	    
	    var sldrUpload = Ext.create('Rd.view.components.rdSliderSpeed',{
            xtype       : 'rdSliderSpeed',
            sliderName  : 'limit_upload',
            itemId		: 'bw_up',
            fieldLabel  : "<i class='fa fa-arrow-up'></i> Up",
            hidden		: true,
            disabled	: true
        });
        
        var sldrDownload = Ext.create('Rd.view.components.rdSliderSpeed',{
            xtype       : 'rdSliderSpeed',
            sliderName  : 'limit_download',
            itemId		: 'bw_down',
            fieldLabel  : "<i class='fa fa-arrow-down'></i> Down",
            hidden		: true,
            disabled	: true
        });
        
        var cmbFirewall = Ext.create('Rd.view.components.cmbFirewallProfile',{
        	fieldLabel	: 'Firewall Profile',
        	include_all_option : false,
        	disabled	: true,
        	hidden		: true,
        	labelClsExtra: 'lblRdReq'       
        });
	    
	    var cloud_id	= me.record.get('cloud_id');
	    var mesh_id		= me.record.get('mesh_id');
	    var ap_profile_id = me.record.get('ap_profile_id');
	    var	rb_cloud	= true;
	    var rb_mesh		= false;
	    var rb_ap_p		= false;
	    
	    var action		= me.record.get('action');
	    var rb_block	= true;
	    var rb_limit	= false;
	    var rb_firewall = false;
	    
	    if(action == 'limit'){
	    	rb_block	= false;
	        rb_limit	= true;
	        sldrUpload.setHidden(false);
	    	sldrUpload.setDisabled(false);
	        sldrDownload.setHidden(false);
	    	sldrDownload.setDisabled(false);
	    	
	    	sldrUpload.down('numberfield').setValue(me.record.get('bw_up'));
	    	sldrDownload.down('numberfield').setValue(me.record.get('bw_down'));
	    	sldrUpload.down('combobox').setValue(me.record.get('bw_up_suffix'));
	    	sldrDownload.down('combobox').setValue(me.record.get('bw_down_suffix'));
	    	    	
	    }  
	    
	    if(action == 'firewall'){
	    	rb_block	= false;
	        rb_firewall = true;
	        cmbFirewall.setHidden(false);
	    	cmbFirewall.setDisabled(false);	
	    	cmbFirewall.setValue(me.record.get('firewall_profile_id'));	    	    	
	    }   
	     	    
	    if(mesh_id > 0){
	    	rb_cloud	= false;
	    	rb_mesh		= true;
	    	rb_ap_p		= false;
	    	cmbMesh.setHidden(false);
	    	cmbMesh.setDisabled(false);
	    	cmbMesh.getStore().load();
			cmbMesh.setValue(mesh_id);//Show it	 	
	    }
	    
	    if(ap_profile_id > 0){
	    	rb_cloud	= false;
	    	rb_mesh		= false;
	    	rb_ap_p		= true;
	    	cmbApProfile.setHidden(false);
	    	cmbApProfile.setDisabled(false);
	    	cmbApProfile.getStore().load();
			cmbApProfile.setValue(ap_profile_id);//Show it	    	
	    }
               
        var frmData = Ext.create('Ext.form.Panel',{
            border:     false,
            layout:     'anchor',
            autoScroll: true,
            defaults: {
                anchor: '100%'
            },
            fieldDefaults: {
                msgTarget       : 'under',
                labelClsExtra   : 'lblRd',
                labelAlign      : 'left',
                labelSeparator  : '',
                labelClsExtra   : 'lblRd',
                margin          : Rd.config.fieldMargin
            },
            defaultType: 'textfield',
            buttons: [
                {
                    itemId      : 'save',
                    formBind    : true,
                    text        : 'SAVE',
                    scale       : 'large',
                    glyph       : Rd.config.icnYes,
                    margin      : Rd.config.buttonMargin,
                    ui          : 'button-teal'
                }
            ],
            items: [
            
            	 {
                    xtype       :  'hiddenfield',
                    name        :   'id',
                    hidden      : true,
                    value		: me.record.get('id')
                },            	
				{
                    name        : 'mac',
                    fieldLabel  : 'MAC',
                    allowBlank  : false,
                    blankText   : 'Specify A MAC Address',
					vtype       : 'MacColon',
					fieldStyle  : 'text-transform:uppercase',
                    itemId      : 'txtMac',
                    margin      : Rd.config.fieldMargin +5,
                    labelClsExtra   : 'lblRdReq',
                    value		: me.record.get('mac')
                },
				{
                    name        : 'alias',
                    fieldLabel  : 'Alias',
                    allowBlank  : true,
                    blankText   : 'Specify An Unique Alias',
                    itemId      : 'txtAlias',
                    margin      : Rd.config.fieldMargin +5,
                    value		: me.record.get('alias')
                },
                {
					xtype		: 'radiogroup',
					columns		: 3,
					vertical	: false,
					items		: [
						{ boxLabel: 'Cloud Wide', 	name: 'scope', inputValue: 'cloud_wide', checked: rb_cloud,	margin: 2 },
						{ boxLabel: 'Mesk Network', name: 'scope', inputValue: 'mesh_only',checked: rb_mesh, 	margin: 2},
						{ boxLabel: 'AP Profile',  	name: 'scope', inputValue: 'ap_profile_only', checked: rb_ap_p, margin	: 2}
					],
					listeners   : {
				        change  : 'rgrpScopeChange'
			        }
				},
				cmbApProfile,
				cmbMesh,
                {
					xtype		: 'radiogroup',
					columns		: 3,
					vertical	: false,
					items		: [
						{ boxLabel: 'Block', 	   name: 'action', inputValue: 'block', checked: rb_block ,margin: 2 },
						{ boxLabel: 'Speed Limit', name: 'action', inputValue: 'limit', checked: rb_limit ,margin: 2 },
						{ boxLabel: 'Firewall Profile', name: 'action', inputValue: 'firewall', checked: rb_firewall ,margin: 2 }
					],
					listeners   : {
				        change  : 'rgrpActionChange'
			        }
				},
				sldrUpload,
                sldrDownload,
                cmbFirewall                
            ]
        });
        me.items = frmData; 
        me.callParent(arguments);
    }
});
