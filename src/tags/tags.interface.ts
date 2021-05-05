import { UserLabels } from '../labels/user-labels.type';

export interface Tag extends UserLabels {
  artist: string;
  title: string;
  albumTitle: string;
  genre: string;
}
