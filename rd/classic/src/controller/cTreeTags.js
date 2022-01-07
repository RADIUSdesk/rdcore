Ext.define('Rd.controller.cTreeTags', {
    extend: 'Ext.app.Controller',
    actionIndex: function(pnl){
        var me = this;        
        if (me.populated) {
            return; 
        }
             
        pnl.add({
           // xtype   : 'treeTreeTags',
            xtype   : 'pnlTreeAndMap',
            border  : false,
            itemId  : 'tabTreeTags',
            plain   : true
        });
        me.populated = true;
    },
    views:  [
        'treeTags.treeTreeTags',           
        'treeTags.winTreeTagEdit', 		'treeTags.winTreeTagAdd',
        'treeTags.pnlTreeAndMap',
        'treeTags.pnlTreeTagMap'
    ],
    stores: ['sAccessProvidersTree'],
    models: ['mAccessProviderTree'],
    selectedRecord: null,
    config: {
        urlApChildCheck : '/cake3/rd_cake/access-providers/child-check.json',
        urlAdd          : '/cake3/rd_cake/tree-tags/add.json',
        urlDelete       : '/cake3/rd_cake/tree-tags/delete.json',
		urlEdit         : '/cake3/rd_cake/tree-tags/edit.json',
		urlMapPrefView  : '/cake3/rd_cake/meshes/map_pref_view.json'
    },
    refs: [
         {  ref:    'treeTreeTags',     selector:   'treeTreeTags'},
         {  ref:    'pnlMap',           selector:   '#pnlMap'},
         {  ref:    'pnlTreeTagMap',    selector:   'pnlTreeTagMap'}
    ],
    init: function() {
        var me = this;
        if (me.inited) {
            return;
        }
        me.inited = true;
        me.control({
            '#tabTreeTags' : {
                destroy   :      me.appClose   
            },
            'treeTreeTags #reload': {
                click:      me.reload
            },
            'treeTreeTags #add': {
                click:      me.add
            },
            'treeTreeTags #edit': {
                click:      me.edit
            },
            'treeTreeTags #delete': {
                click:      me.del
            },
            'treeTreeTags #expand': {
                click:      me.expand
            },
            'treeTreeTags #map': {
                click:      me.mapAddTag
            },
            'treeTreeTags #map_clear': {
                click:      me.mapClear
            },
            'winTreeTagAdd #save':{
                click:      me.addSubmit
            },
            'winTreeTagEdit #save':{
                click:      me.editSubmit
            },
            'treeTreeTags'   : {
                itemclick:  me.gridClick
            },
			'winTreeTagAddWizard #btnTreeNext' : {
                click:  me.btnTreeNext
            },
            'winTreeTagAddWizard #btnDataPrev' : {
                click:  me.btnDataPrev
            },
            'winTreeTagAddWizard #btnDataNext' : {
                click:  me.btnDataNext
            },
            '#pnlMap' : {
                afterrender : me.pnlMapAfterrender
            }
        });
    },
    appClose:   function(){
        var me          = this;
        me.populated    = false;
    },
    reload: function(){
        var me =this;
        console.log("Reload Treetags");
        me.getTreeTreeTags().getStore().reload();
    }, 
    add:    function(){
        var me = this;
        //See if there are anything selected... if not, inform the user
        var sel_count = me.getTreeTreeTags().getSelectionModel().getCount();
        if(sel_count == 0){
            Ext.ux.Toaster.msg(
                        i18n('sSelect_a_node'),
                        'First select a node of the tree under which to add an entry',
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
            if(sel_count > 1){
                Ext.ux.Toaster.msg(
                        i18n('sLimit_the_selection'),
                        i18n('sSelection_limited_to_one'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
                );
            }else{
                var parent_id = me.selectedRecord.getId();
                var name     = me.selectedRecord.get('name');
                
               if(!Ext.WindowManager.get('winAcoAddId')){
                    var parent_id = me.selectedRecord.getId();
                    var name     = me.selectedRecord.get('name');
                    var w = Ext.widget('winTreeTagAdd',{id:'winTreeTagAddId','parentId': parent_id,'parentDisplay': name});
                    w.show();         
                }
            }
        }       
    },
    addSubmit: function(button){
        var me       = this;
        var win     = button.up('window');
        var form    = win.down('form');
        form.submit({
            clientValidation: true,
            url: me.getUrlAdd(),
            success: function(form, action) {
                win.close();
                me.getTreeTreeTags().getStore().load();
                Ext.ux.Toaster.msg(
                    i18n('sNew_item_created'),
                    i18n('sItem_created_fine'),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
            },
            failure: Ext.ux.formFail
        });
    },
    edit:   function(){
        var me = this;
        //See if there are anything selected... if not, inform the user
        var sel_count = me.getTreeTreeTags().getSelectionModel().getCount();
        if(sel_count == 0){
            Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
            if(sel_count > 1){
                Ext.ux.Toaster.msg(
                        i18n('sLimit_the_selection'),
                        i18n('sSelection_limited_to_one'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
                );
            }else{

                //We are not suppose to edit the root node
                if(me.selectedRecord.getId() == 0){
                    Ext.ux.Toaster.msg(
                        i18n('sRoot_node_selected'),
                        i18n('sYou_can_not_edit_the_root_node'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
                    );

                }else{
                    if(!Ext.WindowManager.get('winTreeTagEditId')){
                        var w = Ext.widget('winTreeTagEdit',{id:'winTreeTagEditId'});
                        w.show();  
                        w.down('form').loadRecord(me.selectedRecord);
                        //Set the parent ID
                        w.down('hiddenfield[name="parent_id"]').setValue(me.selectedRecord.parentNode.getId());
                    }  
                }  
            }
        }
    },
    editSubmit: function(button){
        var me      = this;
        var win     = button.up('window');
        var form    = win.down('form');
        form.submit({
            clientValidation: true,
            url: me.getUrlEdit(),
            success: function(form, action) {
                win.close();
                me.getTreeTreeTags().getStore().load();
                Ext.ux.Toaster.msg(
                    i18n('sItem_updated'),
                    i18n('sItem_updated_fine'),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
            },
            failure: Ext.ux.formFail
        });
    },

    del:   function(){
        var me      = this;     
        //Find out if there was something selected
        if(me.getTreeTreeTags().getSelectionModel().getCount() == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
            Ext.MessageBox.confirm(i18n('sConfirm'), i18n('sAre_you_sure_you_want_to_do_that_qm'), function(val){
                if(val== 'yes'){

                    Ext.each(me.getTreeTreeTags().getSelectionModel().getSelection(), function(item){
                            //console.log(item.getId());
                            item.remove(true);
                    });
                    me.getTreeTreeTags().getStore().sync({
                        success: function(batch,options){
                            Ext.ux.Toaster.msg(
                                i18n('sItem_deleted'),
                                i18n('sItem_deleted_fine'),
                                Ext.ux.Constants.clsInfo,
                                Ext.ux.Constants.msgInfo
                            ); 
                        },
                        failure: function(batch,options){
                             Ext.ux.Toaster.msg(
                                i18n('sProblems_deleting_item'),
                                batch.proxy.getReader().rawData.message.message,
                                Ext.ux.Constants.clsWarn,
                                Ext.ux.Constants.msgWarn
                            );
                        }
                    });

                }
            });
        }
    },   
    gridClick:  function(grid, record, item, index, event){
        var me = this;
        me.selectedRecord = record;
    },
    expand: function(){
        var me = this;
        //See if there are anything selected... if not, inform the user
        var sel_count = me.getTreeTreeTags().getSelectionModel().getCount();
        if(sel_count == 0){
            Ext.ux.Toaster.msg(
                        i18n('sSelect_a_node'),
                        i18n('sFirst_select_a_node_to_expand'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
            me.getTreeTreeTags().expandNode(me.selectedRecord,true); 
        }
    },
    pnlMapAfterrender: function(panel){
        var me = this;
        console.log("Panel Map after renderer");
        me.mapGetPref();
    },
    //===MAPS START HERE===  
    mapLoadGoogleApi: function (key,callback) {
        var me = this;
        Ext.Loader.loadScript({
            url: 'https://www.google.com/jsapi',                    // URL of script
            scope: this,                   // scope of callbacks
            onLoad: function () {           // callback fn when script is loaded
                google.load("maps", "3", {
                    other_params: "key=" + key,
                    callback: function () {
                        // Google Maps are loaded. Place your code here
                        callback();
                    }
                });
            },
            onError: function () {          // callback fn if load fails 
                console.log("Error loading Google script");
            }
        });
    },
    mapGetPref  : function() {
        var me = this;
        Ext.ux.Toaster.msg(
            'Loading  Map API',
            'Please be patient....',
            Ext.ux.Constants.clsInfo,
            Ext.ux.Constants.msgInfo
        );    
        //We need to fetch the Preferences for this user's Google Maps API key
        Ext.Ajax.request({
            url     : me.getUrlMapPrefView(),
            method  : 'GET',
            success : function (response) {
                var jsonData = Ext.JSON.decode(response.responseText);
                if (jsonData.success) {
                    if (jsonData.data.map_to_use == "google") {
                        me.mapLoadGoogleApi(jsonData.data.google_map_api_key, function () {
                            me.addMeshViewMapGoogle(jsonData);
                        })
                    }
                }
            },
            failure: function (batch, options) {
                Ext.ux.Toaster.msg(
                    'Problems getting the map preferences',
                    'Map preferences could not be fetched',
                    Ext.ux.Constants.clsWarn,
                    Ext.ux.Constants.msgWarn
                );
            },
            scope: me
        });
    },
    addMeshViewMapGoogle: function(jsonData){
        var me      = this;
        var data    = jsonData.data;  
        me.getPnlMap().add({          
           // xtype   : 'pnlMeshViewMapGoogle',
            xtype : 'pnlTreeTagMap'/*,
            layout  : 'fit',
            center  : {
                lat     : data.lat,
                lng     : data.lng
            },
            mapOptions: {
                zoom        : data.zoom,
                mapTypeId   : google.maps.MapTypeId[data.type]                  
            }*/
        });
    },
    mapAddTag: function(){
        var me = this;
        var sel_count = me.getTreeTreeTags().getSelectionModel().getCount();
        if(sel_count == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
             if(sel_count > 1){
                Ext.ux.Toaster.msg(
                        i18n('sLimit_the_selection'),
                        i18n('sSelection_limited_to_one'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
                );
            }else{
                //We are not suppose to edit the root node
                if(me.selectedRecord.getId() == 0){
                    Ext.ux.Toaster.msg(
                        i18n('sRoot_node_selected'),
                        i18n('sYou_can_not_edit_the_root_node'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
                    );

                }else{
                    console.log(me.selectedRecord.get('name'));
                    me.getPnlTreeTagMap().getController().addMarker(me.selectedRecord);
                }  
            }
        }
    },
    mapClear: function(){
        var me = this;
        me.getPnlTreeTagMap().getController().clearMarkers();  
    }    
    //===MAPS END HERE===  
});
