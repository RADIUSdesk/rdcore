Ext.define('Rd.view.components.btnDataPrev', {
    extend      : 'Ext.button.Button',
    xtype       : 'btnDataPrev',
    itemId      : 'btnDataPrev',
    text        : i18n('sPrev'),
    scale		: Rd.config.btnScale,
    glyph       : Rd.config.icnBack,
    margin		: Rd.config.buttonMargin,
    ui          : Rd.config.btnUiDataPrev    
});
