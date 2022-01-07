Ext.define('Rd.view.registrationRequests.vcRegistrationRequests', {
    extend  : 'Ext.app.ViewController',
    alias   : 'controller.vcRegistrationRequests',
    config: {
        urlAdd          : '/cake3/rd_cake/registration-requests/get-code.json',
        urlDelete       : '/cake3/rd_cake/registration-requests/delete.json',
		urlGiveCode     : '/cake3/rd_cake/registration-requests/give-code.json',
		urlSendCode     : '/cake3/rd_cake/registration-requests/send-code.json'
    },
    init: function() {
    
    }, 
	onReloadClick: function(){
        var me =this,
			grid = me.getView();
			
        grid.setSelection(null);		//getSelectionModel().deselectAll(true);
        grid.getStore().load();
    },
    onAddClick: function(button){   
        var me = this;
        var w = Ext.widget('winRegistrationRequestAddWizard',
            {id:'winRegistrationRequestAddWizardId',startScreen: 'scrnData',user_id:'0',owner: i18n('sLogged_in_user'), no_tree: true}
        );
        w.show();  
    },
    onRowEditClick: function(grid, rowIndex, colIndex){
        var me      = this;
		var rec = grid.getStore().getAt(rowIndex);
		
		grid.setSelection(rec);
        //Find out if there was something selected
        if(grid.getSelectionModel().getCount() == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item_to_edit'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
			var sr      =  grid.getSelectionModel().getLastSelected();
			if(!Ext.WindowManager.get('winRegistrationRequestEditId')){
                var w = Ext.widget('winRegistrationRequestEdit',{id:'winRegistrationRequestEditId',record: sr});
                w.show();       
            }    
        }
    },
    onRowDeleteClick: function(grid, rowIndex, colIndex){
		var me = this;
		
		var rec = grid.getStore().getAt(rowIndex);
		grid.setSelection(rec);
		me.onDeleteClick();
	},
    onDeleteClick:   function(){
        var me      = this,
			grid = me.getView();	//button.up('grid'); // Or could use me.getView()
			
        //Find out if there was something selected
        if(grid.getSelectionModel().getCount() == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item_to_delete'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        } else {
            Ext.MessageBox.confirm(i18n('sConfirm'), i18n('sAre_you_sure_you_want_to_do_that_qm'), function(val){
                if(val== 'yes'){
                    var selected    = grid.getSelectionModel().getSelection();
                    var list        = [];
                    Ext.Array.forEach(selected,function(item){
                        var id = item.getId();
                        Ext.Array.push(list,{'id' : id});
                    });
                    Ext.Ajax.request({
                        url: me.getUrlDelete(),
                        method: 'POST',          
                        jsonData: list,
                        success: function(batch,options){console.log('success');
                            Ext.ux.Toaster.msg(
                                i18n('sItem_deleted'),
                                i18n('sItem_deleted_fine'),
                                Ext.ux.Constants.clsInfo,
                                Ext.ux.Constants.msgInfo
                            );
                            //me.reload(); 
							me.onReloadClick();	//Reload from server
                        },                                    
                        failure: function(batch,options){
                            Ext.ux.Toaster.msg(
                                i18n('sProblems_deleting_item'),
                                batch.proxy.getReader().rawData.message.message,
                                Ext.ux.Constants.clsWarn,
                                Ext.ux.Constants.msgWarn
                            );
                            me.onReloadClick(); //Reload from server
                        }
                    });

                }
            });
        } 
    },
	onRowCodeClick: function(grid, rowIndex, colIndex){
		var me = this;
		
		var rec = grid.getStore().getAt(rowIndex);
		grid.setSelection(rec);
		me.onCodeClick();
	},
    onCodeClick: function(){
        var me      = this,
			grid = me.getView();	//button.up('grid'); // Or could use me.getView()
			
        //Find out if there was something selected
        if(grid.getSelectionModel().getCount() == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item_to_edit'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
            var sr      =  grid.getSelectionModel().getLastSelected();
            var id      = sr.get('id');
            Ext.Ajax.request({
                url: me.getUrlGiveCode(),
                method: 'GET',
                params: {'id':id},
                success: function(response){
                    var jsonData    = Ext.JSON.decode(response.responseText);
                    if(jsonData.success){
						Ext.Msg.show({
							title:'Email Code?',
							closable: false,
							message: 'Code Generated.<br>Would you like to send the user their email now?',
							buttons: Ext.Msg.YESNO,
							icon: Ext.Msg.QUESTION,
							fn: function(btn) {
								if (btn === 'yes') {
									grid.setSelection(sr);
									me.onEmailClick();
								} else {
									Ext.ux.Toaster.msg(
									    'Code Generated',
									    'Next, Send An Email to The Applicant',
									    Ext.ux.Constants.clsInfo,
									    Ext.ux.Constants.msgInfo
									);                         
									me.onReloadClick();
									grid.setSelection(sr);
									Rd.app.getCRegistrationRequestsController().select(grid,sr);
								}
							}
						});
                    }else{
                        //There should be a message
                        Ext.ux.Toaster.msg(
                            'Failure',
                            jsonData.message,
                            Ext.ux.Constants.clsWarn,
                            Ext.ux.Constants.msgWarn
                        );
                    }   
                },
                failure: Ext.ux.ajaxFail,
                scope: me
            });
        }
    },
	onRowEmailClick: function(grid, rowIndex, colIndex){
		var me = this;
		
		var rec = grid.getStore().getAt(rowIndex);
		grid.setSelection(rec);
		me.onEmailClick();
	},
    onEmailClick: function(){
        var me      = this,
			grid = me.getView();	//button.up('grid'); // Or could use me.getView()
			
        //Find out if there was something selected
        if(grid.getSelectionModel().getCount() == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item_to_edit'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
            //button.setDisabled(true); //Prevent double clicking
            var sr      =  grid.getSelectionModel().getLastSelected();
            var id      = sr.get('id');
            Ext.Ajax.request({
                url: me.getUrlSendCode(),
                method: 'GET',
                params: {'id':id},
                success: function(response){
                    //button.setDisabled(false); //Prevent double clicking
                    var jsonData    = Ext.JSON.decode(response.responseText);
                    if(jsonData.success){                           
                         Ext.ux.Toaster.msg(
                            'Email Sent',
                            'Email With Code Sent To Applicant',
                            Ext.ux.Constants.clsInfo,
                            Ext.ux.Constants.msgInfo
                        );                         
                        me.onReloadClick();
						grid.setSelection(sr);
						Rd.app.getCRegistrationRequestsController().select(grid,sr);
                    }else{
                        //There should be a message
                        Ext.ux.Toaster.msg(
                            'Failure',
                            jsonData.message,
                            Ext.ux.Constants.clsWarn,
                            Ext.ux.Constants.msgWarn
                        );
                    }   
                },
                failure: Ext.ux.ajaxFail,
                scope: me
            });
        }
    }
	
});
