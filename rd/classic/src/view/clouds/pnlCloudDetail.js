Ext.define('Rd.view.clouds.pnlCloudDetail', {
    extend      : 'Ext.form.Panel',
    alias       : 'widget.pnlCloudDetail',
    realm_id    : null,
    autoScroll	: true,
    plain       : true,
    frame       : false,
    layout      : {
        type    : 'vbox',
        pack    : 'start',
        align   : 'stretch'
    },
    margin      : 5,  
    cloud_id       : null,
    fieldDefaults: {
        msgTarget       : 'under',
        labelAlign      : 'left',
        labelSeparator  : '',
        labelWidth      : Rd.config.labelWidth+20,
        margin          : Rd.config.fieldMargin,
        labelClsExtra   : 'lblRdReq'
    },
    buttons : [
        {
            itemId  : 'save',
            text    : 'SAVE',
            scale   : 'large',
            formBind: true,
            glyph   : Rd.config.icnYes,
            margin  : Rd.config.buttonMargin,
            ui      : 'button-teal'
        }
    ],
    requires: [
        'Rd.view.clouds.vcCloudDetail'
    ],
    controller  : 'vcCloudDetail',
    listeners       : {
        activate  : 'onViewActivate'
    },
    initComponent: function(){
        var me      = this;
        var w_prim  = 550;
        
        var cntRequired  = {
            xtype       : 'container',
            width       : w_prim,
            layout      : 'anchor',
            defaults    : {
                anchor  : '100%'
            },
            items       : [
                {
                    xtype:  'hiddenfield',
                    name:   'parent_id',
                    hidden: true
                },
                {
                    xtype       : 'hiddenfield',
                    name        : 'id',
                    hidden      : true,
                    itemId      : 'editCloudId'
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'Name',
                    name        : 'name',
                    allowBlank  :false,
                    blankText   : i18n('sEnter_a_value'),
                    labelClsExtra: 'lblRdReq'
                },
                {
                    xtype       : 'tagAccessProviders'
                },
                {
                    xtype       : 'textfield',
                    grow        : true,
                    name        : 'lat',
                    fieldLabel  : 'Lat'
                },
                {
                    xtype       : 'textfield',
                    grow        : true,
                    name        : 'lng',
                    fieldLabel  : 'Lng'
                }
            ]
        }
           
      	me.items = [
            {
                xtype       : 'panel',
                title       : "General",
                glyph       : Rd.config.icnGears, 
                ui          : 'panel-blue',
                layout      : {
                  type  : 'vbox',
                  align : 'start',
                  pack  : 'start'
                },
                bodyPadding : 10,
                items       : cntRequired				
            }
        ];      

        me.callParent(arguments);
    }
});
