Ext.define('Rd.model.mMtHotspotActive', {
    extend: 'Ext.data.Model',
    fields: [
        {name: '.id',       type: 'string'  },
        {name: 'user',      type: 'string'  },
        {name: 'address',   type: 'string'  },
        {name: 'uptime',    type: 'string'  },
        {name: 'server',    type: 'string'  },
        {name: 'user',      type: 'string'  },
        {name: 'address',   type: 'string'  },
        {name: 'mac-address',type: 'string'  },
        {name: 'login-by',type: 'string'  },
        {name: 'uptime',    type: 'string'  },
        {name: 'idle-time', type: 'string'  },
        {name: 'keepalive-timeout',type: 'string'  },
        {name: 'bytes-in',  type: 'string'  },
        {name: 'bytes-out', type: 'string'  },
        {name: 'packets-in',type: 'string'  },
        {name: 'packets-out',type: 'string'  },
        {name: 'radius',    type: 'string'  }
    ]
});
