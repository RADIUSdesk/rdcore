Ext.define('Rd.view.components.vCmbJustLanguages', {
    extend: 'Ext.form.ComboBox',
    alias : 'widget.cmbJustLanguages',
    fieldLabel: i18n('sChoose_a_language'),
    labelSeparator: '',
    store: 'sJustLanguages',
    queryMode: 'local',
    valueField: 'id',
    displayField: 'name',
    typeAhead: true,
    allowBlank: false,
    mode: 'local',
    itemId: 'cmbJustLanguage',
    listConfig : {
        getInnerTpl: function () {
            return  '<div data-qtip="{name}">'+
                    '<div class="combo-wrapper">'+
                    '<div class="combo-country"> {name}</div>'+
                    '<div class="combo-language"> {iso_code}</div>'+
                    '</div>'+
                    '</div>';
            }
    },
    initComponent: function() {
        this.callParent(arguments);
    }
});
