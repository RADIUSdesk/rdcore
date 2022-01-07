Ext.define('Rd.view.realms.winRealmAdd', {
    extend:     'Ext.window.Window',
    alias :     'widget.winRealmAdd',
    closable:   true,
    draggable:  false,
    resizable:  false,
    title:      i18n('sAdd_realm'),
    width:      300,
    height:     500,
    plain:      true,
    border:     false,
    layout:     'card',
    iconCls:    'add',
    glyph:      Rd.config.icnAdd,
    defaults: {
            border: false
    },
    requires: [
        'Ext.layout.container.Card',
        'Ext.form.Panel',
        'Ext.form.field.Text',
        'Ext.form.FieldContainer',
        'Ext.form.field.Radio'
    ],
     initComponent: function() {
        var me = this;
       /* var scrnIntro       = me.mkScrnIntro();
        var scrnNewCountry  = me.mkScrnNewCountry();
        var scrnNewLanguage = me.mkScrnNewLanguage();
        this.items = [
            scrnIntro,
            scrnNewCountry,
            scrnNewLanguage
        ]; */
        this.callParent(arguments);
    }
    //____ INTRO SCREEN ____

});
