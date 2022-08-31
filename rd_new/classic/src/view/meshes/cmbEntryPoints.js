Ext.define('Rd.view.meshes.cmbEntryPoints', {
    extend          : 'Ext.form.ComboBox',
    alias           : 'widget.cmbEntryPoints',
    fieldLabel      : i18n('sConnects_with'),
    labelSeparator  : '',
    store           : 'sMeshEntryPoints',
    queryMode       : 'local',
    valueField      : 'id',
    displayField    : 'name',
    allowBlank      : false,
    editable        : false,
    mode            : 'local',
    itemId          : 'entry_points',
    name            : 'entry_points',
    value           : 'none',
    multiSelect     : true,
    labelClsExtra   : 'lblRdReq'
});
