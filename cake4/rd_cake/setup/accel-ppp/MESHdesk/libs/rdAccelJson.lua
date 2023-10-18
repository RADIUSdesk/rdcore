require( "class" )

-------------------------------------------------------------------------------
-- Logger class ----------------
-------------------------------------------------------------------------------
class "rdAccelJson"

--Init function for object
function rdAccelJson:rdAccelJson()
	self.version 	= "1.0.1"
	self.tag	    = "MESHdesk"
	self.priority	= "debug"
end
        
function rdAccelJson:getVersion()
	return self.version
end

function rdAccelJson:showStat()
    return self:_showStat()	
end

function rdAccelJson:showSessions()
    return self:_showSessions()	
end

--[[--
========================================================
=== Private functions start here =======================
========================================================
--]]--

function rdAccelJson._showStat(self)
    local a   = io.popen('accel-cmd show stat') 
    local str = a:read('*a')
    local items = {};
    for s in str:gmatch("[^\r\n]+") do
        if(string.match(s,"^%a.+:.+$"))then --Patterns like 'uptime: 0.10:40:13'
            local k   = string.gsub(s,":.+", '')
            local v   = string.gsub(s,".+:%s+", '')
            items[k]  = v;
        end
        if(string.match(s,"^%a.+:$"))then --Patterns like 'sessions:'
            section           = string.gsub(s,":", '')
            items[section]    = {};
        end
        if(string.match(s,"^%s+%a.+:.+$"))then --Petterns like '  starting: 0'
            local k = string.gsub(s,":.+", '')
            k       = string.gsub(k,"^%s+",'')
            local v = string.gsub(s,".+:%s+", '')
            local entry = {name = k, value = v}
           --entry[k]  = v;
            table.insert(items[section],entry)
        end
    end
    return items;
end

--[[--
show sessions [columns] [order <column>] [match <column> <regexp>] - shows sessions
	columns:
		netns - network namespace name
		vrf - vrf name
		ifname - interface name
		username - user name
		ip - IP address
		ip6 - IPv6 address
		ip6-dp - IPv6 delegated prefix
		type - connection type
		state - state of session
		uptime - uptime (human readable)
		uptime-raw - uptime (in seconds)
		calling-sid - calling station id
		called-sid - called station id
		sid - session id
		comp - compression/encryption method
		rx-bytes - received bytes (human readable)
		tx-bytes - transmitted bytes (human readable)
		rx-bytes-raw - received bytes
		tx-bytes-raw - transmitted bytes
		rx-pkts - received packets
		tx-pkts - transmitted packets
		inbound-if - inbound interface
		service-name - PPPoE service name
		rate-limit - rate limit down-stream/up-stream (Kbit)
--]]--

function rdAccelJson._showSessions(self)
    local a     = io.popen('accel-cmd show sessions ifname,username,ip,state,uptime,calling-sid,called-sid,sid,rx-bytes-raw,tx-bytes-raw,rx-pkts,tx-pkts,inbound-if,rate-limit') 
    local str   = a:read('*a')
    local counter = 0;
    local keys  = {};
    local items = {};
    for s in str:gmatch("[^\r\n]+") do
        --table.insert(lines, s)
        counter = counter +1;
        local entry = {};
        --print("BEGIN"..s..counter.."END"); --FIXME Figure out haw to handle blank values
        local item_counter = 0;
        for t in s:gmatch("[^%s?|%s?]+")do
            item_counter = item_counter +1;
            --print("TAB"..t..item_counter.."ENDTAB")
            if(counter == 1)then
                table.insert(keys,t)
            end
            if(counter > 2)then               
                local k     = keys[item_counter]
                entry[k]    = t;
            end
        end
        if(counter > 2)then
            table.insert(items,entry);
        end
    end
    return items;
end