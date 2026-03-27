# Comprehensive Office 365 SMTP Authentication Diagnosis

param(
    [string]$UserEmail = "richard.siebert@siebertrservices.com"
)

Write-Host ""
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "Office 365 SMTP Authentication Diagnosis" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check module installation
Write-Host "Step 1: Checking Prerequisites..." -ForegroundColor Yellow
$installed = Get-Module -ListAvailable -Name ExchangeOnlineManagement
if ($installed) {
    Write-Host "  OK: ExchangeOnlineManagement installed" -ForegroundColor Green
} else {
    Write-Host "  ERROR: ExchangeOnlineManagement NOT installed" -ForegroundColor Red
    Write-Host "  Install with: Install-Module -Name ExchangeOnlineManagement -Force"
    exit 1
}

Write-Host ""
Write-Host "Step 2: Connecting to Exchange Online..." -ForegroundColor Yellow
try {
    Connect-ExchangeOnline -UserPrincipalName $UserEmail -WarningAction SilentlyContinue -ErrorAction Stop | Out-Null
    Write-Host "  OK: Connected to Exchange Online" -ForegroundColor Green
}
catch {
    Write-Host "  ERROR: Failed to connect: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 3: Checking Tenant-Level Settings..." -ForegroundColor Yellow

# 3a. SMTP Client Authentication
$smtpDisabled = Get-TransportConfig | Select-Object -ExpandProperty SmtpClientAuthenticationDisabled
Write-Host ""
Write-Host "  SMTP Client Authentication (Org-wide):"
if ($smtpDisabled -eq $false) {
    Write-Host "    OK: ENABLED" -ForegroundColor Green
}
else {
    Write-Host "    ERROR: DISABLED (This is blocking emails!)" -ForegroundColor Red
}

# 3b. OAuth2 Client Profile
$oauth = Get-OrganizationConfig | Select-Object -ExpandProperty OAuth2ClientProfileEnabled
Write-Host ""
Write-Host "  OAuth2 Client Profile Enabled:"
if ($oauth -eq $true) {
    Write-Host "    OK: ENABLED" -ForegroundColor Green
}
else {
    Write-Host "    WARNING: DISABLED" -ForegroundColor Yellow
}

# 3c. Remote PowerShell Access
try {
    $remotePS = Get-OrganizationConfig | Select-Object -ExpandProperty RemotePowerShellEnabled
    Write-Host ""
    Write-Host "  Remote PowerShell Enabled:"
    Write-Host "    Status: $remotePS"
}
catch {
    Write-Host "    (Cannot determine)"
}

Write-Host ""
Write-Host "Step 4: Checking User-Level Settings for $UserEmail" -ForegroundColor Yellow

# Get user object
$user = Get-User -Identity $UserEmail -ErrorAction SilentlyContinue
$mailbox = Get-Mailbox -Identity $UserEmail -ErrorAction SilentlyContinue
$casMailbox = Get-CASMailbox -Identity $UserEmail -ErrorAction SilentlyContinue

if ($user) {
    Write-Host ""
    Write-Host "  User Account Status:"
    Write-Host "    Display Name: $($user.DisplayName)" -ForegroundColor Gray
    Write-Host "    Type: $($user.RecipientTypeDetails)" -ForegroundColor Gray
    Write-Host "    UPN: $($user.UserPrincipalName)" -ForegroundColor Gray
}

if ($mailbox) {
    Write-Host ""
    Write-Host "  Mailbox Status:"
    Write-Host "    SMTP Address: $($mailbox.PrimarySmtpAddress)" -ForegroundColor Gray
    Write-Host "    Alias: $($mailbox.Alias)" -ForegroundColor Gray
    
    $forwarding = $mailbox.ForwardingAddress
    if ($forwarding) {
        Write-Host "    WARNING: Forwarding enabled to $forwarding" -ForegroundColor Yellow
    }
}

if ($casMailbox) {
    Write-Host ""
    Write-Host "  Client Access Settings:"
    Write-Host "    OWA Enabled: $($casMailbox.OWAEnabled)"
    Write-Host "    IMAP Enabled: $($casMailbox.IMAPEnabled)"
    Write-Host "    POP Enabled: $($casMailbox.POPEnabled)"
    
    if ($casMailbox.SmtpClientAuthenticationDisabled) {
        Write-Host "    ERROR: SMTP Auth DISABLED for this user!" -ForegroundColor Red
    }
    else {
        Write-Host "    OK: SMTP Auth ENABLED" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Step 5: Checking Authentication Policies..." -ForegroundColor Yellow

try {
    $authPolicies = Get-AuthenticationPolicy -ErrorAction SilentlyContinue
    if ($authPolicies) {
        Write-Host "  WARNING: Authentication policies found:" -ForegroundColor Yellow
        $authPolicies | ForEach-Object {
            Write-Host "    - $($_.Name)" -ForegroundColor Gray
        }
    }
    else {
        Write-Host "  OK: No authentication policies configured" -ForegroundColor Green
    }
}
catch {
    Write-Host "  (Cannot determine authentication policies)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Step 6: Checking for MFA..." -ForegroundColor Yellow

try {
    $userObj = Get-User -Identity $UserEmail
    $mfa = $userObj.StrongAuthenticationRequirements
    if ($mfa) {
        Write-Host "  WARNING: MFA Enforced on this user" -ForegroundColor Yellow
        Write-Host "    Details: $($mfa | ConvertTo-Json)"
    }
    else {
        Write-Host "  OK: No MFA requirement found" -ForegroundColor Green
    }
}
catch {
    Write-Host "  (MFA check skipped)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Step 7: Checking Legacy Authentication Blocking..." -ForegroundColor Yellow

try {
    $legacyBlocked = Get-OrganizationConfig | Select-Object -ExpandProperty BlockLegacyAuthProtocol
    Write-Host ""
    if ($legacyBlocked -eq $true) {
        Write-Host "  ERROR: Legacy Authentication is BLOCKED!" -ForegroundColor Red
        Write-Host "  This affects SMTP basic auth" -ForegroundColor Red
    }
    else {
        Write-Host "  OK: Legacy Authentication allowed" -ForegroundColor Green
    }
}
catch {
    Write-Host "  (Cannot determine legacy auth status)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "DIAGNOSIS SUMMARY" -ForegroundColor Yellow
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

$issuesFound = 0

if ($smtpDisabled -eq $true) {
    Write-Host "ISSUE 1: SMTP is DISABLED at organization level" -ForegroundColor Red
    $issuesFound++
}

if ($casMailbox.SmtpClientAuthenticationDisabled -eq $true) {
    Write-Host "ISSUE 2: SMTP is DISABLED for this user" -ForegroundColor Red
    $issuesFound++
}

if ($legacyBlocked -eq $true) {
    Write-Host "ISSUE 3: Legacy Authentication is BLOCKED" -ForegroundColor Red
    $issuesFound++
}

if ($issuesFound -eq 0) {
    Write-Host "NO BLOCKING POLICIES DETECTED" -ForegroundColor Green
    Write-Host ""
    Write-Host "Settings look correct. The error might be:" -ForegroundColor Yellow
    Write-Host "  1. Incorrect app password" -ForegroundColor Gray
    Write-Host "  2. User sign-in restrictions" -ForegroundColor Gray
    Write-Host "  3. IP-based access restrictions" -ForegroundColor Gray
    Write-Host "  4. Third-party security policy" -ForegroundColor Gray
    Write-Host "  5. Exchange Online Protection rule blocking SMTP" -ForegroundColor Gray
}
else {
    Write-Host ""
    Write-Host "BLOCKING ISSUES FOUND: $issuesFound" -ForegroundColor Red
}

Write-Host ""
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "If SMTP is DISABLED globally:" -ForegroundColor Gray
Write-Host "  1. Go to Exchange Admin Center" -ForegroundColor Gray
Write-Host "  2. Find Mail Flow settings" -ForegroundColor Gray
Write-Host "  3. Enable SMTP Authentication" -ForegroundColor Gray
Write-Host ""
Write-Host "If issue persists:" -ForegroundColor Gray
Write-Host "  Contact Microsoft Support with the 535 5.7.139 error code" -ForegroundColor Gray
Write-Host "  Or: Switch to SendGrid, AWS SES, or Brevo for email" -ForegroundColor Gray
Write-Host ""

Disconnect-ExchangeOnline -Confirm:$false -WarningAction SilentlyContinue | Out-Null
Write-Host "Disconnected from Exchange Online." -ForegroundColor Gray
