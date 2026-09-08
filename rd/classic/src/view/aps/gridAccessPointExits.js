Ext.define('Rd.view.aps.gridAccessPointExits' ,{
    extend      :'Ext.grid.Panel',
    alias       : 'widget.gridAccessPointExits',
    multiSelect : true,
    stateful    : true,
    stateId     : 'StateGridAccessPointExitsId',
    stateEvents :['groupclick','columnhide'],
    border      : false,
    requires    : [
        'Rd.view.components.ajaxToolbar'
    ],
    viewConfig  : {
        loadMask:true
    },
    ui          : 'light',
    columnLines : false,
    rowLines    : false,
    stripeRows  : true,
    trackMouseOver: false,
    urlMenu     : '/cake4/rd_cake/ap-profiles/menu_for_exits_grid.json',   
    initComponent: function () {
        var me = this;

        // store
        me.store = Ext.create('Rd.store.sAccessPointExits', {});
        me.store.getProxy().setExtraParam('ap_profile_id', me.apProfileId);
        me.store.load();

        // toolbar (as you had)
        me.tbar = Ext.create('Rd.view.components.ajaxToolbar', { url: me.urlMenu });

        // tiny helpers for consistent rendering
        var dash  = '<span class="rd-dash">—</span>';
        var chip  = function(cls, iconCls, text){
            var icon = iconCls ? '<i class="' + iconCls + '"></i>' : '';
            return '<span class="rd-chip ' + (cls||'') + '">' + icon + Ext.htmlEncode(text) + '</span>';
        };
        var dot   = function(colorCls){ return '<span class="rd-dot '+(colorCls||'')+'"></span>'; };

        Ext.apply(me, {
            viewConfig: {
                // Dim rows where everything is default (no FW, no SQM)
                getRowClass: function (rec) {
                    var noFw  = !rec.get('apply_firewall_profile');
                    var noSqm = !rec.get('apply_sqm_profile');
                    var noNs  = !rec.get('collect_network_stats');
                    return (noFw && noSqm && noNs) ? 'rd-row-muted' : '';
                }
            },

            columns: [
                {
                    text        : i18n('sType'),
                    dataIndex   : 'type',
                    stateId     : 'StateGridAccessPointExitsId2',
                    width       : 300,
                    renderer: function (v, m, rec) {
                        // keep your mapping but show as label w/ status dot
                        
                        //add a chip for suspend and inactive admin_state
                        var txtAdminState = '';
                        if(rec.get('admin_state') == 'inactive'){
                            txtAdminState = ' '+chip('rd-chip--muted', 'fa fa-stop', 'For inactive');
                        }
                        if(rec.get('admin_state') == 'suspended'){
                            txtAdminState = ' '+chip('rd-chip--warning', 'fa fa-pause', 'For suspended');
                        }
                        
                        switch (v) {
                            case 'bridge':
                                return dot('rd-dot--gray')   + 'Bridge' + txtAdminState;
                            case 'captive_portal':
                                return dot('rd-dot--purple') + 'Captive Portal' + txtAdminState;
                            case 'nat':
                                return dot('rd-dot--green')  + 'NAT + DHCP' + txtAdminState;
                            case 'tagged_bridge':
                                return dot('rd-dot--blue')   + 'L2 Tagged Bridge ' + chip('rd-chip--muted', 'fa fa-hashtag', 'VLAN ' + (rec.get('vlan')||'')) + txtAdminState;
                            case 'openvpn_bridge':
                                return dot('rd-dot--blue')   + 'OpenVPN Bridge' + txtAdminState;
                            case 'tagged_bridge_l3':
                                return dot('rd-dot--blue')   + 'L3 Tagged Bridge ' + chip('rd-chip--muted', 'fa fa-hashtag', 'VLAN ' + (rec.get('vlan')||'')) + txtAdminState;
                            case 'pppoe_server':
                                return dot('rd-dot--blue')   + 'PPPoE Server (Accel) ' + txtAdminState;
                            default:
                                return Ext.htmlEncode(v || '');
                        }
                    }
                },
                {
                    text: i18n('sConnects_with'),
                    dataIndex: 'connects_with',
                    stateId: 'StateGridAccessPointExitsId3',
                    flex: 1,
                    renderer: function (v, m, rec) {
                        var html = [];
                        // For NAT with VLAN show a single chip
                        if ((rec.get('type') === 'nat' || (rec.get('type') === 'captive_portal')) && Number(rec.get('vlan')) > 0) {
                            html.push(chip('rd-chip--green', 'fa fa-network-wired', 'LAN side VLAN ' + rec.get('vlan')));
                        }
                        // If connects_with empty, show dash
                        if ((!v || v.length === 0) && rec.get('vlan') == 0) {
                            html.push(chip('rd-chip--warning', 'fa fa-exclamation', 'No one'));
                        }
                        // Render list as small gray chips
                        if (Ext.isArray(v)) {
                            Ext.Array.forEach(v, function (item) {
                                var name = item.name || '';

                                if (name === 'LAN (If Hardware Supports It)') {
                                    // wired LAN chip
                                    html.push(chip('rd-chip--gray', 'fa fa-plug', 'LAN'));
                                } else if (/^Dynamic VLAN \d+$/.test(name)) {
                                    // clearly marked “dummy” target
                                    html.push(chip('rd-chip--muted', 'fa fa-sitemap', name));
                                } else {
                                    // regular Wi-Fi SSID
                                    html.push(chip('rd-chip--muted', 'fa fa-wifi', name));
                                }
                            });
                        }
                        return html.join(' ');
                    }
                },
                {
                    text: 'Firewall',
                    dataIndex: 'apply_firewall_profile',
                    stateId: 'StateGridAccessPointExitsId4',
                    width: 200,
                    renderer: function (applies, m, rec) {
                        if (!applies) return dash;
                        return chip('rd-chip--gray', 'fa fa-shield-alt', rec.get('firewall_profile_name') || 'Firewall');
                    }
                },
                {
                    text: 'SQM',
                    dataIndex: 'apply_sqm_profile',  
                    stateId: 'StateGridAccessPointExitsId5',
                    width: 200,
                    renderer: function (applies, m, rec) {
                        if (!applies) return dash;
                        return chip('rd-chip--blue', 'fa fa-sliders-h', rec.get('sqm_profile_name') || 'SQM');
                    }
                },
                {
                    text: 'Net Stats',
                    dataIndex: 'collect_network_stats',      // boolean
                    stateId: 'StateGridAccessPointExitsId6',
                    width: 140,
                    renderer: function (flag, m, rec) {
                        // reuse the helpers from the earlier snippet: dash, chip
                        if (!flag) return dash;
                        return chip('rd-chip--teal', 'fa  fa-bar-chart', 'Collecting');
                    }
                }
            ]
        });

        me.callParent(arguments);
    }  
/*   
    initComponent: function(){
        var me      = this;
        me.store    = Ext.create('Rd.store.sAccessPointExits',{});
        me.store.getProxy().setExtraParam('ap_profile_id',me.apProfileId);
        me.store.load();

        me.tbar     = Ext.create('Rd.view.components.ajaxToolbar',{'url': me.urlMenu});
        
        me.columns  = [
         //   {xtype: 'rownumberer',stateId: 'StateGridAccessPointExitsId1'},
            { 
                text    : i18n('sType'),                 
                dataIndex: 'type',          
                tdCls   : 'gridTree', 
                flex    : 1,
                xtype   : 'templatecolumn', 
                tpl     : new Ext.XTemplate(
                    '<tpl if="type==\'bridge\'"><div class="fieldGreyWhite"><i class="fa fa-bars"></i> '+' '+'Bridge'+'</div></tpl>',
                    '<tpl if="type==\'captive_portal\'"><div class="fieldPurpleWhite"><i class="fa fa-key"></i> '+' '+'Captive Portal'+'</div></tpl>',
                    '<tpl if="type==\'nat\'"><div class="fieldGreenWhite"><i class="fa fa-arrows-alt"></i> '+' '+'NAT+DHCP'+'</div></tpl>',
                    '<tpl if="type==\'tagged_bridge\'"><div class="fieldBlueWhite"><i class="fa fa-tag"></i> '+' '+'Layer 2 Tagged Ethernet Bridge (&#8470; {vlan})'+'</div></tpl>',
                    '<tpl if="type==\'openvpn_bridge\'"><div class="fieldBlueWhite"><i class="fa fa-quote-right"></i> '+' '+'OpenVPN Bridge'+'</div></tpl>',
                    '<tpl if="type==\'tagged_bridge_l3\'"><div class="fieldBlue"><i class="fa fa-tag"></i> '+' '+'Layer 3 Tagged Ethernet Bridge (&#8470; {vlan})'+'</div></tpl>',
                    '<tpl if="type==\'pppoe_server\'"><div class="fieldBlueWhite"><i class="fa fa-link"></i> '+' '+'PPPoE Server (Accel)'+'</div></tpl>'
                ),
            
                stateId: 'StateGridAccessPointExitsId2'
            },
            { 
                text    :   i18n("sConnects_with"),
                sortable: false,
                flex    : 1, 
                tdCls   : 'gridTree', 
                xtype   :  'templatecolumn', 
                tpl:    new Ext.XTemplate(                    
                    '<tpl if="type == \'nat\' && vlan &gt; 0">',
                        '<div class="fieldBlueWhite">',
                            '<i class="fa fa-sitemap"></i> LAN Side VLAN: &#8470; {vlan}',
                        '</div>',
                    '<tpl else>',
                        '<tpl if="(Ext.isEmpty(connects_with)&&(type!=\'tagged_bridge_l3\'))">',
                            '<div class=\"fieldRedWhite\">',
                                '<i class="fa fa-exclamation-circle"></i> '+i18n('sNo_one'),
                            '</div>',
                        '</tpl>',
                    '</tpl>',
                    '<tpl for="connects_with">',     // interrogate the realms property within the data
                        "<tpl><div class=\"fieldGreyWhite\">{name}</div></tpl>",
                    '</tpl>'
                ),
                dataIndex: 'connects_with',stateId: 'StateGridAccessPointExitsId3'
            },
            { 
                text    : 'Firewall Profile',
                sortable: false,
                flex    : 1, 
                tdCls   : 'gridTree', 
                xtype   :  'templatecolumn', 
                tpl:    new Ext.XTemplate(
                    '<tpl if="apply_firewall_profile">',
                    	"<tpl><div class=\"fieldBlueWhite\"><span style=\"font-family:FontAwesome;\">&#xf06d;</span>  {firewall_profile_name}</div></tpl>",
                    '<tpl else>',
                        "<tpl><div class=\"fieldGreyWhite\">No Active Firewall</div></tpl>",
                    '</tpl>'
                ),
                dataIndex: 'apply_firewall_profile',stateId: 'StateGridAccessPointExitsId4'
            },
            { 
                text    : 'SQM Profile',
                sortable: false,
                flex    : 1, 
                tdCls   : 'gridTree', 
                xtype   :  'templatecolumn', 
                tpl:    new Ext.XTemplate(
                    '<tpl if="apply_sqm_profile">',
                    	"<tpl><div class=\"fieldBlueWhite\"><i class=\"fa fa-th\"></i>  {sqm_profile_name}</div></tpl>",
                    '<tpl else>',
                        "<tpl><div class=\"fieldGreyWhite\">SQM Not Enabled</div></tpl>",
                    '</tpl>'
                ),
                dataIndex: 'apply_firewall_profile',stateId: 'StateGridAccessPointExitsId5'
            }
        ];
        me.callParent(arguments);
    }
    
    */
});
