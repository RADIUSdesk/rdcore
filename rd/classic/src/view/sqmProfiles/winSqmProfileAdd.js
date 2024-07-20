Ext.define('Rd.view.sqmProfiles.winSqmProfileAdd', {
    extend:     'Ext.window.Window',
    alias :     'widget.winSqmProfileAdd',
    closable:   true,
    draggable:  true,
    resizable:  true,
    title:      'New SQM Profile',
    width       : 550,
    height      : 550,
    plain:      true,
    border:     false,
    layout:     'fit',
    glyph: Rd.config.icnAdd,
    autoShow:   false,
    defaults: {
            border: false
    },
    root	: false,
    initComponent: function() {
        var me          = this;
        var scrnData    = me.mkScrnData();
        me.items = [
            scrnData
        ];  
        this.callParent(arguments);
    }, 
   //_______ Data for ssids  _______
    mkScrnData: function(){
        var me      = this;
        var hide_system = true;
        if(me.root){
            hide_system = false;
        }      
        var frmData = Ext.create('Ext.form.Panel',{
            border:     false,
            layout:     'anchor',
            autoScroll: true,
            defaults: {
                anchor: '100%'
            },
            fieldDefaults: {
                msgTarget       : 'under',
                labelClsExtra   : 'lblRd',
                labelAlign      : 'left',
                labelSeparator  : '',
                labelClsExtra   : 'lblRd',
                margin          : Rd.config.fieldMargin,
                labelWidth		: 160
            },
            defaultType: 'textfield',
            items:[
                {
                    xtype       : 'displayfield',
                    fieldLabel  : 'Cloud',
                    value       : me.cloudName,
                    labelClsExtra: 'lblRdReq'
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : i18n('sName'),
                    name        : "name",
                    allowBlank  : false,
                    blankText   : i18n('sSupply_a_value'),
                    labelClsExtra: 'lblRdReq'
                },
                {
                    xtype       : 'cmbSqmQdiscOptions'
                },
                {
                    xtype       : 'cmbSqmScriptOptions'
                },
                {
                    xtype       : 'rdSliderSpeed',
                    minValue    : 0,
                    setValue    : 0,
                    sliderName  : 'limit_upload',
                    fieldLabel  : "<i class='fa fa-arrow-up'></i> Up"
                },
                {
                    xtype       : 'rdSliderSpeed',
                    minValue    : 0,
                    setValue    : 0,
                    sliderName  : 'limit_download',
                    fieldLabel  : "<i class='fa fa-arrow-down'></i> Down"
                },
               
                {
                    xtype       : 'checkbox',      
                    boxLabel    : 'System Wide',
                    name        : 'for_system',
                    inputValue  : 'for_system',
                    boxLabelCls	: 'boxLabelRd', 
                    hidden      : hide_system,
                    disabled    : hide_system
                }
            ],
            buttons: [
                {
                    itemId  : 'btnAddSave',
                    text    : i18n('sSave'),
                    scale   : 'large',
                    glyph   : Rd.config.icnYes,
                    formBind: true,
                    margin  : '0 20 40 0'
                }
            ]
        });
        return frmData;
    }   
});
