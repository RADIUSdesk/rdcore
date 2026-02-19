# CLAUDE.md — accel-ppp OpenWrt Build Guide

## Overview

This repo (rdcore / RADIUSdesk) includes tooling to build **accel-ppp** `.ipk` packages for OpenWrt, using the RADIUSdesk fork at https://github.com/RADIUSdesk/accel-ppp/tree/main.

The RADIUSdesk fork is based on an older snapshot of upstream [accel-ppp/accel-ppp](https://github.com/accel-ppp/accel-ppp) with RADIUSdesk-specific modifications applied on top. The primary task when maintaining this build is **porting those RADIUSdesk modifications forward** onto newer upstream accel-ppp releases.

## Repository Layout

```
rdcore/
├── build-accel-ppp.sh                          # Ubuntu/Debian native build (upstream)
└── openwrt/
    ├── build-ipk.sh                            # Automated .ipk builder (downloads SDK, builds)
    └── package/net/accel-ppp/
        ├── Makefile                            # OpenWrt package recipe
        ├── files/accel-ppp.init                # procd init script for router
        └── patches/
            ├── 010-fix-cmake-pcre2-musl-compat.patch  # Build system fixes
            └── 020-migrate-pcre1-to-pcre2.patch       # PCRE v1 → PCRE2 migration
```

## Source Repos

| Repo | Role |
|------|------|
| `accel-ppp/accel-ppp` (upstream) | Canonical source. Actively maintained. Latest: v1.14.0. Uses PCRE2, modern CMake. |
| `RADIUSdesk/accel-ppp` | RADIUSdesk fork. Based on older upstream (~2022 snapshot). Has 14 commits of RADIUSdesk-specific mods. Dormant since Nov 2023. Uses PCRE v1. |
| `BilcomTT/accel-ppp` | Identical mirror/fork of RADIUSdesk/accel-ppp. Same 14 commits. |

The OpenWrt Makefile fetches from `BilcomTT/accel-ppp` at a pinned commit, then applies the patches in `openwrt/package/net/accel-ppp/patches/`.

## RADIUSdesk Modifications (What Must Be Preserved)

These are the features the RADIUSdesk fork adds on top of upstream. When porting to a new upstream version, **every one of these must be carried forward**.

### RADIUS Enhancements
| Feature | Files | Description |
|---------|-------|-------------|
| **blast-protection** | `radius/req.c`, `radius/packet.c`, `radius/radius.c`, `radius/radius_p.h` | Adds Message-Authenticator HMAC-MD5 to Access-Request packets (BlastRADIUS mitigation). Config: `blast-protection=1` |
| **IPv6 RADIUS server** | `radius/serv.c`, `radius/req.c`, `radius/radius_p.h`, `radius/radius.h` | Full IPv6 server address support. Adds `addr6`, `ipv4` flag to `rad_server_t`. Uses `AF_INET6` sockets. |
| **dae-allowed** | `radius/radius.c`, `radius/dm_coa.c` | IP allowlist for CoA/DM packets. Config: `dae-allowed=10.0.0.0/8,192.168.1.1` |
| **framed-route-strict** | `radius/radius.c` | Rejects Framed-Route with non-zero host bits. Rewritten route parser with CIDR support. |
| **Accounting stats source** | `radius/acct.c` | Reads cached session stats instead of calling `rtnl_link_stats64` on each accounting packet. |

### Protocol Features
| Feature | Files | Description |
|---------|-------|-------------|
| **L2TP Calling/Called-Number AVP** | `ctrl/l2tp/l2tp.c` | Preserves L2TP Calling-Number and Called-Number AVPs as `calling_station_id`/`called_station_id` instead of falling back to IP addresses. |
| **DHCPv6 AFTR-Name (DS-Lite)** | `ipv6/dhcpv6.c`, `ipv6/dhcpv6.h`, `ipv6/dhcpv6_packet.c` | DHCPv6 option 64 for DS-Lite AFTR gateway. Config: `aftr-gw=<fqdn>` |
| **DHCPv6 Confirm handler** | `ipv6/dhcpv6.c` | Handles DHCPv6 Confirm (D6_CONFIRM) messages. |
| **IPoE per-server check-mac-change** | `ctrl/ipoe/ipoe.c`, `ctrl/ipoe/ipoe.h` | `check-mac-change` option settable per IPoE server. Adds `opt_check_mac_change` field. |
| **vlan_timeout default** | `ctrl/pppoe/pppoe.c`, `ctrl/ipoe/ipoe.c` | Default `vlan-timeout=60`. Setting `vlan-timeout=0` disables the timer. |

### Shaper / Traffic Control
| Feature | Files | Description |
|---------|-------|-------------|
| **clsact policer** | `shaper/limiter.c`, `shaper/shaper.c`, `shaper/shaper.h` | New `LIM_CLSACT=3` limiter type using `clsact` qdisc with `matchall` + `police` action. |

### Networking / VRF
| Feature | Files | Description |
|---------|-------|-------------|
| **VRF route tables** | `libnetlink/iputils.c`, `libnetlink/iputils.h`, `ifcfg.c` | All route functions gain `vrf_name` parameter. New `ipvrf_get_table()` resolves VRF name → table ID via netlink. |

### CLI / Management
| Feature | Files | Description |
|---------|-------|-------------|
| **show ippool** | `extra/ippool.c` | New CLI command showing per-pool stats (total, used, available, usage %). |
| **gw-ip/mask parse fix** | `extra/ippool.c`, `extra/chap-secrets.c` | Correctly strips `/mask` suffix from gateway IP addresses. |

### Code Quality / Portability
| Feature | Files | Description |
|---------|-------|-------------|
| **Crypto abstraction removal** | `auth/*.c`, `radius/*.c`, `ctrl/l2tp/packet.c`, `ctrl/sstp/sstp.c`, `extra/chap-secrets.c` | Removed `crypto.h` indirection; uses OpenSSL headers directly. |
| **Atomic op portability** | `session.c` | `__sync_add_and_fetch()` instead of `__sync_add_and_fetch_4()` (ARM compat). |
| **ppp.c init_layers error handling** | `ppp/ppp.c` | Returns error code on allocation failure instead of silent continue. |
| **ppp_lcp.c alignment safety** | `ppp/ppp_lcp.c` | `memcpy()` for magic number instead of pointer cast. MTU bounds check. |
| **mempool size_t** | `triton/mempool.c`, `triton/mempool.h`, `include/triton.h` | `uint32_t` → `size_t` for allocation sizes. `uint64_t` for stats. |
| **log_tcp.c leak fix** | `logs/log_tcp.c` | `free(opt)` after parsing TCP log destination. |
| **sockaddr cast fixes** | Multiple files | Missing `(struct sockaddr *)` casts on bind/connect/sendto calls. |

## Build Patches (Applied on Top of Fork)

The `openwrt/package/net/accel-ppp/patches/` directory contains patches that fix issues in the RADIUSdesk fork needed for modern builds:

### 010-fix-cmake-pcre2-musl-compat.patch
Modifies: `CMakeLists.txt`, `accel-pppd/CMakeLists.txt`, `accel-pppd/extra/CMakeLists.txt`

- CMake minimum version 2.6 → 3.10
- PCRE library detection: `libpcre` → `libpcre2-8`
- Linker: `pcre` → `pcre2-8` in `TARGET_LINK_LIBRARIES`
- MUSL libc detection (`ldd --version` check)
- Conditional `ucontext` linking (checks `getcontext`/`setcontext` exist)
- MUSL compat probes: `HAVE_FREE_FN_T`, `HAVE_GOOD_IFARP`, `HAVE_LOGWTMP`, `HAVE_PRINTF_H`
- Conditional `logwtmp` build (skipped on MUSL)
- Out-of-source build enforcement

### 020-migrate-pcre1-to-pcre2.patch
Modifies: `cli/cli.h`, `cli/cli.c`, `cli/std_cmd.c`, `cli/show_sessions.c`, `ctrl/ipoe/ipoe.c`, `ctrl/ipoe/arp.c`, `ctrl/pppoe/pppoe.c`

- `#include <pcre.h>` → `#define PCRE2_CODE_UNIT_WIDTH 8` + `#include <pcre2.h>`
- `pcre *` → `pcre2_code *`
- `pcre_compile2()` → `pcre2_compile()`
- `pcre_exec()` → `pcre2_match()` with `pcre2_match_data` alloc/free
- `pcre_free()` → `pcre2_code_free()`
- Error strings → `pcre2_get_error_message()`
- Adds missing `#include <linux/if_arp.h>` for `ARPOP_REQUEST`

## How to Build .ipk Packages

### Prerequisites
Ubuntu 22.04+ with: `build-essential gawk unzip python3 rsync wget zstd git libncurses-dev`

### Quick Build
```bash
cd rdcore
./openwrt/build-ipk.sh
```

This downloads the OpenWrt 24.10.5 SDK for `ipq806x`, sets up the package feed, and produces three `.ipk` files:
- `accel-ppp_*.ipk` — daemon + all plugins
- `kmod-accel-ppp-ipoe_*.ipk` — IPoE kernel module
- `kmod-accel-ppp-vlan-mon_*.ipk` — VLAN monitor kernel module

### Install on Router
```bash
scp /home/user/openwrt-build/ipk-output/*.ipk root@<router>:/tmp/
ssh root@<router> "opkg install /tmp/accel-ppp*.ipk /tmp/kmod-accel-ppp*.ipk"
```

### CMake Feature Flags
The Makefile enables these features:
```
-DLUA=TRUE                    # Lua 5.1 scripting
-DRADIUS=TRUE                 # RADIUS authentication
-DSHAPER=TRUE                 # Traffic shaping (includes clsact)
-DCRYPTO=OPENSSL              # OpenSSL crypto
-DBUILD_IPOE_DRIVER=TRUE      # IPoE kernel module
-DBUILD_VLAN_MON_DRIVER=TRUE  # VLAN monitor kernel module
-DKDIR=$(LINUX_DIR)           # Kernel headers for module build
```

VRF support is auto-detected from kernel headers (`HAVE_VRF`).

## Porting RADIUSdesk Modifications to a New Upstream Version

This is the primary maintenance workflow. When upstream accel-ppp releases a new version, here is how to port the RADIUSdesk modifications forward.

### Step 1: Understand What Changed Upstream

```bash
# Clone both repos
git clone https://github.com/accel-ppp/accel-ppp.git upstream
git clone https://github.com/RADIUSdesk/accel-ppp.git radiusdesk

# See upstream changes since the fork point
cd upstream
git log --oneline v1.12.0..v1.14.0 -- accel-pppd/
```

Pay special attention to upstream changes in files that the RADIUSdesk fork also modifies (see the file lists in the feature table above). Conflicts will occur in these files.

### Step 2: Identify the RADIUSdesk Delta

The RADIUSdesk fork has 14 commits on top of an older upstream snapshot. The bulk of modifications were applied in two commits:

| Commit | Description | Scope |
|--------|-------------|-------|
| `2653fb7` | "Work with latest code" | **Major**: 40+ files. Contains ALL the feature additions (blast-protection, IPv6 RADIUS, VRF, clsact, DS-Lite, etc.) |
| `797fa72` | "Manually apply some patches" | **Medium**: 7 files. MUSL/OpenWrt compat patches. |
| `6ca91b1`..`115358c` | Various link/arp fixes | **Minor**: Individual linker and build fixes. |

To see the complete RADIUSdesk delta from the initial upstream import:
```bash
cd radiusdesk
git diff 3ad93b7..HEAD        # Full diff: initial import → final state
git diff 3ad93b7..HEAD --stat # Summary of changed files
```

### Step 3: Create a New Fork from Latest Upstream

```bash
git clone https://github.com/accel-ppp/accel-ppp.git new-accel-ppp
cd new-accel-ppp
git checkout -b radiusdesk-mods v1.14.0   # or whatever the latest tag is
```

### Step 4: Port Modifications by Category

Port changes **by feature area**, not by commit. The RADIUSdesk commits are messy (mix of features, fixes, and experiments). Port cleanly by feature:

**Order of porting (least conflict → most):**

1. **Standalone additions** (no upstream conflict expected):
   - `radius/` blast-protection, IPv6 server, dae-allowed, framed-route-strict
   - `ipv6/dhcpv6.c` AFTR-Name and Confirm handler
   - `shaper/` clsact limiter
   - `extra/ippool.c` show ippool CLI
   - `extra/ippool.c`, `extra/chap-secrets.c` gw-ip/mask fix
   - `extra/pppd_compat.c` ATTR_TYPE_IFID

2. **Already upstreamed** (check if upstream has equivalent):
   - PCRE2 migration — **upstream already did this**. Skip.
   - VRF support — **upstream already added HAVE_VRF**. Compare implementations.
   - MUSL compat (HAVE_FREE_FN_T, etc.) — **upstream already added these**. Skip.
   - Conditional ucontext — **upstream already fixed this**. Skip.
   - mempool size_t fix — **upstream already fixed**. Skip.
   - ppp_lcp.c alignment fix — **upstream may have fixed**. Check.

3. **Likely to conflict** (upstream changed same files):
   - `ctrl/ipoe/ipoe.c` — per-server check-mac-change, vlan_timeout changes
   - `ctrl/pppoe/pppoe.c` — vlan_timeout changes
   - `ctrl/l2tp/l2tp.c` — Calling/Called-Number AVP
   - `session.c` — atomic ops

4. **Crypto abstraction removal** — **skip entirely** if upstream already removed `crypto.h`. Check with:
   ```bash
   ls upstream/crypto/    # If directory is gone, upstream already removed it
   grep -r "crypto.h" upstream/accel-pppd/auth/   # If no hits, already cleaned up
   ```

### Step 5: Port Each Feature

For each feature, use the RADIUSdesk fork as reference and apply changes to the new upstream base:

```bash
# Example: porting blast-protection
# Look at what RADIUSdesk changed in radius/req.c
cd radiusdesk
git diff 3ad93b7..HEAD -- accel-pppd/radius/req.c

# Apply those same logical changes to the new upstream file
cd ../new-accel-ppp
# Edit accel-pppd/radius/req.c with the blast-protection additions
```

For each feature, make a **separate commit** with a clear message:
```bash
git commit -m "radiusdesk: add blast-protection (Message-Authenticator in Access-Request)"
```

### Step 6: Regenerate Build Patches

After porting, check which of our current patches are still needed:

- **010 (CMake/MUSL)**: Likely **not needed** if porting to v1.14.0+ (upstream already has PCRE2, MUSL compat, modern CMake). May need only minor OpenWrt-specific tweaks.
- **020 (PCRE2 migration)**: **Not needed** — upstream v1.14.0 already uses PCRE2.

If the new upstream base already includes the fixes from our patches, delete the patches. If new OpenWrt-specific fixes are needed, create new patches.

### Step 7: Update the OpenWrt Makefile

Edit `openwrt/package/net/accel-ppp/Makefile`:

```makefile
PKG_VERSION:=1.14.0                    # Update version
PKG_SOURCE_URL:=https://github.com/RADIUSdesk/accel-ppp.git  # Or new fork URL
PKG_SOURCE_VERSION:=<new commit hash>  # Pin to specific commit
```

### Step 8: Test Build

```bash
# Quick test on Ubuntu first (native build)
cd new-accel-ppp
mkdir build && cd build
cmake -DLUA=TRUE -DBUILD_IPOE_DRIVER=TRUE -DBUILD_VLAN_MON_DRIVER=TRUE \
      -DKDIR=/usr/src/linux-headers-$(uname -r) -DCRYPTO=OPENSSL \
      -DCMAKE_INSTALL_PREFIX=/usr ..
make -j$(nproc)

# Then cross-compile for OpenWrt
cd rdcore
./openwrt/build-ipk.sh
```

### Step 9: Verify Features

After building, verify the RADIUSdesk features are present:
```bash
# Check for blast-protection config option
grep -r "blast.protection" accel-pppd/radius/
# Check for dae-allowed
grep -r "dae.allowed" accel-pppd/radius/
# Check for clsact
grep -r "clsact\|LIM_CLSACT" accel-pppd/shaper/
# Check for AFTR
grep -r "AFTR\|aftr" accel-pppd/ipv6/
# Check for VRF
grep -r "vrf_name\|HAVE_VRF" accel-pppd/libnetlink/ accel-pppd/ifcfg.c
# Check for IPv6 RADIUS
grep -r "addr6\|AF_INET6" accel-pppd/radius/serv.c accel-pppd/radius/req.c
```

## Target Platform

| Setting | Value |
|---------|-------|
| OpenWrt version | 24.10.5 |
| Target | ipq806x/generic |
| Toolchain | GCC 13.3.0, musl eabi |
| Arch | ARM Cortex-A15 + NEON VFPv4 |
| SDK | `openwrt-sdk-24.10.5-ipq806x-generic_gcc-13.3.0_musl_eabi.Linux-x86_64.tar.zst` |

## Common Issues

### MUSL libc (OpenWrt)
- No `logwtmp()` → guarded by `HAVE_LOGWTMP`
- No `getcontext()`/`setcontext()` → conditional linking
- No `<printf.h>` → guarded by `HAVE_PRINTF_H`
- `<linux/if_arp.h>` conflicts with `<net/if_arp.h>` → guarded by `HAVE_GOOD_IFARP`
- No `__free_fn_t` → guarded by `HAVE_FREE_FN_T`

### PCRE v1 vs PCRE2
The RADIUSdesk fork uses PCRE v1 API. Upstream v1.14.0+ uses PCRE2. If porting to modern upstream, the PCRE migration is already done — no patch needed. If building the old fork as-is, patch 020 is required.

### Kernel Module Cross-Compilation
The kernel modules (`ipoe.ko`, `vlan_mon.ko`) are built via CMake custom commands that invoke `make -C ${KDIR}`. The `ARCH` and `CROSS_COMPILE` environment variables must be set for the kernel build. The OpenWrt Makefile handles this via `MAKE_FLAGS`.

### OpenSSL Deprecation Warnings
The fork uses deprecated OpenSSL 3.0 APIs (`MD5_Init`, `SHA1_Update`, etc.). These produce warnings but compile and link correctly. A future port could migrate to the EVP API.
