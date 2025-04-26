# PowerShell script to run database migrations

# Load environment variables from .env file if it exists
if (Test-Path .env) {
    Get-Content .env | ForEach-Object {
        if ($_ -match '^([^#][^=]+)=(.+)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, [EnvironmentVariableTarget]::Process)
        }
    }
}

# Check for required environment variables
if (-not $env:NEXT_PUBLIC_SUPABASE_URL -or -not $env:SUPABASE_SERVICE_ROLE_KEY) {
    Write-Error "Missing required environment variables. Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set."
    exit 1
}

# Run the migration script
Write-Output "Running database migrations..."
node scripts/run-migrations.js

# Check if migrations were successful
if ($LastExitCode -eq 0) {
    Write-Output "Database migrations completed successfully!"
} else {
    Write-Error "Database migrations failed with exit code $LastExitCode"
    exit 1
} 