# CRT filesystem walkthrough

Open **>_ CLI** on the footer CRT. The `aj@crt:/$` prompt starts at the root of a read-only virtual tree. The layout borrows from the [Filesystem Hierarchy Standard](https://specifications.freedesktop.org/fhs/latest/).

| Path | What to try |
| --- | --- |
| `/` | `ls /` lists the top-level directories. |
| `/etc` | `cat /etc/issue` shows the terminal's greeting. |
| `/home/ashim` | `cd ~` takes you to the virtual home directory. |
| `/opt/carmechanicos` | `cd /opt/carmechanicos` then `start game` launches the garage. |
| `/usr/share/doc/quantum-leap` | `museum` points to the exhibits. Read `origins.txt` and `exhibits.txt`. |
| `/var/log` | `cat /var/log/boot.log` displays a scripted boot log. |

Use `pwd` to check your location, `cd ..` to go up, and `tree [path]` to map a subtree. The terminal accepts absolute and relative paths and supports Tab completion and arrow-key history. `dir` and `type` are aliases for `ls` and `cat`. The old `cd Desktop/carmechanicos` shortcut still works from the opening prompt or home. It resolves to the garage under `/opt`.

The filesystem runs entirely in the browser with a fixed directory and exhibit catalog. Commands resolve within that catalog and have no host disk or shell access. The boot log is fixture text. Some directories are intentionally empty. The garage opens in its existing sandbox and keeps its browser-local save. `reset` asks before clearing that save.

For the screenshots and development history, open the [build journal](BUILD-LOG.md).
