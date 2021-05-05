import { getReadableStream } from '../file/reader';
import { TagReaderInterface } from './interfaces/tag-reader.interface';

export default class TagReader implements TagReaderInterface {
  public static getTags(): ID3Tag[] {
    const readStream = getReadableStream();
  }
}
