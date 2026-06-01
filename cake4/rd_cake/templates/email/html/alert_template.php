<h3>
	<span style="font-family:arial,helvetica,sans-serif;">
        <span style="color:#696969;">Active Alerts</span>
    </span>
</h3>
<table cellpadding="5" cellspacing="1" style="width: 100%;">
	<tbody>
<?php

    //== FIXME read from config file ===
    $baseUrl = 'https://cloud.radiusdesk.com';

    $alt_row = false;
    foreach($alerts as $a){
        $alt = '';
        
        if($alt_row){
            $alt = "bgcolor='#f8fafc'";
        } 
          
        $network_type = 'MESH';
        if($a['type'] == 'ap_profile'){
            $network_type = 'AP';
        }
        
        // Determine status color based on resolution
        $statusColor = '#ef4444'; // Red for unresolved
        if(!empty($a['resolved_in_words']) && $a['resolved_in_words'] != 'Never'){
            $statusColor = '#10b981'; // Green for resolved
        } elseif(!empty($a['acknowledged_in_words']) && $a['acknowledged_in_words'] != 'Never'){
            $statusColor = '#f59e0b'; // Amber for acknowledged
        }
        
        echo("<tr $alt style='border-bottom:1px solid #e2e8f0;'>\n");
        
        
        echo("<td style='padding:20px 16px; vertical-align:top;'>\n");
        echo("<div style='margin-bottom:12px;'>\n");
        echo("<span style='display:inline-block; background:#e2e8f0; color:#475569; font-family:-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif; font-size:11px; font-weight:600; padding:4px 10px; border-radius:12px; letter-spacing:0.3px; text-transform:uppercase;'>$network_type</span>\n");
        echo("</div>\n");
        echo("<div style='margin-bottom:6px;'>\n");
        echo("<strong style='color:#1e293b; font-family:-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif; font-size:16px; font-weight:600;'>".htmlspecialchars($a['network'])."</strong>\n");
        echo("</div>\n");
        echo("<div style='color:#64748b; font-family:-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif; font-size:13px;'>".htmlspecialchars($a['device'])."</div>\n");
        echo("</td>\n");
        
        
        echo("<td style='padding:20px 16px; vertical-align:top;'>\n");
        echo("<div style='margin-bottom:10px;'>\n");
        echo("<span style='display:inline-block; background:{$statusColor}15; color:{$statusColor}; font-family:-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif; font-size:13px; font-weight:600; padding:6px 12px; border-radius:6px;'>⚠️ Device Unreachable</span>\n");
        echo("</div>\n");
        echo("<div style='margin-bottom:10px; font-family:-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif; font-size:13px; color:#475569;'>\n");
        echo("<span style='color:#64748b;'>🕒 Detected</span> <strong style='color:#1e293b;'>".htmlspecialchars($a['detected_in_words'])."</strong>\n");
        echo("</div>\n");
        
        if(!empty($a['acknowledged_in_words']) && $a['acknowledged_in_words'] != 'Never'){
            echo("        <div style='margin-bottom:10px; font-family:-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif; font-size:13px; color:#475569;'>\n");
            echo("            <span style='color:#64748b;'>✓ Ack</span> <strong style='color:#1e293b;'>".htmlspecialchars($a['acknowledged_in_words'])."</strong>\n");
            echo("        </div>\n");
        }else{
            //Add a link so that the user / admin can acknowledge it through the email
            
            $ackUrl = $baseUrl .
                '/cake4/rd_cake/alerts/ack.php?id=' .
                urlencode($a['id']) .
                '&user_id=' .
                urlencode($user['id']);

            echo("    <div style='margin-top:12px;'>\n");
            echo("        <a href='{$ackUrl}' 
                            style='
                                display:inline-block;
                                background:#2563eb;
                                color:#ffffff;
                                text-decoration:none;
                                padding:10px 18px;
                                border-radius:6px;
                                font-family:-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif;
                                font-size:13px;
                                font-weight:600;
                            '>
                            Acknowledge
                        </a>\n");
            echo("    </div>\n");
            
        
        }
        
        if(!empty($a['resolved_in_words']) && $a['resolved_in_words'] != 'Never'){
            echo("        <div style='font-family:-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif; font-size:13px; color:#475569;'>\n");
            echo("            <span style='color:#64748b;'>✅ Resolved</span> <strong style='color:#1e293b;'>".htmlspecialchars($a['resolved_in_words'])."</strong>\n");
            echo("        </div>\n");
        }
        echo("</td>\n");
        
        
        echo("</tr>\n");
           
        $alt_row = !$alt_row;
    }
?>   		

	</tbody>
</table>



