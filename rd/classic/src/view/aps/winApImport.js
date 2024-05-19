Ext.define('Rd.view.aps.winApImport', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winApImport',
    closable    : true,
    draggable   : true,
    resizable   : true,
    title       : 'Import Access Points',
    width       : 500,
    height      : 300,
    plain       : true,
    border      : false,
    layout      : 'fit',
    glyph       : 'xf093@FontAwesome',
    autoShow    : false,
    defaults    : {
        border      : false
    },
    root	    : false,
    initComponent: function() {
        var me 		= this; 
        
        var hide_system = true;
        if(me.root){
            hide_system = false;
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
                labelWidth      : Rd.config.labelWidth,
                margin          : Rd.config.fieldMargin
            },
            defaultType: 'textfield',
            buttons : [
                {
                    itemId: 'btnSave',
                    text: i18n('sOK'),
                    scale: 'large',
                    iconCls: 'b-btn_ok',
                    glyph   : Rd.config.icnYes,
                    formBind: true,
                    margin: Rd.config.buttonMargin
                }
            ],
            items: [
				{
                    xtype       : 'textfield',
                    name        : 'cloud_id',
                    hidden      : true,
                    value       : me.cloud_id
                },
                {
                    xtype               : 'cmbApProfile',
                    include_all_option  : false,
                    labelClsExtra       : 'lblRdReq'
                },
                {
                    xtype       : 'filefield',
                    itemId      : 'csv_file',
                    emptyText   : 'Select CSV File..',
                    fieldLabel  : 'CSV List',
                    allowBlank  : false,
                    name        : 'csv_file',
                    buttonText  : '',
                    buttonConfig: {
                        iconCls     : 'upload-icon',
                        glyph       : Rd.config.icnFolder
                    },
                    regex       : /^.*\.(csv|CSV)$/,
                    regexText   : 'Only CSV files allowed',
                    labelClsExtra: 'lblRdReq'
                },
                {
                    xtype       : 'component',
                    padding     : 10,
                    margin      : 10,
                    autoEl      : {
                        tag     : 'a',
                        href    : '/cake4/rd_cake/files/sample_csv/ap.csv',
                        html    : 'Example Document',
                        target  : "_blank"
                    }
                }             
            ]
        });
        me.items = frmData;
        me.callParent(arguments);
    }
});
