Ext.define('Rd.view.components.btnCommon', {
    extend      : 'Ext.button.Button',
    xtype       : 'btnCommon',
    itemId		: 'save',
    text		: i18n('sOK'),
    formBind	: true,
    scale		: Rd.config.btnScale,
    glyph   	: Rd.config.icnYes,
    margin		: Rd.config.buttonMargin,
    ui          : Rd.config.btnUiCommon
});
