Ext.define('Rd.view.dashboard.tpDashboard', {
    extend      : 'Ext.tab.Panel',
    alias       : 'widget.tpDashboard',
    layout      : 'fit',
    ui          : 'navigation',
    tabPosition : 'left',
    tabRotation : 0,
    defaults    : {
        textAlign   : 'left'
    },
    initComponent: function () {
        var me = this;
 /*       
        me.items = [
        {
            title   : 'Overview',
            xtype   : 'tabpanel',
            glyph   : Rd.config.icnView,
            layout  : 'fit',
            items   : [
                {
                    title   : 'Data Usage',
                    glyph   : Rd.config.icnData,
                    id      : 'cOverview',
                    layout  : 'fit'
                },
                {
                    title   : 'Recent Rejects',
                    glyph   : Rd.config.icnBan,
                    id      : 'cRejects',
                    layout  : 'fit'
                },
                {
                    title   : 'Tools',
                    glyph   : Rd.config.icnWizard,
                    id      : 'cTools',
                    layout  : 'fit'
                }
            ]
        }, 
        {
            title   : 'Admin',
            glyph   : Rd.config.icnAdmin,
            xtype   : 'tabpanel',
            layout  : 'fit',
            items   : [
                {
                    title   : 'Admins',
                    glyph   : Rd.config.icnAdmin,
                    id      : 'cAccessProviders',
                    layout  : 'fit'
                },
                {
                    title   : 'Realms (Groups)',
                    glyph   : Rd.config.icnRealm,
                    id      : 'cRealms',
                    layout  : 'fit'
                }
            ]
            
        },
        {
            title   : 'Users',
            xtype   : 'tabpanel',
            glyph   : Rd.config.icnUser,
            layout  : 'fit',
            items   : [
                /*{
                    title   : 'Who is online?',
                    glyph   : Rd.config.icnActivity,
                    id      : 'cActivityMonitor',
                    layout  : 'fit'
                },
                {
                    title   : 'Permanent Users',
                    glyph   : Rd.config.icnUser,
                    id      : 'cPermanentUsers',
                    layout  : 'fit'
                },
                {
                    title: 'Vouchers',
                    glyph: Rd.config.icnVoucher,
                    id      : 'cVouchers',
                    layout  : 'fit'
                },
                {
                    title: 'BYOD',
                    glyph: Rd.config.icnDevice,
                    id      : 'cDevices',
                    layout  : 'fit'
                },
                {
                    title: 'Top-Ups',
                    glyph: Rd.config.icnTopUp,
                    id      : 'cTopUps',
                    layout  : 'fit'
                },
                
            ]
           
        }, 
        {
            title   : 'Profiles',
            glyph   : Rd.config.icnProfile,
            xtype   : 'tabpanel',
            layout  : 'fit',
            items   : [
                {
                    title   : 'Profile Components',
                    glyph   : Rd.config.icnComponent,
                    id      : 'cProfileComponents',
                    layout  : 'fit'
                },
                {
                    title   : 'Profiles',
                    glyph   : Rd.config.icnProfile,
                    id      : 'cProfiles',
                    layout  : 'fit'
                }   
            ]
        }, 
        {
            title   : 'RADIUS',
            glyph   : Rd.config.icnRadius,
            xtype   : 'tabpanel',
            layout  : 'fit',
            items   : [
                {
                    title   : 'Dynamic RADIUS Clients',
                    glyph   : Rd.config.icnDynamicNas,
                    id      : 'cDynamicClients',
                    layout  : 'fit'
                },
                {
                    title   : 'NAS Devices',
                    glyph   : Rd.config.icnNas,
                    id      : 'cNas',
                    layout  : 'fit'
                },
                {
                    title   : 'NAS Device Tags',
                    glyph   : Rd.config.icnTag,
                    id      : 'cTags',
                    layout  : 'fit'
                },
                {
                    title   : 'SSIDs',
                    glyph   : Rd.config.icnSsid,
                    id      : 'cSsids',
                    layout  : 'fit'
                }  
            ]
        }, 
        {
            title   : 'MESHdesk',
            glyph   : Rd.config.icnMesh,
            id      : 'cMeshes',
            layout  : 'fit'
        },
        {
            title   : 'APdesk',
            glyph   : Rd.config.icnCloud,
            id      : 'cAccessPoints',
            layout  : 'fit' 
        },
        {
            title   : 'Other',
            glyph   : Rd.config.icnGears,
            xtype   : 'tabpanel',
            layout  : 'fit',
            items   : [
                 {
                    title   : 'Dynamic Login Pages',
                    glyph   : Rd.config.icnDynamic,
                    id      : 'cDynamicDetails',
                    layout  : 'fit'
                },
                {
                    title   : 'OpenVPN Servers',
                    glyph   : Rd.config.icnVPN,
                    id      : 'cOpenvpnServers',
                    layout  : 'fit'
                },
                {
                    title   : 'IP Pools',
                    glyph   : Rd.config.icnIP,
                    id      : 'cIpPools',
                    layout  : 'fit'
                },
                {
                    title   : 'Rights Manager',
                    glyph   : Rd.config.icnKey,
                    id      : 'cAcos',
                    layout  : 'fit'
                },
                {
                    title   : 'Logfile Viewer',
                    glyph   : Rd.config.icnLog,
                    id      : 'cLogViewer',
                    layout  : 'fit'
                },
                 {
                    title   : 'Debug Output',
                    glyph   : Rd.config.icnBug,
                    id      : 'cDebug',
                    layout  : 'fit'
                }
                
            ]
        }
        ]; */
          
        me.items = me.dashboard_data.tabs        
       // console.log(me.dashboard_data);
        this.callParent();
    }
});


