import * as fs from 'fs';
import FileError from './errors/file.error';
import { validateFilePath } from './reader';

jest.mock('fs');

describe('file.reader', () => {
  describe('validateFilePath()', () => {
    let existsSyncSpy: jest.SpyInstance;
    let statSyncSpy: jest.SpyInstance;

    const isFileMock: jest.Mock = jest.fn(() => true);
    const existsSyncMock: jest.Mock = jest.fn(() => true);
    const statSyncMock: jest.Mock = jest.fn(() => ({
      isFile: isFileMock,
      size: 100
    }));

    beforeEach(() => {
      existsSyncSpy = jest.spyOn(fs, 'existsSync').mockImplementation(existsSyncMock);
      statSyncSpy = jest.spyOn(fs, 'statSync').mockImplementation(statSyncMock);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should throw a FileError if the file does not exist', () => {
      existsSyncSpy.mockReturnValueOnce(false);

      expect(() => validateFilePath('./filename.mp3')).toThrow(
        new FileError('supplied path does not exist', './filename.mp3')
      );
      expect(existsSyncSpy).toHaveBeenCalledTimes(1);
      expect(existsSyncSpy.mock.calls[0][0]).toEqual('./filename.mp3');
    });

    it('should throw a FileError if the path is a directory', () => {
      isFileMock.mockReturnValueOnce(false);
      expect(() => validateFilePath('./filepath')).toThrow(
        new FileError('supplied path is not a valid file', './filepath')
      );
      expect(statSyncSpy).toHaveBeenCalledTimes(1);
      expect(statSyncSpy.mock.calls[0][0]).toEqual('./filepath');
      expect(isFileMock).toHaveBeenCalledTimes(1);
    });

    it('should throw a FileError if the file contains no data', () => {
      statSyncMock.mockImplementationOnce(() => ({
        isFile: isFileMock,
        size: 0
      }));

      expect(() => validateFilePath('./filename.mp3')).toThrow(
        new FileError('supplied path is a zero byte file', './filename.mp3')
      );
      expect(statSyncSpy).toHaveBeenCalledTimes(1);
      expect(statSyncSpy.mock.calls[0][0]).toEqual('./filename.mp3');
      expect(isFileMock).toHaveBeenCalledTimes(1);
    });

    it('should throw a FileError if the extension is unsupported', () => {
      expect(() => validateFilePath('./filename.txt')).toThrow(
        new FileError('file type .txt is unsupported', './filename.txt')
      );
    });
  });
});
