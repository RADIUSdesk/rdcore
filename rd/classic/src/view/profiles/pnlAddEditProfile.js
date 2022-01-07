Ext.define('Rd.view.profiles.pnlAddEditProfile', {
    extend      : 'Ext.form.Panel',
    alias       : 'widget.pnlAddEditProfile',
    title       : 'Edit Profile',
    autoScroll	: true,
    plain       : true,
    layout      : 'vbox',
    //Some defaults
	profileId   : 0,
	user_id     : -1,
	username    : '',
	hide_owner  : true,
    defaults    : {
            border: false
    },
    fieldDefaults: {
        msgTarget       : 'under',
        labelAlign      : 'left',
        labelSeparator  : '',
        labelWidth      : Rd.config.labelWidth,
        margin          : Rd.config.fieldMargin,
        labelClsExtra   : 'lblRdReq'
    },
    requires: [
        'Ext.form.field.Text',
        'Rd.view.profiles.vcProfileGeneric',
        'Rd.view.profiles.pnlDataLimit',
        'Rd.view.profiles.pnlTimeLimit'
    ],
    controller  : 'vcProfileGeneric',
    listeners       : {
        show : 'loadProfileContent' //Trigger a load of the settings (This is only on the initial load)
    },
    initComponent: function() {
         var me 	        = this; 
         var w_prim         = 550;
         var w_sec          = 350;
         var hide_multiple  = true;
         var gen_height     = 200;         
           
		// Are we creating a new one or editing an existing one?
		var saveItemId = (me.profileId == 0) ? 'addsave' : 'editsave';

		if(saveItemId == 'addsave'){
		    me.glyph        = Rd.config.icnAdd;
		    hide_multiple   = false;
		    gen_height      = 250; // Make it a bit higher
		}
		
		if(saveItemId == 'editsave'){
		    me.glyph = Rd.config.icnEdit
		}
		
		me.buttons = [
            {
                itemId  : saveItemId,
                text    : 'SAVE',
                scale   : 'large',
                formBind: true,
                glyph   : Rd.config.icnYes,
                margin  : Rd.config.buttonMargin,
                ui      : 'button-teal'
            }
        ];
               
		me.items = [
            {
                xtype       : 'panel',
                bodyStyle   : 'background: #f0f0f5',
                bodyPadding : 10,
                items       : [              
                    {
						xtype       : 'checkbox',      
						fieldLabel  : 'Add Multiple',
						itemId      : 'chkMultiple',
						hidden      : hide_multiple
					},
                    {
                        xtype       : 'fieldcontainer',
                        itemId      : 'fcPickOwner',
                        hidden      : me.hide_owner,  
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
                                value       : me.username,
                                name        : 'username',
                                itemId      : 'displUser',
                                margin      : 0,
                                padding     : 0,
                                width       : w_prim - 110
                            },
                            {
                                xtype       : 'button',
                                text        : 'Pick Owner',
                                margin      : 5,
                                padding     : 5,
                                ui          : 'button-green',
                                itemId      : 'btnPickOwner',
                                width       : 100,
                                listeners       : {
                                    click : 'onBtnPickOwnerClick'
                                }          
                            },
                            {
                                xtype       : 'textfield',
                                name        : "user_id",
                                itemId      : 'hiddenUser',
                                hidden      : true,
                                value       : me.user_id
                            }
                        ]
                    },
                    {

                        xtype       : 'textfield',
                        name        : "id",
                        itemId      : 'hiddenUser',
                        hidden      : true
                    },   
                    {
					    xtype       : 'textfield',
					    fieldLabel  : i18n("sName"),
					    name        : "name",
					    allowBlank  : false,
					    blankText   : i18n("sSupply_a_value"),
					    width       : w_prim
				    },
				    {
                        xtype       : 'checkbox',
                        boxLabel    : 'Available To Sub-Providers',
                        //fieldLabel  : 'Available To Sub-Providers',
                        name        : 'available_to_siblings',
                        margin      : '0 0 0 15'   
                    }
                ],
                height      : gen_height
            },         
            {
                xtype       : 'panel',
                bodyStyle   : 'background:#f6f6ee',
                layout      : {
                        type    : 'vbox',
                        pack    : 'start',
                        align   : 'middle'
                },
                bodyPadding : 10,
                items       : [
                     {
                        xtype       : 'container',
                        html        : '<h1><span style="color:grey;font-weight:700; font-size: smaller;">PROFILE LIMITS</span><h1>'
                    },
                    {
                        xtype       : 'container',
                        layout      : {
                            type    : 'hbox',
                            pack    : 'center',
                            align   : 'stretchmax'
                        },
                        items       : [
                            {
                                itemId      : 'pnlDataLimit',
                                hidden      : false,
                                flex        : 1,
                                ui          : 'panel-green',
                                xtype       : 'pnlDataLimit'
                            },
                            {
                                itemId      : 'pnlTimeLimit',
                                hidden      : false,
                                flex        : 1,
                                ui          : 'panel-blue',
                                xtype       : 'pnlTimeLimit'
                            }
                        ]
                    },
                    {
                        xtype       : 'container',
                        layout      : 'hbox',
                        items       : [
                            {
                                itemId      : 'pnlSpeedLimit',
                                hidden      : false,
                                flex        : 1,
                                ui          : 'panel-green',
                                xtype       : 'pnlSpeedLimit'
                            }
                        ]
                    }
                ],
                height      : 1000
            }  
        ];
     
        me.callParent(arguments);
    }
});
