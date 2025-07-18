#!/usr/bin/env bash

source .githooks/annex/common.sh


if [ -d "${GIT_DIR}/annex" ] # timeout 2s git annex info >/dev/null 2>&
then
    current_branch=$(git rev-parse --abbrev-ref HEAD)
    [ "$current_branch" = "annex/auto/inbox" ] ||
        git config --get-all annex-extention.assistant.allowedBranch | grep -Fxq "$current_branch"
    daemon_allowed_branch=$?

    if [ -r "${GIT_DIR}/annex/daemon.pid" ] && xargs ps < "${GIT_DIR}/annex/daemon.pid"
    then
        if [ -e "${GIT_DIR}/annex/daemon.pid" ]
        then
            ASSISTANT_PID=$(cat "${GIT_DIR}/annex/daemon.pid")
            if [ "${ASSISTANT_PID}"]
            then
                i-am-git-annex-assistant $ASSISTANT_PID
                imdaemon=$?

                if [ "$ASSISTANT_PID" ] && ps "$ASSISTANT_PID"
                then
                   if { [ $imdaemon -eq 0 ] && [ $daemon_allowed_branch -eq 0 ]; } || { [ $imdaemon -ne 0 ] && [ $daemon_allowed_branch -ne 0 ]; }
                   then
                       echo "✅ $repo_dir: current branch '$current_branch' is allowed."
                       exit 0
                   else
                       echo "❌ $repo_dir: current branch '$current_branch' is NOT allowed."
                       exit 1
                   fi
                fi
            fi
        fi
    fi

    if [ $daemon_allowed_branch -eq 0 ]
    then
        exit 1
    fi
fi
