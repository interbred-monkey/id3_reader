import { closeSync, createReadStream, existsSync, openSync, PathLike, ReadStream, statSync } from 'fs';
import { extname } from 'path';
import FileError from './errors/file.error';

export function validateFilePath(filepath: PathLike): void {
  if (!existsSync(filepath)) {
    throw new FileError('supplied path does not exist', filepath);
  }

  const stat = statSync(filepath);

  if (!stat.isFile()) {
    throw new FileError('supplied path is not a valid file', filepath);
  }

  if (stat.size === 0) {
    throw new FileError(`supplied path is a zero byte file`, filepath);
  }

  if (extname(filepath.toString()) !== '.mp3') {
    throw new FileError(`file type ${extname(filepath.toString())} is unsupported`, filepath);
  }
}

export function getFileDescriptor(filepath: string): number {
  return openSync(filepath, 'r');
}

export function closeFileUsingDescriptor(fd: number): void {
  closeSync(fd);
}

export function getReadableStream(filepath: PathLike): ReadStream {
  validateFilePath(filepath);
  return createReadStream(filepath, { autoClose: true, flags: 'r' });
}
