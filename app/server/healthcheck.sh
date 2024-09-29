#!/bin/bash

# Check if PostgreSQL is ready
pg_isready -U postgres || exit 1

# Check if the database exists and PostGIS is installed
psql -U postgres -d findyourdance -c "SELECT postgis_version();" > /dev/null 2>&1

# Store the exit status
exit_status=$?

if [ $exit_status -eq 0 ]; then
    echo "Database 'findyourdance' exists and PostGIS is installed."
    exit 0
else
    echo "Database 'findyourdance' does not exist or PostGIS is not installed."
    exit 1
fi