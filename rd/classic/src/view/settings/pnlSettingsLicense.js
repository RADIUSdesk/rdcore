Ext.define('Rd.view.settings.pnlSettingsLicense', {
    extend  : 'Ext.panel.Panel',
    alias   : 'widget.pnlSettingsLicense',
    border  : false,
    frame   : false,
    ui      : 'panel-blue',
    layout  : {
        type    : 'vbox',
        align   : 'stretch'
    },
    requires  : [
        'Rd.view.settings.winSettingsLicenseAdd'
    ],
    listeners   : {
        activate     : 'onViewLicenseActivate'
    },
    reference: 'pnlSettingsLicense',    
    initComponent: function () {
        var me  = this;        
        var plrDistro =  {
            xtype   : 'polar',
            width   : '100%',
            height  : 200,
            itemId  : 'pieLicense',
            interactions: ['rotate', 'itemhighlight'],
            innerPadding: 10,
            store: {
                 fields: ['name', 'data1'],
                 data: [
                     {
                        name    : '10 Nodes',
                        data1   : 10
                     }, 
                     {
                        name    : '5 APs',
                        data1   : 5
                     },
                     {
                        name    : '15 AVAILABLE',
                        data1   : 15
                     }
                 ]
            },

            series: {
                type       : 'pie',
                highlight  : true,
                angleField : 'data1',
                donut      : 50,
                colors     : ['#58a6a6', '#0c5578', '#75a641'],
                tooltip: {
                    trackMouse: true,
                    width: 140,
                    height: 28,
                    renderer: function (toolTip, record, ctx) {
                      toolTip.setHtml(record.get('name'));
                    }
                }
            },
            flex: 1
        };
       
        me.items = [
            {
                xtype   : 'panel',
                ui      : 'panel-blue',
                title   : 'Licensing',
                glyph   : Rd.config.icnLock,
                tools   : [
                    {
                        tooltip : 'Reload',
                        itemId  : 'toolReloadLicense',
                        glyph   : Rd.config.icnReload
                    }
                ], 
                layout  : {
                    type    : 'hbox',
                    align   : 'stretch'
                },
                items   : [
                    {
                        xtype   : 'container',
                        itemId  : 'cntInfo',
                        tpl     : new Ext.XTemplate(
                            '<div style="padding:10px;margin-left:20px;margin-top:20px;">',   
                                '<h1 style="font-size:175%;font-weight:lighter;color:#58a6a6;"><i class="fa fa-cube"></i> {m} Nodes Used</h1>',               
                                '<h1 style="font-size:175%;font-weight:lighter;color:#0c5578;"><i class="fa fa-wifi"></i> {a} APs Used</h1>',
                                '<h1 style="font-size:175%;font-weight:lighter;color:#75a641;"><i class="fa fa-plus"></i> {ta} Available</h1>',
                                '<p style="font-size:110%;" class="txtGrey txtBold">',
                                    'Total Licenses {l}',
                                    '<br>',
                                    'Total Used {tu}',
                                '</p>', 
                            '</div>'
                        ),
                        data    : {
                        },
                        flex :1
                    },
                    plrDistro
                ]
            },
            {
                xtype           : 'displayfield',
                fieldLabel      : 'License Key',
                name            : 'license_key',
                itemId          : 'dispLicenseKey',
                value           : '798789ghjgbuhtgf67rt6gugjkgh',
                labelClsExtra   : 'lblRdReq',
                labelWidth      : 100
            },
            {
                xtype   : 'button',
                text    : 'Upgrade License',
                ui      : 'button-teal',
                scale   : 'large',
                padding : 5,
                margin  : 5,
                listeners   : {
                    click     : 'onLicenseUpgradeClick'
                }    
            }
        ];           
        me.callParent(arguments);
    }
});
