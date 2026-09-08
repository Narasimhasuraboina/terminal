# Virtual File System (VFS) & Inode Memory Model

The 3D Linux Terminal Internals visualizer models the Linux Virtual File System (VFS) layer.

## Inode Structure (`struct inode`)

Every file, directory, socket, or device in Linux is represented by an inode containing:
- **Inode Number**: Unique integer identifier within the mounted filesystem.
- **File Mode**: Permissions (`rwxr-xr-x`) and file type (Regular, Directory, FIFO, Socket, Block/Char Device).
- **Owner & Group**: UID and GID owning the resource.
- **Size**: File size in bytes.
- **Timestamps**: Access time (`atime`), Modification time (`mtime`), Change time (`ctime`).
- **Block Pointers**: Direct and indirect pointers referencing physical storage blocks.

## Directory Entries (`struct dentry`)
- Dentries link human-readable path strings (`/home/user/document.txt`) to inode numbers.
- **Dentry Cache (dcache)**: Keeps recent path lookups in RAM for O(1) resolution without disk I/O.

## Page Cache Integration
- Read requests query the page cache hash table using `(inode, file_offset)`.
- **Cache Hit**: Data is copied directly from kernel memory to user buffer without disk activity.
- **Cache Miss**: Page allocated in RAM, Block I/O request submitted to NVMe driver, process placed into uninterruptible sleep (`TASK_UNINTERRUPTIBLE`) until DMA interrupt completes.
