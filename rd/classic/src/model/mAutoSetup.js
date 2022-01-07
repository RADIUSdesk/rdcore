Ext.define('Rd.model.mAutoSetup', {
    extend: 'Ext.data.Model',
    fields: [
         {name: 'id',           type: 'int'     },
         {name: 'owner',        type: 'string'  },
         {name: 'name',         type: 'string'  },
         {name: 'dns_name',     type: 'string'  },
//IP Settings
         {name: 'ip_address',   type: 'string'  },
         {name: 'ip_mask',      type: 'string'  },
         {name: 'ip_gateway',   type: 'string'  },
         {name: 'ip_dns_1',     type: 'string'  },
         {name: 'ip_dns_2',     type: 'string'  },
//Wifi settings
         {name: 'wifi_active',  type: 'bool'  },
         {name: 'channel',       type: 'int'  },
         {name: 'power',        type: 'int'  },
         {name: 'distance',     type: 'int'  },
         {name: 'ssid_secure',  type: 'string'  },
         {name: 'radius',       type: 'string'  },
         {name: 'secret',       type: 'string'  },
         {name: 'ssid_open',    type: 'string'  },
         {name: 'eduroam',      type: 'bool'  },
//OpenVPN
         {name: 'vpn_server',   type: 'string'  },
         {name: 'tunnel_ip',    type: 'string'  },
         {name: 'contact_ip',   type: 'string'  },
         {name: 'last_contact', type: 'date', dateFormat: 'Y-m-d H:i:s'},
         {name: 'notes',        type: 'bool'}
        ]
});
