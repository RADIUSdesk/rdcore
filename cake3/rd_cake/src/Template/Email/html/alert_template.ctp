<h3>
	<span style="font-family:arial,helvetica,sans-serif;">
        <span style="color:#696969;">Active Alerts</span>
    </span>
</h3>
<table cellpadding="5" cellspacing="1" style="width: 100%;">
	<tbody>
<?php
    $alt_row = false;
    foreach($alerts as $a){
    
        $alt = '';
        if($alt_row){
            $alt = "bgcolor='#eef3f3'";
        } 
          
        $network_type = 'MESH';
        if($a['type'] == 'ap_profile'){
            $network_type = 'AP';
        }
        
        echo("<tr $alt>\n");
		echo("   <td>\n");
		echo("      <div style='color:grey;padding-bottom:5px;'><span style='font-family:arial,helvetica,sans-serif;font-size:smaller;'>$network_type</span></div>\n");
		echo("		<div style='color:#0066cc;'><strong><span style='font-family:arial,helvetica,sans-serif;'>".$a['network']."</span></strong></div>\n");
		echo("		<div style='color:#696969;'><span style='font-family:arial,helvetica,sans-serif;'>".$a['device']."</span></div>\n");				
		echo("   </td>\n");
		echo("   <td>\n");
        echo("        <div class=\"divInfo txtBlue\">Device Unreachable</div>\n");
        echo("        <div class='divInfo'>Detected <b>".$a['detected_in_words']."</b></div>\n");			    
        echo("        <div class='divInfo'>Ack <b>".$a['acknowledged_in_words']."</b></div>\n");
        echo("        <div class='divInfo'>Resolved <b>".$a['resolved_in_words']."</b></div>\n");
	    echo("   </td>\n");
		echo("</tr>\n");
           
        $alt_row = !$alt_row;
    }
?>   		

	</tbody>
</table>
