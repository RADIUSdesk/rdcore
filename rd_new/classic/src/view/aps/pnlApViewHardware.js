Ext.define('Rd.view.aps.pnlApViewHardware', {
    extend      : 'Ext.panel.Panel',
    alias       : 'widget.pnlApViewHardware',
    apId        : undefined,
    requires: [
    ],
    initComponent: function() {
        var me   = this;            
        me.tpl   = new Ext.XTemplate(
            '<div style="color:grey;  background-color:white; padding:5px;">',
            '<img src="/cake3/rd_cake/img/hardwares/{hw_info.photo_file_name}" alt="{hw_info.name}" style="float: left; padding-right: 20px;">',
            '<h2>{name}</h2>',
            '<span>{model}</span>',
            '</div>',
            "<div class='twoColumnContainer'>",
                '<tpl for="components">', 
                    "<div class='twoColumnItem'>",
                        '<div class="sectionHeader">',
                            '<h2>{name}</h2>',
                         '</div>',
                         '<ul class="fa-ul">',
                            '<tpl for="items">',
                                '<tpl if="style == \'rdOk\'">',
                                    "<li style='color:green;'><i class='fa-li fa  fa-check-circle'></i>",
                                    "{description} <b>{value}</b>.</li>",
                                "</tpl>",
                                '<tpl if="style == \'rdWarn\'">',
                                    "<li style='color:red;'><i class='fa-li fa  fa-exclamation-circle'></i>",
                                    "{description} <b>{value}</b>.</li>",
                                "</tpl>",
                                '<tpl if="style == \'rdInfo\'">',
                                    "<li><i class='fa-li fa fa-arrow-circle-right'></i>",
                                    "{description} <b>{value}</b>.</li>",
                                "</tpl>",
                            '</tpl>',
                        '</ul>',
                    "</div>",    
                '</tpl>',
            "</div>"
        );
        me.data = {};
        
        
        me.callParent(arguments);
    }
});
