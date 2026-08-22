Write-Host "Installing Openworker E-Commerce MCP..."
npm install
npm run build

$config = @{
    "openworker-ecommerce-mcp" = @{
        "command" = "node"
        "args" = @("dist/index.js")
    }
}

$configJson = $config | ConvertTo-Json -Depth 5
Set-Content -Path "scripts/openworker-config.json" -Value $configJson

Write-Host "Installation complete! Configuration saved to scripts/openworker-config.json"
