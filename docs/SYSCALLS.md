# Linux System Call Simulation Reference

This document catalogs the Linux system calls represented and animated within the 3D visualizer.

## System Call Registry

| Syscall Number (x86_64) | Syscall Name | Calling Arguments | Primary Subsystem |
|---|---|---|---|
| `0` | `sys_read` | `unsigned int fd, char *buf, size_t count` | VFS / File I/O |
| `1` | `sys_write` | `unsigned int fd, const char *buf, size_t count` | VFS / Terminal I/O |
| `2` | `sys_open` / `sys_openat` | `int dfd, const char *filename, int flags, umode_t mode` | VFS / Inodes |
| `3` | `sys_close` | `unsigned int fd` | File Descriptors |
| `4` | `sys_stat` / `sys_newstat` | `const char *filename, struct stat *statbuf` | VFS Metadata |
| `9` | `sys_mmap` | `unsigned long addr, unsigned long len, unsigned long prot...` | Memory / MMU |
| `11` | `sys_munmap` | `unsigned long addr, size_t len` | Memory / MMU |
| `21` | `sys_access` | `const char *filename, int mode` | Security / Permissions |
| `22` | `sys_pipe` / `sys_pipe2` | `int *fildes, int flags` | IPC / Buffers |
| `33` | `sys_dup2` | `unsigned int oldfd, unsigned int newfd` | File Descriptors |
| `56` | `sys_clone` | `unsigned long clone_flags, unsigned long newsp...` | Process Scheduler |
| `57` | `sys_fork` | `void` | Process Scheduler |
| `59` | `sys_execve` | `const char *filename, const char *const *argv...` | ELF Loader / Binary |
| `60` | `sys_exit` | `int error_code` | Process Termination |
| `61` | `sys_wait4` | `pid_t upid, int *stat_addr, int options, struct rusage *ru` | Process Scheduler |
| `62` | `sys_kill` | `pid_t pid, int sig` | Signal Dispatcher |
| `79` | `sys_getcwd` | `char *buf, unsigned long size` | VFS Namespace |
| `80` | `sys_chdir` | `const char *filename` | VFS Namespace |
| `83` | `sys_mkdir` | `const char *pathname, umode_t mode` | VFS Ext4/XFS |
| `84` | `sys_rmdir` | `const char *pathname` | VFS Ext4/XFS |
| `87` | `sys_unlink` | `const char *pathname` | VFS Ext4/XFS |
| `217` | `sys_getdents64` | `unsigned int fd, struct linux_dirent64 *dirent, unsigned int count` | Directory Listing |

## Register Convention (x86-64)
- **Syscall Number**: Loaded into `%rax`
- **Arguments (1st through 6th)**: `%rdi`, `%rsi`, `%rdx`, `%r10`, `%r8`, `%r9`
- **Return Value**: Stored in `%rax` (Negative values signify `-errno`)
