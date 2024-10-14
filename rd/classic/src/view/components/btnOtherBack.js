Ext.define('Rd.view.components.btnOtherBack', {
    extend      : 'Ext.button.Button',
    xtype       : 'btnOtherBack',
    glyph       : Rd.config.icnBack,  
    text        : 'Back',
    ui          : 'button-pink',
    handler     : function(){
        Ext.getApplication().runAction('cMainOther','BackButton');
    }
});
