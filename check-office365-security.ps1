# Office 365 Security Settings Checker
# This script checks SMTP auth, modern auth, app passwords, and security policies
# Requires: Exchange Online PowerShell Module + Global Admin access

param(
    [string]$UserEmail = "richard.siebert@siebertrservices.com"
)

Write-Host "=" * 60
Write-Host "Office 365 Security Settings Checker"
Write-Host "=" * 60
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
    Write-Host "   ✓ Connected" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Failed to connect: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "2. Checking Org Settings..." -ForegroundColor Cyan
Write-Host ""

# Check SMTP Auth setting
Write-Host "   SMTP Authentication (Org-wide):"
$smtpAuth = Get-TransportConfig | Select-Object -ExpandProperty SmtpClientAuthenticationDisabled
if ($smtpAuth -eq $false) {
    Write-Host "      ✓ ENABLED" -ForegroundColor Green
} else {
    Write-Host "      ✗ DISABLED" -ForegroundColor Red
}

# Check Modern Authentication
Write-Host ""
Write-Host "   Modern Authentication (Org-wide):"
$modernAuth = Get-OrganizationConfig | Select-Object -ExpandProperty OAuth2ClientProfileEnabled
if ($modernAuth -eq $true) {
    Write-Host "      ✓ ENABLED" -ForegroundColor Green
} else {
    Write-Host "      ✗ DISABLED" -ForegroundColor Red
}

# Check Require Multi-Factor Authentication
Write-Host ""
Write-Host "   Conditional Access & MFA Policies:"
try {
    $policies = Get-ConditionalAccessPolicy -ErrorAction SilentlyContinue
    if ($policies) {
        Write-Host "      Found $($policies.Count) policies" -ForegroundColor Yellow
        $policies | ForEach-Object {
            Write-Host "         - $($_.DisplayName)"
        }
    } else {
        Write-Host "      No Conditional Access policies found" -ForegroundColor Gray
    }
} catch {
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
    Write-Host "      Active: $($user.RecipientTypeDetails)" -ForegroundColor Gray
} else {
    Write-Host "   ✗ Mailbox not found" -ForegroundColor Red
}

# Check SMTP Client Settings for user
Write-Host ""
Write-Host "   SMTP Client Auth (User-level):"
$clientSettings = Get-CASMailbox -Identity $UserEmail -ErrorAction SilentlyContinue
if ($clientSettings) {
    Write-Host "      OWA Enabled: $($clientSettings.OWAEnabled)" -ForegroundColor Gray
    Write-Host "      POP Enabled: $($clientSettings.POPEnabled)" -ForegroundColor Gray
    Write-Host "      IMAP Enabled: $($clientSettings.IMAPEnabled)" -ForegroundColor Gray
    Write-Host "      SMTP Auth: $($clientSettings.SmtpClientAuthenticationDisabled)" -ForegroundColor Gray
} else {
    Write-Host "      Could not retrieve CAS settings" -ForegroundColor Yellow
}

# Check for app passwords/registered devices
Write-Host ""
Write-Host "4. Checking Authentication Methods..." -ForegroundColor Cyan
Write-Host ""
Write-Host "   (Requires Azure AD PowerShell to check app passwords & devices)"
Write-Host "   Run: Connect-MgGraph"
Write-Host "   Then: Get-MgUserAuthenticationMethod -UserId $UserEmail"

# Check mailbox permissions
Write-Host ""
Write-Host "5. Mailbox Delegation & Permissions:" -ForegroundColor Cyan
Write-Host ""
$permissions = Get-MailboxPermission -Identity $UserEmail | Where-Object { $_.User -notlike "SELF" -and $_.IsInherited -eq $false }
if ($permissions) {
    Write-Host "   Found delegated access:" -ForegroundColor Yellow
    $permissions | ForEach-Object {
        Write-Host "      - $($_.User): $($_.AccessRights)" -ForegroundColor Gray
    }
} else {
    Write-Host "   ✓ No unexpected permissions" -ForegroundColor Green
}

# Check forwarding rules
Write-Host ""
Write-Host "6. Email Forwarding & Rules:" -ForegroundColor Cyan
Write-Host ""
$forwarding = Get-Mailbox -Identity $UserEmail | Select-Object -ExpandProperty ForwardingAddress
if ($forwarding) {
    Write-Host "   ✗ Forwarding Address Set: $forwarding" -ForegroundColor Yellow
} else {
    Write-Host "   ✓ No forwarding address" -ForegroundColor Green
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
Write-Host "=" * 60
Write-Host "Security Check Complete" -ForegroundColor Green
Write-Host "=" * 60
Write-Host ""
Write-Host "SUMMARY:"
Write-Host "  • If SMTP Auth shows DISABLED, that's your issue with email sending"
Write-Host "  • Contact Office 365 admin if you don't see ENABLED"
Write-Host "  • Check Conditional Access policies if MFA is blocking SMTP"
Write-Host ""

# Disconnect
Disconnect-ExchangeOnline -Confirm:$false -WarningAction SilentlyContinue
Write-Host "Disconnected from Exchange Online." -ForegroundColor Gray
