#!/bin/bash
#
# Build accel-ppp from source with IPoE, VLAN monitor, Lua 5.1, VRF, and PCRE2
# Target: Ubuntu 24.04 (Noble)
#
set -euo pipefail

ACCEL_PPP_REPO="https://github.com/accel-ppp/accel-ppp.git"
ACCEL_PPP_DIR="/home/user/accel-ppp"
BUILD_DIR="${ACCEL_PPP_DIR}/build"
KVER="${KVER:-$(apt-cache search linux-headers-.*-generic | sort -V | tail -1 | awk '{print $1}' | sed 's/linux-headers-//')}"
KDIR="/usr/src/linux-headers-${KVER}"
NPROC=$(nproc)

echo "============================================"
echo " accel-ppp build script"
echo " Target kernel: ${KVER}"
echo " Features: IPoE, VLAN mon, Lua 5.1, VRF, PCRE2"
echo "============================================"

# --- Install dependencies ---
echo "[1/5] Installing build dependencies..."
apt-get update -qq
apt-get install -y --no-install-recommends \
    build-essential \
    cmake \
    git \
    libssl-dev \
    libpcre2-dev \
    liblua5.1-0-dev \
    lua5.1 \
    "linux-headers-${KVER}" \
    libnetfilter-conntrack-dev \
    libnetfilter-acct-dev

# --- Clone source ---
echo "[2/5] Cloning accel-ppp source..."
if [ -d "${ACCEL_PPP_DIR}" ]; then
    echo "  Source directory already exists, pulling latest..."
    cd "${ACCEL_PPP_DIR}" && git pull --ff-only || true
else
    git clone "${ACCEL_PPP_REPO}" "${ACCEL_PPP_DIR}"
fi

# --- Configure ---
echo "[3/5] Configuring CMake..."
mkdir -p "${BUILD_DIR}"
cd "${BUILD_DIR}"

cmake \
    -DLUA=TRUE \
    -DBUILD_IPOE_DRIVER=TRUE \
    -DBUILD_VLAN_MON_DRIVER=TRUE \
    -DKDIR="${KDIR}" \
    -DCPACK_TYPE=Ubuntu24 \
    -DCMAKE_INSTALL_PREFIX=/usr \
    ..

# --- Build ---
echo "[4/5] Compiling with ${NPROC} jobs..."
make -j"${NPROC}"

# --- Package ---
echo "[5/5] Building .deb package..."
cpack -G DEB

echo ""
echo "============================================"
echo " Build complete!"
echo "============================================"
echo ""
echo "Artifacts:"
echo "  Binary:      ${BUILD_DIR}/accel-pppd/accel-pppd"
echo "  accel-cmd:   ${BUILD_DIR}/accel-cmd/accel-cmd"
echo "  IPoE module: ${BUILD_DIR}/drivers/ipoe/driver/ipoe.ko"
echo "  VLAN mon:    ${BUILD_DIR}/drivers/vlan_mon/driver/vlan_mon.ko"
echo "  Lua plugin:  ${BUILD_DIR}/accel-pppd/lua/libluasupp.so"
echo "  IPoE ctrl:   ${BUILD_DIR}/accel-pppd/ctrl/ipoe/libipoe.so"
echo "  VLAN mon UL: ${BUILD_DIR}/accel-pppd/vlan-mon/libvlan-mon.so"
echo "  .deb:        ${BUILD_DIR}/accel-ppp.deb"
echo ""
echo "Install with:  dpkg -i ${BUILD_DIR}/accel-ppp.deb"
echo ""
echo "Kernel modules (ipoe.ko, vlan_mon.ko) are compiled for kernel ${KVER}."
echo "Load them with:"
echo "  insmod ${BUILD_DIR}/drivers/ipoe/driver/ipoe.ko"
echo "  insmod ${BUILD_DIR}/drivers/vlan_mon/driver/vlan_mon.ko"
