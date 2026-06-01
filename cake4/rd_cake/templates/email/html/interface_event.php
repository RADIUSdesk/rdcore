<h3 style="margin:0 0 20px 0;">
    <span style="font-family:arial,helvetica,sans-serif;">
        <span style="color:#334155;">Interface State Change</span>
    </span>
</h3>

<?php

    $statusColor = '#64748b';
    $statusLabel = 'UNKNOWN';

    if($data['interface_status'] == 'online'){
        $statusColor = '#10b981';
        $statusLabel = 'ONLINE';
    }

    if($data['interface_status'] == 'offline'){
        $statusColor = '#ef4444';
        $statusLabel = 'OFFLINE';
    }
    
    if($data['interface_status'] == 'disabled'){
        $statusColor = '#cc9616';
        $statusLabel = 'DISABLED';
    }
    
    if($data['interface_status'] == 'disconnecting'){
        $statusColor = '#de6e18';
        $statusLabel = 'DISCONNECTING';
    }
    
    if($data['interface_status'] == 'connecting'){
        $statusColor = '#de6e18';
        $statusLabel = 'CONNECTING';
    }

    $deviceType = strtoupper($data['device_mode']);

?>

<table cellpadding="0" cellspacing="0" style="width:100%; border-collapse:collapse; background:#ffffff; border:1px solid #e2e8f0; border-radius:8px;">

    <tr>
        <td style="padding:24px;">

            <div style="margin-bottom:18px;">
                <span style="
                    display:inline-block;
                    background:<?= $statusColor ?>15;
                    color:<?= $statusColor ?>;
                    font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
                    font-size:13px;
                    font-weight:700;
                    padding:8px 14px;
                    border-radius:6px;
                    letter-spacing:0.4px;
                ">
                    <?= $statusLabel ?>
                </span>
            </div>

            <div style="
                font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
                font-size:22px;
                font-weight:600;
                color:#1e293b;
                margin-bottom:8px;
            ">
                <?= htmlspecialchars($data['interface_name']) ?>
            </div>

            <div style="
                font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
                font-size:14px;
                color:#64748b;
                margin-bottom:24px;
            ">
                <?= htmlspecialchars($data['description']) ?>
            </div>

            <table cellpadding="8" cellspacing="0" style="width:100%; border-collapse:collapse;">

                <tr bgcolor="#f8fafc">
                    <td width="180" style="font-weight:600; color:#475569;">Device</td>
                    <td style="color:#1e293b;">
                        <?= htmlspecialchars($data['device_name']) ?>
                    </td>
                </tr>

                <tr>
                    <td style="font-weight:600; color:#475569;">Device Type</td>
                    <td style="color:#1e293b;">
                        <?= htmlspecialchars($deviceType) ?>
                    </td>
                </tr>

                <tr bgcolor="#f8fafc">
                    <td style="font-weight:600; color:#475569;">MAC Address</td>
                    <td style="color:#1e293b;">
                        <?= htmlspecialchars($data['device_mac']) ?>
                    </td>
                </tr>

                <tr>
                    <td style="font-weight:600; color:#475569;">Group</td>
                    <td style="color:#1e293b;">
                        <?= htmlspecialchars($data['device_group']) ?>
                    </td>
                </tr>

                <tr bgcolor="#f8fafc">
                    <td style="font-weight:600; color:#475569;">Cloud</td>
                    <td style="color:#1e293b;">
                        <?= htmlspecialchars($data['cloud_name']) ?>
                    </td>
                </tr>

                <tr>
                    <td style="font-weight:600; color:#475569;">Interface</td>
                    <td style="color:#1e293b;">
                        <?= htmlspecialchars($data['interface_name']) ?>
                        (<?= htmlspecialchars($data['interface_type']) ?>)
                    </td>
                </tr>

                <tr bgcolor="#f8fafc">
                    <td style="font-weight:600; color:#475569;">Status</td>
                    <td style="color:<?= $statusColor ?>; font-weight:600;">
                        <?= htmlspecialchars($data['interface_status']) ?>
                    </td>
                </tr>

            </table>

        </td>
    </tr>

</table>
