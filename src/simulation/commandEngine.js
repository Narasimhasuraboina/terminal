import { COMMAND_PRESETS } from './commandPresets.js';

export class CommandEngine {
  constructor() {
    this.presets = COMMAND_PRESETS;
  }

  getCommandPlan(rawInput) {
    const trimmed = (rawInput || '').trim();
    if (!trimmed) return this.presets['ls -la'];

    // 1. Direct Preset Match
    if (this.presets[trimmed]) {
      return this.presets[trimmed];
    }

    // 2. Normalize and check base command
    const parts = trimmed.split(/\s+/);
    const cmdName = parts[0];

    // Shell Builtin Commands (e.g. cd, echo, pwd, export, type)
    if (['cd', 'pwd', 'echo', 'export', 'type', 'alias'].includes(cmdName)) {
      return this.buildShellBuiltinPlan(trimmed, cmdName, parts);
    }

    // Common system commands
    if (cmdName === 'rm') {
      return this.buildRemoveFilePlan(trimmed, parts);
    }
    if (cmdName === 'ping') {
      return this.buildNetworkPingPlan(trimmed, parts);
    }
    if (cmdName === 'ps' || cmdName === 'top') {
      return this.buildProcessListPlan(trimmed, parts);
    }
    if (cmdName === 'touch') {
      return this.buildTouchPlan(trimmed, parts);
    }

    // 3. Command Not Found Simulator (Authentic 127 Exit Code)
    return this.buildCommandNotFoundPlan(trimmed, cmdName);
  }

  buildShellBuiltinPlan(fullCmd, cmdName, parts) {
    return {
      name: fullCmd,
      title: `Shell Builtin: "${cmdName}" (Zero Fork / In-Process)`,
      summaryText: `Why "${cmdName}" does NOT use fork() or execve(): It is built directly into Bash/Zsh memory to change the shell state without launching a new process.`,
      isBuiltin: true,
      stages: [
        {
          id: 'builtin_input',
          stepNum: 1,
          timeOffset: 0,
          name: `1. Typed Builtin "${cmdName}"`,
          simpleTitle: `1. Builtin: ${cmdName}`,
          layer: 'User Space (Terminal)',
          activeNode: 'terminal',
          route: null,
          sound: 'key',
          cameraTarget: 'userspace',
          ring: 3,
          syscall: null,
          registers: { RIP: '0x55555550', RAX: '0x0' },
          simpleExplanation: `Your terminal passes "${fullCmd}" to the shell.`,
          explanation: `Terminal sends keystrokes "${fullCmd}" to shell process.`,
          analogy: `💡 Analogy: An internal setting changed in your own notebook.`,
          codeSnippet: `// Shell parses: "${fullCmd}"`,
          terminalOutput: `user@linux:~$ ${fullCmd}`
        },
        {
          id: 'builtin_detect',
          stepNum: 2,
          timeOffset: 3200,
          name: `2. Shell Detects Builtin (No $PATH or fork required)`,
          simpleTitle: '2. In-Process Exec',
          layer: 'User Space (Shell Memory)',
          activeNode: 'lexer',
          route: { from: 'terminal', to: 'lexer', color: 0x00f3ff },
          sound: 'key',
          cameraTarget: 'userspace',
          ring: 3,
          syscall: cmdName === 'cd' ? 'chdir()' : (cmdName === 'pwd' ? 'getcwd()' : null),
          registers: { RIP: '0x55555580', BUILTIN: cmdName.toUpperCase() },
          simpleExplanation: `IMPORTANT: "${cmdName}" is NOT a file in /usr/bin! It executes inside Bash directly. If it ran as an external program, changing directories with "cd" would only affect the temporary child and NOT your current shell!`,
          explanation: `Bash checks internal hash table for builtin "${cmdName}". Skips $PATH lookup, fork(), and execve(). Executes directly in-process.`,
          analogy: `💡 Analogy: Adjusting your own desk chair instead of hiring a contractor to adjust their chair.`,
          codeSnippet: `if (is_builtin("${cmdName}")) {\n  return builtin_${cmdName}(argc, argv);\n}`,
          terminalOutput: null
        },
        {
          id: 'builtin_output',
          stepNum: 3,
          timeOffset: 6400,
          name: `3. Internal State Updated & Instant Return`,
          simpleTitle: '3. State Ready',
          layer: 'User Space & Terminal',
          activeNode: 'terminal',
          route: { from: 'lexer', to: 'terminal', color: 0x00f3ff },
          sound: 'success',
          cameraTarget: 'userspace',
          ring: 3,
          syscall: null,
          registers: { EXIT_CODE: '0' },
          simpleExplanation: `Operation completed in-process in less than 1 millisecond. Shell prompt is returned.`,
          explanation: `Builtin execution completed with exit code 0.`,
          analogy: `💡 Analogy: Done instantly with zero external overhead.`,
          codeSnippet: `return EXECUTION_SUCCESS;`,
          terminalOutput: cmdName === 'pwd' ? `/home/user\nuser@linux:~$ ` : (cmdName === 'echo' ? `${parts.slice(1).join(' ')}\nuser@linux:~$ ` : `user@linux:~$ `)
        }
      ]
    };
  }

  buildRemoveFilePlan(fullCmd, parts) {
    const target = parts[1] || 'file.txt';
    return {
      name: fullCmd,
      title: `unlinkat() & Ext4 Inode Deletion ("${fullCmd}")`,
      summaryText: `How Linux deletes files: Decrements the inode link count. When links reach 0 and no processes have the file open, blocks are freed back to the disk bitmap.`,
      stages: [
        {
          id: 'rm_input',
          stepNum: 1,
          timeOffset: 0,
          name: `1. Requesting Removal of "${target}"`,
          simpleTitle: '1. Parse rm',
          layer: 'User Space',
          activeNode: 'terminal',
          route: null,
          sound: 'key',
          cameraTarget: 'userspace',
          ring: 3,
          syscall: null,
          registers: { RIP: '0x55555550', RAX: '0' },
          simpleExplanation: `Shell parses "${fullCmd}" and executes /usr/bin/rm.`,
          explanation: `rm binary invoked with target "${target}".`,
          analogy: `💡 Analogy: Submitting a request to remove an item from inventory.`,
          codeSnippet: `execve("/usr/bin/rm", ["rm", "${target}"], envp);`,
          terminalOutput: `user@linux:~$ ${fullCmd}`
        },
        {
          id: 'rm_unlink',
          stepNum: 2,
          timeOffset: 3200,
          name: `2. unlinkat() Decrements Inode Hardlinks`,
          simpleTitle: '2. Unlink Inode',
          layer: 'Syscall Gateway (Ring 0)',
          activeNode: 'syscall_dispatcher',
          route: { from: 'terminal', to: 'syscall', color: 0xff0077 },
          sound: 'syscall',
          cameraTarget: 'syscall',
          ring: 0,
          syscall: 'unlinkat(263)',
          registers: { RAX: '263', RDI: 'AT_FDCWD', RSI: `"${target}"` },
          simpleExplanation: `In Linux, "deleting" a file actually unlinks its name from the folder directory. If link_count drops to 0, the kernel marks the disk blocks as free.`,
          explanation: `Kernel calls unlinkat(). Ext4 removes directory entry record and decrements i_links_count.`,
          analogy: `💡 Analogy: Erasing the label tag from the storage bin.`,
          codeSnippet: `unlinkat(AT_FDCWD, "${target}", 0);`,
          terminalOutput: null
        },
        {
          id: 'rm_disk_free',
          stepNum: 3,
          timeOffset: 6400,
          name: `3. Ext4 Frees Inode & Data Blocks to Bitmap`,
          simpleTitle: '3. Free Blocks',
          layer: 'Hardware Storage',
          activeNode: 'disk',
          route: { from: 'syscall', to: 'vfs', color: 0x00ff88 },
          sound: 'disk',
          cameraTarget: 'vfs',
          ring: 0,
          syscall: 'ext4_free_blocks()',
          registers: { INODE: 'FREED', BLOCKS: 'RETURNED TO FREE LIST' },
          simpleExplanation: `The storage controller updates the block bitmap. The physical flash sectors are marked available for future writes.`,
          explanation: `Kernel commits inode and block bitmap updates to the filesystem journal (JBD2).`,
          analogy: `💡 Analogy: Marking the warehouse parking bay as empty and available.`,
          codeSnippet: `ext4_free_inode(handle, inode);\next4_free_blocks(handle, inode, ...);`,
          terminalOutput: null
        },
        {
          id: 'rm_done',
          stepNum: 4,
          timeOffset: 9600,
          name: `4. Removal Complete`,
          simpleTitle: '4. Done',
          layer: 'User Space & Terminal',
          activeNode: 'terminal',
          route: { from: 'vfs', to: 'terminal', color: 0x00f3ff },
          sound: 'success',
          cameraTarget: 'userspace',
          ring: 3,
          syscall: 'exit_group(0)',
          registers: { RAX: '0' },
          simpleExplanation: `File is deleted. Process exits with code 0.`,
          explanation: `Command finished with exit status 0.`,
          analogy: `💡 Analogy: Inventory updated. Ready for next command.`,
          codeSnippet: `return 0;`,
          terminalOutput: `user@linux:~$ `
        }
      ]
    };
  }

  buildNetworkPingPlan(fullCmd, parts) {
    const host = parts[1] || '8.8.8.8';
    return {
      name: fullCmd,
      title: `Network Socket & ICMP Packet Flow ("${fullCmd}")`,
      summaryText: `How Linux pings: Opens raw ICMP socket ➔ Prepares packet with sequence numbers ➔ Kernel network stack routes packet via NIC hardware.`,
      stages: [
        {
          id: 'ping_input',
          stepNum: 1,
          timeOffset: 0,
          name: `1. Creating Raw Socket for "${host}"`,
          simpleTitle: '1. ICMP Socket',
          layer: 'Syscall Gateway',
          activeNode: 'syscall_dispatcher',
          route: null,
          sound: 'key',
          cameraTarget: 'userspace',
          ring: 0,
          syscall: 'socket(AF_INET, SOCK_RAW, IPPROTO_ICMP)',
          registers: { RAX: '41 (sys_socket)', RDI: 'AF_INET', RSI: 'SOCK_RAW' },
          simpleExplanation: `Ping asks the kernel for a raw network socket to send Internet Control Message Protocol (ICMP) echo requests.`,
          explanation: `Process opens raw socket to send ICMP Echo Request packets.`,
          analogy: `💡 Analogy: Opening an express outgoing mailbox slot at the post office.`,
          codeSnippet: `int sock = socket(AF_INET, SOCK_RAW, IPPROTO_ICMP);`,
          terminalOutput: `user@linux:~$ ${fullCmd}\nPING ${host} (${host}) 56(84) bytes of data.`
        },
        {
          id: 'ping_tx',
          stepNum: 2,
          timeOffset: 3200,
          name: `2. sendto() Transmits ICMP Echo Request via NIC`,
          simpleTitle: '2. NIC Transmit',
          layer: 'Kernel Network Stack',
          activeNode: 'cpu_core',
          route: { from: 'syscall', to: 'cpu', color: 0x2979ff },
          sound: 'syscall',
          cameraTarget: 'kernel',
          ring: 0,
          syscall: 'sendto() [44]',
          registers: { RAX: '44', SEQ: '1', TTL: '64' },
          simpleExplanation: `The CPU prepares packet headers with timestamp and pushes bytes into the Network Interface Card (NIC) transmit buffer.`,
          explanation: `Kernel IP routing table selects egress device, builds Ethernet frame, and triggers DMA transmission.`,
          analogy: `💡 Analogy: Post office trucks the letter across the network highway.`,
          codeSnippet: `sendto(sock, &icmp_hdr, len, 0, (struct sockaddr*)&dest, sizeof(dest));`,
          terminalOutput: null
        },
        {
          id: 'ping_rx',
          stepNum: 3,
          timeOffset: 6400,
          name: `3. Hardware Interrupt & ICMP Echo Reply Received`,
          simpleTitle: '3. Reply Received',
          layer: 'User Space & Terminal',
          activeNode: 'terminal',
          route: { from: 'cpu', to: 'terminal', color: 0x00f3ff },
          sound: 'success',
          cameraTarget: 'userspace',
          ring: 3,
          syscall: 'recvfrom(45)',
          registers: { RTT: '14.2ms', BYTES: '64' },
          simpleExplanation: `When ${host} answers, the NIC triggers a hardware interrupt. Kernel delivers the response to ping, calculating round-trip time (14.2 ms).`,
          explanation: `Hardware interrupt triggers NAPI polling, IP stack verifies checksum, and packet delivered to user space.`,
          analogy: `💡 Analogy: Receiving the reply letter confirming delivery.`,
          codeSnippet: `recvfrom(sock, recv_buf, sizeof(recv_buf), 0, NULL, NULL);`,
          terminalOutput: `64 bytes from ${host}: icmp_seq=1 ttl=118 time=14.2 ms\n64 bytes from ${host}: icmp_seq=2 ttl=118 time=13.8 ms\n^C\n--- ${host} ping statistics ---\n2 packets transmitted, 2 received, 0% packet loss\nuser@linux:~$ `
        }
      ]
    };
  }

  buildProcessListPlan(fullCmd, parts) {
    return {
      name: fullCmd,
      title: `/proc Virtual Filesystem Inspection ("${fullCmd}")`,
      summaryText: `How process monitors work: Linux does not query a database. It reads memory-backed synthetic text files under the /proc directory!`,
      stages: [
        {
          id: 'ps_input',
          stepNum: 1,
          timeOffset: 0,
          name: `1. Reading Virtual Filesystem /proc`,
          simpleTitle: '1. Query /proc',
          layer: 'VFS Layer',
          activeNode: 'vfs_tree',
          route: null,
          sound: 'key',
          cameraTarget: 'vfs',
          ring: 0,
          syscall: 'openat(AT_FDCWD, "/proc", O_RDONLY)',
          registers: { RAX: '257', PATH: '"/proc"' },
          simpleExplanation: `Everything in /proc is created on-the-fly in RAM by the kernel. There are no files on disk! Each numbered folder (e.g. /proc/1) represents a live process PID.`,
          explanation: `ps iterates through /proc directory entries, reading /proc/[pid]/stat and /proc/[pid]/status virtual pseudo-files.`,
          analogy: `💡 Analogy: Looking at the live digital dashboard of building occupancy.`,
          codeSnippet: `opendir("/proc"); // procfs generates records directly from task_struct list`,
          terminalOutput: `user@linux:~$ ${fullCmd}`
        },
        {
          id: 'ps_output',
          stepNum: 2,
          timeOffset: 3200,
          name: `2. Format and Display Process Table`,
          simpleTitle: '2. Show Process List',
          layer: 'User Space & Terminal',
          activeNode: 'terminal',
          route: { from: 'vfs', to: 'terminal', color: 0x00f3ff },
          sound: 'success',
          cameraTarget: 'userspace',
          ring: 3,
          syscall: 'write(1)',
          registers: { RAX: '1' },
          simpleExplanation: `ps parses the memory statistics and formats them into a clean terminal table with PID, TTY, CPU time, and command names.`,
          explanation: `Formatted process table written to stdout.`,
          analogy: `💡 Analogy: Printing out the real-time roster of active employees.`,
          codeSnippet: `printf("%5d %-8s %8s %s\\n", pid, tty, time_str, cmd);`,
          terminalOutput: `  PID TTY          TIME CMD
    1 ?        00:00:02 systemd
  842 ?        00:00:00 dbus-daemon
 1040 pts/0    00:00:00 bash
 4219 pts/0    00:00:00 ps
user@linux:~$ `
        }
      ]
    };
  }

  buildTouchPlan(fullCmd, parts) {
    const filename = parts[1] || 'notes.txt';
    return {
      name: fullCmd,
      title: `File Inode Creation & Timestamp Update ("${fullCmd}")`,
      summaryText: `How touch works: Calls openat with O_CREAT flag. If file exists, updates utimes; if not, allocates a new 0-byte file Inode on disk.`,
      stages: [
        {
          id: 'touch_syscall',
          stepNum: 1,
          timeOffset: 0,
          name: `1. openat(O_CREAT | O_WRONLY, 0666)`,
          simpleTitle: '1. Create / Update Inode',
          layer: 'Syscall Gateway',
          activeNode: 'syscall_dispatcher',
          route: null,
          sound: 'syscall',
          cameraTarget: 'syscall',
          ring: 0,
          syscall: 'openat(257)',
          registers: { RAX: '257', FLAGS: 'O_CREAT|O_WRONLY|O_NOCTTY|O_NONBLOCK' },
          simpleExplanation: `Touch requests the kernel to create "${filename}" if it does not exist, or update its access/modification timestamps if it does.`,
          explanation: `Kernel opens file with O_CREAT. If absent, ext4 allocates new Inode with size 0.`,
          analogy: `💡 Analogy: Creating a new blank file folder in the filing cabinet.`,
          codeSnippet: `openat(AT_FDCWD, "${filename}", O_WRONLY|O_CREAT|O_NOCTTY|O_NONBLOCK, 0666);`,
          terminalOutput: `user@linux:~$ ${fullCmd}`
        },
        {
          id: 'touch_utime',
          stepNum: 2,
          timeOffset: 3200,
          name: `2. utimensat() Updates Inode Timestamps`,
          simpleTitle: '2. Set Timestamps',
          layer: 'VFS & Storage',
          activeNode: 'vfs_tree',
          route: { from: 'syscall', to: 'vfs', color: 0x00ff88 },
          sound: 'disk',
          cameraTarget: 'vfs',
          ring: 0,
          syscall: 'utimensat(280)',
          registers: { ATIME: 'NOW', MTIME: 'NOW' },
          simpleExplanation: `Kernel sets nanosecond timestamps in the file's Inode header and closes the file descriptor.`,
          explanation: `ext4 commits updated timestamp fields to disk.`,
          analogy: `💡 Analogy: Stamping today's date on the folder.`,
          codeSnippet: `utimensat(AT_FDCWD, "${filename}", NULL, 0);`,
          terminalOutput: null
        },
        {
          id: 'touch_exit',
          stepNum: 3,
          timeOffset: 6400,
          name: `3. File Ready (0 Bytes) & Exit`,
          simpleTitle: '3. Done',
          layer: 'User Space & Terminal',
          activeNode: 'terminal',
          route: { from: 'vfs', to: 'terminal', color: 0x00f3ff },
          sound: 'success',
          cameraTarget: 'userspace',
          ring: 3,
          syscall: 'exit_group(0)',
          registers: { RAX: '0' },
          simpleExplanation: `File created on disk. Shell returns prompt.`,
          explanation: `Exit status 0 returned to parent shell.`,
          analogy: `💡 Analogy: Job finished. Ready for next command.`,
          codeSnippet: `return 0;`,
          terminalOutput: `user@linux:~$ `
        }
      ]
    };
  }

  buildCommandNotFoundPlan(fullCmd, cmdName) {
    return {
      name: fullCmd,
      title: `Command Not Found (Exit Code 127: "${cmdName}")`,
      summaryText: `What happens when you type an invalid command: Shell searches every folder in $PATH, gets ENOENT (No such file), halts, and returns exit code 127. Zero fork() or execve() occurs!`,
      isError: true,
      stages: [
        {
          id: 'err_input',
          stepNum: 1,
          timeOffset: 0,
          name: `1. Typed Unknown Command: "${cmdName}"`,
          simpleTitle: '1. Unknown Input',
          layer: 'User Space',
          activeNode: 'terminal',
          route: null,
          sound: 'key',
          cameraTarget: 'userspace',
          ring: 3,
          syscall: null,
          registers: { RIP: '0x55555550', CMD: `"${cmdName}"` },
          simpleExplanation: `You typed "${fullCmd}". Shell must figure out what binary to execute.`,
          explanation: `Shell captures input and parses command tokens.`,
          analogy: `💡 Analogy: Asking for an item that might not be on the menu.`,
          codeSnippet: `parse_command("${fullCmd}");`,
          terminalOutput: `user@linux:~$ ${fullCmd}`
        },
        {
          id: 'err_path_search',
          stepNum: 2,
          timeOffset: 3200,
          name: `2. Searching $PATH Directories (All Return ENOENT)`,
          simpleTitle: '2. $PATH Search Failed',
          layer: 'User Space (Shell $PATH)',
          activeNode: 'path',
          route: { from: 'terminal', to: 'path', color: 0xff0055 },
          sound: 'error',
          cameraTarget: 'userspace',
          ring: 3,
          syscall: 'faccessat2() -> ENOENT (-2)',
          registers: { RIP: '0x55555590', PATH_CHECK: '/usr/bin:/bin', STATUS: 'ENOENT' },
          simpleExplanation: `The shell checks /usr/local/bin/${cmdName}, /usr/bin/${cmdName}, and /bin/${cmdName}. All return ENOENT (Error: No such file).`,
          explanation: `Shell iterates through $PATH searching for executable binary. All stat/access probes return ENOENT.`,
          analogy: `💡 Analogy: Checking every aisle in the supermarket, but the item is nowhere on the shelves.`,
          codeSnippet: `// Searching $PATH:\nfaccessat2(AT_FDCWD, "/usr/bin/${cmdName}", X_OK, 0); // Returns -2 (ENOENT)\nfaccessat2(AT_FDCWD, "/bin/${cmdName}", X_OK, 0);     // Returns -2 (ENOENT)`,
          terminalOutput: null
        },
        {
          id: 'err_halt',
          stepNum: 3,
          timeOffset: 6400,
          name: `3. Execution Halted: Zero Syscalls or Process Fork`,
          simpleTitle: '3. Zero Syscalls',
          layer: 'User Space (Bash)',
          activeNode: 'lexer',
          route: { from: 'path', to: 'lexer', color: 0xff0055 },
          sound: 'error',
          cameraTarget: 'userspace',
          ring: 3,
          syscall: 'NONE (Execution Blocked)',
          registers: { EXIT_CODE: '127', PRIVILEGE: 'RING 3 ONLY' },
          simpleExplanation: `CRITICAL KERNEL PRINCIPLE: Linux does NOT switch CPU to Ring 0, does NOT allocate RAM, and does NOT fork processes for nonexistent programs!`,
          explanation: `Execution is aborted in user space. No kernel context switch or fork occurs.`,
          analogy: `💡 Analogy: The cashier tells you immediately that the item does not exist, so no order is sent to the kitchen.`,
          codeSnippet: `report_command_not_found("${cmdName}");\nlast_exit_value = 127;`,
          terminalOutput: null
        },
        {
          id: 'err_stderr',
          stepNum: 4,
          timeOffset: 9600,
          name: `4. Write to stderr (FD 2) & Return $? = 127`,
          simpleTitle: '4. Error $? = 127',
          layer: 'User Space & Terminal',
          activeNode: 'terminal',
          route: { from: 'lexer', to: 'terminal', color: 0xff0055 },
          sound: 'error',
          cameraTarget: 'userspace',
          ring: 3,
          syscall: 'write(2, "command not found\\n", 28)',
          registers: { RAX: '28', RDI: '2 (stderr)', '$?': '127' },
          simpleExplanation: `The shell writes the error message to File Descriptor 2 (Standard Error) and sets the exit status variable $? to 127.`,
          explanation: `Bash outputs error to stderr (fd 2) and sets special parameter $? to 127.`,
          analogy: `💡 Analogy: Cashier writes "Unavailable" and resets the terminal for your next order.`,
          codeSnippet: `write(STDERR_FILENO, "bash: ${cmdName}: command not found\\n", len);\n// $? = 127`,
          terminalOutput: `bash: ${cmdName}: command not found\nuser@linux:~$ `
        }
      ]
    };
  }
}
