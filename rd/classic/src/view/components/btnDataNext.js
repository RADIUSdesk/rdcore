Ext.define('Rd.view.components.btnDataNext', {
    extend      : 'Ext.button.Button',
    xtype       : 'btnDataNext',
    itemId      : 'btnDataNext',
    text        : i18n('sNext'),
    formBind	: true,
    scale		: Rd.config.btnScale,
    glyph       : Rd.config.icnNext,
    margin		: Rd.config.buttonMargin,
    ui          : Rd.config.btnUiDataNext    
});
