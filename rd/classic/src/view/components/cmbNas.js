
Ext.define('Rd.view.components.cmbNas', {
    extend: 'Ext.form.ComboBox',
    alias : 'widget.cmbNas',
    fieldLabel: i18n('sNAS_IP_Address'),
    labelSeparator: '',
    forceSelection: true,
    queryMode: 'remote',
    valueField: 'id',
    displayField: 'nasname',
    typeAhead: true,
    allowBlank: false,
    mode: 'local',
    name: 'profile_id',
    pageSize        : 1, // The value of the number is ignore -- it is essentially coerced to a boolean, and if true, the paging toolbar is displayed.
    labelClsExtra: 'lblRd',
    listConfig: {
        getInnerTpl: function () {
            return  '<div data-qtip="{nasname} : {shortname}">'+
                    '<div class="combo-main">{nasname}</div>'+
                    '<div class="combo-detail"> {shortname}</div>'+
                    '</div>';
            }
    },
    initComponent: function() {
        var me= this;
        var s = Ext.create('Ext.data.Store', {
            model: 'Rd.model.mNas',
            buffered: false,
            //leadingBufferZone: 25, 
           // pageSize: 25,
            //To force server side sorting:
            remoteSort: true,
            proxy: {
                type    : 'ajax',
                format  : 'json',
                batchActions: true, 
                url     : '/cake3/rd_cake/nas/index.json',
                reader: {
                    type: 'json',
                    rootProperty: 'items',
                    messageProperty: 'message',
                    totalProperty: 'totalCount' //Required for dynamic paging
                },
                simpleSortMode: true //This will only sort on one column (sort) and a direction(dir) value ASC or DESC
            },
            autoLoad: false
        });
        me.store = s;
        this.callParent(arguments);
    }
});
