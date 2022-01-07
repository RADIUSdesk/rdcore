Ext.define('Rd.view.schedules.vcSchedules', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcSchedules',
    init    : function() {
    
    },
    config: {
        urlApChildCheck : '/cake3/rd_cake/access-providers/child-check.json',
        urlAdd          : '/cake3/rd_cake/schedules/add.json',
        urlDelete       : '/cake3/rd_cake/schedules/delete.json',
		urlEdit         : '/cake3/rd_cake/schedules/edit.json',
		urlAddEntry     : '/cake3/rd_cake/schedules/add-schedule-entry.json',
		urlViewEntry    : '/cake3/rd_cake/schedules/view-schedule-entry.json',
		urlEditEntry    : '/cake3/rd_cake/schedules/edit-schedule-entry.json',
		urlDeleteEntry  : '/cake3/rd_cake/schedules/delete-schedule-entry.json'
    },
    control: {
        'gridSchedules #reload': {
            click   : 'reload'
        },
        'gridSchedules #add': {
             click: 'add'
        },
        'gridSchedules #edit': {
            click: 'edit'
        },
        
        'gridSchedules #delete': {
            click   : 'del'
        },
        'gridSchedules actioncolumn' : {
             itemClick  : 'onColumnItemClick'
        },
        'winScheduleAddWizard #btnTreeNext' : {
            click   : 'btnTreeNext'
        },
        'winScheduleAddWizard #btnDataPrev' : {
            click   : 'btnDataPrev'
        },
        'winScheduleAddWizard #btnDataNext' : {
            click   : 'btnDataNext'
        },
        'winScheduleEdit #save': {
            click   : 'btnEditSave'
        },
        'winScheduleEntryAdd #save': {
            click   : 'btnEntryAddSave'
        }, 
        'winScheduleEntryEdit': {
            show   : 'winScheduleEntryEditShow'
        },
        'winScheduleEntryEdit #save': {
            click   : 'btnEntryEditSave'
        }  
    },
    reload: function(){
        var me      = this;
        me.getView().getSelectionModel().deselectAll(true);
        me.getView().getStore().load();
    },
    add: function(button) {
	
        var me      = this;
        var option  = me.getView().down('#cmbScheduleOptions').getValue();
              
        if(option == 'schedule'){
            
            Ext.Ajax.request({
                url: me.getUrlApChildCheck(),
                method: 'GET',
                success: function(response){
                    var jsonData    = Ext.JSON.decode(response.responseText);
                    if(jsonData.success){                           
                        if(jsonData.items.tree == true){
                            if(!Ext.WindowManager.get('winScheduleAddWizardId')){
                                var w = Ext.widget('winScheduleAddWizard',{id:'winScheduleAddWizardId'});
                                this.getView().add(w);
                                let appBody = Ext.getBody();
                                w.showBy(appBody);        
                            }
                        }else{
                            if(!Ext.WindowManager.get('winScheduleAddWizardId')){
                                var w = Ext.widget('winScheduleAddWizard',
                                    {id:'winScheduleAddWizardId',startScreen: 'scrnData',user_id:'0',owner: i18n('sLogged_in_user'), no_tree: true}
                                );
                                this.getView().add(w);
                                let appBody = Ext.getBody();
                                w.showBy(appBody);             
                            }
                        }
                    }   
                },
                scope: me
            });
               
        }
         
        if(option == 'schedule_entry'){       
            if(me.getView().getSelectionModel().getCount() == 0){
                 Ext.ux.Toaster.msg(
                            i18n('sSelect_an_item'),
                            'Select A Schedule To Add An Schedule Entry' ,
                            Ext.ux.Constants.clsWarn,
                            Ext.ux.Constants.msgWarn
                );
            }else{
			    var sr   =  me.getView().getSelectionModel().getLastSelected();
			    var id   =  sr.getId().split('_');
			    if(!Ext.WindowManager.get('winScheduleEntryAddId')){
                    var w = Ext.widget('winScheduleEntryAdd',{id:'winScheduleEntryAddId','schedule_id' : id[0],'schedule_name' : sr.get('name')});
                    this.getView().add(w); 
                    let appBody = Ext.getBody();
                    w.showBy(appBody);             
                } 
            }            
        }
    },
    btnTreeNext: function(button){
        var me = this;
        var tree = button.up('treepanel');
        //Get selection:
        var sr = tree.getSelectionModel().getLastSelected();
        if(sr){    
            var win = button.up('winScheduleAddWizard');
            win.down('#owner').setValue(sr.get('username'));
            win.down('#user_id').setValue(sr.getId());
            win.getLayout().setActiveItem('scrnData');
        }else{
            Ext.ux.Toaster.msg(
                        i18n('sSelect_an_owner'),
                        i18n('sFirst_select_an_Access_Provider_who_will_be_the_owner'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }
    },
    btnDataPrev:  function(button){
        var me      = this;
        var win     = button.up('winScheduleAddWizard');
        win.getLayout().setActiveItem('scrnApTree');
    },
    btnDataNext:  function(button){
        var me      = this;
        var win     = button.up('window');
        var form    = win.down('form');
        form.submit({
            clientValidation: true,
            url: me.getUrlAdd(),
            success: function(form, action) {
                win.close();
                me.reload();
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
    edit: function(button) {
        var me      = this;
        var option  = me.getView().down('#cmbScheduleOptions').getValue();            
        if(option == 'schedule'){
            //Find out if there was something selected
            if(me.getView().getSelectionModel().getCount() == 0){
                 Ext.ux.Toaster.msg(
                            i18n('sSelect_an_item'),
                            i18n('sFirst_select_an_item_to_edit'),
                            Ext.ux.Constants.clsWarn,
                            Ext.ux.Constants.msgWarn
                );
            }else{
			    var sr   =  me.getView().getSelectionModel().getLastSelected();
			    var id   =  sr.getId().split('_');
			    if(!Ext.WindowManager.get('winScheduleEditId')){
                    var w = Ext.widget('winScheduleEdit',{id:'winScheduleEditId',record: sr, schedule_id: id[0]});
                    this.getView().add(w);
                    let appBody = Ext.getBody();
                    w.showBy(appBody);            
                }    
            }
        }
        
        if(option == 'schedule_entry'){
            //Find out if there was something selected
            if(me.getView().getSelectionModel().getCount() == 0){
                 Ext.ux.Toaster.msg(
                            i18n('sSelect_an_item'),
                            i18n('sFirst_select_an_item_to_edit'),
                            Ext.ux.Constants.clsWarn,
                            Ext.ux.Constants.msgWarn
                );
            }else{
			    var sr   =  me.getView().getSelectionModel().getLastSelected();
			    var id   =  sr.getId().split('_');
			    if(!Ext.WindowManager.get('winScheduleEntryEditId')){
			        let appBody = Ext.getBody();
                    var w = Ext.widget('winScheduleEntryEdit',{id:'winScheduleEntryEditId',record: sr, schedule_entry_id: id[1]});
                    this.getView().add(w);
                    w.showBy(appBody);     
                }    
            }
        }         
    },
    btnEditSave:function(button){
        var me      = this;
        var win     = button.up('window');
        var form    = win.down('form');
        //Checks passed fine...      
        form.submit({
            clientValidation    : true,
            url                 : me.getUrlEdit(),
            success             : function(form, action) {
                me.reload();
                 win.close();
                Ext.ux.Toaster.msg(
                    i18n('sItems_modified'),
                    i18n('sItems_modified_fine'),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
            },
            failure             : Ext.ux.formFail
        });
    },  
    del: function(button) {
        var me      = this;
        var option  = me.getView().down('#cmbScheduleOptions').getValue();
        
        if(option == 'schedule'){
            me.delSchedule()   
        } 
        
        if(option == 'schedule_entry'){
            me.delScheduleEntry();            
        }        
    },           
    delSchedule:   function(){
        var me      = this;     
        //Find out if there was something selected
        if(me.getView().getSelectionModel().getCount() == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item_to_delete'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
            Ext.MessageBox.confirm(i18n('sConfirm'), 'This will DELETE the Schedule and ALL its Schedule Entries' , function(val){
                if(val== 'yes'){
                    var selected    = me.getView().getSelectionModel().getSelection();
                    var list        = [];
                    Ext.Array.forEach(selected,function(item){
                        var id = item.getId();
                        Ext.Array.push(list,{'id' : id});
                    });
                    Ext.Ajax.request({
                        url: me.getUrlDelete(),
                        method: 'POST',          
                        jsonData: list,
                        success: function(batch,options){
                            Ext.ux.Toaster.msg(
                                i18n('sItem_deleted'),
                                i18n('sItem_deleted_fine'),
                                Ext.ux.Constants.clsInfo,
                                Ext.ux.Constants.msgInfo
                            );
                            me.reload(); //Reload from server
                        },                                    
                        failure: function(batch,options){
                            Ext.ux.Toaster.msg(
                                i18n('sProblems_deleting_item'),
                                batch.proxy.getReader().rawData.message.message,
                                Ext.ux.Constants.clsWarn,
                                Ext.ux.Constants.msgWarn
                            );
                            me.reload(); //Reload from server
                        }
                    });

                }
            });
        }
    },
    btnEntryAddSave : function(button){
        var me      = this;
        var form    = button.up('form');
        var win     = button.up('winScheduleEntryAdd');
        //Checks passed fine...      
        form.submit({
            clientValidation    : true,
            url                 : me.getUrlAddEntry(),
            success             : function(form, action) {
                Ext.ux.Toaster.msg(
                    'Item added Fine',
                    'Item added Fine',
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
                me.reload();
                win.close();
            },
            failure             : Ext.ux.formFail
        }); 
    },
    winScheduleEntryEditShow : function(win){
        var me      = this; 
        var form    = win.down('form');
        var entryId = win.schedule_entry_id;     
        form.load({
            url         :me.getUrlViewEntry(), 
            method      :'GET',
            params      :{schedule_entry_id:entryId},
            success     : function(a,b,c){
                form.down('#slideTime').setValue(b.result.data.event_time);       
                if(b.result.data.type == 'predefined_command'){
                    var cmb    = form.down("cmbPredefinedCommand");
                    var rec    = Ext.create('Rd.model.mAp', {name: b.result.data.predefined_command_name, id: b.result.data.predefined_command_id});
                    cmb.getStore().loadData([rec],false);
                    cmb.setValue(b.result.data.predefined_command_id);
                    console.log("Brannas");
                }                          
            }
        });        
    },
    btnEntryEditSave : function(button){
        var me      = this;
        var form    = button.up('form');
        var win     = button.up('winScheduleEntryEdit');
        //Checks passed fine...      
        form.submit({
            clientValidation    : true,
            url                 : me.getUrlEditEntry(),
            success             : function(form, action) {
                Ext.ux.Toaster.msg(
                    'Item added Fine',
                    'Item added Fine',
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
                me.reload();
                win.close();
            },
            failure             : Ext.ux.formFail
        }); 
    },
    delScheduleEntry:   function(){
        var me      = this;     
        //Find out if there was something selected
        if(me.getView().getSelectionModel().getCount() == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item_to_delete'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
            Ext.MessageBox.confirm(i18n('sConfirm'), 'This will DELETE the selected Schedule Entries' , function(val){
                if(val== 'yes'){
                    var selected    = me.getView().getSelectionModel().getSelection();
                    var list        = [];
                    Ext.Array.forEach(selected,function(item){
                        var id = item.getId();
                        Ext.Array.push(list,{'id' : id});
                    });
                    Ext.Ajax.request({
                        url: me.getUrlDeleteEntry(),
                        method: 'POST',          
                        jsonData: list,
                        success: function(batch,options){
                            Ext.ux.Toaster.msg(
                                i18n('sItem_deleted'),
                                i18n('sItem_deleted_fine'),
                                Ext.ux.Constants.clsInfo,
                                Ext.ux.Constants.msgInfo
                            );
                            me.reload(); //Reload from server
                        },                                    
                        failure: function(batch,options){
                            Ext.ux.Toaster.msg(
                                i18n('sProblems_deleting_item'),
                                batch.proxy.getReader().rawData.message.message,
                                Ext.ux.Constants.clsWarn,
                                Ext.ux.Constants.msgWarn
                            );
                            me.reload(); //Reload from server
                        }
                    });
                }
            });
        }
    },
    onColumnItemClick: function(view, rowIndex, colIndex, item, e, record, row, action){
        //console.log("Action Item "+action+" Clicked");
        var me = this;
        me.getView().setSelection(record);
        if(action == 'edit'){
            me.edit()
        }
        if(action == 'delete'){
            me.del();
        }     
    }  
});
