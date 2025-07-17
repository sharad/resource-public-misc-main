#!/usr/bin/env bash

function main()
{
    ASSISTANT_PID=$1
    source .githooks/annex/common.sh
    if ! ( i-am-git-annex-assistant $ASSISTANT_PID && .githooks/annex/git-annex-assistant-allowed.sh )
    then
        echo "Stopping git-annex assistant before rebase..."
        if which herd >/dev/null 2>&1
        then
            herd stop git-annex-assistant
            sleep 1
            herd stop git-annex-assistant
        fi
        git annex assistant --stop
        git annex assistant --stop
    fi
}

main $@
exit 0
