Ext.define('Rd.controller.cDynamicDetails', {
    extend: 'Ext.app.Controller',
    actionIndex: function(pnl,itemId){
        var me      = this;
        var item    = pnl.down('#'+itemId);
        var added   = false;
        if(!item){
            var tp = Ext.create('Ext.tab.Panel',
            	{          
	            	border  : false,
	                itemId  : itemId,
	                plain	: true,
	                cls     : 'subSubTab', //Make darker -> Maybe grey
	                tabBar: {
                        items: [
                            { 
                                xtype   : 'btnOtherBack'
                            }              
                       ]
                    },
	                items   : [
	                    { 
	                        title   : 'Login Pages', 
	                        xtype   : 'gridDynamicDetails',
	                        border  : false,
	                        plain   : true,
	                        glyph   : 'xf0a9@FontAwesome',
                            padding : Rd.config.gridSlim,
	                    }
	                ]
	            });      
            pnl.add(tp);
            pnl.on({activate : me.gridActivate,scope: me});
            added = true;
        }
        return added;      
    },
    views:  [
        'dynamicDetails.gridDynamicDetails', 'dynamicDetails.winDynamicDetailAdd', 'dynamicDetails.pnlDynamicDetail',
        'components.winCsvColumnSelect',    'dynamicDetails.pnlDynamicDetailDetail',
        'dynamicDetails.pnlDynamicDetailLogo',  'dynamicDetails.pnlDynamicDetailPhoto', 'dynamicDetails.winPhotoAdd',
        'dynamicDetails.winPhotoEdit',      'dynamicDetails.gridDynamicDetailPages',    'dynamicDetails.winPageAdd',
        'dynamicDetails.winPageEdit',       'dynamicDetails.gridDynamicDetailPairs',    'dynamicDetails.winPairAdd',
        'dynamicDetails.winPairEdit',       'dynamicDetails.pnlDynamicDetailSettings',  'dynamicDetails.pnlDynamicDetailClickToConnect',
		'dynamicDetails.cmbThemes',			'components.cmbPermanentUser',				'components.cmbRealm',
		'components.cmbProfile',			'dynamicDetails.pnlDynamicDetailSocialLogin'  ,
		'dynamicDetails.cmbDynamicDetailLanguages',
		'dynamicDetails.pnlDynamicDetailEmails', 'dynamicDetails.winEmailAdd',
		'dynamicDetails.gridDynamicDetailTranslations',
		'dynamicDetails.winPhotoTranslate'     
    ],
    stores: ['sDynamicDetails', 'sPermanentUsers','sProfiles','sRealms'],
    models: [
		'mDynamicDetail','mDynamicPhoto', 
		'mDynamicPage', 'mDynamicPair', 'mPermanentUser',
		'mProfile',		'mRealm',       'mDataCollector'
	],
    selectedRecord: null,
    config: {
        urlAdd:             '/cake4/rd_cake/dynamic-details/add.json',
        urlEdit:            '/cake4/rd_cake/dynamic-details/edit.json',
        urlEditSettings:    '/cake4/rd_cake/dynamic-details/edit-settings.json',
        urlEditClickToConnect:    '/cake4/rd_cake/dynamic-details/edit-click-to-connect.json',
        urlDelete:          '/cake4/rd_cake/dynamic-details/delete.json',
        urlExportCsv:       '/cake4/rd_cake/dynamic-details/export-csv',
        urlViewDynamicDetail: '/cake4/rd_cake/dynamic-details/view.json',
        urlLogoBase:        '/cake4/rd_cake/img/dynamic_details/',
        urlUploadLogo:      '/cake4/rd_cake/dynamic-details/upload_logo.json',
        urlUploadPhoto:     '/cake4/rd_cake/dynamic-details/upload-photo.json',
        urlEditPhoto:       '/cake4/rd_cake/dynamic-details/edit-photo.json',
        urlAddPage:         '/cake4/rd_cake/dynamic-details/add-page.json',
        urlEditPage:        '/cake4/rd_cake/dynamic-details/edit_page.json',
        urlAddPair:         '/cake4/rd_cake/dynamic-details/add_pair.json',
        urlEditPair:        '/cake4/rd_cake/dynamic-details/edit_pair.json',
        urlPreviewMobile:   '/cake4/rd_cake/dynamic-details/preview-chilli-mobile',
        urlPreviewDesktop:  '/cake4/rd_cake/dynamic-details/preview-chilli-desktop',
		urlViewSocial:		'/cake4/rd_cake/dynamic-details/view-social-login.json',
		urlEditSocial:		'/cake4/rd_cake/dynamic-details/edit-social-login.json',
		urlAddEmail:        '/cake4/rd_cake/data-collectors/add.json',
		urlEmailExportCsv:  '/cake4/rd_cake/data-collectors/export-csv'
    },
    refs: [
         {  ref:    'grid',           selector:   'gridDynamicDetails'}
    ],
    init: function() {
        var me = this;
        if (me.inited) {
            return;
        }
        me.inited = true;
        me.control({
            'gridDynamicDetails #reload': {
                click:      me.reload
            },
            'gridDynamicDetails #add': {
                click:      me.add
            },
            'gridDynamicDetails #delete': {
                click:      me.del
            },
            'gridDynamicDetails #edit': {
                click:      me.edit
            },
            'gridDynamicDetails #csv'  : {
                click:      me.csvExport
            },
            'gridDynamicDetails #mobile'  : {
                click:      me.previewMobile
            },
            'gridDynamicDetails #desktop'  : {
                click:      me.previewDesktop
            },
            'gridDynamicDetails #dcEmail': {
                click:      me.dcEmail
            },
            'gridDynamicDetails #translate': {
                click:      me.translate
            },
            'gridDynamicDetails'   : {
                itemclick:  me.gridClick
            },
            'gridDynamicDetails actioncolumn': { 
                 itemClick  : me.onActionColumnItemClick
            },
            'winDynamicDetailAdd #chkTc' : {
                change:  me.chkTcChange
            },
            'winDynamicDetailAdd #btnDataNext' : {
                click:  me.addSubmit
            },
            'pnlDynamicDetail pnlDynamicDetailDetail #save' : {
                click:  function(b){
                    var me = this;
                    me.editSubmit(b,me.getUrlEdit());
                }
            },
            '#winCsvColumnSelectDynamicDetails #save': {
                click:  me.csvExportSubmit
            },
            'pnlDynamicDetail #tabDetail': {
                beforerender:   me.tabDetailActivate,
                activate:       me.tabDetailActivate
            },
			'pnlDynamicDetail #tabSettings #chkUserLogin' : {
                change:  me.chkUserLoginChange
            },
			'pnlDynamicDetail #tabSettings #chkAutoSuffix' : {
                change:  me.chkAutoSuffixChange
            },
            'pnlDynamicDetail #tabSettings #chkTc' : {
                change:  me.chkTcChange
            },
            'pnlDynamicDetail #tabLogo': {
                activate:       me.tabLogoActivate
            },
            'pnlDynamicDetail #tabLogo #save': {
                click:       me.logoSave
            },
            'pnlDynamicDetail #tabLogo #cancel': {
                click:       me.logoCancel
            },
            'pnlDynamicDetail #tabPhoto': {
                activate:       me.tabPhotoActivate
            },
            'pnlDynamicDetail #tabPhoto #reload': {
                click:       me.photoReload
            },
            'pnlDynamicDetail #tabPhoto #add': {
                click:       me.photoAdd
            },
            'pnlDynamicDetail #tabPhoto #delete': {
                click:      me.photoDel
            },
            'pnlDynamicDetail #tabPhoto #edit': {
                click:      me.photoEdit
            },
            'pnlDynamicDetail #tabPhoto #translate': {
                click:      me.photoTranslate
            },
            'winPhotoAdd #save': {
                click:      me.photoAddSave
            },
            'winPhotoAdd #cancel': {
                click:      me.photoAddCancel
            },
            'winPhotoEdit #save': {
                click:      me.photoEditSave
            },
            'winPhotoEdit #cancel': {
                click:      me.photoEditCancel
            },
            'winPhotoTranslate #save': {
                click:      me.photoTSave
            },
            'pnlDynamicDetail #tabPages': {
                activate:       me.tabPagesActivate
            },
            'pnlDynamicDetail gridDynamicDetailPages #reload': {
                click:       me.pageReload
            },
            'pnlDynamicDetail gridDynamicDetailPages #add': {
                click:       me.pageAdd
            },
            'pnlDynamicDetail gridDynamicDetailPages #delete': {
                click:      me.pageDel
            },
            'pnlDynamicDetail gridDynamicDetailPages #edit': {
                click:      me.pageEdit
            },
            'winPageAdd #save': {
                click:      me.pageAddSave
            },
            'winPageEdit #save': {
                click:      me.pageEditSave
            },
            'pnlDynamicDetail #tabPairs': {
                activate:       me.tabPairsActivate
            },
            'pnlDynamicDetail gridDynamicDetailPairs #reload': {
                click:       me.pairReload
            },
            'pnlDynamicDetail gridDynamicDetailPairs #add': {
                click:       me.pairAdd
            },
            'pnlDynamicDetail gridDynamicDetailPairs #delete': {
                click:      me.pairDel
            },
            'pnlDynamicDetail gridDynamicDetailPairs #edit': {
                click:      me.pairEdit
            },
            'winPairAdd #save': {
                click:      me.pairAddSave
            },
            'winPairEdit #save': {
                click:      me.pairEditSave
            },
			'pnlDynamicDetail #tabSocialLogin': {
                activate:       me.tabSocialLoginActivate
            },
            'pnlDynamicDetail pnlDynamicDetailSettings #save' : {
                click:  function(b){
                    var me = this;
                    me.editSubmit(b,me.getUrlEditSettings());
                }
            },
            'pnlDynamicDetail pnlDynamicDetailClickToConnect #save' : {
                click:  function(b){
                    var me = this;
                    me.editSubmit(b,me.getUrlEditClickToConnect());
                }
            },
			'pnlDynamicDetail pnlDynamicDetailSocialLogin #save' : {
                click:  function(b){
                    var me = this;
                    me.editSubmit(b,me.getUrlEditSocial());
                }
            },
            'pnlDynamicDetailEmails':{
                activate: function(t){
                    console.log("Email tab active pappie");
                }
            },
            'gridDynamicDetailEmails #reload': {
                click:      me.emailReload
            },
            'gridDynamicDetailEmails #add': {
                click:      me.emailAdd
            },
            'gridDynamicDetailEmails #edit': {
               // click:      me.addEmail
            },
            'gridDynamicDetailEmails #delete': {
                click:      me.emailDel
            },
            'gridDynamicDetailEmails #csv': {
                click:      me.emailCsvExport
            },
            '#winCsvColumnSelectDynamicDetailsEmail #save': {
                click:  me.emailCsvExportSubmit
            },
            'winEmailAdd #save': {
                click:      me.emailAddSave
            }
        });
    },
    appClose:   function(){
        var me          = this;
        me.populated    = false;
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
    reload: function(){
        var me =this;
        me.getGrid().getSelectionModel().deselectAll(true);
        me.getStore('sDynamicDetails').load();
    },
    gridClick:  function(grid, record, item, index, event){
        var me                  = this;
        me.selectedRecord = record;
        //Dynamically update the top toolbar
        tb = me.getGrid().down('toolbar[dock=top]');

        var edit = record.get('update');
        if(edit == true){
            if(tb.down('#edit') != null){
                tb.down('#edit').setDisabled(false);
            }
        }else{
            if(tb.down('#edit') != null){
                tb.down('#edit').setDisabled(true);
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
    add: function(button){
        var me 		= this;
        var c_name 	= Ext.getApplication().getCloudName();
        var c_id	= Ext.getApplication().getCloudId()
        if(!Ext.WindowManager.get('winDynamicDetailAddId')){
            var w = Ext.widget('winDynamicDetailAdd',{id:'winDynamicDetailAddId',cloudId: c_id, cloudName: c_name});
            w.show();         
        }
    },
    addSubmit: function(button){
        var me      = this;
        var win     = button.up('window');
        var form    = win.down('form');
        form.submit({
            clientValidation: true,
            url: me.getUrlAdd(),
            success: function(form, action) {
                win.close();
                me.getStore('sDynamicDetails').load();
                Ext.ux.Toaster.msg(
                    i18n('sNew_item_created'),
                    i18n('sItem_created_fine'),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
            },
            //Focus on the first tab as this is the most likely cause of error 
            failure: function(form,action){
                var tp = win.down('tabpanel');
                tp.setActiveTab(0);
                Ext.ux.formFail(form,action)
            }
        });
    },
	chkUserLoginChange: function(chk){
        var me      = this;
        var form    = chk.up('form');
        var chkSuff = form.down('#chkAutoSuffix');
		var txtSuff = form.down('#txtSuffix');
        var value   = chk.getValue();
        if(value){
            chkSuff.setDisabled(false); 
			//txtSuff.setDisabled(false);               
        }else{
			chkSuff.setDisabled(true); 
			txtSuff.setDisabled(true);
        }
    },
	chkAutoSuffixChange: function(chk){
        var me      = this;
        var form    = chk.up('form');
		var txtSuff = form.down('#txtSuffix');
        var value   = chk.getValue();
        if(value){
			txtSuff.setDisabled(false);               
        }else{
			txtSuff.setDisabled(true);
        }
    },
    chkTcChange: function(chk){
        var me      = this;
        var form    = chk.up('form');
        var url     = form.down('#txtTcUrl');
        var value   = chk.getValue();
        if(value){
            url.setDisabled(false);                
        }else{
            url.setDisabled(true);
        }
    },
    del:   function(button){
        var me      = this;     
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
    edit: function(){
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
            var user_id = sr.get('user_id');
            var tab_id  = 'dynamicDetailTab_'+id;
            var nt      = tp.down('#'+tab_id);
            if(nt){
                tp.setActiveTab(tab_id); //Set focus on  Tab
                return;
            }

            var tab_name = me.selectedRecord.get('name');
            //Tab not there - add one
            tp.add({ 
                title :     tab_name,
                itemId:     tab_id,
                closable:   true,
                glyph       : Rd.config.icnEdit, 
                layout:     'fit',
                tabConfig : {
                        ui : me.ui
                }, 
                items:      {'xtype' : 'pnlDynamicDetail',dynamic_detail_id: id, user_id: user_id}
            });
            tp.setActiveTab(tab_id); //Set focus on Add Tab
        }
    },
    editSubmit: function(button,url){
        var me      = this;
        var form    = button.up('form');  
        form.submit({
            clientValidation: true,
            url: url,
            success: function(form, action) {
                me.getStore('sDynamicDetails').load();
                Ext.ux.Toaster.msg(
                    i18n('sItem_updated'),
                    i18n('sItem_updated_fine'),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
                if(url == me.getUrlEdit()){
                    var tab  = button.up('#tabDetail');
                    me.tabDetailActivate(tab);  
                }         
            },
            failure: Ext.ux.formFail
        });
    },
    csvExport: function(button,format) {
        var me          = this;
        var columns     = me.getGrid().columnManager.columns;
        var col_list    = [];
        Ext.Array.each(columns, function(item,index){
            if(item.dataIndex != ''){
                var chk = {boxLabel: item.text, name: item.dataIndex, checked: true};
                col_list[index] = chk;
            }
        }); 

        if(!Ext.WindowManager.get('winCsvColumnSelectDynamicDetails')){
            var w = Ext.widget('winCsvColumnSelect',{id:'winCsvColumnSelectDynamicDetails',columns: col_list});
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

                   // console.log(filter_collection.getAt(f_count).serialize( ));
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
    tabDetailActivate : function(tab){
        var me      = this;
        var form    = tab;
        var dynamic_detail_id= tab.up('pnlDynamicDetail').dynamic_detail_id; 
        form.load({
            url     : me.getUrlViewDynamicDetail(), 
            method  : 'GET',
            params  : {dynamic_detail_id:dynamic_detail_id},
            success : function(a,b,c){
               
            }
        });
    },
    tabLogoActivate: function(tab){
        var me      = this;
        var pnl_n   = tab.up('pnlNas');
        var dynamic_detail_id= tab.up('pnlDynamicDetail').dynamic_detail_id;
        var p_img   = tab.down('#pnlImg');
        Ext.Ajax.request({
            url: me.getUrlViewDynamicDetail(),
            method: 'GET',
            params: {dynamic_detail_id : dynamic_detail_id },
            success: function(response){
                var jsonData    = Ext.JSON.decode(response.responseText);
                if(jsonData.success){
                    var img_url = me.getUrlLogoBase()+jsonData.data.icon_file_name;
                    p_img.update({image:img_url});
                }   
            },
            scope: me
        });
    },
    logoSave: function(button){
        var me      = this;
        var form    = button.up('form');
        var pnl_r   = form.up('pnlDynamicDetail');
        var p_form  = form.up('panel');
        var p_img   = p_form.down('#pnlImg');
        form.submit({
            clientValidation: true,
            waitMsg: 'Uploading your photo...',
            url: me.getUrlUploadLogo(),
            params: {'id' : pnl_r.dynamic_detail_id },
            success: function(form, action) {              
                if(action.result.success){ 
                    var new_img = action.result.icon_file_name;    
                    var img_url = me.getUrlLogoBase()+new_img;
                    p_img.update({image:img_url});
                } 
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
    logoCancel: function(button){
        var me      = this;
        var form    = button.up('form');
        form.getForm().reset();
    },
    tabPhotoActivate:  function(t){
        var me = this;
        t.down('dataview').getStore().load();
    },
    photoReload:  function(b){
        var me = this;
        b.up('#tabPhoto').down('dataview').getStore().load();
    },
    photoAdd: function(b){
        var me = this;
        var d_id = b.up('pnlDynamicDetail').dynamic_detail_id;
        var d_v  = b.up('#tabPhoto').down('dataview');

        if(!Ext.WindowManager.get('winPhotoAddId')){
            var w   = Ext.widget('winPhotoAdd',
            {
                id                  : 'winPhotoAddId',
                dynamic_detail_id   : d_id,
                data_view           : d_v
            });
            w.show();      
        }
    },
    photoAddSave: function(button){
        var me      = this;
        var form    = button.up('form');
        var window  = form.up('window');

        form.submit({
            clientValidation: true,
            waitMsg: 'Uploading your photo...',
            url: me.getUrlUploadPhoto(),
            params: {'dynamic_detail_id' : window.dynamic_detail_id },
            success: function(form, action) {              
                //FIXME reload store....
                Ext.ux.Toaster.msg(
                    i18n('sItem_updated'),
                    i18n('sItem_updated_fine'),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
                window.data_view.getStore().load();
                window.close();
            },
            failure: Ext.ux.formFail
        });
    },
    photoAddCancel: function(button){
        var me      = this;
        var form    = button.up('form');
        form.getForm().reset();
    },
    photoDel:   function(button){
        var me      = this;
        var d_view  = button.up('#tabPhoto').down('dataview');     
        //Find out if there was something selected
        if(d_view.getSelectionModel().getCount() == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item_to_delete'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
            Ext.MessageBox.confirm(i18n('sConfirm'), i18n('sAre_you_sure_you_want_to_do_that_qm'), function(val){
                if(val== 'yes'){
                    d_view.getStore().remove(d_view.getSelectionModel().getSelection());
                    d_view.getStore().sync({
                        success: function(batch,options){
                            Ext.ux.Toaster.msg(
                                i18n('sItem_deleted'),
                                i18n('sItem_deleted_fine'),
                                Ext.ux.Constants.clsInfo,
                                Ext.ux.Constants.msgInfo
                            );
                            d_view.getStore().load();   //Update the count   
                        },
                        failure: function(batch,options,c,d){
                            Ext.ux.Toaster.msg(
                                i18n('sProblems_deleting_item'),
                                batch.proxy.getReader().rawData.message.message,
                                Ext.ux.Constants.clsWarn,
                                Ext.ux.Constants.msgWarn
                            );
                            d_view.getStore().load(); //Reload from server since the sync was not good
                        }
                    });

                }
            });
        }
    },
    photoEdit:   function(button){
        var me      = this;
        var d_view  = button.up('#tabPhoto').down('dataview');     
        //Find out if there was something selected
        if(d_view.getSelectionModel().getCount() == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item_to_edit'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
            if(d_view.getSelectionModel().getCount() > 1){
                Ext.ux.Toaster.msg(
                        i18n('sLimit_the_selection'),
                        i18n('sSelection_limited_to_one'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
                );
            }else{
                if(!Ext.WindowManager.get('winPhotoEditId')){
                    var w   = Ext.widget('winPhotoEdit',
                    {
                        id                  : 'winPhotoEditId',
                        data_view           : d_view
                    });
                    w.down('form').loadRecord(d_view.getSelectionModel().getLastSelected());
                    w.show();     
                }
            }    
        }
    },
    photoEditSave: function(button){
        var me      = this;
        var form    = button.up('form');
        var window  = form.up('window');

        form.submit({
            clientValidation: true,
            waitMsg: 'Updating your photo...',
            url: me.getUrlEditPhoto(),
            success: function(form, action) {              
                Ext.ux.Toaster.msg(
                    i18n('sItem_updated'),
                    i18n('sItem_updated_fine'),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
                window.data_view.getStore().load();
                window.close();
            },
            failure: Ext.ux.formFail
        });
    },
    photoEditCancel: function(button){
        var me      = this;
        var form    = button.up('form');
        form.getForm().reset();
    },
    photoTranslate:   function(button){
        var me      = this;
        var d_view  = button.up('#tabPhoto').down('dataview');     
        //Find out if there was something selected
        if(d_view.getSelectionModel().getCount() == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item_to_edit'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
            if(d_view.getSelectionModel().getCount() > 1){
                Ext.ux.Toaster.msg(
                        i18n('sLimit_the_selection'),
                        i18n('sSelection_limited_to_one'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
                );
            }else{
                if(!Ext.WindowManager.get('winPhotoTranslateId')){
                    var sr = d_view.getSelectionModel().getLastSelected();
                    var dynamic_photo_id    = sr.getId();
                    var dynamic_detail_id   = sr.get('dynamic_detail_id');
                    var w   = Ext.widget('winPhotoTranslate',
                    {
                        id                 : 'winPhotoTranslateId',
                        data_view          : d_view,
                        dynamic_photo_id   : dynamic_photo_id,
                        dynamic_detail_id  : dynamic_detail_id
                    });
                    w.show();     
                }
            }    
        }
    },
    photoTranslateSave: function(button){
        var me      = this;
        var form    = button.up('form');
        var window  = form.up('window');

        form.submit({
            clientValidation: true,
            waitMsg: 'Updating your photo...',
            url: me.getUrlTranslatePhoto(),
            success: function(form, action) {              
                Ext.ux.Toaster.msg(
                    i18n('sItem_updated'),
                    i18n('sItem_updated_fine'),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
                window.data_view.getStore().load();
                window.close();
            },
            failure: Ext.ux.formFail
        });
    },    
    tabPagesActivate: function(g){
        var me      = this;
        g.getStore().load();
    },
    pageReload:  function(b){
        var me = this;
        b.up('pnlDynamicDetail').down('#tabPages').getStore().load();
    },
    pageAdd: function(b){
        var me      = this;
        var d_id    = b.up('pnlDynamicDetail').dynamic_detail_id;
        var grid    = b.up('pnlDynamicDetail').down('#tabPages');

        if(!Ext.WindowManager.get('winPageAddId')){
            var w   = Ext.widget('winPageAdd',
            {
                id                  : 'winPageAddId',
                dynamic_detail_id   : d_id,
                grid                : grid
            });
            w.show();      
        }
    },
    pageAddSave: function(button){
        var me      = this;
        var form    = button.up('form');
        var window  = form.up('window');

        form.submit({
            clientValidation: true,
            url: me.getUrlAddPage(),
            params: {'dynamic_detail_id' : window.dynamic_detail_id },
            success: function(form, action) {              
                //FIXME reload store....
                Ext.ux.Toaster.msg(
                    i18n('sItem_updated'),
                    i18n('sItem_updated_fine'),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
                window.grid.getStore().load();
                window.close();
            },
            failure: Ext.ux.formFail
        });
    },
    pageEdit:   function(b){
        var me      = this;
        var grid    = b.up('pnlDynamicDetail').down('#tabPages');     
        //Find out if there was something selected
        if(grid.getSelectionModel().getCount() == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item_to_edit'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
            if(grid.getSelectionModel().getCount() > 1){
                Ext.ux.Toaster.msg(
                        i18n('sLimit_the_selection'),
                        i18n('sSelection_limited_to_one'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
                );
            }else{
                if(!Ext.WindowManager.get('winPageEditId')){
                    var w   = Ext.widget('winPageEdit',
                    {
                        id                  : 'winPageEditId',
                        grid                : grid
                    });
                    w.down('form').loadRecord(grid.getSelectionModel().getLastSelected());
                    w.show();      
                }
            }    
        }
    },
    pageEditSave: function(button){
        var me      = this;
        var form    = button.up('form');
        var window  = form.up('window');

        form.submit({
            clientValidation: true,
            url: me.getUrlEditPage(),
            success: function(form, action) {              
                Ext.ux.Toaster.msg(
                    i18n('sItem_updated'),
                    i18n('sItem_updated_fine'),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
                window.grid.getStore().load();
                window.close();
            },
            failure: Ext.ux.formFail
        });
    },
    pageDel:   function(b){
        var me      = this;
        var grid    = b.up('pnlDynamicDetail').down('#tabPages');     
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
                            grid.getStore().load();   //Update the count   
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
    tabPairsActivate: function(g){
        var me      = this;
        g.getStore().load();
    },
    pairReload:  function(b){
        var me = this;
        b.up('pnlDynamicDetail').down('#tabPairs').getStore().load();
    },
    pairAdd: function(b){
        var me      = this;
        var d_id    = b.up('pnlDynamicDetail').dynamic_detail_id;
        var grid    = b.up('pnlDynamicDetail').down('#tabPairs');

        if(!Ext.WindowManager.get('winPairAddId')){
            var w   = Ext.widget('winPairAdd',
            {
                id                  : 'winPairAddId',
                dynamic_detail_id   : d_id,
                grid                : grid
            });
            w.show();       
        }
    },
    pairAddSave: function(button){
        var me      = this;
        var form    = button.up('form');
        var window  = form.up('window');

        form.submit({
            clientValidation: true,
            url: me.getUrlAddPair(),
            params: {'dynamic_detail_id' : window.dynamic_detail_id },
            success: function(form, action) {              
                //FIXME reload store....
                Ext.ux.Toaster.msg(
                    i18n('sItem_updated'),
                    i18n('sItem_updated_fine'),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
                window.grid.getStore().load();
                window.close();
            },
            failure: Ext.ux.formFail
        });
    },
    pairEdit:   function(b){
        var me      = this;
        var grid    = b.up('pnlDynamicDetail').down('#tabPairs');     
        //Find out if there was something selected
        if(grid.getSelectionModel().getCount() == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item_to_edit'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
            if(grid.getSelectionModel().getCount() > 1){
                Ext.ux.Toaster.msg(
                        i18n('sLimit_the_selection'),
                        i18n('sSelection_limited_to_one'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
                );
            }else{
                if(!Ext.WindowManager.get('winPairEditId')){
                    var w   = Ext.widget('winPairEdit',
                    {
                        id                  : 'winPairEditId',
                        grid                : grid
                    });
                    w.down('form').loadRecord(grid.getSelectionModel().getLastSelected());
                    w.show();     
                }
            }    
        }
    },
    pairEditSave: function(button){
        var me      = this;
        var form    = button.up('form');
        var window  = form.up('window');

        form.submit({
            clientValidation: true,
            url: me.getUrlEditPair(),
            success: function(form, action) {              
                Ext.ux.Toaster.msg(
                    i18n('sItem_updated'),
                    i18n('sItem_updated_fine'),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
                window.grid.getStore().load();
                window.close();
            },
            failure: Ext.ux.formFail
        });
    },
    pairDel:   function(b){
        var me      = this;
        var grid    = b.up('pnlDynamicDetail').down('#tabPairs');     
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
                            grid.getStore().load();   //Update the count   
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
    previewMobile: function(){
        var me          = this;
        //Find out if there was something selected
        if(me.getGrid().getSelectionModel().getCount() == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
            if(me.getGrid().getSelectionModel().getCount() > 1){
                Ext.ux.Toaster.msg(
                        i18n('sLimit_the_selection'),
                        i18n('sSelection_limited_to_one'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
                );
            }else{
                var record = me.getGrid().getSelectionModel().getLastSelected();
                window.open(me.getUrlPreviewMobile()+"?dynamic_id="+record.getId())
            }         
        }
    },
    previewDesktop: function(b){
         var me          = this;
        //Find out if there was something selected
        if(me.getGrid().getSelectionModel().getCount() == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_an_item'),
                        i18n('sFirst_select_an_item'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
            if(me.getGrid().getSelectionModel().getCount() > 1){
                Ext.ux.Toaster.msg(
                        i18n('sLimit_the_selection'),
                        i18n('sSelection_limited_to_one'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
                );
            }else{
                var record = me.getGrid().getSelectionModel().getLastSelected();
                window.open(me.getUrlPreviewDesktop()+"?dynamic_id="+record.getId())
            }         
        }
    },
	tabSocialLoginActivate : function(tab){
        var me      = this;
        var form    = tab;
        var dynamic_detail_id= tab.up('pnlDynamicDetail').dynamic_detail_id;
        
        if(me.modelInited == undefined ){
		    Ext.define('SocialForm', {
			    extend: 'Ext.data.Model',
			    fields: [
				    {name: 'id',       							type: 'int'},
				    {name: 'social_temp_permanent_user_id',     type: 'int'},
				    {name: 'social_temp_permanent_user_name',   type: 'string'},
				    {name: 'social_enable',    					type: 'boolean', defaultValue: false},
				    {name: 'fb_enable',    					    type: 'boolean', defaultValue: false},
				    {name: 'fb_record_info',    				type: 'boolean', defaultValue: false},
				    {name: 'fb_id',    							type: 'string'},
				    {name: 'fb_secret',    						type: 'string'},
				    {name: 'fb_profile',    					type: 'int'},
				    {name: 'fb_profile_name',    				type: 'string'},
				    {name: 'fb_realm',    						type: 'int'},
				    {name: 'fb_realm_name',    					type: 'string'},
				    {name: 'fb_voucher_or_user',    			type: 'string'},
				    {name: 'gp_enable',    					    type: 'boolean', defaultValue: false},
				    {name: 'gp_record_info',    				type: 'boolean', defaultValue: false},
				    {name: 'gp_id',    							type: 'string'},
				    {name: 'gp_secret',    						type: 'string'},
				    {name: 'gp_profile',    					type: 'int'},
				    {name: 'gp_profile_name',    				type: 'string'},
				    {name: 'gp_realm',    						type: 'int'},
				    {name: 'gp_realm_name',    					type: 'string'},
				    {name: 'gp_voucher_or_user',    			type: 'string'},
				    {name: 'tw_enable',    					    type: 'boolean', defaultValue: false},
				    {name: 'tw_record_info',    				type: 'boolean', defaultValue: false},
				    {name: 'tw_id',    							type: 'string'},
				    {name: 'tw_secret',    						type: 'string'},
				    {name: 'tw_profile',    					type: 'int'},
				    {name: 'tw_profile_name',    				type: 'string'},
				    {name: 'tw_realm',    						type: 'int'},
				    {name: 'tw_realm_name',    					type: 'string'},
				    {name: 'tw_voucher_or_user',    			type: 'string'}
			    ]
		    });
		    
		    me.modelInited = true;
	    }

		//Fetch the info for this tab manually and load the combo's and form
		Ext.Ajax.request({
            url		: me.getUrlViewSocial(),
            method	: 'GET',
			params	:{dynamic_detail_id:dynamic_detail_id},
            success	: function(response){
                var jsonData    = Ext.JSON.decode(response.responseText);
                if(jsonData.success){
                   
					var instance = Ext.create('SocialForm', jsonData.data);
					console.log(instance);
					form.loadRecord(instance);
					//temp username 
					var tu_id   = instance.get('social_temp_permanent_user_id');
					var tu_n    = instance.get('social_temp_permanent_user_name');

					var tu_rec   = Ext.create('Rd.model.mPermanentUser', {username: tu_n, id: tu_id});
					form.down('#socialTempUser').getStore().loadData([tu_rec],false);
					form.down('#socialTempUser').setValue(tu_id);

					//fb profile
					var fb_p_id     = instance.get('fb_profile');
					var fb_p_name   = instance.get('fb_profile_name');
					var fb_p_rec    = Ext.create('Rd.model.mProfile', {name: fb_p_name, id: fb_p_id});
					form.down('#fbProfile').getStore().loadData([fb_p_rec],false);
					form.down('#fbProfile').setValue(fb_p_id);
					
					//fb realm
					var fb_r_id     = instance.get('fb_realm');
					var fb_r_name   = instance.get('fb_realm_name');
					var fb_r_rec    = Ext.create('Rd.model.mRealm', {name: fb_r_name, id: fb_r_id});
					form.down('#fbRealm').getStore().loadData([fb_r_rec],false);
					form.down('#fbRealm').setValue(fb_r_id);

					//gp profile
					var gp_p_id     = instance.get('gp_profile');
					var gp_p_name   = instance.get('gp_profile_name');
					var gp_p_rec    = Ext.create('Rd.model.mProfile', {name: gp_p_name, id: gp_p_id});
					form.down('#gpProfile').getStore().loadData([gp_p_rec],false);
					form.down('#gpProfile').setValue(gp_p_id);
					
					//gp realm
					var gp_r_id     = instance.get('gp_realm');
					var gp_r_name   = instance.get('gp_realm_name');
					var gp_r_rec    = Ext.create('Rd.model.mRealm', {name: gp_r_name, id: gp_r_id});
					form.down('#gpRealm').getStore().loadData([fb_r_rec],false);
					form.down('#gpRealm').setValue(gp_r_id);

					//tw profile
					var tw_p_id     = instance.get('tw_profile');
					var tw_p_name   = instance.get('tw_profile_name');
					var tw_p_rec    = Ext.create('Rd.model.mProfile', {name: tw_p_name, id: tw_p_id});
					form.down('#twProfile').getStore().loadData([tw_p_rec],false);
					form.down('#twProfile').setValue(tw_p_id);
					
					//tw realm
					var tw_r_id     = instance.get('tw_realm');
					var tw_r_name   = instance.get('tw_realm_name');
					var tw_r_rec    = Ext.create('Rd.model.mRealm', {name: tw_r_name, id: tw_r_id});
					form.down('#twRealm').getStore().loadData([tw_r_rec],false);
					form.down('#twRealm').setValue(tw_r_id);

                }   
            },
            scope: me
        });
    },
    dcEmail: function(button){
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
            var user_id = sr.get('user_id');
            var tab_id  = 'dynamicDetailEmailTab_'+id;
            var nt      = tp.down('#'+tab_id);
            if(nt){
                tp.setActiveTab(tab_id); //Set focus on  Tab
                return;
            }

            var tab_name = me.selectedRecord.get('name');
            //Tab not there - add one
            tp.add({ 
                title       : tab_name,
                itemId      : tab_id,
                closable    : true,
                glyph       : Rd.config.icnEmail, 
                layout      : 'fit', 
                items       : {'xtype' : 'pnlDynamicDetailEmails',dynamic_detail_id: id, user_id: user_id}
            });
            tp.setActiveTab(tab_id); //Set focus on Add Tab
        }
    },
    emailReload: function(b){
        var me      = this;
        b.up('pnlDynamicDetailEmails').down('gridDynamicDetailEmails').getStore().load();
    },
    emailAdd: function(b){
        var me      = this;
        var d_id    = b.up('pnlDynamicDetailEmails').dynamic_detail_id;
        var store   = b.up('pnlDynamicDetailEmails').down('gridDynamicDetailEmails').getStore()

        if(!Ext.WindowManager.get('winEmailAddId')){
            var w   = Ext.widget('winEmailAdd',
            {
                id                  : 'winEmailAddId',
                dynamic_detail_id   : d_id,
                store               : store
            });
            w.show();      
        }
    },
    emailAddSave: function(button){
        var me      = this;
        var form    = button.up('form');
        var window  = form.up('window');

        form.submit({
            clientValidation : true,
            url              : me.getUrlAddEmail(),
            params           : {'dynamic_detail_id' : window.dynamic_detail_id },
            success: function(form, action) {              
                //FIXME reload store....
                Ext.ux.Toaster.msg(
                    i18n('sItem_updated'),
                    i18n('sItem_updated_fine'),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
                window.store.load();
                window.close();
            },
            failure: Ext.ux.formFail
        });
    },
    emailDel:   function(b){
        var me      = this;
        var grid    = b.up('pnlDynamicDetailEmails').down('gridDynamicDetailEmails');     
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
                            grid.getStore().load();   //Update the count   
                        },
                        failure: function(batch,options,c,d){
                            Ext.ux.Toaster.msg(
                                i18n('sProblems_deleting_item'),
                                '',
                                //FIXME
                               // batch.proxy.getReader().rawData.message.message,
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
    emailCsvExport: function(b,format) {
    
        var grid        = b.up('pnlDynamicDetailEmails').down('gridDynamicDetailEmails');
        var d_id        = b.up('pnlDynamicDetailEmails').dynamic_detail_id;
        var me          = this;
        var columns     = grid.columnManager.columns;
        var col_list    = [];
        Ext.Array.each(columns, function(item,index){
            if(item.dataIndex != ''){
                var chk = {boxLabel: item.text, name: item.dataIndex, checked: true};
                col_list[index] = chk;
            }
        }); 

        if(!Ext.WindowManager.get('winCsvColumnSelectDynamicDetailsEmail')){
            var w = Ext.widget('winCsvColumnSelect',{id:'winCsvColumnSelectDynamicDetailsEmail',columns: col_list,dynamic_detail_id: d_id});
            w.show();        
        }
    },
    emailCsvExportSubmit: function(button){

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

                   // console.log(filter_collection.getAt(f_count).serialize( ));
                    f_found         = true;
                    var ser_item    = filter_collection.getAt(f_count).serialize( );
                    ser_item.field  = ser_item.property;
                    filters[f_count]= ser_item;
                    f_count         = f_count + 1;
                    
                }     
            }
            var dd_id           = win.dynamic_detail_id;
             
            var col_json        = "columns="+encodeURIComponent(Ext.JSON.encode(columns));
            var extra_params    = Ext.Object.toQueryString(Ext.Ajax.getExtraParams());
            var append_url      = "?"+extra_params+'&'+col_json;
            if(f_found){
                filter_json = "filter="+encodeURIComponent(Ext.JSON.encode(filters));
                append_url  = append_url+'&'+filter_json;
            }
            append_url          = append_url+'&dynamic_detail_id='+dd_id;
            
            window.open(me.getUrlEmailExportCsv()+append_url);
            win.close();
        }
    },
     onActionColumnItemClick: function(view, rowIndex, colIndex, item, e, record, row, action){
        //console.log("Action Item "+action+" Clicked");
        var me = this;
        var grid = view.up('grid');
        grid.setSelection(record);
        if(action == 'update'){
            me.edit()
        }
        if(action == 'delete'){
            me.del();
        } 
        if(action == 'preview'){
            me.previewMobile();
        }     
    },
    translate: function(button){
        var me = this; 
        //Check if the node is not already open; else open the node:
        var tp      = me.getGrid().up('tabpanel');
        var tab_id  = 'dynamicDetailTranslateTab';
        var nt      = tp.down('#'+tab_id);
        if(nt){
            tp.setActiveTab(tab_id); //Set focus on  Tab
            return;
        }
        tp.add({ 
            title       : 'Translations',
            itemId      : tab_id,
            closable    : true,
            glyph       : Rd.config.icnGlobe, 
            layout      : 'fit', 
            items       : {'xtype' : 'gridDynamicDetailTranslations'}
        });
        tp.setActiveTab(tab_id); //Set focus on Add Tab

    }
		
});
