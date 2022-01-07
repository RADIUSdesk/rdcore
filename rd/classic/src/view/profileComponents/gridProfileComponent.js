Ext.define('Rd.view.profileComponents.gridProfileComponent' ,{
    extend:'Ext.grid.Panel',
    alias : 'widget.gridProfileComponent',
    multiSelect: true,
    stateful: true,
    stateId: 'StateGridProfileComponent',
    stateEvents:['groupclick','columnhide'],
    border: false,
    requires: [
        'Ext.toolbar.Paging',
        'Ext.ux.ProgressBarPager'   
    ],
    comp_id:  null,
    tbar: [
        { xtype: 'buttongroup', title: i18n('sAction'),items : [ 
            {   xtype: 'button',  glyph: Rd.config.icnReload,  scale: 'large', itemId: 'reload',   tooltip:    i18n('sReload')},
            {   xtype: 'button',  glyph: Rd.config.icnDelete,   scale: 'large', itemId: 'delete',    tooltip:    i18n('sDelete')}
        ]}, 
        { xtype: 'buttongroup', title: i18n('sSelection'),items : [
            {   xtype: 'cmbVendor'     , itemId:'cmbVendor',    emptyText: i18n('sSelect_a_vendor') },
            {   xtype: 'cmbAttribute'  , itemId:'cmbAttribute', emptyText: i18n('sSelect_an_attribute') },
            {   xtype: 'button',  glyph: Rd.config.icnAdd,  scale: 'large', itemId: 'add',       tooltip:    i18n('sAdd')}
        ]}        
    ],
    
    initComponent: function(){

        var me = this;
     

        //Very important to avoid weird behaviour:
        me.plugins = [Ext.create('Ext.grid.plugin.CellEditing', {
                clicksToEdit: 1
        })];

        //Create a store specific to this Access Provider
        me.store = Ext.create(Ext.data.Store,{
            model: 'Rd.model.mProfileComponentEdit',
            proxy: {
                type        : 'ajax',
                format      : 'json',
                batchActions: true,
                extraParams : { 'comp_id' : me.comp_id },
                reader      : {
                    type            : 'json',
                    rootProperty    : 'items',
                    messageProperty : 'message'
                },
                writer      : { 
                    writeAllFields: true 
                },
                api         : {
                    create      : '/cake3/rd_cake/profile-components/add-comp.json',
                    read        : '/cake3/rd_cake/profile-components/index-comp.json',
                    update      : '/cake3/rd_cake/profile-components/edit-comp.json',
                    destroy     : '/cake3/rd_cake/profile-components/delete-comp.json'
                }
            },
            listeners: {
                load: function(store, records, successful) {
                    if(!successful){
                        Ext.ux.Toaster.msg(
                            'Error encountered',
                            store.getProxy().getReader().rawData.message.message,
                            Ext.ux.Constants.clsWarn,
                            Ext.ux.Constants.msgWarn
                        );
                        //console.log(store.getProxy().getReader().rawData.message.message);
                    } 
                },
                update: function(store, records, action, options,a,b) {
                    if(action == 'edit'){ //Filter for edit (after commited a second action will fire called commit)
                        store.sync({
                            success: function(batch,options){
                                Ext.ux.Toaster.msg(
                                    i18n('sUpdated_item'),
                                    i18n('sItem_has_been_updated'),
                                    Ext.ux.Constants.clsInfo,
                                    Ext.ux.Constants.msgInfo
                                ); 
                                store.load();  
                            },
                            failure: function(batch,options){
                                Ext.ux.Toaster.msg(
                                    i18n('sProblems_updating_the_item'),
                                    i18n('sItem_could_not_be_updated'),
                                    Ext.ux.Constants.clsWarn,
                                    Ext.ux.Constants.msgWarn
                                );
                                store.load();
                            }
                        });
                    }
                },
                scope: this
            },
            autoLoad: true,
            autoSync: false    
        });
        
         me.bbar     =  [
    			{
         	xtype       : 'pagingtoolbar',
         	store       : me.store,
             displayInfo : true,
             plugins     : {
                'ux-progressbarpager': true
            }
    			}  
        ];

        me.columns = [
          //  {xtype: 'rownumberer',stateId: 'StateGridProfileComponent1'},
            {
                header: i18n('sType'),
                dataIndex: 'type',
                width: 130,
                tdCls: 'grdEditable',
                editor: {
                    xtype: 'combobox',
                    typeAhead: true,
                    triggerAction: 'all',
                    selectOnTab: true,
                    store: [
                        ['check','Check'],
                        ['reply','Reply']
                    ],
                    lazyRender: true,
                    listClass: 'x-combo-list-small'
                },
                renderer: function(value){
                    if(value == "check"){
                        return i18n('sCheck');
                    }else{
                        return i18n('sReply');
                    }
                },stateId: 'StateGridProfileComponent2'
            },
            { text: i18n('sAttribute_name'),    dataIndex: 'attribute', tdCls: 'gridMain', flex: 1,stateId: 'StateGridProfileComponent3'},
            {
                header: i18n('sOperator'),
                dataIndex: 'op',
                width: 100,
                tdCls: 'grdEditable',
                editor: {
                    allowBlank: false,
                    xtype: 'combobox',
                    typeAhead: true,
                    triggerAction: 'all',
                    selectOnTab: true,
                    store: [
                        ['=' ,  '=' ],
                        [':=',  ':='],
                        ['+=',  '+='],
                        ['==',  '=='],
                        ['-=',  '-='],
                        ['<=',  '<='],
                        ['>=',  '>='],
                        ['!*',  '!*']
                    ],
                    lazyRender: true,
                    listClass: 'x-combo-list-small'
                },stateId: 'StateGridProfileComponent4'   
            },
            { text: i18n('sValue'),        dataIndex: 'value',     tdCls: 'grdEditable', flex: 1,editor: { xtype: 'textfield',    allowBlank: false},stateId: 'StateGridProfileComponent5'},
            { text: i18n('sComment'),      dataIndex: 'comment',   tdCls: 'grdEditable', flex: 1,editor: { xtype: 'textfield',  allowBlank: true},stateId: 'StateGridProfileComponent6'}
        ];
        me.callParent(arguments);
    }
});
