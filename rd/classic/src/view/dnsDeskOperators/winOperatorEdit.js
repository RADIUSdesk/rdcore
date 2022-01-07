Ext.define('Rd.view.dnsDeskOperators.winOperatorEdit', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winOperatorEdit',
    closable    : true,
    draggable   : true,
    resizable   : false,
    title       : 'Edit Operator',
    width       : 600,
    height      : 500,
    plain       : true,
    border      : false,
    layout      : 'fit',
    glyph       : Rd.config.icnEdit,
    autoShow    : false,
    record      : '',
    defaults: {
            border: false
    },
    requires: [
        'Ext.form.Panel',
        'Ext.form.field.Text',
        'Rd.view.dnsDeskOperators.vcOperator'
    ],
    controller  : 'vcOperator',
    initComponent: function() {
        var me 		= this; 
        
        var list        = [];
        //console.log(me.record); 
        Ext.Array.forEach(me.record.get('blockCategoryList'),function(item){
            var id      = item.id;
            var name    = item.name;
            var desc    = item.description;
            var c       = item.checkFlag;
            Ext.Array.push(list,{
                boxLabel: name, 
                name: 'cat_'+id, 
                inputValue: 'cat_'+id,
                checked     : c,
                autoEl: {
                    tag: 'div',
                    'data-qtip': desc
                }
            });
        });   
                     
        var frmData = Ext.create('Ext.form.Panel',{
            border:     false,
            layout:     'fit',
            autoScroll: false,
            defaults: {
                anchor: '100%'
            },
            fieldDefaults: {
                msgTarget       : 'under',
                labelClsExtra   : 'lblRd',
                labelAlign      : 'left',
                labelSeparator  : '',
                labelWidth      : Rd.config.labelWidth, 
                margin          : Rd.config.fieldMargin
            },
            defaultType: 'textfield',
            buttons : [
                {
                    itemId  : 'save',
                    text    : i18n('sOK'),
                    scale   : 'large',
                    glyph   : Rd.config.icnYes,
                    formBind: true,
                    margin  : Rd.config.buttonMargin
                }
            ],
            items: [
                {
                    xtype   : 'tabpanel',
                    layout  : 'fit',
                    xtype   : 'tabpanel',
                    margins : '0 0 0 0',
                    plain   : false,
                    tabPosition: 'bottom',
                    border  : false,
                    items   : [
                        { 
                            'title'     : 'Basic',
                            'layout'    : 'anchor',
                            itemId      : 'tabBasic',
                            defaults    : {
                                anchor: '100%'
                            },
                            autoScroll:true,
                            items       : [
                                {
                                    itemId  : 'id',
                                    xtype   : 'textfield',
                                    name    : "id",
                                    hidden  : true
                                },
                                {
                                    xtype       : 'textfield',
                                    fieldLabel  : i18n('sName'),
                                    name        : "name",
                                    allowBlank  : false,
                                    blankText   : i18n('sSupply_a_value'),
                                    labelClsExtra: 'lblRdReq'
                                },
				                {
                                    xtype       : 'textfield',
                                    fieldLabel  : 'Description',
                                    name        : "description",
                                    allowBlank  : true,
                                    labelClsExtra: 'lblRd'
                                }
                            ]
                        }
                    ]
                }
            ]
        });
        me.items = frmData;
		frmData.loadRecord(me.record);		
        me.callParent(arguments);
    }
});
