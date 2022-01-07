Ext.define('Rd.controller.cPredefinedCommands', {
    extend: 'Ext.app.Controller',
    actionIndex: function(tp){
        var me      = this;  
        var newTab  = tp.items.findBy(function (tab){
            return tab.getXType() === 'gridPredefinedCommands';
        });    
        if (!newTab){
            newTab = tp.add({
                xtype   : 'gridPredefinedCommands',
                padding : Rd.config.gridPadding,
                border  : false,
                glyph   : Rd.config.icnComponent,
                title   : 'Predefined Commands',
                plain	: true,
                closable: true, 
                tabConfig: {
                    ui: Rd.config.tabDevices
                }
            });
        }
        tp.setActiveTab(newTab);
    },
    views:  [
        'predefinedCommands.gridPredefinedCommands',  'predefinedCommands.winPredefinedCommandsAddWizard'
    ],
    stores: ['sPredefinedCommands', 'sAccessProvidersTree'  ],
    models: ['mPredefinedCommand',  'mAccessProviderTree'   ],
    selectedRecord: null,
    config: {
        urlAdd:             '/cake3/rd_cake/predefined-commands/add.json',
        urlDelete:          '/cake3/rd_cake/predefined-commands/delete.json',
        urlEdit:            '/cake3/rd_cake/predefined-commands/edit.json',
        urlApChildCheck:    '/cake3/rd_cake/access-providers/child-check.json'
    },
    refs: [
        {  ref: 'grid',  selector:   'gridPredefinedCommands'}       
    ],
    init: function() {
        var me = this;
        if (me.inited) {
            return;
        }
        me.inited = true;
    }
});
