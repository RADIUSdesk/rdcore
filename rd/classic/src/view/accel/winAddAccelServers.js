Ext.define('Rd.view.accel.winAddAccelServer', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winAddAccelServer',
    closable    : true,
    draggable   : true,
    resizable   : true,
    title       : 'Add Accel-ppp Server',
    width       : 550,
    height      : 500,
    plain       : true,
    border      : false,
    layout      : 'fit',
    glyph       : Rd.config.icnAdd,
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
                margin          : Rd.config.fieldMargin,
                labelWidth		: 150
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
                    name        : 'name',
                    fieldLabel  : 'Name',
                    allowBlank  : false,
                    blankText   : 'Specify A Name',
                    margin      : Rd.config.fieldMargin +5,
                    labelClsExtra   : 'lblRdReq'
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
                    labelClsExtra   : 'lblRdReq'
                }                
            ]
        });
        me.items = frmData; 
        me.callParent(arguments);
    }
});
