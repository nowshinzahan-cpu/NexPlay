# test.ps1
# Complete NexPlay setup script — runs all seeds and starts dev servers

Clear-Host

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   NexPlay — Full Setup & Seed Script    " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ── 1. Core Seed: Users, Companies, Admins ────
Write-Host "▶ Step 1/5: Running core database seed (users, companies, admins)..." -ForegroundColor Yellow
npm run seed
if ($LASTEXITCODE -ne 0) {
    Write-Host "✘ npm run seed failed!" -ForegroundColor Red
    exit $LASTEXITCODE
}
Write-Host "✔ Core seed complete" -ForegroundColor Green
Write-Host ""

# ── 2. Content Seed: Entertainment Content ────
Write-Host "▶ Step 2/5: Running content seed (movies, series, etc.)..." -ForegroundColor Yellow
npm run seed:content
if ($LASTEXITCODE -ne 0) {
    Write-Host "✘ npm run seed:content failed!" -ForegroundColor Red
    exit $LASTEXITCODE
}
Write-Host "✔ Content seed complete" -ForegroundColor Green
Write-Host ""

# ── 3. Badge Seed: Gamification Badges ────────
Write-Host "▶ Step 3/5: Running badge seed (gamification badges)..." -ForegroundColor Yellow
npm run seed:badges
if ($LASTEXITCODE -ne 0) {
    Write-Host "✘ npm run seed:badges failed!" -ForegroundColor Red
    exit $LASTEXITCODE
}
Write-Host "✔ Badge seed complete" -ForegroundColor Green
Write-Host ""

# ── 4. New Models Seed: Sprint 3/4 ────────────
Write-Host "▶ Step 4/5: Running new models seed (matches, broadcasters, discussions, etc.)..." -ForegroundColor Yellow
npm run seed:new
if ($LASTEXITCODE -ne 0) {
    Write-Host "✘ npm run seed:new failed!" -ForegroundColor Red
    exit $LASTEXITCODE
}
Write-Host "✔ New models seed complete" -ForegroundColor Green
Write-Host ""

# ── 5. Start Dev Servers ──────────────────────
Write-Host "▶ Step 5/5: Starting development servers..." -ForegroundColor Yellow
Write-Host "   • Backend:  http://localhost:5000" -ForegroundColor Cyan
Write-Host "   • Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   All seeds complete! Starting dev...  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
npm run dev