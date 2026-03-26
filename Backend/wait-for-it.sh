#!/bin/sh

# Wait for MySQL to be available
host="$1"
shift
cmd="$@"

until nc -z "$host" 3306; do
  echo "Waiting for MySQL at $host:3306..."
  sleep 2
done

echo "MySQL is available! Starting application..."
exec $cmd
