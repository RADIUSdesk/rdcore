#
# Copyright (C) 2024-2026 BilcomTT / RADIUSdesk
#
# This is free software, licensed under the GNU General Public License v2.
#

include $(TOPDIR)/rules.mk
include $(INCLUDE_DIR)/kernel.mk

PKG_NAME:=accel-ppp
PKG_VERSION:=1.12.0
PKG_RELEASE:=1

PKG_SOURCE_PROTO:=git
PKG_SOURCE_URL:=https://github.com/BilcomTT/accel-ppp.git
PKG_SOURCE_VERSION:=115358c07ac58440b2e9e4e98a1416e416e0a82b
PKG_MIRROR_HASH:=skip

PKG_LICENSE:=GPL-2.0
PKG_LICENSE_FILES:=COPYING

PKG_BUILD_DIR:=$(BUILD_DIR)/$(PKG_NAME)-$(PKG_VERSION)

include $(INCLUDE_DIR)/package.mk
include $(INCLUDE_DIR)/cmake.mk

define Package/accel-ppp
  SECTION:=net
  CATEGORY:=Network
  TITLE:=High performance VPN server (RADIUSdesk fork)
  DEPENDS:=+libpcre2 +liblua5.1 +libopenssl +libpthread +librt +libnetfilter-conntrack +libnetfilter-acct
  URL:=https://github.com/BilcomTT/accel-ppp
  MAINTAINER:=BilcomTT
endef

define Package/accel-ppp/description
  High performance PPTP/L2TP/PPPoE/IPoE/SSTP server.
  BilcomTT fork with RADIUSdesk integration features:
  - BlastRADIUS protection (Message-Authenticator)
  - IPv6 RADIUS server support
  - VRF route table support
  - clsact traffic shaper
  - DS-Lite AFTR-Name (DHCPv6 option 64)
  - DAE source IP restriction (dae-allowed)
  - L2TP Calling/Called-Number AVP preservation
  - per-server check-mac-change for IPoE
  - Lua 5.1 scripting support
  - PCRE2 regex engine
endef

define Package/accel-ppp/conffiles
/etc/accel-ppp.conf
endef

define KernelPackage/accel-ppp-ipoe
  SUBMENU:=Network Support
  TITLE:=accel-ppp IPoE kernel driver
  DEPENDS:=+kmod-nf-conntrack
  FILES:=$(PKG_BUILD_DIR)/drivers/ipoe/driver/ipoe.ko
  AUTOLOAD:=$(call AutoLoad,90,ipoe)
endef

define KernelPackage/accel-ppp-ipoe/description
  IPoE (IP over Ethernet) kernel driver for accel-ppp.
  Provides L2-level subscriber management without PPP encapsulation.
endef

define KernelPackage/accel-ppp-vlan-mon
  SUBMENU:=Network Support
  TITLE:=accel-ppp VLAN monitor kernel driver
  FILES:=$(PKG_BUILD_DIR)/drivers/vlan_mon/driver/vlan_mon.ko
  AUTOLOAD:=$(call AutoLoad,90,vlan_mon)
endef

define KernelPackage/accel-ppp-vlan-mon/description
  VLAN monitor kernel driver for accel-ppp.
  Auto-creates VLANs for subscriber isolation.
endef

CMAKE_OPTIONS += \
	-DLUA=TRUE \
	-DRADIUS=TRUE \
	-DSHAPER=TRUE \
	-DCRYPTO=OPENSSL \
	-DBUILD_IPOE_DRIVER=TRUE \
	-DBUILD_VLAN_MON_DRIVER=TRUE \
	-DKDIR=$(LINUX_DIR) \
	-DLIB_SUFFIX= \
	-DIGNORE_GIT=TRUE

# Pass cross-compilation variables to kernel module sub-builds
MAKE_FLAGS += \
	ARCH="$(LINUX_KARCH)" \
	CROSS_COMPILE="$(TARGET_CROSS)"

define Build/Compile
	$(call Build/Compile/Default)
endef

define Package/accel-ppp/install
	$(INSTALL_DIR) $(1)/usr/sbin
	$(INSTALL_BIN) $(PKG_INSTALL_DIR)/usr/sbin/accel-pppd $(1)/usr/sbin/
	$(INSTALL_BIN) $(PKG_INSTALL_DIR)/usr/bin/accel-cmd $(1)/usr/sbin/

	$(INSTALL_DIR) $(1)/usr/lib/accel-ppp
	$(CP) $(PKG_INSTALL_DIR)/usr/lib/accel-ppp/*.so $(1)/usr/lib/accel-ppp/

	$(INSTALL_DIR) $(1)/etc
	$(INSTALL_CONF) $(PKG_BUILD_DIR)/accel-pppd/accel-ppp.conf $(1)/etc/accel-ppp.conf.dist

	$(INSTALL_DIR) $(1)/etc/init.d
	$(INSTALL_BIN) ./files/accel-ppp.init $(1)/etc/init.d/accel-ppp

	$(INSTALL_DIR) $(1)/var/log/accel-ppp
	$(INSTALL_DIR) $(1)/var/lib/accel-ppp
endef

$(eval $(call BuildPackage,accel-ppp))
$(eval $(call KernelPackage,accel-ppp-ipoe))
$(eval $(call KernelPackage,accel-ppp-vlan-mon))
