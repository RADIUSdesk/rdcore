#!/usr/bin/env bash
set -euo pipefail
IF="$1"
CMD="${2:-start}"
UPRATE="${3:-30mbit}"
DNRATE="${4:-30mbit}"

cleanup() {
  tc qdisc del dev "$IF" root 2>/dev/null || true
  tc qdisc del dev "$IF" ingress 2>/dev/null || true
  ip link del "ifb-$IF" 2>/dev/null || true
}

if [[ "$CMD" == "stop" ]]; then
  cleanup
  exit 0
fi

cleanup

# Egress on wg interface
tc qdisc add dev "$IF" root cake bandwidth "$UPRATE" diffserv3 nat

# Ingress via IFB
ip link add "ifb-$IF" type ifb
ip link set "ifb-$IF" up
tc qdisc add dev "$IF" handle ffff: ingress
tc filter add dev "$IF" parent ffff: matchall action mirred egress redirect dev "ifb-$IF"
tc qdisc add dev "ifb-$IF" root cake bandwidth "$DNRATE" diffserv3 nat
