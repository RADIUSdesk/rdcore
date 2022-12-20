Ext.define('Rd.view.profiles.pnlEditProfileFup', {
    extend      : 'Ext.form.Panel',
    alias       : 'widget.pnlEditProfileFup',
    autoScroll	: true,
    plain       : true,
    layout      : 'vbox',
    //Some defaults
	profileId   : 0,
    defaults    : {
            border: false
    },
    fieldDefaults: {
        msgTarget       : 'under',
        labelAlign      : 'left',
        labelSeparator  : '',
        labelWidth      : Rd.config.labelWidth,
        //margin          : Rd.config.fieldMargin,
        labelClsExtra   : 'lblRd'
    },
    requires: [
      
    ],
    listeners       : {

    },
    initComponent: function() {
        var me 	    = this;
        var w_prim  = 450;
        var w_sec   = 350;
 	
		me.buttons  = [
            {
                text    : 'SAVE',
                scale   : 'large',
                formBind: true,
                itemId  : 'save',
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
					    xtype       : 'textfield',
					    fieldLabel  : i18n("sName"),
					    name        : "name",
					    allowBlank  : false,
					    blankText   : i18n("sSupply_a_value"),
					    width       : w_prim,
                        margin      : Rd.config.fieldMargin
				    },
                    {
                        xtype       : 'textfield',
                        hidden      : true,
                        name        : 'id'
                    },
                 /*   {
                        itemId      : 'pnlPppoe',
                        ui          : 'panel-blue',
                        xtype       : 'pnlPppoe'
                    },*/
                    {
                        itemId      : 'pnlFupComponents',
                        ui          : 'panel-green',
                        xtype       : 'pnlFupComponents'
                    }
                ]
            }
        ];
        
        me.callParent(arguments);
    }
});
