#!/bin/bash
#
# Build accel-ppp .ipk packages for OpenWrt 24.10.5 ipq806x
# Features: IPoE, VLAN monitor, Lua 5.1, VRF, PCRE2
# Source: BilcomTT/accel-ppp (RADIUSdesk fork)
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
WORK_DIR="${WORK_DIR:-/home/user/openwrt-build}"
SDK_URL="https://downloads.openwrt.org/releases/24.10.5/targets/ipq806x/generic/openwrt-sdk-24.10.5-ipq806x-generic_gcc-13.3.0_musl_eabi.Linux-x86_64.tar.zst"
SDK_DIR_NAME="openwrt-sdk-24.10.5-ipq806x-generic_gcc-13.3.0_musl_eabi.Linux-x86_64"
SDK_ARCHIVE="$(basename "${SDK_URL}")"
NPROC=$(nproc)

echo "============================================"
echo " accel-ppp OpenWrt .ipk builder"
echo " Target: ipq806x (OpenWrt 24.10.5)"
echo " Features: IPoE, VLAN mon, Lua 5.1, VRF, PCRE2"
echo " Source: BilcomTT/accel-ppp (RADIUSdesk fork)"
echo "============================================"
echo ""

# --- Step 1: Install host dependencies ---
echo "[1/6] Installing host build dependencies..."
sudo apt-get update -qq
sudo apt-get install -y --no-install-recommends \
    build-essential \
    gawk \
    unzip \
    file \
    python3 \
    python3-distutils \
    rsync \
    wget \
    zstd \
    git \
    libncurses-dev \
    2>&1 | tail -3

# --- Step 2: Download and extract SDK ---
echo "[2/6] Setting up OpenWrt SDK..."
mkdir -p "${WORK_DIR}"
cd "${WORK_DIR}"

if [ ! -d "${SDK_DIR_NAME}" ]; then
    if [ ! -f "${SDK_ARCHIVE}" ]; then
        echo "  Downloading SDK (~400MB)..."
        wget -q --show-progress "${SDK_URL}" -O "${SDK_ARCHIVE}"
    fi
    echo "  Extracting SDK..."
    tar --zstd -xf "${SDK_ARCHIVE}"
fi

SDK_PATH="${WORK_DIR}/${SDK_DIR_NAME}"
cd "${SDK_PATH}"

# --- Step 3: Set up package feed ---
echo "[3/6] Setting up accel-ppp package feed..."

# Create custom feed pointing to our package directory
mkdir -p "${SDK_PATH}/custom-feed/net"
# Copy our package definition
cp -a "${SCRIPT_DIR}/package/net/accel-ppp" "${SDK_PATH}/custom-feed/net/"

# Add the custom feed
if ! grep -q "custom-feed" feeds.conf.default 2>/dev/null; then
    echo "src-link custom ${SDK_PATH}/custom-feed" >> feeds.conf.default
fi

# Also ensure standard packages feed is available for dependencies
if ! grep -q "^src-git packages" feeds.conf.default 2>/dev/null; then
    echo "src-git packages https://git.openwrt.org/feed/packages.git;openwrt-24.10" >> feeds.conf.default
fi

# Update and install feeds
echo "  Updating feeds..."
./scripts/feeds update -a 2>&1 | tail -3
echo "  Installing feeds..."
./scripts/feeds install -a 2>&1 | tail -3

# --- Step 4: Configure ---
echo "[4/6] Configuring build..."

# Start with default config for ipq806x
make defconfig 2>&1 | tail -3

# Enable our packages
cat >> .config <<'OPENWRT_CONFIG'
CONFIG_PACKAGE_accel-ppp=y
CONFIG_PACKAGE_kmod-accel-ppp-ipoe=y
CONFIG_PACKAGE_kmod-accel-ppp-vlan-mon=y
OPENWRT_CONFIG

# Expand config
make defconfig 2>&1 | tail -3

# --- Step 5: Build ---
echo "[5/6] Building accel-ppp packages (this may take a while)..."

# First ensure the toolchain and kernel headers are available
make tools/install -j"${NPROC}" 2>&1 | tail -5 || true
make toolchain/install -j"${NPROC}" 2>&1 | tail -5 || true
make target/linux/compile -j"${NPROC}" 2>&1 | tail -5 || true

# Build the accel-ppp packages
make package/accel-ppp/compile V=s -j"${NPROC}" 2>&1 | tee "${WORK_DIR}/build.log" | tail -30

# --- Step 6: Collect artifacts ---
echo "[6/6] Collecting .ipk packages..."

OUTPUT_DIR="${WORK_DIR}/ipk-output"
mkdir -p "${OUTPUT_DIR}"

# Find and copy all generated .ipk files
find "${SDK_PATH}/bin" -name "accel-ppp*.ipk" -exec cp {} "${OUTPUT_DIR}/" \;
find "${SDK_PATH}/bin" -name "kmod-accel-ppp*.ipk" -exec cp {} "${OUTPUT_DIR}/" \;

echo ""
echo "============================================"
echo " Build complete!"
echo "============================================"
echo ""
echo "Generated .ipk packages:"
ls -lh "${OUTPUT_DIR}/"*.ipk 2>/dev/null || echo "  (check ${WORK_DIR}/build.log for errors)"
echo ""
echo "Install on OpenWrt device:"
echo "  scp ${OUTPUT_DIR}/*.ipk root@<router-ip>:/tmp/"
echo "  ssh root@<router-ip>"
echo "  opkg install /tmp/accel-ppp*.ipk"
echo "  opkg install /tmp/kmod-accel-ppp-ipoe*.ipk"
echo "  opkg install /tmp/kmod-accel-ppp-vlan-mon*.ipk"
echo ""
echo "Build log: ${WORK_DIR}/build.log"
