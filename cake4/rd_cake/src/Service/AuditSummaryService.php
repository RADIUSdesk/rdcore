<?php
declare(strict_types=1);

namespace App\Service;

class AuditSummaryService
{
    public static function make(object $auditLog): string
    {
        $action  = $auditLog->action;
        $changes = $auditLog->changes ?? [];

        switch ($action) {

            case 'permanent_users.add':
                return self::permanentUserAdded($changes);

            case 'permanent_users.delete':
                return self::permanentUserDeleted($changes);

            case 'permanent_users.edit-basic-info':
                return self::permanentUserEdited($changes);

            default:
                return self::genericSummary($changes, $action);
        }
    }

    protected static function permanentUserAdded(array $changes): string
    {
        $username = $changes['username']['new'] ?? null;

        return $username
            ? "Created user '{$username}'"
            : 'Created permanent user';
    }

    protected static function permanentUserDeleted(array $changes): string
    {
        $username = $changes['username']['old'] ?? null;

        return $username
            ? "Deleted user '{$username}'"
            : 'Deleted permanent user';
    }

    protected static function permanentUserEdited(array $changes): string
    {
        if (isset($changes['profile'])) {

            return sprintf(
                "Changed profile from '%s' to '%s'",
                $changes['profile']['old'] ?? '',
                $changes['profile']['new'] ?? ''
            );
        }

        if (isset($changes['realm'])) {

            return sprintf(
                "Changed realm from '%s' to '%s'",
                $changes['realm']['old'] ?? '',
                $changes['realm']['new'] ?? ''
            );
        }

        return self::genericSummary($changes, 'updated');
    }

    protected static function genericSummary(
        array $changes,
        string $fallback
    ): string {

        $count = count($changes);

        if ($count === 0) {
            return $fallback;
        }

        if ($count === 1) {

            $field = array_key_first($changes);

            return sprintf(
                "Updated %s",
                str_replace('_', ' ', $field)
            );
        }

        return sprintf(
            "Updated %d fields",
            $count
        );
    }
}