Ext.define('Rd.model.mOpenvpnServer', {
    extend: 'Ext.data.Model',
    fields: [
         {name: 'id',           type: 'int'     },
         {name: 'name',         type: 'string'  },
         {name: 'owner',        type: 'string'  },    
         {name: 'description',  type: 'string'  },
         {name: 'available_to_siblings',  type: 'bool'},
         {name: 'local_remote', type: 'string'},
         {name: 'protocol',     type: 'string'},
         {name: 'ip_address',   type: 'string'},
         {name: 'port',         type: 'int'},
         {name: 'vpn_gateway_address',      type: 'string'},
         {name: 'vpn_bridge_start_address', type: 'string'},
         {name: 'vpn_mask',     type: 'string'},
         {name: 'config_preset',type: 'string'},
         {name: 'ca_crt',       type: 'string'},
		 {name: 'extra_name',   type: 'string'},
		 {name: 'extra_value',  type: 'string'},  
         {name: 'update',       type: 'bool'},
         {name: 'delete',       type: 'bool'}
        ]
});
