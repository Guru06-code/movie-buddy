#!/usr/bin/env bash
# =============================================================================
# Movie Buddy — Oracle Cloud Ubuntu Setup Script
# Run once on a fresh Ubuntu 22.04 VM:  bash setup.sh
# =============================================================================
set -euo pipefail

REPO="https://github.com/Guru06-code/movie-buddy.git"
APP_DIR="/opt/movie-buddy"
APP_USER="ubuntu"
NODE_VERSION="24"

GREEN="\033[0;32m"; YELLOW="\033[1;33m"; RED="\033[0;31m"; NC="\033[0m"
info()    { echo -e "${GREEN}[✔]${NC} $1"; }
warn()    { echo -e "${YELLOW}[!]${NC} $1"; }
section() { echo -e "\n${YELLOW}━━━ $1 ━━━${NC}"; }

# Must run as root or with sudo
if [[ $EUID -ne 0 ]]; then
  echo -e "${RED}Run this script with sudo:${NC}  sudo bash setup.sh"
  exit 1
fi

# ── 1. System update ─────────────────────────────────────────────────────────
section "System update"
apt-get update -qq && apt-get upgrade -y -qq
apt-get install -y -qq curl git unzip ufw
info "System packages updated"

# ── 2. Node.js ───────────────────────────────────────────────────────────────
section "Node.js $NODE_VERSION"
if ! command -v node &>/dev/null || [[ "$(node -v | cut -d. -f1 | tr -d 'v')" -lt "$NODE_VERSION" ]]; then
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_VERSION}.x" | bash - > /dev/null 2>&1
  apt-get install -y -qq nodejs
fi
info "Node.js $(node -v) installed"

# ── 3. PM2 process manager ───────────────────────────────────────────────────
section "PM2"
npm install -g pm2 --quiet > /dev/null 2>&1
info "PM2 $(pm2 -v) installed"

# ── 4. Caddy web server ──────────────────────────────────────────────────────
section "Caddy"
if ! command -v caddy &>/dev/null; then
  apt-get install -y -qq debian-keyring debian-archive-keyring apt-transport-https
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
    | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' \
    | tee /etc/apt/sources.list.d/caddy-stable.list > /dev/null
  apt-get update -qq && apt-get install -y -qq caddy
fi
mkdir -p /var/log/caddy && chown caddy:caddy /var/log/caddy
info "Caddy $(caddy version) installed"

# ── 5. Firewall ──────────────────────────────────────────────────────────────
section "Firewall (UFW + iptables)"
# UFW
ufw --force reset > /dev/null 2>&1
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp    comment "SSH"
ufw allow 80/tcp    comment "HTTP"
ufw allow 443/tcp   comment "HTTPS"
ufw --force enable > /dev/null 2>&1
info "UFW configured"

# Oracle Cloud VMs also have kernel iptables rules — open them too
iptables  -I INPUT  6 -m state --state NEW -p tcp --dport 80  -j ACCEPT
iptables  -I INPUT  7 -m state --state NEW -p tcp --dport 443 -j ACCEPT
ip6tables -I INPUT  6 -m state --state NEW -p tcp --dport 80  -j ACCEPT
ip6tables -I INPUT  7 -m state --state NEW -p tcp --dport 443 -j ACCEPT
# Persist iptables across reboots
apt-get install -y -qq iptables-persistent > /dev/null 2>&1
netfilter-persistent save > /dev/null 2>&1
info "iptables rules persisted"

# ── 6. Clone / update app ────────────────────────────────────────────────────
section "App repository"
if [[ -d "$APP_DIR/.git" ]]; then
  warn "Repo already exists — pulling latest changes"
  cd "$APP_DIR" && git pull origin master
else
  git clone "$REPO" "$APP_DIR"
fi
chown -R "$APP_USER:$APP_USER" "$APP_DIR"
info "Repository ready at $APP_DIR"

# ── 7. npm install ───────────────────────────────────────────────────────────
section "npm dependencies"
cd "$APP_DIR"
sudo -u "$APP_USER" npm install --omit=dev --quiet > /dev/null 2>&1
info "Dependencies installed (production only)"

# ── 8. Environment variables ─────────────────────────────────────────────────
section "Environment variables"
ENV_FILE="$APP_DIR/.env"
if [[ ! -f "$ENV_FILE" ]]; then
  cat > "$ENV_FILE" <<'ENVEOF'
# ── Server ──────────────────────────────────────────────────────────────────
HOST=127.0.0.1
PORT=4173
NODE_ENV=production
LOG_LEVEL=info

# ── Turso cloud database ─────────────────────────────────────────────────────
TURSO_DATABASE_URL=libsql://movie-buddy-guru06-code.aws-ap-south-1.turso.io
TURSO_AUTH_TOKEN=PASTE_YOUR_TOKEN_HERE

# ── TMDB (movies) ────────────────────────────────────────────────────────────
TMDB_API_KEY=PASTE_YOUR_KEY_HERE
TMDB_REGION=IN
OMDB_API_KEY=PASTE_YOUR_KEY_HERE

# ── Email (Resend) ───────────────────────────────────────────────────────────
RESEND_API_KEY=PASTE_YOUR_KEY_HERE

# ── SMS (Fast2SMS) ───────────────────────────────────────────────────────────
FAST2SMS_API_KEY=PASTE_YOUR_KEY_HERE

# ── Web Push (VAPID) ─────────────────────────────────────────────────────────
PUSH_VAPID_PUBLIC_KEY=PASTE_YOUR_KEY_HERE
PUSH_VAPID_PRIVATE_KEY=PASTE_YOUR_KEY_HERE
PUSH_VAPID_SUBJECT=mailto:gurupachu0606@gmail.com

# ── Admin ────────────────────────────────────────────────────────────────────
ADMIN_EMAIL=gurupachu0606@gmail.com
ADMIN_PHONE=9113057178

# ── Rate limiting / body ─────────────────────────────────────────────────────
REQUEST_BODY_LIMIT_BYTES=1000000
EXTERNAL_FETCH_TIMEOUT_MS=8000
REMINDER_SCHEDULER_INTERVAL_MS=60000
ENVEOF
  chmod 600 "$ENV_FILE"
  warn "Created $ENV_FILE — EDIT IT NOW and fill in your secret keys before starting the app"
  warn "Run:  nano $ENV_FILE"
else
  info ".env already exists — skipping"
fi

# ── 9. Caddy config ───────────────────────────────────────────────────────────
section "Caddy configuration"
CADDY_DEST="/etc/caddy/Caddyfile"
cp "$APP_DIR/Caddyfile" "$CADDY_DEST"
warn "IMPORTANT: Edit $CADDY_DEST and replace YOUR_DOMAIN with your real domain"
warn "Run:  nano $CADDY_DEST"
info "Caddyfile copied to $CADDY_DEST"

# ── 10. PM2 app start ────────────────────────────────────────────────────────
section "PM2 startup"
cd "$APP_DIR"
# Only start if not already running
if ! sudo -u "$APP_USER" pm2 show movie-buddy &>/dev/null; then
  sudo -u "$APP_USER" pm2 start ecosystem.config.js
else
  warn "App already running — reloading"
  sudo -u "$APP_USER" pm2 reload movie-buddy
fi
# Save PM2 process list
sudo -u "$APP_USER" pm2 save > /dev/null 2>&1
# Configure PM2 to auto-start after reboot
env PATH="$PATH:/usr/bin" pm2 startup systemd -u "$APP_USER" --hp "/home/$APP_USER" 2>&1 \
  | grep "systemctl" | bash || true
info "PM2 configured to start on reboot"

# ── 11. Caddy start ──────────────────────────────────────────────────────────
section "Caddy start"
systemctl enable caddy > /dev/null 2>&1
# Don't start Caddy yet — user needs to set the domain in Caddyfile first
warn "Caddy is NOT started yet — set your domain first:"
warn "  1. nano /etc/caddy/Caddyfile   (replace YOUR_DOMAIN)"
warn "  2. sudo systemctl start caddy"
warn "  3. sudo systemctl status caddy  (check it's running)"

# ── Done ─────────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  Setup complete! Two things left before the app goes live:${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  ${YELLOW}1. Fill in secret keys:${NC}"
echo -e "       nano $ENV_FILE"
echo -e "       sudo -u ubuntu pm2 restart all"
echo ""
echo -e "  ${YELLOW}2. Set your domain and start Caddy:${NC}"
echo -e "       nano /etc/caddy/Caddyfile   (replace YOUR_DOMAIN)"
echo -e "       sudo systemctl start caddy"
echo ""
echo -e "  ${YELLOW}App health check:${NC}  curl http://localhost:4173/api/auth/session"
echo -e "  ${YELLOW}View app logs:${NC}     pm2 logs movie-buddy"
echo -e "  ${YELLOW}Update app:${NC}        cd $APP_DIR && git pull && npm install --omit=dev && pm2 reload all"
echo ""
