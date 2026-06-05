#!/bin/bash

# Fix permissions for mounted volumes
chown -R www-data:www-data /var/www/rdcore/cake4/rd_cake/tmp
chown -R www-data:www-data /var/www/rdcore/cake4/rd_cake/logs
chown -R www-data:www-data /var/www/rdcore/cake4/rd_cake/webroot/img/realms
chown -R www-data:www-data /var/www/rdcore/cake4/rd_cake/webroot/img/dynamic_details
chown -R www-data:www-data /var/www/rdcore/cake4/rd_cake/webroot/img/dynamic_photos
chown -R www-data:www-data /var/www/rdcore/cake4/rd_cake/webroot/img/access_providers
chown -R www-data:www-data /var/www/rdcore/cake4/rd_cake/webroot/img/hardwares
chown -R www-data:www-data /var/www/rdcore/cake4/rd_cake/webroot/files/imagecache

# Process PHP environment variables: preserve overrides and unset defaults
CUSTOM_FPM_INI="/etc/php/php-custom.ini"
CUSTOM_CLI_INI="/etc/php/cli-custom.ini"

# Start with empty custom INI files
echo "; Custom PHP overrides" > "$CUSTOM_FPM_INI"
echo "; Custom PHP overrides" > "$CUSTOM_CLI_INI"

# Load default environment variables into an associative array
declare -A default_envs
if [ -f /etc/default_php_env ]; then
    while IFS= read -r line; do
        if [[ "$line" =~ ^([^=]+)=(.*)$ ]]; then
            key="${BASH_REMATCH[1]}"
            val="${BASH_REMATCH[2]}"
            default_envs["$key"]="$val"
        fi
    done < /etc/default_php_env
fi

# Track variables to unset to prevent environment pollution
vars_to_unset=()

for var in $(env | cut -d= -f1 | grep -E '^(PHP_|PHP\.)'); do
    current_val="${!var}"
    default_val="${default_envs[$var]}"
    
    is_override=0
    if [ -z "${default_envs[$var]+x}" ]; then
        # Not in defaults, so it's a manual override
        is_override=1
    elif [ "$current_val" != "$default_val" ]; then
        # Value is different, so it's a manual override
        is_override=1
    fi
    
    if [ "$is_override" -eq 1 ]; then
        # Map the environment variable to a PHP ini setting
        ini_key=""
        if [[ "$var" =~ ^PHP\.(.*)$ ]]; then
            ini_key="${BASH_REMATCH[1]}"
        elif [[ "$var" =~ ^PHP_(.*)$ ]]; then
            suffix="${BASH_REMATCH[1]}"
            case "$suffix" in
                OPCACHE_ENABLE) ini_key="opcache.enable" ;;
                MEMORY_LIMIT) ini_key="memory_limit" ;;
                MAX_EXECUTION_TIME) ini_key="max_execution_time" ;;
                UPLOAD_MAX_FILESIZE) ini_key="upload_max_filesize" ;;
                POST_MAX_SIZE) ini_key="post_max_size" ;;
                DISPLAY_ERRORS) ini_key="display_errors" ;;
                ERROR_REPORTING) ini_key="error_reporting" ;;
                DATE_TIMEZONE) ini_key="date.timezone" ;;
                *)
                    # Default: convert to lowercase
                    ini_key=$(echo "$suffix" | tr '[:upper:]' '[:lower:]')
                    ;;
            esac
        fi
        
        if [ -n "$ini_key" ]; then
            echo "$ini_key = $current_val" >> "$CUSTOM_FPM_INI"
            echo "$ini_key = $current_val" >> "$CUSTOM_CLI_INI"
        fi
    fi
    
    vars_to_unset+=("$var")
done

# Unset all PHP_ and PHP. variables to prevent environment pollution in container
# (Except standard PHP system variables like PHP_INI_SCAN_DIR or PHPRC)
for var in "${vars_to_unset[@]}"; do
    if [ "$var" != "PHP_INI_SCAN_DIR" ] && [ "$var" != "PHPRC" ]; then
        unset "$var"
    fi
done

exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
