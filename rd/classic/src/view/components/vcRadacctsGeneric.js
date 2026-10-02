Ext.define('Rd.view.components.vcRadacctsGeneric', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcRadacctsGeneric',
    config: {
        urlAlias    : '/cake4/rd_cake/radaccts/addStationAlias.json'
    },
    control : {
        'gridRadacctsGeneric #reload' : {
	        click   : 'reload'
	    },
	    'gridRadacctsGeneric #connected': {
            click   : 'reload'
        },
        'gridRadacctsGeneric #cmbTimezone': {
            afterrender : 'reload',
            change      : 'reload'
        },
        'gridRadacctsGeneric' : {
            activate    : 'reload',
            cellclick   : function (grid, td, cellIndex, record, tr, rowIndex, e) {
                if (e.getTarget('.grid-link')) {
                    e.stopEvent();
                    this.viewUserLink(record.get('id'));
                }
            }
        },
        'gridRadacctsGeneric actioncolumn': {
             itemClick  : 'onActionColumnItemClick'
        },
        'winStationAlias #save' : {
            click   : 'setAliasSave'
        }
    },
    reload: function(){
        var me      = this;
        var btn     = me.getView().down('#connected');
        var tz      = me.getView().down('#cmbTimezone');     
        if(!tz){
            return;
        }
         
        var only_connected  = true; //We only show the connected ones by default
        if(btn){
            only_connected = btn.pressed; //Default only active
            if(btn.pressed){
                btn.setGlyph(Rd.config.icnLightbulb);                           
            }else{
                btn.setGlyph(Rd.config.icnTime);  
            }
        }               
        me.getView().getStore().getProxy().setExtraParam('only_connected', only_connected);
        me.getView().getStore().getProxy().setExtraParam('timezone_id',tz.getValue());
        me.getView().getStore().reload();
    },
    viewUserLink: function(id) {
        const me    = this;
        me.usageGraph();
    },      
    usageGraph : function(){
     
        var me = this;  
        //Find out if there was something selected
        if(me.getView().getSelectionModel().getCount() == 0){
        
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
            
        }else {
            //Check if the node is not already open; else open the node:
            var tp      = me.getView().up('tabpanel');
            var sr      = me.getView().getSelectionModel().getLastSelected();
            var id      = sr.getId();
            var tab_id  = 'graphTab_'+id;
            var nt      = tp.down('#'+tab_id);
            if(nt){
                tp.setActiveTab(tab_id); //Set focus on  Tab
                return;
            }
            var dd              = Ext.getApplication().getDashboardData();
            var timezone_id     = dd.user.timezone_id;

            var tab_name = sr.get('callingstationid');
            //Tab not there - add one
            tp.add({ 
                title       : tab_name,
                itemId      : tab_id,
                closable    : true,
                glyph       : Rd.config.icnGraph, 
                xtype       : 'pnlPermanentUserGraphs',
                timezone_id : timezone_id,
                type        : 'device',
                pu_name     : tab_name,
                tabConfig : {
                    ui : Rd.config.tabPermUsers
                }
            });
            tp.setActiveTab(tab_id); //Set focus on Add Tab 
        }
    },
    onActionColumnItemClick: function(view, rowIndex, colIndex, item, e, record, row, action){
        //console.log("Action Item "+action+" Clicked");
        var me = this;
        var grid = view.up('grid');
        grid.setSelection(record);
        if(action == 'alias'){
            me.setAlias(record);
        }
    },
    setAlias: function(record){
        var me = this;
        console.log("Set Alias");
        if(!Ext.WindowManager.get('winStationAliasId')){
            var w = Ext.widget('winStationAlias',{
                id                  : 'winStationAliasId',
                callingstationid    : record.get('callingstationid'),
                username            : record.get('username')
            });
            me.getView().add(w); 
            let appBody = Ext.getBody();
            w.showBy(appBody);           
        }   
    },
    setAliasSave :  function(button){
        var me      = this;
        var win     = button.up('window');
        var form    = win.down('form');
        form.submit({
            clientValidation: true,
            url: me.getUrlAlias(),
            success: function(form, action) {
                win.close();
                me.reload();
                Ext.ux.Toaster.msg(
                    'Alias Updated',
                    'Aliad Upadted Fine',
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
            },
            failure: Ext.ux.formFail
        });
    }
});
