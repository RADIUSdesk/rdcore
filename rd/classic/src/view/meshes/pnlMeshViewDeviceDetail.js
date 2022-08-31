Ext.define('Rd.view.meshes.pnlMeshViewDeviceDetail', {
    extend      : 'Ext.panel.Panel',
    alias       : 'widget.pnlMeshViewDeviceDetail',
    scrollable  : true,
    layout: {
        type    : 'vbox',
        align   : 'stretch'
    },
    border      : true,
    ui          : 'light',
    initComponent: function() {
        var me   = this;   
        me.items = [
        
            {
                xtype   : 'progressbar',
                itemId  : 'pbSnow',
                text    : '<i class="fa fa-wifi"></i> Current Signal',
                height  : 30,
                margin  : 5,
                cls     : 'wifiyellow',
                value   : 0.25 
            },
            {
                xtype   : 'progressbar',
                itemId  : 'pbSavg',
                text    : '<i class="fa fa-clock-o"></i> Average Signal',
                height  : 30,
                margin  : 5,
                width   : '100%',
                cls     : 'wifigreen',
                value   : 0.8
            },
            {
                xtype    : 'container',
                itemId  : 'pnlInfo',
                layout  : 'fit',
                tpl     : new Ext.XTemplate(
                    "<div>",   
                        '<ul class="fa-ul">',    
                            "<li style='color:#3c6cb7;'><i class='fa-li fa  fa-tablet'></i>{mac}",
                                "<tpl if='(!Ext.isEmpty(vendor))'>",
                                    " <span style='color:#353535;'>({vendor})</span>",
                                "</tpl>",
                            "</li>",
                            "<li style='color:#238080;'><i class='fa-li fa fa-wifi'></i> {mesh_entry.name}",               
                                "<span style='color:#353535;'>  (",
                                "<tpl if='frequency_band == \"two\"'>",
                                    "2.4GHz",
                                "</tpl>",
                                "<tpl if='frequency_band == \"five_lower\"'>",
                                    "5GHz-Lower",
                                "</tpl>",
                                "<tpl if='frequency_band == \"five_upper\"'>",
                                    "5GHz-Upper",
                                "</tpl>",
                                ")</span>",
                            "</li>",
                            "<li><i class='fa-li fa  fa-cube'></i> {node.name}</li>",  
                            "<li><i class='fa-li fa  fa-clock'></i><b>Last Seen</b> {last_seen}</li>",
                        '</ul>',
                        "<tpl if='type == \"device\"'>",
                            "<div style='text-align:center;color:white;background-color:coral;'><b>Recent Connections</b></div>",
                            '<ul style="list-style: none;padding-left:4px;">',
                            '<tpl for="device_history">',
                                "<li style='color:#238080;'><b>{nasname}</b> <span style='color:#353535;font-size:smaller;'>{last_seen_human}</span></li>",
                            '</tpl>',
                            '</ul>',
                        "</tpl>",
                    '</div>'
                )
            } 
        ];        
        me.callParent(arguments);
    },
    paintUserDetail: function(user_detail){
    
        var me = this;    
        if(Ext.isDefined(user_detail.perc_data_used)){
        
            if(user_detail.perc_data_used < 70){
                var cls = "wifigreen";
                me.down('#pbData').toggleCls("wifiyellow",false);
                me.down('#pbData').toggleCls("wifired",false);
                me.down('#pbData').toggleCls(cls,true);     
            } 
            if(user_detail.perc_data_used >= 70 && user_detail.perc_data_used < 90){
                cls = "wifiyellow";
                me.down('#pbData').toggleCls("wifigreen",false);
                me.down('#pbData').toggleCls("wifired",false);
                me.down('#pbData').toggleCls(cls,true);   
            }
            if(user_detail.perc_data_used >= 90){
                cls = "wifired"
                me.down('#pbData').toggleCls("wifigreen",false);
                me.down('#pbData').toggleCls("wifiyellow",false);
                me.down('#pbData').toggleCls(cls,true);   
            }
            var str_data_usage = '<i class="fa  fa-database"></i>  Data Usage '+user_detail.perc_data_used+' %';
            var val_data_usage = user_detail.perc_data_used / 100;
            
            me.down('#pbData').show().setValue(val_data_usage).updateText(str_data_usage);
        }else{
           // me.down('#pbData').hide()
        }
        
        if(Ext.isDefined(user_detail.perc_time_used)){
        
            if(user_detail.perc_time_used < 70){
                var cls = "wifigreen";
                me.down('#pbTime').toggleCls("wifiyellow",false);
                me.down('#pbTime').toggleCls("wifired",false);
                me.down('#pbTime').toggleCls(cls,true);     
            } 
            if(user_detail.perc_time_used >= 70 && user_detail.perc_time_used < 90){
                cls = "wifiyellow";
                me.down('#pbTime').toggleCls("wifigreen",false);
                me.down('#pbTime').toggleCls("wifired",false);
                me.down('#pbTime').toggleCls(cls,true);   
            }
            if(user_detail.perc_time_used >= 90){
                cls = "wifired"
                me.down('#pbTime').toggleCls("wifigreen",false);
                me.down('#pbTime').toggleCls("wifiyellow",false);
                me.down('#pbTime').toggleCls(cls,true);   
            }
            
            var str_time_usage = '<i class="fa fa-clock-o"></i> Time Usage '+user_detail.perc_time_used+' %';
            var val_time_usage = user_detail.perc_time_used / 100;  
         
            me.down('#pbTime').show().setValue(val_time_usage).updateText(str_time_usage);
        }else{
          //  me.down('#pbTime').hide()
        }        
        me.down('#pnlInfo').setData(user_detail)    
    }
});
