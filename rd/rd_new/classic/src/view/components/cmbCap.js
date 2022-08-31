Ext.define('Rd.view.components.cmbCap', {
    extend: 'Ext.form.ComboBox',
    alias : 'widget.cmbCap',
    fieldLabel: i18n('sCap_type'),
    labelSeparator: '',
    forceSelection: true,
    queryMode     : 'local',
    displayField  : 'text',
    valueField    : 'id',
    typeAhead: true,
    allowBlank: false,
    mode: 'local',
    name: 'cap',
    labelClsExtra: 'lblRd',
    initComponent: function() {
        var me= this;
        var s = Ext.create('Ext.data.Store', {
            fields: ['id', 'text'],
            data : [
                {"id":"hard",       "text": i18n("sHard")},
                {"id":"soft",       "text": i18n("sSoft")}
            ]
        });
        me.store = s;
        this.callParent(arguments);
    }
});
