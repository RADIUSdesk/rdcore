Ext.define('Rd.view.hardwareOwners.winHardwareOwnerAddWizard', {
    extend      : 'Ext.window.Window',
    alias       : 'widget.winHardwareOwnerAddWizard',
    closable    : true,
    draggable   : true,
    resizable   : true,
    title       : 'New Ownership',
    width       : 500,
    height      : 450,
    plain       : true,
    border      : false,
    layout      : 'card',
    iconCls     : 'add',
    glyph       : Rd.config.icnAdd,
    autoShow    :   false,
    defaults    : {
            border: false
    },
    no_tree     : false, //If the user has no children we don't bother giving them a branchless tree
    user_id     : '',
    owner       : '',
    startScreen : 'scrnApTree', //Default start screen
    controller  : 'vcGridHardwareOwners',
    requires    : [
        'Ext.layout.container.Card',
        'Ext.form.Panel',
        'Ext.form.field.Text',
        'Ext.form.FieldContainer',
        'Rd.view.hardwareOwners.vcGridHardwareOwners',
        'Rd.view.meshes.cmbHardwareOptions'
    ],
    initComponent: function() {
        var me = this;
        var scrnApTree      = me.mkScrnApTree();
        var scrnData        = me.mkScrnData();
        me.items = [
            scrnApTree,
            scrnData
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

    //_______ Data for ssids  _______
    mkScrnData: function(){


        var me      = this;
        var buttons = [
                {
                    itemId: 'btnDataPrev',
                    text: i18n('sPrev'),
                    scale: 'large',
                    iconCls: 'b-prev',
                    glyph: Rd.config.icnBack,
                    margin: '0 20 40 0'
                },
                {
                    itemId: 'btnDataNext',
                    text: i18n('sNext'),
                    scale: 'large',
                    iconCls: 'b-next',
                    glyph: Rd.config.icnNext,
                    formBind: true,
                    margin: '0 20 40 0'
                }
            ];

        if(me.no_tree == true){
            var buttons = [
                {
                    itemId: 'btnDataNext',
                    text: i18n('sNext'),
                    scale: 'large',
                    iconCls: 'b-next',
                    glyph: Rd.config.icnNext,
                    formBind: true,
                    margin: '0 20 40 0'
                }
            ];
        }

        var frmData = Ext.create('Ext.form.Panel',{
            border:     false,
            layout:     'anchor',
            itemId:     'scrnData',
            autoScroll: true,
            defaults: {
                anchor: '100%'
            },
            fieldDefaults: {
                msgTarget       : 'under',
                labelClsExtra   : 'lblRd',
                labelAlign      : 'left',
                labelSeparator  : '',
                margin          : 15,
                labelWidth      : Rd.config.labelWidth
            },
            defaultType: 'textfield',
            items:[
                {
                    itemId  : 'user_id',
                    xtype   : 'textfield',
                    name    : "user_id",
                    hidden  : true,
                    value   : me.user_id
                },
                {
                    xtype   : 'textfield',
                    name    : "id",
                    hidden  : true
                }, 
                {
                    itemId      : 'owner',
                    xtype       : 'displayfield',
                    fieldLabel  : i18n('sOwner'),
                    value       : me.owner,
                    labelClsExtra: 'lblRdReq'
                },
                {
		        	xtype       : 'cmbHardwareOptions',
				    allowBlank  : false,
				    labelClsExtra: 'lblRdReq',
				    id_field    : 'id',
				    name        : 'hardware_id'
			    },
                {
                    xtype       : 'textfield',
                    fieldLabel  : i18n('sMAC_address'),
                    name        : "name",
                    allowBlank  : false,
                    blankText   : i18n('sSupply_a_value'),
                    labelClsExtra: 'lblRdReq',
                    vtype       : 'MacAddress',
                    fieldStyle  : 'text-transform:lowercase'
                },
                {
                    xtype       : 'textfield',
                    fieldLabel  : 'Description',
                    name        : "description",
                    allowBlank  : false,
                    blankText   : i18n('sSupply_a_value'),
                    labelClsExtra: 'lblRdReq'
                },
                {
                    xtype       : 'checkbox',      
                    boxLabel    : i18n('sAlso_show_to_sub_providers'),
                    name        : 'available_to_siblings',
                    inputValue  : 'available_to_siblings',
                    itemId      : 'a_to_s',
                    checked     : false,
                    cls         : 'lblRd'
                },
                {
                    xtype       : 'checkbox',      
                    boxLabel    : 'Create Multiple Items',
                    name        : 'multiple',
                    inputValue  : 'multiple',
                    itemId      : 'chkMultiple',
                    checked     : false
                }
            ],
            buttons: buttons
        });
        return frmData;
    }   
});
