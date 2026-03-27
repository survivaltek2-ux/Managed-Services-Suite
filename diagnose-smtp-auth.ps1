# Comprehensive Office 365 SMTP Authentication Diagnosis
# Checks for policies, settings, and restrictions that block SMTP

param(
    [string]$UserEmail = "richard.siebert@siebertrservices.com"
)

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║ Office 365 SMTP Authentication Diagnosis Script        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# 1. Check module installation
Write-Host "Step 1: Checking Prerequisites..." -ForegroundColor Yellow
$modules = @("ExchangeOnlineManagement", "Microsoft.Graph")
$missingModules = @()
foreach ($module in $modules) {
    $installed = Get-Module -ListAvailable -Name $module
    if ($installed) {
        Write-Host "  ✓ $module installed" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $module NOT installed" -ForegroundColor Red
        $missingModules += $module
    }
}

if ($missingModules.Count -gt 0) {
    Write-Host ""
    Write-Host "Install missing modules:" -ForegroundColor Yellow
    foreach ($module in $missingModules) {
        Write-Host "  Install-Module -Name $module -Force -AllowClobber"
    }
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "Step 2: Connecting to Exchange Online..." -ForegroundColor Yellow
try {
    Connect-ExchangeOnline -UserPrincipalName $UserEmail -WarningAction SilentlyContinue -ErrorAction Stop | Out-Null
    Write-Host "  ✓ Connected to Exchange Online" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Failed to connect: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 3: Checking Tenant-Level Settings..." -ForegroundColor Yellow

# 3a. SMTP Client Authentication
$smtpDisabled = Get-TransportConfig | Select-Object -ExpandProperty SmtpClientAuthenticationDisabled
Write-Host ""
Write-Host "  3a) SMTP Client Authentication (Org-wide):"
if ($smtpDisabled -eq $false) {
    Write-Host "      ✓ ENABLED (Good!)" -ForegroundColor Green
} else {
    Write-Host "      ✗ DISABLED (BLOCKING!)" -ForegroundColor Red
}

# 3b. OAuth2 Client Profile
$oauth = Get-OrganizationConfig | Select-Object -ExpandProperty OAuth2ClientProfileEnabled
Write-Host ""
Write-Host "  3b) OAuth2 Client Profile Enabled:"
if ($oauth -eq $true) {
    Write-Host "      ✓ ENABLED" -ForegroundColor Green
} else {
    Write-Host "      ✗ DISABLED" -ForegroundColor Red
}

# 3c. Remote PowerShell Access
try {
    $remotePS = Get-OrganizationConfig | Select-Object -ExpandProperty RemotePowerShellEnabled
    Write-Host ""
    Write-Host "  3c) Remote PowerShell Enabled:"
    Write-Host "      Status: $remotePS"
} catch {
    Write-Host "      (Cannot determine)"
}

Write-Host ""
Write-Host "Step 4: Checking User-Level Settings ($UserEmail)..." -ForegroundColor Yellow

# Get user object
$user = Get-User -Identity $UserEmail -ErrorAction SilentlyContinue
$mailbox = Get-Mailbox -Identity $UserEmail -ErrorAction SilentlyContinue
$casMailbox = Get-CASMailbox -Identity $UserEmail -ErrorAction SilentlyContinue

if ($user) {
    Write-Host ""
    Write-Host "  4a) User Account Status:"
    Write-Host "      Display Name: $($user.DisplayName)" -ForegroundColor Gray
    Write-Host "      Type: $($user.RecipientTypeDetails)" -ForegroundColor Gray
    Write-Host "      User Principal Name: $($user.UserPrincipalName)" -ForegroundColor Gray
}

if ($mailbox) {
    Write-Host ""
    Write-Host "  4b) Mailbox Status:"
    Write-Host "      SMTP Address: $($mailbox.PrimarySmtpAddress)" -ForegroundColor Gray
    Write-Host "      Alias: $($mailbox.Alias)" -ForegroundColor Gray
    
    $forwarding = $mailbox.ForwardingAddress
    if ($forwarding) {
        Write-Host "      Forwarding To: $forwarding" -ForegroundColor Yellow
    }
}

if ($casMailbox) {
    Write-Host ""
    Write-Host "  4c) Client Access Settings:"
    Write-Host "      OWA Enabled: $($casMailbox.OWAEnabled)"
    Write-Host "      IMAP Enabled: $($casMailbox.IMAPEnabled)"
    Write-Host "      POP Enabled: $($casMailbox.POPEnabled)"
    
    if ($casMailbox.SmtpClientAuthenticationDisabled) {
        Write-Host "      SMTP Auth: DISABLED (BLOCKING!)" -ForegroundColor Red
    } else {
        Write-Host "      SMTP Auth: ENABLED" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Step 5: Checking for Authentication Policies..." -ForegroundColor Yellow

# Check if there are any auth policies
try {
    $authPolicies = Get-AuthenticationPolicy -ErrorAction SilentlyContinue
    if ($authPolicies) {
        Write-Host "  Found authentication policies:" -ForegroundColor Yellow
        $authPolicies | ForEach-Object {
            Write-Host "    - $($_.Name)" -ForegroundColor Gray
        }
        Write-Host ""
        Write-Host "  Check if '$UserEmail' is assigned to any:" -ForegroundColor Yellow
        $userAssignment = Get-User $UserEmail -ErrorAction SilentlyContinue
        if ($userAssignment.AuthenticationPolicy) {
            Write-Host "    ✗ User IS assigned to policy: $($userAssignment.AuthenticationPolicy)" -ForegroundColor Red
        } else {
            Write-Host "    ✓ No policy assigned to user" -ForegroundColor Green
        }
    } else {
        Write-Host "  ✓ No authentication policies configured" -ForegroundColor Green
    }
} catch {
    Write-Host "  (Cannot determine authentication policies)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Step 6: Checking Conditional Access & MFA..." -ForegroundColor Yellow

try {
    $mfaRequired = Get-User -Identity $UserEmail | Select-Object -ExpandProperty StrongAuthenticationRequirements
    if ($mfaRequired) {
        Write-Host "  ⚠ MFA Enforced:" -ForegroundColor Yellow
        $mfaRequired | ForEach-Object {
            Write-Host "    - $_"
        }
    } else {
        Write-Host "  ✓ No MFA requirement on user" -ForegroundColor Green
    }
} catch {
    Write-Host "  (MFA check skipped)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Step 7: Checking Device Access Rules..." -ForegroundColor Yellow

try {
    $devicePolicy = Get-OrganizationConfig | Select-Object -ExpandProperty BlockLegacyAuthProtocol
    Write-Host ""
    if ($devicePolicy -eq $true) {
        Write-Host "  ✗ Legacy Auth Blocked: YES" -ForegroundColor Red
        Write-Host "     (This affects SMTP basic auth!)" -ForegroundColor Red
    } else {
        Write-Host "  ✓ Legacy Auth Allowed" -ForegroundColor Green
    }
} catch {
    Write-Host "  (Cannot determine legacy auth status)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Step 8: Checking for Any Blocked Domains/IPs..." -ForegroundColor Yellow

try {
    $blockedDomains = Get-HostedContentFilterPolicy | Select-Object -ExpandProperty BlockedSenderDomains
    if ($blockedDomains) {
        Write-Host "  ⚠ Blocked Sender Domains Found:" -ForegroundColor Yellow
        $blockedDomains | ForEach-Object { Write-Host "    - $_" }
    } else {
        Write-Host "  ✓ No blocked domains" -ForegroundColor Green
    }
} catch {
    Write-Host "  (Cannot check blocked domains)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Step 9: DIAGNOSIS SUMMARY" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$issues = @()

if ($smtpDisabled -eq $true) {
    $issues += "❌ SMTP authentication is DISABLED at organization level"
}

if ($casMailbox.SmtpClientAuthenticationDisabled -eq $true) {
    $issues += "❌ SMTP authentication is DISABLED for this user"
}

if ($oauth -eq $false) {
    $issues += "⚠ OAuth2 is disabled (affects modern auth)"
}

if ($issues.Count -eq 0) {
    Write-Host "✓ NO OBVIOUS BLOCKING POLICIES FOUND" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your settings appear correct. The issue might be:"
    Write-Host "  1. Incorrect app password (verify in https://myaccount.microsoft.com/security)"
    Write-Host "  2. Account security restrictions (contact your IT admin)"
    Write-Host "  3. IP-based restrictions (check firewall rules)"
    Write-Host "  4. Third-party email security policy"
    Write-Host "  5. Exchange Online Protection rules"
} else {
    Write-Host "BLOCKING ISSUES FOUND:" -ForegroundColor Red
    Write-Host ""
    foreach ($issue in $issues) {
        Write-Host "  $issue"
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Recommendations:" -ForegroundColor Yellow
Write-Host ""
Write-Host "If SMTP is disabled globally:"
Write-Host "  → Go to: Exchange Admin Center → Mail Flow → SMTP Settings"
Write-Host "  → Enable 'SMTP Client Authentication'"
Write-Host ""
Write-Host "If issue persists:"
Write-Host "  → Contact Microsoft Support with reference: 535 5.7.139 error"
Write-Host "  → Alternative: Switch to SendGrid, AWS SES, or Brevo for email"
Write-Host ""

Disconnect-ExchangeOnline -Confirm:$false -WarningAction SilentlyContinue | Out-Null
Write-Host "Disconnected from Exchange Online." -ForegroundColor Gray
