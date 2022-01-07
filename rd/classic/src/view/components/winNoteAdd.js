Ext.define('Rd.view.components.winNoteAdd', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winNoteAdd',
    closable    : true,
    draggable   : false,
    resizable   : false,
    title       : i18n('sAdd_Note'),
    width       : 350,
    height      : 400,
    plain       : true,
    border      : false,
    layout      : 'card',
    iconCls     : 'add',
    glyph       : Rd.config.icnAdd,
    autoShow    : false,
    startScreen: 'scrnApTree', //Default start screen
    noteForId:  '', //Some attribute definitions
    noteForGrid:'',
    refreshGrid:'',
    requires: [
        'Ext.layout.container.Card',
        'Ext.form.Panel',
        'Ext.form.field.Text'
    ],
    initComponent: function() {
        var me = this;
        var scrnApTree      = me.mkScrnApTree();
        var scrnNote        = me.mkScrnNote();
        me.items = [
            scrnApTree,
            scrnNote
        ];  
        this.callParent(arguments);
        me.getLayout().setActiveItem(me.startScreen);
    },

     //____ AccessProviders tree SCREEN ____
    mkScrnApTree: function(){
        var pnlTree = Ext.create('Rd.view.components.pnlAccessProvidersTree',{
            itemId: 'scrnApTree'
        });
        return pnlTree;
    },

    //_______ The Note  _______
    mkScrnNote: function(){

        var me      = this;
        var buttons = [
                {
                    itemId  : 'btnNoteAddPrev',
                    text    : i18n('sPrev'),
                    scale   : 'large',
                    iconCls : 'b-prev',
                    glyph   : Rd.config.icnBack,
                    margin  : '0 20 40 0'
                },
                {
                    itemId  : 'btnNoteAddNext',
                    text    : i18n('sNext'),
                    scale   : 'large',
                    iconCls : 'b-next',
                    glyph   : Rd.config.icnNext,
                    formBind: true,
                    margin  : '0 20 40 0'
                }
        ];

        if(me.no_tree == true){
            var buttons = [
                {
                    itemId  : 'btnNoteAddNext',
                    text    : i18n('sNext'),
                    scale   : 'large',
                    iconCls : 'b-next',
                    glyph   : Rd.config.icnNext,
                    formBind: true,
                    margin  : '0 20 40 0'
                }
            ];
        }

        var frmNote = Ext.create('Ext.form.Panel',{
            border:     false,
            layout:     'anchor',
            itemId:     'scrnNote',
            autoScroll: true,
            defaults: {
                anchor: '100%'
            },
            fieldDefaults: {
                msgTarget: 'under',
                labelClsExtra: 'lblRd',
                labelAlign: 'left',
                labelSeparator: '',
                margin: 15
            },
            defaultType: 'textfield',
            items:[
                {
                    itemId      : 'user_id',
                    xtype       : 'textfield',
                    name        : "user_id",
                    hidden      : true,
                    value       : me.user_id
                },
                {
                    itemId      : 'owner',
                    xtype       : 'displayfield',
                    fieldLabel  : i18n('sOwner'),
                    value       : me.owner,
                    labelClsExtra: 'lblRdReq'
                },
                {
                    xtype       : 'textareafield',
                    grow        : true,
                    name        : 'note',
                    fieldLabel  : i18n('sNote'),
                    anchor      : '100%',
                    allowBlank  :false,
                    labelClsExtra: 'lblRdReq'
                },
                {
                    xtype       : 'checkbox',      
                    boxLabel    : i18n('sMake_available_to_sub_providers'),
                    name        : 'available_to_siblings',
                    inputValue  : 'available_to_siblings',
                    itemId      : 'a_to_s',
                    checked     : false,
                    cls         : 'lblRd'
                    
                }
            ],
            buttons: buttons
        });
        return frmNote;
    }


});
