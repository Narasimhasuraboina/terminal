import { COMMAND_PRESETS } from './commandPresets.js';

// Comprehensive Database of Real Linux Commands
const KNOWN_BUILTINS = new Set([
  'cd', 'pwd', 'echo', 'export', 'alias', 'unalias', 'exit', 'history', 'type', 'source',
  'unset', 'help', 'set', 'shopt', 'read', 'test', '[', 'bg', 'fg', 'jobs', 'ulimit', 'clear'
]);

const KNOWN_BINARIES = new Set([
  // File & Directory Ops
  'ls', 'cat', 'touch', 'mkdir', 'rm', 'rmdir', 'cp', 'mv', 'chmod', 'chown', 'stat', 'file', 'find', 'ln',
  // Text Processing
  'grep', 'wc', 'head', 'tail', 'sort', 'uniq', 'awk', 'sed', 'cut', 'tr', 'diff', 'less', 'more', 'tee', 'xargs',
  // System & Process Monitoring
  'ps', 'top', 'htop', 'kill', 'pkill', 'killall', 'df', 'du', 'free', 'uptime', 'uname', 'whoami', 'id', 'dmesg', 'lsof', 'sleep', 'date', 'which', 'whereis',
  // Networking
  'ping', 'curl', 'wget', 'ssh', 'netstat', 'ss', 'ip', 'ifconfig', 'traceroute', 'dig', 'host', 'nc', 'nmap',
  // Compilers & Dev Tools
  'git', 'docker', 'python', 'python3', 'node', 'npm', 'gcc', 'g++', 'make', 'tar', 'gzip', 'zip', 'unzip', 'sudo', 'man', 'env'
]);

export class CommandEngine {
  constructor() {
    this.presets = COMMAND_PRESETS;
  }

  getCommandPlan(rawInput) {
    const trimmed = rawInput.trim();
    if (!trimmed) return null;

    // Check direct match with rich curated presets
    for (const key of Object.keys(this.presets)) {
      if (key.toLowerCase() === trimmed.toLowerCase()) {
        return this.presets[key];
      }
    }

    // 1. Check for Syntax Errors
    const syntaxError = this.checkSyntaxError(trimmed);
    if (syntaxError) {
      return this.generateSyntaxErrorPlan(trimmed, syntaxError);
    }

    // 2. Parse command tokens
    const tokens = trimmed.split(/\s+/);
    const cmd = tokens[0];
    const args = tokens.slice(1);

    // 3. Check if unknown / invalid command (Command Not Found Flow)
    const isBuiltin = KNOWN_BUILTINS.has(cmd);
    const isBinary = KNOWN_BINARIES.has(cmd);
    const isPathRelative = cmd.startsWith('./') || cmd.startsWith('/') || cmd.startsWith('../');

    if (!isBuiltin && !isBinary && !isPathRelative) {
      return this.generateCommandNotFoundPlan(trimmed, cmd);
    }

    // 4. Valid Known Command -> Realistic Subsystem Execution
    return this.generateValidCommandPlan(trimmed, cmd, args, isBuiltin);
  }

  checkSyntaxError(input) {
    if (input.startsWith('|') || input.endsWith('|')) {
      return 'syntax error near unexpected token `|\'';
    }
    if (input.endsWith('&&') || input.endsWith('||')) {
      return 'syntax error: unexpected end of file';
    }
    if (input.endsWith('>') || input.endsWith('<')) {
      return 'syntax error near unexpected token `newline\'';
    }
    // Check unmatched quotes
    const singleQuotes = (input.match(/'/g) || []).length;
    const doubleQuotes = (input.match(/"/g) || []).length;
    if (singleQuotes % 2 !== 0 || doubleQuotes % 2 !== 0) {
      return 'unexpected EOF while looking for matching quote';
    }
    return null;
  }

  generateSyntaxErrorPlan(input, errorMsg) {
    return {
      name: input,
      title: `Syntax Error: ${input}`,
      summaryText: `Shell parser rejected command during syntax analysis. No process was forked. Exit status: 2.`,
      isError: true,
      stages: [
        {
          id: 'err_input',
          stepNum: 1,
          timeOffset: 0,
          name: `1. Input Received: "${input}"`,
          simpleTitle: '1. Raw Keystrokes',
          layer: 'User Space',
          activeNode: 'terminal',
          route: null,
          sound: 'key',
          cameraTarget: 'userspace',
          ring: 3,
          syscall: null,
          registers: { RIP: '0x7fff4010', RAX: '0', RSP: '0x7ffeef80' },
          simpleExplanation: `Keystrokes delivered to terminal.`,
          explanation: `Terminal emulator delivers raw text to Shell PTY device.`,
          analogy: `💡 Analogy: Waiter receives an incomplete sentence.`,
          codeSnippet: `write(master_fd, "${input}\\n", ${input.length + 1});`,
          terminalOutput: `user@linux:~$ ${input}`
        },
        {
          id: 'err_parse',
          stepNum: 2,
          timeOffset: 600,
          name: `2. Shell AST Parser Failed (Grammar Error)`,
          simpleTitle: '2. Parser Syntax Rejection',
          layer: 'User Space (Shell)',
          activeNode: 'lexer',
          route: { from: 'terminal', to: 'lexer', color: 0xff0055 },
          sound: 'error',
          cameraTarget: 'userspace',
          ring: 3,
          syscall: null,
          registers: { PARSER_STATE: 'ERROR_SYNTAX', EXIT_CODE: '2' },
          simpleExplanation: `The Shell tokenizer detected invalid bash grammar (${errorMsg}). No fork() or system call is executed.`,
          explanation: `Shell parser encountered syntax error in grammar table. Sets exit status variable $? = 2.`,
          analogy: `💡 Analogy: The order is unreadable, so the kitchen never starts cooking.`,
          codeSnippet: `yyerror("${errorMsg}");\nreturn PARSER_ERROR;`,
          terminalOutput: null
        },
        {
          id: 'err_stderr',
          stepNum: 3,
          timeOffset: 1400,
          name: `3. Write Error to Stderr (FD 2) & Return`,
          simpleTitle: '3. Stderr Message & Prompt Reset',
          layer: 'User Space & Terminal',
          activeNode: 'terminal',
          route: { from: 'lexer', to: 'terminal', color: 0xff0055 },
          sound: 'error',
          cameraTarget: 'userspace',
          ring: 3,
          syscall: 'write(2)',
          registers: { STDERR_FD: '2', STATUS: '2 (Syntax Error)' },
          simpleExplanation: `Shell prints error message to Standard Error (FD 2) and presents a fresh prompt.`,
          explanation: `Shell writes diagnostic message to stderr and returns control to interactive loop.`,
          analogy: `💡 Analogy: The waiter asks you to clarify the order.`,
          codeSnippet: `fprintf(stderr, "bash: %s\\n", error_msg);`,
          terminalOutput: `bash: ${errorMsg}\nuser@linux:~$ `
        }
      ]
    };
  }

  generateCommandNotFoundPlan(input, cmd) {
    return {
      name: input,
      title: `Command Not Found: ${cmd}`,
      summaryText: `Shell searched all folders in $PATH but found no executable named "${cmd}". No process was created. Exit status: 127.`,
      isError: true,
      stages: [
        {
          id: 'cnf_input',
          stepNum: 1,
          timeOffset: 0,
          name: `1. Input: "${input}"`,
          simpleTitle: '1. Keystroke Received',
          layer: 'User Space',
          activeNode: 'terminal',
          route: null,
          sound: 'key',
          cameraTarget: 'userspace',
          ring: 3,
          syscall: null,
          registers: { RIP: '0x7fff4010', RAX: '0', RSP: '0x7ffeef80' },
          simpleExplanation: `You typed "${input}" and hit Enter.`,
          explanation: `Terminal sends "${input}\\n" to pseudoterminal master.`,
          analogy: `💡 Analogy: Handing an order ticket to the kitchen for an item not on the menu.`,
          codeSnippet: `write(master_fd, "${input}\\n", ${input.length + 1});`,
          terminalOutput: `user@linux:~$ ${input}`
        },
        {
          id: 'cnf_parse',
          stepNum: 2,
          timeOffset: 600,
          name: `2. Shell Tokenizes Name: "${cmd}"`,
          simpleTitle: '2. Tokenize & Check Builtins',
          layer: 'User Space (Shell)',
          activeNode: 'lexer',
          route: { from: 'terminal', to: 'lexer', color: 0x00f3ff },
          sound: 'key',
          cameraTarget: 'userspace',
          ring: 3,
          syscall: null,
          registers: { CMD_NAME: `"${cmd}"`, IS_BUILTIN: 'FALSE' },
          simpleExplanation: `Shell parses "${cmd}". It checks if "${cmd}" is an internal builtin (like cd, echo). It is NOT.`,
          explanation: `Shell checks internal builtin hash table. Entry not found. Proceeds to disk search.`,
          analogy: `💡 Analogy: Checking if the dish is something the chef already knows how to make.`,
          codeSnippet: `if (!find_builtin("${cmd}")) {\n  search_path("${cmd}");\n}`,
          terminalOutput: null
        },
        {
          id: 'cnf_path_fail',
          stepNum: 3,
          timeOffset: 1300,
          name: `3. $PATH Search Failed (ENOENT)`,
          simpleTitle: '3. $PATH Search Returns -1',
          layer: 'User Space ($PATH Search)',
          activeNode: 'path',
          route: { from: 'lexer', to: 'path', color: 0xff0055 },
          sound: 'error',
          cameraTarget: 'userspace',
          ring: 3,
          syscall: 'stat() / faccessat2()',
          registers: {
            PATH_DIRS: '/usr/local/bin:/usr/bin:/bin',
            RESULT: '-1 ENOENT (No such file)'
          },
          simpleExplanation: `CRITICAL: The shell checked /usr/local/bin/${cmd}, /usr/bin/${cmd}, and /bin/${cmd}. None exist! The shell STOPS HERE—no fork(), no execve(), and no Ring 0 kernel call will happen!`,
          explanation: `faccessat2() checks all directories in $PATH. All return -1 ENOENT. Process creation is aborted.`,
          analogy: `💡 Analogy: Checking all recipe folders and finding no recipe for "${cmd}". Kitchen stops immediately.`,
          codeSnippet: `// Shell checks every directory:\nstat("/usr/local/bin/${cmd}", &st); // -1 ENOENT\nstat("/usr/bin/${cmd}", &st);       // -1 ENOENT\nstat("/bin/${cmd}", &st);           // -1 ENOENT`,
          terminalOutput: null
        },
        {
          id: 'cnf_stderr',
          stepNum: 4,
          timeOffset: 2200,
          name: `4. Shell Emits "command not found" (Exit 127)`,
          simpleTitle: '4. Error 127 to Stderr',
          layer: 'User Space & Terminal',
          activeNode: 'terminal',
          route: { from: 'path', to: 'terminal', color: 0xff0055 },
          sound: 'error',
          cameraTarget: 'userspace',
          ring: 3,
          syscall: 'write(2, error_str)',
          registers: { EXIT_STATUS: '$? = 127 (Command Not Found)', FD: '2 (stderr)' },
          simpleExplanation: `The Shell writes "bash: ${cmd}: command not found" to standard error (FD 2), sets exit code 127, and restores the prompt.`,
          explanation: `Shell writes diagnostic message to stderr and returns to top of REPL prompt loop.`,
          analogy: `💡 Analogy: Waiter returns and says "Sorry, we don't have '${cmd}' on our menu."`,
          codeSnippet: `fprintf(stderr, "bash: %s: command not found\\n", "${cmd}");\nlast_command_exit_value = 127;`,
          terminalOutput: `bash: ${cmd}: command not found\nuser@linux:~$ `
        }
      ]
    };
  }

  generateValidCommandPlan(input, cmd, args, isBuiltin) {
    const isPipe = input.includes('|');
    const stages = [];

    // Stage 1: Terminal PTY Input
    stages.push({
      id: 'custom_input',
      stepNum: 1,
      timeOffset: 0,
      name: `1. You Type "${input}"`,
      simpleTitle: '1. Capturing Keystrokes',
      layer: 'User Space',
      activeNode: 'terminal',
      route: null,
      sound: 'key',
      cameraTarget: 'userspace',
      ring: 3,
      syscall: null,
      registers: { RIP: '0x7fff4010', RAX: '0', RSP: '0x7ffeef80', RDI: `"${input}"` },
      simpleExplanation: `Terminal emulator captures raw characters "${input}\\n" and delivers them to the shell.`,
      explanation: `Raw keystrokes for "${input}" are delivered to the terminal emulator master pseudoterminal.`,
      analogy: `💡 Analogy: Writing down your order at the counter.`,
      codeSnippet: `write(master_fd, "${input}\\n", ${input.length + 1});`,
      terminalOutput: `user@linux:~$ ${input}`
    });

    // Stage 2: Lexing & AST
    stages.push({
      id: 'custom_lex',
      stepNum: 2,
      timeOffset: 600,
      name: `2. Shell Tokenizes [${cmd}${args.length ? ', ' + args.join(', ') : ''}]`,
      simpleTitle: '2. Parsing & Expansion',
      layer: 'User Space (Shell)',
      activeNode: 'lexer',
      route: { from: 'terminal', to: 'lexer', color: 0x00f3ff },
      sound: 'key',
      cameraTarget: 'userspace',
      ring: 3,
      syscall: null,
      registers: { TOKENS: `[${[cmd, ...args].map(t => `"${t}"`).join(', ')}]`, ARGC: `${1 + args.length}` },
      simpleExplanation: `Shell splits the command into ${1 + args.length} token(s), expands variables and quotes.`,
      explanation: `Shell breaks command into tokens, evaluates parameter expansions and quoting rules.`,
      analogy: `💡 Analogy: Cashier reads the items on the ticket.`,
      codeSnippet: `char **argv = parse_tokens("${input}");`,
      terminalOutput: null
    });

    if (isBuiltin) {
      // Builtin execution directly in shell process (No fork!)
      stages.push({
        id: 'builtin_exec',
        stepNum: 3,
        timeOffset: 1400,
        name: `3. Execute Shell Builtin: ${cmd}() (In-Process)`,
        simpleTitle: `3. Builtin Execution (No Fork)`,
        layer: 'User Space (In-Process)',
        activeNode: 'path',
        route: { from: 'lexer', to: 'path', color: 0x00f3ff },
        sound: 'success',
        cameraTarget: 'userspace',
        ring: 3,
        syscall: cmd === 'cd' ? 'chdir()' : cmd === 'pwd' ? 'getcwd()' : null,
        registers: { IS_BUILTIN: 'TRUE', NO_FORK: 'TRUE', STATUS: '0' },
        simpleExplanation: `"${cmd}" is a Shell Builtin! It runs directly inside the Shell's own memory with ZERO fork() needed. (Why? If 'cd' were a separate program, changing directory in the child would do nothing to the parent shell!).`,
        explanation: `"${cmd}" is implemented as an internal C function inside bash. Executed in-process.`,
        analogy: `💡 Analogy: The head chef handles this directly without calling an assistant.`,
        codeSnippet: `int builtin_${cmd}(int argc, char **argv);\nbuiltin_${cmd}(argc, argv);`,
        terminalOutput: this.generateBuiltinOutput(cmd, args)
      });
    } else {
      // External Binary Execution Path
      stages.push({
        id: 'custom_path',
        stepNum: 3,
        timeOffset: 1300,
        name: `3. Locate Binary in $PATH (/usr/bin/${cmd})`,
        simpleTitle: `3. Locating /usr/bin/${cmd}`,
        layer: 'User Space (Shell)',
        activeNode: 'path',
        route: { from: 'lexer', to: 'path', color: 0x00f3ff },
        sound: 'key',
        cameraTarget: 'userspace',
        ring: 3,
        syscall: 'stat() / faccessat2()',
        registers: { PATH: `"/usr/bin/${cmd}"`, PERMS: 'rwxr-xr-x', FOUND: 'TRUE' },
        simpleExplanation: `Shell finds executable binary at /usr/bin/${cmd} and verifies execute (x) permissions.`,
        explanation: `Shell queries directory hash cache and verifies executable bit for "/usr/bin/${cmd}".`,
        analogy: `💡 Analogy: Finding the exact tools needed in the workshop.`,
        codeSnippet: `stat("/usr/bin/${cmd}", &st_buf);`,
        terminalOutput: null
      });

      stages.push({
        id: 'custom_fork',
        stepNum: 4,
        timeOffset: 2000,
        name: `4. fork() Clones Process (PID 5410)`,
        simpleTitle: '4. Process Clone (fork)',
        layer: 'Syscall Gateway',
        activeNode: 'fork',
        route: { from: 'path', to: 'fork', color: 0xff0077 },
        sound: 'fork',
        cameraTarget: 'syscall',
        ring: 0,
        syscall: 'clone() / fork() [57]',
        registers: { CHILD_PID: '5410', PARENT_PID: '1020', FLAGS: 'SIGCHLD' },
        simpleExplanation: `Shell asks the kernel to clone a worker process (PID 5410). Parent shell calls wait4() to wait for results.`,
        explanation: `Shell forks child process (PID 5410). Shell parent executes wait4() to wait for child completion.`,
        analogy: `💡 Analogy: Assistant worker assigned to execute the recipe.`,
        codeSnippet: `pid_t pid = fork();`,
        terminalOutput: null
      });

      stages.push({
        id: 'custom_exec',
        stepNum: 5,
        timeOffset: 2800,
        name: `5. Ring 0 Transition: execve("/usr/bin/${cmd}")`,
        simpleTitle: '5. Ring 0 Privilege & Execve',
        layer: 'Syscall Gateway & MMU',
        activeNode: 'syscall_dispatcher',
        route: { from: 'fork', to: 'syscall', color: 0xff0077 },
        sound: 'syscall',
        cameraTarget: 'syscall',
        ring: 0,
        syscall: 'execve(59)',
        registers: { RAX: '59 (sys_execve)', RDI: `"/usr/bin/${cmd}"`, RSI: 'argv', RDX: 'envp' },
        simpleExplanation: `Child process switches CPU to Ring 0 (Kernel). Kernel replaces child memory with the compiled ELF code of /usr/bin/${cmd}.`,
        explanation: `Hardware switches to Ring 0. Kernel replaces child memory image with the ELF executable.`,
        analogy: `💡 Analogy: Worker boots up the designated machine.`,
        codeSnippet: `execve("/usr/bin/${cmd}", argv, envp);`,
        terminalOutput: null
      });

      stages.push({
        id: 'custom_mmu',
        stepNum: 6,
        timeOffset: 3600,
        name: `6. MMU Memory Setup & CPU Execution`,
        layer: 'Kernel Core & MMU',
        simpleTitle: '6. Virtual Memory & CPU Run',
        activeNode: 'cpu_core',
        route: { from: 'syscall', to: 'cpu', color: 0x2979ff },
        sound: 'kernel',
        cameraTarget: 'kernel',
        ring: 0,
        syscall: 'mmap() / arch_prctl()',
        registers: { RIP: `0x7ffff7a0`, FS_BASE: 'TLS_BLOCK', MM: 'ACTIVE' },
        simpleExplanation: `MMU configures virtual memory pages (.text, .data, stack). CPU executes instructions and dynamic libraries (libc.so).`,
        explanation: `CPU executes compiled machine instructions for "${cmd}", resolving dynamic libraries (libc.so) via ld-linux.`,
        analogy: `💡 Analogy: Running the program on the factory floor.`,
        codeSnippet: `arch_prctl(ARCH_SET_FS, tls_addr);\nmain(argc, argv);`,
        terminalOutput: null
      });

      stages.push({
        id: 'custom_complete',
        stepNum: 7,
        timeOffset: 4500,
        name: `7. Output Stream & Process Exit (0)`,
        simpleTitle: '7. Output & Exit Group',
        layer: 'User Space & Terminal',
        activeNode: 'terminal',
        route: { from: 'cpu', to: 'terminal', color: 0x00f3ff },
        sound: 'success',
        cameraTarget: 'userspace',
        ring: 3,
        syscall: 'exit_group(0)',
        registers: { EXIT_CODE: '0', STATUS: 'SUCCESS' },
        simpleExplanation: `Command outputs result to stdout (FD 1), exits cleanly with code 0. Shell reaps process and returns prompt.`,
        explanation: `Command finished with exit code 0. Parent shell reaps process and returns prompt.`,
        analogy: `💡 Analogy: Task completed successfully. Ready for next order.`,
        codeSnippet: `exit_group(0);`,
        terminalOutput: this.generateBinaryOutput(cmd, args)
      });
    }

    return {
      name: input,
      title: `${isBuiltin ? 'Shell Builtin' : 'Linux Command'}: ${cmd}`,
      summaryText: isBuiltin
        ? `"${cmd}" runs directly in-process within the Shell's memory. No process fork occurred.`
        : `Executed /usr/bin/${cmd} via fork() ➔ execve() ➔ MMU virtual memory mapping. Exit code: 0.`,
      stages: stages
    };
  }

  generateBuiltinOutput(cmd, args) {
    switch (cmd) {
      case 'pwd':
        return `/home/user/terminal-project\nuser@linux:~$ `;
      case 'echo':
        return `${args.join(' ').replace(/^["']|["']$/g, '')}\nuser@linux:~$ `;
      case 'cd':
        const target = args[0] || '~';
        return `user@linux:${target === '~' ? '~' : target}$ `;
      case 'type':
        const targetCmd = args[0] || 'cd';
        const isB = KNOWN_BUILTINS.has(targetCmd);
        return `${targetCmd} is a shell ${isB ? 'builtin' : `/usr/bin/${targetCmd}`}\nuser@linux:~$ `;
      case 'export':
        return `user@linux:~$ `;
      default:
        return `[Builtin ${cmd} executed successfully]\nuser@linux:~$ `;
    }
  }

  generateBinaryOutput(cmd, args) {
    switch (cmd) {
      case 'uname':
        return `Linux 6.11.0-x86_64 #1 SMP PREEMPT_DYNAMIC GNU/Linux\nuser@linux:~$ `;
      case 'whoami':
        return `user\nuser@linux:~$ `;
      case 'id':
        return `uid=1000(user) gid=1000(user) groups=1000(user),4(adm),27(sudo)\nuser@linux:~$ `;
      case 'date':
        return `${new Date().toUTCString()}\nuser@linux:~$ `;
      case 'df':
        return `Filesystem     1K-blocks      Used Available Use% Mounted on\n/dev/nvme0n1p2 499963860 120485900 354024340  26% /\nuser@linux:~$ `;
      case 'free':
        return `               total        used        free      shared  buff/cache   available\nMem:        16384216     4194304     8192108      262144     3997804    11927768\nSwap:        4194304           0     4194304\nuser@linux:~$ `;
      case 'ps':
        return `  PID TTY          TIME CMD\n 1020 pts/0    00:00:01 bash\n 5410 pts/0    00:00:00 ps\nuser@linux:~$ `;
      case 'uptime':
        return ` 13:15:00 up 42 days, 3:14, 1 user, load average: 0.12, 0.08, 0.05\nuser@linux:~$ `;
      case 'ping':
        const host = args[0] || '8.8.8.8';
        return `PING ${host} (${host}) 56(84) bytes of data.\n64 bytes from ${host}: icmp_seq=1 ttl=118 time=14.2 ms\n64 bytes from ${host}: icmp_seq=2 ttl=118 time=13.8 ms\n--- ${host} ping statistics ---\n2 packets transmitted, 2 received, 0% packet loss\nuser@linux:~$ `;
      case 'touch':
        return `user@linux:~$ `;
      case 'mkdir':
        return `user@linux:~$ `;
      case 'rm':
        return `user@linux:~$ `;
      default:
        return `[Executed /usr/bin/${cmd} ${args.join(' ')}]\nuser@linux:~$ `;
    }
  }
}
