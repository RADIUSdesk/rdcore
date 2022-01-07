Ext.define('Rd.view.settings.cmbMapPrefs', {
    extend: 'Ext.form.ComboBox',
    alias: 'widget.cmbMapPrefs',
    fieldLabel: 'Map Preference',
    labelSeparator: '',
    queryMode: 'local',
    valueField: 'map',
    displayField: 'name',
    editable: false,
    mode: 'local',
    itemId: 'map_pref',
    name: 'map_to_use',
    value: 'Google Maps',
    multiSelect: false,
    labelClsExtra: 'lblRd',
    allowBlank: false,
    excludeCustom: false,
    initComponent: function () {
        var me = this;
        var maps = Ext.create('Ext.data.Store', {
            fields: ['map', 'name'],
            data: [
                { "map": "google", "name": "Google Maps" },
                { "map": "baidu", "name": "Baidu Maps" }
    
            ]
        });
        me.store = maps;
        me.callParent(arguments);
    }
});
