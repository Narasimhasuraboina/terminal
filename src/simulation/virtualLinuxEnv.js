// In-Memory Virtual Linux Environment & Real-Time Shell Simulation Engine
// Pre-populated with complete real files, directories, logs, configs, and command handlers

export class VirtualLinuxEnv {
  constructor() {
    this.user = 'user';
    this.hostname = 'linux';
    this.currentPath = '/home/user';
    this.env = {
      USER: 'user',
      HOME: '/home/user',
      SHELL: '/bin/bash',
      PATH: '/home/user/.local/bin:/usr/local/bin:/usr/bin:/bin',
      PWD: '/home/user',
      LANG: 'en_US.UTF-8',
      TERM: 'xterm-256color',
      PORT: '3000'
    };

    this.aliases = {
      ll: 'ls -la --color=auto',
      la: 'ls -A',
      l: 'ls -CF'
    };

    this.processes = [
      { pid: 1, ppid: 0, user: 'root', cpu: 0.1, mem: 0.4, cmd: '/sbin/init splash', stat: 'Ss' },
      { pid: 412, ppid: 1, user: 'root', cpu: 0.0, mem: 0.2, cmd: '/lib/systemd/systemd-journald', stat: 'Ss' },
      { pid: 890, ppid: 1, user: 'root', cpu: 0.2, mem: 1.1, cmd: '/usr/bin/dockerd -H fd://', stat: 'Ssl' },
      { pid: 1042, ppid: 1, user: 'root', cpu: 0.0, mem: 0.3, cmd: 'sshd: /usr/sbin/sshd -D', stat: 'Ss' },
      { pid: 1380, ppid: 1042, user: 'user', cpu: 0.0, mem: 0.3, cmd: 'sshd: user@pts/0', stat: 'S' },
      { pid: 1381, ppid: 1380, user: 'user', cpu: 0.1, mem: 0.5, cmd: '-bash', stat: 'Ss' },
      { pid: 1420, ppid: 1381, user: 'user', cpu: 1.8, mem: 2.4, cmd: 'node server.js', stat: 'Sl+' },
      { pid: 2150, ppid: 1381, user: 'user', cpu: 0.0, mem: 0.8, cmd: 'python3 worker.py', stat: 'S' }
    ];

    this.fs = this.initFilesystem();
    this.commandHistory = [];
  }

  initFilesystem() {
    return {
      type: 'dir',
      perm: 'rwxr-xr-x',
      owner: 'root',
      group: 'root',
      children: {
        home: {
          type: 'dir',
          perm: 'rwxr-xr-x',
          owner: 'root',
          group: 'root',
          children: {
            user: {
              type: 'dir',
              perm: 'rwxr-xr-x',
              owner: 'user',
              group: 'user',
              children: {
                '.bashrc': {
                  type: 'file',
                  perm: 'rw-r--r--',
                  owner: 'user',
                  group: 'user',
                  content: '# ~/.bashrc\nalias ll="ls -la --color=auto"\nexport PATH="$HOME/.local/bin:$PATH"\nexport PS1="\\u@\\h:\\w\\$ "'
                },
                '.bash_history': {
                  type: 'file',
                  perm: 'rw-------',
                  owner: 'user',
                  group: 'user',
                  content: 'ls -la\npwd\nmkdir project\ncd project\nnpm run dev'
                },
                'notes.txt': {
                  type: 'file',
                  perm: 'rw-r--r--',
                  owner: 'user',
                  group: 'user',
                  content: 'Linux Operating System Notes:\n- User Space operates in Ring 3 (restricted)\n- Kernel Mode operates in Ring 0 (full hardware access)\n- System Calls (Syscalls) bridge Ring 3 and Ring 0\n- Virtual Memory uses 4-level page table translation'
                },
                'scores.txt': {
                  type: 'file',
                  perm: 'rw-r--r--',
                  owner: 'user',
                  group: 'user',
                  content: 'Alice 98\nCharlie 91\nBob 84\nDave 73'
                },
                'access.log': {
                  type: 'file',
                  perm: 'rw-r--r--',
                  owner: 'user',
                  group: 'user',
                  content: '192.168.1.100\n192.168.1.100\n192.168.1.105\n192.168.1.100\n10.0.0.12\n192.168.1.105\n192.168.1.100'
                },
                'config.env': {
                  type: 'file',
                  perm: 'rw-r--r--',
                  owner: 'user',
                  group: 'user',
                  content: 'PORT=3000\nAPI_HOST=localhost:3000\nNODE_ENV=production\nDATABASE_URL=postgres://user:pass@localhost:5432/app'
                },
                'users.csv': {
                  type: 'file',
                  perm: 'rw-r--r--',
                  owner: 'user',
                  group: 'user',
                  content: 'ID,Name,Email,Role\n101,Alice,alice@example.com,Admin\n102,Bob,bob@example.com,Developer\n103,Charlie,charlie@example.com,Designer\n104,Dave,dave@example.com,DevOps'
                },
                'file_v1.txt': {
                  type: 'file',
                  perm: 'rw-r--r--',
                  owner: 'user',
                  group: 'user',
                  content: 'const port = 3000;\nconst debug = true;\napp.listen(port);'
                },
                'file_v2.txt': {
                  type: 'file',
                  perm: 'rw-r--r--',
                  owner: 'user',
                  group: 'user',
                  content: 'const port = 3000;\nconst debug = false;\napp.listen(port);'
                },
                'server.log': {
                  type: 'file',
                  perm: 'rw-r--r--',
                  owner: 'user',
                  group: 'user',
                  content: '[2026-08-28 12:00:00] Server started on port 3000\n[2026-08-28 12:05:10] Database connection pool initialized\n[2026-08-28 12:10:32] Ready for incoming requests'
                },
                'deploy.sh': {
                  type: 'file',
                  perm: 'rw-r--r--',
                  owner: 'user',
                  group: 'user',
                  content: '#!/bin/bash\necho "Deploying application..."\nnpm run build\nsudo systemctl restart nginx\necho "Deployment complete!"'
                },
                'script.py': {
                  type: 'file',
                  perm: 'rw-r--r--',
                  owner: 'user',
                  group: 'user',
                  content: '#!/usr/bin/env python3\nprint("Script execution successful!")'
                },
                'worker.py': {
                  type: 'file',
                  perm: 'rwxr-xr-x',
                  owner: 'user',
                  group: 'user',
                  content: '#!/usr/bin/env python3\nimport time\nprint("Worker process running [PID 2150]")'
                },
                'old_app.js': {
                  type: 'file',
                  perm: 'rw-r--r--',
                  owner: 'user',
                  group: 'user',
                  content: 'console.log("Legacy application v1");'
                },
                'app.js': {
                  type: 'file',
                  perm: 'rw-r--r--',
                  owner: 'user',
                  group: 'user',
                  content: 'import express from "express";\nconst app = express();\nconst PORT = process.env.PORT || 3000;\n\napp.get("/", (req, res) => {\n  res.send("Hello from 3D Linux Subsystem!");\n});\n\napp.listen(PORT, () => {\n  console.log(`Server listening on port ${PORT}`);\n});'
                },
                'empty_dir': {
                  type: 'dir',
                  perm: 'rwxr-xr-x',
                  owner: 'user',
                  group: 'user',
                  children: {}
                },
                'config': {
                  type: 'dir',
                  perm: 'rwxr-xr-x',
                  owner: 'user',
                  group: 'user',
                  children: {
                    'settings.json': {
                      type: 'file',
                      perm: 'rw-r--r--',
                      owner: 'user',
                      group: 'user',
                      content: '{\n  "theme": "cyber-dark",\n  "sound": true,\n  "fps": 60\n}'
                    },
                    'database.conf': {
                      type: 'file',
                      perm: 'rw-r--r--',
                      owner: 'user',
                      group: 'user',
                      content: 'host=127.0.0.1\nport=5432\npool_size=20'
                    }
                  }
                },
                'temp_cache': {
                  type: 'dir',
                  perm: 'rwxr-xr-x',
                  owner: 'user',
                  group: 'user',
                  children: {
                    'session.tmp': { type: 'file', perm: 'rw-r--r--', owner: 'user', group: 'user', content: 'session_token_9f81a7' },
                    'cache_01.tmp': { type: 'file', perm: 'rw-r--r--', owner: 'user', group: 'user', content: 'cached_data_chunk_1' }
                  }
                },
                'node_modules': {
                  type: 'dir',
                  perm: 'rwxr-xr-x',
                  owner: 'user',
                  group: 'user',
                  children: {
                    'express': { type: 'dir', perm: 'rwxr-xr-x', owner: 'user', group: 'user', children: {} },
                    'three': { type: 'dir', perm: 'rwxr-xr-x', owner: 'user', group: 'user', children: {} }
                  }
                },
                'project': {
                  type: 'dir',
                  perm: 'rwxr-xr-x',
                  owner: 'user',
                  group: 'user',
                  children: {
                    'src': {
                      type: 'dir',
                      perm: 'rwxr-xr-x',
                      owner: 'user',
                      group: 'user',
                      children: {
                        'main.c': {
                          type: 'file',
                          perm: 'rw-r--r--',
                          owner: 'user',
                          group: 'user',
                          content: '#include <stdio.h>\n#include <unistd.h>\n\nint main() {\n    printf("Running on PID %d\\n", getpid());\n    return 0;\n}'
                        },
                        'utils.c': {
                          type: 'file',
                          perm: 'rw-r--r--',
                          owner: 'user',
                          group: 'user',
                          content: '#include <stdio.h>\nvoid log_event(const char* msg) {\n    printf("[LOG] %s\\n", msg);\n}'
                        }
                      }
                    },
                    'README.md': {
                      type: 'file',
                      perm: 'rw-r--r--',
                      owner: 'user',
                      group: 'user',
                      content: '# 3D Linux Terminal Project\nInteractive Linux Subsystem & Command Execution Visualization.'
                    }
                  }
                },
                'Makefile': {
                  type: 'file',
                  perm: 'rw-r--r--',
                  owner: 'user',
                  group: 'user',
                  content: 'CC = gcc\nCFLAGS = -Wall -O2\n\nall: main\n\nmain: main.c\n\t$(CC) $(CFLAGS) -o main main.c\n\nclean:\n\trm -f main *.o'
                }
              }
            }
          }
        },
        etc: {
          type: 'dir',
          perm: 'rwxr-xr-x',
          owner: 'root',
          group: 'root',
          children: {
            passwd: {
              type: 'file',
              perm: 'rw-r--r--',
              owner: 'root',
              group: 'root',
              content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nbin:x:2:2:bin:/bin:/usr/sbin/nologin\nsys:x:3:3:sys:/dev:/usr/sbin/nologin\nsync:x:4:65534:sync:/bin:/bin/sync\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\nuser:x:1000:1000:Linux User,,,:/home/user:/bin/bash'
            },
            group: {
              type: 'file',
              perm: 'rw-r--r--',
              owner: 'root',
              group: 'root',
              content: 'root:x:0:\nadm:x:4:user\nsudo:x:27:user\ndocker:x:998:user\nuser:x:1000:'
            },
            'os-release': {
              type: 'file',
              perm: 'rw-r--r--',
              owner: 'root',
              group: 'root',
              content: 'PRETTY_NAME="Ubuntu 24.04.1 LTS"\nNAME="Ubuntu"\nVERSION_ID="24.04"\nVERSION="24.04 LTS (Noble Numbat)"\nID=ubuntu\nHOME_URL="https://www.ubuntu.com/"'
            },
            shadow: {
              type: 'file',
              perm: 'rw-------',
              owner: 'root',
              group: 'shadow',
              content: 'root:$6$vQ1$eO2k0L...:19820:0:99999:7:::\nuser:$6$z8K$9sX4...:19820:0:99999:7:::'
            },
            hosts: {
              type: 'file',
              perm: 'rw-r--r--',
              owner: 'root',
              group: 'root',
              content: '127.0.0.1\tlocalhost\n127.0.1.1\tlinux-workstation\n::1\tlocalhost ip6-localhost ip6-loopback'
            },
            'resolv.conf': {
              type: 'file',
              perm: 'rw-r--r--',
              owner: 'root',
              group: 'root',
              content: 'nameserver 127.0.0.53\noptions edns0 trust-ad\nsearch localdomain'
            },
            sudoers: {
              type: 'file',
              perm: 'r--r-----',
              owner: 'root',
              group: 'root',
              content: 'root ALL=(ALL:ALL) ALL\n%sudo ALL=(ALL:ALL) ALL\nuser ALL=(ALL:ALL) NOPASSWD: ALL'
            }
          }
        },
        var: {
          type: 'dir',
          perm: 'rwxr-xr-x',
          owner: 'root',
          group: 'root',
          children: {
            log: {
              type: 'dir',
              perm: 'rwxr-xr-x',
              owner: 'root',
              group: 'root',
              children: {
                syslog: {
                  type: 'file',
                  perm: 'rw-r-----',
                  owner: 'syslog',
                  group: 'adm',
                  content: 'Aug 28 12:00:00 linux kernel: [ 0.000000] Linux version 6.8.0-generic (buildd@lcy02)\nAug 28 12:00:01 linux systemd[1]: Starting Daily apt download activities...\nAug 28 12:00:02 linux kernel: [ 0.245120] x86/fpu: Supporting XSAVE feature 0x001\nAug 28 12:00:05 linux systemd[1]: Reached target Graphical Interface.'
                },
                'boot.log': {
                  type: 'file',
                  perm: 'rw-r--r--',
                  owner: 'root',
                  group: 'root',
                  content: '[ OK ] Started Hardware RNG Entropy Gatherer Daemon.\n[ OK ] Reached target System Initialization.\n[ OK ] Started Daily Cleanup of Temporary Directories.'
                },
                nginx: {
                  type: 'dir',
                  perm: 'rwxr-xr-x',
                  owner: 'www-data',
                  group: 'adm',
                  children: {
                    'access.log': {
                      type: 'file',
                      perm: 'rw-r-----',
                      owner: 'www-data',
                      group: 'adm',
                      content: '192.168.1.50 - - [28/Aug/2026:14:20:10 +0000] "GET /api/status HTTP/1.1" 200 128\n192.168.1.51 - - [28/Aug/2026:14:20:12 +0000] "POST /api/login HTTP/1.1" 200 48'
                    }
                  }
                },
                wtmp: {
                  type: 'file',
                  perm: 'rw-rw-r--',
                  owner: 'root',
                  group: 'utmp',
                  content: '[binary utmp log records]'
                }
              }
            },
            www: {
              type: 'dir',
              perm: 'rwxr-xr-x',
              owner: 'root',
              group: 'root',
              children: {
                html: {
                  type: 'dir',
                  perm: 'rwxr-xr-x',
                  owner: 'www-data',
                  group: 'www-data',
                  children: {
                    'index.html': {
                      type: 'file',
                      perm: 'rw-r--r--',
                      owner: 'www-data',
                      group: 'www-data',
                      content: '<h1>Welcome to Linux Server</h1>'
                    }
                  }
                }
              }
            }
          }
        },
        proc: {
          type: 'dir',
          perm: 'r-xr-xr-x',
          owner: 'root',
          group: 'root',
          children: {
            version: {
              type: 'file',
              perm: 'r--r--r--',
              owner: 'root',
              group: 'root',
              content: 'Linux version 6.8.0-45-generic (buildd@x86-64) (gcc 13.2.0) #45-Ubuntu SMP PREEMPT_DYNAMIC Fri Aug 28 12:00:00 UTC 2026'
            },
            meminfo: {
              type: 'file',
              perm: 'r--r--r--',
              owner: 'root',
              group: 'root',
              content: 'MemTotal:       32768000 kB\nMemFree:        18432000 kB\nMemAvailable:   24576000 kB\nBuffers:          524288 kB\nCached:          6291456 kB\nSwapTotal:       8388608 kB\nSwapFree:        8388608 kB'
            },
            cpuinfo: {
              type: 'file',
              perm: 'r--r--r--',
              owner: 'root',
              group: 'root',
              content: 'processor\t: 0\nvendor_id\t: GenuineIntel\ncpu family\t: 6\nmodel name\t: Intel(R) Core(TM) i9-14900K\ncpu MHz\t\t: 5800.000\ncache size\t: 36864 KB\ncpu cores\t: 16\nsiblings\t: 32'
            },
            modules: {
              type: 'file',
              perm: 'r--r--r--',
              owner: 'root',
              group: 'root',
              content: 'nvidia_uvm 1523712 0 - Live 0xffffffffc0800000 (POE)\nnvidia_drm 94208 4 - Live 0xffffffffc07a0000 (POE)\nnvme 61440 3 - Live 0xffffffffc0620000\next4 1048576 2 - Live 0xffffffffc0400000'
            },
            sys: {
              type: 'dir',
              perm: 'r-xr-xr-x',
              owner: 'root',
              group: 'root',
              children: {
                vm: {
                  type: 'dir',
                  perm: 'r-xr-xr-x',
                  owner: 'root',
                  group: 'root',
                  children: {
                    swappiness: {
                      type: 'file',
                      perm: 'rw-r--r--',
                      owner: 'root',
                      group: 'root',
                      content: '60'
                    }
                  }
                }
              }
            }
          }
        },
        mnt: {
          type: 'dir',
          perm: 'rwxr-xr-x',
          owner: 'root',
          group: 'root',
          children: {
            usb_drive: {
              type: 'dir',
              perm: 'rwxr-xr-x',
              owner: 'root',
              group: 'root',
              children: {}
            }
          }
        },
        tmp: {
          type: 'dir',
          perm: 'rwxrwxrwt',
          owner: 'root',
          group: 'root',
          children: {
            extracted: {
              type: 'dir',
              perm: 'rwxr-xr-x',
              owner: 'user',
              group: 'user',
              children: {}
            }
          }
        }
      }
    };
  }

  resolvePath(pathStr) {
    if (!pathStr || pathStr === '.') return this.currentPath;
    if (pathStr === '~') return this.env.HOME;
    if (pathStr.startsWith('~/')) {
      pathStr = this.env.HOME + pathStr.slice(1);
    }

    let parts;
    if (pathStr.startsWith('/')) {
      parts = pathStr.split('/').filter(Boolean);
    } else {
      const currentParts = this.currentPath.split('/').filter(Boolean);
      parts = [...currentParts, ...pathStr.split('/').filter(Boolean)];
    }

    const resolved = [];
    for (const part of parts) {
      if (part === '.') continue;
      if (part === '..') {
        if (resolved.length > 0) resolved.pop();
      } else {
        resolved.push(part);
      }
    }

    return '/' + resolved.join('/');
  }

  getNode(pathStr) {
    const fullPath = this.resolvePath(pathStr);
    if (fullPath === '/') return this.fs;

    const parts = fullPath.split('/').filter(Boolean);
    let curr = this.fs;

    for (const part of parts) {
      if (!curr || curr.type !== 'dir' || !curr.children) return null;
      curr = curr.children[part];
      if (!curr) return null;
    }

    return curr;
  }

  getPromptPath() {
    if (this.currentPath === this.env.HOME) return '~';
    if (this.currentPath.startsWith(this.env.HOME + '/')) {
      return '~' + this.currentPath.slice(this.env.HOME.length);
    }
    return this.currentPath;
  }

  // =========================================================================
  // EXECUTION ENGINE
  // =========================================================================
  execute(cmdLine) {
    const trimmed = (cmdLine || '').trim();
    if (!trimmed) return { output: '', code: 0 };

    this.commandHistory.push(trimmed);

    // Handle piping: e.g. "cat notes.txt | grep Linux | wc -l"
    if (trimmed.includes('|')) {
      return this.executePipeline(trimmed);
    }

    // Handle stdout redirect: e.g. "echo hello > file.txt" or ">> file.txt"
    if (trimmed.includes('>')) {
      return this.executeRedirect(trimmed);
    }

    return this.executeSingleCommand(trimmed);
  }

  executePipeline(pipelineStr) {
    const stages = pipelineStr.split('|').map(s => s.trim()).filter(Boolean);
    let pipedInput = '';
    let lastCode = 0;

    for (let i = 0; i < stages.length; i++) {
      const res = this.executeSingleCommand(stages[i], pipedInput);
      pipedInput = res.output;
      lastCode = res.code;
    }

    return { output: pipedInput, code: lastCode };
  }

  executeRedirect(cmdStr) {
    const isAppend = cmdStr.includes('>>');
    const parts = isAppend ? cmdStr.split('>>') : cmdStr.split('>');
    const leftCmd = parts[0].trim();
    const targetFile = parts[1].trim();

    const res = this.executeSingleCommand(leftCmd);
    if (res.code !== 0) return res;

    // Write to virtual file
    const node = this.getNode(targetFile);
    if (node && node.type === 'file') {
      node.content = isAppend ? (node.content + '\n' + res.output) : res.output;
    } else {
      // Create new file
      const resolved = this.resolvePath(targetFile);
      const slashIdx = resolved.lastIndexOf('/');
      const parentPath = resolved.slice(0, slashIdx) || '/';
      const fileName = resolved.slice(slashIdx + 1);

      const parent = this.getNode(parentPath);
      if (parent && parent.type === 'dir') {
        parent.children[fileName] = {
          type: 'file',
          perm: 'rw-r--r--',
          owner: this.user,
          group: this.user,
          content: res.output
        };
      }
    }

    return { output: '', code: 0 };
  }

  executeSingleCommand(cmdStr, stdin = '') {
    // Strip leading sudo
    let actualCmd = cmdStr;
    let isSudo = false;
    if (actualCmd.startsWith('sudo ')) {
      isSudo = true;
      actualCmd = actualCmd.slice(5).trim();
    }

    const parts = actualCmd.split(/\s+/).filter(Boolean);
    const cmdName = parts[0];
    const args = parts.slice(1);

    // Check aliases
    if (this.aliases[cmdName]) {
      const aliasFull = this.aliases[cmdName] + ' ' + args.join(' ');
      return this.executeSingleCommand(aliasFull.trim(), stdin);
    }

    switch (cmdName) {
      case 'pwd':
        return { output: this.currentPath, code: 0 };

      case 'cd': {
        const target = args[0] || '~';
        const newPath = this.resolvePath(target);
        const node = this.getNode(newPath);
        if (!node) {
          return { output: `bash: cd: ${target}: No such file or directory`, code: 1 };
        }
        if (node.type !== 'dir') {
          return { output: `bash: cd: ${target}: Not a directory`, code: 1 };
        }
        this.currentPath = newPath;
        this.env.PWD = newPath;
        return { output: '', code: 0 };
      }

      case 'ls': {
        const showAll = args.some(a => a.includes('a') && a.startsWith('-'));
        const longListing = args.some(a => a.includes('l') && a.startsWith('-'));
        const targetPath = args.find(a => !a.startsWith('-')) || '.';
        
        const node = this.getNode(targetPath);
        if (!node) return { output: `ls: cannot access '${targetPath}': No such file or directory`, code: 2 };

        if (node.type === 'file') {
          return { output: longListing ? `-rw-r--r-- 1 ${node.owner} ${node.group} ${node.content.length} Aug 28 14:00 ${targetPath}` : targetPath, code: 0 };
        }

        const entries = Object.keys(node.children || {}).sort();
        const allEntries = showAll ? ['.', '..', ...entries] : entries.filter(e => !e.startsWith('.'));

        if (longListing) {
          const lines = [`total ${allEntries.length * 4}`];
          allEntries.forEach(entry => {
            if (entry === '.' || entry === '..') {
              lines.push(`drwxr-xr-x 2 ${this.user} ${this.user} 4096 Aug 28 14:00 ${entry}`);
            } else {
              const child = node.children[entry];
              const prefix = child.type === 'dir' ? 'd' : '-';
              const size = child.type === 'dir' ? 4096 : (child.content ? child.content.length : 0);
              lines.push(`${prefix}${child.perm || 'rwxr-xr-x'} 1 ${child.owner} ${child.group} ${String(size).padStart(5, ' ')} Aug 28 14:00 ${entry}`);
            }
          });
          return { output: lines.join('\n'), code: 0 };
        } else {
          return { output: allEntries.join('  '), code: 0 };
        }
      }

      case 'cat': {
        if (stdin && args.length === 0) return { output: stdin, code: 0 };
        if (args.length === 0) return { output: '', code: 0 };

        const outputs = [];
        for (const filePath of args) {
          const node = this.getNode(filePath);
          if (!node) return { output: `cat: ${filePath}: No such file or directory`, code: 1 };
          if (node.type === 'dir') return { output: `cat: ${filePath}: Is a directory`, code: 1 };
          outputs.push(node.content || '');
        }
        return { output: outputs.join('\n'), code: 0 };
      }

      case 'mkdir': {
        const makeParents = args.includes('-p');
        const targetPath = args.find(a => !a.startsWith('-'));
        if (!targetPath) return { output: 'mkdir: missing operand', code: 1 };

        const fullPath = this.resolvePath(targetPath);
        const parts = fullPath.split('/').filter(Boolean);

        let curr = this.fs;
        for (let i = 0; i < parts.length; i++) {
          const p = parts[i];
          if (!curr.children[p]) {
            if (!makeParents && i < parts.length - 1) {
              return { output: `mkdir: cannot create directory '${targetPath}': No such file or directory`, code: 1 };
            }
            curr.children[p] = {
              type: 'dir',
              perm: 'rwxr-xr-x',
              owner: this.user,
              group: this.user,
              children: {}
            };
          }
          curr = curr.children[p];
        }
        return { output: '', code: 0 };
      }

      case 'rmdir': {
        const target = args[0];
        if (!target) return { output: 'rmdir: missing operand', code: 1 };
        const node = this.getNode(target);
        if (!node) return { output: `rmdir: failed to remove '${target}': No such file or directory`, code: 1 };
        if (node.type !== 'dir') return { output: `rmdir: failed to remove '${target}': Not a directory`, code: 1 };
        if (node.children && Object.keys(node.children).length > 0) {
          return { output: `rmdir: failed to remove '${target}': Directory not empty`, code: 1 };
        }
        const fullPath = this.resolvePath(target);
        const slashIdx = fullPath.lastIndexOf('/');
        const parentPath = fullPath.slice(0, slashIdx) || '/';
        const dirName = fullPath.slice(slashIdx + 1);
        const parent = this.getNode(parentPath);
        if (parent && parent.children) delete parent.children[dirName];
        return { output: '', code: 0 };
      }

      case 'touch': {
        const target = args[0];
        if (!target) return { output: 'touch: missing file operand', code: 1 };

        const fullPath = this.resolvePath(target);
        const slashIdx = fullPath.lastIndexOf('/');
        const parentPath = fullPath.slice(0, slashIdx) || '/';
        const fileName = fullPath.slice(slashIdx + 1);

        const parent = this.getNode(parentPath);
        if (!parent || parent.type !== 'dir') {
          return { output: `touch: cannot touch '${target}': No such file or directory`, code: 1 };
        }

        if (!parent.children[fileName]) {
          parent.children[fileName] = {
            type: 'file',
            perm: 'rw-r--r--',
            owner: this.user,
            group: this.user,
            content: ''
          };
        }
        return { output: '', code: 0 };
      }

      case 'cp': {
        const isRecursive = args.some(a => (a.includes('r') || a.includes('R')) && a.startsWith('-'));
        const nonFlags = args.filter(a => !a.startsWith('-'));
        if (nonFlags.length < 2) return { output: 'cp: missing file operand', code: 1 };

        const srcPath = nonFlags[0];
        const destPath = nonFlags[1];

        const srcNode = this.getNode(srcPath);
        if (!srcNode) return { output: `cp: cannot stat '${srcPath}': No such file or directory`, code: 1 };

        if (srcNode.type === 'dir' && !isRecursive) {
          return { output: `cp: -r not specified; omitting directory '${srcPath}'`, code: 1 };
        }

        const cloneNode = (node) => {
          if (node.type === 'file') {
            return { type: 'file', perm: node.perm, owner: this.user, group: this.user, content: node.content };
          }
          const newChildren = {};
          for (const k of Object.keys(node.children || {})) {
            newChildren[k] = cloneNode(node.children[k]);
          }
          return { type: 'dir', perm: node.perm, owner: this.user, group: this.user, children: newChildren };
        };

        const resolvedDest = this.resolvePath(destPath);
        const slashIdx = resolvedDest.lastIndexOf('/');
        const parentPath = resolvedDest.slice(0, slashIdx) || '/';
        const targetName = resolvedDest.slice(slashIdx + 1);

        const parent = this.getNode(parentPath);
        if (parent && parent.type === 'dir') {
          parent.children[targetName] = cloneNode(srcNode);
        }
        return { output: '', code: 0 };
      }

      case 'mv': {
        const nonFlags = args.filter(a => !a.startsWith('-'));
        if (nonFlags.length < 2) return { output: 'mv: missing file operand', code: 1 };

        const src = nonFlags[0];
        const dest = nonFlags[1];

        const srcNode = this.getNode(src);
        if (!srcNode) return { output: `mv: cannot stat '${src}': No such file or directory`, code: 1 };

        // Remove from old parent
        const resolvedSrc = this.resolvePath(src);
        const srcSlash = resolvedSrc.lastIndexOf('/');
        const srcParent = this.getNode(resolvedSrc.slice(0, srcSlash) || '/');
        const srcName = resolvedSrc.slice(srcSlash + 1);

        const resolvedDest = this.resolvePath(dest);
        const destSlash = resolvedDest.lastIndexOf('/');
        const destParent = this.getNode(resolvedDest.slice(0, destSlash) || '/');
        const destName = resolvedDest.slice(destSlash + 1);

        if (srcParent && destParent) {
          delete srcParent.children[srcName];
          destParent.children[destName] = srcNode;
        }
        return { output: '', code: 0 };
      }

      case 'rm': {
        const recursive = args.some(a => a.includes('r') && a.startsWith('-'));
        const force = args.some(a => a.includes('f') && a.startsWith('-'));
        const target = args.find(a => !a.startsWith('-'));
        if (!target) return { output: 'rm: missing operand', code: 1 };

        const fullPath = this.resolvePath(target);
        const slashIdx = fullPath.lastIndexOf('/');
        const parentPath = fullPath.slice(0, slashIdx) || '/';
        const fileName = fullPath.slice(slashIdx + 1);

        const parent = this.getNode(parentPath);
        if (!parent || !parent.children[fileName]) {
          if (force) return { output: '', code: 0 };
          return { output: `rm: cannot remove '${target}': No such file or directory`, code: 1 };
        }

        const child = parent.children[fileName];
        if (child.type === 'dir' && !recursive) {
          return { output: `rm: cannot remove '${target}': Is a directory`, code: 1 };
        }

        delete parent.children[fileName];
        return { output: '', code: 0 };
      }

      case 'echo': {
        const str = args.join(' ').replace(/^["']|["']$/g, '');
        const expanded = str.replace(/\$([A-Z_]+)/g, (_, v) => this.env[v] || '');
        return { output: expanded, code: 0 };
      }

      case 'grep': {
        const ignoreCase = args.some(a => a.includes('i') && a.startsWith('-'));
        const lineNums = args.some(a => a.includes('n') && a.startsWith('-'));
        const nonFlagArgs = args.filter(a => !a.startsWith('-'));
        const patternStr = (nonFlagArgs[0] || '').replace(/^["']|["']$/g, '');
        const targetFile = nonFlagArgs[1];

        let content = stdin;
        if (targetFile) {
          const node = this.getNode(targetFile);
          if (!node) return { output: `grep: ${targetFile}: No such file or directory`, code: 2 };
          if (node.type === 'dir') return { output: `grep: ${targetFile}: Is a directory`, code: 2 };
          content = node.content || '';
        }

        if (!patternStr) return { output: '', code: 1 };

        const flags = ignoreCase ? 'i' : '';
        const regex = new RegExp(patternStr, flags);
        const lines = content.split('\n');
        const matches = [];

        lines.forEach((line, idx) => {
          if (regex.test(line)) {
            matches.push(lineNums ? `${idx + 1}:${line}` : line);
          }
        });

        return { output: matches.join('\n'), code: matches.length > 0 ? 0 : 1 };
      }

      case 'wc': {
        const targetFile = args.find(a => !a.startsWith('-'));
        let content = stdin;

        if (targetFile) {
          const node = this.getNode(targetFile);
          if (node && node.type === 'file') content = node.content;
        }

        const lines = content ? content.split('\n').length : 0;
        const words = content ? content.trim().split(/\s+/).length : 0;
        const bytes = content ? content.length : 0;

        if (args.includes('-l')) {
          return { output: String(lines), code: 0 };
        }
        return { output: `  ${lines}  ${words} ${bytes}${targetFile ? ' ' + targetFile : ''}`, code: 0 };
      }

      case 'sort': {
        const reverse = args.some(a => a.includes('r') && a.startsWith('-'));
        const num = args.some(a => a.includes('n') && a.startsWith('-'));
        const targetFile = args.find(a => !a.startsWith('-'));
        let content = stdin;

        if (targetFile) {
          const node = this.getNode(targetFile);
          if (node && node.type === 'file') content = node.content;
        }

        if (!content) return { output: '', code: 0 };
        let lines = content.split('\n').filter(Boolean);

        lines.sort((a, b) => {
          if (num) {
            const numA = parseFloat(a.replace(/[^\d.-]/g, '')) || 0;
            const numB = parseFloat(b.replace(/[^\d.-]/g, '')) || 0;
            return reverse ? numB - numA : numA - numB;
          }
          return reverse ? b.localeCompare(a) : a.localeCompare(b);
        });

        return { output: lines.join('\n'), code: 0 };
      }

      case 'uniq': {
        const count = args.includes('-c');
        let content = stdin;
        if (!content) return { output: '', code: 0 };

        const lines = content.split('\n').filter(Boolean);
        const map = {};
        lines.forEach(l => map[l] = (map[l] || 0) + 1);

        const out = Object.entries(map).map(([k, v]) => count ? `     ${v} ${k}` : k);
        return { output: out.join('\n'), code: 0 };
      }

      case 'cut': {
        const dIdx = args.findIndex(a => a.startsWith('-d'));
        const fIdx = args.findIndex(a => a.startsWith('-f'));
        const delim = dIdx > -1 ? args[dIdx].replace('-d', '').replace(/['"]/g, '') || ',' : ',';
        const fields = fIdx > -1 ? args[fIdx].replace('-f', '').split(',').map(n => parseInt(n) - 1) : [0];
        const targetFile = args.find(a => !a.startsWith('-'));

        let content = stdin;
        if (targetFile) {
          const node = this.getNode(targetFile);
          if (node && node.type === 'file') content = node.content;
        }

        if (!content) return { output: '', code: 0 };
        const lines = content.split('\n');
        const out = lines.map(line => {
          const cols = line.split(delim);
          return fields.map(f => cols[f] || '').filter(Boolean).join(delim);
        });

        return { output: out.join('\n'), code: 0 };
      }

      case 'sed': {
        const expr = args.find(a => a.startsWith('s/'));
        const targetFile = args.find(a => !a.startsWith('-') && !a.startsWith('s/'));
        if (!expr) return { output: '', code: 0 };

        const parts = expr.split('/');
        const findStr = parts[1];
        const replStr = parts[2];

        if (targetFile) {
          const node = this.getNode(targetFile);
          if (node && node.type === 'file') {
            node.content = node.content.replaceAll(findStr, replStr);
            return { output: '', code: 0 };
          }
        }
        return { output: stdin.replaceAll(findStr, replStr), code: 0 };
      }

      case 'diff': {
        const file1 = args.find(a => !a.startsWith('-'));
        const file2 = args.filter(a => !a.startsWith('-'))[1];
        const node1 = file1 ? this.getNode(file1) : null;
        const node2 = file2 ? this.getNode(file2) : null;

        if (!node1 || !node2) return { output: 'diff: missing operand', code: 1 };
        return {
          output: `--- ${file1}\n+++ ${file2}\n@@ -1,3 +1,3 @@\n const port = 3000;\n-const debug = true;\n+const debug = false;\n app.listen(port);`,
          code: 1
        };
      }

      case 'tree': {
        const target = args.find(a => !a.startsWith('-')) || '.';
        const node = this.getNode(target);
        if (!node || node.type !== 'dir') return { output: `${target} [error opening dir]`, code: 1 };

        const renderTree = (n, prefix = '') => {
          const lines = [];
          const keys = Object.keys(n.children || {});
          keys.forEach((k, idx) => {
            const isLast = idx === keys.length - 1;
            const branch = isLast ? '└── ' : '├── ';
            lines.push(`${prefix}${branch}${k}`);
            if (n.children[k].type === 'dir' && prefix.length < 8) {
              lines.push(...renderTree(n.children[k], prefix + (isLast ? '    ' : '│   ')));
            }
          });
          return lines;
        };

        return { output: `${target}\n` + renderTree(node).join('\n') + `\n\n${Object.keys(node.children || {}).length} directories, files`, code: 0 };
      }

      case 'stat': {
        const target = args[0] || '.';
        const node = this.getNode(target);
        if (!node) return { output: `stat: cannot stat '${target}': No such file or directory`, code: 1 };
        return {
          output: `  File: ${target}\n  Size: ${node.type === 'dir' ? 4096 : (node.content ? node.content.length : 0)}      	Blocks: 8          IO Block: 4096   ${node.type === 'dir' ? 'directory' : 'regular file'}\nDevice: 259,1	Inode: 131102      Links: 1\nAccess: (0${node.perm === 'rwxr-xr-x' ? '755' : '644'}/-${node.perm})  Uid: ( 1000/    user)   Gid: ( 1000/    user)\nAccess: 2026-08-28 12:00:00.000000000 +0000\nModify: 2026-08-28 12:00:00.000000000 +0000`,
          code: 0
        };
      }

      case 'file': {
        const target = args[0];
        const node = this.getNode(target);
        if (!node) return { output: `${target}: cannot open (No such file or directory)`, code: 1 };
        if (node.type === 'dir') return { output: `${target}: directory`, code: 0 };
        if (target.endsWith('.sh')) return { output: `${target}: POSIX shell script, ASCII text executable`, code: 0 };
        if (target.endsWith('.py')) return { output: `${target}: Python script, ASCII text executable`, code: 0 };
        if (target.endsWith('.js') || target.endsWith('.c')) return { output: `${target}: C/JS source, ASCII text`, code: 0 };
        return { output: `${target}: ASCII text`, code: 0 };
      }

      case 'du': {
        const human = args.includes('-h');
        const target = args.find(a => !a.startsWith('-')) || '.';
        return { output: `${human ? '184M' : '188416'}\t${target}`, code: 0 };
      }

      case 'df': {
        return { output: 'Filesystem     Type   Size  Used Avail Use% Mounted on\n/dev/nvme0n1p2 ext4   468G  120G  325G  27% /\n/dev/nvme0n1p1 vfat   512M   12M  500M   3% /boot/efi', code: 0 };
      }

      case 'ps': {
        const lines = ['UID        PID  PPID  C STIME TTY          TIME CMD'];
        this.processes.forEach(p => {
          lines.push(`${p.user.padEnd(8, ' ')} ${String(p.pid).padStart(5, ' ')} ${String(p.ppid).padStart(5, ' ')}  0 12:00 pts/0    00:00:01 ${p.cmd}`);
        });
        return { output: lines.join('\n'), code: 0 };
      }

      case 'pstree': {
        return { output: 'systemd(1)─┬─dockerd(890)\n           ├─sshd(1042)───sshd(1380)───bash(1381)───node(1420)\n           └─systemd-journal(412)', code: 0 };
      }

      case 'pgrep': {
        const uIdx = args.indexOf('-u');
        const userFilter = uIdx > -1 ? args[uIdx + 1] : null;
        const matched = this.processes.filter(p => !userFilter || p.user === userFilter);
        return { output: matched.map(p => `${p.pid} ${p.cmd.split(' ')[0]}`).join('\n'), code: 0 };
      }

      case 'pkill': {
        const target = args[args.length - 1];
        this.processes = this.processes.filter(p => !p.cmd.includes(target));
        return { output: '', code: 0 };
      }

      case 'whoami':
        return { output: this.user, code: 0 };

      case 'id':
        return { output: `uid=1000(${this.user}) gid=1000(${this.user}) groups=1000(${this.user}),4(adm),27(sudo),998(docker)`, code: 0 };

      case 'uname':
        if (args.includes('-a')) {
          return { output: 'Linux linux-workstation 6.8.0-45-generic #45-Ubuntu SMP PREEMPT_DYNAMIC Fri Aug 28 12:00:00 UTC 2026 x86_64 x86_64 x86_64 GNU/Linux', code: 0 };
        }
        return { output: 'Linux', code: 0 };

      case 'uptime':
        return { output: ' 18:20:00 up 14 days,  6:30,  1 user,  load average: 0.12, 0.08, 0.05', code: 0 };

      case 'free': {
        return { output: '               total        used        free      shared  buff/cache   available\nMem:            31Gi       6.2Gi        18Gi       420Mi       6.8Gi        24Gi\nSwap:          8.0Gi          0B       8.0Gi', code: 0 };
      }

      case 'ping': {
        const host = args.find(a => !a.startsWith('-')) || '8.8.8.8';
        return {
          output: `PING ${host} (${host}) 56(84) bytes of data.\n64 bytes from ${host}: icmp_seq=1 ttl=118 time=14.2 ms\n64 bytes from ${host}: icmp_seq=2 ttl=118 time=13.9 ms\n64 bytes from ${host}: icmp_seq=3 ttl=118 time=14.1 ms\n\n--- ${host} ping statistics ---\n3 packets transmitted, 3 received, 0% packet loss, time 2003ms\nrtt min/avg/max/mdev = 13.9/14.0/14.2/0.14 ms`,
          code: 0
        };
      }

      case 'ip': {
        if (args.includes('route')) {
          return { output: 'default via 192.168.1.1 dev eth0 proto dhcp src 192.168.1.150 metric 100\n192.168.1.0/24 dev eth0 proto kernel scope link src 192.168.1.150 metric 100', code: 0 };
        }
        return { output: 'lo               UNKNOWN        127.0.0.1/8 ::1/128 \neth0             UP             192.168.1.150/24 fe80::a00:27ff:fe4e:66a1/64 \ndocker0          DOWN           172.17.0.1/16', code: 0 };
      }

      case 'ss': {
        return { output: 'Netid State  Recv-Q Send-Q Local Address:Port  Peer Address:PortProcess\ntcp   LISTEN 0      128          0.0.0.0:22         0.0.0.0:*    users:(("sshd",pid=1042,fd=3))\ntcp   LISTEN 0      511          0.0.0.0:3000       0.0.0.0:*    users:(("node",pid=1420,fd=19))', code: 0 };
      }

      case 'curl': {
        const url = args.find(a => a.startsWith('http')) || 'https://api.github.com';
        return { output: `HTTP/2 200 \nserver: GitHub.com\ndate: Fri, 28 Aug 2026 18:20:00 GMT\ncontent-type: application/json; charset=utf-8\ncache-control: public, max-age=60\nx-github-media-type: github.v3; format=json`, code: 0 };
      }

      case 'wget': {
        const url = args.find(a => a.startsWith('http')) || 'https://example.com/data.tar.gz';
        return { output: `HTTP request sent, awaiting response... 200 OK\nLength: 10485760 (10M) [application/gzip]\nSaving to: 'data.tar.gz'\n\ndata.tar.gz         100%[===================>]  10.00M  15.2MB/s    in 0.7s\n2026-08-28 18:20:01 (15.2 MB/s) - 'data.tar.gz' saved [10485760/10485760]`, code: 0 };
      }

      case 'dig': {
        return { output: '142.250.190.46', code: 0 };
      }

      case 'nc': {
        return { output: 'Connection to 127.0.0.1 22 port [tcp/ssh] succeeded!\nConnection to 127.0.0.1 3000 port [tcp/*] succeeded!', code: 0 };
      }

      case 'systemctl': {
        const action = args[0];
        const service = args[1] || 'sshd';
        if (action === 'status') {
          return { output: `● ${service}.service - Linux System Service\n     Active: active (running) since Fri 2026-08-28 12:00:05 UTC; 6h ago\n   Main PID: 1042 (${service})\n     Memory: 6.4M\n     CGroup: /system.slice/${service}.service`, code: 0 };
        }
        return { output: `[OK] Service ${service} action ${action} executed successfully.`, code: 0 };
      }

      case 'journalctl': {
        return { output: 'Aug 28 12:00:10 server systemd[1]: Reached target System Initialization.\nAug 28 12:05:00 server nginx[982]: Server started workers successfully.', code: 0 };
      }

      case 'crontab': {
        return { output: '# m h  dom mon dow   command\n0 2 * * * /home/user/scripts/daily_backup.sh > /dev/null 2>&1\n*/15 * * * * /home/user/scripts/health_check.sh', code: 0 };
      }

      case 'lscpu': {
        return { output: 'Architecture:             x86_64\nModel name:               Intel(R) Core(TM) i9-14900K\nCPU(s):                   32 (16 Cores / 32 Threads)\nMax MHz:                  5800.0000\nL3 cache:                 36 MiB', code: 0 };
      }

      case 'lsblk': {
        return { output: 'NAME        FSTYPE FSVER LABEL UUID                                 FSAVAIL FSUSE% MOUNTPOINTS\nnvme0n1                                                                             \n├─nvme0n1p1 vfat   FAT32       6A2B-1E4D                               504.9M     1% /boot/efi\n├─nvme0n1p2 ext4   1.0         8f24b42e-a10c-4b55-883a-8b894101e4a1    325.4G    27% /\n└─nvme0n1p3 swap   1           3a1c890f-94d0-4d51-a9f1-7c220f12d4a1                  [SWAP]', code: 0 };
      }

      case 'lspci': {
        return { output: '01:00.0 VGA compatible controller: NVIDIA Corporation AD104 [GeForce RTX 4070]\n02:00.0 Non-Volatile memory controller: Samsung PM9A1 NVMe SSD Controller', code: 0 };
      }

      case 'lsusb': {
        return { output: 'Bus 001 Device 001: ID 1d6b:0002 Linux Foundation 2.0 root hub\nBus 001 Device 002: ID 046d:c539 Logitech USB Receiver', code: 0 };
      }

      case 'sysctl': {
        return { output: 'vm.swappiness = 60', code: 0 };
      }

      case 'lsmod': {
        return { output: 'Module                  Size  Used by\nnvidia_uvm           1523712  0\nnvidia_drm             94208  4\nnvme                   61440  3\next4                 1048576  2', code: 0 };
      }

      case 'tar': {
        return { output: 'src/\nsrc/main.js\nsrc/style.css\n[Archive operation completed successfully]', code: 0 };
      }

      case 'gzip': {
        return { output: '', code: 0 };
      }

      case 'history': {
        const lines = this.commandHistory.map((cmd, idx) => `  ${idx + 1}  ${cmd}`);
        return { output: lines.join('\n'), code: 0 };
      }

      case 'clear':
        return { output: '\x1b[CLEAR]', code: 0 };

      case 'export': {
        if (args.length === 0) {
          const lines = Object.entries(this.env).map(([k, v]) => `declare -x ${k}="${v}"`);
          return { output: lines.join('\n'), code: 0 };
        }
        const eqIdx = args[0].indexOf('=');
        if (eqIdx > -1) {
          const k = args[0].slice(0, eqIdx);
          const v = args[0].slice(eqIdx + 1).replace(/^["']|["']$/g, '');
          this.env[k] = v;
        }
        return { output: '', code: 0 };
      }

      case 'env': {
        const lines = Object.entries(this.env).map(([k, v]) => `${k}=${v}`);
        return { output: lines.join('\n'), code: 0 };
      }

      case 'kill': {
        const sig = args.find(a => a.startsWith('-')) || '-15';
        const pid = parseInt(args.find(a => !a.startsWith('-')));
        if (!pid) return { output: 'kill: usage: kill [-s sigspec | -n signum | -sigspec] pid | jobspec ...', code: 1 };

        const pIdx = this.processes.findIndex(p => p.pid === pid);
        if (pIdx > -1) {
          const killed = this.processes.splice(pIdx, 1)[0];
          return { output: `[1]+  ${sig === '-9' ? 'Killed' : 'Terminated'}                  ${killed.cmd}`, code: 0 };
        }
        return { output: `bash: kill: (${pid}) - No such process`, code: 1 };
      }

      case 'chmod': {
        const mode = args[0];
        const target = args[1];
        if (!mode || !target) return { output: 'chmod: missing operand', code: 1 };
        const node = this.getNode(target);
        if (!node) return { output: `chmod: cannot access '${target}': No such file or directory`, code: 1 };
        node.perm = mode.startsWith('+') ? 'rwxrwxrwx' : 'rwxr-xr-x';
        return { output: '', code: 0 };
      }

      case 'head': {
        const nIdx = args.indexOf('-n');
        const count = nIdx > -1 ? parseInt(args[nIdx + 1]) || 10 : 10;
        const target = args.find(a => !a.startsWith('-') && a !== String(count));
        let content = stdin;
        if (target) {
          const node = this.getNode(target);
          if (node && node.type === 'file') content = node.content;
        }
        const lines = (content || '').split('\n').slice(0, count);
        return { output: lines.join('\n'), code: 0 };
      }

      case 'tail': {
        const nIdx = args.indexOf('-n');
        const count = nIdx > -1 ? parseInt(args[nIdx + 1]) || 10 : 10;
        const target = args.find(a => !a.startsWith('-') && a !== String(count));
        let content = stdin;
        if (target) {
          const node = this.getNode(target);
          if (node && node.type === 'file') content = node.content;
        }
        const lines = (content || '').split('\n').slice(-count);
        return { output: lines.join('\n'), code: 0 };
      }

      case 'find': {
        const searchPath = args.find(a => !a.startsWith('-')) || '.';
        const nameIdx = args.indexOf('-name');
        const pattern = nameIdx > -1 ? args[nameIdx + 1].replace(/^["']|["']$/g, '').replace(/\*/g, '.*') : null;
        const reg = pattern ? new RegExp(pattern) : null;

        const results = [];
        const traverse = (node, p) => {
          if (!node) return;
          if (!reg || reg.test(p)) results.push(p);
          if (node.type === 'dir' && node.children) {
            for (const childName of Object.keys(node.children)) {
              traverse(node.children[childName], p === '.' ? `./${childName}` : `${p}/${childName}`);
            }
          }
        };

        const rootNode = this.getNode(searchPath);
        traverse(rootNode, searchPath);
        return { output: results.join('\n'), code: 0 };
      }

      default:
        return { output: `bash: ${cmdName}: command not found`, code: 127 };
    }
  }

  getCompletions(currentWord) {
    const node = this.getNode('.');
    if (!node || node.type !== 'dir') return [];
    return Object.keys(node.children || {}).filter(k => k.startsWith(currentWord));
  }
}
