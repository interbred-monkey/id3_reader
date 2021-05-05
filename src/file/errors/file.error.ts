import { PathLike } from 'fs';

export default class FileError extends Error {
  public path: string;

  constructor(message: string, filepath: PathLike) {
    super(message);
    this.path = filepath.toString();
  }
}
