#!/usr/bin/env bash
set -euo pipefail

# Tag a release so GitHub Actions builds it.
#
#   npm run release            # prompts for the version
#   npm run release 0.2.0      # or pass it (a leading "v" is fine)
#   npm run release 0.2.0 -- -y   # skip the confirmation prompt
#
# Pushing the tag is what starts .github/workflows/build-windows.yml, which
# builds the Windows installer and publishes a public GitHub Release. That is
# outward-facing and awkward to undo, so this asks before pushing.
#
# Sibling script: .github-release.sh builds locally and uploads with `gh`
# instead. Use that when you need the artifacts without a CI run.

cd "$(dirname "$0")/.."

fail() { echo "ERROR: $*" >&2; exit 1; }

for cmd in git node; do
  command -v "$cmd" >/dev/null 2>&1 || fail "Required command not found: $cmd"
done

assume_yes=0
version_arg=""
for arg in "$@"; do
  case "$arg" in
    -y|--yes) assume_yes=1 ;;
    -*) fail "Unknown option: $arg" ;;
    *) version_arg="$arg" ;;
  esac
done

# ---------------------------------------------------------------- version in
if [[ -n "$version_arg" ]]; then
  version="$version_arg"
else
  current="$(node -p "require('./package.json').version")"
  printf 'Current version: %s\n' "$current"
  read -r -p "New version (e.g. 0.2.0): " version
fi

version="${version#v}"
[[ "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z.-]+)?$ ]] \
  || fail "Version must look like 1.2.3 or 1.2.3-rc.1 (got: '$version')"

tag="v${version}"

# ---------------------------------------------------------------- guardrails
# A dirty tree means the tag would point at a commit that is not what you built
# and tested locally.
[[ -z "$(git status --porcelain)" ]] || fail \
  "Working tree has uncommitted changes. Commit or stash them first:
$(git status --short | sed 's/^/  /')"

branch="$(git rev-parse --abbrev-ref HEAD)"
if [[ "$branch" != "master" && "$branch" != "main" ]]; then
  echo "WARNING: on branch '$branch', not master/main." >&2
fi

git rev-parse --abbrev-ref --symbolic-full-name '@{u}' >/dev/null 2>&1 \
  || fail "Branch '$branch' has no upstream. Push it first: git push -u origin $branch"

echo "Fetching tags from origin..."
git fetch --tags --quiet origin

git show-ref --verify --quiet "refs/tags/$tag" \
  && fail "Tag $tag already exists locally. Delete it or pick another version:
  git tag -d $tag"
[[ -z "$(git ls-remote --tags origin "refs/tags/$tag")" ]] \
  || fail "Tag $tag already exists on origin. Pick another version."

# ------------------------------------------------- keep the four files in sync
# The installer reads its version from tauri.conf.json / Cargo.toml, not from
# the tag. Letting them drift ships an installer whose version contradicts the
# release it is attached to.
#
# Split into plan/apply on purpose: an earlier version wrote the files before
# the confirmation prompt, so answering "n" left a half-applied bump in the
# working tree and the next run tripped its own dirty-tree guard.
bump_versions() {
  node -e '
const fs = require("fs");
const [mode, v] = process.argv.slice(1);
const apply = mode === "apply";
const changed = [];

for (const f of ["package.json", "package-lock.json", "src-tauri/tauri.conf.json"]) {
  if (!fs.existsSync(f)) continue;
  const raw = fs.readFileSync(f, "utf8");
  const json = JSON.parse(raw);
  if (json.version === v) continue;
  changed.push(f);
  if (!apply) continue;
  json.version = v;
  // package-lock mirrors its own version in the root package entry too.
  if (json.packages && json.packages[""]) json.packages[""].version = v;
  fs.writeFileSync(f, JSON.stringify(json, null, 2) + (raw.endsWith("\n") ? "\n" : ""));
}

const cargo = "src-tauri/Cargo.toml";
const text = fs.readFileSync(cargo, "utf8");
// Only the first `version =`, which belongs to [package]; dependency pins below
// must not be touched.
const next = text.replace(/^version = ".*"$/m, `version = "${v}"`);
if (next !== text) {
  changed.push(cargo);
  if (apply) fs.writeFileSync(cargo, next);
}

console.log(changed.join("\n"));
' "$1" "$version"
}

pending="$(bump_versions plan)"

# --------------------------------------------------------------- confirmation
commit="$(git rev-parse --short HEAD)"
remote_url="$(git remote get-url origin)"
# Only github.com remotes get run/release links; anything else just shows the URL.
slug=""
case "$remote_url" in
  *github.com[:/]*) slug="$(printf '%s' "$remote_url" | sed -E 's#^.*github\.com[:/]##; s#\.git$##')" ;;
esac

echo
echo "  tag      $tag"
echo "  commit   $commit  $(git log -1 --pretty=%s)"
echo "  branch   $branch"
echo "  repo     ${slug:-$remote_url}"
if [[ -n "$pending" ]]; then
  echo "  bump     $(echo "$pending" | tr '\n' ' ')-> $version"
else
  echo "  bump     none (already at $version)"
fi
echo
echo "Pushing this tag starts the Windows build and publishes a PUBLIC GitHub Release."

if [[ "$assume_yes" -ne 1 ]]; then
  read -r -p "Proceed? [y/N] " reply
  [[ "$reply" == "y" || "$reply" == "Y" ]] || { echo "Aborted. Nothing was pushed."; exit 1; }
fi

# --------------------------------------------------------------------- publish
if [[ -n "$pending" ]]; then
  bump_versions apply >/dev/null
  git add package.json package-lock.json src-tauri/tauri.conf.json src-tauri/Cargo.toml
  git commit -m "chore(release): $tag"
  git push origin "$branch"
fi

git tag -a "$tag" -m "Free iRacing Overlay $tag"
git push origin "$tag"

echo
echo "Pushed $tag."
if [[ -n "$slug" ]]; then
  echo "  Actions:  https://github.com/$slug/actions"
  echo "  Release:  https://github.com/$slug/releases/tag/$tag"
  if command -v gh >/dev/null 2>&1; then
    echo
    gh run list --limit 3 2>/dev/null || true
  fi
fi
