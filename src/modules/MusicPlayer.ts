import { Player, type Track } from "magmastream";

export class MusicPlayer extends Player {
    previousTracks: Track[] = [];

    stopped = false;
};
