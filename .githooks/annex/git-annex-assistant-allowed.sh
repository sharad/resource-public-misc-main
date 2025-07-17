#!/usr/bin/env bash


current_branch=$(git rev-parse --abbrev-ref HEAD)



source .githooks/annex/common.sh

if [ "$current_branch" = "annex/auto/inbox" ] ||
       git config --get-all annex-extention.assistant.allowedBranch | grep -Fxq "$current_branch"
then
    echo "✅ $repo_dir: current branch '$current_branch' is allowed."
else
    echo "❌ $repo_dir: current branch '$current_branch' is NOT allowed."
    exit 1
fi

exit 0



