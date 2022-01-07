Ext.define('Rd.model.mScheduleEntry', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'id',           type: 'int'    },
        {name: 'every_day',    type: 'bool'   },
        {name: 'monday',       type: 'bool'   },
        {name: 'tuesday',      type: 'bool'   },
        {name: 'wednesday',    type: 'bool'   },
        {name: 'thursday',     type: 'bool'   },
        {name: 'friday',       type: 'bool'   },
        {name: 'saturday',     type: 'bool'   },
        {name: 'sunday',       type: 'bool'   },
        {name: 'always',       type: 'bool'   },
        {name: 'start',        type: 'int'    },
        {name: 'stop',         type: 'int'    }
    ]
});

