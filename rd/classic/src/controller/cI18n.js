Ext.define('Rd.controller.cI18n', {
    extend: 'Ext.app.Controller',
    actionIndex: function(){
        var me = this;
        var desktop = this.application.getController('cDesktop');
        var win = desktop.getWindow('i18nWin');
        if(!win){
            win = desktop.createWindow({
                id: 'i18nWin',
                //title:i18n('si18n_Manager'),
                btnText: i18n('si18n_Manager'),
                width           : Rd.config.winWidth,
                height          : Rd.config.winHeight,
                iconCls: 'translate',
                glyph: Rd.config.icnTranslate,
                animCollapse:false,
                border:false,
                constrainHeader:true,
                layout: 'border',
                stateful: true,
                stateId: 'i18nWin',
                tools: [{
                    type:'help',
                    tooltip: i18n('sGet_Help')
    
                } ],
                items: [
                    {
                        region: 'north',
                        xtype:  'pnlBanner',
                        heading: i18n('sTranslation_management'),
                        image:  'resources/images/48x48/i18n.png'
                    },
                    {'xtype' : 'i18nP',region  : 'center'}
                ]
            });
        }
        desktop.restoreWindow(win);    
        return win;
    },
    views:  ['components.pnlBanner', 'i18n.vPanI18n',       'i18n.vWinLanguageAdd',     'i18n.vWinKeyAdd',      'i18n.vWinCountryDel',
             'i18n.vWinLanguageDel','i18n.vWinKeyEdit',         'i18n.vWinLanguageEdit','i18n.vWinCountryEdit',
             'i18n.vWinLanguageCopy','i18n.gridPhpPhrases',     'i18n.gridJavascriptPhrases', 'i18n.winPhpAdd', 
             'i18n.winPhpEdit',     'i18n.winPhpComment',       'i18n.winPhpCopy',      'i18n.winPhpMeta',
             'components.winHelp'
            ],
    stores: ['sI18nJsPhrases','sLanguages','sCountries','sJustLanguages','sI18nPhraseKeys','sI18nPhpPhrases'],
    models: ['mI18nMeta'],
    config: {
        urlCountryAdd   : '/cake3/rd_cake/countries/add',
        urlLanguageAdd  : '/cake3/rd_cake/phrase-values/add_language.json',
        urlKeyAdd       : '/cake3/rd_cake/phrase-values/add_key.json',
        urlCountryDel   : '/cake3/rd_cake/countries/delete.json',
        urlLanguageDel  : '/cake3/rd_cake/languages/delete.json',
        urlLanguageCopy : '/cake3/rd_cake/phrase-values/copy_phrases.json',
        urlPhpDel       : '/cake3/rd_cake/php-phrases/delete.json',
        urlPhpAdd       : '/cake3/rd_cake/php-phrases/add.json',
        urlPhpEditMsgid : '/cake3/rd_cake/php-phrases/update_msgid.json',
        urlPhpComment   : '/cake3/rd_cake/php-phrases/comment.json',
        urlPhpCopy      : '/cake3/rd_cake/php-phrases/copy.json',
        urlPhpMeta      : '/cake3/rd_cake/php-phrases/save_meta.json',
        urlHelp         : 'http://sourceforge.net/p/radiusdesk/wiki/i18n/'
        
    },
    refs: [
        { ref: 'vp',                selector: '',   xtype: 'vp',                autoCreate: true},
        { ref: 'i18nW',             selector: '',   xtype: 'i18nW',             autoCreate: true},
        { ref: 'i18nP',             selector: '',   xtype: 'i18nP',             autoCreate: true},
        { ref: 'jsGrid',            selector: '#JsPhrases',  xtype: 'grid',     autoCreate: true},
        { ref: 'phpGrid',           selector: '#PhpPhrases', xtype: ''  }
    ],
    selCountry : null,
    selLanguage: null,
    selPhpLanguage: null,
    init: function() {
        var me = this;
        if (me.inited) {
            return;
        }
        me.inited = true;

        //Connect to display the amount of items in the grid
        me.getStore('sI18nPhpPhrases').addListener('load',me.onStorePhpPhrasesSizeChange, me);
        //Connect to display the amount of items in the grid
        me.getStore('sI18nJsPhrases').addListener('load',me.onStoreJsPhrasesSizeChange, me);

        me.control({
            //_____ JS TAB ______
            '#JsPhrases  #reload': {
                click: me.jsGridReload
            },
            '#JsPhrases cmbLanguages': {
                change: me.onCmbLanguagesChange
            }, //____ ADD LANGUAGE / Country / Key
            '#JsPhrases  #mnuLanguageNew': {
                click: me.newLanguageWin
            },
            '#JsPhrases  #mnuNewKey': {
                click: me.newKeyWin
            },
            'addLanguageW #btnIntroNext' : { 
                click: me.btnIntroNext
            },
            'addLanguageW #btnNewCountryPrev' : { 
                click: me.btnNewCountryPrev
            },
            'addLanguageW #btnNewCountryNext' : { 
                click: me.btnNewCountryNext
            },
            'addLanguageW #btnNewLanguagePrev' : { 
                click: me.btnNewLanguagePrev
            },
            'addLanguageW #btnNewLanguageNext' : { 
                click: me.btnNewLanguageNext
            },
            'addLanguageW vCmbCountries' : {
                change: me.onCmbCountriesChange
            },
            'addKeyW #btnNewKeyNext' : { 
                click: me.btnNewKeyNext
            }, //____ DELETE LANGUAGE / Country / Key
            '#JsPhrases  #mnuLanguageDel': {
                click: me.languageDel
            },
            '#JsPhrases  #mnuDelCountry': {
                click: me.delCountry
            },
            '#JsPhrases  #mnuDelKey': {
                click: me.delKey
            },
            'delCountryW #btnCountryDelNext': {
                click: me.btnCountryDelNext
            },
            'delLanguageW #btnLanguageDelNext': {
                click: me.btnLanguageDelNext
            },
             //____ Edit LANGUAGE / Country / Key
            '#JsPhrases  #mnuLanguageEdit': {
                click: me.editLanguage
            },
            '#JsPhrases  #mnuCountryEdit': {
                click: me.countryEdit
            },
            '#JsPhrases  #mnuEditKey': {
                click: me.editKey
            },
            'editKeyW #btnEditKeyNext': {
                click: me.btnEditKeyNext
            },
            'editKeyW #btnEditKeyDoPrev': {
                click: me.btnEditKeyDoPrev
            },
            'editKeyW #btnEditKeyDoNext': {
                click: me.btnEditKeyDoNext
            },
            'vWinLanguageEdit #btnLanguageEditNext': {
                click: me.btnLanguageEditNext
            },
            'vWinLanguageEdit #btnLanguageEditDoPrev': {
                click: me.btnLanguageEditDoPrev
            },
            'vWinLanguageEdit #btnLanguageEditDoNext': {
                click: me.btnLanguageEditDoNext
            },
            'vWinCountryEdit #btnCountryEditNext': {
                click: me.btnCountryEditNext
            },
            'vWinCountryEdit #btnCountryEditDoPrev': {
                click: me.btnCountryEditDoPrev
            },
            'vWinCountryEdit #btnCountryEditDoNext': {
                click: me.btnCountryEditDoNext
            },
            '#JsPhrases  #mnuLanguageCopy': {
                click: me.languageCopy
            },
            'vWinLanguageCopy #btnLanguageCopyNext': {
                click: me.btnLanguageCopyNext
            },

            //_____ PHP TAB ______

            '#PhpPhrases  #reload': {
                click:  me.phpGridReload
            },
            '#PhpPhrases cmbLanguages': {
                change: me.onPhpCmbLanguagesChange
            },
            '#PhpPhrases #delete': {
                click:  me.phpDelete
            },
            '#PhpPhrases #add': {
                click:  me.phpAdd
            },
            'winPhpAdd #save':{
                click:  me.phpAddSubmit
            },
            '#PhpPhrases #edit': {
                click:  me.phpEdit
            },
            '#PhpPhrases'   : {
                itemclick:  me.phpGridClick
            },
            'winPhpEdit #save':{
                click:  me.phpEditSubmit
            },
            '#PhpPhrases #comment': {
                click:  me.phpComment
            },
            'winPhpComment #save':{
                click:  me.phpCommentSubmit
            },
            '#PhpPhrases #copy': {
                click:  me.phpCopy
            },
            'winPhpCopy #save':{
                click:  me.phpCopySubmit
            },
            '#PhpPhrases #meta': {
                click:  me.phpMeta
            },
            'winPhpMeta #save':{
                click:  me.phpMetaSubmit
            },
            '#i18nWin tool[type=help]': {
                click: me.help
            }
        });
    },
    help:   function(){
        var me  = this;
        var win = me.application.runAction('cDesktop','AlreadyExist','winHelpId');
        var title = i18n('sOnline_help_for_Translation_Manager');
        if(!win){
            var w = Ext.widget('winHelp',{
                id          : 'winHelpId',
                title       : title,
                srcUrl      : me.getUrlHelp()
            });
            me.application.runAction('cDesktop','Add',w);         
        }else{
            win.setSrc(me.getUrlHelp());
            win.setTitle(title);
        }
    },
    jsGridReload:     function(){
        var me = this;
        //Specify which language is selected
        this.getJsGrid().getStore().getProxy().setExtraParam('language',me.selLanguage);
        this.getJsGrid().getStore().load();
    },

    newLanguageWin: function(){
        var me = this;
        if(!me.application.runAction('cDesktop','AlreadyExist','addLanguageWId')){
            var w = Ext.widget('addLanguageW',{
                id          :'addLanguageWId'
            });
            me.application.runAction('cDesktop','Add',w);         
        }
    },
    newKeyWin: function(){
        var me = this;
        if(!me.application.runAction('cDesktop','AlreadyExist','addKeyWId')){
            var w = Ext.widget('addKeyW',{
                id          :'addKeyWId'
            });
            me.application.runAction('cDesktop','Add',w);         
        }
    },
    btnIntroNext: function(b){
        var me = this;
        var form = b.up('form');
        var w  = b.up('addLanguageW');
        //Determine if they want a new language
        if(form.down("#chkNewCountry").getValue()){
            w.getLayout().setActiveItem('scrnNewCountry');
        }else{
            //See if they did select an existing country
            me.selCountry = form.down("vCmbCountries").getValue();
            if(me.selCountry == null){
                 Ext.ux.Toaster.msg(
                        i18n('sSelect_a_country'),
                        i18n('sYou_are_required_to_select_a_country'),
                        Ext.ux.Constants.clsError,
                        Ext.ux.Constants.msgError
                    );
            }else{
                w.getLayout().setActiveItem('scrnNewLanguage');
            }
        }
    },
    btnNewCountryPrev: function(b){
        var me = this;
        var w  = b.up('addLanguageW');
        w.getLayout().setActiveItem('scrnIntro');
    },
    btnNewCountryNext: function(b){
        var me = this;
        var w  = b.up('addLanguageW');
        
        //submit the form
        var form = b.up('form');
        form.submit({
            url: me.getUrlCountryAdd(),
            waitMsg: i18n('sSending_the_info')+'...', //FIXME This is a BUG IN 4.1 does not remove the mask (added a override.js to fix)
            success: function(fp, o) {
               
                me.selCountry = o.result.id;
                Ext.ux.Toaster.msg(
                        i18n('sCountry_added'),
                        i18n('sNew_country_added_fine'),
                        Ext.ux.Constants.clsInfo,
                        Ext.ux.Constants.msgInfo
                    );
                me.getStore('sCountries').load(); //Reload since there is now a new one
                w.getLayout().setActiveItem('scrnNewLanguage');
            },
            failure: Ext.ux.formFail

       }); 
    },

    btnNewLanguagePrev: function(b){
        var me = this;
        var w  = b.up('addLanguageW');
        w.getLayout().setActiveItem('scrnIntro');
    },
    btnNewLanguageNext: function(b){
        var me = this;
        var win = b.up('addLanguageW');
        //submit the form
        var form = b.up('form');
        form.submit({
            url: me.getUrlLanguageAdd(),
            params: {
                country_id: me.selCountry
            },
            waitMsg: i18n('sSending_the_info')+'...',
            success: function(fp, o) {
                Ext.ux.Toaster.msg(
                        i18n('sItem_added'),
                        i18n('sNew_item_added_fine'),
                        Ext.ux.Constants.clsInfo,
                        Ext.ux.Constants.msgInfo
                    );
                me.completeReload();
                win.close();
            }
       }); 
    },
    onCmbCountriesChange: function(combo,newValue, oldValue){
        var me = this;
        //Uncheck the create new language checkbox
        var form = combo.up('form');
        form.down('#chkNewCountry').setValue(false);
    },
    onCmbLanguagesChange: function(combo,newValue,oldValue){
        var me = this;
        me.selLanguage = newValue;
        me.jsGridReload()
    },
    btnNewKeyNext: function(b){
        var me = this;
        var form = b.up('form');
        var win  = b.up('addKeyW');
        form.submit({
            url: me.getUrlKeyAdd(),
            waitMsg: i18n('sSending_the_info')+'...',
            success: function(fp, o) {
                Ext.ux.Toaster.msg(
                        i18n('sItem_added'),
                        i18n('sNew_item_added_fine'),
                        Ext.ux.Constants.clsInfo,
                        Ext.ux.Constants.msgInfo
                    );
                me.jsGridReload(); //Reload since there is now a new one
                win.close();
            },
            failure: Ext.ux.formFail
       }); 
    },
    delKey: function(){
        var me      = this;     
        //Find out if there was something selected
        if(me.getJsGrid().getSelectionModel().getCount() == 0){
             Ext.ux.Toaster.msg(
                        i18n('sSelect_a_key'),
                        i18n('sYou_are_required_to_select_a_key_to_delete'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
            Ext.MessageBox.confirm(i18n('sConfirm'), i18n('sAre_you_sure_you_want_to_do_that_qm'), function(val){
                if(val== 'yes'){
                    me.getJsGrid().getStore().remove(me.getJsGrid().getSelectionModel().getSelection());
                    me.getJsGrid().getStore().sync({
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
                                i18n('sProblems_deleting_key'),
                                i18n('sThere_were_some_problems_experienced_during_the_deleting_of_the_key'),
                                Ext.ux.Constants.clsWarn,
                                Ext.ux.Constants.msgWarn
                            );
                        }
                    });
                }
            });
        }

    },
    languageDel: function(){
        var me = this;
        if(!me.application.runAction('cDesktop','AlreadyExist','delLanguageWId')){
            var w = Ext.widget('delLanguageW',{
                id          :'delLanguageWId'
            });
            me.application.runAction('cDesktop','Add',w);         
        }
    },
    delCountry: function(){
        var me = this;
        if(!me.application.runAction('cDesktop','AlreadyExist','delCountryWId')){
            var w = Ext.widget('delCountryW',{
                id          :'delCountryWId'
            });
            me.application.runAction('cDesktop','Add',w);         
        }
    },
    btnLanguageDelNext: function(b){
        var me  = this;
        var win = b.up('delLanguageW');
        Ext.MessageBox.confirm(i18n('sConfirm'), i18n('sAre_you_sure_you_want_to_do_that_qm'), function(val){
            if(val== 'yes'){
                var form = b.up('form');
                form.submit({
                    url: me.getUrlLanguageDel(),
                    waitMsg: i18n('sSending_the_info')+'...',
                    success: function(fp, o) {
                        Ext.ux.Toaster.msg(
                                i18n('sItem_deleted'),
                                i18n('sItem_deleted_fine'),
                                Ext.ux.Constants.clsInfo,
                                Ext.ux.Constants.msgInfo
                            );
                        me.completeReload();
                        win.close();
                    }
                });
            }
        }); 
    },
    btnCountryDelNext: function(b){
        var me = this;
        var win = b.up('delCountryW');
        Ext.MessageBox.confirm(i18n('sConfirm'), i18n('sAre_you_sure_you_want_to_do_that_qm'), function(val){
            if(val== 'yes'){
                var form = b.up('form');
                form.submit({
                    url: me.getUrlCountryDel(),
                    waitMsg: i18n('sSending_the_info')+'...',
                    success: function(fp, o) {
                        Ext.ux.Toaster.msg(
                            i18n('sItem_deleted'),
                            i18n('sItem_deleted_fine'),
                            Ext.ux.Constants.clsInfo,
                            Ext.ux.Constants.msgInfo
                        );
                        me.completeReload();
                        win.close();
                    }
                });
            }
        }); 
    }, //Key Edit
    editKey: function(){
        var me = this;
        if(!me.application.runAction('cDesktop','AlreadyExist','editKeyWId')){
            var w = Ext.widget('editKeyW',{
                id          :'editKeyWId'
            });
            me.application.runAction('cDesktop','Add',w);         
        }
    },
    btnEditKeyDoPrev: function(b){
        var me = this;
        var w = b.up('editKeyW');
        w.getLayout().setActiveItem('scrnEditKey');
    },
    btnEditKeyNext: function(b){
        var me = this;
        var form    = b.up('form');
        var cmb     = form.down('cmbPhraseKeys')
        var key_id  = cmb.getValue();
        var r       = cmb.findRecord('id',key_id);
        
        var w       = b.up('editKeyW');
        var scrnDo  = w.down('#scrnEditKeyDo');
        var nextFrm = scrnDo.down('form');
        nextFrm.loadRecord(r);
        w.getLayout().setActiveItem('scrnEditKeyDo');
    },
    btnEditKeyDoNext: function(b){
        var me      = this;
        var w       = b.up('editKeyW');
        var form    = b.up('form');
        var record  = form.getRecord();
        var values  = form.getValues();
        record.set(values);
        me.completeReload();
        w.close();
    }, //Language edit
    editLanguage: function(){
        var me = this;
        if(!me.application.runAction('cDesktop','AlreadyExist','vWinLanguageEditId')){
            var w = Ext.widget('vWinLanguageEdit',{
                id          :'vWinLanguageEditId'
            });
            me.application.runAction('cDesktop','Add',w);         
        }
    },
    btnLanguageEditNext: function(b){
        var me = this;
        var form    = b.up('form');
        var cmb     = form.down('cmbJustLanguages')
        var lang_id = cmb.getValue();
        var r       = cmb.findRecord('id',lang_id);     
        var w       = b.up('vWinLanguageEdit');
        var scrnDo  = w.down('#scrnLanguageEditDo');
        var nextFrm = scrnDo.down('form');
        nextFrm.loadRecord(r);
        w.getLayout().setActiveItem('scrnLanguageEditDo');
    },
     btnLanguageEditDoPrev: function(b){
        var me = this;
        var w       = b.up('vWinLanguageEdit');
        w.getLayout().setActiveItem('scrnLanguageEdit');
    },
    btnLanguageEditDoNext: function(b){
        var me      = this;
        var w       = b.up('vWinLanguageEdit');
        var form    = b.up('form');
        var record  = form.getRecord();
        var values  = form.getValues();
        if(values.rtl == undefined){    //We had to add this else the POST action is not triggered when unchecking the checkbox
            values.rtl = false;
        }
        record.set(values);
        me.completeReload();
        w.close();
    },
    countryEdit: function(){
        var me = this;
        if(!me.application.runAction('cDesktop','AlreadyExist','vWinCountryEditId')){
            var w = Ext.widget('vWinCountryEdit',{
                id          :'vWinCountryEditId'
            });
            me.application.runAction('cDesktop','Add',w);         
        }
    },
    btnCountryEditNext: function(b){
        var me = this;
        var form    = b.up('form');
        var cmb     = form.down('vCmbCountries')
        var c_id    = cmb.getValue();
        var r       = cmb.findRecord('id',c_id);     
        var w       = b.up('vWinCountryEdit');
        var scrnDo  = w.down('#scrnCountryEditDo');
        var nextFrm = scrnDo.down('form');
        nextFrm.loadRecord(r);
        w.getLayout().setActiveItem('scrnCountryEditDo');
    },
    btnCountryEditDoPrev: function(b){
        var me = this;
        var w  = b.up('vWinCountryEdit');
        w.getLayout().setActiveItem('scrnCountryEdit');
    },
    btnCountryEditDoNext: function(b){
        //submit the form
        var me      = this;
        var w       = b.up('vWinCountryEdit');
        var form    = b.up('form');
        var cmb     = w.down('vCmbCountries')
        var c_id    = cmb.getValue();
        form.submit({
            url: me.getUrlCountryAdd()+'/'+c_id,
            waitMsg: i18n('sSending_the_info')+'...',
            success: function(fp, o) {
                me.selCountry = o.result.id;
                Ext.ux.Toaster.msg(
                        i18n('sItem_updated'),
                        i18n('sItem_updated_fine'),
                        Ext.ux.Constants.clsInfo,
                        Ext.ux.Constants.msgInfo
                    );
                me.completeReload();
                w.close();
            }
       }); 
    },
    languageCopy: function(){
        var me = this;
        if(!me.application.runAction('cDesktop','AlreadyExist','vWinLanguageCopyId')){
            var w = Ext.widget('vWinLanguageCopy',{
                id          :'vWinLanguageCopyId'
            });
            me.application.runAction('cDesktop','Add',w);         
        }
    },
    btnLanguageCopyNext: function(b){

        var me      = this;
        var w       = b.up('vWinLanguageCopy');
        var form    = b.up('form');
        var cmb     = form.down('cmbLanguages')
        var c_id    = cmb.getValue();
        

        if(me.selLanguage == null){

            Ext.ux.Toaster.msg(
                        i18n('sNo_target_language'),
                        i18n('sFirst_select_a_language_that_you_want_to_use_as_destination'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
            return;
        }

        if(me.selLanguage == c_id){

             Ext.ux.Toaster.msg(
                        i18n('sFruitless_action'),
                        i18n('sRefusing_this_action_since_source_and_destination_is_the_same'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
            return;
        }

        //if it passed the first two checks
        form.submit({
            url: me.getUrlLanguageCopy(),
            params: {
                source_id       : c_id,
                destination_id  : me.selLanguage
            },
            waitMsg: i18n('sSending_the_info')+'...',
            success: function(fp, o) {
                Ext.ux.Toaster.msg(
                        i18n('sKey_added'),
                        i18n('sNew_Key_added_fine'),
                        Ext.ux.Constants.clsInfo,
                        Ext.ux.Constants.msgInfo
                    );
                me.jsGridReload(); 
                w.close();
            }
       }); 

    },
    completeReload: function(){
        var me = this;
        me.getStore('sJustLanguages').load();
        me.getStore('sCountries').load(); 
        me.getStore('sLanguages').load();   
        me.jsGridReload();
    },

    //---------- PHP TAB ----------------------
    phpGridReload:  function(){
        var me = this;
        me.getPhpGrid().getStore().getProxy().setExtraParam('language',me.selPhpLanguage);
        this.getPhpGrid().getStore().load();
    },
    onPhpCmbLanguagesChange: function(combo,newValue,oldValue){
        var me = this;
        me.selPhpLanguage = newValue;
        me.phpGridReload();
    },

    phpAdd: function(){
        var me = this;

        if(me.selPhpLanguage == null){
            Ext.ux.Toaster.msg(
                        i18n('sSelect_something'),
                        i18n('sSelect_something_to_work_on'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{
            if(!me.application.runAction('cDesktop','AlreadyExist','winPhpAddId')){
                var w = Ext.widget('winPhpAdd',{
                    id          :'winPhpAddId'
                });
                me.application.runAction('cDesktop','Add',w);         
            }
        }
    },

    phpAddSubmit: function(button){
        var me      = this;
        var win     = button.up('window');
        var form    = win.down('form');
        form.submit({
            clientValidation: true,
            url: me.getUrlPhpAdd()+"?language="+me.selPhpLanguage,
            success: function(form, action) {
                win.close();

                me.getPhpGrid().getStore().load();
                Ext.ux.Toaster.msg(
                    i18n('sItem_added'),
                    i18n('sNew_item_added_fine'),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
            },
            failure: Ext.ux.formFail
        });
    },

    phpDelete:   function(){
        var me      = this;     
        //Find out if there was something selected
        if(me.getPhpGrid().getSelectionModel().getCount() == 0){
            Ext.ux.Toaster.msg(
                i18n('sSelect_something'),
                i18n('sSelect_something_to_work_on'),
                Ext.ux.Constants.clsWarn,
                Ext.ux.Constants.msgWarn
            );
        }else{
            Ext.Msg.confirm(i18n('sConfirm'), i18n('sAre_you_sure_you_want_to_do_that_qm'), function(val){
                if(val== 'yes'){
                    //Because the id of the record is not tied to the msgid, we have to get each msgid and delete that (the msgid is the unique thing)
                    var selection   = me.getPhpGrid().getSelectionModel().getSelection();
                    var params      = {};
                    var msgid;
                    var key;
                    Ext.each(selection,function(record,index){
                        
                        msgid       = record.get('msgid');
                        key         = 'item_'+index;
                        params[key] = msgid;
                    });
                    //Add the selected language
                    var url = me.getUrlPhpDel()+"?language="+me.selPhpLanguage;

                    //Send and ajax request:
                    Ext.Ajax.request({
                        url: url,
                        params: params,
                        success: function(response){
                            var jsonData = Ext.JSON.decode(response.responseText);
                            me.getPhpGrid().getStore().load();
                            //Set the phrases
                            if(jsonData.success){   
                                Ext.ux.Toaster.msg(
                                    i18n('sItem_br_s_br_removed'),
                                    i18n('sItem_deleted_fine'),
                                    Ext.ux.Constants.clsInfo,
                                    Ext.ux.Constants.msgInfo
                                );
                            }else{
                                Ext.ux.Toaster.msg(
                                    i18n('sProblem_deleting'),
                                    i18n('sItems_could_not_be_deleted'),
                                    Ext.ux.Constants.clsWarn,
                                    Ext.ux.Constants.msgWarn
                                );
                            }
                        }
                    });
                }
            });
        }
    },
    phpEdit: function(){
        var me = this;
        if(me.getPhpGrid().getSelectionModel().getCount() == 0){
            Ext.ux.Toaster.msg(
                i18n('sSelect_something'),
                i18n('sSelect_something_to_work_on'),
                Ext.ux.Constants.clsWarn,
                Ext.ux.Constants.msgWarn
            );
        }else{

            if(me.getPhpGrid().getSelectionModel().getCount() < 1){
                Ext.ux.Toaster.msg(
                    i18n('sSelect_one_only'),
                    i18n('sSelection_limited_to_one'),
                    Ext.ux.Constants.clsWarn,
                    Ext.ux.Constants.msgWarn
                );
            }else{
                var old_msgid = me.phpSelectedRecord.get('msgid');
                if(!me.application.runAction('cDesktop','AlreadyExist','winPhpEditId')){
                    var w = Ext.widget('winPhpEdit',{
                        id          :'winPhpEditId',
                        old_msgid   : old_msgid
                    });
                    me.application.runAction('cDesktop','Add',w);         
                }
            }
        }
    },
    phpEditSubmit: function(button){
        var me       = this;
        var win     = button.up('window');
        var form    = win.down('form');
        form.submit({
            clientValidation: true,
            url: me.getUrlPhpEditMsgid()+"?language="+me.selPhpLanguage,
            success: function(form, action) {
                win.close();
                me.getPhpGrid().getStore().load();
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
    phpComment: function(){
        var me = this;
        if(me.getPhpGrid().getSelectionModel().getCount() == 0){
            Ext.ux.Toaster.msg(
                i18n('sSelect_something'),
                i18n('sSelect_something_to_work_on'),
                Ext.ux.Constants.clsWarn,
                Ext.ux.Constants.msgWarn
            );
        }else{
            if(me.getPhpGrid().getSelectionModel().getCount() < 1){
                Ext.ux.Toaster.msg(
                    i18n('sSelect_one_only'),
                    i18n('sSelection_limited_to_one'),
                    Ext.ux.Constants.clsWarn,
                    Ext.ux.Constants.msgWarn
                );
            }else{
                var msgid = me.phpSelectedRecord.get('msgid');
                if(!me.application.runAction('cDesktop','AlreadyExist','winPhpCommentId')){
                    var w = Ext.widget('winPhpComment',{
                        id          :'winPhpCommentId',
                        'msgid'     : msgid
                    });
                    me.application.runAction('cDesktop','Add',w);         
                }
            }
        }
    },
    phpCommentSubmit: function(button){
        var me       = this;
        var win     = button.up('window');
        var form    = win.down('form');
        form.submit({
            clientValidation: true,
            url: me.getUrlPhpComment()+"?language="+me.selPhpLanguage,
            success: function(form, action) {
                win.close();
                me.getPhpGrid().getStore().load();
                Ext.ux.Toaster.msg(
                    i18n('sItem_added'),
                    i18n('sNew_item_added_fine'),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
            },
            failure: Ext.ux.formFail
        });
    },
    phpCopy: function(){ 
        var me = this;
        if(!me.application.runAction('cDesktop','AlreadyExist','winPhpCopyId')){
            var w = Ext.widget('winPhpCopy',{
                id          :'winPhpCopyId'
            });
            me.application.runAction('cDesktop','Add',w);         
        } 
    },
    phpCopySubmit: function(button){
        var me       = this;
        var win     = button.up('window');
        var form    = win.down('form');
        form.submit({
            clientValidation: true,
            url: me.getUrlPhpCopy(),
            success: function(form, action) {
                win.close();
                me.getPhpGrid().getStore().load();
                Ext.ux.Toaster.msg(
                    i18n('sLanguage_copied'),
                    i18n('sLanguage_copied_fine'),
                    Ext.ux.Constants.clsInfo,
                    Ext.ux.Constants.msgInfo
                );
            },
            failure: Ext.ux.formFail
        });
    },
    phpMeta: function(){
        var me = this;
        if(me.selPhpLanguage == null){
            Ext.ux.Toaster.msg(
                        i18n('sSelect_something'),
                        i18n('sSelect_something_to_work_on'),
                        Ext.ux.Constants.clsWarn,
                        Ext.ux.Constants.msgWarn
            );
        }else{ 
            //Try to get an instance of the Model
            var m = Ext.ModelManager.getModel('Rd.model.mI18nMeta');
            m.load(me.selPhpLanguage, {
                scope: me,
                failure: Ext.ux.formFail,
                success: function(record, operation) {
                    //do something if the load succeeded
                    var win = me.application.runAction('cDesktop','AlreadyExist','winPhpMetaId');
                    if(!win){
                         win = Ext.widget('winPhpMeta',{
                            id          :'winPhpMetaId'
                        });
                        me.application.runAction('cDesktop','Add',win);         
                    } 
                    form = win.down('form');
                    form.loadRecord(record);
                }
            }); 
        }
    },
    phpMetaSubmit: function(button){
        var me      = this;
        var win     = button.up('window');
        var form    = win.down('form');
        form.submit({
            clientValidation: true,
            url: me.getUrlPhpMeta()+"?language="+me.selPhpLanguage,
            success: function(form, action) {
                win.close();
                me.getPhpGrid().getStore().load();
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

    onStorePhpPhrasesSizeChange: function() {
        var me = this;
        var count = me.getStore('sI18nPhpPhrases').getTotalCount();
        me.getPhpGrid().down('#count').update({count: count});
    },
    phpGridClick:  function(grid, record, item, index, event){
        var me = this;
        me.phpSelectedRecord = record;
    },
    onStoreJsPhrasesSizeChange: function() {
        var me = this;
        var count = me.getStore('sI18nJsPhrases').getTotalCount();
        me.getJsGrid().down('#count').update({count: count});
    }
});
