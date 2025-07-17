


function ancestorp()
{
    if [ $# -lt 1 ]
    then
        echo only first argument process id of ancestor should be passed
        exit 1
    fi

    local __target="$1"
    local __pid=${2:-$$}

    if ! ps $__target >/dev/null 2>&1
    then
        echo Warning ancestor pid $__target is not alive
        return 1
    fi

    if ! ps $__pid >/dev/null 2>&1
    then
        echo Warning process pid $__pid is not alive
        return 1
    fi

    while [ "$__pid" -ne 0 ]
    do
        echo pid=$__pid
        echo target=$__target
        if [ "$__pid" -eq "$__target" ]
        then
            echo return 0
            return 0
        fi
        __pid=$(ps -p "$__pid" -o ppid= | tr -d ' ')
    done
    echo return 1
    return 1
}


function i-am-git-annex-assistant()
{
    ancestorp $1 $$
}
