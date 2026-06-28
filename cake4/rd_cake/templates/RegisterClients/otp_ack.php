<?php

    $alert      = $data;
    $deviceName = 'Unknown Device';
    $deviceMac  = '';
    $deviceType = 'Device';

    if(!empty($alert['ap'])){
        $deviceType = 'Access Point';
        $deviceName = $alert['ap']['name'];
        $deviceMac  = $alert['ap']['mac'];
    }

    if(!empty($alert['node'])){
        $deviceType = 'Mesh Node';
        $deviceName = $alert['node']['name'];
        $deviceMac  = $alert['node']['mac'];
    }

?>

<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">

    <title>OTP Confirmed</title>
</head>

<body style="
    margin:0;
    padding:40px;
    background:#f1f5f9;
    font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
">

<div style="
    max-width:720px;
    margin:0 auto;
    background:#ffffff;
    border-radius:12px;
    overflow:hidden;
    box-shadow:0 4px 20px rgba(0,0,0,0.08);
">

    <!-- Header -->
    <div style="
        background:#10b981;
        padding:28px 32px;
    ">

        <div style="
            color:#ffffff;
            font-size:28px;
            font-weight:700;
            margin-bottom:8px;
        ">
            ✓ Alert Acknowledged
        </div>

        <div style="
            color:#d1fae5;
            font-size:15px;
        ">
            The alert has been successfully acknowledged.
        </div>

    </div>

    <!-- Content -->
    <div style="padding:32px;">

        <!-- Alert Description -->
        <div style="
            font-size:24px;
            font-weight:600;
            color:#1e293b;
            margin-bottom:24px;
        ">
            <?= htmlspecialchars($alert['description']) ?>
        </div>

        <!-- Details Table -->
        <table cellpadding="0" cellspacing="0" style="
            width:100%;
            border-collapse:collapse;
            border:1px solid #e2e8f0;
            border-radius:8px;
            overflow:hidden;
        ">

            <tr bgcolor="#f8fafc">
                <td style="
                    padding:14px 18px;
                    width:220px;
                    font-weight:600;
                    color:#475569;
                    border-bottom:1px solid #e2e8f0;
                ">
                    Alert ID
                </td>

                <td style="
                    padding:14px 18px;
                    color:#1e293b;
                    border-bottom:1px solid #e2e8f0;
                ">
                    #<?= htmlspecialchars($alert['id']) ?>
                </td>
            </tr>

            <tr>
                <td style="
                    padding:14px 18px;
                    font-weight:600;
                    color:#475569;
                    border-bottom:1px solid #e2e8f0;
                ">
                    Category
                </td>

                <td style="
                    padding:14px 18px;
                    color:#1e293b;
                    border-bottom:1px solid #e2e8f0;
                ">
                    <?= strtoupper(htmlspecialchars($alert['category'])) ?>
                </td>
            </tr>

            <tr bgcolor="#f8fafc">
                <td style="
                    padding:14px 18px;
                    font-weight:600;
                    color:#475569;
                    border-bottom:1px solid #e2e8f0;
                ">
                    Device Type
                </td>

                <td style="
                    padding:14px 18px;
                    color:#1e293b;
                    border-bottom:1px solid #e2e8f0;
                ">
                    <?= htmlspecialchars($deviceType) ?>
                </td>
            </tr>

            <tr>
                <td style="
                    padding:14px 18px;
                    font-weight:600;
                    color:#475569;
                    border-bottom:1px solid #e2e8f0;
                ">
                    Device Name
                </td>

                <td style="
                    padding:14px 18px;
                    color:#1e293b;
                    border-bottom:1px solid #e2e8f0;
                ">
                    <?= htmlspecialchars($deviceName) ?>
                </td>
            </tr>

            <tr bgcolor="#f8fafc">
                <td style="
                    padding:14px 18px;
                    font-weight:600;
                    color:#475569;
                    border-bottom:1px solid #e2e8f0;
                ">
                    MAC Address
                </td>

                <td style="
                    padding:14px 18px;
                    color:#1e293b;
                    border-bottom:1px solid #e2e8f0;
                ">
                    <?= htmlspecialchars($deviceMac) ?>
                </td>
            </tr>

            <tr>
                <td style="
                    padding:14px 18px;
                    font-weight:600;
                    color:#475569;
                    border-bottom:1px solid #e2e8f0;
                ">
                    Detected
                </td>

                <td style="
                    padding:14px 18px;
                    color:#1e293b;
                    border-bottom:1px solid #e2e8f0;
                ">
                    <?= htmlspecialchars($alert['detected']) ?>
                </td>
            </tr>

            <tr bgcolor="#f8fafc">
                <td style="
                    padding:14px 18px;
                    font-weight:600;
                    color:#475569;
                ">
                    Acknowledged
                </td>

                <td style="
                    padding:14px 18px;
                    color:#10b981;
                    font-weight:600;
                ">
                    <?= htmlspecialchars($alert['acknowledged']) ?>
                </td>
            </tr>

        </table>

        <!-- Footer -->
        <div style="
            margin-top:28px;
            font-size:13px;
            color:#64748b;
            line-height:1.6;
        ">
            This alert no longer requires acknowledgement and has been marked as acknowledged successfully.
        </div>

    </div>

</div>

</body>
</html>
