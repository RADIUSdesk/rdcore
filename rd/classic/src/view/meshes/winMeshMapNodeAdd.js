Ext.define('Rd.view.meshes.winMeshMapNodeAdd', {
    extend		: 'Ext.window.Window',
    alias 		: 'widget.winMeshMapNodeAdd',
    title 		: i18n('sAdd_a_marker'),
    layout		: 'fit',
    autoShow	: false,
    width		: 350,
    height		: 250,
    glyph		: Rd.config.icnNote,
	meshId		: '',
	mapPanel	: '',
	requires: [
        'Rd.view.meshes.cmbMeshAddMapNodes'
    ],
    mapType : 'Google',
    initComponent: function() {
        var me = this;
		
		//Get the list of available nodes for this mesh
        me.items = [
            {
                xtype: 'form',
                border:     false,
                layout:     'anchor',
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
                tbar: [
                    { xtype: 'tbtext', text: 'Select a node to add', cls: 'lblWizard' }
                ],
                items: [
                    {
                        xtype       : 'cmbMeshAddMapNodes',
						meshId		: me.meshId
                    }
                ],
                buttons: [
                    {
                        itemId: 'save',
                        text: i18n('sOK'),
                        scale: 'large',
                        iconCls: 'b-next',
                        glyph: Rd.config.icnYes,
                        formBind: true,
                        margin: '0 20 40 0'
                    }
                ]
            }
        ];
        this.callParent(arguments);
    }
});
