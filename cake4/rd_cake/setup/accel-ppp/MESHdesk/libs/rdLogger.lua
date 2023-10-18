require( "class" )

-------------------------------------------------------------------------------
-- Logger class ----------------
-------------------------------------------------------------------------------
class "rdLogger"

--Init function for object
function rdLogger:rdLogger()
	self.version 	= "1.0.1"
	self.tag	    = "MESHdesk"
	self.priority	= "debug"
end
        
function rdLogger:getVersion()
	return self.version
end


function rdLogger:log(message,priority)
	priority = priority or self.priority
	os.execute("logger -t " .. self.tag .. " -p '" .. priority .. "' '" .. message.."'")
end

--[[--
========================================================
=== Private functions start here =======================
========================================================
--]]--

