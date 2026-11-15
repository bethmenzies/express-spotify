export class ArtistsAlbumsError extends Error {
  error: any
  constructor(artist: any, error: any) {
    super(`Albums by artist call errored at artist: ${artist.name}`)
    this.error = error
    this.name = 'ArtistsAlbumsError'
    Object.setPrototypeOf(this, ArtistsAlbumsError.prototype)
  }
}

export class AlbumsTracksError extends Error {
  error: any
  constructor(album: any, error: any) {
    super(`Tracks by album call errored at album: ${album.name} of artist: ${album.artist.name}`)
    this.error = error
    this.name = 'AlbumsTracksError'
    Object.setPrototypeOf(this, AlbumsTracksError.prototype)
  }
}

export class GetPlaylistsError extends Error {
  error: any
  constructor(error: any) {
    super('Get playlists call errored')
    this.error = error
    this.name = 'GetPlaylistsError'
    Object.setPrototypeOf(this, GetPlaylistsError.prototype)
  } 
}

export class PlaylistTrackError extends Error {
  error: any
  constructor(track: any, error: any) {
    super(`Playlist call errored adding track: ${track.name} of artist: ${track.album.artist.name}`)
    this.error = error
    this.name = 'PlaylistTrackError'
    Object.setPrototypeOf(this, PlaylistTrackError.prototype)
  }
}

export class PlaylistTracksError extends Error {
  error: any
  constructor(action: string, error: any) {
    super(`Playlist call errored ${action} tracks`)
    this.error = error
    this.name = 'PlaylistTracksError'
    Object.setPrototypeOf(this, PlaylistTracksError.prototype)
  }
}

export class ArtistPlaylistTracksError extends Error {
  error: any
  constructor(artist: any, error: any) {
    super(`${artist.name} playlist call errored adding tracks`)
    this.error = error
    this.name = 'ArtistPlaylistTracksError'
    Object.setPrototypeOf(this, ArtistPlaylistTracksError.prototype)
  }
}

export class RequestError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RequestError'
    Object.setPrototypeOf(this, RequestError.prototype)
  }
}

export class RequestParamError extends Error {
  constructor(callName: string, param: string, paramValue: string) {
    super(`${callName} call cannot be made due to '${param}' with value: ${paramValue}`)
    this.name = 'RequestParamError'
    Object.setPrototypeOf(this, RequestParamError.prototype)
  }
}

export class ResponseNotJsonError extends Error {
  constructor(responseBody: string) {
    super(`Spotify response could not be parsed to JSON: ${responseBody}`)
    this.name = 'ResponseNotJsonError'
    Object.setPrototypeOf(this, ResponseNotJsonError.prototype)
  }
}

export class ResponseError extends Error {
  constructor(status: number, message: string ) {
    super(`Spotify response not OK\nStatus: ${status}\nMessage: ${message}`)
    this.name = 'ResponseError'
    Object.setPrototypeOf(this, ResponseError.prototype)
  }
}

export class Response429Error extends Error {
  constructor(retryAfter: number, status: number, message: string) {
    super(`Spotify response not OK\nStatus: ${status}\nMessage: ${message}\nRetry after ${retryAfter} minutes`)
    this.name = 'Response429Error'
    Object.setPrototypeOf(this, Response429Error.prototype)
  }
}

export class CreatePlaylistError extends Error {
  error: any
  constructor(playlistName: string, error: any) {
    super(`Error creating playlist with name: ${playlistName}`)
    this.error = error
    this.name = 'CreatePlaylistError'
    Object.setPrototypeOf(this, CreatePlaylistError.prototype)
  }
}