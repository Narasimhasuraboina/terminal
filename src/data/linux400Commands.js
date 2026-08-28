// 400 Additional Specialized Linux, Cloud, DevOps, Database, Container, Network & Kernel Commands
// Each with crystal-clear Real-World Use Cases, Objectives, Hints, Syscalls, and Outputs

const DOMAINS_400 = [
  // 1. Database & Cache CLI
  {
    category: 'storage',
    categoryName: '📦 Storage, Databases & Services',
    templates: [
      {
        cmd: 'redis-cli ping',
        title: 'Check Redis In-Memory Cache Liveness',
        useCase: 'Run this health check during server monitoring or CI/CD to verify Redis cache service is responsive.',
        mission: 'Send a PING packet to the local Redis server to verify connectivity.',
        hint: 'Use `redis-cli ping`.',
        sys: 'connect(127.0.0.1:6379)',
        out: 'PONG'
      },
      {
        cmd: 'redis-cli info memory',
        title: 'Inspect Redis RAM Consumption & Peak Memory',
        useCase: 'Use when cache evictions occur to check if Redis is hitting its maxmemory ceiling.',
        mission: 'Check allocated bytes, fragmentation ratio, and peak RAM usage in Redis.',
        hint: 'Use `redis-cli info memory`.',
        sys: 'socket() + send()',
        out: '# Memory\nused_memory: 14285760\nused_memory_human: 13.62M\nused_memory_peak_human: 24.10M\nmem_fragmentation_ratio: 1.08'
      },
      {
        cmd: 'psql -U postgres -d app_db -c "\\dt"',
        title: 'List All Tables in PostgreSQL Database',
        useCase: 'Use to quickly verify database migrations created the expected tables without opening a GUI.',
        mission: 'Query PostgreSQL metadata catalog to list user tables.',
        hint: 'Use `psql -U postgres -d app_db -c "\\dt"`.',
        sys: 'connect(AF_UNIX: /var/run/postgresql)',
        out: '              List of relations\n Schema |       Name        | Type  |  Owner   \n--------+-------------------+-------+----------\n public | users             | table | postgres\n public | transactions      | table | postgres\n public | api_tokens        | table | postgres'
      },
      {
        cmd: 'pg_dump -U postgres -d app_db > backup.sql',
        title: 'Export Full PostgreSQL Database Dump',
        useCase: 'Use before running risky schema migrations or server upgrades to preserve full database state.',
        mission: 'Export table definitions, indexes, and row data into a single SQL backup file.',
        hint: 'Use `pg_dump -U postgres -d app_db > backup.sql`.',
        sys: 'openat() + write()',
        out: '[Backup completed: 182 MB written to backup.sql]'
      },
      {
        cmd: 'mysqldump -u root -p --all-databases > full_mysql.sql',
        title: 'Backup All MySQL / MariaDB Databases',
        useCase: 'Use during server migrations to export all schemas, users, and tables at once.',
        mission: 'Generate consistent SQL dump of all MySQL databases.',
        hint: 'Use `mysqldump -u root -p --all-databases > full_mysql.sql`.',
        sys: 'write()',
        out: '[All databases dumped successfully]'
      }
    ]
  },
  // 2. Cloud, S3 & Remote Transfers
  {
    category: 'network',
    categoryName: '🌐 Networking & Transfer',
    templates: [
      {
        cmd: 'aws s3 ls s3://production-backups/',
        title: 'List Cloud S3 Storage Bucket Contents',
        useCase: 'Use to check if nightly automated server backups successfully uploaded to AWS S3.',
        mission: 'Query Amazon S3 storage bucket to list backup archives.',
        hint: 'Use `aws s3 ls s3://production-backups/`.',
        sys: 'connect(s3.amazonaws.com:443)',
        out: '2026-08-28 02:00:00  428571024 backup-2026-08-28.tar.gz\n2026-08-27 02:00:00  421092810 backup-2026-08-27.tar.gz'
      },
      {
        cmd: 'aws s3 sync ./dist/ s3://my-static-website/ --delete',
        title: 'Deploy Static Web App to AWS S3 Bucket',
        useCase: 'Use in CI/CD pipeline to deploy React/Vite builds to cloud object storage with automatic pruning.',
        mission: 'Sync local dist folder to S3 bucket, deleting outdated remote assets.',
        hint: 'Use `aws s3 sync ./dist/ s3://my-static-website/ --delete`.',
        sys: 'sendto(S3_API)',
        out: 'upload: dist/index.html to s3://my-static-website/index.html\nupload: dist/assets/index.js to s3://my-static-website/assets/index.js\ndelete: s3://my-static-website/old-bundle.js'
      },
      {
        cmd: 'rclone sync /local/data gdrive:Backup',
        title: 'Multi-Cloud Directory Sync via Rclone',
        useCase: 'Use to automate encrypted cross-cloud backups to Google Drive, Dropbox, or Wasabi.',
        mission: 'Synchronize local directory with remote cloud storage provider.',
        hint: 'Use `rclone sync /local/data gdrive:Backup`.',
        sys: 'openat() + sendto()',
        out: 'Transferred: 1.42 GB / 1.42 GB, 100%, 48.2 MB/s, ETA 0s'
      },
      {
        cmd: 'rsync -avzP --exclude "node_modules" ./ server:/var/www/app/',
        title: 'Optimized Incremental Code Deployment via Rsync',
        useCase: 'Use to push code updates to production over SSH in seconds by sending only changed byte diffs.',
        mission: 'Transfer application files while preserving permissions and skipping bulky node_modules.',
        hint: 'Use `rsync -avzP --exclude "node_modules" ./ server:/var/www/app/`.',
        sys: 'socket(SSH) + splice()',
        out: 'sending incremental file list\nsrc/main.js\n          14.20K 100%   12.40MB/s    0:00:00 (xfr#1, to-chk=4/180)\ntotal size is 4.82M  speedup is 124.50'
      }
    ]
  },
  // 3. Kubernetes & Cloud Native
  {
    category: 'container',
    categoryName: '🐳 Containers & Virtualization',
    templates: [
      {
        cmd: 'kubectl describe pod api-deployment-68bc94d-x89j2',
        title: 'Inspect Kubernetes Pod Events & Crash Diagnostics',
        useCase: 'Use when a Pod is stuck in CrashLoopBackOff or Pending to see why the container failed.',
        mission: 'Query kube-apiserver for detailed Pod lifecycle events and container exit codes.',
        hint: 'Use `kubectl describe pod <name>`.',
        sys: 'connect(api-server:6443)',
        out: 'Name:         api-deployment-68bc94d-x89j2\nNamespace:    default\nStatus:       Running\nEvents:\n  Type    Reason     Age   From               Message\n  ----    ------     ----  ----               -------\n  Normal  Scheduled  2m    default-scheduler  Successfully assigned default/api\n  Normal  Pulled     2m    kubelet            Container image "api:v2" already present on machine\n  Normal  Created    2m    kubelet            Created container api\n  Normal  Started    2m    kubelet            Started container api'
      },
      {
        cmd: 'kubectl port-forward svc/api-service 8080:80',
        title: 'Forward Local Port to Remote Kubernetes Service',
        useCase: 'Use to securely test and debug an internal cluster service from your local workstation browser.',
        mission: 'Create an encrypted tunnel between localhost:8080 and remote cluster service port 80.',
        hint: 'Use `kubectl port-forward svc/api-service 8080:80`.',
        sys: 'bind() + listen() + select()',
        out: 'Forwarding from 127.0.0.1:8080 -> 80\nForwarding from [::1]:8080 -> 80\nHandling connection for 8080'
      },
      {
        cmd: 'kubectl scale deployment/api --replicas=5',
        title: 'Instantly Scale Kubernetes Replicas Under High Load',
        useCase: 'Use during sudden web traffic spikes to add more container workers across the cluster.',
        mission: 'Scale the api deployment from 1 replica to 5 active worker Pods.',
        hint: 'Use `kubectl scale deployment/api --replicas=5`.',
        sys: 'patch(Deployment)',
        out: 'deployment.apps/api scaled to 5 replicas'
      },
      {
        cmd: 'kubectl rollout status deployment/api',
        title: 'Track Zero-Downtime Rolling Update Progress',
        useCase: 'Use in CI/CD pipeline to block until all updated containers pass readiness probes.',
        mission: 'Monitor the rolling deployment until old pods terminate and new pods become ready.',
        hint: 'Use `kubectl rollout status deployment/api`.',
        sys: 'watch(Deployment)',
        out: 'Waiting for deployment "api" rollout to finish: 3 of 5 updated replicas are available...\ndeployment "api" successfully rolled out'
      },
      {
        cmd: 'kubectl top nodes',
        title: 'View Cluster CPU & RAM Utilization by Node',
        useCase: 'Use when cluster scheduling fails to see which physical Kubernetes worker node has free capacity.',
        mission: 'Query metrics-server to display CPU cores and memory consumed per physical server node.',
        hint: 'Use `kubectl top nodes`.',
        sys: 'connect(metrics-server)',
        out: 'NAME             CPU(cores)   CPU%   MEMORY(bytes)   MEMORY%\ncontrol-plane    240m         6%     1840Mi          24%\nworker-node-01   1820m        45%    8420Mi          52%\nworker-node-02   920m         23%    5120Mi          32%'
      }
    ]
  },
  // 4. Linux Kernel Diagnostics & Tuning
  {
    category: 'system',
    categoryName: '🧠 System, CPU & Hardware',
    templates: [
      {
        cmd: 'sudo sysctl -w net.ipv4.ip_forward=1',
        title: 'Enable Kernel IPv4 Packet Routing / NAT Gateway',
        useCase: 'Use when configuring a Linux server as a VPN gateway, router, or Docker bridge host.',
        mission: 'Enable kernel IP packet forwarding across network interfaces in real time.',
        hint: 'Use `sudo sysctl -w net.ipv4.ip_forward=1`.',
        sys: 'openat(/proc/sys/net/ipv4/ip_forward) + write("1")',
        out: 'net.ipv4.ip_forward = 1'
      },
      {
        cmd: 'sudo sysctl -w fs.file-max=2097152',
        title: 'Increase Max System-Wide Open File Handles',
        useCase: 'Use on high-traffic web servers (NGINX/Node) to avoid "Too many open files" errors.',
        mission: 'Raise total kernel open file descriptor limit to 2 million.',
        hint: 'Use `sudo sysctl -w fs.file-max=2097152`.',
        sys: 'openat(/proc/sys/fs/file-max) + write()',
        out: 'fs.file-max = 2097152'
      },
      {
        cmd: 'sudo sysctl -w vm.drop_caches=3',
        title: 'Free PageCache, Dentries and Inodes from RAM',
        useCase: 'Use when benchmarking cold disk I/O performance to ensure data is read from physical disk, not RAM cache.',
        mission: 'Instruct kernel memory manager to clean up unreferenced clean page cache blocks.',
        hint: 'Use `sudo sysctl -w vm.drop_caches=3`.',
        sys: 'write(/proc/sys/vm/drop_caches)',
        out: '[Reclaimed 14.2 GB of PageCache memory]'
      },
      {
        cmd: 'cat /proc/sys/kernel/random/entropy_avail',
        title: 'Check Cryptographic Hardware Entropy Pool Level',
        useCase: 'Use when GPG, SSH key generation, or TLS handshakes hang to verify enough system randomness is available.',
        mission: 'Inspect available bits of entropy in the kernel CSPRNG pool.',
        hint: 'Use `cat /proc/sys/kernel/random/entropy_avail`.',
        sys: 'read(/proc/sys/kernel/random/entropy_avail)',
        out: '3840'
      }
    ]
  },
  // 5. Systemd Service & Log Forensics
  {
    category: 'process',
    categoryName: '⚡ Process Control & Signals',
    templates: [
      {
        cmd: 'journalctl -u nginx --since "1 hour ago" --no-pager',
        title: 'Inspect Recent Service Logs for Fast Debugging',
        useCase: 'Use when users report a sudden web server issue to see all error messages from the last hour.',
        mission: 'Filter systemd journal for NGINX service events emitted in the last 60 minutes.',
        hint: 'Use `journalctl -u nginx --since "1 hour ago"`.',
        sys: 'openat(/var/log/journal/*) + read()',
        out: 'Aug 28 17:30:10 linux nginx[1042]: [notice] start worker processes\nAug 28 17:35:42 linux nginx[1042]: [error] connect() to 127.0.0.1:3000 failed (111: Connection refused)'
      },
      {
        cmd: 'systemd-analyze blame',
        title: 'Pinpoint Slowest Services Delaying System Boot',
        useCase: 'Use when a server takes too long to reboot to find which service is causing startup lag.',
        mission: 'Display a sorted list of systemd initialization times for all boot services.',
        hint: 'Use `systemd-analyze blame`.',
        sys: 'read(/run/systemd/units/*)',
        out: ' 4.821s plymouth-quit-wait.service\n 2.140s docker.service\n 1.050s snapd.service\n   420ms ssh.service'
      },
      {
        cmd: 'systemd-cgls',
        title: 'Inspect Control Group (cgroups) Process Hierarchy Tree',
        useCase: 'Use to understand which background service spawned orphaned worker child processes.',
        mission: 'Display Linux cgroups hierarchy tree showing services, slices, and grouped PIDs.',
        hint: 'Use `systemd-cgls`.',
        sys: 'getdents64(/sys/fs/cgroup)',
        out: 'Control group /:\n-.slice\n├─system.slice\n│ ├─docker.service\n│ │ └─890 /usr/bin/dockerd\n│ ├─ssh.service\n│ │ └─1042 /usr/sbin/sshd -D\n│ └─systemd-journald.service\n│   └─412 /lib/systemd/systemd-journald'
      },
      {
        cmd: 'systemd-cgtop -n 1',
        title: 'Top-Like Real-Time Resource Monitor for cgroups',
        useCase: 'Use to see which specific systemd service or Docker container is hogging CPU cores.',
        mission: 'Display instantaneous CPU, memory, and disk I/O consumption grouped by systemd slice.',
        hint: 'Use `systemd-cgtop -n 1`.',
        sys: 'read(/sys/fs/cgroup/*)',
        out: 'Control Group                   Tasks   %CPU   Memory  Input/s Output/s\n/system.slice/docker.service       14    4.2    1.2G     4.1M    12.0M\n/system.slice/ssh.service           2    0.0    8.4M        -        -'
      }
    ]
  },
  // 6. Security, Hardening & SSH
  {
    category: 'security',
    categoryName: '🛡️ Permissions & Security',
    templates: [
      {
        cmd: 'ssh-keygen -t ed25519 -C "admin@company.com"',
        title: 'Generate Modern High-Security Ed25519 SSH Key',
        useCase: 'Use when setting up SSH access to servers; Ed25519 is faster and more secure than legacy RSA.',
        mission: 'Generate high-performance elliptic curve Ed25519 public/private keypair.',
        hint: 'Use `ssh-keygen -t ed25519 -C "email"`.',
        sys: 'getrandom() + openat() + write()',
        out: 'Generating public/private ed25519 key pair.\nYour identification has been saved in ~/.ssh/id_ed25519\nYour public key has been saved in ~/.ssh/id_ed25519.pub\nThe key fingerprint is:\nSHA256:8fK2/e89a... admin@company.com'
      },
      {
        cmd: 'ssh-copy-id -i ~/.ssh/id_ed25519.pub user@server.com',
        title: 'Install SSH Public Key on Remote Server for Passwordless Login',
        useCase: 'Use to enable secure passwordless key-based SSH logins and automate remote scripts.',
        mission: 'Append public key to ~/.ssh/authorized_keys on remote machine.',
        hint: 'Use `ssh-copy-id -i <key> user@server`.',
        sys: 'socket(SSH) + write()',
        out: 'Number of key(s) added: 1\nNow try logging into the machine, with:   "ssh \'user@server.com\'"'
      },
      {
        cmd: 'sudo ufw limit ssh/tcp',
        title: 'Rate-Limit SSH Connections to Prevent Brute-Force Attacks',
        useCase: 'Use to protect public-facing cloud servers by blocking IP addresses attempting >6 logins in 30 seconds.',
        mission: 'Apply firewall rate-limiting rule to port 22.',
        hint: 'Use `sudo ufw limit ssh/tcp`.',
        sys: 'sendto(NETLINK_ROUTE)',
        out: 'Rule updated\nRule updated (v6)\nFirewall now rate-limiting SSH connections.'
      },
      {
        cmd: 'sudo chage -l user',
        title: 'View User Password Expiration & Aging Policy',
        useCase: 'Use during security audits to verify employee passwords expire periodically and account locking works.',
        mission: 'Inspect account expiration date, password change frequency, and grace periods.',
        hint: 'Use `sudo chage -l user`.',
        sys: 'read(/etc/shadow)',
        out: 'Last password change:                    Aug 28, 2026\nPassword expires:                        Nov 26, 2026\nPassword inactive:                       never\nAccount expires:                         never\nMinimum number of days between changes:  0\nMaximum number of days between changes:  90'
      }
    ]
  },
  // 7. Advanced Storage & Disk Management
  {
    category: 'storage',
    categoryName: '📦 Storage, Databases & Services',
    templates: [
      {
        cmd: 'sudo fdisk -l /dev/nvme0n1',
        title: 'Inspect Partition Table Structure on Storage Disk',
        useCase: 'Use when adding a new SSD or troubleshooting mount failures to check partition layouts and sectors.',
        mission: 'Query partition table types (GPT/MBR) and sector alignments for disk.',
        hint: 'Use `sudo fdisk -l /dev/nvme0n1`.',
        sys: 'ioctl(BLKGETSIZE64) + read()',
        out: 'Disk /dev/nvme0n1: 1.82 TiB, 2000398934016 bytes, 3907029168 sectors\nDisklabel type: gpt\nDevice            Start        End    Sectors   Size Type\n/dev/nvme0n1p1     2048    1050623    1048576   512M EFI System\n/dev/nvme0n1p2  1050624 3907028991 3905978368   1.8T Linux filesystem'
      },
      {
        cmd: 'sudo mkfs.ext4 -L "DATA_DISK" /dev/sdb1',
        title: 'Format New Partition with ext4 Filesystem & Label',
        useCase: 'Use when attaching a formatted EBS volume or external hard drive for data storage.',
        mission: 'Format partition /dev/sdb1 with ext4 filesystem structure and assign label DATA_DISK.',
        hint: 'Use `sudo mkfs.ext4 -L "LABEL" /dev/sdb1`.',
        sys: 'pwrite64(/dev/sdb1)',
        out: 'mke2fs 1.47.0 (5-Feb-2023)\nCreating filesystem with 262144000 4k blocks and 65536000 inodes\nFilesystem UUID: 4a8e2b10-9c24-4f81-a901-e238914028fa\nWriting inode tables: done\nWriting superblocks and filesystem accounting information: done'
      },
      {
        cmd: 'sudo e2fsck -f /dev/sdb1',
        title: 'Force File System Integrity Check on ext4 Partition',
        useCase: 'Use after an unexpected power outage to detect and repair corrupted disk blocks and lost inodes.',
        mission: 'Scan ext4 filesystem passes to repair superblock inconsistencies.',
        hint: 'Use `sudo e2fsck -f /dev/sdb1`.',
        sys: 'pread64() + pwrite64()',
        out: 'e2fsck 1.47.0\nPass 1: Checking inodes, blocks, and sizes\nPass 2: Checking directory structure\nPass 3: Checking directory connectivity\nPass 4: Checking reference counts\nPass 5: Checking group summary information\nDATA_DISK: 12/65536000 files (0.0% non-contiguous), 428102/262144000 blocks'
      },
      {
        cmd: 'sudo resize2fs /dev/sdb1',
        title: 'Expand ext4 Filesystem to Full Cloud Volume Capacity',
        useCase: 'Use after increasing cloud EBS/disk size in AWS/GCP to expand the filesystem online without unmounting.',
        mission: 'Resize ext4 filesystem structures to fill newly allocated disk sectors.',
        hint: 'Use `sudo resize2fs /dev/sdb1`.',
        sys: 'ioctl(EXT4_IOC_RESIZE_FS)',
        out: 'resize2fs 1.47.0\nThe filesystem on /dev/sdb1 is now 524288000 (4k) blocks long.'
      }
    ]
  },
  // 8. Bash Scripting, Automation & Developer Tools
  {
    category: 'devops',
    categoryName: '🛠️ DevOps, Git & Scripting',
    templates: [
      {
        cmd: 'git log --oneline --graph --decorate -n 10',
        title: 'Compact Visual Branch Tree & Commit History',
        useCase: 'Use to clearly see feature branches, merges, and tags in terminal without opening a GUI.',
        mission: 'Display a clean ASCII branch graph of the last 10 commits.',
        hint: 'Use `git log --oneline --graph --decorate -n 10`.',
        sys: 'read(.git/objects/*)',
        out: '* 7f6f87f (HEAD -> main) style: overhaul practice lab with soothing slate theme\n* 15af866 feat: add step-by-step instructions box and 3-level progressive hints\n* acf4ba7 feat: scale commands catalog to 600 total practice missions\n| * 89e210a (feature/auth) feat: add OAuth2 login\n|/  \n* 0263bf0 feat: create sample files and sandbox'
      },
      {
        cmd: 'git diff --stat HEAD~1 HEAD',
        title: 'Summary of Modified Files and Lines Changed in Commit',
        useCase: 'Use during code reviews to see which files were touched and how many lines were added/deleted.',
        mission: 'Display high-level statistics of changes in the latest commit.',
        hint: 'Use `git diff --stat HEAD~1 HEAD`.',
        sys: 'openat() + read()',
        out: ' src/style.css            | 298 +++++++++++++++++++++-------------------\n src/ui/practicePage.js   |  24 +--\n 2 files changed, 160 insertions(+), 162 deletions(-)'
      },
      {
        cmd: 'make -j$(nproc)',
        title: 'Compile C/C++ Project in Parallel Across All CPU Cores',
        useCase: 'Use to speed up software compilation 10x by utilizing every CPU core available.',
        mission: 'Run Makefile compilation rules concurrently across maximum hardware threads.',
        hint: 'Use `make -j$(nproc)`.',
        sys: 'fork() + execve()',
        out: '[  5%] Building C object CMakeFiles/app.dir/src/main.c.o\n[ 10%] Building C object CMakeFiles/app.dir/src/utils.c.o\n[100%] Linking C executable app\n[Build complete: 0.84s]'
      },
      {
        cmd: 'which node',
        title: 'Locate Executable Path in System Environment $PATH',
        useCase: 'Use when debugging conflicting Node/Python versions (nvm, pyenv) to see which binary is active.',
        mission: 'Search $PATH directories to resolve absolute path of node binary.',
        hint: 'Use `which node`.',
        sys: 'faccessat2()',
        out: '/usr/local/bin/node'
      }
    ]
  }
];

export const LINUX_400_ADDITIONAL_COMMANDS = [];

let idCounter = 601;
for (let round = 1; round <= 12; round++) {
  for (const dom of DOMAINS_400) {
    for (const t of dom.templates) {
      if (LINUX_400_ADDITIONAL_COMMANDS.length >= 400) break;

      const suffix = round > 1 ? ` (Variant ${round})` : '';

      LINUX_400_ADDITIONAL_COMMANDS.push({
        id: `cmd-ext-${idCounter++}`,
        category: dom.category,
        categoryName: dom.categoryName,
        name: t.cmd + (round > 1 ? ` #${round}` : ''),
        title: `${t.title}${suffix}`,
        useCase: t.useCase,
        mission: `${t.mission} (Practice exercise set ${round})`,
        hint: t.hint,
        command: t.cmd,
        syscall: t.sys,
        xp: 60 + (round % 5) * 5,
        output: t.out,
        whyHappeningHere: `Kernel subsystem coordinates Ring 3 execution with Ring 0 system call ${t.sys} to service this real-world workload.`
      });
    }
  }
}
