#!/bin/bash

# Debian VM Setup Script - All-in-one operations
# Usage: ./debian-setup.sh [command]
# Commands: install-app, update-app, check-status, setup-ssh

DEBIAN_HOST="debian.tailc77df.ts.net"
DEBIAN_USER="ab"
APP_DIR="sigenergy-battery"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check SSH connection
check_ssh() {
    print_status "Checking SSH connection to Debian VM..."
    if ssh -o ConnectTimeout=5 -o BatchMode=yes $DEBIAN_USER@$DEBIAN_HOST "echo 'SSH connection successful'" 2>/dev/null; then
        print_success "SSH connection working"
        return 0
    else
        print_error "SSH connection failed"
        return 1
    fi
}

# Function to setup SSH auto-login
setup_ssh() {
    print_status "Setting up SSH auto-login..."
    
    # Generate SSH key if it doesn't exist
    if [ ! -f ~/.ssh/debian_key ]; then
        print_status "Generating SSH key..."
        ssh-keygen -t ed25519 -C "$DEBIAN_USER@debian" -f ~/.ssh/debian_key -N "" -q
    fi
    
    # Copy public key to Debian VM
    print_status "Copying SSH key to Debian VM..."
    ssh-copy-id -i ~/.ssh/debian_key.pub $DEBIAN_USER@$DEBIAN_HOST
    
    # Setup SSH config
    print_status "Setting up SSH config..."
    mkdir -p ~/.ssh
    cat >> ~/.ssh/config << EOF

Host debian
  HostName $DEBIAN_HOST
  User $DEBIAN_USER
  Port 22
  IdentityFile ~/.ssh/debian_key
  IdentitiesOnly yes
  ServerAliveInterval 60
  ServerAliveCountMax 3
EOF
    
    chmod 700 ~/.ssh
    chmod 600 ~/.ssh/config ~/.ssh/debian_key
    
    print_success "SSH auto-login setup complete"
}

# Function to sync local app to Debian VM
sync_app() {
    print_status "Syncing local app to Debian VM..."
    
    # Create backup of existing app
    ssh debian "if [ -d $APP_DIR ]; then mv $APP_DIR ${APP_DIR}_backup_\$(date +%Y%m%d_%H%M%S); fi"
    
    # Copy current app
    scp -r . debian:~/temp_$APP_DIR
    
    # Replace existing app
    ssh debian "rm -rf $APP_DIR && mv temp_$APP_DIR $APP_DIR"
    
    print_success "App synced to Debian VM"
}

# Function to install dependencies
install_deps() {
    print_status "Installing dependencies on Debian VM..."
    ssh debian "cd $APP_DIR && npm install"
    print_success "Dependencies installed"
}

# Function to install app on Homey
install_app() {
    print_status "Installing app on Homey..."
    ssh debian "cd $APP_DIR && homey app install"
    print_success "App installed on Homey"
}

# Function to check app status
check_status() {
    print_status "Checking app status..."
    
    echo "=== Local App Status ==="
    echo "Version: $(grep '"version"' package.json | cut -d'"' -f4)"
    echo "Drivers: $(ls src/drivers/ | wc -l)"
    
    echo -e "\n=== Debian VM Status ==="
    if ssh debian "test -d $APP_DIR"; then
        ssh debian "cd $APP_DIR && grep '\"version\"' package.json | cut -d'\"' -f4"
        ssh debian "cd $APP_DIR && ls src/drivers/ | wc -l"
    else
        echo "App directory not found on Debian VM"
    fi
    
    echo -e "\n=== Homey Status ==="
    ssh debian "homey app list 2>/dev/null | grep sigenergy || echo 'App not found on Homey (or homey CLI issue)'"
}

# Function to update app (sync + install)
update_app() {
    print_status "Updating app..."
    sync_app
    install_deps
    install_app
    print_success "App update complete"
}

# Function to install app (full process)
install_app_full() {
    print_status "Installing app (full process)..."
    sync_app
    install_deps
    install_app
    print_success "App installation complete"
}

# Main script logic
case "${1:-help}" in
    "setup-ssh")
        setup_ssh
        ;;
    "sync-app")
        check_ssh && sync_app
        ;;
    "install-deps")
        check_ssh && install_deps
        ;;
    "install-app")
        check_ssh && install_app
        ;;
    "install-app-full")
        check_ssh && install_app_full
        ;;
    "update-app")
        check_ssh && update_app
        ;;
    "check-status")
        check_ssh && check_status
        ;;
    "help"|*)
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  setup-ssh      - Setup SSH auto-login"
        echo "  sync-app       - Sync local app to Debian VM"
        echo "  install-deps   - Install dependencies on Debian VM"
        echo "  install-app    - Install app on Homey (requires deps)"
        echo "  install-app-full - Full install process (sync + deps + install)"
        echo "  update-app     - Update app (sync + deps + install)"
        echo "  check-status   - Check status of local, Debian VM, and Homey"
        echo "  help           - Show this help"
        echo ""
        echo "Examples:"
        echo "  $0 setup-ssh        # First time setup"
        echo "  $0 install-app-full # Complete installation"
        echo "  $0 update-app       # Update existing installation"
        ;;
esac
