Ext.define('Rd.model.mMtPppoeActive', {
    extend: 'Ext.data.Model',
    fields: [
        {name: '.id',           type: 'string'  },
        {name: 'name',          type: 'string'  },
        {name: 'service',       type: 'string'  },
        {name: 'caller-id',     type: 'string'  },
        {name: 'address',       type: 'string'  },
        {name: 'uptime',        type: 'string'  },
        {name: 'encoding',      type: 'string'  },
        {name: 'session-id',    type: 'string'  },
        {name: 'limit-bytes-in',type: 'string'  },
        {name: 'limit-bytes-out',type: 'string'  },
        {name: 'radius',        type: 'string'  }
    ]
});

