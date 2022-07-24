Ext.define('Rd.view.components.vLanguagesCmb', {
    extend: 'Ext.form.ComboBox',
    alias : 'widget.cmbLanguage',
    fieldLabel: i18n('sChoose_a_language'),
    labelSeparator: '',
    store: 'sLanguages',
    queryMode: 'local',
    valueField: 'id',
    displayField: 'text',
    typeAhead: true,
    mode: 'local',
    itemId: 'cmbLanguage',
    listConfig : {
        getInnerTpl: function () {
            return  '<div data-qtip="{country} : {language}">'+
                    '<div class="combo-wrapper">'+
                    '<div class="combo-country">{country}<img src="{icon_file}" /></div>'+
                    '<div class="combo-language"> {language}</div>'+
                    '</div>'+
                    '</div>';
            }
    },
    initComponent: function() {
        this.callParent(arguments);
    }
});
