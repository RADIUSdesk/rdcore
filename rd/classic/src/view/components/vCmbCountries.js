Ext.define('Rd.view.components.vCmbCountries', {
    extend: 'Ext.form.ComboBox',
    alias : 'widget.vCmbCountries',
    fieldLabel: i18n('sChoose_a_country'),
    labelSeparator: '',
    store: 'sCountries',
    queryMode: 'local',
    valueField: 'id',
    displayField: 'name',
    typeAhead: true,
    allowBlank: false,
    mode: 'local',
    itemId: 'cmbCountry',
    listConfig : {
        getInnerTpl: function () {
            return  '<div data-qtip="{name} ({iso_code})">'+
                    '<div class="combo-wrapper"><img src="{icon_file}" />'+
                    '<div class="combo-country">{name}</div>'+
                    '<div class="combo-language"> {iso_code}</div>'+
                    '</div>'+
                    '</div>';
            }
    },
    initComponent: function() {
        this.callParent(arguments);
    }
});
