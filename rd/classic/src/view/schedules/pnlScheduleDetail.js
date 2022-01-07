Ext.define('Rd.view.schedules.pnlScheduleDetail', {
    extend  : 'Ext.tab.Panel',
    alias   : 'widget.pnlScheduleDetail',
    border  : false,
    record  : null, //We will supply each instance with a reference to the selected record.
    plain   : true,
    cls     : 'subTab',
    schedule_id : null,
    initComponent: function(){
        var me      = this;
        //Set default values for from and to:
        me.items = [
        {   
            title:  i18n('sBasic_info'),
            itemId : 'tabBasicInfo',
            layout: 'hbox',
            items:  { 
                xtype   :  'form',
                height  : '100%', 
                width   :  400,
                layout  : 'anchor',
                autoScroll:true,
                frame   : true,
                defaults    : {
                    anchor: '100%'
                },
                fieldDefaults: {
                    msgTarget       : 'under',
                    labelClsExtra   : 'lblRd',
                    labelAlign      : 'left',
                    labelSeparator  : '',
                    margin          : 15
                },
                items  : [
                    {
                        itemId      : 'id',
                        xtype       : 'textfield',
                        name        : "id",
                        hidden      : true
                    },
                    {
                        xtype       : 'textfield',
                        fieldLabel  : i18n('sName'),
                        name        : 'name',
                        allowBlank  : false,
                        blankText   : i18n('sSupply_a_value'),
                        labelClsExtra: 'lblRdReq'
                    },
				    {
                        xtype       : 'textfield',
                        fieldLabel  : 'Description',
                        name        : 'description'
                    },
                    {
                        xtype       : 'textfield',
                        fieldLabel  : 'Comment',
                        name        : 'comment'
                    },
                    {
                        xtype       : 'checkbox',      
                        boxLabel    : i18n('sAlso_show_to_sub_providers'),
                        name        : 'available_to_siblings',
                        inputValue  : 'available_to_siblings',
                        itemId      : 'a_to_s',
                        cls         : 'lblRd'
                    }   
                ],
                buttons: [
                    {
                        itemId  : 'save',
                        text    : i18n('sSave'),
                        scale   : 'large',
                        glyph   : Rd.config.icnYes,
                        margin  : Rd.config.buttonMargin
                    }
                ],
                listeners : {
                    beforerender: function(form){
                        form.loadRecord(me.record)
                    }
                
                }
            }  
        },
        { 
            title   : "Schedule Entries", 
            layout  : 'fit',
            xtype   : 'gridScheduleEntries',
            record  : me.record
        }
    ]; 


        me.callParent(arguments);
    }
});
