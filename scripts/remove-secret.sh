#!/usr/bin/env bash
set -e

echo "This script helps remove .env.local from git history and force-push the cleaned branch."
echo "Run only from a safe local clone. Make a backup clone if unsure."

# Option A: use git filter-repo (recommended if available)
if command -v git-filter-repo >/dev/null 2>&1; then
  echo "Using git filter-repo to remove .env.local from all history..."
  git rm --cached --ignore-unmatch .env.local || true
  git commit -m "chore: remove .env.local from working tree" || true
  git filter-repo --invert-paths --path .env.local
  echo "Finished filter-repo cleanup."
else
  echo "git filter-repo not found. You can install it: https://github.com/newren/git-filter-repo"
  echo "Falling back to BFG if available..."
  if command -v bfg >/dev/null 2>&1; then
    echo "Using BFG to remove .env.local from history..."
    # Create a temporary mirror
    git clone --mirror "$(git config --get remote.origin.url)" repo-mirror.git
    cd repo-mirror.git
    bfg --delete-files .env.local
    git reflog expire --expire=now --all
    git gc --prune=now --aggressive
    echo "Pushing cleaned mirror (force)..."
    git push --force
    echo "Done. Remove the repo-mirror.git folder."
    exit 0
  fi
fi

echo "If neither git-filter-repo nor bfg are available, to remove the file from the last commit only:"
echo "  git rm --cached .env.local"
echo "  git commit --amend --no-edit"
echo "  git push --force"
echo ""
echo "After cleaning history, push with:"
echo "  git push --force origin main"
echo ""
echo "IMPORTANT: After removing secrets from git history you should rotate the exposed secret(s)."
