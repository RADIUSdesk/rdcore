Ext.define('Rd.view.i18n.vWinI18n', {
    extend: 'Ext.window.Window',
    alias : 'widget.i18nW',
    width: 600,
    height: 400,
    layout: 'fit',
    title: i18n('si18n_Manager'),
    stateful: true,
    stateId: 'stateWin',
    icon: 'resources/images/16x16/i18n.png',
   // ui: 'custom',
    requires: ['Rd.view.i18n.vPanI18n'],
    items: [ {'xtype' : 'i18nP'}],
    initComponent: function() {
        this.callParent(arguments);
    }
});
