Ext.define('Rd.view.meshes.cmbHardwareOptions', {
    extend          : 'Ext.form.ComboBox',
    alias           : 'widget.cmbHardwareOptions',
    fieldLabel      : i18n('sHardware_model'),
    labelSeparator  : '',
    queryMode       : 'local',
    valueField      : 'id',
    displayField    : 'name',
    allowBlank      : false,
    editable        : false,
    mode            : 'local',
    itemId          : 'hardware',
    name            : 'hardware',
    emptyText       : 'Select A Hardware Model',
    tpl	            : Ext.create('Ext.XTemplate',
        '<tpl for=".">',
            '<div  class="x-boundlist-item">',
                '<img src="/cake4/rd_cake/img/hardwares/{photo_file_name}" alt="Hardware Model" style="float:right;width:42px;height:42px;">',
                '<div>',
		            '<span style="font-weight:bold;font-size:16px;">{vendor}</span>',
               	    '<span style="font-size: 14px;color: #4d4d4d;">   {model}</span>',
                '</div>',
                '<div style="border-bottom: 1px solid lightgrey;">',
                    '<ul class="fa-ul">',
                        "<tpl if='radios == \"3\"'>",
                            '<li style="color: #d35b0a;"><i class="fa-li fa fa-wifi"></i>Tri Radio</li>',
                        '</tpl>',
                        "<tpl if='radios == \"2\"'>",
                            '<li style="color: #4286f4;"><i class="fa-li fa fa-wifi"></i>Dual Radio</li>',
                        '</tpl>',
                        "<tpl if='radios == \"1\"'>",
                            '<li style="color: #20871f;"><i class="fa-li fa fa-wifi"></i>Single Radio</li>',
                        '</tpl>',
                        "<tpl if='radios == \"0\"'>",
                            '<li style="color: #f49b42;"><i class="fa-li fa fa-exclamation-circle"></i>No Radio</li>',
                        '</tpl>',
                    '</ul>',
                '</div>',    
            '</div>',
        '</tpl>'
    ),
    displayTpl		: Ext.create('Ext.XTemplate',
        '<tpl for=".">',
            '{vendor} - {model}',
        '</tpl>'
    ),
    initComponent: function(){
        var me      = this;
        var s       = Ext.create('Ext.data.Store', {
            fields: ['id', 'name','radios','vendor','model','device_type'],
            pageSize: 500, // <-- Set your desired page size here
            proxy: {
                    type    : 'ajax',
                    format  : 'json',
                    batchActions: true, 
                    url     : '/cake4/rd_cake/hardwares/meshes_list.json',
                    reader: {
                        type            : 'json',
                        rootProperty    : 'items',
                        messageProperty : 'message'
                    }
            },
            autoLoad: true
        });
        me.store = s;
        me.callParent(arguments);
    }
});
