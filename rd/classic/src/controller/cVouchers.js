Ext.define('Rd.controller.cVouchers', {
    extend: 'Ext.app.Controller',
    actionIndex: function(pnl){

        var me = this;
        if (me.populated) {
            return; 
        }
        me.ui   = Rd.config.tabVouchers; //This is set in the config file       
        pnl.add({ 
            padding : Rd.config.gridPadding,
            xtype   : 'gridVouchers'
        });
        pnl.on({activate : me.gridActivate,scope: me});
        me.populated = true;
    },

    views:  [
        'vouchers.gridVouchers',    'vouchers.winVoucherAddWizard',
        'components.cmbRealm',      	'components.cmbProfile',    'vouchers.pnlVoucher',  'vouchers.gridVoucherPrivate',
        'components.cmbVendor',     	'components.cmbAttribute',  'vouchers.gridVoucherRadaccts',
        'vouchers.winVoucherPassword', 	'components.winPdf',     'vouchers.winVoucherPdf',
        'vouchers.cmbPdfFormats',   	'components.vCmbLanguages', 'components.winCsvColumnSelect', 
        'components.pnlUsageGraph', 	'vouchers.winVoucherEmailDetail',
		'vouchers.gridVoucherDevices',	'vouchers.winVoucherAddDevice',
		'components.cmbSsid',
        'vouchers.pnlVoucherGraphs',
        'vouchers.winVoucherCsvImport'
    ],
    stores: ['sVouchers', 'sAccessProvidersTree', 'sRealms', 'sProfiles', 'sAttributes', 'sVendors',    'sPdfFormats', 'sLanguages'],
    models: [
		'mAccessProviderTree', 	'mVoucher', 			'mRealm',       
		'mProfile', 			'mPrivateAttribute', 	'mRadacct', 
		'mPdfFormat', 			'mUserStat',			'mVoucherDevice'
	],
    selectedRecord: null,
    config: {
        urlAdd              : '/cake3/rd_cake/vouchers/add.json',
        urlDelete           : '/cake3/rd_cake/vouchers/delete.json',
        urlBulkDelete       : '/cake3/rd_cake/vouchers/bulk-delete.json',
        urlViewBasic        : '/cake3/rd_cake/vouchers/view-basic-info.json',
        urlEditBasic        : '/cake3/rd_cake/vouchers/edit_basic_info.json',  
        urlApChildCheck     : '/cake3/rd_cake/access-providers/child-check.json',
        urlExportCsv        : '/cake3/rd_cake/vouchers/export_csv',
        urlPdfExportLoad    : '/cake3/rd_cake/vouchers/pdf-export-settings.json',
        urlChangePassword   : '/cake3/rd_cake/vouchers/change-password.json',
        urlPdfBase          : '/cake3/rd_cake/vouchers/export-pdf',
        urlEmailSend        : '/cake3/rd_cake/vouchers/email-voucher-details.json',
        
		urlAddDevice        : '/cake3/rd_cake/vouchers/voucher_device_add.json',
		urlAddCsv           : '/cake3/rd_cake/vouchers/add_csv/',
		
		urlDeleteRadaccts:  '/cake3/rd_cake/radaccts/delete.json',
        urlDeletePostAuths: '/cake3/rd_cake/radpostauths/delete.json'
    },
    refs: [
        {  ref: 'grid',         selector:   'gridVouchers'} ,
        {  ref: 'privateGrid',  selector:   'gridVoucherPrivate'}       
    ],
    init: function() {
        var me = this;
        if (me.inited) {
            return;
        }
        me.inited 		= true;
		me.singleField	= true;
		me.addCsvList   = false;
		
		me.simpleDel    = true;

        me.control({
            'gridVouchers #reload': {
                click:      me.reload
            },
            'gridVouchers #reload menuitem[group=refresh]'   : {
                click:      me.reloadOptionClick
            },  
            'gridVouchers #add'   : {
                click:      me.add
            },
			'gridVouchers #add menuitem[group=add]'   : {
                click:      me.addOptionClick
            },
            'gridVouchers #delete'   : {
                click:      me.del
            },
            'gridVouchers #delete menuitem[group=delete]'   : {
                click:      me.delOptionClick
            },
            'gridVouchers #edit'   : {
                click:      me.edit
            },
            'gridVouchers #pdf'  : {
                click:      me.pdfExport
            },
            'gridVouchers #csv'  : {
                click:      me.csvExport
            },
            'gridVouchers #password'  : {
                click:      me.changePassword
            },
            'gridVouchers #test_radius' : {
                click:      me.testRadius
            },
            'gridVouchers #email': {
                click:    me.email
            },
            'gridVouchers #graph'   : {
                click:      me.graph
            },
            'gridVouchers'   : {
                select          :  me.select,
                menuItemClick   : me.onActionColumnMenuItemClick 
            },
            'winVoucherEmailDetail #send'   : {
                click:      me.emailSend
            },
            'gridVouchers actioncolumn': { 
                 itemClick  : me.onActionColumnItemClick
            },
            //Add WiZard 

            'winVoucherAddWizard #btnTreeNext' : {
                click:  me.btnTreeNext
            },
            'winVoucherAddWizard #quantity' : {
                change:  me.quantityChange
            },
            'winVoucherAddWizard #activate_on_login' : {
                change:  me.chkActivateOnLoginChange
            },
            'winVoucherAddWizard #never_expire' : {
                change:  me.chkNeverExpireChange
            },
			'winVoucherAddWizard #ssid_only' : {
                change:  me.chkSsidOnlyChange
            },
            'winVoucherAddWizard #btnDataPrev' : {
                click:  me.btnDataPrev
            },
            'winVoucherAddWizard #btnDataNext' : {
                click:  me.btnDataNext
            },
            
            //CSV Add Window
            'winVoucherCsvImport #btnTreeNext' : {
                click:  me.btnTreeNext
            },
            'winVoucherCsvImport #btnDataPrev' : {
                click:  me.btnDataPrev
            },
            'winVoucherCsvImport #activate_on_login' : {
                change:  me.chkActivateOnLoginChange
            },
            'winVoucherCsvImport #never_expire' : {
                change:  me.chkNeverExpireChange
            },
            'winVoucherCsvImport #btnDataNext' : {
                click:  me.btnDataNextCsv
            },
            
            'pnlVoucher #tabBasicInfo' : {
                activate: me.onTabBasicInfoActive
            },
            'pnlVoucher #profile' : {
                render:  me.renderEventProfile
            },
            'pnlVoucher #realm' : {
                render:      me.renderEventRealm
            },
            'pnlVoucher #activate_on_login' : {
                change:  me.chkActivateOnLoginChange
            },
            'pnlVoucher #never_expire' : {
                change:  me.chkNeverExpireChange
            },
			'pnlVoucher #ssid_only' : {
                change:  me.chkSsidOnlyChange
            },
            'pnlVoucher #tabBasicInfo #save' : {
                click: me.saveBasicInfo
            },
            'pnlVoucher gridVoucherPrivate' : {
                select:        me.selectVoucherPrivate,
                activate:      me.gridActivate
            },
            'gridVoucherPrivate' : {
                beforeedit:     me.onBeforeEditVoucherPrivate
            },
            'gridVoucherPrivate  #cmbVendor': {
                change:      me.cmbVendorChange
            },
            'gridVoucherPrivate  #add': {
                click:      me.attrAdd
            },
            'gridVoucherPrivate  #reload': {
                click:      me.attrReload
            },
            'gridVoucherPrivate  #delete': {
                click:      me.attrDelete
            },
			'pnlVoucher gridVoucherDevices' : {
                activate:      me.gridActivate
            },
			'winVoucherAddDevice #save' : {
                click:  me.btnDeviceAddSave
            },
			'gridVoucherDevices  #add': {
                click:      me.deviceAdd
            },
            'gridVoucherDevices  #reload': {
                click:      me.deviceReload
            },
            'gridVoucherDevices  #delete': {
                click:      me.deviceDelete
            },
            '#winCsvColumnSelectVouchers #save': {
                click:  me.csvExportSubmit
            },
            'pnlVoucher gridVoucherRadaccts #reload' :{
                click:      me.gridVoucherRadacctsReload
            },
            'pnlVoucher gridVoucherRadaccts #delete' :{
                click:      me.deleteRadaccts
            },
            'pnlVoucher gridVoucherRadaccts' : {
                activate:      me.gridActivate
            },
            'winVoucherPassword #save': {
                click: me.changePasswordSubmit
            },
            'winVoucherPdf  #save': {
                click:  me.pdfExportSubmit
            },
			'winVoucherPdf' : {
                beforeshow:      me.frmPdfExportLoad
            }
        });
    },
    appClose:   function(){
        var me          = this;
        me.populated    = false;
        if(me.autoReload != undefined){
            clearInterval(me.autoReload);   //Always clear
        }
    },
    reload: function(){
        var me =this;
        me.getGrid().getSelectionModel().deselectAll(true);
        me.getStore('sVouchers').load();
    },
    reloadOptionClick: function(menu_item){
        var me      = this;
        var n       = menu_item.getItemId();
        var b       = menu_item.up('button'); 
        var interval= 30000; //default
        clearInterval(me.autoReload);   //Always clear
        b.setGlyph(Rd.config.icnTime);
        
        if(n == 'mnuRefreshCancel'){
            b.setGlyph(Rd.config.icnReload);
            return;
        }
        
        if(n == 'mnuRefresh1m'){
           interval = 60000
        }

        if(n == 'mnuRefresh5m'){
           interval = 360000
        }
        me.autoReload = setInterval(function(){        
            me.reload();
        },  interval);  
    },
	addOptionClick: function(menu_item){
		var me = this;
		var n  = menu_item.getItemId();
		
		if(n == 'addSingle'){
			me.singleField = true;   
		}else{
            me.singleField = false;
        }
		
		if(n == 'addCsvList'){
            me.addCsvList = true;
        }else{
            me.addCsvList = false;
        }	
	},
    gridActivate: function(g){
        var me = this;
        var grid = g.down('grid');
        if(grid){
            grid.getStore().load();
        }else{
            g.getStore().load();
        }        
    },
    add: function(button){  
        var me = this;   
        if(me.addCsvList){
            me.addCsvImport();    
        }else{
            Ext.Ajax.request({
                url: me.getUrlApChildCheck(),
                method: 'GET',
                success: function(response){
                    var jsonData    = Ext.JSON.decode(response.responseText);
                    if(jsonData.success){
                            
                        if(jsonData.items.tree == true){
                            if(!Ext.WindowManager.get('winVoucherAddWizardId')){
                                var w = Ext.widget('winVoucherAddWizard',{id:'winVoucherAddWizardId',singleField: me.singleField});
                                w.show();         
                            }
                        }else{
                            if(!Ext.WindowManager.get('winVoucherAddWizardId')){
                                var w = Ext.widget('winVoucherAddWizard',
                                    {
									    id			: 'winVoucherAddWizardId',
									    startScreen	: 'scrnData',
									    user_id		:'0',
									    owner		: i18n('sLogged_in_user'), 
									    no_tree		: true,
									    apId		:'0',
									    singleField : me.singleField
								    }
                                );
                                w.show();         
                            }
                        }
                    }   
                },
                scope: me
            });
        }
    },
    
    btnTreeNext: function(button){
        var me = this;
        var tree = button.up('treepanel');
        //Get selection:
        var sr = tree.getSelectionModel().getLastSelected();
        if(sr){    
            var win = button.up('window');
            win.down('#owner').setValue(sr.get('username'));
            win.down('#user_id').setValue(sr.getId());

            //We need to update the Store of the Realms and Profile select list to reflect the specific Access Provider
            win.down('#realm').getStore().getProxy().setExtraParam('ap_id',sr.getId());
            win.down('#realm').getStore().load();

            win.down('#profile').getStore().getProxy().setExtraParam('ap_id',sr.getId());
            win.down('#profile').getStore().load();    
            
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
        var win     = button.up('window');
        win.getLayout().setActiveItem('scrnApTree');
    },
    btnDataNext:  function(button){
        var me      = this;
        var win     = button.up('window');
        var form    = win.down('form');
        //form.setLoading("Generating Vouchers - Please Wait"); //Mask it
        form.submit({
            clientValidation: true,
            url: me.getUrlAdd(),
            success: function(form, action) {
                win.close();
                me.getStore('sVouchers').load();
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
    
    addCsvImport : function(){
        var me = this;
        console.log("We need to import from CSV");
        Ext.Ajax.request({
            url: me.getUrlApChildCheck(),
            method: 'GET',
            success: function(response){
                var jsonData    = Ext.JSON.decode(response.responseText);
                if(jsonData.success){
                        
                    if(jsonData.items.tree == true){
                        if(!Ext.WindowManager.get('winVoucherCsvImportId')){
                            var w = Ext.widget('winVoucherCsvImport',{id:'winVoucherCsvImportId'});
                            w.show();         
                        }
                    }else{
                        if(!Ext.WindowManager.get('winVoucherCsvImportId')){
                            var w = Ext.widget('winVoucherCsvImport',
                                {
						            id			: 'winVoucherCsvImportId',
						            startScreen	: 'scrnData',
						            user_id		:'0',
						            owner		: i18n('sLogged_in_user'), 
						            no_tree		: true,
						            apId		:'0'
					            }
                            );
                            w.show();        
                        }
                    }
                }   
            },
            scope: me
        });
    },
    
    btnDataNextCsv:  function(button){
        var me      = this;
        var win     = button.up('window');
        var form    = win.down('form');
        form.submit({
            clientValidation: true,
            waitMsg: 'Uploading your CSV File...',
            url: me.getUrlAddCsv(),
            success: function(form, action) {
                win.close();
                me.getStore('sVouchers').load();
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
    
    select:  function(grid, record, item, index, event){
        var me = this;
        //Adjust the Edit and Delete buttons accordingly...
        //Dynamically update the top toolbar
        tb = me.getGrid().down('toolbar[dock=top]');

        var edit = record.get('update');
        if(edit == true){
            if(tb.down('#edit') != null){
                tb.down('#edit').setDisabled(false);
                tb.down('#password').setDisabled(false);
            }
        }else{
            if(tb.down('#edit') != null){
                tb.down('#edit').setDisabled(true);
                tb.down('#password').setDisabled(true);
            }
        }

        var del = record.get('delete');
        if(del == true){
            if(tb.down('#delete') != null){
                tb.down('#delete').setDisabled(false);
            }
        }else{
            if(tb.down('#delete') != null){
                tb.down('#delete').setDisabled(true);
            }
        }
    },
    delOptionClick: function(menu_item){
		var me = this;
		var n  = menu_item.getItemId();
		if(n == 'deleteSimple'){
			me.simpleDel = true;
        }
		if(n == 'deleteBulk'){
			me.simpleDel = false;
        }
	},
	delInBulk: function(){
	
	    var me          = this;
        var filters     = [];
        var f_count     = 0;
        var f_found     = false;
        var filter_json ='';
        var warn_string = "<div>This will delete <b>ALL</b> the <b>CURRENT</b> listed items</div><div>Are you <b>VERY</b> sure?</div>";
         
        var filter_collection = me.getGrid().getStore().getFilters();     
        if(filter_collection.count() > 0){
            var i = 0;
            while (f_count < filter_collection.count()) { 
                f_found         = true;
                var ser_item    = filter_collection.getAt(f_count).serialize( );
                ser_item.field  = ser_item.property;
                filters[f_count]= ser_item;
                f_count         = f_count + 1; 
            }     
        }
            
        if(f_found){
            filter_json = "?filter="+encodeURIComponent(Ext.JSON.encode(filters));
            warn_string = "<div>A <b>FILTER</b> is applied on the grid and the <b>DELETE</b> will be according to this filter.</div><div><br>Are you <b>VERY</b> sure?</div>";
        }
	
	    Ext.MessageBox.confirm(i18n('sConfirm'),warn_string, function(val){
            if(val== 'yes'){
                console.log("You choose YES");
                Ext.Ajax.request({
                    url     : me.getUrlBulkDelete()+filter_json,
                    method  : 'POST',
                    success : function(batch,options){
                        //console.log('success');
                        Ext.ux.Toaster.msg(
                            "Bulk delete completed",
                            "Bulk delete completed",
                            Ext.ux.Constants.clsInfo,
                            Ext.ux.Constants.msgInfo
                        );
                        me.reload(); //Reload from server
                    },                                    
                    failure: function(batch,options){
                        Ext.ux.Toaster.msg(
                            "Problems with bulk delete",
                            batch.proxy.getReader().rawData.message.message,
                            Ext.ux.Constants.clsWarn,
                            Ext.ux.Constants.msgWarn
                        );
                        me.reload(); //Reload from server
                    }
                });   
            }
        });
	},
    del:   function(){
        var me      = this; 
        
        if(me.simpleDel == false){
            me.delInBulk();
            return;
        }
            
        //Find out if there was something selected
        if(me.getGrid().getSelectionModel().getCount() == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item_to_delete'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
            Ext.MessageBox.confirm(i18n('sConfirm'), i18n('sAre_you_sure_you_want_to_do_that_qm'), function(val){
                if(val== 'yes'){

                    var selected    = me.getGrid().getSelectionModel().getSelection();
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
                            //console.log('success');
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

    edit:   function(){
        var me = this;
        //See if there are anything selected... if not, inform the user
        var sel_count = me.getGrid().getSelectionModel().getCount();
        if(sel_count == 0){
            Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{

            var selected    =  me.getGrid().getSelectionModel().getSelection();
            var count       = selected.length;         
            Ext.each(me.getGrid().getSelectionModel().getSelection(), function(sr,index){

                //Check if the node is not already open; else open the node:
                var tp          = me.getGrid().up('tabpanel');
                var v_id        = sr.getId();
                var v_tab_id    = 'vTab_'+v_id;
                var nt          = tp.down('#'+v_tab_id);
                if(nt){
                    tp.setActiveTab(v_tab_id); //Set focus on  Tab
                    return;
                }

                var v_tab_name 	= sr.get('name');
                //Tab not there - add one
                tp.add({ 
                    title :     v_tab_name,
                    itemId:     v_tab_id,
                    closable:   true,
                    iconCls:    'edit',
                    glyph       : Rd.config.icnEdit,
                    layout:     'fit',
                    tabConfig: {
                         ui: me.ui
                    }, 
                    items:      {'xtype' : 'pnlVoucher',v_id: v_id, v_name: v_tab_name, record: sr}
                });
                tp.setActiveTab(v_tab_id); //Set focus on Add Tab
            });
        }
    },
    onTabBasicInfoActive: function(t){
        var me      = this;
        var form    = t.down('form');
        //get the voucher's id
        var voucher_id = t.up('pnlVoucher').v_id;
        form.load({url:me.getUrlViewBasic(), method:'GET',params:{voucher_id:voucher_id},
			success : function(a,b){  
				//If the SSID must be restricted specify which SSIDs
				if(b.result.data.ssid_list != undefined){
					var cmbSsid	= form.down('#ssid_list');
					var iValues = [];  
					cmbSsid.getStore().loadData([],false); //Wipe it
					Ext.Array.forEach(b.result.data.ssid_list,function(item){
                    	//console.log(item);
						var id = item.id;
						iValues.push ( id );
						cmbSsid.getStore().loadData([item],true); //Append it
                    });
					//console.log(iValues);
					cmbSsid.setValue( iValues );	
				}
            }
		});
    },
    saveBasicInfo:function(button){

        var me      = this;
        var f    = button.up('form');
        var voucher_id = button.up('pnlVoucher').v_id;
        //Checks passed fine...
        //f.setLoading(true); //Mask it      
        f.submit({
            clientValidation    : true,
            url                 : me.getUrlEditBasic(),
            params              : {id: voucher_id},
            success             : function(form, action) {
                me.reload();
                Ext.ux.Toaster.msg(
                    i18n('sItems_modified'),
                    i18n('sItems_modified_fine'),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
                //f.setLoading(false);
            },
            failure             : Ext.ux.formFail
        });
    },
    pdfExport: function(button){
        var me          = this;
        var selecteds   = false;

        //First check is there is actually some records that is displayed!
        if(me.getGrid().getStore().getCount() == 0){
            Ext.ux.Toaster.msg(
                i18n('sNothing_to_export'),
                i18n('sList_is_empty'),
                Ext.ux.Constants.clsWarn,
                Ext.ux.Constants.msgWarn
            );
            return;  
        }

        //Check if there are items selected to give them the option to export only selecteds
        if(me.getGrid().getSelectionModel().getCount() > 0){
            selecteds = true;
        }

        if(!Ext.WindowManager.get('winVoucherPdfId')){
            var w = Ext.widget('winVoucherPdf',{id:'winVoucherPdfId', selecteds : selecteds});
            w.show();         
        }
    },
    pdfExportSubmit: function(button){
        var me      = this;      
        var form    = button.up('form');
        var win     = form.up('window');

		//Get the values from the form:
		form_to_string 	= form.getForm().getValues(true);
        //Token
        var token 		= Ext.util.Cookies.get("Token"); //No token?
        var url_to_add 	= form_to_string+'&token='+token+'&';
		//console.log(url_to_add);
		
	    //---- Filter thing -----	
		var filters     = [];
        var f_count     = 0;
        var f_found     = false;
        var filter_json ='';
             
        var filter_collection = me.getGrid().getStore().getFilters();     
        if(filter_collection.count() > 0){
            var i = 0;
            while (f_count < filter_collection.count()) { 

                //console.log(filter_collection.getAt(f_count).serialize( ));
                f_found         = true;
                var ser_item    = filter_collection.getAt(f_count).serialize( );
                ser_item.field  = ser_item.property;
                filters[f_count]= ser_item;
                f_count         = f_count + 1;
                
            }     
        }  
        
        if(f_found){
            filter_json = "filter="+encodeURIComponent(Ext.JSON.encode(filters));
            url_to_add  = url_to_add+filter_json+'&';
            //console.log(url_to_add);
        }
        //--- END Filter thing -----

        //Check if the 'selected_only' was chosen
        var form = button.up('form');
        if(form.down('#selected_only') != undefined){
            if(form.down('#selected_only').getValue()){
                //console.log("Get selection...");
                var selected = [];
                Ext.each(me.getGrid().getSelectionModel().getSelection(), function(sr,index){
                    var v_id        = sr.getId();
                    Ext.Array.push(selected,v_id);
                });
                if(selected.length > 0){
                    var sel = Ext.encode(selected);
                   // console.log("selected="+encodeURIComponent(sel));
                    //If it is selected we don't care about the filter 
                    url_to_add = url_to_add+"selected="+encodeURIComponent(sel);
                }
            }
        }
        
        var urlPdf  = me.getUrlPdfBase()+'?'+url_to_add;
        window.open(urlPdf);
        win.close();
    },
	frmPdfExportLoad: function(tab){
        var me      = this;
        var form    = tab.down('form');
        form.load({url:me.getUrlPdfExportLoad(), method:'GET'});
    },
    csvExport: function(button,format) {
        var me          = this;
        var columns     = me.getGrid().down('headercontainer').getGridColumns();
        var col_list    = [];
        Ext.Array.each(columns, function(item,index){
            if(item.dataIndex != ''){
                var chk = {boxLabel: item.text, name: item.dataIndex, checked: true};
                col_list.push(chk);
            }
        });

        if(!Ext.WindowManager.get('winCsvColumnSelectVouchers')){
            var w = Ext.widget('winCsvColumnSelect',{id:'winCsvColumnSelectVouchers',columns: col_list});
            w.show();         
        }
    },
    csvExportSubmit: function(button){

        var me      = this;
        var win     = button.up('window');
        var form    = win.down('form');

        var chkList = form.query('checkbox');
        var c_found = false;
        var columns = [];
        var c_count = 0;
        Ext.Array.each(chkList,function(item){
            if(item.getValue()){ //Only selected items
                c_found = true;
                columns[c_count] = {'name': item.getName()};
                c_count = c_count +1; //For next one
            }
        },me);

        if(!c_found){
            Ext.ux.Toaster.msg(
                        i18n('sSelect_one_or_more'),
                        i18n('sSelect_one_or_more_columns_please'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{     
            //next we need to find the filter values:
            var filters     = [];
            var f_count     = 0;
            var f_found     = false;
            var filter_json ='';
             
            var filter_collection = me.getGrid().getStore().getFilters();     
            if(filter_collection.count() > 0){
                var i = 0;
                while (f_count < filter_collection.count()) { 

                    //console.log(filter_collection.getAt(f_count).serialize( ));
                    f_found         = true;
                    var ser_item    = filter_collection.getAt(f_count).serialize( );
                    ser_item.field  = ser_item.property;
                    filters[f_count]= ser_item;
                    f_count         = f_count + 1;
                    
                }     
            }
               
            var col_json        = "columns="+encodeURIComponent(Ext.JSON.encode(columns));
            var extra_params    = Ext.Object.toQueryString(Ext.Ajax.getExtraParams());
            var append_url      = "?"+extra_params+'&'+col_json;
            if(f_found){
                filter_json = "filter="+encodeURIComponent(Ext.JSON.encode(filters));
                append_url  = append_url+'&'+filter_json;
            }
            window.open(me.getUrlExportCsv()+append_url);
            win.close();
        }
    },
    email: function(button){
        var me = this;
        var sel_count = me.getGrid().getSelectionModel().getCount();
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

                //Determine the selected record:
                var sr              = me.getGrid().getSelectionModel().getLastSelected();
                var voucher_name    = sr.get('name');

                if(!Ext.WindowManager.get('winVoucherEmailDetailId'+sr.getId())){
                    var w = Ext.widget('winVoucherEmailDetail',
                        {
                            id          : 'winVoucherEmailDetailId'+sr.getId(),
                            voucherId   : sr.getId(),
                            voucher_name: voucher_name
                        });
                    w.show();       
                }
            }    
        }
    },
    emailSend: function(button){
        var me      = this;
        var win     = button.up('window');
        var form    = win.down('form');
        form.setLoading(true); //Mask it
        form.submit({
            clientValidation: true,
            url: me.getUrlEmailSend(),
            success: function(form, action) {
                win.close();
                Ext.ux.Toaster.msg(
                    'Voucher details sent',
                    'Voucher details sent fine',
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
            },
            failure: Ext.ux.formFail
        });
    },
    quantityChange: function(number){
        var me      = this;
        var form    = number.up('form');
        var batch   = form.down('#batch');
        var value   = number.getValue();
        if(value>1){
            batch.setVisible(true);
            batch.setDisabled(false);   
        }else{
            batch.setVisible(false);
            batch.setDisabled(true);
        }
    },
    chkActivateOnLoginChange: function(chk){
        var me      = this;
        var form    = chk.up('form');
        var dv      = form.down('#days_valid');
        var hv      = form.down('#hours_valid');
        var mv      = form.down('#minutes_valid');
        var value   = chk.getValue();
        if(value){
            dv.setVisible(true);
            dv.setDisabled(false); 
            hv.setVisible(true);
            hv.setDisabled(false);
            mv.setVisible(true);
            mv.setDisabled(false);       
        }else{
            dv.setVisible(false);
            dv.setDisabled(true);
            hv.setVisible(false);
            hv.setDisabled(true);
            mv.setVisible(false);
            mv.setDisabled(true);
        }
    },
    chkNeverExpireChange: function(chk){
        var me      = this;
        var form    = chk.up('form');
        var e       = form.down('#expire');
        var value   = chk.getValue();
        if(value){
            e.setDisabled(true);                
        }else{
            e.setDisabled(false);
        }
    },
	chkSsidOnlyChange: function(chk){
        var me      = this;
        var form    = chk.up('form');
        var list    = form.down('#ssid_list');
        var value   = chk.getValue();
        if(value){
            list.setVisible(true);
            list.setDisabled(false);
        }else{
            list.setVisible(false);
            list.setDisabled(true);
        }
    },
    selectVoucherPrivate:  function(grid, record, item, index, event){
        var me = this;
        //Adjust the Edit and Delete buttons accordingly...
        //Dynamically update the top toolbar
        tb = me.getPrivateGrid().down('toolbar[dock=top]');
        var del = record.get('delete');
        if(del == true){
            if(tb.down('#delete') != null){
                tb.down('#delete').setDisabled(false);
            }
        }else{
            if(tb.down('#delete') != null){
                tb.down('#delete').setDisabled(true);
            }
        }
    },
    onBeforeEditVoucherPrivate: function(g,e){
        var me = this;
        return e.record.get('edit');
    },
    cmbVendorChange: function(cmb){
        var me = this;
        var value   = cmb.getValue();
        var grid    = cmb.up('gridVoucherPrivate');
        var attr    = grid.down('cmbAttribute');
        //Cause this to result in a reload of the Attribute combo
        attr.getStore().getProxy().setExtraParam('vendor',value);
        attr.getStore().load();   
    },
    attrAdd: function(b){
        var me = this;
        var grid    = b.up('gridVoucherPrivate');
        var attr    = grid.down('cmbAttribute');
        var a_val   = attr.getValue();
        if(a_val == null){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{

            //We do double's
            var f = grid.getStore().find('attribute',a_val);
            if(f == -1){
                grid.getStore().add(Ext.create('Rd.model.mPrivateAttribute',
                    {
                        type            : 'check',
                        attribute       : a_val,
                        op              : ':=',
                        value           : i18n('sReplace_this_value'),
                        delete          : true,
                        edit            : true
                    }
                ));
                grid.getStore().sync();
            }else{
                //We allow second entried for multiple values
                grid.getStore().add(Ext.create('Rd.model.mPrivateAttribute',
                    {
                        type            : 'check',
                        attribute       : a_val,
                        op              : '+=',
                        value           : i18n('sReplace_this_value'),
                        delete          : true,
                        edit            : true
                    }
                ));
                grid.getStore().sync(); 
            }
        }
    },

    attrReload: function(b){
        var me = this;
        var grid = b.up('gridVoucherPrivate');
        grid.getStore().load();
    },
    attrDelete: function(button){

        var me      = this;
        var grid    = button.up('gridVoucherPrivate');
        //Find out if there was something selected
        if(grid.getSelectionModel().getCount() == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
            Ext.MessageBox.confirm(i18n('sConfirm'), i18n('sAre_you_sure_you_want_to_do_that_qm'), function(val){
                if(val== 'yes'){
                    grid.getStore().remove(grid.getSelectionModel().getSelection());
                    grid.getStore().sync({
                        success: function(batch,options){
                            Ext.ux.Toaster.msg(
                                i18n('sItem_deleted'),
                                i18n('sItem_deleted_fine'),
                                Ext.ux.Constants.clsInfo,
                                Ext.ux.Constants.msgInfo
                            );
                           // grid.getStore().load();   //Update the count
                            me.reload();   
                        },
                        failure: function(batch,options,c,d){
                            Ext.ux.Toaster.msg(
                                i18n('sProblems_deleting_item'),
                                batch.proxy.getReader().rawData.message.message,
                                Ext.ux.Constants.clsWarn,
                                Ext.ux.Constants.msgWarn
                            );
                            grid.getStore().load(); //Reload from server since the sync was not good
                        }
                    });
                }
            });
        }
    },
	deviceAdd: function(button){
        var me      = this;
        var pnl     = button.up("pnlVoucher");
        
        //Entry points present; continue 
        var store   	= pnl.down("gridVoucherDevices").getStore();

        if(!Ext.WindowManager.get('winVoucherAddDeviceId')){
            var w = Ext.widget('winVoucherAddDevice',
            {
                id          :'winVoucherAddDeviceId',
                store       : store,
                username    : pnl.v_name	
            });
            w.show();         
        }
    },
    btnDeviceAddSave: function(button){
        var me      = this;
        var win     = button.up("winVoucherAddDevice");
        var form    = win.down('form');
        form.submit({
            clientValidation: true,
            url: me.getUrlAddDevice(),
            success: function(form, action) {
                win.close();
                win.store.load();
                Ext.ux.Toaster.msg(
                    i18n('sItem_added'),
                    i18n('sItem_added_fine'),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
            },
            failure: Ext.ux.formFail
        });
    },
	deviceReload: function(b){
		var me = this;
        var grid = b.up('gridVoucherDevices');
        grid.getStore().load();
	},
	deviceDelete:   function(btn){
        var me      = this;
        var pnl     = btn.up("pnlVoucher");
        var grid    = pnl.down("gridVoucherDevices");
    
        //Find out if there was something selected
        if(grid.getSelectionModel().getCount() == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item_to_delete'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
            Ext.MessageBox.confirm(i18n('sConfirm'), i18n('sAre_you_sure_you_want_to_do_that_qm'), function(val){
                if(val== 'yes'){
                    grid.getStore().remove(grid.getSelectionModel().getSelection());
                    grid.getStore().sync({
                        success: function(batch,options){
                            Ext.ux.Toaster.msg(
                                i18n('sItem_deleted'),
                                i18n('sItem_deleted_fine'),
                                Ext.ux.Constants.clsInfo,
                                Ext.ux.Constants.msgInfo
                            );  
                        },
                        failure: function(batch,options,c,d){
                            Ext.ux.Toaster.msg(
                                i18n('sProblems_deleting_item'),
                                batch.proxy.getReader().rawData.message.message,
                                Ext.ux.Constants.clsWarn,
                                Ext.ux.Constants.msgWarn
                            );
                            grid.getStore().load(); //Reload from server since the sync was not good
                        }
                    });
                }
            });
        }
    },
    gridVoucherRadacctsReload: function(button){
        var me  = this;
        var g   = button.up('gridVoucherRadaccts');
        g.getSelectionModel().deselectAll(true);
        g.getStore().load();
    },
    
    deleteRadaccts:   function(button){
        var me      = this;
        var grid    = button.up('grid');   
        //Find out if there was something selected
        if(grid.getSelectionModel().getCount() == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item_to_delete'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
            Ext.MessageBox.confirm(i18n('sConfirm'), i18n('sAre_you_sure_you_want_to_do_that_qm'), function(val){
                if(val== 'yes'){
                    var selected    = grid.getSelectionModel().getSelection();
                    var list        = [];
                    Ext.Array.forEach(selected,function(item){
                        var id = item.getId();
                        Ext.Array.push(list,{'id' : id});
                    });
                    Ext.Ajax.request({
                        url: me.getUrlDeleteRadaccts(),
                        method: 'POST',          
                        jsonData: list,
                        success: function(batch,options){console.log('success');
                            Ext.ux.Toaster.msg(
                                i18n('sItem_deleted'),
                                i18n('sItem_deleted_fine'),
                                Ext.ux.Constants.clsInfo,
                                Ext.ux.Constants.msgInfo
                            );
                            grid.getSelectionModel().deselectAll(true);
                            grid.getStore().load();
                        },                                    
                        failure: function(batch,options){
                            Ext.ux.Toaster.msg(
                                i18n('sProblems_deleting_item'),
                                batch.proxy.getReader().rawData.message.message,
                                Ext.ux.Constants.clsWarn,
                                Ext.ux.Constants.msgWarn
                            );
                            grid.getSelectionModel().deselectAll(true);
                            grid.getStore().load();
                        }
                    });
                }
            });
        }
    },
    
    
    genericDelete:   function(button){
        var me      = this;
        var grid    = button.up('grid');  
        console.log(grid); 
        //Find out if there was something selected
        if(grid.getSelectionModel().getCount() == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item_to_delete'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
            Ext.MessageBox.confirm(i18n('sConfirm'), i18n('sAre_you_sure_you_want_to_do_that_qm'), function(val){
                if(val== 'yes'){
                    grid.getStore().remove(grid.getSelectionModel().getSelection());
                    grid.getStore().sync({
                        success: function(batch,options){
                            Ext.ux.Toaster.msg(
                                i18n('sItem_deleted'),
                                i18n('sItem_deleted_fine'),
                                Ext.ux.Constants.clsInfo,
                                Ext.ux.Constants.msgInfo
                            );
                            grid.getStore().load();  
                        },
                        failure: function(batch,options,c,d){
                            Ext.ux.Toaster.msg(
                                i18n('sProblems_deleting_item'),
                                batch.proxy.getReader().rawData.message.message,
                                Ext.ux.Constants.clsWarn,
                                Ext.ux.Constants.msgWarn
                            );
                            grid.getStore().load(); //Reload from server since the sync was not good
                        }
                    });
                }
            });
        }
    },
    changePassword: function(){
        var me = this;
     //   console.log("Changing password");
         //Find out if there was something selected
        var sel_count = me.getGrid().getSelectionModel().getCount();
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

                //Determine the selected record:
                var sr = me.getGrid().getSelectionModel().getLastSelected(); 
                if(!Ext.WindowManager.get('winVoucherPassword'+sr.getId())){
                    var w = Ext.widget('winVoucherPassword',
                        {
                            id          : 'winVoucherPassword'+sr.getId(),
                            voucher_id  : sr.getId(),
                            username    : sr.get('name'),
                            title       : i18n('sChange_password_for')+' '+sr.get('name')
                        });
                    w.show();       
                }
            }    
        }
    },
    changePasswordSubmit: function(button){
        var me      = this;
        var win     = button.up('window');
        var form    = win.down('form');

        var extra_params        = {};
        var sr                  = me.getGrid().getSelectionModel().getLastSelected();
        extra_params['voucher_id'] = sr.getId();

        //Checks passed fine...
        //form.setLoading(true); //Mask it    
        form.submit({
            clientValidation    : true,
            url                 : me.getUrlChangePassword(),
            params              : extra_params,
            success             : function(form, action) {

				if(action.result.success == false){

					Ext.ux.Toaster.msg(
		                    'Problem encountered',
		                    action.result.message.message,
		                    Ext.ux.Constants.clsError,
		                    Ext.ux.Constants.msgError
		        	);

				}else{

				    win.close();
				    me.reload();
				    Ext.ux.Toaster.msg(
				        i18n('sPassword_changed'),
				        i18n('sPassword_changed_fine'),
				        Ext.ux.Constants.clsInfo,
				        Ext.ux.Constants.msgInfo
				    );

				}
            },
            failure             : Ext.ux.formFail
        });
    },
    testRadius: function(){
        var me = this;
        var grid    = me.getGrid();
        //Find out if there was something selected
        if(grid.getSelectionModel().getCount() == 0){ 
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item_to_test'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
            var sr = grid.getSelectionModel().getLastSelected();
            me.application.runAction('cRadiusClient','TestVoucher',sr);        
        }
    },
    renderEventRealm: function(cmb){
        var me                  = this;
        var pnlPu               = cmb.up('pnlVoucher');
        pnlPu.cmbRealmRendered  = true;
        if(pnlPu.record != undefined){
            var rn      = pnlPu.record.get('realm');
            var r_id    = pnlPu.record.get('realm_id');
            var rec     = Ext.create('Rd.model.mRealm', {name: rn, id: r_id});
            cmb.getStore().loadData([rec],false);
        }
    },
    renderEventProfile: function(cmb){
        var me          = this;
        var pnlPu       = cmb.up('pnlVoucher');
        pnlPu.cmbProfileRendered  = true;
        if(pnlPu.record != undefined){
            var pn      = pnlPu.record.get('profile');
            var p_id    = pnlPu.record.get('profile_id');
            var rec     = Ext.create('Rd.model.mProfile', {name: pn, id: p_id});
            cmb.getStore().loadData([rec],false);
        }
    },
    graph: function(button){
        var me = this;  
        //Find out if there was something selected
        if(me.getGrid().getSelectionModel().getCount() == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
            //Check if the node is not already open; else open the node:
            var tp      = me.getGrid().up('tabpanel');
            var sr      = me.getGrid().getSelectionModel().getLastSelected();
            var id      = sr.getId();
            var tab_id  = 'voucherTabGraph_'+id;
            var nt      = tp.down('#'+tab_id);
            if(nt){
                tp.setActiveTab(tab_id); //Set focus on  Tab
                return;
            }
            var dd              = me.application.getDashboardData();
            var timezone_id     = dd.user.timezone_id;

            var tab_name = sr.get('name');
            //Tab not there - add one
            tp.add({ 
                title       : tab_name,
                itemId      : tab_id,
                closable    : true,
                glyph       : Rd.config.icnGraph, 
                xtype       : 'pnlVoucherGraphs',
                timezone_id : timezone_id,
                v_name      : tab_name,
                tabConfig   : {
                     ui: me.ui
                }
            });
            tp.setActiveTab(tab_id); //Set focus on Add Tab 
        }
    },
    onActionColumnItemClick: function(view, rowIndex, colIndex, item, e, record, row, action){
        var me = this;
        var grid = view.up('grid');
        grid.setSelection(record);
        if(action == 'update'){
            me.edit(); 
        }
        if(action == 'delete'){
            me.del(); 
        }
    },
    onActionColumnMenuItemClick: function(grid,action){
        var me = this;
        grid.setSelection(grid.selRecord);
        if(action == 'password'){
            me.changePassword();
        }
        
        if(action == 'radius'){
            me.testRadius();
        }
        if(action == 'graphs'){
            me.graph();
        }
    }
});
