#!/usr/bin/env bash
# Downloads 512x512 club logos from football-logos.cc into public/club_logos/.
# Asset URLs are content-hashed, so each club page is scraped for its real URL.
set -uo pipefail

cd "$(dirname "$0")/.." || exit 1
mkdir -p public/club_logos

# assets.football-logos.cc sits behind Cloudflare and rejects curl's default UA
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"

CLUBS=(
  "england manchester-united"
  "england manchester-city"
  "england liverpool"
  "england arsenal"
  "england chelsea"
  "england tottenham"
  "england newcastle"
  "spain real-madrid"
  "spain barcelona"
  "spain atletico-madrid"
  "spain sevilla"
  "italy juventus"
  "italy milan"
  "italy inter"
  "italy napoli"
  "italy roma"
  "italy lazio"
  "germany bayern-munchen"
  "germany borussia-dortmund"
  "germany bayer-leverkusen"
  "germany rb-leipzig"
  "france paris-saint-germain"
  "france marseille"
  "france as-monaco"
  "france lyon"
  "portugal benfica"
  "portugal fc-porto"
  "portugal sporting-cp"
  "netherlands ajax"
  "netherlands psv"
)

failed=()
for entry in "${CLUBS[@]}"; do
  read -r country slug <<<"$entry"
  out="public/club_logos/${country}_${slug}_512x512.football-logos.cc.png"
  if [[ -s "$out" ]]; then
    echo "skip   $out (exists)"
    continue
  fi
  url=$(curl -sL --max-time 20 -H "User-Agent: $UA" "https://football-logos.cc/${country}/${slug}/" |
    grep -oE "https://assets\.football-logos\.cc/logos/${country}/512x512/${slug}\.[a-f0-9]+\.png" |
    head -1)
  if [[ -z "$url" ]]; then
    echo "FAIL   ${country}/${slug}: no 512x512 URL found on page"
    failed+=("$entry")
    continue
  fi
  if curl -sL --max-time 30 -H "User-Agent: $UA" -H "Referer: https://football-logos.cc/" "$url" -o "$out" &&
    [[ "$(head -c 4 "$out" | xxd -p)" == "89504e47" ]]; then
    echo "ok     $out"
  else
    echo "FAIL   ${country}/${slug}: download error or not a PNG"
    rm -f "$out"
    failed+=("$entry")
  fi
done

echo
echo "downloaded: $(ls public/club_logos/*.png | wc -l | tr -d ' ') logos"
if ((${#failed[@]})); then
  echo "failed entries (check slug on football-logos.cc):"
  printf '  %s\n' "${failed[@]}"
  exit 1
fi
