Ext.define('Rd.view.dynamicDetails.cmbDynamicDetailTransOptions', {
    extend          : 'Ext.form.ComboBox',
    alias           : 'widget.cmbDynamicDetailTransOptions',
   // fieldLabel      : 'Follow Up',
  //  labelSeparator  : '',
    queryMode       : 'local',
    valueField      : 'id',
    displayField    : 'name',
    editable        : false,
    mode            : 'local',
    name            : 'translate_option',
    multiSelect     : false,
    labelClsExtra   : 'lblRd',
    allowBlank      : false,
    excludeCustom   : false,
    value           : "phrase",
    isRoot          : false,
    initComponent   : function(){
        var me       = this;
        var data     = [
            {'id':'key',        'name':'Key'},
            {'id':'phrase',     'name':'Phrase'}   
        ];
       
        if(me.isRoot){
            data     = [
                {'id':'language',   'name':'Language'},
                {'id':'key',        'name':'Key'},
                {'id':'phrase',     'name':'Phrase'}   
            ];
        } 
                
        var reSupply = Ext.create('Ext.data.Store', {
            fields: ['id', 'name'],
            data : data
        });
        me.store = reSupply;
        me.callParent(arguments);
    }
});
