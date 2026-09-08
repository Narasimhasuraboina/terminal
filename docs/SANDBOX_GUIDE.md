# Practice Sandbox Filesystem Guide

Overview of pre-populated files in `practice_sandbox/` designed for real-world Linux command practice.

## Directory Structure
```text
practice_sandbox/
├── access.log              # Server web access log (IPs, HTTP methods, paths)
├── config/                 # System and service configuration files
│   ├── nginx.conf          # Nginx web server configuration
│   └── docker-compose.yml  # Microservices container definition
├── config.env              # Environment variable definitions
├── data.json               # Multi-record JSON dataset for jq & python
├── deploy.sh               # Executable bash deployment script
├── empty_dir/              # Empty test directory for rmdir & find tests
├── file_v1.txt             # Revision 1 text file for diff/patch
├── file_v2.txt             # Revision 2 text file for diff/patch
├── hosts                   # Simulated /etc/hosts network map
├── notes.txt               # Developer text notes with markdown formatting
├── project/                # Sample project tree for find/tree
├── scores.txt              # Numeric data for awk/sort calculations
├── script.py               # Sample Python utility script
├── server.log              # Multi-level application log (INFO, WARN, ERROR)
├── services.tsv            # Tab-delimited service port lookup table
├── sysinfo.sh              # Runnable system diagnostic tool
├── temp_cache/             # Temporary cached artifacts
├── users.csv               # Delimited user records for cut/awk
├── var_log/                # Simulated /var/log directory
│   ├── auth.log            # Sudo and SSH authentication events
│   └── nginx_access.log    # HTTP request logs
└── worker.py               # Background task consumer
```
