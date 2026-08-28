// In-Memory Virtual Linux Environment & Real-Time Shell Simulation Engine

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
      { pid: 1420, ppid: 1381, user: 'user', cpu: 1.8, mem: 2.4, cmd: 'node server.js', stat: 'Sl+' }
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
                'app.js': {
                  type: 'file',
                  perm: 'rw-r--r--',
                  owner: 'user',
                  group: 'user',
                  content: 'import express from "express";\nconst app = express();\nconst PORT = process.env.PORT || 3000;\n\napp.get("/", (req, res) => {\n  res.send("Hello from 3D Linux Subsystem!");\n});\n\napp.listen(PORT, () => {\n  console.log(`Server listening on port ${PORT}`);\n});'
                },
                'server.py': {
                  type: 'file',
                  perm: 'rwxr-xr-x',
                  owner: 'user',
                  group: 'user',
                  content: '#!/usr/bin/env python3\nimport sys\n\ndef main():\n    print("Python 3 Worker Process Active [PID 1420]")\n\nif __name__ == "__main__":\n    main()'
                },
                'Makefile': {
                  type: 'file',
                  perm: 'rw-r--r--',
                  owner: 'user',
                  group: 'user',
                  content: 'CC = gcc\nCFLAGS = -Wall -O2\n\nall: main\n\nmain: main.c\n\t$(CC) $(CFLAGS) -o main main.c\n\nclean:\n\trm -f main *.o'
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
                        }
                      }
                    },
                    'README.md': {
                      type: 'file',
                      perm: 'rw-r--r--',
                      owner: 'user',
                      group: 'user',
                      content: '# 3D Linux Terminal Project\nInteractive Linux Subsystem & Command Execution Visualization in Three.js.'
                    }
                  }
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
            }
          }
        },
        tmp: {
          type: 'dir',
          perm: 'rwxrwxrwt',
          owner: 'root',
          group: 'root',
          children: {}
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
    const parts = cmdStr.split(/\s+/).filter(Boolean);
    const cmdName = parts[0];
    const args = parts.slice(1);

    // 1. Check aliases
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
        // Expand environment variables e.g. $USER, $PORT
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
        const countLines = args.includes('-l') || args.length === 0;
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

      case 'ps': {
        const lines = ['UID        PID  PPID  C STIME TTY          TIME CMD'];
        this.processes.forEach(p => {
          lines.push(`${p.user.padEnd(8, ' ')} ${String(p.pid).padStart(5, ' ')} ${String(p.ppid).padStart(5, ' ')}  0 12:00 pts/0    00:00:01 ${p.cmd}`);
        });
        return { output: lines.join('\n'), code: 0 };
      }

      case 'whoami':
        return { output: this.user, code: 0 };

      case 'id':
        return { output: `uid=1000(${this.user}) gid=1000(${this.user}) groups=1000(${this.user}),4(adm),24(cdrom),27(sudo),30(dip),46(plugdev),1000(${this.user})`, code: 0 };

      case 'uname':
        if (args.includes('-a')) {
          return { output: 'Linux linux-workstation 6.8.0-45-generic #45-Ubuntu SMP PREEMPT_DYNAMIC Fri Aug 28 12:00:00 UTC 2026 x86_64 x86_64 x86_64 GNU/Linux', code: 0 };
        }
        return { output: 'Linux', code: 0 };

      case 'uptime':
        return { output: ' 18:14:00 up 14 days,  6:22,  1 user,  load average: 0.12, 0.08, 0.05', code: 0 };

      case 'free': {
        const human = args.includes('-h');
        if (human) {
          return { output: '               total        used        free      shared  buff/cache   available\nMem:            31Gi       6.2Gi        18Gi       420Mi       6.8Gi        24Gi\nSwap:          8.0Gi          0B       8.0Gi', code: 0 };
        }
        return { output: '              total        used        free      shared  buff/cache   available\nMem:       32768000     6480000    19000000      430000     7288000    25200000\nSwap:       8388608           0     8388608', code: 0 };
      }

      case 'ping': {
        const host = args.find(a => !a.startsWith('-')) || '8.8.8.8';
        return {
          output: `PING ${host} (${host}) 56(84) bytes of data.\n64 bytes from ${host}: icmp_seq=1 ttl=118 time=14.2 ms\n64 bytes from ${host}: icmp_seq=2 ttl=118 time=13.9 ms\n64 bytes from ${host}: icmp_seq=3 ttl=118 time=14.1 ms\n\n--- ${host} ping statistics ---\n3 packets transmitted, 3 received, 0% packet loss, time 2003ms\nrtt min/avg/max/mdev = 13.9/14.0/14.2/0.14 ms`,
          code: 0
        };
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
        const lines = content.split('\n').slice(0, count);
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
        const lines = content.split('\n').slice(-count);
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
