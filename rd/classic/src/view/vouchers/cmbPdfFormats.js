Ext.define('Rd.view.vouchers.cmbPdfFormats', {
    extend          : 'Ext.form.ComboBox',
    alias           : 'widget.cmbPdfFormats',
    fieldLabel      : i18n('sOutput_format'),
    labelSeparator  : '',
    store           : 'sPdfFormats',
    queryMode       : 'local',
    valueField      : 'id',
    displayField    : 'name',
    allowBlank      : false,
    editable        : false,
    mode            : 'local',
    itemId          : 'pdf_format',
    name            : 'pdf_format',
    value           : 'a4',
    labelClsExtra   : 'lblRd'
});
