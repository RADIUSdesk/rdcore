Ext.define('Rd.view.components.cmbPredefinedCommand', {
    extend          : 'Ext.form.ComboBox',
    alias           : 'widget.cmbPredefinedCommand',
   // fieldLabel      : 'Predefined Command',//We dont need it in our GUI
    labelSeparator  : '',
    forceSelection  : true,
    queryMode       : 'remote',
    valueField      : 'id',
    displayField    : 'name',
    typeAhead       : true,
    allowBlank      : false,
    name            : 'predefined_command_id',
    extraParam      : false,
    queryMode       : 'remote',
    mode            : 'remote',
    pageSize        : 0, // The value of the number is ignore -- it is essentially coerced to a boolean, and if true, the paging toolbar is displayed.
    tpl	            : Ext.create('Ext.XTemplate',
        '<tpl for=".">',
            '<div  class="x-boundlist-item">',
                '<div>',
                    "<tpl if='action == \"execute\"'><span style=\"font-weight:bold;font-size:16px;\"><i class=\"fa fa-cogs\"></i> {name}</span></tpl>",
                    "<tpl if='action == \"execute_and_reply\"'><span style=\"font-weight:bold;font-size:16px;\"><i class=\"fa fa-cogs\"></i><i class=\"fa fa-comment\"></i> {name}</span></tpl>",
                '</div>',
            '</div>',
        '</tpl>'
    ),
    initComponent   : function() {
        var me= this;
        var s = Ext.create('Ext.data.Store', {
        fields: ['id', 'name', 'action'],
        proxy: {
                type    : 'ajax',
                format  : 'json',
                batchActions: true, 
                url     : '/cake3/rd_cake/predefined-commands/index-combo.json',
                reader: {
                    type            : 'json',
                    rootProperty    : 'items',
                    messageProperty : 'message',
                    totalProperty   : 'totalCount' //Required for dynamic paging
                }
            },
            autoLoad    : false
        });
        me.store = s;
        this.callParent(arguments);
    }
});
