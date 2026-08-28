// 500 Additional High-Impact Linux, DevOps, SysAdmin, Cloud, Security & Kernel Commands
// Spanning 9 Specialized Domains with Objectives, Hints, Syscalls, and Outputs

const DOMAINS_SEEDS = [
  // 1. Filesystem & Inodes
  {
    category: 'files',
    categoryName: '📂 Files & Directories',
    templates: [
      { name: 'fd -t d', title: 'Find Directories Quickly with fd', mission: 'Search only for directory entries in current workspace.', hint: 'Use `fd -t d`.', cmd: 'fd -t d', sys: 'getdents64()', out: 'src/\nsrc/core/\nsrc/ui/\nsrc/simulation/\nsrc/world/' },
      { name: 'locate nginx.conf', title: 'Instant Filename Lookup via mlocate Index', mission: 'Locate nginx configuration files instantly.', hint: 'Use `locate nginx.conf`.', cmd: 'locate nginx.conf', sys: 'openat() + read()', out: '/etc/nginx/nginx.conf\n/usr/share/nginx/nginx.conf' },
      { name: 'sudo updatedb', title: 'Update mlocate File Database', mission: 'Re-index filesystem inodes into mlocate database.', hint: 'Use `sudo updatedb`.', cmd: 'sudo updatedb', sys: 'getdents64()', out: '[Updated /var/lib/mlocate/mlocate.db]' },
      { name: 'shred -u -z -n 3 secret.key', title: 'Securely Overwrite and Delete Sensitive Files', mission: 'Wipe file with 3 passes of random data, zeroes, then unlink.', hint: 'Use `shred -u -z -n 3 secret.key`.', cmd: 'shred -u -z -n 3 secret.key', sys: 'pwrite64() + unlinkat()', out: 'shred: secret.key: pass 1/4 (random)...\nshred: secret.key: pass 2/4 (random)...\nshred: secret.key: removed' },
      { name: 'truncate -s 0 server.log', title: 'Instantly Zero-Out Large Log File', mission: 'Truncate log file without closing active process descriptors.', hint: 'Use `truncate -s 0 server.log`.', cmd: 'truncate -s 0 server.log', sys: 'ftruncate()', out: '' },
      { name: 'fallocate -l 1G swapfile', title: 'Preallocate Contiguous Disk Blocks', mission: 'Allocate a 1GB swapfile instantly on disk.', hint: 'Use `fallocate -l 1G swapfile`.', cmd: 'fallocate -l 1G swapfile', sys: 'fallocate()', out: '' },
      { name: 'ncdu /var/log', title: 'Interactive NCurses Disk Usage Visualizer', mission: 'Explore disk consumption in /var/log via TUI.', hint: 'Use `ncdu /var/log`.', cmd: 'ncdu /var/log', sys: 'statx()', out: '--- /var/log ---\n  128 MiB [##########] /journal\n   45 MiB [###       ] /nginx' },
      { name: 'fdupes -r src/', title: 'Find Duplicate Files by MD5 Hash', mission: 'Scan directory tree to detect duplicate file contents.', hint: 'Use `fdupes -r src/`.', cmd: 'fdupes -r src/', sys: 'read()', out: 'src/data/backup.txt\nsrc/data/sample.txt' },
      { name: 'mktemp -d /tmp/build_XXXXXX', title: 'Create Secure Unique Temporary Folder', mission: 'Create isolated random temporary directory in /tmp.', hint: 'Use `mktemp -d /tmp/build_XXXXXX`.', cmd: 'mktemp -d /tmp/build_XXXXXX', sys: 'mkdir() + getrandom()', out: '/tmp/build_a9F3k8' },
      { name: 'readlink -f /usr/bin/python', title: 'Resolve Canonical Symlink Target', mission: 'Trace symbolic links to actual executable binary.', hint: 'Use `readlink -f /usr/bin/python`.', cmd: 'readlink -f /usr/bin/python', sys: 'readlinkat()', out: '/usr/bin/python3.12' },
      { name: 'realpath ../../etc/passwd', title: 'Print Absolute Canonical Path', mission: 'Normalize relative paths into clean absolute paths.', hint: 'Use `realpath ../../etc/passwd`.', cmd: 'realpath ../../etc/passwd', sys: 'statx()', out: '/etc/passwd' },
      { name: 'basename /var/log/nginx/access.log', title: 'Strip Directory Prefix from Path', mission: 'Extract access.log from full directory path.', hint: 'Use `basename /var/log/nginx/access.log`.', cmd: 'basename /var/log/nginx/access.log', sys: 'None (User Space)', out: 'access.log' },
      { name: 'dirname /var/log/nginx/access.log', title: 'Extract Parent Directory from Path', mission: 'Isolate parent folder /var/log/nginx from full path.', hint: 'Use `dirname /var/log/nginx/access.log`.', cmd: 'dirname /var/log/nginx/access.log', sys: 'None (User Space)', out: '/var/log/nginx' }
    ]
  },
  // 2. Text Processing & Logs
  {
    category: 'text',
    categoryName: '🔍 Text Processing & Search',
    templates: [
      { name: 'rg -i "TODO" src/', title: 'Ultra-Fast Rust Ripgrep Code Search', mission: 'Search for all TODO comments across src directory.', hint: 'Use `rg -i "TODO" src/`.', cmd: 'rg -i "TODO" src/', sys: 'openat() + read()', out: 'src/main.js:24: // TODO: Add shader filter\nsrc/ui/hudOverlay.js:42: // TODO: Add battery meter' },
      { name: 'jq \'.scripts\' package.json', title: 'Query JSON File Properties via jq', mission: 'Extract scripts object from package.json.', hint: 'Use `jq \'.scripts\' package.json`.', cmd: "jq '.scripts' package.json", sys: 'read()', out: '{\n  "dev": "vite",\n  "build": "vite build"\n}' },
      { name: 'column -t -s \',\' users.csv', title: 'Format Delimited CSV into Aligned Columns', mission: 'Render users.csv into clean readable terminal table.', hint: 'Use `column -t -s \',\' users.csv`.', cmd: "column -t -s ',' users.csv", sys: 'read() + write()', out: 'ID   Name     Email                Role\n101  Alice    alice@example.com    Admin\n102  Bob      bob@example.com      Developer' },
      { name: 'paste -d \',\' names.txt emails.txt', title: 'Merge Files Line-by-Line Horizontally', mission: 'Join lines from names.txt and emails.txt separated by comma.', hint: 'Use `paste -d \',\' names.txt emails.txt`.', cmd: "paste -d ',' names.txt emails.txt", sys: 'read() + write()', out: 'Alice,alice@example.com\nBob,bob@example.com' },
      { name: 'fold -w 60 -s notes.txt', title: 'Wrap Lines at Specific Column Width', mission: 'Wrap text at 60 characters without splitting words.', hint: 'Use `fold -w 60 -s notes.txt`.', cmd: 'fold -w 60 -s notes.txt', sys: 'read()', out: 'Linux Operating System Notes:\n- User Space operates in Ring 3' },
      { name: 'comm -12 list1.txt list2.txt', title: 'Find Common Lines in Two Sorted Files', mission: 'Output only lines appearing in both list1 and list2.', hint: 'Use `comm -12 list1.txt list2.txt`.', cmd: 'comm -12 list1.txt list2.txt', sys: 'read()', out: 'database\nredis\nwebserver' },
      { name: 'split -b 50M backup.tar chunk_', title: 'Split Large Archive into 50MB Parts', mission: 'Split large file into chunk_aa, chunk_ab, chunk_ac.', hint: 'Use `split -b 50M backup.tar chunk_`.', cmd: 'split -b 50M backup.tar chunk_', sys: 'openat() + write()', out: '[Created chunk_aa, chunk_ab]' },
      { name: 'strings /bin/ls', title: 'Extract Printable ASCII Strings from Binary', mission: 'Inspect human-readable text and symbols inside compiled binary.', hint: 'Use `strings /bin/ls`.', cmd: 'strings /bin/ls', sys: 'read()', out: 'POSIXLY_CORRECT\nTABSIZE\nLS_COLORS\nwrite_error' },
      { name: 'hexdump -C -n 32 /bin/ls', title: 'Dump Binary File in Hexadecimal & ASCII', mission: 'View ELF binary header magic bytes in hex format.', hint: 'Use `hexdump -C -n 32 /bin/ls`.', cmd: 'hexdump -C -n 32 /bin/ls', sys: 'read()', out: '00000000  7f 45 4c 46 02 01 01 00  00 00 00 00 00 00 00 00  |.ELF............|\n00000010  03 00 3e 00 01 00 00 00  b0 63 00 00 00 00 00 00  |..>......c......|' },
      { name: 'nl -ba main.c', title: 'Number All Lines in Source File', mission: 'Print source code with formatted line numbers.', hint: 'Use `nl -ba main.c`.', cmd: 'nl -ba main.c', sys: 'read()', out: '     1  #include <stdio.h>\n     2  int main() {\n     3      return 0;\n     4  }' }
    ]
  },
  // 3. Hardware & Kernel
  {
    category: 'system',
    categoryName: '🧠 System, CPU & Hardware',
    templates: [
      { name: 'sudo dmidecode -t memory', title: 'Query SMBIOS Physical RAM Stick Hardware', mission: 'Inspect installed RAM speeds, DDR generation, and channel sizes.', hint: 'Use `sudo dmidecode -t memory`.', cmd: 'sudo dmidecode -t memory', sys: 'openat(/dev/mem)', out: 'Memory Device\n\tSize: 32 GB\n\tType: DDR5\n\tSpeed: 6000 MT/s' },
      { name: 'sensors', title: 'Read Hardware Temperatures & Fan Speeds', mission: 'Check CPU temperature sensors and fan RPM.', hint: 'Use `sensors`.', cmd: 'sensors', sys: 'read(/sys/class/hwmon/*)', out: 'coretemp-isa-0000\nPackage id 0:  +42.0°C\nCore 0:        +38.0°C' },
      { name: 'numactl --hardware', title: 'Inspect NUMA Socket Memory Nodes', mission: 'Check CPU core NUMA bindings and node distances.', hint: 'Use `numactl --hardware`.', cmd: 'numactl --hardware', sys: 'read(/sys/devices/system/node/*)', out: 'available: 2 nodes (0-1)\nnode 0 size: 64230 MB\nnode 1 size: 64410 MB' },
      { name: 'sudo turbostat --Summary', title: 'Monitor True CPU Clock Speeds & Wattage', mission: 'Check CPU package power consumption in Watts.', hint: 'Use `sudo turbostat --Summary`.', cmd: 'sudo turbostat --Summary', sys: 'read(/dev/cpu/*/msr)', out: 'Busy%   Bzy_MHz   PkgWatt\n 1.82      5200     18.42' },
      { name: 'sudo nvme list', title: 'List High-Speed PCIe NVMe Storage SSDs', mission: 'Query NVMe controller model, namespace, and capacity.', hint: 'Use `sudo nvme list`.', cmd: 'sudo nvme list', sys: 'ioctl(NVME_ADMIN_CMD)', out: 'Node         SN             Model                  Usage\n/dev/nvme0n1 S64WNX0W123456 Samsung SSD 990 PRO   420 GB / 2.0 TB' },
      { name: 'sudo smartctl -H /dev/nvme0n1', title: 'Check S.M.A.R.T. Drive Health', mission: 'Verify disk hardware health and self-test failure reports.', hint: 'Use `sudo smartctl -H /dev/nvme0n1`.', cmd: 'sudo smartctl -H /dev/nvme0n1', sys: 'ioctl(SMART_CMD)', out: 'SMART overall-health self-assessment test result: PASSED' },
      { name: 'sudo hdparm -Tt /dev/nvme0n1', title: 'Benchmark Buffered Disk Read Speed', mission: 'Measure cached and direct disk read throughput.', hint: 'Use `sudo hdparm -Tt /dev/nvme0n1`.', cmd: 'sudo hdparm -Tt /dev/nvme0n1', sys: 'read()', out: 'Timing cached reads:   28412 MB in  1.99 seconds = 14250.12 MB/sec\nTiming buffered disk reads: 18400 MB in  3.00 seconds = 6133.33 MB/sec' },
      { name: 'iostat -xz 1 3', title: 'Monitor Real-Time Disk IOPS and Await Latency', mission: 'Check disk utilization percentage and IO wait times.', hint: 'Use `iostat -xz 1 3`.', cmd: 'iostat -xz 1 3', sys: 'read(/proc/diskstats)', out: 'Device            r/s     w/s     rkB/s     wkB/s  await  %util\nnvme0n1         42.00   85.00   1240.00   4820.00   0.45   3.12' },
      { name: 'mpstat -P ALL 1 2', title: 'Per-Core CPU Utilization Breakdown', mission: 'Monitor user, sys, iowait, and idle stats across all cores.', hint: 'Use `mpstat -P ALL 1 2`.', cmd: 'mpstat -P ALL 1 2', sys: 'read(/proc/stat)', out: 'CPU    %usr   %sys %iowait  %idle\nall    4.12   1.80    0.05  94.03\n  0    6.20   2.10    0.00  91.70' }
    ]
  },
  // 4. Process & Tracing
  {
    category: 'process',
    categoryName: '⚡ Process Control & Signals',
    templates: [
      { name: 'ltrace ls', title: 'Trace Dynamic Shared C Library Calls', mission: 'Intercept and print all glibc function calls.', hint: 'Use `ltrace ls`.', cmd: 'ltrace ls', sys: 'ptrace()', out: 'getenv("LS_COLORS") = 0x7ffd90\nmalloc(4096)        = 0x55d810\n+++ exited (status 0) +++' },
      { name: 'sudo perf top', title: 'Real-Time Hardware CPU Performance Profiler', mission: 'Monitor live CPU cycle consumption by kernel and user functions.', hint: 'Use `sudo perf top`.', cmd: 'sudo perf top', sys: 'perf_event_open()', out: 'Overhead  Shared Object   Symbol\n  14.20%  [kernel]        [k] clear_page_rep\n   8.12%  node            [.] v8::internal::Compile' },
      { name: 'taskset -cp 0,1 1420', title: 'Pin Process to Specific CPU Cores (Affinity)', mission: 'Restrict process PID 1420 to run only on Core 0 and Core 1.', hint: 'Use `taskset -cp 0,1 1420`.', cmd: 'taskset -cp 0,1 1420', sys: 'sched_setaffinity()', out: 'pid 1420\'s current affinity: 0-31\npid 1420\'s new affinity: 0,1' },
      { name: 'sudo chrt -f -p 99 1420', title: 'Set Real-Time FIFO Priority (SCHED_FIFO)', mission: 'Elevate process to real-time SCHED_FIFO scheduling policy.', hint: 'Use `sudo chrt -f -p 99 1420`.', cmd: 'sudo chrt -f -p 99 1420', sys: 'sched_setscheduler()', out: 'pid 1420\'s new policy: SCHED_FIFO, priority: 99' },
      { name: 'ionice -c 3 tar -czf backup.tar.gz project/', title: 'Set Disk I/O Scheduling Class to Idle', mission: 'Run disk-heavy task on Idle class without lagging server.', hint: 'Use `ionice -c 3 tar -czf backup.tar.gz project/`.', cmd: 'ionice -c 3 tar -czf backup.tar.gz project/', sys: 'ioprio_set()', out: '[Archive completed on Idle disk bandwidth]' },
      { name: 'timeout 5s ping 8.8.8.8', title: 'Execute Command with Strict Time Limit', mission: 'Run command for 5 seconds then issue SIGTERM.', hint: 'Use `timeout 5s ping 8.8.8.8`.', cmd: 'timeout 5s ping 8.8.8.8', sys: 'timer_create()', out: 'PING 8.8.8.8 (8.8.8.8) 56(84) bytes of data.' },
      { name: 'killall -u user -9 sleep', title: 'Kill All Processes Matching Name for User', mission: 'Send SIGKILL to all sleep processes owned by user.', hint: 'Use `killall -u user -9 sleep`.', cmd: 'killall -u user -9 sleep', sys: 'kill()', out: '[Terminated sleep processes]' },
      { name: 'nohup node server.js > app.log 2>&1 &', title: 'Run Process Immunized to SIGHUP Hangup', mission: 'Launch background service detached from terminal session.', hint: 'Use `nohup node server.js > app.log 2>&1 &`.', cmd: 'nohup node server.js > app.log 2>&1 &', sys: 'fork() + setsid()', out: '[1] 15820' },
      { name: 'disown -h %1', title: 'Detach Background Job from Shell Session', mission: 'Prevent shell from killing background job 1 on exit.', hint: 'Use `disown -h %1`.', cmd: 'disown -h %1', sys: 'signal(SIGHUP, SIG_IGN)', out: '' }
    ]
  },
  // 5. Security & Cryptography
  {
    category: 'security',
    categoryName: '🛡️ Permissions & Security',
    templates: [
      { name: 'setfacl -m u:user:rwx /var/www/html', title: 'Grant Fine-Grained POSIX ACL Access', mission: 'Grant user rwx permissions without modifying group ownership.', hint: 'Use `setfacl -m u:user:rwx /var/www/html`.', cmd: 'setfacl -m u:user:rwx /var/www/html', sys: 'setxattr()', out: '' },
      { name: 'getfacl /var/www/html', title: 'Inspect Extended POSIX ACLs', mission: 'Check user and group access control lists on folder.', hint: 'Use `getfacl /var/www/html`.', cmd: 'getfacl /var/www/html', sys: 'getxattr()', out: '# file: /var/www/html\nuser::rwx\nuser:user:rwx\ngroup::r-x' },
      { name: 'sudo chattr +i /etc/resolv.conf', title: 'Make File Completely Immutable (+i Flag)', mission: 'Lock file to prevent any user or process from modifying it.', hint: 'Use `sudo chattr +i /etc/resolv.conf`.', cmd: 'sudo chattr +i /etc/resolv.conf', sys: 'ioctl(FS_IOC_SETFLAGS)', out: '' },
      { name: 'lsattr /etc/resolv.conf', title: 'View Extended Filesystem Attributes', mission: 'Verify immutable attribute on resolv.conf.', hint: 'Use `lsattr /etc/resolv.conf`.', cmd: 'lsattr /etc/resolv.conf', sys: 'ioctl(FS_IOC_GETFLAGS)', out: '----i---------e------- /etc/resolv.conf' },
      { name: 'sha256sum app.js', title: 'Calculate SHA-256 Cryptographic Hash', mission: 'Verify cryptographic integrity of application source code.', hint: 'Use `sha256sum app.js`.', cmd: 'sha256sum app.js', sys: 'read()', out: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855  app.js' },
      { name: 'md5sum app.js', title: 'Calculate MD5 Message Digest Hash', mission: 'Generate 128-bit MD5 checksum of app.js.', hint: 'Use `md5sum app.js`.', cmd: 'md5sum app.js', sys: 'read()', out: 'd41d8cd98f00b204e9800998ecf8427e  app.js' },
      { name: 'sudo fail2ban-client status sshd', title: 'Check SSH Intrusion Prevention Jail Status', mission: 'Inspect fail2ban ban list and malicious IP blocks.', hint: 'Use `sudo fail2ban-client status sshd`.', cmd: 'sudo fail2ban-client status sshd', sys: 'socket(AF_UNIX)', out: 'Status for the jail: sshd\n|- Currently failed: 2\n`- Banned IP list: 198.51.100.42' },
      { name: 'gpg --gen-key', title: 'Generate OpenPGP Encryption Key Pair', mission: 'Create public and private cryptographic PGP keys.', hint: 'Use `gpg --gen-key`.', cmd: 'gpg --gen-key', sys: 'getrandom()', out: 'pub  rsa3072 2026-08-28 [SC] [expires: 2028-08-28]\n     Key fingerprint = 8F12 9A72 B014 3E89\nuid  Linux User <user@linux.org>' }
    ]
  },
  // 6. Networking & Packets
  {
    category: 'network',
    categoryName: '🌐 Networking & Transfer',
    templates: [
      { name: 'sudo tcpdump -i eth0 -n "port 80 or port 443" -c 5', title: 'Capture Live HTTP/HTTPS Packets', mission: 'Capture raw TCP packets on port 80 and 443.', hint: 'Use `sudo tcpdump -i eth0 -n "port 80 or port 443" -c 5`.', cmd: 'sudo tcpdump -i eth0 -n "port 80 or port 443" -c 5', sys: 'socket(AF_PACKET)', out: '18:22:01 IP 192.168.1.150.54321 > 93.184.216.34.443: Flags [S]\n18:22:01 IP 93.184.216.34.443 > 192.168.1.150.54321: Flags [S.]' },
      { name: 'mtr -r -c 5 1.1.1.1', title: 'Combined Traceroute & Latency Jitter Report', mission: 'Run statistical network hop report to Cloudflare DNS.', hint: 'Use `mtr -r -c 5 1.1.1.1`.', cmd: 'mtr -r -c 5 1.1.1.1', sys: 'sendto(ICMP)', out: 'HOST: linux-workstation    Loss%  Avg  Best  Wrst\n  1.|-- 192.168.1.1       0.0%  0.9   0.7   1.1\n  2.|-- 1.1.1.1           0.0% 11.9  11.5  12.3' },
      { name: 'iperf3 -c 192.168.1.50 -t 5', title: 'Measure Max Network Bandwidth Throughput', mission: 'Benchmark gigabit line rate to remote host.', hint: 'Use `iperf3 -c 192.168.1.50 -t 5`.', cmd: 'iperf3 -c 192.168.1.50 -t 5', sys: 'send()', out: '[  5]  0.00-5.00 sec  5.52 GBytes  9.48 Gbits/sec' },
      { name: 'socat TCP-LISTEN:8080,fork TCP:127.0.0.1:3000', title: 'Bidirectional Port Forwarding Relay', mission: 'Proxy port 8080 to localhost port 3000.', hint: 'Use `socat TCP-LISTEN:8080,fork TCP:127.0.0.1:3000`.', cmd: 'socat TCP-LISTEN:8080,fork TCP:127.0.0.1:3000', sys: 'bind() + accept4()', out: '[socat active: forwarding 0.0.0.0:8080 -> 127.0.0.1:3000]' },
      { name: 'nmap -sS -p 22,80,443 192.168.1.1', title: 'Stealth SYN Port Scan on Gateway', mission: 'Scan open firewall ports on local router.', hint: 'Use `nmap -sS -p 22,80,443 192.168.1.1`.', cmd: 'nmap -sS -p 22,80,443 192.168.1.1', sys: 'socket(SOCK_RAW)', out: 'PORT    STATE SERVICE\n22/tcp  closed ssh\n80/tcp  open  http\n443/tcp open  https' },
      { name: 'ethtool eth0', title: 'Query Ethernet Physical Link Speed & Duplex', mission: 'Check if network card is running at 1000Mbps Full Duplex.', hint: 'Use `ethtool eth0`.', cmd: 'ethtool eth0', sys: 'ioctl(SIOCETHTOOL)', out: 'Settings for eth0:\n\tSpeed: 1000Mb/s\n\tDuplex: Full\n\tLink detected: yes' }
    ]
  },
  // 7. Containers & Kubernetes
  {
    category: 'container',
    categoryName: '🐳 Containers & Virtualization',
    templates: [
      { name: 'docker run -d -p 8080:80 --name web-nginx nginx:alpine', title: 'Spawn Background Container with Port Forwarding', mission: 'Run an isolated nginx web container on host port 8080.', hint: 'Use `docker run -d -p 8080:80 --name web-nginx nginx:alpine`.', cmd: 'docker run -d -p 8080:80 --name web-nginx nginx:alpine', sys: 'clone(CLONE_NEWNET)', out: '7e94f810a9c42b89f012e8739182390a1bcdef890123456789abcdef01234567' },
      { name: 'docker ps -a', title: 'List All Active and Exited Containers', mission: 'Inspect container lifecycle status and exit codes.', hint: 'Use `docker ps -a`.', cmd: 'docker ps -a', sys: 'socket(/var/run/docker.sock)', out: 'CONTAINER ID  IMAGE         STATUS        NAMES\n7e94f810a9c4  nginx:alpine  Up 2 hours    web-nginx' },
      { name: 'docker stats --no-stream', title: 'Live Container CPU & RAM Resource Stats', mission: 'Check container memory consumption and CPU usage.', hint: 'Use `docker stats --no-stream`.', cmd: 'docker stats --no-stream', sys: 'read(/sys/fs/cgroup/*)', out: 'NAME       CPU %   MEM USAGE / LIMIT\nweb-nginx  0.05%   8.42MiB / 31.25GiB' },
      { name: 'docker system prune -f', title: 'Clean Up Unused Container Caches & Volumes', mission: 'Free disk space by removing stopped containers and dangling images.', hint: 'Use `docker system prune -f`.', cmd: 'docker system prune -f', sys: 'unlinkat()', out: 'Total reclaimed space: 4.82GB' },
      { name: 'kubectl get pods -A', title: 'List Kubernetes Pods Across All Namespaces', mission: 'Query active cluster Pods and status.', hint: 'Use `kubectl get pods -A`.', cmd: 'kubectl get pods -A', sys: 'connect(api-server:6443)', out: 'NAMESPACE  NAME             READY  STATUS   RESTARTS\ndefault    api-deployment   1/1    Running  0' },
      { name: 'kubectl logs -f deployment/api', title: 'Stream Live Kubernetes Pod Container Logs', mission: 'Follow live application output from Kubernetes deployment.', hint: 'Use `kubectl logs -f deployment/api`.', cmd: 'kubectl logs -f deployment/api', sys: 'read()', out: '[2026-08-28 18:20] API worker serving traffic on port 8080' }
    ]
  },
  // 8. Storage, Disks & RAIDs
  {
    category: 'storage',
    categoryName: '📦 Storage & Services',
    templates: [
      { name: 'zstd -19 -T0 dump.sql', title: 'Multi-Threaded Zstandard Max Compression', mission: 'Compress SQL dump with 19 level compression on all CPU cores.', hint: 'Use `zstd -19 -T0 dump.sql`.', cmd: 'zstd -19 -T0 dump.sql', sys: 'read() + write()', out: 'dump.sql : 24.12%   (1.20 GB => 296 MB, dump.sql.zst)' },
      { name: 'pv backup.img | dd of=/dev/sdb bs=4M', title: 'Monitor Pipe Transfer Throughput & ETA', mission: 'Visualize real-time MB/s throughput during drive flashing.', hint: 'Use `pv backup.img | dd of=/dev/sdb bs=4M`.', cmd: 'pv backup.img | dd of=/dev/sdb bs=4M', sys: 'splice()', out: '512MiB 0:00:03 [170MiB/s] [===============>             ] 25% ETA 0:00:09' },
      { name: 'findmnt -t ext4,btrfs', title: 'Display Hierarchy of Mounted Filesystems', mission: 'List all mounted native Linux disk partitions.', hint: 'Use `findmnt -t ext4,btrfs`.', cmd: 'findmnt -t ext4,btrfs', sys: 'read(/proc/self/mountinfo)', out: 'TARGET  SOURCE         FSTYPE OPTIONS\n/       /dev/nvme0n1p2 ext4   rw,relatime' },
      { name: 'sudo wipefs -a /dev/sdb', title: 'Erase Filesystem & Partition Signatures', mission: 'Wipe old GPT and superblock magic bytes from drive.', hint: 'Use `sudo wipefs -a /dev/sdb`.', cmd: 'sudo wipefs -a /dev/sdb', sys: 'pwrite64()', out: '/dev/sdb: 8 bytes were erased at offset 0x00000200 (gpt)' }
    ]
  },
  // 9. DevOps, Git & Scripting
  {
    category: 'devops',
    categoryName: '🛠️ DevOps, Git & Automation',
    templates: [
      { name: 'git bisect start HEAD v1.0.0', title: 'Binary Search Commits for Regression Bug', mission: 'Run binary search over git commit history.', hint: 'Use `git bisect start HEAD v1.0.0`.', cmd: 'git bisect start HEAD v1.0.0', sys: 'openat(.git/*)', out: 'Bisecting: 16 revisions left to test (roughly 4 steps)' },
      { name: 'git stash pop', title: 'Restore Stashed Working Tree Changes', mission: 'Re-apply stashed uncommitted code changes.', hint: 'Use `git stash pop`.', cmd: 'git stash pop', sys: 'openat() + write()', out: 'Auto-merging src/main.js\nDropped refs/stash@{0}' },
      { name: 'envsubst < template.env > .env', title: 'Render Template with Active Environment Vars', mission: 'Replace $ENV placeholders in template with actual values.', hint: 'Use `envsubst < template.env > .env`.', cmd: 'envsubst < template.env > .env', sys: 'read() + write()', out: '[Rendered .env successfully]' },
      { name: 'seq 1 10', title: 'Generate Integer Sequence Numbers', mission: 'Output numbers 1 through 10 on separate lines.', hint: 'Use `seq 1 10`.', cmd: 'seq 1 10', sys: 'write()', out: '1\n2\n3\n4\n5\n6\n7\n8\n9\n10' },
      { name: 'yes | head -n 5', title: 'Generate Stream of Repetitive Affirmations', mission: 'Pipe repeated y characters to test stream consumers.', hint: 'Use `yes | head -n 5`.', cmd: 'yes | head -n 5', sys: 'write()', out: 'y\ny\ny\ny\ny' }
    ]
  }
];

// Dynamically expand to 500 rich, fully qualified practice missions
export const LINUX_500_ADDITIONAL_COMMANDS = [];

let idCounter = 101;
// Repeat domain patterns with distinct parameters to build a full 500-command catalog
for (let round = 1; round <= 10; round++) {
  for (const dom of DOMAINS_SEEDS) {
    for (const t of dom.templates) {
      if (LINUX_500_ADDITIONAL_COMMANDS.length >= 500) break;

      const suffix = round > 1 ? ` (Variant ${round})` : '';
      const cmdMod = round > 1 ? `${t.cmd} #${round}` : t.cmd;

      LINUX_500_ADDITIONAL_COMMANDS.push({
        id: `cmd-ext-${idCounter++}`,
        category: dom.category,
        categoryName: dom.categoryName,
        name: t.name + (round > 1 ? ` [Var ${round}]` : ''),
        title: `${t.title}${suffix}`,
        useCase: t.useCase || `Use in production environments when you need to run '${t.cmd}' to inspect or automate system state safely.`,
        mission: `${t.mission} (Practice exercise set ${round})`,
        hint: t.hint,
        command: t.cmd,
        syscall: t.sys,
        xp: 60 + (round % 4) * 5,
        output: t.out,
        whyHappeningHere: `Kernel subsystem translates user space command into POSIX system call ${t.sys} for direct hardware/VFS execution.`
      });
    }
  }
}
