# Office 365 Security Settings Checker
# This script checks SMTP auth, modern auth, app passwords, and security policies
# Requires: Exchange Online PowerShell Module + Global Admin access

param(
    [string]$UserEmail = "richard.siebert@siebertrservices.com"
)

Write-Host "============================================================" -ForegroundColor White
Write-Host "Office 365 Security Settings Checker" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor White
Write-Host ""

# Check if Exchange Online module is installed
$module = Get-Module -ListAvailable -Name ExchangeOnlineManagement
if (-not $module) {
    Write-Host "ERROR: ExchangeOnlineManagement module not found!" -ForegroundColor Red
    Write-Host "Install with: Install-Module -Name ExchangeOnlineManagement -Force"
    exit 1
}

Write-Host "1. Connecting to Exchange Online..." -ForegroundColor Cyan
try {
    Connect-ExchangeOnline -UserPrincipalName $UserEmail -WarningAction SilentlyContinue
    Write-Host "   [OK] Connected" -ForegroundColor Green
}
catch {
    Write-Host "   [ERROR] Failed to connect: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "2. Checking Org Settings..." -ForegroundColor Cyan
Write-Host ""

# Check SMTP Auth setting
Write-Host "   SMTP Authentication (Org-wide):"
$smtpAuth = Get-TransportConfig | Select-Object -ExpandProperty SmtpClientAuthenticationDisabled
if ($smtpAuth -eq $false) {
    Write-Host "      [OK] ENABLED" -ForegroundColor Green
}
else {
    Write-Host "      [BLOCKED] DISABLED" -ForegroundColor Red
}

# Check Modern Authentication
Write-Host ""
Write-Host "   Modern Authentication (Org-wide):"
$modernAuth = Get-OrganizationConfig | Select-Object -ExpandProperty OAuth2ClientProfileEnabled
if ($modernAuth -eq $true) {
    Write-Host "      [OK] ENABLED" -ForegroundColor Green
}
else {
    Write-Host "      [BLOCKED] DISABLED" -ForegroundColor Red
}

# Check Conditional Access (if available)
Write-Host ""
Write-Host "   Conditional Access and MFA Policies:"
try {
    $policies = Get-ConditionalAccessPolicy -ErrorAction SilentlyContinue
    if ($policies) {
        Write-Host "      Found $($policies.Count) policies" -ForegroundColor Yellow
        $policies | ForEach-Object {
            Write-Host "         - $($_.DisplayName)"
        }
    }
    else {
        Write-Host "      No Conditional Access policies found" -ForegroundColor Gray
    }
}
catch {
    Write-Host "      (Requires Azure AD PowerShell)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "3. Checking User Account: $UserEmail" -ForegroundColor Cyan
Write-Host ""

# Get user mailbox settings
$mailbox = Get-Mailbox -Identity $UserEmail -ErrorAction SilentlyContinue
if ($mailbox) {
    Write-Host "   Account Status:"
    Write-Host "      Display Name: $($mailbox.DisplayName)" -ForegroundColor Gray
    Write-Host "      Email Address: $($mailbox.PrimarySmtpAddress)" -ForegroundColor Gray
    
    # Check if mailbox is active
    $user = Get-User -Identity $UserEmail
    Write-Host "      Type: $($user.RecipientTypeDetails)" -ForegroundColor Gray
}
else {
    Write-Host "   [ERROR] Mailbox not found" -ForegroundColor Red
}

# Check SMTP Client Settings for user
Write-Host ""
Write-Host "   Client Access (User-level):"
$clientSettings = Get-CASMailbox -Identity $UserEmail -ErrorAction SilentlyContinue
if ($clientSettings) {
    Write-Host "      OWA Enabled: $($clientSettings.OWAEnabled)" -ForegroundColor Gray
    Write-Host "      POP Enabled: $($clientSettings.POPEnabled)" -ForegroundColor Gray
    Write-Host "      IMAP Enabled: $($clientSettings.IMAPEnabled)" -ForegroundColor Gray
}
else {
    Write-Host "      Could not retrieve CAS settings" -ForegroundColor Yellow
}

# Check mailbox permissions
Write-Host ""
Write-Host "4. Mailbox Delegation and Permissions:" -ForegroundColor Cyan
Write-Host ""
$permissions = Get-MailboxPermission -Identity $UserEmail | Where-Object { $_.User -notlike "SELF" -and $_.IsInherited -eq $false }
if ($permissions) {
    Write-Host "   [ATTENTION] Found delegated access:" -ForegroundColor Yellow
    $permissions | ForEach-Object {
        Write-Host "      - $($_.User): $($_.AccessRights)" -ForegroundColor Gray
    }
}
else {
    Write-Host "   [OK] No unexpected permissions" -ForegroundColor Green
}

# Check forwarding rules
Write-Host ""
Write-Host "5. Email Forwarding and Rules:" -ForegroundColor Cyan
Write-Host ""
$forwarding = Get-Mailbox -Identity $UserEmail | Select-Object -ExpandProperty ForwardingAddress
if ($forwarding) {
    Write-Host "   [ATTENTION] Forwarding Address Set: $forwarding" -ForegroundColor Yellow
}
else {
    Write-Host "   [OK] No forwarding address" -ForegroundColor Green
}

$rules = Get-InboxRule -Mailbox $UserEmail -ErrorAction SilentlyContinue
if ($rules) {
    Write-Host "   Found $($rules.Count) inbox rules" -ForegroundColor Gray
    if ($rules.Count -gt 0) {
        $rules | ForEach-Object {
            Write-Host "      - $($_.Name)" -ForegroundColor Gray
        }
    }
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor White
Write-Host "Security Check Complete" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor White
Write-Host ""
Write-Host "KEY FINDINGS:"
Write-Host "  * If SMTP Auth shows [BLOCKED], that is why emails are failing"
Write-Host "  * You need to enable SMTP Authentication in Office 365 admin"
Write-Host "  * Check for Conditional Access policies blocking SMTP"
Write-Host ""

# Disconnect
Disconnect-ExchangeOnline -Confirm:$false -WarningAction SilentlyContinue
Write-Host "Disconnected from Exchange Online." -ForegroundColor Gray
