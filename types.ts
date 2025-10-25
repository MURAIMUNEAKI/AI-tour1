
export interface UserLocation {
  latitude: number;
  longitude: number;
}

export interface WebSource {
  uri: string;
  title: string;
}

export interface MapSource {
  uri: string;
  title: string;
  placeAnswerSources?: {
    reviewSnippets: {
        uri: string;
        title: string;
    }[];
  }[];
}

export interface GroundingChunk {
  web?: WebSource;
  maps?: MapSource;
}
