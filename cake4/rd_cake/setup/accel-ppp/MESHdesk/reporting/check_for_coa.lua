#!/usr/bin/lua
-- Include libraries

package.path = "/etc/MESHdesk/libs/?.lua;../libs/?.lua;./libs/?.lua;" .. package.path
function main()
    require("rdCoa")
    local coa = rdCoa()
    coa:check()
end
main()

