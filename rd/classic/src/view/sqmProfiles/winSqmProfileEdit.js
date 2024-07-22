Ext.define('Rd.view.sqmProfiles.winSqmProfileEdit', {
    extend:     'Ext.window.Window',
    alias :     'widget.winSqmProfileEdit',
    closable:   true,
    draggable:  true,
    resizable:  true,
    title       : 'Edit SQM Profile',
    width       : 550,
    height      : 500,
    plain       : true,
    border      : false,
    layout      : 'fit',
    glyph       : Rd.config.icnEdit,
    autoShow    : false,
    defaults    : {
            border: false
    },
    root	: false,
    initComponent: function() {
        var me 		= this; 
        var hide_system = true;
        if(me.root){
            hide_system = false;
        } 
        
        var sldrUpload = Ext.create('Rd.view.components.rdSliderSpeed',{
            sliderName  : 'upload',
            itemId		: 'sldrUpload',
            fieldLabel  : "<i class='fa fa-arrow-up'></i> Up",
            minValue    : 0
        });
        
        var sldrDownload = Ext.create('Rd.view.components.rdSliderSpeed',{
            sliderName  : 'download',
            itemId		: 'sldrDownload',
            fieldLabel  : "<i class='fa fa-arrow-down'></i> Down",
            minValue    : 0
        });
        
        sldrUpload.down('numberfield').setValue(me.record.get('upload'));
	    sldrDownload.down('numberfield').setValue(me.record.get('download'));
	    sldrUpload.down('combobox').setValue(me.record.get('upload_suffix'));
	    sldrDownload.down('combobox').setValue(me.record.get('download_suffix'));	  
        
        var cmbScript = Ext.create('Rd.view.sqmProfiles.cmbSqmScriptOptions',{
        });
        
        var cmbQdisc = Ext.create('Rd.view.sqmProfiles.cmbSqmQdiscOptions',{
        });
        
        //Note you can't specify the value when you declare the item since it will then not do formbind properly with the save button
        cmbQdisc.setValue(me.record.get('qdisc'));
	    cmbScript.setValue(me.record.get('script'));
      
                             
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
                labelWidth      : 160,
                margin          : Rd.config.fieldMargin
            },
            defaultType: 'textfield',
             buttons: [
                {
                    itemId      : 'btnSave',
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
                    xtype       : 'textfield',
                    name        : 'id',
                    hidden      : true,
                    value		: me.record.get('id')
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : i18n('sName'),
                    name        : "name",
                    allowBlank  : false,
                    blankText   : i18n('sSupply_a_value'),
                    labelClsExtra: 'lblRdReq',
                    value		: me.record.get('name')
                },
                cmbScript,
                cmbQdisc,
                sldrUpload,
                sldrDownload,
                {
                    xtype       : 'checkbox',      
                    boxLabel    : 'System Wide',
                    name        : 'for_system',
                    inputValue  : 'for_system',
                    boxLabelCls	: 'boxLabelRd', 
                    hidden      : hide_system,
                    disabled    : hide_system,
                    value		: me.record.get('for_system')
                }
            ]
        });
        me.items = frmData;  
	    me.callParent(arguments);
        
    }
});
