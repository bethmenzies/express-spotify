// taken from db
const armsLength = {
  name: 'Arm\'s Length',
  spotify_id: '1KXSj6uiC8Wtl2wCckVmAD',
  watchlist: false
}

// taken from db
const theWeightDB = {
  name: 'The Weight',
  spotify_id: '6Ggy54mUWoAMosIAjMS8wE',
  url: 'https://open.spotify.com/track/6Ggy54mUWoAMosIAjMS8wE',
  uri: 'spotify:track:6Ggy54mUWoAMosIAjMS8wE',
  album: {
    name: 'There\'s A Whole World Out There',
    spotify_id: '6Z5Wqu7fduJ0GHt1JgCFQE',
    release_date: '2025-05-16',
    artist: {
      name: 'Arm\'s Length',
      spotify_id: '1KXSj6uiC8Wtl2wCckVmAD',
      watchlist: false,
      related_artist: {
        name: "",
        spotify_id: ""
      }
    },
  },
  track_number: 4,
  playlist_position: 3,
  to_include: true,
  watchlist: false
}

// taken from spotify response, with added artist and relatedArtist fields
const theresAWholeWorldOutThere = {
  "album_type": "album",
  "total_tracks": 12,
  "external_urls": {
    "spotify": "https://open.spotify.com/album/6Z5Wqu7fduJ0GHt1JgCFQE"
  },
  "href": "https://api.spotify.com/v1/albums/6Z5Wqu7fduJ0GHt1JgCFQE",
  "id": "6Z5Wqu7fduJ0GHt1JgCFQE",
  "images": [
    {
      "url": "https://i.scdn.co/image/ab67616d0000b273e0e0c00ccbd1d9d5fb8d8657",
      "height": 640,
      "width": 640
    },
    {
      "url": "https://i.scdn.co/image/ab67616d00001e02e0e0c00ccbd1d9d5fb8d8657",
      "height": 300,
      "width": 300
    },
    {
      "url": "https://i.scdn.co/image/ab67616d00004851e0e0c00ccbd1d9d5fb8d8657",
      "height": 64,
      "width": 64
    }
  ],
  "name": "There's A Whole World Out There",
  "release_date": "2025-05-16",
  "release_date_precision": "day",
  "type": "album",
  "uri": "spotify:album:6Z5Wqu7fduJ0GHt1JgCFQE",
  "artists": [
    {
      "external_urls": {
        "spotify": "https://open.spotify.com/artist/1KXSj6uiC8Wtl2wCckVmAD"
      },
      "href": "https://api.spotify.com/v1/artists/1KXSj6uiC8Wtl2wCckVmAD",
      "id": "1KXSj6uiC8Wtl2wCckVmAD",
      "name": "Arm's Length",
      "type": "artist",
      "uri": "spotify:artist:1KXSj6uiC8Wtl2wCckVmAD"
    }
  ],
  "artist": {
    "name": "Arm's Length",
    "spotify_id": "1KXSj6uiC8Wtl2wCckVmAD",
    "watchlist": false
  },
  "relatedArtist": {
    "name": "",
    "spotify_id": ""
  }
}

// taken from spotify response, with added album field
const theWeight = {
  "artists": [
    {
      "external_urls": {
        "spotify": "https://open.spotify.com/artist/1KXSj6uiC8Wtl2wCckVmAD"
      },
      "href": "https://api.spotify.com/v1/artists/1KXSj6uiC8Wtl2wCckVmAD",
      "id": "1KXSj6uiC8Wtl2wCckVmAD",
      "name": "Arm's Length",
      "type": "artist",
      "uri": "spotify:artist:1KXSj6uiC8Wtl2wCckVmAD"
    }
  ],
  "disc_number": 1,
  "duration_ms": 226125,
  "explicit": false,
  "external_urls": {
    "spotify": "https://open.spotify.com/track/6Ggy54mUWoAMosIAjMS8wE"
  },
  "href": "https://api.spotify.com/v1/tracks/6Ggy54mUWoAMosIAjMS8wE",
  "id": "6Ggy54mUWoAMosIAjMS8wE",
  "name": "The Weight",
  "track_number": 4,
  "type": "track",
  "uri": "spotify:track:6Ggy54mUWoAMosIAjMS8wE",
  "is_local": false,
  "album": theresAWholeWorldOutThere
}

// taken from db
const fallOutBoy = {
  name: 'Fall Out Boy',
  spotify_id: '4UXqAaa6dQYAk18Lv7PEgX',
  watchlist: false,
  related_artists: [
    {
      name: 'Patrick Stump',
      spotify_id: '0wsdUS0EJ7zHgti2nxTVWR'
    },
    {
      name: 'Patrick Stump',
      spotify_id: '2EZKXUEU786qi03hHRu6Bl'
    },
    {
      name: 'Pete Wentz',
      spotify_id: '6eNCYcluBDxyf0kkn4j7rD'
    }
  ]
}

// taken from db
const startTodayToIncludeDB = {
  name: 'Start Today',
  spotify_id: '5XMsZRbmwK3BR3EuwMAgua',
  url: 'https://open.spotify.com/track/5XMsZRbmwK3BR3EuwMAgua',
  uri: 'spotify:track:5XMsZRbmwK3BR3EuwMAgua',
  album: {
    name: 'From Under The Cork Tree (20th Anniversary Deluxe)',
    spotify_id: '3mcEMwTAA2eJUDsUgsdCbc',
    release_date: '2025-10-17',
    artist: {
      name: 'Fall Out Boy',
      spotify_id: '4UXqAaa6dQYAk18Lv7PEgX',
      watchlist: false,
      related_artist: {
        name: "",
        spotify_id: ""
      }
    },
  },
  track_number: 5,
  playlist_position: 114,
  to_include: true,
  watchlist: false,
}

// taken from db
const startTodayNotIncludeDB = {
  name: 'Start Today',
  spotify_id: '3DZSUGnqwJwQIoUbHPcSqu',
  url: 'https://open.spotify.com/track/3DZSUGnqwJwQIoUbHPcSqu',
  uri: 'spotify:track:3DZSUGnqwJwQIoUbHPcSqu',
  album: {
    name: 'Start Today',
    spotify_id: '7yj4Fc4cus1NY80wfIcSf0',
    release_date: '2025-08-27',
    artist: {
      name: 'Fall Out Boy',
      spotify_id: '4UXqAaa6dQYAk18Lv7PEgX',
      watchlist: false,
      related_artist: {
        name: "",
        spotify_id: ""
      }
    },
  },
  track_number: 1,
  playlist_position: -1,
  to_include: false,
  watchlist: false,
}

// taken from db
const particlePhysicsDB = {
  name: 'Particle Physics',
  spotify_id: '5g8WLjKlv9oQsZJoHmaqID',
  url: 'https://open.spotify.com/track/5g8WLjKlv9oQsZJoHmaqID',
  uri: 'spotify:track:5g8WLjKlv9oQsZJoHmaqID',
  album: {
    name: 'The Same Old Wasted Wonderful World',
    spotify_id: '7gf7mD5ZIc3aValzADwgnz',
    release_date: '2025-09-19',
    artist: {
      name: 'Fall Out Boy',
      spotify_id: '4UXqAaa6dQYAk18Lv7PEgX',
      watchlist: false,
      related_artist: {
        name: "Patrick Stump",
        spotify_id: "0wsdUS0EJ7zHgti2nxTVWR"
      }
    },
  },
  track_number: 3,
  playlist_position: 122,
  to_include: true,
  watchlist: false,
}

// taken from spotify response, with added artist and relatedArtist fields
const fromUnderTheCorkTree = {
  "album_type": "album",
  "total_tracks": 31,
  "external_urls": {
    "spotify": "https://open.spotify.com/album/3mcEMwTAA2eJUDsUgsdCbc"
  },
  "href": "https://api.spotify.com/v1/albums/3mcEMwTAA2eJUDsUgsdCbc",
  "id": "3mcEMwTAA2eJUDsUgsdCbc",
  "images": [
    {
      "url": "https://i.scdn.co/image/ab67616d0000b273221e68c325cfc3821a2a6939",
      "height": 640,
      "width": 640
    },
    {
      "url": "https://i.scdn.co/image/ab67616d00001e02221e68c325cfc3821a2a6939",
      "height": 300,
      "width": 300
    },
    {
      "url": "https://i.scdn.co/image/ab67616d00004851221e68c325cfc3821a2a6939",
      "height": 64,
      "width": 64
    }
  ],
  "name": "From Under The Cork Tree (20th Anniversary Deluxe)",
  "release_date": "2025-10-17",
  "release_date_precision": "day",
  "type": "album",
  "uri": "spotify:album:3mcEMwTAA2eJUDsUgsdCbc",
  "artists": [
    {
      "external_urls": {
        "spotify": "https://open.spotify.com/artist/4UXqAaa6dQYAk18Lv7PEgX"
      },
      "href": "https://api.spotify.com/v1/artists/4UXqAaa6dQYAk18Lv7PEgX",
      "id": "4UXqAaa6dQYAk18Lv7PEgX",
      "name": "Fall Out Boy",
      "type": "artist",
      "uri": "spotify:artist:4UXqAaa6dQYAk18Lv7PEgX"
    }
  ],
  "artist": {
    "name": "Fall Out Boy",
    "spotify_id": "4UXqAaa6dQYAk18Lv7PEgX",
    "watchlist": false
  },
  "relatedArtist": {
    "name": "",
    "spotify_id": ""
  }
}

// taken from spotify response, with added album field
const startTodayToInclude = {
  "artists": [
    {
      "external_urls": {
        "spotify": "https://open.spotify.com/artist/4UXqAaa6dQYAk18Lv7PEgX"
      },
      "href": "https://api.spotify.com/v1/artists/4UXqAaa6dQYAk18Lv7PEgX",
      "id": "4UXqAaa6dQYAk18Lv7PEgX",
      "name": "Fall Out Boy",
      "type": "artist",
      "uri": "spotify:artist:4UXqAaa6dQYAk18Lv7PEgX"
    }
  ],
  "disc_number": 2,
  "duration_ms": 122706,
  "explicit": false,
  "external_urls": {
    "spotify": "https://open.spotify.com/track/5XMsZRbmwK3BR3EuwMAgua"
  },
  "href": "https://api.spotify.com/v1/tracks/5XMsZRbmwK3BR3EuwMAgua",
  "id": "5XMsZRbmwK3BR3EuwMAgua",
  "name": "Start Today",
  "track_number": 5,
  "type": "track",
  "uri": "spotify:track:5XMsZRbmwK3BR3EuwMAgua",
  "is_local": false,
  "album": fromUnderTheCorkTree
}

// taken from spotify response, with added artist and relatedArtist fields
const startToday = {
  "album_type": "single",
  "total_tracks": 1,
  "external_urls": {
    "spotify": "https://open.spotify.com/album/7yj4Fc4cus1NY80wfIcSf0"
  },
  "href": "https://api.spotify.com/v1/albums/7yj4Fc4cus1NY80wfIcSf0",
  "id": "7yj4Fc4cus1NY80wfIcSf0",
  "images": [
    {
      "url": "https://i.scdn.co/image/ab67616d0000b273eeda6d464919b82e4db659b5",
      "height": 640,
      "width": 640
    },
    {
      "url": "https://i.scdn.co/image/ab67616d00001e02eeda6d464919b82e4db659b5",
      "height": 300,
      "width": 300
    },
    {
      "url": "https://i.scdn.co/image/ab67616d00004851eeda6d464919b82e4db659b5",
      "height": 64,
      "width": 64
    }
  ],
  "name": "Start Today",
  "release_date": "2025-08-27",
  "release_date_precision": "day",
  "type": "album",
  "uri": "spotify:album:7yj4Fc4cus1NY80wfIcSf0",
  "artists": [
    {
      "external_urls": {
        "spotify": "https://open.spotify.com/artist/4UXqAaa6dQYAk18Lv7PEgX"
      },
      "href": "https://api.spotify.com/v1/artists/4UXqAaa6dQYAk18Lv7PEgX",
      "id": "4UXqAaa6dQYAk18Lv7PEgX",
      "name": "Fall Out Boy",
      "type": "artist",
      "uri": "spotify:artist:4UXqAaa6dQYAk18Lv7PEgX"
    }
  ],
  "artist": {
    "name": "Fall Out Boy",
    "spotify_id": "4UXqAaa6dQYAk18Lv7PEgX",
    "watchlist": false
  },
  "relatedArtist": {
    "name": "",
    "spotify_id": ""
  }
}

// taken from spotify response, with added album field
const startTodayNotInclude = {
  "artists": [
    {
      "external_urls": {
        "spotify": "https://open.spotify.com/artist/4UXqAaa6dQYAk18Lv7PEgX"
      },
      "href": "https://api.spotify.com/v1/artists/4UXqAaa6dQYAk18Lv7PEgX",
      "id": "4UXqAaa6dQYAk18Lv7PEgX",
      "name": "Fall Out Boy",
      "type": "artist",
      "uri": "spotify:artist:4UXqAaa6dQYAk18Lv7PEgX"
    }
  ],
  "disc_number": 1,
  "duration_ms": 122706,
  "explicit": false,
  "external_urls": {
    "spotify": "https://open.spotify.com/track/3DZSUGnqwJwQIoUbHPcSqu"
  },
  "href": "https://api.spotify.com/v1/tracks/3DZSUGnqwJwQIoUbHPcSqu",
  "id": "3DZSUGnqwJwQIoUbHPcSqu",
  "name": "Start Today",
  "track_number": 1,
  "type": "track",
  "uri": "spotify:track:3DZSUGnqwJwQIoUbHPcSqu",
  "is_local": false,
  album: startToday
}

// taken from spotify response, with added artist and relatedArtist fields
const sameOldWastedWonderfulWorld = {
  "album_type": "album",
  "total_tracks": 11,
  "external_urls": {
    "spotify": "https://open.spotify.com/album/7gf7mD5ZIc3aValzADwgnz"
  },
  "href": "https://api.spotify.com/v1/albums/7gf7mD5ZIc3aValzADwgnz",
  "id": "7gf7mD5ZIc3aValzADwgnz",
  "images": [
    {
      "url": "https://i.scdn.co/image/ab67616d0000b273a65615ea68df46deb358b82d",
      "height": 640,
      "width": 640
    },
    {
      "url": "https://i.scdn.co/image/ab67616d00001e02a65615ea68df46deb358b82d",
      "height": 300,
      "width": 300
    },
    {
      "url": "https://i.scdn.co/image/ab67616d00004851a65615ea68df46deb358b82d",
      "height": 64,
      "width": 64
    }
  ],
  "name": "The Same Old Wasted Wonderful World",
  "release_date": "2025-09-19",
  "release_date_precision": "day",
  "type": "album",
  "uri": "spotify:album:7gf7mD5ZIc3aValzADwgnz",
  "artists": [
    {
      "external_urls": {
        "spotify": "https://open.spotify.com/artist/19zqV9DV3txjMUjHvltl2D"
      },
      "href": "https://api.spotify.com/v1/artists/19zqV9DV3txjMUjHvltl2D",
      "id": "19zqV9DV3txjMUjHvltl2D",
      "name": "Motion City Soundtrack",
      "type": "artist",
      "uri": "spotify:artist:19zqV9DV3txjMUjHvltl2D"
    }
  ],
  "artist": {
    "name": "Fall Out Boy",
    "spotify_id": "4UXqAaa6dQYAk18Lv7PEgX",
    "watchlist": false
  },
  "relatedArtist": {
    "name": "Patrick Stump",
    "spotify_id": "0wsdUS0EJ7zHgti2nxTVWR"
  }
}

// taken from spotify response, with added album field
const particlePhysics = {
  "artists": [
    {
      "external_urls": {
        "spotify": "https://open.spotify.com/artist/19zqV9DV3txjMUjHvltl2D"
      },
      "href": "https://api.spotify.com/v1/artists/19zqV9DV3txjMUjHvltl2D",
      "id": "19zqV9DV3txjMUjHvltl2D",
      "name": "Motion City Soundtrack",
      "type": "artist",
      "uri": "spotify:artist:19zqV9DV3txjMUjHvltl2D"
    },
    {
      "external_urls": {
        "spotify": "https://open.spotify.com/artist/0wsdUS0EJ7zHgti2nxTVWR"
      },
      "href": "https://api.spotify.com/v1/artists/0wsdUS0EJ7zHgti2nxTVWR",
      "id": "0wsdUS0EJ7zHgti2nxTVWR",
      "name": "Patrick Stump",
      "type": "artist",
      "uri": "spotify:artist:0wsdUS0EJ7zHgti2nxTVWR"
    }
  ],
  "disc_number": 1,
  "duration_ms": 205800,
  "explicit": true,
  "external_urls": {
    "spotify": "https://open.spotify.com/track/5g8WLjKlv9oQsZJoHmaqID"
  },
  "href": "https://api.spotify.com/v1/tracks/5g8WLjKlv9oQsZJoHmaqID",
  "id": "5g8WLjKlv9oQsZJoHmaqID",
  "name": "Particle Physics",
  "track_number": 3,
  "type": "track",
  "uri": "spotify:track:5g8WLjKlv9oQsZJoHmaqID",
  "is_local": false,
  "album": sameOldWastedWonderfulWorld
}

// taken from spotify response, with added artist and relatedArtist fields
const sameOldWastedWonderfulWorldDeluxe = {
  "album_type": "album",
  "total_tracks": 14,
  "external_urls": {
    "spotify": "https://open.spotify.com/album/4zDHxNLJGu9CUp4RPrFqy8"
  },
  "href": "https://api.spotify.com/v1/albums/4zDHxNLJGu9CUp4RPrFqy8",
  "id": "4zDHxNLJGu9CUp4RPrFqy8",
  "images": [
    {
      "url": "https://i.scdn.co/image/ab67616d0000b27342a42f0014c1438a5b5b6c39",
      "height": 640,
      "width": 640
    },
    {
      "url": "https://i.scdn.co/image/ab67616d00001e0242a42f0014c1438a5b5b6c39",
      "height": 300,
      "width": 300
    },
    {
      "url": "https://i.scdn.co/image/ab67616d0000485142a42f0014c1438a5b5b6c39",
      "height": 64,
      "width": 64
    }
  ],
  "name": "The Same Old Wasted Wonderful World (Deluxe)",
  "release_date": "2026-10-23",
  "release_date_precision": "day",
  "type": "album",
  "uri": "spotify:album:4zDHxNLJGu9CUp4RPrFqy8",
  "artists": [
    {
      "external_urls": {
        "spotify": "https://open.spotify.com/artist/19zqV9DV3txjMUjHvltl2D"
      },
      "href": "https://api.spotify.com/v1/artists/19zqV9DV3txjMUjHvltl2D",
      "id": "19zqV9DV3txjMUjHvltl2D",
      "name": "Motion City Soundtrack",
      "type": "artist",
      "uri": "spotify:artist:19zqV9DV3txjMUjHvltl2D"
    }
  ],
  "artist": {
    "name": "Fall Out Boy",
    "spotify_id": "4UXqAaa6dQYAk18Lv7PEgX",
    "watchlist": false
  },
  "relatedArtist": {
    "name": "Patrick Stump",
    "spotify_id": "0wsdUS0EJ7zHgti2nxTVWR"
  }
}

// taken from spotify response, with added album field
const particlePhysicsNew =     {
  "artists": [
    {
      "external_urls": {
        "spotify": "https://open.spotify.com/artist/19zqV9DV3txjMUjHvltl2D"
      },
      "href": "https://api.spotify.com/v1/artists/19zqV9DV3txjMUjHvltl2D",
      "id": "19zqV9DV3txjMUjHvltl2D",
      "name": "Motion City Soundtrack",
      "type": "artist",
      "uri": "spotify:artist:19zqV9DV3txjMUjHvltl2D"
    },
    {
      "external_urls": {
        "spotify": "https://open.spotify.com/artist/0wsdUS0EJ7zHgti2nxTVWR"
      },
      "href": "https://api.spotify.com/v1/artists/0wsdUS0EJ7zHgti2nxTVWR",
      "id": "0wsdUS0EJ7zHgti2nxTVWR",
      "name": "Patrick Stump",
      "type": "artist",
      "uri": "spotify:artist:0wsdUS0EJ7zHgti2nxTVWR"
    }
  ],
  "disc_number": 1,
  "duration_ms": 205800,
  "explicit": true,
  "external_urls": {
    "spotify": "https://open.spotify.com/track/3e7wlO1EvVC5TgGRLZvYHb"
  },
  "href": "https://api.spotify.com/v1/tracks/3e7wlO1EvVC5TgGRLZvYHb",
  "id": "3e7wlO1EvVC5TgGRLZvYHb",
  "name": "Particle Physics",
  "track_number": 3,
  "type": "track",
  "uri": "spotify:track:3e7wlO1EvVC5TgGRLZvYHb",
  "is_local": false,
  "album": sameOldWastedWonderfulWorldDeluxe
}

// taken from db
const paramore = {
  name: 'Paramore',
  spotify_id: '74XFHRwlV6OrjEM0A2NCMF',
  related_artists: [
    {
      name: 'Hayley Williams',
      spotify_id: '6Rx1JKzBrSzoKQtmbVmBnM'
    }
  ],
  watchlist: false
}

// taken from db
const mirtazapineDB = {
  name: 'Mirtazapine',
  spotify_id: '2FFXU4b8sIsiLiTo6EWO19',
  url: 'https://open.spotify.com/track/2FFXU4b8sIsiLiTo6EWO19',
  uri: 'spotify:track:2FFXU4b8sIsiLiTo6EWO19',
  album: {
    name: 'Ego Death At A Bachelorette Party',
    spotify_id: '3MROTtttK946gHaTkXeP8b',
    release_date: '2025-11-07',
    artist: {
      name: 'Paramore',
      spotify_id: '74XFHRwlV6OrjEM0A2NCMF',
      watchlist: false,
      related_artist: {
        name: "Hayley Williams",
        spotify_id: "6Rx1JKzBrSzoKQtmbVmBnM"
      }
    },
  },
  track_number: 5,
  playlist_position: 399,
  to_include: true,
  watchlist: false,
}

// taken from spotify response, with added artist and relatedArtist fields
const egoDeathAtABacheloretteParty = {
  "album_type": "album",
  "total_tracks": 20,
  "external_urls": {
    "spotify": "https://open.spotify.com/album/3MROTtttK946gHaTkXeP8b"
  },
  "href": "https://api.spotify.com/v1/albums/3MROTtttK946gHaTkXeP8b",
  "id": "3MROTtttK946gHaTkXeP8b",
  "images": [
    {
      "url": "https://i.scdn.co/image/ab67616d0000b2734f422ed700af8715b23326af",
      "height": 640,
      "width": 640
    },
    {
      "url": "https://i.scdn.co/image/ab67616d00001e024f422ed700af8715b23326af",
      "height": 300,
      "width": 300
    },
    {
      "url": "https://i.scdn.co/image/ab67616d000048514f422ed700af8715b23326af",
      "height": 64,
      "width": 64
    }
  ],
  "name": "Ego Death At A Bachelorette Party",
  "release_date": "2025-11-07",
  "release_date_precision": "day",
  "type": "album",
  "uri": "spotify:album:3MROTtttK946gHaTkXeP8b",
  "artists": [
    {
      "external_urls": {
        "spotify": "https://open.spotify.com/artist/6Rx1JKzBrSzoKQtmbVmBnM"
      },
      "href": "https://api.spotify.com/v1/artists/6Rx1JKzBrSzoKQtmbVmBnM",
      "id": "6Rx1JKzBrSzoKQtmbVmBnM",
      "name": "Hayley Williams",
      "type": "artist",
      "uri": "spotify:artist:6Rx1JKzBrSzoKQtmbVmBnM"
    }
  ],
  "artist": {
    "name": "Paramore",
    "spotify_id": "74XFHRwlV6OrjEM0A2NCMF",
    "watchlist": false
  },
  "relatedArtist": {
    "name": "Hayley Williams",
    "spotify_id": "6Rx1JKzBrSzoKQtmbVmBnM"
  }
}

// taken from spotify response, with added album field
const mirtazapine = {
  "artists": [
    {
      "external_urls": {
        "spotify": "https://open.spotify.com/artist/6Rx1JKzBrSzoKQtmbVmBnM"
      },
      "href": "https://api.spotify.com/v1/artists/6Rx1JKzBrSzoKQtmbVmBnM",
      "id": "6Rx1JKzBrSzoKQtmbVmBnM",
      "name": "Hayley Williams",
      "type": "artist",
      "uri": "spotify:artist:6Rx1JKzBrSzoKQtmbVmBnM"
    }
  ],
  "disc_number": 1,
  "duration_ms": 201372,
  "explicit": false,
  "external_urls": {
    "spotify": "https://open.spotify.com/track/2FFXU4b8sIsiLiTo6EWO19"
  },
  "href": "https://api.spotify.com/v1/tracks/2FFXU4b8sIsiLiTo6EWO19",
  "id": "2FFXU4b8sIsiLiTo6EWO19",
  "name": "Mirtazapine",
  "track_number": 5,
  "type": "track",
  "uri": "spotify:track:2FFXU4b8sIsiLiTo6EWO19",
  "is_local": false,
  "album": egoDeathAtABacheloretteParty
}

module.exports = { armsLength, theWeightDB, theresAWholeWorldOutThere, theWeight, fallOutBoy, startTodayToIncludeDB, startTodayNotIncludeDB, particlePhysicsDB, fromUnderTheCorkTree, startTodayToInclude, startToday, startTodayNotInclude, sameOldWastedWonderfulWorld, particlePhysics, sameOldWastedWonderfulWorldDeluxe, particlePhysicsNew, paramore, mirtazapineDB, egoDeathAtABacheloretteParty, mirtazapine }