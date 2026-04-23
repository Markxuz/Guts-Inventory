#!/bin/sh

# Wait for MySQL to be available before starting the Node app.
host="$1"
shift

until nc -z "$host" 3306; do
  echo "Waiting for MySQL at ${host}:3306..."
  sleep 2
done

echo "MySQL is available. Starting application..."
exec "$@"
