#!/usr/bin/env bash


echo "Stopping git-annex assistant before rebase..."
if which herd >/dev/null 2>&1
then
    herd start git-annex-assistant
fi




