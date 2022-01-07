Ext.define('Rd.view.i18n.vCmbPhraseKeys', {
    extend: 'Ext.form.ComboBox',
    alias : 'widget.cmbPhraseKeys',
    fieldLabel: i18n('sChoose_a_key'),
    labelSeparator: '',
    store: 'sI18nPhraseKeys',
    queryMode: 'local',
    valueField: 'id',
    displayField: 'name',
    typeAhead: true,
    allowBlank: false,
    mode: 'local',
    itemId: 'cmbPhraseKey',
    listConfig : {
        getInnerTpl: function () {
            return  '<div data-qtip="{name}">'+
                    '<div class="combo-wrapper">'+
                    '<div class="combo-country">{name}</div>'+
                    '<div class="combo-language"> {comment}</div>'+
                    '</div>'+
                    '</div>';
            }
    },
    initComponent: function() {
        this.callParent(arguments);
    }
});
