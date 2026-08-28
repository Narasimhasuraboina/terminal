import { COMMAND_PRESETS } from './commandPresets.js';
import { LINUX_100_COMMANDS } from '../data/linux100Commands.js';

export class CommandEngine {
  constructor() {
    this.history = [];
    this.maxHistory = 50;
  }

  parseCommand(inputStr) {
    const trimmed = (inputStr || '').trim();
    if (!trimmed) return null;

    const parts = trimmed.split(/\s+/);
    const commandName = parts[0].toLowerCase();

    return {
      raw: trimmed,
      name: commandName,
      args: parts.slice(1),
      isPreset: !!COMMAND_PRESETS[trimmed]
    };
  }

  getCommandPlan(inputStr) {
    return this.generatePlan(inputStr);
  }

  generatePlan(inputStr) {
    const parsed = this.parseCommand(inputStr);
    if (!parsed) return null;

    this.addToHistory(parsed.raw);

    // 1. Direct match on presets
    if (COMMAND_PRESETS[parsed.raw]) {
      return JSON.parse(JSON.stringify(COMMAND_PRESETS[parsed.raw]));
    }

    // 2. Builtin commands (cd, pwd, echo, exit, history)
    const builtins = ['cd', 'pwd', 'echo', 'exit', 'history', 'type'];
    if (builtins.includes(parsed.name)) {
      return this.buildBuiltinPlan(parsed.name, parsed.raw, parsed.args);
    }

    // 3. Match in 100 Essential Commands Database
    const matched100 = LINUX_100_COMMANDS.find(c => 
      c.command.toLowerCase() === parsed.raw.toLowerCase() ||
      c.name.toLowerCase() === parsed.raw.toLowerCase() ||
      c.name.split(/\s+/)[0].toLowerCase() === parsed.name
    );
    if (matched100) {
      return this.build100CommandPlan(matched100, parsed.raw);
    }

    // 4. Common commands patterns
    if (parsed.name === 'rm' || parsed.name === 'unlink') {
      return this.buildRemoveFilePlan(parsed.raw, parsed.args);
    }

    if (parsed.name === 'ping') {
      return this.buildNetworkPingPlan(parsed.raw, parsed.args);
    }

    // 5. Invalid / not found command simulation
    if (parsed.name === 'test' || parsed.name === 'foobar' || parsed.name === 'asdf' || parsed.name === 'invalid') {
      return this.buildInvalidCommandPlan(parsed.raw, parsed.name);
    }

    // 6. Generic Executable Fallback Plan
    return this.buildGenericCommandPlan(parsed.raw, parsed.name, parsed.args);
  }

  build100CommandPlan(cmdData, rawInput) {
    const nodeTarget = cmdData.category === 'storage' || cmdData.category === 'files' 
      ? 'vfs_tree' 
      : (cmdData.category === 'process' ? 'mmu_memory' : 'cpu_core');

    const cameraTarget = cmdData.category === 'storage' || cmdData.category === 'files' 
      ? 'vfs' 
      : (cmdData.category === 'network' ? 'syscall' : 'kernel');

    return {
      name: rawInput || cmdData.command,
      title: cmdData.title,
      summaryText: cmdData.mission,
      stages: [
        {
          id: 'stage_1_input',
          stepNum: 1,
          timeOffset: 0,
          name: `1. Typed "${rawInput || cmdData.command}" on Terminal`,
          simpleTitle: '1. Keystrokes',
          layer: 'User Space (Ring 3)',
          activeNode: 'terminal',
          route: null,
          sound: 'key',
          cameraTarget: 'userspace',
          ring: 3,
          syscall: null,
          registers: { RIP: '0x7fff4010', RAX: '0x00000000' },
          simpleExplanation: `Your keyboard strokes are buffered in the terminal emulator and passed to the shell.`,
          explanation: `Keystrokes "${rawInput || cmdData.command}" are written to /dev/ptmx.`,
          whyHappeningHere: 'User Space (Ring 3) isolates input handling to prevent system memory corruption.',
          analogy: `💡 Analogy: Typing instructions into a secure workstation.`,
          codeSnippet: `write(ptmx_fd, "${rawInput || cmdData.command}\\n", ${rawInput.length + 1});`,
          terminalOutput: `user@linux:~$ ${rawInput || cmdData.command}`
        },
        {
          id: 'stage_2_parse',
          stepNum: 2,
          timeOffset: 3200,
          name: `2. Shell Parses & Resolves $PATH`,
          simpleTitle: '2. Parse $PATH',
          layer: 'User Space (Bash)',
          activeNode: 'lexer',
          route: { from: 'terminal', to: 'lexer', color: 0x00f3ff },
          sound: 'key',
          cameraTarget: 'userspace',
          ring: 3,
          syscall: 'faccessat2()',
          registers: { RIP: '0x5555556a', RAX: '0x00000002' },
          simpleExplanation: `The shell parses flags and locates the compiled binary on disk.`,
          explanation: `Shell tokenizes "${rawInput || cmdData.command}" and verifies executable binary permissions in $PATH.`,
          whyHappeningHere: 'The shell prepares process arguments in user memory before invoking kernel syscalls.',
          analogy: `💡 Analogy: Looking up the correct tool in your workshop before starting.`,
          codeSnippet: `// Shell finds binary in $PATH\nconst binary = "/usr/bin/${cmdData.name.split(' ')[0]}";`,
          terminalOutput: null
        },
        {
          id: 'stage_3_syscall',
          stepNum: 3,
          timeOffset: 6400,
          name: `3. Invoking ${cmdData.syscall || 'Syscall Gateway'} (Ring 0)`,
          simpleTitle: '3. Syscall Gate',
          layer: 'Syscall Security Gateway',
          activeNode: 'syscall_dispatcher',
          route: { from: 'path', to: 'syscall', color: 0xff0077 },
          sound: 'syscall',
          cameraTarget: 'syscall',
          ring: 0,
          syscall: cmdData.syscall || 'execve() / syscall()',
          registers: { RIP: '0xffffffff8100', RAX: '0x3b' },
          simpleExplanation: `CPU triggers hardware interrupt or SYSCALL instruction to switch into Ring 0 Supervisor Mode.`,
          explanation: `Executes ${cmdData.syscall || 'system call'} with validated user parameters.`,
          whyHappeningHere: cmdData.whyHappeningHere,
          analogy: `💡 Analogy: Showing security credentials to enter the high-security datacenter vault.`,
          codeSnippet: `syscall(${cmdData.syscall || 'SYS_execve'}, args...);`,
          terminalOutput: null
        },
        {
          id: 'stage_4_kernel',
          stepNum: 4,
          timeOffset: 9600,
          name: `4. Kernel Executes on Hardware Subsystems`,
          simpleTitle: '4. Hardware Exec',
          layer: 'Kernel Core & Hardware Matrix',
          activeNode: nodeTarget,
          route: { from: 'syscall', to: 'cpu', color: 0x2979ff },
          sound: 'kernel',
          cameraTarget: cameraTarget,
          ring: 0,
          syscall: null,
          registers: { RIP: '0xffffffff8140', RAX: '0x00000000' },
          simpleExplanation: `Operating system kernel coordinates CPU cores, page tables, and storage controllers.`,
          explanation: cmdData.whyHappeningHere,
          whyHappeningHere: cmdData.whyHappeningHere,
          analogy: `💡 Analogy: Engine cylinders firing in perfect rhythm to deliver output.`,
          codeSnippet: `// Kernel executes internal driver routine for ${cmdData.name}`,
          terminalOutput: null
        },
        {
          id: 'stage_5_output',
          stepNum: 5,
          timeOffset: 12800,
          name: `5. Output Stream Delivered to Terminal`,
          simpleTitle: '5. Done',
          layer: 'User Space (Terminal Output)',
          activeNode: 'terminal',
          route: { from: 'cpu', to: 'terminal', color: 0x00f3ff },
          sound: 'success',
          cameraTarget: 'userspace',
          ring: 3,
          syscall: 'write(1)',
          registers: { RIP: '0x7fff4100', RAX: '0x0' },
          simpleExplanation: `Data stream is written to standard output (stdout fd 1) and rendered on your screen.`,
          explanation: `Streams formatted output back into terminal PTY master.`,
          whyHappeningHere: 'Terminal emulator rasterizes characters on screen in User Space.',
          analogy: `💡 Analogy: Receiving the final printed report back at your desk.`,
          codeSnippet: `write(STDOUT_FILENO, output_buffer, len);`,
          terminalOutput: cmdData.output 
            ? `user@linux:~$ ${rawInput || cmdData.command}\n${cmdData.output}\nuser@linux:~$ ` 
            : `user@linux:~$ ${rawInput || cmdData.command}\nuser@linux:~$ `
        }
      ]
    };
  }

  buildBuiltinPlan(cmdName, fullCmd, parts) {
    return {
      name: fullCmd,
      title: `Shell Built-in Execution ("${cmdName}")`,
      summaryText: `"${cmdName}" is executed directly inside the shell process memory without forking a new PID or executing an external binary from disk.`,
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
          whyHappeningHere: 'Input starts in unprivileged User Space before being evaluated by the shell.',
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
          whyHappeningHere: 'Builtins run inside shell memory so that environment changes (like changing directories or setting variables) persist in your active session.',
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
          whyHappeningHere: 'Zero context switches or disk lookups needed, making builtins execute at microsecond speeds.',
          analogy: `💡 Analogy: Done instantly with zero external overhead.`,
          codeSnippet: `return EXECUTION_SUCCESS;`,
          terminalOutput: cmdName === 'pwd' ? `/home/user\nuser@linux:~$ ` : (cmdName === 'echo' ? `${parts.join(' ')}\nuser@linux:~$ ` : `user@linux:~$ `)
        }
      ]
    };
  }

  buildRemoveFilePlan(fullCmd, parts) {
    const target = parts[0] || 'file.txt';
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
          whyHappeningHere: 'User request must be authorized before invoking kernel filesystem modifications.',
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
          whyHappeningHere: 'Filesystem directory tables are protected kernel data structures modified exclusively in Ring 0.',
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
          whyHappeningHere: 'Storage hardware controller directly manages physical flash/magnetic block reallocation.',
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
          whyHappeningHere: 'Process cleanup returns CPU resources and unlocks the terminal prompt.',
          analogy: `💡 Analogy: Inventory updated. Ready for next command.`,
          codeSnippet: `return 0;`,
          terminalOutput: `user@linux:~$ `
        }
      ]
    };
  }

  buildNetworkPingPlan(fullCmd, parts) {
    const host = parts[0] || '8.8.8.8';
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
          whyHappeningHere: 'Raw network sockets require kernel privilege to prevent user apps from spoofing arbitrary network packets.',
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
          whyHappeningHere: 'Kernel network stack manages routing tables, IP checksum calculation, and hardware DMA transmission.',
          analogy: `💡 Analogy: Post office trucks the letter across the network highway.`,
          codeSnippet: `sendto(sock, &icmp_hdr, len, 0, (struct sockaddr*)&dest, sizeof(dest));`,
          terminalOutput: null
        },
        {
          id: 'ping_rx',
          stepNum: 3,
          timeOffset: 6400,
          name: `3. NIC Hardware Interrupt Receives Reply`,
          simpleTitle: '3. NIC Hardware IRQ',
          layer: 'Hardware Interrupt & RAM',
          activeNode: 'mmu_memory',
          route: { from: 'cpu', to: 'mmu', color: 0x00ff88 },
          sound: 'disk',
          cameraTarget: 'kernel',
          ring: 0,
          syscall: 'recvmsg() [47]',
          registers: { IRQ: 'eth0 (Line 19)', RTT: '14.2 ms' },
          simpleExplanation: `Remote server responds! The physical NIC triggers a hardware interrupt (IRQ), waking up the kernel to copy the reply packet into RAM.`,
          explanation: `Hardware interrupt signals incoming packet. Driver allocates sk_buff and passes it up the TCP/IP stack.`,
          whyHappeningHere: 'Hardware Interrupts (IRQ) allow the CPU to execute other tasks until the exact microsecond a network packet arrives.',
          analogy: `💡 Analogy: Doorbell rings as the return postcard arrives.`,
          codeSnippet: `recvmsg(sock, &msg, 0);`,
          terminalOutput: null
        },
        {
          id: 'ping_render',
          stepNum: 4,
          timeOffset: 9600,
          name: `4. Print Round-Trip Latency & Statistics`,
          simpleTitle: '4. Print RTT',
          layer: 'User Space & Terminal',
          activeNode: 'terminal',
          route: { from: 'mmu', to: 'terminal', color: 0x00f3ff },
          sound: 'success',
          cameraTarget: 'userspace',
          ring: 3,
          syscall: 'write(1)',
          registers: { RAX: '1' },
          simpleExplanation: `Ping calculates round-trip time (14.2 ms) and writes formatted statistics to terminal output.`,
          explanation: `Ping formats round-trip time and writes to stdout.`,
          whyHappeningHere: 'Terminal displays human-readable output while the socket remains open for subsequent pings.',
          analogy: `💡 Analogy: Clocking the total delivery turnaround time.`,
          codeSnippet: `printf("64 bytes from %s: icmp_seq=1 ttl=64 time=14.2 ms\\n", host);`,
          terminalOutput: `64 bytes from ${host}: icmp_seq=1 ttl=64 time=14.2 ms\nuser@linux:~$ `
        }
      ]
    };
  }

  buildInvalidCommandPlan(fullCmd, cmdName) {
    return {
      name: fullCmd,
      title: `Command Not Found Resolution ("${cmdName}")`,
      summaryText: `What happens when you type an invalid command: Shell searches every single folder in $PATH, finds nothing, and outputs error code 127.`,
      stages: [
        {
          id: 'err_input',
          stepNum: 1,
          timeOffset: 0,
          name: `1. Typed Unknown Command "${cmdName}"`,
          simpleTitle: '1. Keystrokes',
          layer: 'User Space (Terminal)',
          activeNode: 'terminal',
          route: null,
          sound: 'key',
          cameraTarget: 'userspace',
          ring: 3,
          syscall: null,
          registers: { RIP: '0x55555550' },
          simpleExplanation: `You entered "${fullCmd}". Shell prepares to look for this executable.`,
          explanation: `Bash tokenizes input string and extracts command candidate "${cmdName}".`,
          whyHappeningHere: 'Input enters via pseudoterminal before shell parsing begins.',
          analogy: `💡 Analogy: Asking for a book title that might not exist in the library.`,
          codeSnippet: `COMMAND *cmd = parse_string("${fullCmd}");`,
          terminalOutput: `user@linux:~$ ${fullCmd}`
        },
        {
          id: 'err_path_scan',
          stepNum: 2,
          timeOffset: 3200,
          name: `2. Exhaustive Search Across All $PATH Folders`,
          simpleTitle: '2. Search $PATH',
          layer: 'User Space (Shell $PATH)',
          activeNode: 'path',
          route: { from: 'terminal', to: 'lexer', color: 0xff0077 },
          sound: 'error',
          cameraTarget: 'userspace',
          ring: 3,
          syscall: 'faccessat2() x5',
          registers: { PATH_CHECK: '/usr/local/bin:/usr/bin:/bin', RESULT: 'ENOENT (Not Found)' },
          simpleExplanation: `Bash checks: /usr/local/sbin/${cmdName} ➔ /usr/local/bin/${cmdName} ➔ /usr/bin/${cmdName} ➔ /bin/${cmdName}. None exist!`,
          explanation: `Shell iterates through every directory in PATH variable. Every faccessat2() call returns ENOENT (No such file or directory).`,
          whyHappeningHere: 'The shell checks every directory in $PATH in order before declaring a command missing.',
          analogy: `💡 Analogy: Checking every shelf in the library from A to Z and finding no match.`,
          codeSnippet: `for (dir in PATH) {\n  if (stat(dir + "/${cmdName}") == 0) found;\n}\n// All returned ENOENT`,
          terminalOutput: null
        },
        {
          id: 'err_output',
          stepNum: 3,
          timeOffset: 6400,
          name: `3. Output Error: "command not found" (Exit Code 127)`,
          simpleTitle: '3. Exit Code 127',
          layer: 'User Space & Terminal',
          activeNode: 'terminal',
          route: { from: 'lexer', to: 'terminal', color: 0xff0077 },
          sound: 'error',
          cameraTarget: 'userspace',
          ring: 3,
          syscall: 'write(2, "command not found\\n")',
          registers: { EXIT_STATUS: '127 (COMMAND NOT FOUND)' },
          simpleExplanation: `Bash writes the error message to stderr (File Descriptor 2) and sets the special variable $? to 127.`,
          explanation: `Shell writes error to stderr (fd 2), sets exit status $?=127, and redraws prompt.`,
          whyHappeningHere: 'Unix standardizes exit code 127 specifically to represent "Command Not Found".',
          analogy: `💡 Analogy: Librarian informs you the book is not in the system.`,
          codeSnippet: `fprintf(stderr, "bash: %s: command not found\\n", "${cmdName}");\nlast_command_exit_value = 127;`,
          terminalOutput: `bash: ${cmdName}: command not found\nuser@linux:~$ `
        }
      ]
    };
  }

  buildGenericCommandPlan(fullCmd, cmdName, args) {
    return {
      name: fullCmd,
      title: `Standard Binary Execution ("${cmdName}")`,
      summaryText: `Generic Linux execution pipeline for "${cmdName}": Parsing ➔ $PATH resolution ➔ fork() ➔ execve() ➔ Memory loading ➔ Output.`,
      stages: [
        {
          id: 'gen_input',
          stepNum: 1,
          timeOffset: 0,
          name: `1. You Type "${fullCmd}"`,
          simpleTitle: `1. Input: ${cmdName}`,
          layer: 'User Space (Terminal)',
          activeNode: 'terminal',
          route: null,
          sound: 'key',
          cameraTarget: 'userspace',
          ring: 3,
          syscall: null,
          registers: { RIP: '0x55555550' },
          simpleExplanation: `Terminal captures keystrokes and delivers them to the shell.`,
          explanation: `Keystrokes delivered to shell via pseudoterminal.`,
          whyHappeningHere: 'User space input capture isolates user apps from kernel memory.',
          analogy: `💡 Analogy: Writing instructions on a task slip.`,
          codeSnippet: `write(master_ptmx, "${fullCmd}\\n", len);`,
          terminalOutput: `user@linux:~$ ${fullCmd}`
        },
        {
          id: 'gen_path',
          stepNum: 2,
          timeOffset: 3200,
          name: `2. Shell Finds /usr/bin/${cmdName}`,
          simpleTitle: '2. $PATH Resolution',
          layer: 'User Space (Shell $PATH)',
          activeNode: 'path',
          route: { from: 'terminal', to: 'path', color: 0x00f3ff },
          sound: 'key',
          cameraTarget: 'userspace',
          ring: 3,
          syscall: 'faccessat2()',
          registers: { BINARY: `/usr/bin/${cmdName}` },
          simpleExplanation: `Shell resolves executable location on disk at /usr/bin/${cmdName}.`,
          explanation: `Shell checks $PATH directories and finds executable ELF binary.`,
          whyHappeningHere: 'Executable binaries reside on disk for modularity and easy software installation.',
          analogy: `💡 Analogy: Finding the tool in the workshop rack.`,
          codeSnippet: `target_binary = "/usr/bin/${cmdName}";`,
          terminalOutput: null
        },
        {
          id: 'gen_fork_exec',
          stepNum: 3,
          timeOffset: 6400,
          name: `3. fork() & execve() Launch Process`,
          simpleTitle: '3. Fork & Exec',
          layer: 'Syscall Gateway (Ring 0)',
          activeNode: 'fork',
          route: { from: 'path', to: 'fork', color: 0xff0077 },
          sound: 'fork',
          cameraTarget: 'syscall',
          ring: 0,
          syscall: 'clone3() & execve(59)',
          registers: { PID: '6240', SYSCALL: '59 (execve)' },
          simpleExplanation: `Kernel creates child process and loads the /usr/bin/${cmdName} ELF binary into memory.`,
          explanation: `Kernel clones child process, wipes previous address space, and executes target binary.`,
          whyHappeningHere: 'Process cloning prevents shell replacement while Ring 0 privilege switch allows memory reloading.',
          analogy: `💡 Analogy: Hiring a specialist worker and handing them the exact blueprint.`,
          codeSnippet: `if (fork() == 0) execve("/usr/bin/${cmdName}", argv, envp);`,
          terminalOutput: null
        },
        {
          id: 'gen_mmu_exec',
          stepNum: 4,
          timeOffset: 9600,
          name: `4. CPU & RAM Execute Instructions`,
          simpleTitle: '4. CPU Execution',
          layer: 'Kernel & Hardware Execution',
          activeNode: 'cpu_core',
          route: { from: 'fork', to: 'cpu', color: 0x2979ff },
          sound: 'kernel',
          cameraTarget: 'kernel',
          ring: 3,
          syscall: null,
          registers: { RIP: '0x401000', CPU_CYCLES: '14,200' },
          simpleExplanation: `The CPU executes compiled machine code instructions from physical RAM.`,
          explanation: `CPU executes ELF instructions mapped in user virtual memory space.`,
          whyHappeningHere: 'Hardware CPU registers and MMU paging hardware execute machine instructions natively.',
          analogy: `💡 Analogy: Specialist performs the requested task in the cleanroom.`,
          codeSnippet: `// CPU fetches and executes x86_64 opcodes from RAM`,
          terminalOutput: null
        },
        {
          id: 'gen_output',
          stepNum: 5,
          timeOffset: 12800,
          name: `5. Output Streamed & Process Exits`,
          simpleTitle: '5. Output & Exit',
          layer: 'User Space & Terminal',
          activeNode: 'terminal',
          route: { from: 'cpu', to: 'terminal', color: 0x00f3ff },
          sound: 'success',
          cameraTarget: 'userspace',
          ring: 3,
          syscall: 'exit_group(0)',
          registers: { RAX: '0' },
          simpleExplanation: `Command outputs result to terminal stdout and exits cleanly with code 0.`,
          explanation: `Child writes output to stdout and calls exit_group(0). Shell prompt restored.`,
          whyHappeningHere: 'Process reaps all memory buffers and returns control to the parent shell.',
          analogy: `💡 Analogy: Specialist hands over results and finishes shift.`,
          codeSnippet: `exit_group(0);`,
          terminalOutput: `[Executed ${cmdName} successfully]\nuser@linux:~$ `
        }
      ]
    };
  }

  addToHistory(cmd) {
    if (this.history[0] !== cmd) {
      this.history.unshift(cmd);
      if (this.history.length > this.maxHistory) {
        this.history.pop();
      }
    }
  }

  getHistory() {
    return [...this.history];
  }
}
